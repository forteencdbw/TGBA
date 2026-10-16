#!/usr/bin/env python3
"""The recipes for every sound effect and every level track, in the chip palette.

**HISTORICAL RECORD -- DO NOT RE-RUN. It rewrites `audio.sfx.sounds` and `audio.music.tracks` IN PLACE and will throw away
every hand edit the owner has made since.** It is kept because "how were these numbers chosen" is a question that gets
asked, and the constraints below are the answer. The config is the source of truth; this is how it was first written.
(The same pattern as `encode-menu-music.py`.)

    python scripts/make-chip-sfx-recipes.py

WHY IT EXISTS AT ALL: 68 recipes whose layers have to agree -- a click must be shorter than the hit it lands with, a
rising cue must actually rise -- is not something to hand-write twice. Generating them once, from one description of the
palette, is how they stay consistent.

THE PALETTE (see `src/chip.ts`):

  P(hz, to, secs, gain, duty)   a PULSE wave. Duty 0.5 is hollow and loud, 0.25 is the classic "beep",
                                0.125 is thin and bright.
  T(hz, to, secs, gain)         a TRIANGLE. Its one job is the bass: a low triangle is the chip's only warm voice.
  N(mode, rate, to, secs, gain) the NOISE register. `hiss` is the long register (broadband), `buzz` the short one
                                (period 93, so it has a pitch). `rate` is the register's CLOCK: ~200 Hz is a low tom,
                                ~600 Hz a mid drum, ~2 kHz a snare, ~8 kHz a hat. `to` is the clock at the end, so a
                                falling drum is a falling rate.

SHAPES: `linear` (instantly on, straight down -- the chip default), `cut` (on, held, gone: percussion), `exponential`
(the smooth tail a synth makes; only a couple of cues use it).
"""

import re
import sys
from pathlib import Path


# -------------------------------------------------------------------------------------------------
# Layer helpers
# -------------------------------------------------------------------------------------------------

def P(hz, to=1.0, secs=0.08, gain=0.2, duty=0.25, delay=None, shape=None, attack=None):
    d = {'type': 'tone', 'wave': 'pulse', 'duty': duty, 'hz': hz}
    if to != 1.0:
        d['endRatio'] = to
    d.update(seconds=secs, gain=gain)
    if delay:
        d['delay'] = delay
    if shape:
        d['shape'] = shape
    if attack:
        d['attack'] = attack
    return d


def T(hz, to=1.0, secs=0.12, gain=0.2, delay=None, shape=None, attack=None):
    d = {'type': 'tone', 'wave': 'triangle', 'hz': hz}
    if to != 1.0:
        d['endRatio'] = to
    d.update(seconds=secs, gain=gain)
    if delay:
        d['delay'] = delay
    if shape:
        d['shape'] = shape
    if attack:
        d['attack'] = attack
    return d


def N(mode, rate, to=1.0, secs=0.06, gain=0.15, delay=None, shape=None):
    d = {'type': 'noise', 'mode': mode, 'rate': rate}
    if to != 1.0:
        d['endRatio'] = to
    d.update(seconds=secs, gain=gain)
    if delay:
        d['delay'] = delay
    if shape:
        d['shape'] = shape
    return d


def cue(label, bus, layers, **kw):
    row = {'label': label, 'bus': bus}
    for key in ('gap', 'gain', 'fileGain', 'pitchJitter', 'pitchPerIntensity', 'gainPerIntensity'):
        if kw.get(key) is not None:
            row[key] = kw[key]
    row['layers'] = layers
    return row


CLICK = N('hiss', 6000, secs=0.015, gain=0.05, shape='cut')          # a bare tick of the register
THUD = P(110, 0.55, 0.10, 0.22, 0.5, shape='cut')                    # a low pulse slammed shut

