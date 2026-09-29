import { ArrowDown, ArrowRight, Boxes, Braces, Cpu, FileCheck2, Globe2, ShieldCheck } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { LifecycleEnhancer } from '../../components/marketing/LifecycleEnhancer.jsx'
import { MarketingVisual } from '../../components/marketing/MarketingVisual.jsx'
import { ArchitectureDiagram } from '../../components/marketing/ArchitectureDiagram.jsx'
import { ArchitectureFocus } from '../../components/marketing/ArchitectureFocus.jsx'
import { ClaimStatus } from '../../components/ui/ClaimStatus.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { MagneticLink, Reveal, SmokeText, StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'
import { ExpandingChapter } from '../../motion/ExpandingChapter.jsx'

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
  const architectureRef = useRef(null)
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
              phrases={['Web 4.0 for', 'services that', 'outlive their host.']}
            />
            <Reveal delay={0.5}>
              <p className="hero__lede">VAMS is active research and development for a sovereign, agent-capable Web 4.0, where applications, services, and agents can carry identity, authority, and legitimate work across infrastructure changes.</p>
            </Reveal>
            <Reveal className="hero__actions" delay={0.58}>
              <MagneticLink className="button" to="/protocol">Inspect the architecture <ArrowRight aria-hidden="true" size={17} /></MagneticLink>
              <MagneticLink className="button button--ghost" to="/status">Review the evidence</MagneticLink>
            </Reveal>
          </div>
        </div>
        <div className="hero__scroll"><ArrowDown aria-hidden="true" /> Explore the exit test</div>
      </section>

      <StaggerGroup as="section" className="protocol-strip" aria-label="Protocol lifecycle state">
        <StaggerItem><span>Architecture</span><strong>v0.8.0</strong></StaggerItem>
        <StaggerItem><span>Lifecycle</span><strong>Hardened pre-testnet</strong></StaggerItem>
        <StaggerItem><span>Current mode</span><strong>Research and development</strong></StaggerItem>
        <StaggerItem><span>Public surface</span><strong>Read-only</strong></StaggerItem>
      </StaggerGroup>

      <ExpandingChapter className="editorial-section continuity-section">
        <ArchitectureDiagram variant="continuity" />
      </ExpandingChapter>

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

      <section className="editorial-section editorial-section--bordered" data-scene-chapter="architecture" ref={architectureRef}>
        <Reveal className="section-heading">
          <p className="eyebrow">Architecture boundaries</p>
          <SmokeText as="h2" className="smoke-text--heading" mode="words" triggerOnView phrases={['Clear roles. Clear boundaries.']} />
        </Reveal>
        <StaggerGroup className="architecture-grid">
          {architecture.map(([Icon, title, detail]) => (
            <StaggerItem as="article" key={title}><Icon aria-hidden="true" /><h3>{title}</h3><p>{detail}</p></StaggerItem>
          ))}
        </StaggerGroup>
        <ArchitectureFocus scopeRef={architectureRef} />
      </section>

      <section className="evidence-feature" data-scene-chapter="evidence">
        <Reveal className="evidence-feature__intro">
          <p className="eyebrow">Trust, evidence, and research</p>
          <SmokeText as="h2" className="smoke-text--heading" mode="words" triggerOnView phrases={['Know what is proven.']} />
          <p>Built, tested, deployed, and observed are different proof states. Research includes post-quantum cryptographic migration for long-lived identities and history; this remains work in progress, not a delivered security guarantee.</p>
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
          <StaggerItem><Link to="/build"><span className="journey-grid__index">01</span><h3>Builders</h3><p>Create reusable capabilities and portable services.</p><span className="journey-grid__cta">Build the future <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
          <StaggerItem><Link to="/operate"><span className="journey-grid__index">02</span><h3>Operators</h3><p>Explore independent infrastructure and accountable service commitments.</p><span className="journey-grid__cta">Operate the future <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
          <StaggerItem><Link to="/protocol"><span className="journey-grid__index">03</span><h3>Organizations</h3><p>Understand continuity, authority, and choice across providers.</p><span className="journey-grid__cta">Shape the future web <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
          <StaggerItem><Link to="/research"><span className="journey-grid__index">04</span><h3>Researchers</h3><p>Trace claims, challenge assumptions, and follow open research.</p><span className="journey-grid__cta">Contribute to future Web4 <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
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
