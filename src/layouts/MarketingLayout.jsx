import { ExternalLink, Github, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Brand } from '../components/navigation/Brand.jsx'
import { SimulationBanner } from '../components/disclosures/SimulationBanner.jsx'
import { ThemeToggle } from '../components/ui/ThemeToggle.jsx'
import { NoiseOverlay } from '../components/ui/NoiseOverlay.jsx'
import { appEnvironment } from '../config/environment.js'

const links = [
  ['/protocol', 'Protocol'],
  ['/network', 'Network'],
  ['/build', 'Build'],
  ['/operate', 'Operate'],
  ['/research', 'Research'],
  ['/status', 'Status'],
]

export function MarketingLayout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SimulationBanner />
      <header className="marketing-nav">
        <div className="marketing-nav__inner">
          <Brand />
          <nav className={`marketing-nav__links ${open ? 'is-open' : ''}`} aria-label="Primary">
            {links.map(([to, label]) => <NavLink key={to} to={to} onClick={() => setOpen(false)}>{label}</NavLink>)}
            <a href={appEnvironment.docsUrl}>Read docs <ExternalLink aria-hidden="true" size={13} /></a>
          </nav>
          <div className="marketing-nav__actions">
            <ThemeToggle />
            <Link className="button button--small" to="/overview">Open console</Link>
            <button className="icon-button nav-menu" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>
      <main id="main-content"><Outlet /></main>
      <footer className="site-footer">
        <div className="site-footer__grid">
          <div>
            <Brand />
            <p>Verifiable infrastructure for autonomous agents.</p>
          </div>
          <div>
            <p className="eyebrow">Lifecycle</p>
            <p>Hardened pre-testnet candidate. No public deployment claimed.</p>
          </div>
          <div className="site-footer__links">
            <a href="https://github.com/GodOfAgents/VAMS"><Github aria-hidden="true" size={16} /> Protocol source</a>
            <Link to="/evidence">Evidence center</Link>
          </div>
        </div>
      </footer>
      <NoiseOverlay />
    </div>
  )
}