# -------------------------------------------------------------------------------------------------
# The sound effects
# -------------------------------------------------------------------------------------------------
# Notes on the ones that are not obvious:
#   * the GUN is the only cue that fires several times a second, so it is the shortest and the quietest, and its pitch
#     wanders per shot (`pitchJitter`) -- a fixed pitch at that rate stops being a sound and becomes a metronome.
#   * the six ENEMY families share a shape and differ in PITCH and DUTY: a small fish is a high thin blip, a predator is a
#     low hollow one, a shell is a hard double tick, and the boss is the only one low enough to be felt.
#   * `absorb` rises with the bubble's size (`pitchPerIntensity`), which is what the old sine version did too.

SFX = {}

def add(id, row):
    assert id not in SFX, id
    SFX[id] = row

# ---- 界面与流程
add('ui.click', cue('按钮按下', 'ui', [P(880, 1.0, 0.035, 0.16, 0.25), CLICK], gap=0.03))
add('ui.back', cue('返回 / 关闭', 'ui', [P(660, 0.6, 0.06, 0.15, 0.25), CLICK], gap=0.03))
add('ui.toggle', cue('开关切换', 'ui', [P(700, 1.0, 0.04, 0.14, 0.25), P(1050, 1.0, 0.05, 0.13, 0.125, delay=0.045)], gap=0.05))
add('ui.slider', cue('滑条刻度', 'ui', [P(1200, 1.0, 0.02, 0.08, 0.125, shape='cut')], gap=0.05, pitchJitter=0.05))
add('menu.start', cue('点「开始游戏」：气泡出发', 'ui', [
    P(330, 1.0, 0.09, 0.20, 0.5),
    P(440, 1.0, 0.09, 0.18, 0.25, delay=0.08),
    P(660, 1.0, 0.16, 0.16, 0.25, delay=0.16),
    N('hiss', 1200, 3.0, 0.20, 0.08),
], gap=0.3))
add('ui.pause', cue('打开设置 / 暂停', 'ui', [P(520, 0.55, 0.10, 0.16, 0.25), P(350, 0.8, 0.12, 0.14, 0.5, delay=0.06)], gap=0.2))
add('ui.resume', cue('关闭设置 / 继续', 'ui', [P(350, 1.45, 0.10, 0.16, 0.5), P(520, 1.0, 0.12, 0.14, 0.25, delay=0.06)], gap=0.2))
add('levelup.open', cue('突变三选一弹出', 'ui', [
    P(523, 1.0, 0.07, 0.16, 0.25),
    P(659, 1.0, 0.07, 0.16, 0.25, delay=0.07),
    P(784, 1.0, 0.14, 0.16, 0.125, delay=0.14),
], gap=0.3))
add('levelup.pick', cue('选定一张突变卡', 'ui', [P(660, 1.0, 0.05, 0.18, 0.25), P(990, 1.0, 0.10, 0.15, 0.125, delay=0.055)], gap=0.2))
add('level.start', cue('关卡开始：气泡出生', 'ui', [P(150, 2.4, 0.14, 0.20, 0.5), N('hiss', 900, 2.4, 0.22, 0.09)], gap=0.3))
add('level.banner', cue('关卡事件横幅', 'ui', [P(1046, 1.0, 0.05, 0.11, 0.125), P(1318, 1.0, 0.07, 0.10, 0.125, delay=0.05)], gap=0.2))
add('level.surface', cue('到达水面 / 过关', 'ui', [
    P(784, 1.0, 0.08, 0.16, 0.25),
    P(988, 1.0, 0.08, 0.16, 0.25, delay=0.075),
    P(1175, 1.0, 0.24, 0.18, 0.125, delay=0.15),
    N('hiss', 5000, 3.0, 0.22, 0.09),
], gap=0.2))
add('boss.warn', cue('Boss 预警', 'ui', [
    P(147, 1.0, 0.18, 0.22, 0.5),
    P(147, 1.0, 0.18, 0.22, 0.5, delay=0.28),
    T(73, 1.0, 0.30, 0.18, delay=0.28),
], gap=0.5))
add('boss.enter', cue('Boss 登场', 'ui', [
    P(110, 0.5, 0.34, 0.24, 0.5),
    N('hiss', 300, 0.6, 0.34, 0.22),
    T(55, 1.0, 0.40, 0.22, delay=0.05),
], gap=0.5))
add('summary.show', cue('结算页出现', 'ui', [
    P(523, 1.0, 0.10, 0.17, 0.25),
    P(659, 1.0, 0.10, 0.17, 0.25, delay=0.11),
    P(784, 1.0, 0.10, 0.17, 0.25, delay=0.22),
    P(1046, 1.0, 0.30, 0.18, 0.125, delay=0.33),
], gap=0.5))

