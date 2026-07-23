import { lazy, Suspense, useEffect, useState } from 'react'

const NeuralField = lazy(() => import('./NeuralField.jsx'))

export function MarketingVisual() {
  const [reducedMotion, setReducedMotion] = useState(true)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  if (reducedMotion) return <div className="neural-field neural-field--static" aria-hidden="true" />
  return <Suspense fallback={<div className="neural-field neural-field--static" aria-hidden="true" />}><NeuralField /></Suspense>
}
