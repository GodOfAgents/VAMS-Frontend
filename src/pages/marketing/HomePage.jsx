import { ArrowDown, ArrowRight, Boxes, Braces, Cpu, FileCheck2, Globe2, ShieldCheck } from 'lucide-react'
import { useRef } from 'react'
import { useMotionValue, useTransform } from 'motion/react'
import * as m from 'motion/react-m'
import { Link } from 'react-router-dom'
import { ArchitectureDiagram } from '../../components/marketing/ArchitectureDiagram.jsx'
import { ArchitectureOrbit } from '../../components/marketing/ArchitectureOrbit.jsx'
import { LifecycleTimeline } from '../../components/marketing/LifecycleTimeline.jsx'
import { LightSlats } from '../../components/marketing/LightSlats.jsx'
import { LiquidChrome } from '../../components/marketing/LiquidChrome.jsx'
import { ClaimStatus } from '../../components/ui/ClaimStatus.jsx'
import { SectionHeading } from '../../components/ui/SectionHeading.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { MagneticLink, Reveal, SmokeText, StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'
import { ExpandingPanel, TiltIn, useStageProgress } from '../../motion/scroll.jsx'

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

function Hero() {
  return (
    <section className="hero">
      <LightSlats />
      <div className="hero__inner wrap">
        <Reveal className="hero__badge" delay={0.05}><StatusBadge state="DEPLOYMENT_PENDING" prefix="Hardened pre-testnet candidate" /></Reveal>
        <Reveal delay={0.12}><p className="hero__kicker">VERIFIABLE AGENTIC MODULAR STACK</p></Reveal>
        <SmokeText
          className="hero__title vt-title"
          delay={0.16}
          mode="words"
          phrases={['Sovereign', 'infrastructure for', 'enduring services.']}
        />
        <Reveal delay={0.46}>
          <p className="hero__lede">VAMS helps digital services keep their identity, authority, and state—even when infrastructure changes.</p>
        </Reveal>
        <Reveal className="hero__actions" delay={0.56}>
          <MagneticLink className="button" to="/overview">Open read-only console <ArrowRight aria-hidden="true" size={16} /></MagneticLink>
          <MagneticLink className="button button--ghost" data-glass="true" to="/protocol">Understand VAMS</MagneticLink>
        </Reveal>
      </div>
    </section>
  )
}

const protocolFacts = [
  ['Architecture', 'v0.8.0'],
  ['Lifecycle', 'Hardened pre-testnet'],
  ['Current mode', 'Research and development'],
  ['Public surface', 'Read-only'],
]

