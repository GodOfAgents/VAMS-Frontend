import { useRef } from 'react'
import { useScroll, useSpring, useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { useResponsiveMotion } from './ResponsiveMotionProvider.jsx'

const spring = { stiffness: 170, damping: 30, mass: 0.4 }

export function ExpandingChapter({ children, className = '' }) {
  const ref = useRef(null)
  const motion = useResponsiveMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 28%'] })
  const progress = useSpring(scrollYProgress, spring)
  const inset = motion.isMobile ? 4 : 9
  const clipPath = useTransform(progress, [0, 1], [`inset(0% ${inset}% round 28px)`, 'inset(0% 0% round 0px)'])

  return (
    <m.section
      className={`motion-chapter ${className}`}
      ref={ref}
      style={motion.reducedMotion ? undefined : { clipPath }}
    >
      {children}
    </m.section>
  )
}