# ---- 战斗反馈
add('gun.fire', cue('小泡泡子弹射出', 'combat', [P(900, 0.6, 0.03, 0.055, 0.125), CLICK],
                    gap=0.04, pitchJitter=0.05, gainPerIntensity=0.8,
                    fileGain=1))
add('gun.hit', cue('小泡泡子弹命中', 'combat', [P(1500, 0.8, 0.025, 0.07, 0.125), N('hiss', 7000, 0.7, 0.02, 0.05)],
                   gap=0.05, gainPerIntensity=0.8))
# The six families: same shape, a different pitch and duty each.
add('enemy.hit.small', cue('小型鱼类被打中', 'combat', [P(1046, 0.75, 0.045, 0.14, 0.125), CLICK], gap=0.08, pitchJitter=0.06))
add('enemy.hit.predator', cue('大型捕食者被打中', 'combat', [P(196, 0.7, 0.09, 0.22, 0.5), N('hiss', 700, 0.6, 0.06, 0.10)], gap=0.1, pitchJitter=0.04))
add('enemy.hit.jelly', cue('水母 / 电类被打中', 'combat', [P(659, 1.35, 0.08, 0.16, 0.25), N('hiss', 2000, 1.0, 0.06, 0.07)], gap=0.1, pitchJitter=0.05))
add('enemy.hit.shell', cue('硬壳带刺被打中', 'combat', [P(1318, 0.6, 0.02, 0.13, 0.125, shape='cut'), P(988, 0.6, 0.03, 0.12, 0.125, delay=0.03, shape='cut')], gap=0.08, pitchJitter=0.05))
add('enemy.hit.ranged', cue('远程射手被打中', 'combat', [P(740, 0.8, 0.04, 0.14, 0.25), CLICK], gap=0.08, pitchJitter=0.05))
add('enemy.hit.boss', cue('Boss 被打中', 'combat', [P(98, 0.6, 0.16, 0.26, 0.5), N('hiss', 400, 0.5, 0.12, 0.16)], gap=0.1))
add('enemy.leave.small', cue('小型鱼类逃走', 'combat', [P(880, 2.2, 0.13, 0.19, 0.125), N('hiss', 3000, 2.0, 0.10, 0.06)], gap=0.08))
add('enemy.leave.predator', cue('大型捕食者逃走', 'combat', [P(147, 0.5, 0.26, 0.20, 0.5), N('hiss', 600, 0.5, 0.20, 0.10)], gap=0.1))
add('enemy.leave.jelly', cue('水母 / 电类逃走', 'combat', [P(494, 1.5, 0.26, 0.17, 0.25), N('hiss', 1600, 1.6, 0.22, 0.07)], gap=0.1))
add('enemy.leave.shell', cue('硬壳带刺逃走', 'combat', [P(392, 0.55, 0.10, 0.16, 0.125, shape='cut'), N('hiss', 5000, 0.8, 0.14, 0.12, shape='cut')], gap=0.1))
add('enemy.leave.ranged', cue('远程射手逃走', 'combat', [P(587, 2.0, 0.16, 0.17, 0.25), P(392, 1.6, 0.16, 0.13, 0.25, delay=0.07)], gap=0.1))
add('enemy.leave.boss', cue('Boss 被击败', 'combat', [
    N('hiss', 900, 0.15, 0.9, 0.34),
    P(196, 0.35, 0.7, 0.26, 0.5),
    T(98, 0.5, 0.9, 0.24, delay=0.1),
], gap=0.5))
add('hit.heavy', cue('重击', 'combat', [THUD, N('hiss', 2000, 0.6, 0.06, 0.16)], gap=0.12))
add('enemy.fire', cue('敌人开火', 'combat', [P(440, 0.6, 0.05, 0.09, 0.125), CLICK], gap=0.12, pitchJitter=0.06))
add('enemy.charge', cue('敌人冲锋', 'combat', [N('hiss', 900, 0.25, 0.22, 0.13), P(196, 0.6, 0.22, 0.10, 0.5)], gap=0.15))
add('enemy.discharge', cue('放电', 'combat', [P(1568, 0.25, 0.10, 0.13, 0.125), N('buzz', 3000, 0.9, 0.16, 0.12)], gap=0.2))
add('chain.zap', cue('连锁放电', 'combat', [N('buzz', 2400, 0.6, 0.28, 0.18), P(1976, 0.3, 0.20, 0.11, 0.125)], gap=0.3))
add('bomb.blast', cue('炸弹鱼爆炸', 'combat', [N('hiss', 300, 0.25, 0.40, 0.34), P(78, 0.4, 0.30, 0.28, 0.5)], gap=0.2))
add('puffer.counter', cue('河豚反击', 'combat', [P(220, 1.8, 0.12, 0.19, 0.5), N('hiss', 1400, 1.6, 0.09, 0.10)], gap=0.2))
add('boss.attack', cue('Boss 攻击', 'combat', [N('hiss', 2200, 0.4, 0.20, 0.20), P(165, 0.5, 0.22, 0.18, 0.5)], gap=0.3))
add('bullet.hurt', cue('弹幕命中玩家', 'combat', [P(262, 0.5, 0.08, 0.20, 0.5), N('hiss', 3000, 0.5, 0.05, 0.13)], gap=0.08))
add('graze', cue('擦边', 'combat', [P(1760, 1.0, 0.04, 0.10, 0.125, shape='cut'), N('hiss', 9000, 1.0, 0.03, 0.06, shape='cut')], gap=0.12))

