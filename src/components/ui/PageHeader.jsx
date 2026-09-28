import { Reveal, SmokeText } from '../../motion/primitives.jsx'

export function PageHeader({ eyebrow, title, description, children, smoke = true }) {
  return (
    <header className="page-header">
      <Reveal as="p" className="eyebrow eyebrow--signal">{eyebrow}</Reveal>
      <div className="page-header__row">
        <div>
          {smoke ? <SmokeText className="vt-title" mode="words" delay={0.06} phrases={[title]} /> : <h1 className="vt-title">{title}</h1>}
          {description && <Reveal as="p" delay={0.22}>{description}</Reveal>}
        </div>
        {children && <Reveal className="page-header__actions" delay={0.3}>{children}</Reveal>}
      </div>
    </header>
  )
}
