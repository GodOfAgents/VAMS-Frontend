import { useCallback, useEffect, useRef } from 'react'
import { AnimatePresence, useMotionValue, useSpring } from 'motion/react'
import * as m from 'motion/react-m'
import { Link, useLocation } from 'react-router-dom'
import { useResponsiveMotion } from './ResponsiveMotionProvider.jsx'

const motionElements = {
  article: m.article,
  div: m.div,
  footer: m.footer,
  header: m.header,
  li: m.li,
  nav: m.nav,
  ol: m.ol,
  section: m.section,
  span: m.span,
  ul: m.ul,
}

function MotionElement({ as = 'div', ...props }) {
  const Component = motionElements[as] || m.div
  return <Component {...props} />
}

export function Reveal({ as = 'div', children, className = '', delay = 0, distance, once = true }) {
  const motion = useResponsiveMotion()
  const offset = distance ?? motion.distance

  return (
    <MotionElement
      as={as}
      className={className}
      initial={motion.reducedMotion ? false : { opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ amount: motion.isMobile ? 0.12 : 0.2, margin: '0px 0px -8% 0px', once }}
      transition={{ delay, duration: motion.isMobile ? 0.42 : 0.62, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionElement>
  )
}

export function StaggerGroup({ as = 'div', children, className = '', delay = 0, itemSelector }) {
  const motion = useResponsiveMotion()

  return (
    <MotionElement
      as={as}
      className={className}
      initial={motion.reducedMotion ? false : 'hidden'}
      whileInView="visible"
      viewport={{ amount: motion.isMobile ? 0.08 : 0.16, once: true }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            delayChildren: delay,
            staggerChildren: motion.isMobile ? 0.045 : 0.07,
          },
        },
      }}
      data-motion-items={itemSelector}
    >
      {children}
    </MotionElement>
  )
}

