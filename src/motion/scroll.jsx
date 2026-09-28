import { useRef } from 'react'
import { useMotionValueEvent, useScroll, useSpring, useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { useResponsiveMotion } from './ResponsiveMotionProvider.jsx'

const settle = { stiffness: 170, damping: 30, mass: 0.35 }

/**
 * Scroll-scrubbed entrance for large media: the element tilts up, scales, and
 * rises into place while it travels into the viewport, then stays put.
 */
export function TiltIn({ as = 'div', children, className = '', ...props }) {
  const ref = useRef(null)
  const motion = useResponsiveMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 42%'] })
  const progress = useSpring(scrollYProgress, settle)
  const rotateX = useTransform(progress, [0, 1], [motion.isMobile ? 8 : 16, 0])
  const scale = useTransform(progress, [0, 1], [0.94, 1])
  const y = useTransform(progress, [0, 1], [motion.isMobile ? 24 : 56, 0])
  const opacity = useTransform(progress, [0, 0.55], [0.35, 1])
  const Component = m[as] || m.div

  return (
    <Component
      className={className}
      ref={ref}
      style={motion.reducedMotion ? undefined : { rotateX, scale, y, opacity, transformPerspective: 1400 }}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * Inset rounded card that opens to full-bleed as it scrolls into view. The card
 * starts clearly smaller than the viewport so the growth reads at a glance, and
 * exposes `--panel-open` (0–1) to its children. Pass a motion value as
 * `progressValue` to receive the same eased progress.
 */
export function ExpandingPanel({ as = 'section', children, className = '', offset = ['start end', 'start 20%'], progressValue, ...props }) {
  const ref = useRef(null)
  const motion = useResponsiveMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset })
  const progress = useSpring(scrollYProgress, settle)
  useMotionValueEvent(progress, 'change', (value) => progressValue?.set(value))
  const inset = motion.isMobile ? 7 : 13
  const clipPath = useTransform(progress, [0, 1], [`inset(6% ${inset}% 0% ${inset}% round 44px)`, 'inset(0% 0% 0% 0% round 0px)'])
  const Component = m[as] || m.section

  return (
    <Component
      className={className}
      ref={ref}
      style={motion.reducedMotion ? undefined : { clipPath, '--panel-open': progress }}
      {...props}
    >
      {children}
    </Component>
  )
}

/**
 * Pinned scroll stage. The frame stays in view while the reader scrolls through
 * the container; `render(progress)` receives the scrubbed 0–1 progress value.
 */
export function useStageProgress(ref) {
  const motion = useResponsiveMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] })
  const progress = useSpring(scrollYProgress, settle)
  return { progress, reducedMotion: motion.reducedMotion, isMobile: motion.isMobile }
}
