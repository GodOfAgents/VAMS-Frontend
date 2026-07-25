import {
  Activity, Boxes, Braces, Database, FileCheck2, LayoutDashboard,
  Menu, Network, Server, ShieldCheck, X,
} from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Brand } from '../components/navigation/Brand.jsx'
import { SimulationBanner } from '../components/disclosures/SimulationBanner.jsx'
import { ThemeToggle } from '../components/ui/ThemeToggle.jsx'
import { StatusBadge } from '../components/ui/StatusBadge.jsx'
import { useProtocol } from '../features/protocol/ProtocolProvider.jsx'
import { useResource } from '../features/protocol/useResource.js'
import { RouteMotion } from '../motion/primitives.jsx'

const groups = [
  ['Mission control', [['/overview', 'Overview', LayoutDashboard]]],
  ['Network', [['/nodes', 'Nodes', Network]]],
  ['Composition', [['/blueprints', 'Blueprints', Braces], ['/service-blocks', 'Service blocks', Boxes]]],
  ['Protocol', [['/data-availability', 'Data availability', Database], ['/evidence', 'Evidence', FileCheck2]]],
  ['System', [['/system', 'Gateway & environment', Server]]],
]

function ConsoleNavigation({ onNavigate }) {
  return (
    <nav className="console-nav" aria-label="Console">
      {groups.map(([label, items]) => (
        <div className="console-nav__group" key={label}>
          <p>{label}</p>
          {items.map(([to, name, Icon]) => (
            <NavLink key={to} to={to} onClick={onNavigate}>
              <Icon aria-hidden="true" size={17} /> {name}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  )
}

export function ConsoleLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { environment } = useProtocol()
  const meta = useResource('meta')

  return (
    <div className="console-shell">
      <a className="skip-link" href="#console-content">Skip to console content</a>
      <SimulationBanner />
      <aside className={`console-sidebar ${mobileOpen ? 'is-open' : ''}`}>
        <div className="console-sidebar__brand">
          <Brand compact />
          <button type="button" className="icon-button console-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button>
        </div>
        <div className="console-sidebar__mode">
          <span>READ-ONLY EXPLORER</span>
          <StatusBadge state={environment.environment} />
        </div>
        <ConsoleNavigation onNavigate={() => setMobileOpen(false)} />
        <div className="console-sidebar__footer">
          <ShieldCheck aria-hidden="true" size={17} />
          <span>No wallet or economic controls</span>
        </div>
      </aside>

      <div className="console-main">
        <header className="console-header">
          <div className="console-header__identity">
            <button className="icon-button console-menu" type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button>
            <div>
              <span className="eyebrow">Environment</span>
              <strong>{environment.environment}</strong>
            </div>
          </div>
          <div className="console-header__status">
            <Activity aria-hidden="true" size={15} />
            <span>Gateway</span>
            <StatusBadge state={meta.error ? 'OFFLINE' : meta.loading ? 'UNKNOWN' : meta.result?.data?.gateway_status || 'UNKNOWN'} />
          </div>
          <div className="console-header__actions">
            <Link to="/">Protocol site</Link>
            <ThemeToggle />
          </div>
        </header>
        <main id="console-content" className="console-content"><RouteMotion><Outlet /></RouteMotion></main>
        <nav className="mobile-bottom-nav" aria-label="Mobile console">
          <NavLink to="/overview"><LayoutDashboard aria-hidden="true" />Overview</NavLink>
          <NavLink to="/nodes"><Network aria-hidden="true" />Nodes</NavLink>
          <NavLink to="/blueprints"><Braces aria-hidden="true" />Compose</NavLink>
          <NavLink to="/evidence"><FileCheck2 aria-hidden="true" />Evidence</NavLink>
          <button type="button" onClick={() => setMobileOpen(true)}><Menu aria-hidden="true" />More</button>
        </nav>
      </div>
    </div>
  )
}
