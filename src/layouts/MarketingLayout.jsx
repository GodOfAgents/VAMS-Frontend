import { Outlet } from 'react-router-dom'
import { SimulationBanner } from '../components/disclosures/SimulationBanner.jsx'
import { MarketingNav } from '../components/navigation/MarketingNav.jsx'
import { SiteFooter } from '../components/navigation/SiteFooter.jsx'
import { GooCursor } from '../motion/GooCursor.jsx'
import { LiquidGlass } from '../motion/liquidGlass.jsx'
import { RouteMotion } from '../motion/primitives.jsx'
import '../styles/marketing.css'
import '../styles/topics.css'
import '../styles/research.css'

export function MarketingLayout() {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <SimulationBanner />
      <MarketingNav />
      <main id="main-content" className="site-main"><RouteMotion><Outlet /></RouteMotion></main>
      <SiteFooter />
      <LiquidGlass />
      <GooCursor />
    </div>
  )
}