# ---- 玩家动作与警告
add('player.hurt', cue('玩家受伤', 'player', [P(147, 0.5, 0.16, 0.28, 0.5), N('hiss', 700, 0.5, 0.07, 0.18)], gap=0.09))
add('player.pop', cue('气泡破裂（死亡）', 'player', [P(784, 0.25, 0.30, 0.30, 0.25), N('hiss', 2500, 0.2, 0.18, 0.26)], gap=0.2))
add('player.eat', cue('吞下一只敌人', 'player', [P(262, 2.0, 0.10, 0.24, 0.5), T(131, 1.6, 0.16, 0.18, delay=0.05)], gap=0.1))
add('player.absorb', cue('吸收小泡泡', 'player', [P(523, 1.8, 0.05, 0.15, 0.25)], gap=0.045, pitchPerIntensity=0.9, gainPerIntensity=0.6))
add('stage.grow', cue('成长阶段提升', 'player', [
    P(440, 1.0, 0.07, 0.19, 0.25),
    P(554, 1.0, 0.07, 0.19, 0.25, delay=0.07),
    P(659, 1.0, 0.16, 0.20, 0.125, delay=0.14),
], gap=0.3))
add('mutation.gain', cue('获得突变', 'player', [P(880, 1.0, 0.06, 0.14, 0.125), P(1318, 1.0, 0.14, 0.13, 0.125, delay=0.06)], gap=0.3))
add('skill.dash', cue('技能：冲刺', 'player', [P(330, 4.0, 0.14, 0.22, 0.25), N('hiss', 2000, 4.0, 0.12, 0.14)], gap=0.2))
add('skill.vortex', cue('技能：漩涡', 'player', [P(330, 1.9, 0.34, 0.18, 0.25), P(494, 1.9, 0.34, 0.12, 0.25, delay=0.06)], gap=0.3))
add('skill.stink', cue('技能：臭云', 'player', [N('buzz', 420, 0.6, 0.30, 0.22), T(98, 0.8, 0.30, 0.16)], gap=0.3))
add('skill.shell', cue('技能：硬壳', 'player', [P(196, 1.0, 0.10, 0.22, 0.5), N('hiss', 5000, 0.6, 0.05, 0.13, shape='cut')], gap=0.3))
add('skill.burst', cue('技能：爆散', 'player', [P(165, 3.0, 0.22, 0.26, 0.5), N('hiss', 1600, 3.0, 0.20, 0.22)], gap=0.3))
add('suction.on', cue('开始吸附', 'player', [P(262, 0.6, 0.16, 0.13, 0.5), N('hiss', 1200, 0.5, 0.16, 0.09)], gap=0.3))
add('rage.slam', cue('怒气冲撞 / 撞碎障碍', 'player', [P(82, 0.45, 0.20, 0.30, 0.5), N('hiss', 1100, 0.4, 0.12, 0.22)], gap=0.15))
add('rage.burst', cue('怒气释放（冲击波）', 'player', [N('hiss', 500, 0.2, 0.46, 0.30), P(123, 0.35, 0.40, 0.28, 0.5)], gap=0.3))
add('rage.overload', cue('怒气失控警告', 'player', [
    P(880, 1.0, 0.09, 0.17, 0.125),
    P(660, 1.0, 0.09, 0.17, 0.125, delay=0.16),
    P(880, 1.0, 0.09, 0.17, 0.125, delay=0.32),
], gap=0.5))
add('rage.punish', cue('怒气失控惩罚', 'player', [P(220, 0.35, 0.34, 0.26, 0.5), N('hiss', 800, 0.4, 0.26, 0.20)], gap=0.3))
add('health.low', cue('血量告急（心跳）', 'player', [T(65, 0.85, 0.10, 0.34), T(60, 0.85, 0.10, 0.24, delay=0.14)], gap=0.5))
add('player.slow', cue('被减速 / 被缠住', 'player', [P(330, 0.4, 0.28, 0.24, 0.25)], gap=0.3))
add('crab.launch', cue('螃蟹把你弹起来', 'player', [P(262, 2.6, 0.22, 0.26, 0.5)], gap=0.2))
add('talent.fart', cue('天赋：放屁', 'player', [N('buzz', 260, 0.7, 0.30, 0.26), P(98, 0.7, 0.28, 0.20, 0.5)], gap=0.3))
add('defeat.sting', cue('死亡 sting（占位）', 'player', [
    T(196, 1.0, 0.55, 0.20),
    T(165, 1.0, 0.55, 0.20, delay=0.5),
    T(131, 1.0, 0.55, 0.20, delay=1.0),
    T(98, 1.0, 1.40, 0.22, delay=1.5),
], gap=1))

