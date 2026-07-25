import { useEffect } from 'react'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'

export function LifecycleEnhancer({ scopeRef }) {
  const motion = useResponsiveMotion()

  useEffect(() => {
    if (!motion.isDesktop || motion.reducedMotion || !scopeRef.current) return undefined

    let cleanup
    let cancelled = false

    import('../../motion/marketingTimeline.js').then(({ initLifecycleTimeline }) => {
      if (!cancelled && scopeRef.current) cleanup = initLifecycleTimeline(scopeRef.current)
    })

    return () => {
      cancelled = true
      cleanup?.()
    }
  }, [motion.isDesktop, motion.reducedMotion, scopeRef])

  return null
}
