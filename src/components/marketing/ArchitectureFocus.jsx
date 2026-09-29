import { useEffect } from 'react'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'

/** Light the architecture row currently being read; no per-frame scroll work. */
export function ArchitectureFocus({ scopeRef }) {
  const { reducedMotion } = useResponsiveMotion()

  useEffect(() => {
    const cards = [...(scopeRef.current?.querySelectorAll('.architecture-grid article') || [])]
    if (!cards.length || reducedMotion || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-reading', entry.isIntersecting))
    }, { rootMargin: '-28% 0px -42% 0px', threshold: 0 })

    cards.forEach((card) => observer.observe(card))
    return () => {
      observer.disconnect()
      cards.forEach((card) => card.classList.remove('is-reading'))
    }
  }, [reducedMotion, scopeRef])

  return null
}
