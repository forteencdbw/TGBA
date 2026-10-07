/**
 * The loading page: a full screen that says what is being fetched and how fast it is arriving.
 *
 * ---------------------------------------------------------------------------------------------
 * WHY A PAGE RATHER THAN A BAR OVER THE WATER
 * ---------------------------------------------------------------------------------------------
 * It began as a scrim and a progress bar, drawn at the BOTTOM of the display list -- under the water, under the HUD,
 * under the touch controls -- so what the player saw was the level with a bar somewhere behind it, and what they could
 * still do was steer the bubble they were not playing yet. Two things follow from that, and this module is the first:
 * a screen that is going to take seconds is a SCREEN, opaque, with a name on it, so there is no question about whether
 * the level has started.
 *
 * The second is the app's business, not this module's: the pointer stream is refused while the load runs (`Game`),
 * because a page that looks like a page and still steers is worse than one that looks like a bar.
 *
 * ---------------------------------------------------------------------------------------------
 * THE NUMBERS ARE THE HONEST ONES
 * ---------------------------------------------------------------------------------------------
 * "Downloading" is a claim, and a claim with one moving bar behind it is not checkable: 6 MB and 60 MB look identical
 * on the way past. So the page reports the three things a download reports -- how much has arrived, how much is
 * coming, and the rate -- in MB. The bytes come from `preloadAssets` (and from the server's own `Content-Length`),
 * and the RATE is measured over a window rather than over the whole load: an average since the beginning would sit at
 * 0.4 MB/s for a minute after a slow start had already recovered.
 */
import { Container, Graphics, Text } from 'pixi.js';
import type { PreloadProgress } from './assets';
import { mech } from './mechanisms';
import { designScale } from './viewport';

function mkText(text: string, colour: number, size: number): Text {
  return new Text({
    text,
    style: {
      fill: colour,
      fontSize: size,
      fontFamily: mech.text.fontFamily,
      align: 'center',
    },
  });
}

/** Bytes as the MB a file manager would say. 1024-based, which is what "MB" means to the person reading it. */
function megabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2);
}

export class LoadingScreen {
  readonly root = new Container();
  private readonly backdrop = new Graphics();
  private readonly bar = new Graphics();
  private readonly title: Text;
  private readonly percent: Text;
  private readonly stats: Text;

  private canvasWidth = 0;
  private canvasHeight = 0;
  private scale = 1;
  private progress = 0;
  private lines: string[] = [];
  /** The rate, over a window of the samples below. See `update`. */
  private speed = 0;
  /** `{seconds, bytesDone}` at each report, so a rate can be measured over the last few seconds. */
  private readonly samples: { seconds: number; bytes: number }[] = [];

  constructor() {
    this.root.eventMode = 'none';
    this.root.visible = false;
    for (const node of [this.backdrop, this.bar]) node.eventMode = 'none';
    this.title = mkText(mech.loading.label, mech.loading.titleColour, mech.loading.titleSize);
    this.title.anchor.set(0.5, 0);
    this.title.eventMode = 'none';
    this.percent = mkText('', mech.loading.textColour, mech.loading.textSize);
    this.percent.anchor.set(0.5, 0);
    this.percent.eventMode = 'none';
    this.stats = mkText('', mech.loading.textColour, mech.loading.textSize);
    this.stats.anchor.set(0.5, 0);
    this.stats.eventMode = 'none';
    this.root.addChild(this.backdrop, this.bar, this.title, this.percent, this.stats);
  }

  /**
   * Start a load: the bar at zero and no numbers yet.
   *
   * The numbers arrive with the first picture; until then the page shows its title and an empty bar rather than a
   * rate it has not measured, which would be a blank screen claiming 0.00 MB/s.
   */
  begin(): void {
    this.progress = 0;
    this.speed = 0;
    this.samples.length = 0;
    this.lines = [];
    this.title.text = mech.loading.label;
    this.redraw();
  }

  /** Lay the page out for a canvas. Called on resize and before the first `begin`, so the page is never unsized. */
  layout(canvasWidth: number, canvasHeight: number): void {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.scale = designScale(canvasWidth, canvasHeight);
    this.title.style.fontSize = mech.loading.titleSize;
    this.percent.style.fontSize = mech.loading.textSize;
    this.stats.style.fontSize = mech.loading.textSize;
    this.stats.style.lineHeight = mech.loading.lineHeight;
    this.redraw();
  }

