#!/usr/bin/env python3
"""Encode the main-menu music WAV into the MP3 the game ships.

The source WAV (a 36 MB, 48 kHz / 16-bit / stereo, ~190 s file) is NOT in the repository; this script is the record of how
the shipped file was made, so it can be redone from the original.

    pip install --user lameenc numpy
    python scripts/encode-menu-music.py "C:/Users/<you>/Downloads/Abyssal Menu.wav"

Fixed on purpose: 96 kbps CBR, joint stereo, the source's own sample rate (no resampling pass), no trimming and no
loudness change. The loop's fade lives in the game (`audio.music.menu`), not in the file.
"""
import sys
import wave
from pathlib import Path

import lameenc
import numpy as np

BIT_RATE_KBPS = 96
OUT = Path(__file__).resolve().parent.parent / 'src' / 'assets' / 'audio' / 'abyssal-menu.mp3'


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    with wave.open(sys.argv[1], 'rb') as w:
        channels, width, rate, frames = w.getnchannels(), w.getsampwidth(), w.getframerate(), w.getnframes()
        if width != 2:
            sys.exit(f'expected 16-bit PCM, got {width * 8}-bit')
        pcm = w.readframes(frames)
    peak = np.abs(np.frombuffer(pcm, dtype='<i2')).max() / 32768
    print(f'source: {rate} Hz, {channels} ch, {frames / rate:.1f} s, peak {20 * np.log10(peak):.2f} dBFS')

    enc = lameenc.Encoder()
    enc.set_bit_rate(BIT_RATE_KBPS)
    enc.set_in_sample_rate(rate)
    enc.set_channels(channels)
    enc.set_quality(2)
    mp3 = enc.encode(pcm) + enc.flush()

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(mp3)
    print(f'wrote {OUT} ({len(mp3) / 1e6:.2f} MB)')


if __name__ == '__main__':
    main()
