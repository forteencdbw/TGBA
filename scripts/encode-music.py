#!/usr/bin/env python3
"""Encode a music WAV into the MP3 the game ships.

The source WAVs (tens of megabytes each) are NOT in the repository; this is the record of how the shipped files were made,
so any of them can be redone from its original.

    pip install --user lameenc numpy
    python scripts/encode-music.py "C:/Users/<you>/Downloads/战斗2.wav" black-smokers
    python scripts/encode-music.py "C:/Users/<you>/Downloads/Abyssal Menu.wav" abyssal-menu --kbps 96

The NAME is which slot it becomes, and it decides where the file lands:

    abyssal-menu          -> src/assets/audio/abyssal-menu.mp3   the main menu (see `src/recordedMusic.ts`)
    <a level's id>        -> src/assets/audio/music/<id>.mp3     that level, replacing its synthesised recipe
    boss / summary        -> src/assets/audio/music/<name>.mp3   the boss fight, the results screen

Four things are deliberately NOT done, and each one is a place a "boring" import step would quietly change the sound:

  * no resampling -- the source's own sample rate is kept. A resample to 44.1 kHz would be a second lossy pass for nothing.
  * no trimming    -- leading and trailing silence is left alone. The loop is handled by fading, not by cutting the file
                      (see `StreamedTrack`), so a hard start or a long tail is fine and cutting it would only risk taking
                      a note with it.
  * no loudness normalisation -- the mix is the owner's. Each slot has its own level in `audio.music.recorded` instead,
                      so a loud master is turned down there rather than squashed here.
  * no loop-point editing -- an MP3 cannot hold a sample-accurate seam anyway.

The default bitrate is 128 kbps. It was 96 for the menu's ambient piece, which survives it; a dense mix does not -- percussion
and cymbals are where a low bitrate is heard first -- so a combat track gets more. `--kbps` is there for the ear that
disagrees with that.
"""
import argparse
import wave
from pathlib import Path

import lameenc
import numpy as np

ASSETS = Path(__file__).resolve().parent.parent / 'src' / 'assets'


def output_path(name: str) -> Path:
    """Where a slot's file lives: the menu's is loose, a level's and a boss's are under `music/`."""
    if name == 'abyssal-menu':
        return ASSETS / 'abyssal-menu.mp3'
    return ASSETS / 'audio' / 'music' / f'{name}.mp3'


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('wav', help='the source WAV')
    parser.add_argument('name', help='the slot: abyssal-menu, a level id, boss, or summary')
    parser.add_argument('--kbps', type=int, default=128, help='MP3 bitrate (default 128)')
    args = parser.parse_args()

    out = output_path(args.name)
    with wave.open(args.wav, 'rb') as w:
        channels, width, rate, frames = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        if width != 2:
            raise SystemExit(f'expected 16-bit PCM, got {width * 8}-bit')
        pcm = w.readframes(frames)
    peak = np.abs(np.frombuffer(pcm, dtype='<i2')).max() / 32768
    print(f'source: {rate} Hz, {channels} ch, {frames / rate:.1f} s, peak {20 * np.log10(peak):.2f} dBFS')

    enc = lameenc.Encoder()
    enc.set_bit_rate(args.kbps)
    enc.set_in_sample_rate(rate)
    enc.set_channels(channels)
    enc.set_quality(2)
    mp3 = enc.encode(pcm) + enc.flush()

    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(mp3)
    print(f'wrote {out} ({len(mp3) / 1e6:.2f} MB at {args.kbps} kbps)')


if __name__ == '__main__':
    main()
