import { useEffect, useRef } from 'react'
import { useResponsiveMotion } from './ResponsiveMotionProvider.jsx'

const interactive = 'a[href], button, summary, [role="button"]'
const editable = 'input, textarea, select, [contenteditable="true"]'
const lerp = (from, to, amount) => from + (to - from) * amount

/** A fine-pointer enhancement; native caret, touch and reduced motion stay untouched. */
export function GooCursor() {
  const rootRef = useRef(null)
  const dotRef = useRef(null)
  const tailRef = useRef(null)
  const { coarsePointer, reducedMotion } = useResponsiveMotion()
  const enabled = !coarsePointer && !reducedMotion

  useEffect(() => {
    const root = rootRef.current
    const dot = dotRef.current
    const tail = tailRef.current
    if (!enabled || !root || !dot || !tail) return undefined

    const pointer = { x: -100, y: -100 }
    const shape = { x: -100, y: -100, width: 12, height: 12, radius: 6, offsetX: 0, offsetY: 0 }
    const trail = { x: -100, y: -100 }
    let hovered = null
    let pressed = false
    let frame = 0

    const draw = () => {
      frame = 0
      if (hovered && !hovered.isConnected) hovered = null
      const bounds = hovered?.getBoundingClientRect()
      const fits = bounds && bounds.width <= 340 && bounds.height <= 96
      const width = fits ? bounds.width + 7 : hovered ? 28 : 12
      const height = fits ? bounds.height + 7 : hovered ? 28 : 12
      const radius = fits ? Math.min((parseFloat(getComputedStyle(hovered).borderTopLeftRadius) || 0) + 4, height / 2) : height / 2
      const offsetX = fits ? bounds.left + bounds.width / 2 - pointer.x : 0
      const offsetY = fits ? bounds.top + bounds.height / 2 - pointer.y : 0

      shape.x = lerp(shape.x, pointer.x, 0.42)
      shape.y = lerp(shape.y, pointer.y, 0.42)
      trail.x = lerp(trail.x, pointer.x, 0.18)
      trail.y = lerp(trail.y, pointer.y, 0.18)
      shape.width = lerp(shape.width, width, 0.24)
      shape.height = lerp(shape.height, height, 0.24)
      shape.radius = lerp(shape.radius, radius, 0.24)
      shape.offsetX = lerp(shape.offsetX, offsetX, 0.24)
      shape.offsetY = lerp(shape.offsetY, offsetY, 0.24)

      root.style.transform = `translate3d(${shape.x}px, ${shape.y}px, 0)`
      dot.style.width = `${shape.width}px`
      dot.style.height = `${shape.height}px`
      dot.style.borderRadius = `${shape.radius}px`
      dot.style.transform = `translate3d(${shape.offsetX - shape.width / 2}px, ${shape.offsetY - shape.height / 2}px, 0) scale(${pressed ? 0.9 : 1})`
      tail.style.transform = `translate3d(${trail.x - shape.x - 4}px, ${trail.y - shape.y - 4}px, 0)`

      const remaining = Math.abs(shape.x - pointer.x) + Math.abs(shape.y - pointer.y)
        + Math.abs(trail.x - pointer.x) + Math.abs(trail.y - pointer.y)
        + Math.abs(shape.width - width) + Math.abs(shape.offsetX - offsetX) + Math.abs(shape.offsetY - offsetY)
      if (remaining > 0.5) frame = requestAnimationFrame(draw)
    }

    const wake = () => { if (!frame) frame = requestAnimationFrame(draw) }
    const onMove = (event) => {
      if (event.pointerType !== 'mouse') return
      pointer.x = event.clientX
      pointer.y = event.clientY
      if (root.dataset.state !== 'active') {
        shape.x = pointer.x
        shape.y = pointer.y
        trail.x = pointer.x
        trail.y = pointer.y
      }
      const target = event.target instanceof Element ? event.target : null
      const isEditable = Boolean(target?.closest(editable))
      root.dataset.state = isEditable ? 'native' : 'active'
      document.documentElement.dataset.gooCursor = isEditable ? 'native' : 'active'
      hovered = isEditable ? null : target?.closest(interactive)
      wake()
    }
    const onScroll = () => {
      if (root.dataset.state !== 'active') return
      hovered = document.elementFromPoint(pointer.x, pointer.y)?.closest(interactive) || null
      wake()
    }
    const onDown = () => { pressed = true; wake() }
    const onUp = () => { pressed = false; wake() }
    const hide = () => {
      root.dataset.state = 'hidden'
      delete document.documentElement.dataset.gooCursor
      hovered = null
    }

    document.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerup', onUp, { passive: true })
    document.addEventListener('pointercancel', onUp, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('blur', hide)
    document.documentElement.addEventListener('mouseleave', hide)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerup', onUp)
      document.removeEventListener('pointercancel', onUp)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('blur', hide)
      document.documentElement.removeEventListener('mouseleave', hide)
      delete document.documentElement.dataset.gooCursor
    }
  }, [enabled])

  if (!enabled) return null
  return (
    <div className="goo-cursor" data-state="hidden" ref={rootRef} aria-hidden="true">
      <svg width="0" height="0" focusable="false"><defs><filter id="vams-cursor-goo" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" /><feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" result="goo" /><feComposite in="SourceGraphic" in2="goo" operator="atop" /></filter></defs></svg>
      <span className="goo-cursor__tail" ref={tailRef} />
      <span className="goo-cursor__dot" ref={dotRef} />
    </div>
  )
}