export function StaggerItem({ as = 'div', children, className = '' }) {
  const motion = useResponsiveMotion()

  return (
    <MotionElement
      as={as}
      className={className}
      variants={{
        hidden: { opacity: 0, y: motion.distance },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: motion.isMobile ? 0.4 : 0.58, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      {children}
    </MotionElement>
  )
}

function SmokeLine({ mode, motion, onFinalWordReveal, phrase, phraseIndex, phrases, totalWords, wordOffset }) {
  return (
    <span className="smoke-text__line" aria-hidden="true">
      {phrase.split(' ').map((word, wordIndex) => {
        const globalWordIndex = wordOffset + wordIndex

        if (mode === 'words') {
          return (
            <m.span
              className="smoke-text__word smoke-text__word--animated"
              data-smoke-index={globalWordIndex}
              data-smoke-final={globalWordIndex === totalWords - 1 ? 'true' : undefined}
              initial={{
                opacity: 0,
                filter: `blur(${motion.isMobile ? 6 : 12}px)`,
                y: motion.isMobile ? 8 : 20,
                scale: motion.isMobile ? 1.03 : 1.08,
              }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
              transition={{
                delay: globalWordIndex * (motion.isMobile ? 0.08 : 0.11),
                duration: 0.9,
                ease: [0.2, 0.65, 0.3, 0.9],
              }}
              onAnimationComplete={globalWordIndex === totalWords - 1 ? onFinalWordReveal : undefined}
              key={`${phrase}-${word}-${wordIndex}`}
            >
              {word}
            </m.span>
          )
        }

        return (
          <span className="smoke-text__word" key={`${phrase}-${word}-${wordIndex}`}>
            {word.split('').map((letter, index) => {
              const previousPhraseLetters = phrases
                .slice(0, phraseIndex)
                .reduce((total, item) => total + item.replaceAll(' ', '').length, 0)
              const previousWordLetters = phrase
                .split(' ')
                .slice(0, wordIndex)
                .reduce((total, item) => total + item.length, 0)
              const letterIndex = previousPhraseLetters + previousWordLetters + index
              const delay = Math.min(letterIndex * (motion.isMobile ? 0.018 : 0.028), 0.65)

              return (
                <m.span
                  className="smoke-text__letter"
                  initial={{ opacity: 0, filter: `blur(${motion.isMobile ? 6 : 12}px)`, y: motion.distance, scale: motion.isMobile ? 1.03 : 1.08 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', y: 0, scale: 1 }}
                  transition={{ delay, duration: motion.isMobile ? 0.68 : 0.92, ease: [0.2, 0.65, 0.3, 0.9] }}
                  key={`${word}-${index}`}
                >
                  {letter}
                </m.span>
              )
            })}
          </span>
        )
      })}
    </span>
  )
}

export function SmokeText({ as = 'h1', className = '', mode = 'letters', onRevealComplete, phrases }) {
  const motion = useResponsiveMotion()
  const revealCompletedRef = useRef(false)
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
    const staggerSeconds = motion.isMobile ? 0.08 : 0.11
    const revealDurationMs = ((totalWords - 1) * staggerSeconds + 0.9) * 1000
    const completionTimer = window.setTimeout(handleFinalWordReveal, revealDurationMs)
    return () => window.clearTimeout(completionTimer)
  }, [handleFinalWordReveal, mode, motion.isMobile, motion.reducedMotion, onRevealComplete, totalWords])

  if (motion.reducedMotion) {
    return (
      <Tag className={`smoke-text ${className}`} aria-label={phrases.join(' ')} data-smoke-mode={mode}>
        {lines.map(({ phrase, wordOffset: lineWordOffset }) => (
          <span className="smoke-text__line" aria-hidden="true" key={phrase}>
            {phrase.split(' ').map((word, wordIndex) => (
              <span className="smoke-text__word" data-smoke-index={lineWordOffset + wordIndex} key={`${phrase}-${word}-${wordIndex}`}>{word}</span>
            ))}
          </span>
        ))}
      </Tag>
    )
  }

  return (
    <Tag className={`smoke-text ${className}`} aria-label={phrases.join(' ')} data-smoke-mode={mode}>
      {lines.map(({ phrase, phraseIndex, wordOffset: lineWordOffset }) => (
        <SmokeLine
          mode={mode}
          motion={motion}
          onFinalWordReveal={handleFinalWordReveal}
          phrase={phrase}
          phraseIndex={phraseIndex}
          phrases={phrases}
          totalWords={totalWords}
          wordOffset={lineWordOffset}
          key={phrase}
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
  const x = useSpring(rawX, { stiffness: 260, damping: 24, mass: 0.55 })
  const y = useSpring(rawY, { stiffness: 260, damping: 24, mass: 0.55 })
  const enabled = !motion.reducedMotion && !motion.coarsePointer

  const handlePointerMove = (event) => {
    if (!enabled || !wrapperRef.current) return
    const bounds = wrapperRef.current.getBoundingClientRect()
    rawX.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 12)
    rawY.set(((event.clientY - bounds.top) / bounds.height - 0.5) * 10)
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
        initial={motion.reducedMotion ? false : { opacity: 0, y: Math.min(motion.distance, 8) }}
        animate={{ opacity: 1, y: 0 }}
        exit={motion.reducedMotion ? undefined : { opacity: 0 }}
        transition={{ duration: motion.reducedMotion ? 0 : 0.18, ease: 'easeOut' }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}

export function RouteMotion({ children }) {
  const location = useLocation()
  const motion = useResponsiveMotion()

  return (
    <AnimatePresence initial={false} mode="sync">
      <m.div
        className="route-motion"
        key={location.pathname}
        initial={motion.reducedMotion ? false : { opacity: 0, y: Math.min(motion.distance, 8) }}
        animate={{ opacity: 1, y: 0 }}
        exit={motion.reducedMotion ? undefined : { opacity: 0 }}
        transition={{ duration: motion.reducedMotion ? 0 : 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </m.div>
    </AnimatePresence>
  )
}