# ---- 环境
add('vent.erupt', cue('喷口喷发', 'env', [N('hiss', 400, 2.5, 0.50, 0.24), T(66, 0.8, 0.50, 0.16)], gap=0.4))
add('obstacle.break.crate', cue('木箱被撞碎', 'env', [N('buzz', 900, 0.6, 0.13, 0.26), P(196, 0.5, 0.07, 0.14, 0.5)], gap=0.1))
add('obstacle.break.coral', cue('珊瑚被撞碎', 'env', [N('hiss', 4200, 0.5, 0.18, 0.24), P(523, 0.4, 0.08, 0.12, 0.125)], gap=0.1))
add('obstacle.break.net', cue('渔网被撕开', 'env', [N('hiss', 2600, 0.6, 0.22, 0.18)], gap=0.1))
add('obstacle.hit.wall', cue('撞上岩壁', 'env', [P(74, 0.6, 0.14, 0.26, 0.5), N('hiss', 400, 0.6, 0.09, 0.18)], gap=0.15))
add('rain.press', cue('雨压下来', 'env', [N('hiss', 6000, 0.6, 0.16, 0.14), P(220, 0.6, 0.14, 0.09, 0.25)], gap=0.2))
add('foam.pop', cue('泡沫破裂', 'env', [N('buzz', 3000, 0.5, 0.05, 0.14), CLICK], gap=0.08))
add('mineral.hit', cue('矿物颗粒撞上', 'env', [P(1568, 0.5, 0.03, 0.09, 0.125, shape='cut'), N('hiss', 8000, 0.6, 0.025, 0.07)], gap=0.08))

