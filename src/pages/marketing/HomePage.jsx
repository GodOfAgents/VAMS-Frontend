import { ArrowDown, ArrowRight, Boxes, Braces, Cpu, FileCheck2, Globe2, ShieldCheck } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LifecycleEnhancer } from '../../components/marketing/LifecycleEnhancer.jsx'
import { MarketingVisual } from '../../components/marketing/MarketingVisual.jsx'
import { ClaimStatus } from '../../components/ui/ClaimStatus.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { MagneticLink, Reveal, SmokeText, StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'

const lifecycle = [
  ['01', 'Express intent', 'A person, organization, application, or agent requests an outcome with relevant authority.'],
  ['02', 'Constrain before effect', 'Heart evaluates consent, permissions, policy, revocation, and protected boundaries.'],
  ['03', 'Compose resources', 'Brain selects eligible Service Blocks, infrastructure, data, and execution routes.'],
  ['04', 'Execute and preserve state', 'The runtime records supported progress and isolates irreversible effects behind explicit controls.'],
  ['05', 'Produce evidence', 'Sentinel and protocol verifiers assess the claims needed for acceptance or recovery.'],
  ['06', 'Settle responsibility', 'Payments, bonds, insurance, reputation, and governance respond to accepted work.'],
  ['07', 'Recover or migrate', 'An eligible replacement resumes authenticated state under the same authority and obligations.'],
]

const architecture = [
  [ShieldCheck, 'Heart', 'Consent, authority, policy, revocation, and pre-effect boundaries'],
  [Braces, 'Brain', 'Reasoning, planning, discovery, and coordination within permitted bounds'],
  [Boxes, 'Service Blocks', 'Replaceable capabilities with declared requirements and evidence obligations'],
  [FileCheck2, 'Sentinel', 'Independent observations, challenges, provenance, and bounded trust signals'],
  [Cpu, 'Durable runtime', 'Authenticated progress, memory, authority, and recovery information'],
  [Globe2, 'Portable infrastructure', 'Compute, storage, networking, models, and verification across providers'],
]

export function HomePage() {
  const lifecycleRef = useRef(null)
  const [proofSignal, setProofSignal] = useState(0)
  const triggerProofWave = useCallback(() => setProofSignal(1), [])

  return (
    <div className="marketing-home">
      <MarketingVisual proofSignal={proofSignal} />
      <section className="hero" data-scene-chapter="intro">
        <div className="hero__content">
          <div className="hero__copy">
            <Reveal delay={0.05}><StatusBadge state="DEPLOYMENT_PENDING" prefix="Hardened pre-testnet candidate" /></Reveal>
            <Reveal delay={0.12}><p className="hero__kicker">VERIFIABLE AGENTIC MODULAR STACK</p></Reveal>
            <SmokeText
              mode="words"
              onRevealComplete={triggerProofWave}
              phrases={['Sovereign', 'infrastructure for', 'enduring services.']}
            />
            <Reveal delay={0.5}>
              <p className="hero__lede">VAMS is building a sovereign Web4 protocol for services whose identity, authority, state, and legitimate work can continue across independent infrastructure.</p>
            </Reveal>
            <Reveal className="hero__actions" delay={0.58}>
              <MagneticLink className="button" to="/overview">Explore the network <ArrowRight aria-hidden="true" size={17} /></MagneticLink>
              <MagneticLink className="button button--ghost" to="/protocol">Understand VAMS</MagneticLink>
            </Reveal>
          </div>
        </div>
        <div className="hero__scroll"><ArrowDown aria-hidden="true" /> Inspect the stack</div>
      </section>

      <StaggerGroup as="section" className="protocol-strip" aria-label="Protocol lifecycle state">
        <StaggerItem><span>Architecture</span><strong>v0.8.0</strong></StaggerItem>
        <StaggerItem><span>Lifecycle</span><strong>Hardened pre-testnet</strong></StaggerItem>
        <StaggerItem><span>Current mode</span><strong>Active research and development</strong></StaggerItem>
        <StaggerItem><span>Public surface</span><strong>Read-only and evidence-led</strong></StaggerItem>
      </StaggerGroup>

      <section className="editorial-section lifecycle-section" data-scene-chapter="lifecycle" ref={lifecycleRef}>
        <Reveal className="section-heading">
          <p className="eyebrow">The execution lifecycle</p>
          <h2>From human intent to accountable continuity.</h2>
          <p>VAMS links authority, execution, evidence, economics, and recovery into one inspectable service lifecycle.</p>
        </Reveal>
        <div className="lifecycle-list-wrap">
          <div className="lifecycle-track" aria-hidden="true"><span className="lifecycle-progress__bar" /></div>
          <StaggerGroup as="ol" className="lifecycle-list">
            {lifecycle.map(([number, title, detail]) => (
              <StaggerItem as="li" key={number} data-lifecycle-step={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p></StaggerItem>
            ))}
          </StaggerGroup>
        </div>
        <LifecycleEnhancer scopeRef={lifecycleRef} />
      </section>

      <section className="editorial-section editorial-section--bordered" data-scene-chapter="architecture">
        <Reveal className="section-heading">
          <p className="eyebrow">Architecture boundaries</p>
          <h2>One service lifecycle. Explicit authority boundaries.</h2>
        </Reveal>
        <StaggerGroup className="architecture-grid">
          {architecture.map(([Icon, title, detail]) => (
            <StaggerItem as="article" key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{detail}</p></StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="evidence-feature" data-scene-chapter="evidence">
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

      <section className="journey-section" data-scene-chapter="journey">
        <Reveal><p className="eyebrow">Choose your entry point</p></Reveal>
        <StaggerGroup className="journey-grid">
          <StaggerItem><Link to="/build"><span>01</span><h3>Application team</h3><p>Explore portable services, blueprints, and composition.</p></Link></StaggerItem>
          <StaggerItem><Link to="/operate"><span>02</span><h3>Infrastructure operator</h3><p>Review participation requirements and release gates.</p></Link></StaggerItem>
          <StaggerItem><Link to="/protocol"><span>03</span><h3>Enterprise or institution</h3><p>Inspect continuity, sovereignty, and accountability boundaries.</p></Link></StaggerItem>
          <StaggerItem><Link to="/research"><span>04</span><h3>Researcher or auditor</h3><p>Trace ambitious claims to specifications and evidence.</p></Link></StaggerItem>
        </StaggerGroup>
      </section>

      <Reveal as="section" className="final-cta" data-scene-chapter="cta">
        <p className="eyebrow">The destination</p>
        <h2>A web where our work can endure, our intelligence can evolve, and our sovereignty remains our own.</h2>
        <div>
          <MagneticLink className="button button--inverse" to="/overview">Open console</MagneticLink>
          <Link className="button button--outline-light" to="/research">Inspect research</Link>
        </div>
      </Reveal>
    </div>
  )
}
