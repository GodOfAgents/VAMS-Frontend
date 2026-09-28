import { useEffect, useRef, useState } from 'react'
import { useScroll, useSpring } from 'motion/react'
import * as m from 'motion/react-m'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'
import { StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'

/**
 * Seven-step lifecycle rendered as a vertical timeline. The rail fills with
 * scroll progress and the step crossing the viewport's centre becomes active.
 */
export function LifecycleTimeline({ steps }) {
  const timelineRef = useRef(null)
  const motion = useResponsiveMotion()
  const [active, setActive] = useState(-1)
  const { scrollYProgress } = useScroll({ target: timelineRef, offset: ['start 62%', 'end 58%'] })
  const fill = useSpring(scrollYProgress, { stiffness: 160, damping: 32, mass: 0.4 })

  useEffect(() => {
    const root = timelineRef.current
    if (!root || motion.reducedMotion || typeof IntersectionObserver === 'undefined') {
      setActive(-1)
      return undefined
    }

    const items = [...root.querySelectorAll('[data-lifecycle-step]')]
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(items.indexOf(entry.target))
      }
    }, { rootMargin: '-44% 0px -52% 0px' })

    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [motion.reducedMotion])

  return (
    <div className="lifecycle-timeline" ref={timelineRef} data-active-step={active}>
      <div className="lifecycle-track" aria-hidden="true">
        <m.span className="lifecycle-progress__bar" style={motion.reducedMotion ? undefined : { scaleY: fill }} />
      </div>
      <StaggerGroup as="ol" className="lifecycle-list">
        {steps.map(([number, title, detail], index) => (
          <StaggerItem
            as="li"
            className={`lifecycle-step${index === active ? ' is-active' : ''}${active > index ? ' is-past' : ''}`}
            data-lifecycle-step={number}
            key={number}
          >
            <span className="lifecycle-step__node" aria-hidden="true" />
            <span className="lifecycle-step__index">{number}</span>
            <div className="lifecycle-step__body">
              <h3>{title}</h3>
              <p>{detail}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </div>
  )
}
