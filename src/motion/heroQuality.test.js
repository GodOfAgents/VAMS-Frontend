import { describe, expect, it } from 'vitest'
import {
  createFrameBudgetController,
  describeHeroQuality,
  getNextLowerHeroTier,
  getViewportHeroTier,
  isLowPowerDevice,
} from './heroQuality.js'

describe('hero quality selection', () => {
  it.each([
    [320, 'static'],
    [360, 'low'],
    [767, 'low'],
    [768, 'medium'],
    [1199, 'medium'],
    [1200, 'high'],
    [1599, 'high'],
    [1600, 'wide'],
  ])('selects %s as %s', (width, expected) => {
    expect(getViewportHeroTier(width)).toBe(expected)
  })

  it('fails closed to a static profile for reduced motion', () => {
    expect(describeHeroQuality({
      coarsePointer: false,
      reducedMotion: true,
      viewportWidth: 1920,
    })).toEqual(expect.objectContaining({
      pointerEnabled: false,
      scrollEnabled: false,
      targetFps: 0,
      tier: 'static',
    }))
  })

  it('disables pointer response on coarse pointers without lowering visual tier', () => {
    expect(describeHeroQuality({
      coarsePointer: true,
      reducedMotion: false,
      viewportWidth: 1440,
    })).toEqual(expect.objectContaining({ pointerEnabled: false, tier: 'high' }))
  })

  it('identifies constrained memory or CPU without treating missing hints as constrained', () => {
    expect(isLowPowerDevice({ deviceMemory: 2, hardwareConcurrency: 8 })).toBe(true)
    expect(isLowPowerDevice({ deviceMemory: 8, hardwareConcurrency: 2 })).toBe(true)
    expect(isLowPowerDevice({})).toBe(false)
  })

  it('only steps quality downward', () => {
    expect(getNextLowerHeroTier('wide')).toBe('high')
    expect(getNextLowerHeroTier('high')).toBe('medium')
    expect(getNextLowerHeroTier('low')).toBe('static')
    expect(getNextLowerHeroTier('static')).toBe('static')
  })
})

describe('frame budget controller', () => {
  it('waits for warmup and a continuous two-second breach', () => {
    const controller = createFrameBudgetController({
      breachDuration: 2000,
      sampleSize: 5,
      thresholdMs: 22,
      warmupFrames: 2,
    })

    expect(controller.record(40, 0)).toBe(false)
    expect(controller.record(40, 16)).toBe(false)
    expect(controller.record(40, 100)).toBe(false)
    expect(controller.record(40, 2099)).toBe(false)
    expect(controller.record(40, 2100)).toBe(true)
  })

  it('resets the breach window after performance recovers', () => {
    const controller = createFrameBudgetController({
      breachDuration: 2000,
      sampleSize: 1,
      thresholdMs: 30,
      warmupFrames: 0,
    })

    expect(controller.record(40, 0)).toBe(false)
    expect(controller.record(10, 1500)).toBe(false)
    expect(controller.record(40, 1600)).toBe(false)
    expect(controller.record(40, 3599)).toBe(false)
    expect(controller.record(40, 3600)).toBe(true)
  })
})
