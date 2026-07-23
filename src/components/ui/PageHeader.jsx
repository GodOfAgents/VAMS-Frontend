export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <header className="page-header">
      <p className="eyebrow">{eyebrow}</p>
      <div className="page-header__row">
        <div>
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {children && <div className="page-header__actions">{children}</div>}
      </div>
    </header>
  )
}