// Scroll choreography for the pinned chrome stage (fractions of the stage scroll).
const stageTimeline = {
  desktop: { open: [0.02, 0.56], rise: [0.02, 0.62], facts: 0.58, factSpan: 0.1, factStep: 0.05, cue: [0.8, 0.9] },
  mobile: { open: [0.02, 0.62], rise: [0.02, 0.66], facts: 0.62, factSpan: 0.1, factStep: 0.045, cue: [0.82, 0.92] },
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

// A light window opens at the foot of the dark hero and grows until the light
// theme fills the screen. Inside it the wordmark pours together in liquid chrome.
function ChromeStage() {
  const stageRef = useRef(null)
  const wordmarkRef = useRef(null)
  const { progress, reducedMotion, isMobile } = useStageProgress(stageRef)
  const timeline = isMobile ? stageTimeline.mobile : stageTimeline.desktop
  // The card starts as a narrow inset panel and grows to full bleed.
  const inset = isMobile ? 6 : 14
  const clipPath = useTransform(progress, timeline.open, [`inset(0% ${inset}% 0% ${inset}% round 36px)`, 'inset(0% 0% 0% 0% round 0px)'])
  const cue = useTransform(progress, timeline.cue, [0, 1])
  const lift = useTransform(progress, timeline.open, [1, 0])
  const wordScale = useTransform(progress, timeline.open, [0.9, 1])
  const wordOpacity = useTransform(progress, timeline.open, [0.75, 1])
  const animated = !reducedMotion

  return (
    <div className={`stage${animated ? ' stage--animated' : ''}`} ref={stageRef}>
      <div className="stage__sticky">
        <m.div className="stage__card" data-theme="light" style={animated ? { clipPath } : undefined}>
          <m.div className="stage__art" aria-hidden="true" style={animated ? { '--lift': lift } : undefined}>
            <m.span className="stage__wordmark" ref={wordmarkRef} style={animated ? { scale: wordScale, opacity: wordOpacity } : undefined}>VAMS</m.span>
            <LiquidChrome liftRange={timeline.open} progress={animated ? progress : null} wordmarkRef={wordmarkRef} />
          </m.div>
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

// The continuity model: a service changes vehicles (providers), not identity.
function ContinuitySection() {
  return (
    <Reveal as="section" className="home-section continuity-section">
      <div className="wrap">
        <ArchitectureDiagram variant="continuity" />
      </div>
    </Reveal>
  )
}

function LifecycleSection() {
  return (
    <section className="home-section lifecycle-section">
      <div className="wrap lifecycle-section__grid">
        <div className="lifecycle-section__intro">
          <SectionHeading
            eyebrow="The execution lifecycle"
            title={['From intent to continuity.']}
            aside="One visible path from request to recovery."
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
          title={['Clear roles.', 'Clear boundaries.']}
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
            title={['Know what is proven.']}
            aside="Built, tested, deployed, and observed are different proof states."
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
          <StaggerItem><Link className="journey-row" to="/build"><span className="journey-row__index">01</span><h3 data-morph-title>Builders</h3><p>Explore blueprints and portable services.</p><span className="journey-row__cta">Build the future <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
          <StaggerItem><Link className="journey-row" to="/operate"><span className="journey-row__index">02</span><h3 data-morph-title>Operators</h3><p>Review requirements and release gates.</p><span className="journey-row__cta">Operate the future <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
          <StaggerItem><Link className="journey-row" to="/protocol"><span className="journey-row__index">03</span><h3 data-morph-title>Organizations</h3><p>Understand continuity and accountability.</p><span className="journey-row__cta">Shape future Web <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
          <StaggerItem><Link className="journey-row" to="/research"><span className="journey-row__index">04</span><h3 data-morph-title>Researchers</h3><p>Trace claims to sources and evidence.</p><span className="journey-row__cta">Research future Web <ArrowRight aria-hidden="true" size={15} /></span></Link></StaggerItem>
        </StaggerGroup>
      </div>
    </section>
  )
}

// The page closes on the hero's answering diagonal: the slats return mirrored,
// growing with the panel, and light gathers around the primary action.
function DestinationSection() {
  const opening = useMotionValue(0)

  return (
    <ExpandingPanel className="destination" data-theme="dark" progressValue={opening}>
      <LightSlats progress={opening} variant="closer" />
      <div className="destination__inner wrap">
        <Reveal><p className="eyebrow eyebrow--signal">The destination</p></Reveal>
        <SmokeText as="h2" className="destination__title" mode="words" triggerOnView phrases={['Services that outlive their infrastructure.']} />
        <Reveal className="destination__actions" delay={0.2}>
          <MagneticLink className="button" data-slats-focus="true" to="/overview">Open console</MagneticLink>
          <Link className="button button--ghost" data-glass="true" to="/research">Inspect research</Link>
        </Reveal>
      </div>
    </ExpandingPanel>
  )
}

export function HomePage() {
  return (
    <div className="marketing-home">
      <div className="home-intro" data-theme="dark">
        <Hero />
        <ChromeStage />
      </div>
      <ContinuitySection />
      <LifecycleSection />
      <ArchitectureSection />
      <EvidenceSection />
      <JourneySection />
      <DestinationSection />
    </div>
  )
}
