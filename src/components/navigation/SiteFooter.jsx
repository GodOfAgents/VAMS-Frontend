import { Github } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Brand } from './Brand.jsx'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap site-footer__grid">
        <div className="site-footer__brand">
          <Brand />
          <p>Sovereign infrastructure for durable, verifiable digital services.</p>
        </div>
        <div className="site-footer__lifecycle">
          <p className="eyebrow">Lifecycle</p>
          <p>Hardened pre-testnet candidate. No public deployment claimed.</p>
        </div>
        <div className="site-footer__links">
          <a href="https://github.com/GodOfAgents/VAMS"><Github aria-hidden="true" size={16} /> Protocol source</a>
          <Link to="/evidence">Evidence center</Link>
        </div>
      </div>
    </footer>
  )
}
