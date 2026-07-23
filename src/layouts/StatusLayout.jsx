import { ExternalLink } from 'lucide-react'
import { Link, Outlet } from 'react-router-dom'
import { Brand } from '../components/navigation/Brand.jsx'
import { SimulationBanner } from '../components/disclosures/SimulationBanner.jsx'
import { ThemeToggle } from '../components/ui/ThemeToggle.jsx'

export function StatusLayout() {
  return (
    <div className="status-shell">
      <a className="skip-link" href="#status-content">Skip to status content</a>
      <SimulationBanner />
      <header className="status-nav">
        <Brand to="/status" />
        <span className="status-nav__title">VERIFICATION STATUS</span>
        <div>
          <a href="https://github.com/GodOfAgents/VAMS">Source <ExternalLink aria-hidden="true" size={13} /></a>
          <Link to="/overview">Console</Link>
          <ThemeToggle />
        </div>
      </header>
      <main id="status-content"><Outlet /></main>
    </div>
  )
}
