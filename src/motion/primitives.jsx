import { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, useInView, useMotionValue, useSpring } from 'motion/react'
import * as m from 'motion/react-m'
import { Link, useLocation } from 'react-router-dom'
import { useResponsiveMotion } from './ResponsiveMotionProvider.jsx'
import { isViewTransitionNavigation, supportsViewTransitions } from './viewTransitions.js'

export const EASE_OUT = [0.16, 1, 0.3, 1]

const motionElements = {
  article: m.article,
  div: m.div,
  footer: m.footer,
  header: m.header,
  li: m.li,
  nav: m.nav,
  ol: m.ol,
  p: m.p,
  section: m.section,
  span: m.span,
  ul: m.ul,
}

function MotionElement({ as = 'div', ...props }) {
  const Component = motionElements[as] || m.div
  return <Component {...props} />
}

function revealDuration(motion) {
  return motion.isMobile ? 0.5 : 0.72
}

export function Reveal({ as = 'div', children, className = '', delay = 0, distance, once = true, ...props }) {
  const motion = useResponsiveMotion()
  const offset = distance ?? motion.distance

  return (
    <MotionElement
      as={as}
      className={className}
      initial={motion.reducedMotion ? false : { opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: motion.isMobile ? 0.1 : 0.18, margin: '0px 0px -6% 0px', once }}
      transition={{ delay, duration: revealDuration(motion), ease: EASE_OUT }}
      {...props}
    >
      {children}
    </MotionElement>
  )
}

export function StaggerGroup({ as = 'div', children, className = '', delay = 0, itemSelector, ...props }) {
  const motion = useResponsiveMotion()

  return (
    <MotionElement
      as={as}
      className={className}
      initial={motion.reducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ amount: motion.isMobile ? 0.06 : 0.14, margin: '0px 0px -6% 0px', once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: motion.isMobile ? 0.045 : 0.065,
          },
        },
      }}
      data-motion-items={itemSelector}
      {...props}
    >
      {children}
    </MotionElement>
  )
}

export function StaggerItem({ as = 'div', children, className = '', ...props }) {
  const motion = useResponsiveMotion()

  return (
    <MotionElement
      as={as}
      className={className}
      {...props}
      variants={{
        hidden: { opacity: 0, y: motion.distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: revealDuration(motion), ease: EASE_OUT },
        },
      }}
    >
      {children}
    </MotionElement>
  )
}

function wordDelay(motion, index) {
  return index * (motion.isMobile ? 0.045 : 0.06)
}

function SmokeLine({ isActive, mode, motion, onFinalWordReveal, phrase, totalWords, wordOffset, delay }) {
  const hidden = { opacity: 0, y: '0.42em' }
  const shown = { opacity: 1, y: '0em' }

  return (
    <span className="smoke-text__line" aria-hidden="true">
      {phrase.split(' ').map((word, wordIndex) => {
        const globalWordIndex = wordOffset + wordIndex
        const isFinal = globalWordIndex === totalWords - 1

        if (mode === 'words') {
          return (
            <Fragment key={`${phrase}-${word}-${wordIndex}`}>
              {wordIndex > 0 && ' '}
              <span className="smoke-text__word">
                <m.span
                  className="smoke-text__word--animated"
                  data-smoke-index={globalWordIndex}
                  data-smoke-final={isFinal ? 'true' : undefined}
                  initial={hidden}
                  animate={isActive ? shown : hidden}
                  transition={{
                    delay: delay + wordDelay(motion, globalWordIndex),
                    duration: motion.isMobile ? 0.7 : 0.9,
                    ease: EASE_OUT,
                  }}
                  onAnimationComplete={isFinal ? onFinalWordReveal : undefined}
                >
                  {word}
                </m.span>
              </span>
            </Fragment>
          )
        }

        return (
          <Fragment key={`${phrase}-${word}-${wordIndex}`}>
            {wordIndex > 0 && ' '}
            <span className="smoke-text__word">
              {word.split('').map((letter, index) => (
                <m.span
                  className="smoke-text__letter"
                  initial={hidden}
                  animate={isActive ? shown : hidden}
                  transition={{ delay: delay + Math.min((globalWordIndex * 6 + index) * 0.018, 0.6), duration: 0.7, ease: EASE_OUT }}
                  key={`${word}-${index}`}
                >
                  {letter}
                </m.span>
              ))}
            </span>
          </Fragment>
        )
      })}
    </span>
  )
}

/**
 * Accessible heading reveal. The heading keeps one accessible label while each
 * word rises into place. Reduced motion renders the complete static heading.
 */
