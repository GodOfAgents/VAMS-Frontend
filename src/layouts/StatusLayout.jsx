import { ExternalLink } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { Brand } from '../components/navigation/Brand.jsx'
import { SimulationBanner } from '../components/disclosures/SimulationBanner.jsx'
import { GooCursor } from '../motion/GooCursor.jsx'
import { LiquidGlass } from '../motion/liquidGlass.jsx'
import { RouteMotion } from '../motion/primitives.jsx'
import '../styles/marketing.css'
import '../styles/status.css'

export function StatusLayout() {
  return (
    <div className="status-shell">
      <a className="skip-link" href="#status-content">Skip to status content</a>
      <SimulationBanner />
      <header className="site-header status-header">
        <div className="site-header__bar status-nav" data-glass="true">
          <Brand to="/status" />
          <span className="status-nav__title">VERIFICATION STATUS</span>
          <div className="status-nav__links">
            <Link to="/">Protocol home</Link>
            <a href="https://github.com/GodOfAgents/VAMS">Source <ExternalLink aria-hidden="true" size={13} /></a>
            <Link to="/overview">Console</Link>
          </div>
        </div>
      </header>
      <main id="status-content"><RouteMotion><Outlet /></RouteMotion></main>
      <LiquidGlass />
      <GooCursor />
    </div>
  )
}