  /** One report from the preload: the bar, the counts, and the rate. */
  update(progress: PreloadProgress): void {
    const cfg = mech.loading;
    /**
     * The rate, measured over the last `speedWindowSeconds` of reports.
     *
     * The window is short enough to react and long enough that one small file landing after a big one does not read as
     * the connection dying. Before a window exists -- and while it is still shorter than a quarter second, where two
     * samples can be a millisecond apart and divide into nonsense -- the rate is the average since the load began,
     * which is also the only rate a load that finishes in under a second will ever have. Reporting ZERO for a load that
     * arrived instantly would be the page calling a fast download nothing at all.
     */
    this.samples.push({ seconds: progress.seconds, bytes: progress.bytesDone });
    while (this.samples.length > 2 && progress.seconds - this.samples[0]!.seconds > cfg.speedWindowSeconds) {
      this.samples.shift();
    }
    const first = this.samples[0]!;
    const last = this.samples[this.samples.length - 1]!;
    const span = last.seconds - first.seconds;
    this.speed =
      span >= 0.25
        ? (last.bytes - first.bytes) / span
        : progress.seconds >= 0.05
          ? progress.bytesDone / progress.seconds
          : 0;

    /**
     * The bar is the BYTES when the server told us how big they are, which is the same thing the numbers say.
     *
     * The count of FILES is the stand-in for a server that would not describe them: a bar that cannot be drawn from
     * bytes is still better drawn from something real than left at zero for the whole load. A file here is usually an
     * atlas PAGE -- three of them carry all nineteen pictures -- so the fallback says "files" rather than "pictures",
     * because that is what the network is doing and a count that disagrees with the bytes beside it reads as a bug.
     */
    this.progress =
      progress.bytesTotal > 0
        ? Math.min(1, progress.bytesDone / progress.bytesTotal)
        : progress.total > 0
          ? progress.done / progress.total
          : 1;
    this.lines =
      progress.bytesTotal > 0
        ? [
            `已下载  ${megabytes(progress.bytesDone)} MB / ${megabytes(progress.bytesTotal)} MB`,
            `速度  ${megabytes(this.speed)} MB/s`,
          ]
        : [`文件  ${progress.done} / ${progress.total}`];
    this.redraw();
  }

  private redraw(): void {
    const s = this.scale;
    const cfg = mech.loading;
    const width = this.canvasWidth;
    const height = this.canvasHeight;
    if (width <= 0 || height <= 0) return;

    this.backdrop.clear();
    this.backdrop
      .rect(0, 0, width, height)
      .fill({ color: cfg.scrimColour, alpha: cfg.scrimAlpha });

    const barW = Math.min(width * 0.7, cfg.maxWidth * s);
    const barH = cfg.barHeight * s;
    const titleSize = cfg.titleSize * s;
    const textSize = cfg.textSize * s;
    /**
     * The block is CENTRED as a whole rather than the bar being centred alone.
     *
     * The bar used to sit at exactly `height / 2`, which put the title above it and the numbers below it off the
     * middle -- fine for one line of text under a bar, visibly lopsided for four. The heights are the configured font
     * sizes, which is what the text actually occupies to within its leading.
     */
    const statsH = this.lines.length * cfg.lineHeight * s;
    const blockH =
      titleSize + cfg.gapTitle * s + barH + cfg.gapBar * s + textSize + cfg.gapStats * s + statsH;
    const top = height / 2 - blockH / 2;
    const barX = (width - barW) / 2;
    const barY = top + titleSize + cfg.gapTitle * s;

    this.bar.clear();
    this.bar.roundRect(barX, barY, barW, barH, barH / 2).fill({ color: cfg.trackColour, alpha: 1 });
    if (this.progress > 0) {
      this.bar
        .roundRect(barX, barY, Math.max(barH, barW * this.progress), barH, barH / 2)
        .fill({ color: cfg.barColour, alpha: 1 });
    }

    this.title.scale.set(s);
    this.title.x = width / 2;
    this.title.y = top;

    this.percent.text = `${Math.round(this.progress * 100)}%`;
    this.percent.scale.set(s);
    this.percent.x = width / 2;
    this.percent.y = barY + barH + cfg.gapBar * s;

    this.stats.text = this.lines.join('\n');
    this.stats.scale.set(s);
    this.stats.x = width / 2;
    this.stats.y = this.percent.y + textSize + cfg.gapStats * s;
  }
}
