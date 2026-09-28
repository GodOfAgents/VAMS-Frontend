import { useEffect, useRef } from 'react'
import { useResponsiveMotion } from './ResponsiveMotionProvider.jsx'

// A gooey cursor for fine pointers: an ink drop that trails the pointer and
// snaps onto the control beneath it, inverting whatever it covers. Text fields
// keep the native caret. Disabled for coarse pointers and reduced motion.

const TARGETS = 'a[href], button, summary, [role="button"], label[for]'
const NATIVE = 'input, textarea, select, [contenteditable="true"]'
const MORPH_MAX_WIDTH = 360
const MORPH_MAX_HEIGHT = 120
const DOT = 12
const DROP = 7

const lerp = (from, to, amount) => from + (to - from) * amount

export function GooCursor() {
  const rootRef = useRef(null)
  const dotRef = useRef(null)
  const dropRef = useRef(null)
  const { coarsePointer, reducedMotion } = useResponsiveMotion()
  const enabled = !coarsePointer && !reducedMotion

  useEffect(() => {
    const root = rootRef.current
    const dot = dotRef.current
    const drop = dropRef.current
    if (!enabled || !root || !dot || !drop) return undefined

    document.documentElement.dataset.cursor = 'custom'
    const pointer = { x: -100, y: -100 }
    const goal = { alpha: 1, height: DOT, offsetX: 0, offsetY: 0, radius: DOT / 2, scale: 1, width: DOT }
    const shape = { ...goal, x: -100, y: -100 }
    const tail = { x: -100, y: -100 }
    let hovered = null
    let frame = null
    let pressed = false

    const aim = () => {
      if (hovered && !hovered.isConnected) hovered = null
      if (!hovered) {
        goal.width = DOT
        goal.height = DOT
        goal.radius = DOT / 2
        goal.offsetX = 0
        goal.offsetY = 0
        goal.alpha = 1
        goal.scale = pressed ? 0.8 : 1
        return
      }
      const bounds = hovered.getBoundingClientRect()
      if (bounds.width <= MORPH_MAX_WIDTH && bounds.height <= MORPH_MAX_HEIGHT) {
        // Snap onto the control, a little larger than it, following its corners.
        const radius = parseFloat(getComputedStyle(hovered).borderTopLeftRadius) || 0
        goal.width = bounds.width + 8
        goal.height = bounds.height + 8
        goal.radius = Math.min(radius + 4, goal.height / 2)
        goal.offsetX = bounds.left + bounds.width / 2 - pointer.x
        goal.offsetY = bounds.top + bounds.height / 2 - pointer.y
        goal.alpha = 1
        goal.scale = pressed ? 0.96 : 1
      } else {
        // Large targets (rows, panels) get a soft disc instead of a cover.
        goal.width = 34
        goal.height = 34
        goal.radius = 17
        goal.offsetX = 0
        goal.offsetY = 0
        goal.alpha = 0.55
        goal.scale = pressed ? 0.85 : 1
      }
    }

    const render = () => {
      frame = null
      aim()
      shape.x = lerp(shape.x, pointer.x, 0.45)
      shape.y = lerp(shape.y, pointer.y, 0.45)
      tail.x = lerp(tail.x, pointer.x, 0.16)
      tail.y = lerp(tail.y, pointer.y, 0.16)
      const ease = hovered ? 0.22 : 0.3
      shape.width = lerp(shape.width, goal.width, ease)
      shape.height = lerp(shape.height, goal.height, ease)
      shape.radius = lerp(shape.radius, goal.radius, ease)
      shape.offsetX = lerp(shape.offsetX, goal.offsetX, ease)
      shape.offsetY = lerp(shape.offsetY, goal.offsetY, ease)
      shape.alpha = lerp(shape.alpha, goal.alpha, 0.2)
      shape.scale = lerp(shape.scale, goal.scale, 0.3)

      root.style.transform = `translate3d(${shape.x.toFixed(2)}px, ${shape.y.toFixed(2)}px, 0)`
      dot.style.width = `${shape.width.toFixed(2)}px`
      dot.style.height = `${shape.height.toFixed(2)}px`
      dot.style.borderRadius = `${shape.radius.toFixed(2)}px`
      dot.style.opacity = shape.alpha.toFixed(3)
      dot.style.transform = `translate(${(shape.offsetX - shape.width / 2).toFixed(2)}px, ${(shape.offsetY - shape.height / 2).toFixed(2)}px) scale(${shape.scale.toFixed(3)})`
      drop.style.transform = `translate(${(tail.x - shape.x - DROP / 2).toFixed(2)}px, ${(tail.y - shape.y - DROP / 2).toFixed(2)}px)`

      const settled = Math.abs(shape.x - pointer.x) + Math.abs(shape.y - pointer.y) + Math.abs(tail.x - pointer.x) + Math.abs(tail.y - pointer.y)
        + Math.abs(shape.width - goal.width) + Math.abs(shape.offsetX - goal.offsetX) + Math.abs(shape.offsetY - goal.offsetY) < 0.3
      if (!settled || hovered) frame = window.requestAnimationFrame(render)
    }

    const wake = () => {
      if (frame === null) frame = window.requestAnimationFrame(render)
    }

    const handleMove = (event) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
      if (root.dataset.state !== 'active') {
        shape.x = pointer.x
        shape.y = pointer.y
        tail.x = pointer.x
        tail.y = pointer.y
      }
      const native = event.target instanceof Element && event.target.closest(NATIVE)
      root.dataset.state = native ? 'native' : 'active'
      wake()
    }

    const handleOver = (event) => {
      hovered = event.target instanceof Element ? event.target.closest(TARGETS) : null
      wake()
    }

    const handleOut = (event) => {
      if (hovered && event.relatedTarget instanceof Element && hovered.contains(event.relatedTarget)) return
      if (hovered && event.target instanceof Element && hovered.contains(event.target)) hovered = null
      wake()
    }

    const handleDown = () => {
      pressed = true
      wake()
    }

    const handleUp = () => {
      pressed = false
      wake()
    }

    const hide = () => {
      root.dataset.state = 'hidden'
      hovered = null
    }

    document.addEventListener('pointermove', handleMove, { passive: true })
    document.addEventListener('pointerover', handleOver, { passive: true })
    document.addEventListener('pointerout', handleOut, { passive: true })
    document.addEventListener('pointerdown', handleDown, { passive: true })
    document.addEventListener('pointerup', handleUp, { passive: true })
    document.addEventListener('pointercancel', handleUp, { passive: true })
    document.documentElement.addEventListener('mouseleave', hide)
    window.addEventListener('blur', hide)

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerover', handleOver)
      document.removeEventListener('pointerout', handleOut)
      document.removeEventListener('pointerdown', handleDown)
      document.removeEventListener('pointerup', handleUp)
      document.removeEventListener('pointercancel', handleUp)
      document.documentElement.removeEventListener('mouseleave', hide)
      window.removeEventListener('blur', hide)
      delete document.documentElement.dataset.cursor
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="cursor" data-state="hidden" ref={rootRef} aria-hidden="true">
      <svg className="cursor__defs" width="0" height="0" focusable="false">
        <defs>
          <filter id="cursor-goo" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 24 -11" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>
      <div className="cursor__drop" ref={dropRef} />
      <div className="cursor__dot" ref={dotRef} />
    </div>
  )
}
