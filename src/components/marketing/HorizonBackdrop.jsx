import { useEffect, useRef } from 'react'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'

/**
 * Decorative horizon: a luminous planet rim rendered with CSS gradients.
 * On fine pointers a soft flare follows the cursor along the curved rim.
 * The element is purely presentational and hidden from assistive technology.
 */
export function HorizonBackdrop({ children, variant = 'hero' }) {
  const rootRef = useRef(null)
  const { coarsePointer, reducedMotion } = useResponsiveMotion()

  useEffect(() => {
    const root = rootRef.current
    const stage = root?.parentElement
    const planet = root?.querySelector('.horizon__planet')
    if (!root || !stage || !planet || coarsePointer || reducedMotion) return undefined

    let frame = null
    let pointer = null

    const paint = () => {
      frame = null
      if (!pointer) return
      const stageBounds = root.getBoundingClientRect()
      const planetBounds = planet.getBoundingClientRect()
      const radius = planetBounds.width / 2
      const centerX = planetBounds.left + radius - stageBounds.left
      const top = planetBounds.top - stageBounds.top
      const x = Math.min(Math.max(pointer.x - stageBounds.left, 0), stageBounds.width)
      const dx = Math.min(Math.abs(x - centerX), radius * 0.98)
      const y = top + (radius - Math.sqrt(radius * radius - dx * dx))
      root.style.setProperty('--flare-x', `${x.toFixed(1)}px`)
      root.style.setProperty('--flare-y', `${y.toFixed(1)}px`)
      root.dataset.pointer = 'active'
    }

    const handleMove = (event) => {
      pointer = { x: event.clientX }
      if (frame === null) frame = window.requestAnimationFrame(paint)
    }

    const handleLeave = () => {
      pointer = null
      root.dataset.pointer = 'idle'
    }

    stage.addEventListener('pointermove', handleMove, { passive: true })
    stage.addEventListener('pointerleave', handleLeave)
    return () => {
      stage.removeEventListener('pointermove', handleMove)
      stage.removeEventListener('pointerleave', handleLeave)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [coarsePointer, reducedMotion])

  return (
    <div className={`horizon horizon--${variant}`} ref={rootRef} aria-hidden="true" data-pointer="idle">
      <div className="horizon__sky" />
      <div className="horizon__aurora" />
      {children && <div className="horizon__behind">{children}</div>}
      <div className="horizon__planet" />
      <div className="horizon__grid" />
      <div className="horizon__flare" />
      <div className="horizon__fade" />
    </div>
  )
}
