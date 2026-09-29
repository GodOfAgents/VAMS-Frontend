import { useEffect } from 'react'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'

export function LifecycleEnhancer({ scopeRef }) {
  const motion = useResponsiveMotion()

  useEffect(() => {
    const section = scopeRef.current
    if (motion.isDesktop || motion.reducedMotion || !section || typeof IntersectionObserver === 'undefined') return undefined

    const rows = [...section.querySelectorAll('.lifecycle-list li')]
    const bar = section.querySelector('.lifecycle-progress__bar')
    let frame = 0
    const updateProgress = () => {
      frame = 0
      if (!bar) return
      const bounds = section.getBoundingClientRect()
      const start = window.innerHeight * 0.62
      const total = Math.max(1, bounds.height - window.innerHeight * 0.04)
      const progress = Math.max(0, Math.min(1, (start - bounds.top) / total))
      bar.style.transform = `scaleY(${progress})`
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(updateProgress) }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-active', entry.isIntersecting))
    }, { rootMargin: '-38% 0px -42% 0px', threshold: 0 })

    rows.forEach((row) => observer.observe(row))
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    schedule()
    return () => {
      if (frame) cancelAnimationFrame(frame)
      observer.disconnect()
      rows.forEach((row) => row.classList.remove('is-active'))
      if (bar) bar.style.transform = ''
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [motion.isDesktop, motion.reducedMotion, scopeRef])

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
