import { ArrowDown, ArrowRight, Boxes, Braces, Cpu, FileCheck2, Globe2, ShieldCheck } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LifecycleEnhancer } from '../../components/marketing/LifecycleEnhancer.jsx'
import { MarketingVisual } from '../../components/marketing/MarketingVisual.jsx'
import { ClaimStatus } from '../../components/ui/ClaimStatus.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { MagneticLink, Reveal, SmokeText, StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'

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
  const lifecycleRef = useRef(null)
  const [proofSignal, setProofSignal] = useState(0)
  const triggerProofWave = useCallback(() => setProofSignal(1), [])

  return (
    <>
      <section className="hero">
        <MarketingVisual proofSignal={proofSignal} />
        <div className="hero__content">
          <div className="hero__copy">
            <Reveal delay={0.05}><StatusBadge state="DEPLOYMENT_PENDING" prefix="Hardened pre-testnet candidate" /></Reveal>
            <Reveal delay={0.12}><p className="hero__kicker">VERIFIABLE AGENTIC MODULAR STACK</p></Reveal>
            <SmokeText
              mode="words"
              onRevealComplete={triggerProofWave}
              phrases={['Verifiable', 'infrastructure for', 'autonomous agents.']}
            />
            <Reveal delay={0.5}>
              <p className="hero__lede">Discover, compose, execute, verify, and coordinate agent infrastructure across decentralized networks—without hiding the operational evidence.</p>
            </Reveal>
            <Reveal className="hero__actions" delay={0.58}>
              <MagneticLink className="button" to="/overview">Explore the network <ArrowRight aria-hidden="true" size={17} /></MagneticLink>
              <MagneticLink className="button button--ghost" to="/build">Build on VAMS</MagneticLink>
            </Reveal>
          </div>
        </div>
        <div className="hero__scroll"><ArrowDown aria-hidden="true" /> Inspect the stack</div>
      </section>

      <StaggerGroup as="section" className="protocol-strip" aria-label="Protocol lifecycle state">
        <StaggerItem><span>Gateway</span><strong>Evidence required</strong></StaggerItem>
        <StaggerItem><span>Execution target</span><strong>Polygon Amoy</strong></StaggerItem>
        <StaggerItem><span>Governance target</span><strong>Cardano Pre-Prod</strong></StaggerItem>
        <StaggerItem><span>Interaction profile</span><strong>Read-only</strong></StaggerItem>
      </StaggerGroup>

      <section className="editorial-section lifecycle-section" ref={lifecycleRef}>
        <Reveal className="section-heading">
          <p className="eyebrow">The execution lifecycle</p>
          <h2>From resource discovery to verifiable evidence.</h2>
          <p>VAMS treats infrastructure composition as a traceable sequence, not a collection of disconnected protocol layers.</p>
        </Reveal>
        <div className="lifecycle-list-wrap">
          <div className="lifecycle-track" aria-hidden="true"><span className="lifecycle-progress__bar" /></div>
          <StaggerGroup as="ol" className="lifecycle-list">
            {lifecycle.map(([number, title, detail]) => (
              <StaggerItem as="li" key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p></StaggerItem>
            ))}
          </StaggerGroup>
        </div>
        <LifecycleEnhancer scopeRef={lifecycleRef} />
      </section>

      <section className="editorial-section editorial-section--bordered">
        <Reveal className="section-heading">
          <p className="eyebrow">Architecture boundaries</p>
          <h2>One system. Explicit trust boundaries.</h2>
        </Reveal>
        <StaggerGroup className="architecture-grid">
          {architecture.map(([Icon, title, detail]) => (
            <StaggerItem as="article" key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{detail}</p></StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="evidence-feature">
        <Reveal className="evidence-feature__intro">
          <p className="eyebrow">Trust and evidence</p>
          <h2>Every important claim should carry its proof state.</h2>
          <p>Implementation, local verification, CI verification, deployment verification, independent review, and live observation remain distinct.</p>
          <Link className="text-link" to="/status">Inspect verification status <ArrowRight aria-hidden="true" size={15} /></Link>
        </Reveal>
        <StaggerGroup className="claim-stack">
          <StaggerItem><ClaimStatus claim="Polygon Amoy execution" state="DEPLOYMENT_PENDING" source="VAMS architecture profile" detail="Execution architecture is specified; public deployment evidence is not supplied." /></StaggerItem>
          <StaggerItem><ClaimStatus claim="Cardano Pre-Prod governance" state="DEPLOYMENT_PENDING" source="VAMS architecture profile" detail="Governance, identity, and insurance target Cardano; deployment is not claimed." /></StaggerItem>
          <StaggerItem><ClaimStatus claim="Economic actions" state="BLOCKED" source="Read-only frontend profile" detail="Wallet, payments, staking, rewards, governance, and insurance controls are absent by design." /></StaggerItem>
        </StaggerGroup>
      </section>

      <section className="journey-section">
        <Reveal><p className="eyebrow">Choose your entry point</p></Reveal>
        <StaggerGroup className="journey-grid">
          <StaggerItem><Link to="/build"><span>01</span><h3>Agent developer</h3><p>Explore blueprints and simulate composition.</p></Link></StaggerItem>
          <StaggerItem><Link to="/operate"><span>02</span><h3>Node operator</h3><p>Review requirements and release gates.</p></Link></StaggerItem>
          <StaggerItem><Link to="/protocol"><span>03</span><h3>Institution</h3><p>Inspect sovereignty and security boundaries.</p></Link></StaggerItem>
          <StaggerItem><Link to="/research"><span>04</span><h3>Researcher or auditor</h3><p>Trace specifications to evidence.</p></Link></StaggerItem>
        </StaggerGroup>
      </section>

      <Reveal as="section" className="final-cta">
        <p className="eyebrow">Sovereign by construction</p>
        <h2>Build agents that do not depend on a single cloud, chain, or operator.</h2>
        <div>
          <MagneticLink className="button button--inverse" to="/overview">Open console</MagneticLink>
          <Link className="button button--outline-light" to="/research">Inspect research</Link>
        </div>
      </Reveal>
    </>
  )
}
