import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { useHeroQuality } from '../../motion/ResponsiveMotionProvider.jsx'
import {
  HERO_QUALITY_ORDER,
  HERO_QUALITY_PROFILES,
  isLowPowerDevice,
} from '../../motion/heroQuality.js'

const NeuralField = lazy(() => import('./NeuralField.jsx'))

export function MarketingVisual({ proofSignal = 0 }) {
  const requestedQuality = useHeroQuality()
  const lowPower = useMemo(() => isLowPowerDevice(), [])
  const [tier, setTier] = useState(() => (lowPower ? 'static' : requestedQuality.tier))
  const [degraded, setDegraded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const handleFailure = useCallback(() => {
    setFailed(true)
    setReady(false)
  }, [])
  const handleReady = useCallback(() => setReady(true), [])
  const handleDegrade = useCallback((nextTier) => {
    setDegraded(true)
    setReady(false)
    setTier((currentTier) => {
      const currentIndex = HERO_QUALITY_ORDER.indexOf(currentTier)
      const nextIndex = HERO_QUALITY_ORDER.indexOf(nextTier)
      return nextIndex < currentIndex ? nextTier : currentTier
    })
  }, [])

  const effectiveTier = requestedQuality.tier === 'static' ? 'static' : tier

  const quality = useMemo(
    () => ({
      ...HERO_QUALITY_PROFILES[effectiveTier],
      pointerEnabled: HERO_QUALITY_PROFILES[effectiveTier].pointerEnabled
        && requestedQuality.pointerEnabled,
      reducedMotion: requestedQuality.reducedMotion,
      scrollEnabled: HERO_QUALITY_PROFILES[effectiveTier].scrollEnabled
        && requestedQuality.scrollEnabled
        && !degraded,
    }),
    [degraded, effectiveTier, requestedQuality.pointerEnabled, requestedQuality.reducedMotion, requestedQuality.scrollEnabled],
  )
  const rendererState = failed || effectiveTier === 'static' ? 'fallback' : ready ? 'ready' : 'loading'

  return (
    <div
      className={`hero-visual hero-visual--${effectiveTier}`}
      aria-hidden="true"
      data-hero-quality={effectiveTier}
      data-hero-renderer={rendererState}
    >
      <div className="neural-field neural-field--static" />
      {!failed && effectiveTier !== 'static' && (
        <Suspense fallback={null}>
          <NeuralField
            key={effectiveTier}
            onDegrade={handleDegrade}
            onFailure={handleFailure}
            onReady={handleReady}
            proofSignal={proofSignal}
            quality={quality}
          />
        </Suspense>
      )}
    </div>
  )
}
