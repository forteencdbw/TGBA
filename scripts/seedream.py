"""Send the calls `asset_pipeline.py plan` produced, one Ark request per frame, downloading the results.

Usage:  python scripts/seedream.py --plan frames.plan.json [--model <id>] [--only <frame-id>] [--out-dir <dir>]
        python scripts/seedream.py --plan frames.plan.json --dry-run      # print the requests, send nothing

WHY THIS EXISTS. The pipeline was written where image generation was a host tool (`generate_image`, which is what
the `tool` field in the plan still says). Ark is not that -- it is an HTTP endpoint at
`https://ark.cn-beijing.volces.com/api/v3/images/generations` -- so `plan` was producing a call list that nothing
could run. This is the other half of that seam.

WHAT IT READS. The plan JSON that `plan --out <file>` writes: a `calls` list, each call carrying `prompt`,
`reference_images`, `background`, `output_format`, `size`, `model` and `output_path`. Only the first reference is
used: `background: "transparent"` is an image-to-image mode that Ark accepts with EXACTLY ONE input image, and a
second reference turns a working request into a 400.

THE KEY comes from `ARK_API_KEY`, or from `.env.local` at the repo root (which `.gitignore`'s `*.local` rule
covers). This repository is public: the key is never written to a tracked file, never sent anywhere but Ark, and
never printed -- not in the request echo, not in an error.

THE TWO THINGS IT DOES THAT ARE EASY TO GET WRONG:
  * `watermark: false` is sent explicitly. It is not the documented default, and a watermarked frame is a frame
    you have to regenerate.
  * The reference is sent as a `data:` URI, because `image` takes a URL or a data URI and a local path is
    neither. The mime is sniffed from the file's magic bytes rather than its extension -- `grant` writes paths
    that can have no extension at all, and the `data:image/<fmt>;base64,` tag has to be lowercase or Ark rejects
    it.
"""

import argparse
import base64
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

ROOT = Path(__file__).resolve().parent.parent
ENDPOINT = "https://ark.cn-beijing.volces.com/api/v3/images/generations"

# pro for quality, flash for speed and price. Both are the only models with a transparent-background mode, which
# is what every frame here needs; 4.5 and 4.0 are JPEG-only. Override per run, or per frame via the spec's
# `model` field, which is what the plan's `model` carries.
DEFAULT_MODEL = "doubao-seedream-5-0-pro-260628"

# One image generation is tens of seconds, and the pipeline generates a frame set back to back.
TIMEOUT_SECONDS = 300

MAGIC = (
    (b"\x89PNG\r\n\x1a\n", "png"),
    (b"\xff\xd8\xff", "jpeg"),
    (b"GIF87a", "gif"),
    (b"GIF89a", "gif"),
    (b"BM", "bmp"),
    (b"II*\x00", "tiff"),
    (b"MM\x00*", "tiff"),
)


def sniff_mime(path):
    """
    The media type for a local file, from its bytes.

    Not from the extension: a path the pipeline wrote may have none, and `data:image/<fmt>;base64,` is rejected
    when the tag does not match what is actually there.
    """
    with open(path, "rb") as handle:
        head = handle.read(16)
    for signature, name in MAGIC:
        if head.startswith(signature):
            return name
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return "webp"
    raise SystemExit(
        f"{path} is not an image this can identify (first bytes {head[:8]!r}).\n"
        "Ark takes JPEG, PNG, WebP, BMP, TIFF, GIF and HEIC/HEIF."
    )


def data_uri(path):
    mime = sniff_mime(path)
    with open(path, "rb") as handle:
        encoded = base64.b64encode(handle.read()).decode("ascii")
    return f"data:image/{mime};base64,{encoded}"


def resolve_key():
    key = os.environ.get("ARK_API_KEY")
    if key:
        return key.strip(), "the environment"
    env_file = ROOT / ".env.local"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            name, _, value = line.partition("=")
            if name.strip() == "ARK_API_KEY":
                return value.strip().strip('"').strip("'"), str(env_file)
    raise SystemExit(
        f"No ARK_API_KEY.\n"
        f"  Looked in the environment and in {env_file} (neither had it).\n"
        f"  Get or rotate one at https://ark.volcengine.com/region:cn-beijing/apikey,\n"
        f"  then put `ARK_API_KEY=...` in {env_file} -- .gitignore's `*.local` rule covers it,\n"
        f"  which matters because this repository is public."
    )