export function SmokeText({ as = 'h1', className = '', delay = 0, mode = 'letters', onRevealComplete, phrases, triggerOnView = false, ...props }) {
  const motion = useResponsiveMotion()
  // A title arriving through a view transition is the morph target: show it whole.
  const [arrivedByTransition] = useState(() => !triggerOnView && isViewTransitionNavigation())
  const revealCompletedRef = useRef(false)
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, {
    amount: motion.isMobile ? 0.1 : 0.2,
    margin: '0px 0px -6% 0px',
    once: true,
  })
  const Tag = as
  const totalWords = phrases.reduce((total, phrase) => total + phrase.split(' ').length, 0)
  const handleFinalWordReveal = useCallback(() => {
    if (revealCompletedRef.current) return
    revealCompletedRef.current = true
    onRevealComplete?.()
  }, [onRevealComplete])
  const lines = phrases.map((phrase, phraseIndex) => ({
    phrase,
    phraseIndex,
    wordOffset: phrases
      .slice(0, phraseIndex)
      .reduce((total, previousPhrase) => total + previousPhrase.split(' ').length, 0),
  }))

  useEffect(() => {
    if (mode !== 'words' || motion.reducedMotion || !onRevealComplete) return undefined
    const revealDurationMs = (delay + wordDelay(motion, totalWords - 1) + 0.9) * 1000
    const completionTimer = window.setTimeout(handleFinalWordReveal, revealDurationMs)
    return () => window.clearTimeout(completionTimer)
  }, [delay, handleFinalWordReveal, mode, motion, onRevealComplete, totalWords])

  if (motion.reducedMotion || arrivedByTransition) {
    return (
      <Tag ref={containerRef} className={`smoke-text ${className}`} aria-label={phrases.join(' ')} data-smoke-mode={mode} {...props}>
        {lines.map(({ phrase, wordOffset: lineWordOffset }) => (
          <span className="smoke-text__line" aria-hidden="true" key={phrase}>
            {phrase.split(' ').map((word, wordIndex) => (
              <Fragment key={`${phrase}-${word}-${wordIndex}`}>
                {wordIndex > 0 && ' '}
                <span className="smoke-text__word" data-smoke-index={lineWordOffset + wordIndex}>{word}</span>
              </Fragment>
            ))}
          </span>
        ))}
      </Tag>
    )
  }

  return (
    <Tag ref={containerRef} className={`smoke-text ${className}`} aria-label={phrases.join(' ')} data-smoke-mode={mode} {...props}>
      {lines.map(({ phrase, wordOffset: lineWordOffset }) => (
        <SmokeLine
          delay={delay}
          isActive={!triggerOnView || isInView}
          key={phrase}
          mode={mode}
          motion={motion}
          onFinalWordReveal={handleFinalWordReveal}
          phrase={phrase}
          totalWords={totalWords}
          wordOffset={lineWordOffset}
        />
      ))}
    </Tag>
  )
}

export function MagneticLink({ children, className = '', to, href, ...props }) {
  const wrapperRef = useRef(null)
  const motion = useResponsiveMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 300, damping: 26, mass: 0.5 })
  const y = useSpring(rawY, { stiffness: 300, damping: 26, mass: 0.5 })
  const enabled = !motion.reducedMotion && !motion.coarsePointer

  const handlePointerMove = (event) => {
    if (!enabled || !wrapperRef.current) return
    const bounds = wrapperRef.current.getBoundingClientRect()
    rawX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 8)
    rawY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 6)
  }

  const reset = () => {
    rawX.set(0)
    rawY.set(0)
  }

  const content = to
    ? <Link className={className} to={to} {...props}>{children}</Link>
    : <a className={className} href={href} {...props}>{children}</a>

  return (
    <m.span
      className="magnetic-link"
      onPointerLeave={reset}
      onPointerMove={handlePointerMove}
      ref={wrapperRef}
      style={enabled ? { x, y } : undefined}
    >
      {content}
    </m.span>
  )
}

export function PresenceRegion({ children, stateKey, className = '' }) {
  const motion = useResponsiveMotion()

  return (
    <AnimatePresence initial={false} mode="sync">
      <m.div
        className={className}
        key={stateKey}
        initial={motion.reducedMotion ? false : { opacity: 0, y: Math.min(motion.distance, 6) }}
        animate={{ opacity: 1, y: 0 }}
        exit={motion.reducedMotion ? undefined : { opacity: 0 }}
        transition={{ duration: motion.reducedMotion ? 0 : 0.24, ease: EASE_OUT }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}

// With view transitions the browser animates between pages; the frame only fades
// in on history navigations (back/forward), which do not start a transition.
function RouteFrame({ children, historyEntry }) {
  const motion = useResponsiveMotion()
  const [entry] = useState(() => (historyEntry && !motion.reducedMotion && !isViewTransitionNavigation() ? 'fade' : undefined))
  return <div className="route-motion" data-route-enter={entry}>{children}</div>
}

export function RouteMotion({ children }) {
  const location = useLocation()
  const motion = useResponsiveMotion()

  if (supportsViewTransitions) {
    return <RouteFrame historyEntry={location.key !== 'default'} key={location.pathname}>{children}</RouteFrame>
  }

  return (
    <AnimatePresence initial={false} mode="sync">
      <m.div
        className="route-motion"
        key={location.pathname}
        initial={motion.reducedMotion ? false : { opacity: 0, y: Math.min(motion.distance, 8) }}
        animate={{ opacity: 1, y: 0 }}
        exit={motion.reducedMotion ? undefined : { opacity: 0 }}
        transition={{ duration: motion.reducedMotion ? 0 : 0.34, ease: EASE_OUT }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}
