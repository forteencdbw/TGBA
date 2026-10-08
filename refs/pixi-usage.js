/**
 * PixiJS usage for an asset built by `asset_pipeline.py`.
 *
 * Nothing here is asset-specific: the names come from the generated
 * `animation.json`, so the same code loads any asset the pipeline produces.
 *
 * Files the pipeline writes into the asset directory:
 *
 *   <name>.json           TexturePacker Hash atlas (trimmed frame rects)
 *   <name>-atlas.webp     the packed texture (lossless WebP: -47% vs PNG)
 *   <name>-atlas.png      only when `--texture png` or `--keep-all-encodings`
 *   animation.json        animation name, frame list, ms per frame, loop flag,
 *                         textureBytes / decodedBytes for budget checks
 *
 * PixiJS v8. On v7, `PIXI.Assets.load` becomes `PIXI.Loader.shared` and the atlas
 * parses identically. WebP is supported by every browser that runs WebGL2.
 */

import { Application, Assets, AnimatedSprite } from 'pixi.js'

/**
 * Load one asset directory: returns the spritesheet, the manifest, and a ready
 * AnimatedSprite. Point `baseUrl` at wherever you copied the pipeline output.
 */
export async function loadAsset(baseUrl) {
  // The manifest names the atlas file, so the loader never has to guess between
  // the WebP and PNG encodings the pipeline may have left behind.
  const manifest = await fetch(`${baseUrl}/animation.json`).then((response) => response.json())
  const sheet = await Assets.load(`${baseUrl}/${manifest.atlas}`)

  const sprite = new AnimatedSprite(manifest.frames.map((name) => sheet.textures[name]))
  sprite.animationSpeed = manifest.fps / 60 // Pixi advances this much per 60fps tick
  sprite.loop = manifest.loop
  sprite.anchor.set(manifest.anchor.x, manifest.anchor.y)
  sprite.play()

  return { sheet, manifest, sprite }
}

// --- a minimal usage -------------------------------------------------------

const application = new Application()
await application.init({ background: '#1b1b22', resizeTo: window, antialias: false })
document.body.appendChild(application.canvas)

const { sheet, manifest, sprite } = await loadAsset('assets/slime')
sprite.scale.set(3)
sprite.position.set(application.renderer.width / 2, application.renderer.height / 2)
application.stage.addChild(sprite)

// Budget check the manifest makes possible without loading anything else: the
// first-screen cost and what the GPU will hold, in bytes.
console.log(
  `${manifest.name}: ${manifest.frameCount} frames, ` +
    `${(manifest.textureBytes / 1024).toFixed(1)} KB download, ` +
    `${(manifest.decodedBytes / 1024).toFixed(0)} KB decoded`
)

// Frames are trimmed, so Pixi reconstructs the full source frame from
// `spriteSourceSize` + `sourceSize`. That is what keeps frames registered with
// each other: the anchor the pipeline pinned stays pinned in the engine.
const [firstName, firstFrame] = Object.entries(sheet.data.frames)[0]
console.log(
  `${firstName}: texture rect ${firstFrame.frame.w}x${firstFrame.frame.h} ` +
    `in a ${firstFrame.sourceSize.w}x${firstFrame.sourceSize.h} frame`
)
