import { Reveal, SmokeText } from '../../motion/primitives.jsx'

export function PageHeader({ eyebrow, title, description, children, smoke = false }) {
  return (
    <Reveal as="header" className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <div className="page-header__row">
        <div>
          {smoke ? <SmokeText phrases={[title]} /> : <h1>{title}</h1>}
          {description && <p>{description}</p>}
        </div>
        {children && <div className="page-header__actions">{children}</div>}
      </div>
    </Reveal>
  )
}
