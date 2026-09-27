import { ArrowDown, ArrowRight, ArrowUpRight, Boxes, Braces, Cpu, FileCheck2, Globe2, ShieldCheck } from 'lucide-react'
import { useRef } from 'react'
import { useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { Link } from 'react-router-dom'
import { ArchitectureOrbit } from '../../components/marketing/ArchitectureOrbit.jsx'
import { HorizonBackdrop } from '../../components/marketing/HorizonBackdrop.jsx'
import { LifecycleTimeline } from '../../components/marketing/LifecycleTimeline.jsx'
import { ClaimStatus } from '../../components/ui/ClaimStatus.jsx'
import { SectionHeading } from '../../components/ui/SectionHeading.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { MagneticLink, Reveal, SmokeText, StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'
import { ExpandingPanel, TiltIn, useStageProgress } from '../../motion/scroll.jsx'

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

function Hero() {
  return (
    <section className="hero">
      <div className="hero__backdrop" aria-hidden="true" />
      <div className="hero__inner wrap">
        <Reveal className="hero__badge" delay={0.05}><StatusBadge state="DEPLOYMENT_PENDING" prefix="Hardened pre-testnet candidate" /></Reveal>
        <Reveal delay={0.12}><p className="hero__kicker">VERIFIABLE AGENTIC MODULAR STACK</p></Reveal>
        <SmokeText
          className="hero__title"
          delay={0.16}
          mode="words"
          phrases={['Sovereign', 'infrastructure for', 'enduring services.']}
        />
        <Reveal delay={0.46}>
          <p className="hero__lede">VAMS is building a sovereign Web4 protocol for services whose identity, authority, state, and legitimate work can continue across independent infrastructure.</p>
        </Reveal>
        <Reveal className="hero__actions" delay={0.56}>
          <MagneticLink className="button" to="/overview">Explore the network <ArrowRight aria-hidden="true" size={16} /></MagneticLink>
          <MagneticLink className="button button--ghost" to="/protocol">Understand VAMS</MagneticLink>
        </Reveal>
      </div>
    </section>
  )
}

const protocolFacts = [
  ['Architecture', 'v0.8.0'],
  ['Lifecycle', 'Hardened pre-testnet'],
  ['Current mode', 'Active research and development'],
  ['Public surface', 'Read-only and evidence-led'],
]

// Scroll choreography for the pinned horizon stage (fractions of the stage scroll).
const stageTimeline = {
  desktop: { open: [0.06, 0.54], rise: [0.02, 0.62], facts: 0.58, factSpan: 0.1, factStep: 0.05, cue: [0.8, 0.9] },
  mobile: { open: [0.04, 0.6], rise: [0.02, 0.66], facts: 0.62, factSpan: 0.1, factStep: 0.045, cue: [0.82, 0.92] },
}

function StageFact({ animated, index, label, progress, timeline, value }) {
  const start = timeline.facts + index * timeline.factStep
  const range = [start, start + timeline.factSpan]
  const opacity = useTransform(progress, range, [0, 1])
  const y = useTransform(progress, range, [28, 0])
  const scale = useTransform(progress, range, [0.96, 1])

  return (
    <m.div style={animated ? { opacity, y, scale } : undefined}>
      <span>{label}</span><strong>{value}</strong>
    </m.div>
  )
}

function HorizonStage() {
  const stageRef = useRef(null)
  const { progress, reducedMotion, isMobile } = useStageProgress(stageRef)
  const timeline = isMobile ? stageTimeline.mobile : stageTimeline.desktop
  const inset = isMobile ? 3 : 4.5
  const clipPath = useTransform(progress, timeline.open, [`inset(0% ${inset}% 0% ${inset}% round 28px)`, 'inset(0% 0% 0% 0% round 0px)'])
  const rise = useTransform(progress, timeline.rise, ['44px', '0px'])
  const glow = useTransform(progress, timeline.rise, [0.4, 1])
  const cue = useTransform(progress, timeline.cue, [0, 1])
  const animated = !reducedMotion

  return (
    <div className={`stage${animated ? ' stage--animated' : ''}`} ref={stageRef}>
      <div className="stage__sticky">
        <m.div className="stage__card" data-theme="dark" style={animated ? { clipPath, '--horizon-rise': rise, '--horizon-glow': glow } : undefined}>
          <HorizonBackdrop variant="stage" />
          <div className="stage__content wrap">
            <section className="protocol-strip" aria-label="Protocol lifecycle state">
              {protocolFacts.map(([label, value], index) => (
                <StageFact animated={animated} index={index} key={label} label={label} progress={progress} timeline={timeline} value={value} />
              ))}
            </section>
            <m.div className="hero__scroll" style={animated ? { opacity: cue } : undefined}><ArrowDown aria-hidden="true" size={14} /> Inspect the stack</m.div>
          </div>
        </m.div>
      </div>
    </div>
  )
}

function LifecycleSection() {
  return (
    <section className="home-section lifecycle-section">
      <div className="wrap lifecycle-section__grid">
        <div className="lifecycle-section__intro">
          <SectionHeading
            eyebrow="The execution lifecycle"
            title={['From human intent to accountable continuity.']}
            aside="VAMS links authority, execution, evidence, economics, and recovery into one inspectable service lifecycle."
          />
        </div>
        <LifecycleTimeline steps={lifecycle} />
      </div>
    </section>
  )
}

function ArchitectureSection() {
  return (
    <section className="home-section architecture-section">
      <div className="wrap">
        <SectionHeading
          eyebrow="Architecture boundaries"
          title={['One service lifecycle.', 'Explicit authority boundaries.']}
          tone="split"
        />
        <ArchitectureOrbit items={architecture} />
      </div>
    </section>
  )
}

function EvidenceSection() {
  return (
    <section className="home-section evidence-section">
      <div className="wrap evidence-section__grid">
        <div className="evidence-section__intro">
          <SectionHeading
            eyebrow="Trust and evidence"
            title={['Every important claim should carry its proof state.']}
            aside="Implementation, local verification, CI verification, deployment verification, independent review, and live observation remain distinct."
          >
            <Link className="text-link" to="/status">Inspect verification status <ArrowRight aria-hidden="true" size={15} /></Link>
          </SectionHeading>
        </div>
        <TiltIn className="evidence-window">
          <div className="evidence-window__chrome" aria-hidden="true"><span /><span /><span /></div>
          <StaggerGroup className="claim-stack">
            <StaggerItem><ClaimStatus claim="Polygon Amoy execution" state="DEPLOYMENT_PENDING" source="VAMS architecture profile" detail="Execution architecture is specified; public deployment evidence is not supplied." /></StaggerItem>
            <StaggerItem><ClaimStatus claim="Cardano Pre-Prod governance" state="DEPLOYMENT_PENDING" source="VAMS architecture profile" detail="Governance, identity, and insurance target Cardano; deployment is not claimed." /></StaggerItem>
            <StaggerItem><ClaimStatus claim="Economic actions" state="BLOCKED" source="Read-only frontend profile" detail="Wallet, payments, staking, rewards, governance, and insurance controls are absent by design." /></StaggerItem>
          </StaggerGroup>
        </TiltIn>
      </div>
    </section>
  )
}

function JourneySection() {
  return (
    <section className="home-section journey-section">
      <div className="wrap journey-section__grid">
        <Reveal><p className="eyebrow journey-section__title">Choose your entry point</p></Reveal>
        <StaggerGroup className="journey-list">
          <StaggerItem><Link className="journey-row" to="/build"><span>01</span><h3>Application team</h3><p>Explore portable services, blueprints, and composition.</p><ArrowUpRight aria-hidden="true" className="journey-row__arrow" size={18} /></Link></StaggerItem>
          <StaggerItem><Link className="journey-row" to="/operate"><span>02</span><h3>Infrastructure operator</h3><p>Review participation requirements and release gates.</p><ArrowUpRight aria-hidden="true" className="journey-row__arrow" size={18} /></Link></StaggerItem>
          <StaggerItem><Link className="journey-row" to="/protocol"><span>03</span><h3>Enterprise or institution</h3><p>Inspect continuity, sovereignty, and accountability boundaries.</p><ArrowUpRight aria-hidden="true" className="journey-row__arrow" size={18} /></Link></StaggerItem>
          <StaggerItem><Link className="journey-row" to="/research"><span>04</span><h3>Researcher or auditor</h3><p>Trace ambitious claims to specifications and evidence.</p><ArrowUpRight aria-hidden="true" className="journey-row__arrow" size={18} /></Link></StaggerItem>
        </StaggerGroup>
      </div>
    </section>
  )
}

function DestinationSection() {
  return (
    <ExpandingPanel className="destination" data-theme="dark">
      <HorizonBackdrop variant="destination" />
      <div className="destination__inner wrap">
        <Reveal><p className="eyebrow eyebrow--signal">The destination</p></Reveal>
        <SmokeText as="h2" className="destination__title" mode="words" triggerOnView phrases={['A web where our work can endure, our intelligence can evolve, and our sovereignty remains our own.']} />
        <Reveal className="destination__actions" delay={0.2}>
          <MagneticLink className="button" to="/overview">Open console</MagneticLink>
          <Link className="button button--ghost" to="/research">Inspect research</Link>
        </Reveal>
      </div>
    </ExpandingPanel>
  )
}

export function HomePage() {
  return (
    <div className="marketing-home">
      <Hero />
      <HorizonStage />
      <LifecycleSection />
      <ArchitectureSection />
      <EvidenceSection />
      <JourneySection />
      <DestinationSection />
    </div>
  )
}