# -------------------------------------------------------------------------------------------------
# The level tracks: same key, tempo, chords and pattern as before, re-voiced into three chip channels
# -------------------------------------------------------------------------------------------------
# `leadDuty` is what tells the levels apart now that there is no low-pass and no detuning: a 0.5 pulse is hollow and
# oppressive, a 0.125 one is thin and driving. The drums are the other dial, and the FIRST level has none on purpose --
# its brief is "压抑、安静、几乎没有光", and a drum pattern would be the end of that.

DRUM_KICK = {'mode': 'buzz', 'rate': 200, 'endRatio': 0.55, 'seconds': 0.13}
DRUM_TOM = {'mode': 'buzz', 'rate': 420, 'endRatio': 0.7, 'seconds': 0.10}
DRUM_SNARE = {'mode': 'hiss', 'rate': 2400, 'seconds': 0.09}
DRUM_HAT = {'mode': 'hiss', 'rate': 9000, 'seconds': 0.04}

TRACKS = {
    'black-smokers': {
        'rootHz': 55, 'stepPerMinute': 44, 'stepsPerChord': 8,
        'chords': [[0, 3, 7], [-2, 2, 5], [-4, 0, 3], [-2, 2, 7]],
        'pattern': [0, 1, 2, 1],
        'leadDuty': 0.5, 'leadGain': 0.13, 'bassGain': 0.16, 'noteSeconds': 0.9,
    },
    'wreck-gorge': {
        'rootHz': 65.4, 'stepPerMinute': 56, 'stepsPerChord': 6,
        'chords': [[0, 4, 7], [-3, 0, 4], [2, 5, 9], [-1, 2, 7]],
        'pattern': [0, 2, 1, 2],
        'leadDuty': 0.5, 'leadGain': 0.12, 'bassGain': 0.14, 'noteSeconds': 0.7,
        'drums': dict(DRUM_TOM, pattern=[1, 0, 0, 0, 0, 0], gain=0.06),
    },
    'jelly-forest': {
        'rootHz': 87.3, 'stepPerMinute': 72, 'stepsPerChord': 8,
        'chords': [[0, 4, 9], [2, 7, 11], [-3, 4, 7], [0, 5, 9]],
        'pattern': [0, 1, 2, 1, 2, 0],
        'leadDuty': 0.25, 'leadGain': 0.14, 'bassGain': 0.12, 'noteSeconds': 0.55,
        'drums': dict(DRUM_HAT, pattern=[0, 0, 1, 0, 0, 0, 1, 0], gain=0.035),
    },
    'thermocline': {
        'rootHz': 73.4, 'stepPerMinute': 84, 'stepsPerChord': 6,
        'chords': [[0, 5, 9], [3, 7, 10], [-2, 3, 7], [1, 5, 8]],
        'pattern': [0, 2, 1, 0, 2, 1],
        'leadDuty': 0.25, 'leadGain': 0.13, 'bassGain': 0.12, 'noteSeconds': 0.42,
        'drums': dict(DRUM_SNARE, pattern=[1, 0, 1, 0, 1, 0], gain=0.05),
    },
    'storm-surge': {
        'rootHz': 61.7, 'stepPerMinute': 96, 'stepsPerChord': 4,
        'chords': [[0, 3, 7], [5, 8, 12], [-2, 3, 7], [0, 7, 10]],
        'pattern': [0, 1, 2, 1],
        'leadDuty': 0.125, 'leadGain': 0.11, 'bassGain': 0.12, 'noteSeconds': 0.34,
        'drums': dict(DRUM_KICK, pattern=[1, 0, 1, 1], gain=0.06),
    },
    'dawn-surface': {
        'rootHz': 98, 'stepPerMinute': 80, 'stepsPerChord': 8,
        'chords': [[0, 4, 7], [5, 9, 12], [7, 11, 14], [2, 7, 11]],
        'pattern': [0, 1, 2, 1, 2, 1],
        'leadDuty': 0.125, 'leadGain': 0.13, 'bassGain': 0.11, 'noteSeconds': 0.5,
        'drums': dict(DRUM_HAT, pattern=[1, 1, 0, 1, 1, 0, 1, 1], gain=0.04),
    },
}