def post(payload, key):
    request = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {key}"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", "replace")
        # The key is in the request headers, not the body, so echoing the body is safe and is the whole value of
        # this handler: Ark's refusals name the parameter that was wrong.
        raise SystemExit(f"Ark refused the request: HTTP {error.code}\n{body}")


def download(url, destination):
    destination.parent.mkdir(parents=True, exist_ok=True)
    with urllib.request.urlopen(url, timeout=TIMEOUT_SECONDS) as response:
        payload = response.read()
    destination.write_bytes(payload)
    return len(payload)


def run_call(call, key, model_override, out_dir, dry_run):
    """One frame. Returns True on success, so the caller can report an honest exit code."""
    frame_id = call["id"]
    model = model_override or call.get("model") or DEFAULT_MODEL
    references = call.get("reference_images") or []
    if not references:
        raise SystemExit(f"{frame_id}: the call has no `reference_images`, and transparent mode needs exactly one")
    reference = references[0]

    payload = {
        "model": model,
        "prompt": call["prompt"],
        "size": call.get("size") or "1K",
        "output_format": call.get("output_format") or "png",
        "response_format": "url",
        "watermark": False,
    }
    if call.get("background"):
        payload["background"] = call["background"]

    destination = Path(call.get("output_path") or f"{frame_id}.png")
    if out_dir:
        destination = Path(out_dir) / destination.name

    if not dry_run:
        payload["image"] = data_uri(reference)
        shown = dict(payload, image=f"<data URI, {len(payload['image']) // 1024} KB from {reference}>")
    else:
        shown = dict(payload, image=f"<data URI from {reference}>")

    print(f"  {frame_id}: {model}, size {payload['size']}, -> {destination}")
    if dry_run:
        print(json.dumps(shown, ensure_ascii=False, indent=2))
        return True

    body = post(payload, key)

    images = body.get("data") or []
    if not images:
        print(f"    no image came back: {json.dumps(body, ensure_ascii=False)[:400]}")
        return False

    ok = True
    for index, item in enumerate(images):
        # A per-image failure inside an otherwise successful batch arrives here, not as an HTTP error.
        if item.get("error"):
            print(f"    FAILED: {json.dumps(item['error'], ensure_ascii=False)[:300]}")
            ok = False
            continue
        target = destination if index == 0 else destination.with_name(
            f"{destination.stem}-{index}{destination.suffix}"
        )
        # Every URL Ark returns is deleted after 24 hours, so the only copy that survives is this one.
        written = download(item["url"], target)
        size = item.get("size", "?")
        print(f"    {target}  {size}  {written / 1024:.0f} KB")

    usage = body.get("usage") or {}
    if usage:
        print(f"    usage: {usage.get('generated_images', '?')} generated, {usage.get('total_tokens', '?')} tokens")
    return ok


def main():
    parser = argparse.ArgumentParser(description="Run the generate calls a frame plan resolved to.")
    parser.add_argument("--plan", required=True, help="the JSON `asset_pipeline.py plan --out` wrote")
    parser.add_argument("--model", help=f"override the model for every frame (default: {DEFAULT_MODEL})")
    parser.add_argument("--only", help="run just this frame id")
    parser.add_argument("--out-dir", help="write every frame here instead of the plan's output_path")
    parser.add_argument("--dry-run", action="store_true", help="print the requests and send nothing")
    arguments = parser.parse_args()

    with open(arguments.plan, "r", encoding="utf-8") as handle:
        plan = json.load(handle)

    calls = plan.get("calls") or []
    if arguments.only:
        calls = [call for call in calls if call.get("id") == arguments.only]
        if not calls:
            raise SystemExit(f"no frame with id {arguments.only!r} in {arguments.plan}")

    key, source = resolve_key()
    print(f"{plan.get('name', 'asset')}: {len(calls)} frame(s), key from {source}")
    if arguments.dry_run:
        print("dry run -- nothing is sent, nothing is spent\n")

    failures = 0
    for call in calls:
        if not run_call(call, key, arguments.model, arguments.out_dir, arguments.dry_run):
            failures += 1

    # Say what happened rather than exiting 0 on a partial failure: a missing frame looks exactly like a frame
    # the pipeline has not reached yet.
    verb = "planned (dry run, nothing was sent)" if arguments.dry_run else "generated"
    print(f"\n{len(calls) - failures}/{len(calls)} frame(s) {verb}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
