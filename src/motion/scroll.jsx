import { useRef } from 'react'
import { useScroll, useSpring, useTransform } from 'motion/react'
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
 * Inset rounded card that opens to full-bleed as it scrolls into view.
 * Children receive the same progress through CSS custom properties.
 */
export function ExpandingPanel({ as = 'section', children, className = '', offset = ['start end', 'start 20%'], ...props }) {
  const ref = useRef(null)
  const motion = useResponsiveMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset })
  const progress = useSpring(scrollYProgress, settle)
  const inset = motion.isMobile ? 3 : 4.5
  const clipPath = useTransform(progress, [0, 1], [`inset(0% ${inset}% 0% ${inset}% round 28px)`, 'inset(0% 0% 0% 0% round 0px)'])
  const rise = useTransform(progress, [0, 1], ['18%', '0%'])
  const glow = useTransform(progress, [0, 1], [0.35, 1])
  const Component = m[as] || m.section

  return (
    <Component
      className={className}
      ref={ref}
      style={motion.reducedMotion ? undefined : { clipPath, '--horizon-rise': rise, '--horizon-glow': glow }}
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
