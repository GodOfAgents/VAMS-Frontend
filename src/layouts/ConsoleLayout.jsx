import {
  Activity, Boxes, Braces, Database, FileCheck2, LayoutDashboard,
  Menu, Network, Server, ShieldCheck, X,
} from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { useRef, useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Brand } from '../components/navigation/Brand.jsx'
import { SimulationBanner } from '../components/disclosures/SimulationBanner.jsx'
import { StatusBadge } from '../components/ui/StatusBadge.jsx'
import { MotionPreferenceToggle } from '../components/ui/MotionPreferenceToggle.jsx'
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
  const dialogOpener = useRef(null)
  const { environment } = useProtocol()
  const meta = useResource('meta')
  const gatewayStatus = meta.error?.details?.code === 'GATEWAY_NOT_CONFIGURED'
    ? 'NOT_CONFIGURED'
    : meta.error ? 'OFFLINE' : meta.loading ? 'UNKNOWN' : meta.result?.data?.gateway_status || 'UNKNOWN'

  return (
    <Dialog.Root open={mobileOpen} onOpenChange={setMobileOpen}>
    <div className="console-shell">
      <a className="skip-link" href="#console-content">Skip to console content</a>
      <SimulationBanner />
      <aside className="console-sidebar">
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
            <Dialog.Trigger asChild><button className="icon-button console-menu" type="button" aria-label="Open navigation" onClick={(event) => { dialogOpener.current = event.currentTarget }}><Menu /></button></Dialog.Trigger>
            <div>
              <span className="eyebrow">Environment</span>
              <strong>{environment.environment}</strong>
            </div>
          </div>
          <div className="console-header__status">
            <Activity aria-hidden="true" size={15} />
            <span>Gateway</span>
            <StatusBadge state={gatewayStatus} />
          </div>
          <div className="console-header__actions">
            <MotionPreferenceToggle />
            <Link to="/">Protocol site</Link>
          </div>
        </header>
        <main id="console-content" className="console-content"><RouteMotion><Outlet /></RouteMotion></main>
        <nav className="mobile-bottom-nav" aria-label="Mobile console">
          <NavLink to="/overview"><LayoutDashboard aria-hidden="true" />Overview</NavLink>
          <NavLink to="/nodes"><Network aria-hidden="true" />Nodes</NavLink>
          <NavLink to="/blueprints"><Braces aria-hidden="true" />Compose</NavLink>
          <NavLink to="/evidence"><FileCheck2 aria-hidden="true" />Evidence</NavLink>
          <Dialog.Trigger asChild><button type="button" onClick={(event) => { dialogOpener.current = event.currentTarget }}><Menu aria-hidden="true" />More</button></Dialog.Trigger>
        </nav>
      </div>
      <Dialog.Portal>
        <Dialog.Overlay className="console-dialog-overlay" />
        <Dialog.Content className="console-dialog-content" aria-describedby="console-navigation-description" onCloseAutoFocus={(event) => {
          if (!dialogOpener.current) return
          event.preventDefault()
          dialogOpener.current.focus()
          dialogOpener.current = null
        }}>
          <Dialog.Title className="sr-only">Console navigation</Dialog.Title>
          <Dialog.Description id="console-navigation-description" className="sr-only">Read-only VAMS explorer sections.</Dialog.Description>
          <div className="console-sidebar__brand"><Brand compact /><Dialog.Close asChild><button type="button" className="icon-button console-close" aria-label="Close navigation"><X /></button></Dialog.Close></div>
          <div className="console-sidebar__mode"><span>READ-ONLY EXPLORER</span><StatusBadge state={environment.environment} /></div>
          <ConsoleNavigation onNavigate={() => setMobileOpen(false)} />
          <div className="console-sidebar__footer"><ShieldCheck aria-hidden="true" size={17} /><span>No wallet or economic controls</span></div>
        </Dialog.Content>
      </Dialog.Portal>
    </div>
    </Dialog.Root>
  )
}
