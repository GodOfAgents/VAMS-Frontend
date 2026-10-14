import { useRef } from 'react'
import { useScroll, useSpring, useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { useResponsiveMotion } from './ResponsiveMotionProvider.jsx'

const spring = { stiffness: 170, damping: 30, mass: 0.4 }

export function ContinuityChapter({ children, className = '' }) {
  const ref = useRef(null)
  const motion = useResponsiveMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'start 28%'] })
  const progress = useSpring(scrollYProgress, spring)
  const handoffProgress = useTransform(progress, [0, 1], [0, 1])
  const canAnimate = !motion.reducedMotion && !motion.isMobile && !motion.coarsePointer

  return (
    <m.section
      className={`motion-chapter ${className}`}
      ref={ref}
      style={canAnimate ? { '--handoff-progress': handoffProgress } : undefined}
    >
      {children}
    </m.section>
  )
}