# -------------------------------------------------------------------------------------------------
# Writing
# -------------------------------------------------------------------------------------------------

def num(x):
    return '%g' % x


def json_ish(value, indent):
    """A one-line-per-key writer: the config is read by hand, so a row stays on as few lines as it can."""
    if isinstance(value, list):
        items = [json_ish(v, indent) for v in value]
        if all(isinstance(v, dict) for v in value):
            return '[\n' + ',\n'.join(indent + '  ' + s for s in items) + '\n' + indent + ']'
        return '[' + ', '.join(items) + ']'
    if isinstance(value, dict):
        return '{ ' + ', '.join('"%s": %s' % (k, json_ish(v, indent)) for k, v in value.items()) + ' }'
    if isinstance(value, str):
        return '"%s"' % value
    return num(value)


def sfx_block():
    out = ['      "sounds": {']
    groups = [('ui', '界面与流程'), ('combat', '战斗反馈'), ('player', '玩家动作与警告'), ('env', '环境')]
    ids = list(SFX)
    for bus, title in groups:
        out.append('        // ---- %s' % title)
        for i in [k for k in ids if SFX[k]['bus'] == bus]:
            row = SFX[i]
            keys = [k for k in row if k != 'layers']
            head = ', '.join('"%s": %s' % (k, json_ish(row[k], ' ' * 10)) for k in keys)
            out.append('        "%s": { %s, "layers": [' % (i, head))
            for li, layer in enumerate(row['layers']):
                out.append('          %s%s' % (json_ish(layer, ' ' * 10), ',' if li < len(row['layers']) - 1 else ''))
            out.append('        ] }%s' % ('' if i == ids[-1] else ','))
    out.append('      }')
    return '\n'.join(out)


def tracks_block():
    out = ['      "tracks": {']
    keys = list(TRACKS)
    for i, name in enumerate(keys):
        t = TRACKS[name]
        body = ', '.join('"%s": %s' % (k, json_ish(t[k], ' ' * 8)) for k in t)
        out.append('        "%s": { %s }%s' % (name, body, '' if i == len(keys) - 1 else ','))
    out.append('      }')
    return '\n'.join(out)


def replace_block(text, start_marker, new_block):
    """Swap one `{ ... }` block for another, given the line that opens it."""
    start = text.index(start_marker) + len(start_marker)
    # Walk to the matching brace so nothing else in the file is touched.
    depth = 1
    i = start
    while depth > 0:
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
        i += 1
    return text[:start] + new_block[len(start_marker):] + text[i:]


def main():
    path = Path(__file__).resolve().parent.parent / 'config' / 'mechanics.json5'
    text = path.read_text(encoding='utf-8')
    before = len(text)
    text = replace_block(text, '      "sounds": {', sfx_block())
    text = replace_block(text, '      "tracks": {', tracks_block())
    path.write_text(text, encoding='utf-8', newline='')
    print('%d cues, %d tracks; %d -> %d bytes' % (len(SFX), len(TRACKS), before, len(text)))


if __name__ == '__main__':
    sys.exit(main())
