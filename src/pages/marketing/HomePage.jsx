import { ArrowDown, ArrowRight, Boxes, Braces, Cpu, FileCheck2, Globe2, ShieldCheck } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LifecycleEnhancer } from '../../components/marketing/LifecycleEnhancer.jsx'
import { MarketingVisual } from '../../components/marketing/MarketingVisual.jsx'
import { ArchitectureDiagram } from '../../components/marketing/ArchitectureDiagram.jsx'
import { ClaimStatus } from '../../components/ui/ClaimStatus.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { MagneticLink, Reveal, SmokeText, StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'

const lifecycle = [
  ['01', 'Express intent', 'Request an outcome with clear authority.'],
  ['02', 'Set boundaries', 'Apply consent, policy, permissions, and revocation first.'],
  ['03', 'Compose resources', 'Select the capabilities and providers the service needs.'],
  ['04', 'Execute safely', 'Preserve progress while controlling irreversible effects.'],
  ['05', 'Produce evidence', 'Record what happened and what can be verified.'],
  ['06', 'Settle responsibility', 'Connect accepted work to payment and accountability.'],
  ['07', 'Recover or migrate', 'Resume on an eligible provider without losing authority.'],
]

const architecture = [
  [ShieldCheck, 'Heart', 'Consent, policy, authority, and revocation'],
  [Braces, 'Brain', 'Planning and coordination within those boundaries'],
  [Boxes, 'Service Blocks', 'Replaceable capabilities with declared requirements'],
  [FileCheck2, 'Sentinel', 'Independent observations and challenge signals'],
  [Cpu, 'Durable runtime', 'Authenticated state, memory, and recovery'],
  [Globe2, 'Portable infrastructure', 'Compute, storage, models, and verification'],
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
              triggerOnView
              onRevealComplete={triggerProofWave}
              phrases={['Sovereign', 'infrastructure for', 'enduring services.']}
            />
            <Reveal delay={0.5}>
              <p className="hero__lede">VAMS helps digital services keep their identity, authority, and state—even when infrastructure changes.</p>
            </Reveal>
            <Reveal className="hero__actions" delay={0.58}>
              <MagneticLink className="button" to="/overview">Open read-only console <ArrowRight aria-hidden="true" size={17} /></MagneticLink>
              <MagneticLink className="button button--ghost" to="/protocol">Understand VAMS</MagneticLink>
            </Reveal>
          </div>
        </div>
        <div className="hero__scroll"><ArrowDown aria-hidden="true" /> Inspect the stack</div>
      </section>

      <StaggerGroup as="section" className="protocol-strip" aria-label="Protocol lifecycle state">
        <StaggerItem><span>Architecture</span><strong>v0.8.0</strong></StaggerItem>
        <StaggerItem><span>Lifecycle</span><strong>Hardened pre-testnet</strong></StaggerItem>
        <StaggerItem><span>Current mode</span><strong>Research and development</strong></StaggerItem>
        <StaggerItem><span>Public surface</span><strong>Read-only</strong></StaggerItem>
      </StaggerGroup>

      <Reveal as="section" className="editorial-section continuity-section">
        <ArchitectureDiagram variant="continuity" />
      </Reveal>

      <section className="editorial-section lifecycle-section" data-scene-chapter="lifecycle" ref={lifecycleRef}>
        <Reveal className="section-heading">
          <p className="eyebrow">The execution lifecycle</p>
          <SmokeText as="h2" className="smoke-text--heading" mode="words" triggerOnView phrases={['From intent to continuity.']} />
          <p>One visible path from request to recovery.</p>
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
          <SmokeText as="h2" className="smoke-text--heading" mode="words" triggerOnView phrases={['Clear roles. Clear boundaries.']} />
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
          <SmokeText as="h2" className="smoke-text--heading" mode="words" triggerOnView phrases={['Know what is proven.']} />
          <p>Built, tested, deployed, and observed are different proof states.</p>
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
          <StaggerItem><Link to="/build"><span className="journey-grid__index">01</span><h3>Builders</h3><p>Explore blueprints and portable services.</p><span className="journey-grid__cta">Build the future <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
          <StaggerItem><Link to="/operate"><span className="journey-grid__index">02</span><h3>Operators</h3><p>Review requirements and release gates.</p><span className="journey-grid__cta">Operate the future <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
          <StaggerItem><Link to="/protocol"><span className="journey-grid__index">03</span><h3>Organizations</h3><p>Understand continuity and accountability.</p><span className="journey-grid__cta">Shape future Web <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
          <StaggerItem><Link to="/research"><span className="journey-grid__index">04</span><h3>Researchers</h3><p>Trace claims to sources and evidence.</p><span className="journey-grid__cta">Research future Web <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
        </StaggerGroup>
      </section>

      <Reveal as="section" className="final-cta" data-scene-chapter="cta">
        <p className="eyebrow">The destination</p>
        <SmokeText as="h2" className="smoke-text--heading" mode="words" triggerOnView phrases={['Services that outlive their infrastructure.']} />
        <div>
          <MagneticLink className="button button--inverse" to="/overview">Open console</MagneticLink>
          <Link className="button button--outline-light" to="/research">Inspect research</Link>
        </div>
      </Reveal>
    </div>
  )
}
