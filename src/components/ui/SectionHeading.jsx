import { Reveal, SmokeText } from '../../motion/primitives.jsx'

/**
 * Section heading with an optional aside. Multi-phrase titles render one phrase
 * per line; `tone="split"` mutes the final phrase for a two-tone heading.
 */
export function SectionHeading({
  as = 'h2',
  aside,
  children,
  className = '',
  eyebrow,
  id,
  layout = 'stack',
  title,
  tone = 'solid',
}) {
  const phrases = Array.isArray(title) ? title : [title]

  return (
    <div className={`section-heading section-heading--${layout} ${className}`}>
      <div className="section-heading__main">
        {eyebrow && <Reveal as="p" className="eyebrow eyebrow--signal">{eyebrow}</Reveal>}
        <SmokeText
          as={as}
          className={`section-heading__title ${tone === 'split' && phrases.length > 1 ? 'section-heading__title--split' : ''}`}
          id={id}
          mode="words"
          phrases={phrases}
          triggerOnView
        />
      </div>
      {(aside || children) && (
        <Reveal className="section-heading__aside" delay={0.12}>
          {aside && <p>{aside}</p>}
          {children}
        </Reveal>
      )}
    </div>
  )
}
