export const HERO_QUALITY_ORDER = ['static', 'low', 'medium', 'high', 'wide']

export const HERO_QUALITY_PROFILES = {
  static: {
    maxDpr: 1,
    pointerEnabled: false,
    scrollEnabled: false,
    targetFps: 0,
    tier: 'static',
  },
  low: {
    maxDpr: 1,
    pointerEnabled: false,
    scrollEnabled: false,
    targetFps: 30,
    tier: 'low',
  },
  medium: {
    maxDpr: 1,
    pointerEnabled: false,
    scrollEnabled: false,
    targetFps: 40,
    tier: 'medium',
  },
  high: {
    maxDpr: 1.25,
    pointerEnabled: true,
    scrollEnabled: true,
    targetFps: 60,
    tier: 'high',
  },
  wide: {
    maxDpr: 1.25,
    pointerEnabled: true,
    scrollEnabled: true,
    targetFps: 60,
    tier: 'wide',
  },
}

export function getViewportHeroTier(viewportWidth) {
  if (viewportWidth < 360) return 'static'
  if (viewportWidth < 768) return 'low'
  if (viewportWidth < 1200) return 'medium'
  if (viewportWidth < 1600) return 'high'
  return 'wide'
}

export function getNextLowerHeroTier(tier) {
  const index = HERO_QUALITY_ORDER.indexOf(tier)
  if (index <= 0) return 'static'
  return HERO_QUALITY_ORDER[index - 1]
}

export function describeHeroQuality({ coarsePointer, reducedMotion, viewportWidth }) {
  const tier = reducedMotion ? 'static' : getViewportHeroTier(viewportWidth)
  const profile = HERO_QUALITY_PROFILES[tier]

  return {
    ...profile,
    pointerEnabled: profile.pointerEnabled && !coarsePointer && !reducedMotion,
    reducedMotion,
    scrollEnabled: profile.scrollEnabled && !reducedMotion,
  }
}

export function isLowPowerDevice(device = typeof navigator === 'undefined' ? {} : navigator) {
  const memoryConstrained = 'deviceMemory' in device && device.deviceMemory <= 2
  const cpuConstrained = Boolean(device.hardwareConcurrency && device.hardwareConcurrency <= 2)
  return memoryConstrained || cpuConstrained
}

export function createFrameBudgetController({
  breachDuration = 2000,
  sampleSize = 90,
  thresholdMs,
  warmupFrames = 30,
}) {
  const samples = []
  let breachStartedAt = null
  let frameCount = 0

  return {
    record(frameCostMs, now) {
      frameCount += 1
      if (frameCount <= warmupFrames) return false

      samples.push(frameCostMs)
      if (samples.length > sampleSize) samples.shift()

      const sorted = [...samples].sort((left, right) => left - right)
      const median = sorted[Math.floor(sorted.length / 2)]

      if (median <= thresholdMs) {
        breachStartedAt = null
        return false
      }

      if (breachStartedAt === null) {
        breachStartedAt = now
        return false
      }

      if (now - breachStartedAt < breachDuration) return false
      breachStartedAt = now
      samples.length = 0
      return true
    },
  }
}
