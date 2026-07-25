import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { useHeroQuality } from '../../motion/ResponsiveMotionProvider.jsx'

const NeuralField = lazy(() => import('./NeuralField.jsx'))

function isLowPowerDevice() {
  if (typeof navigator === 'undefined') return true
  const memoryConstrained = 'deviceMemory' in navigator && navigator.deviceMemory <= 2
  const cpuConstrained = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2
  return memoryConstrained || cpuConstrained
}

export function MarketingVisual() {
  const requestedQuality = useHeroQuality()
  const [failed, setFailed] = useState(false)
  const handleFailure = useCallback(() => setFailed(true), [])
  const quality = useMemo(
    () => (isLowPowerDevice() && ['mobile', 'tablet'].includes(requestedQuality) ? 'static' : requestedQuality),
    [requestedQuality],
  )

  return (
    <div className={`hero-visual hero-visual--${quality}`} aria-hidden="true">
      <div className="neural-field neural-field--static" />
      {!failed && quality !== 'static' && (
        <Suspense fallback={null}>
          <NeuralField onFailure={handleFailure} quality={quality} />
        </Suspense>
      )}
    </div>
  )
}
