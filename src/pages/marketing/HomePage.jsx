import { ArrowDown, ArrowRight, Boxes, Braces, Cpu, FileCheck2, Globe2, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { MarketingVisual } from '../../components/marketing/MarketingVisual.jsx'
import { ClaimStatus } from '../../components/ui/ClaimStatus.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'

const lifecycle = [
  ['01', 'Discover resources', 'Inspect public node capabilities, trust posture, and freshness.'],
  ['02', 'Compose infrastructure', 'Match compute, cognition, services, geography, and budget.'],
  ['03', 'Launch agent runtime', 'A future gated action—not exposed by this read-only profile.'],
  ['04', 'Verify execution', 'Attach proofs, telemetry, and identity to runtime claims.'],
  ['05', 'Anchor evidence', 'Route state through explicit data-availability boundaries.'],
  ['06', 'Coordinate economics', 'Settlement remains disabled until independent release gates pass.'],
]

const architecture = [
  [Cpu, 'EVM execution', 'Polygon Amoy target · deployment pending'],
  [ShieldCheck, 'Governance and identity', 'Cardano Pre-Prod target · deployment pending'],
  [Globe2, 'Neuron runtime', 'Sovereign agent compute and telemetry boundary'],
  [Braces, 'Cognitive composer', 'Explainable six-axis and CHC resource matching'],
  [Boxes, 'Gateway control plane', 'Versioned explorer contracts and capability negotiation'],
  [FileCheck2, 'Read-only frontend', 'Inspection, simulation, provenance, and evidence'],
]

export function HomePage() {
  return (
    <>
      <section className="hero">
        <MarketingVisual />
        <div className="hero__content">
          <StatusBadge state="DEPLOYMENT_PENDING" prefix="Hardened pre-testnet candidate" />
          <p className="hero__kicker">VERIFIABLE AGENTIC MODULAR STACK</p>
          <h1>Verifiable infrastructure for <em>autonomous agents.</em></h1>
          <p className="hero__lede">Discover, compose, execute, verify, and coordinate agent infrastructure across decentralized networks—without hiding the operational evidence.</p>
          <div className="hero__actions">
            <Link className="button" to="/overview">Explore the network <ArrowRight aria-hidden="true" size={17} /></Link>
            <Link className="button button--ghost" to="/build">Build on VAMS</Link>
          </div>
        </div>
        <div className="hero__scroll"><ArrowDown aria-hidden="true" /> Inspect the stack</div>
      </section>

      <section className="protocol-strip" aria-label="Protocol lifecycle state">
        <div><span>Gateway</span><strong>Evidence required</strong></div>
        <div><span>Execution target</span><strong>Polygon Amoy</strong></div>
        <div><span>Governance target</span><strong>Cardano Pre-Prod</strong></div>
        <div><span>Interaction profile</span><strong>Read-only</strong></div>
      </section>

      <section className="editorial-section">
        <div className="section-heading">
          <p className="eyebrow">The execution lifecycle</p>
          <h2>From resource discovery to verifiable evidence.</h2>
          <p>VAMS treats infrastructure composition as a traceable sequence, not a collection of disconnected protocol layers.</p>
        </div>
        <ol className="lifecycle-list">
          {lifecycle.map(([number, title, detail]) => (
            <li key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p></li>
          ))}
        </ol>
      </section>

      <section className="editorial-section editorial-section--bordered">
        <div className="section-heading">
          <p className="eyebrow">Architecture boundaries</p>
          <h2>One system. Explicit trust boundaries.</h2>
        </div>
        <div className="architecture-grid">
          {architecture.map(([Icon, title, detail]) => (
            <article key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{detail}</p></article>
          ))}
        </div>
      </section>

      <section className="evidence-feature">
        <div className="evidence-feature__intro">
          <p className="eyebrow">Trust and evidence</p>
          <h2>Every important claim should carry its proof state.</h2>
          <p>Implementation, local verification, CI verification, deployment verification, independent review, and live observation remain distinct.</p>
          <Link className="text-link" to="/status">Inspect verification status <ArrowRight aria-hidden="true" size={15} /></Link>
        </div>
        <div className="claim-stack">
          <ClaimStatus claim="Polygon Amoy execution" state="DEPLOYMENT_PENDING" source="VAMS architecture profile" detail="Execution architecture is specified; public deployment evidence is not supplied." />
          <ClaimStatus claim="Cardano Pre-Prod governance" state="DEPLOYMENT_PENDING" source="VAMS architecture profile" detail="Governance, identity, and insurance target Cardano; deployment is not claimed." />
          <ClaimStatus claim="Economic actions" state="BLOCKED" source="Read-only frontend profile" detail="Wallet, payments, staking, rewards, governance, and insurance controls are absent by design." />
        </div>
      </section>

      <section className="journey-section">
        <p className="eyebrow">Choose your entry point</p>
        <div className="journey-grid">
          <Link to="/build"><span>01</span><h3>Agent developer</h3><p>Explore blueprints and simulate composition.</p></Link>
          <Link to="/operate"><span>02</span><h3>Node operator</h3><p>Review requirements and release gates.</p></Link>
          <Link to="/protocol"><span>03</span><h3>Institution</h3><p>Inspect sovereignty and security boundaries.</p></Link>
          <Link to="/research"><span>04</span><h3>Researcher or auditor</h3><p>Trace specifications to evidence.</p></Link>
        </div>
      </section>

      <section className="final-cta">
        <p className="eyebrow">Sovereign by construction</p>
        <h2>Build agents that do not depend on a single cloud, chain, or operator.</h2>
        <div>
          <Link className="button button--inverse" to="/overview">Open console</Link>
          <Link className="button button--outline-light" to="/research">Inspect research</Link>
        </div>
      </section>
    </>
  )
}
