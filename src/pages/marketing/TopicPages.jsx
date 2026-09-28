import { ArrowRight, CheckCircle2, CircleDashed, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ArchitectureDiagram } from '../../components/marketing/ArchitectureDiagram.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { appEnvironment } from '../../config/environment.js'
import { Reveal, StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'
export { ResearchPage } from './ResearchPage.jsx'

const content = {
  protocol: {
    eyebrow: 'Protocol',
    title: 'Infrastructure you can inspect.',
    description: 'Portable identity, durable state, governed execution, and visible evidence—with clear boundaries between them.',
    pillars: [
      ['Immortal Execution', 'Recover service state and authority beyond the life of one host.'],
      ['Heart and Brain', 'Reasoning proposes. Consent and policy decide.'],
      ['Evidence', 'Keep claims, receipts, and responsibility connected.'],
      ['Two-chain design', 'Polygon handles execution; Cardano targets governance. Deployment is pending.'],
    ],
  },
  network: {
    eyebrow: 'Network',
    title: 'Change providers. Keep the service.',
    description: 'Compute, storage, models, and verification become replaceable—without hiding their claims.',
    pillars: [
      ['Nodes', 'Availability, region, resources, skills, trust posture, and freshness.'],
      ['Service Blocks', 'Composable capabilities with integration and mock/live boundaries.'],
      ['Data availability', 'Provider implementation and operational readiness remain distinct.'],
      ['Network state', 'No response is silently replaced with synthetic activity.'],
    ],
  },
  build: {
    eyebrow: 'Build',
    title: 'Build services that can move.',
    description: 'Declare what your service needs, preserve its state, and add independent providers one step at a time.',
    pillars: [
      ['Blueprints', 'Describe compute, data, trust, geography, cognition, and service requirements.'],
      ['Dry-run composition', 'A non-mutating simulation reuses scoring concepts while remaining visibly synthetic or Gateway-sourced.'],
      ['SDK-ready output', 'Export paths are designed for later phases; submission is intentionally absent.'],
      ['Gateway contract', 'Versioned, schema-validated explorer APIs carry provenance in every response.'],
    ],
  },
  operate: {
    eyebrow: 'Operate',
    title: 'Operate with evidence.',
    description: 'Review requirements and blockers. Registration and economic actions are not live yet.',
    pillars: [
      ['Neuron requirements', 'Compute, telemetry, identity, heartbeat, trust, and service capabilities.'],
      ['Security posture', 'mTLS, DID authorization, strict request schemas, and fail-closed dependencies are release requirements.'],
      ['Mock boundaries', 'Avail and EigenDA stubs are not staging or production evidence.'],
      ['Economic lifecycle', 'Rewards, staking, fiat, settlement, and insurance interactions remain gated.'],
    ],
  },
  research: {
    eyebrow: 'Research',
    title: 'Open questions, explicit evidence.',
    description: 'VAMS researches continuity, adversarial intelligence, private accountability, durable decentralization, and cryptographic migration without presenting ambition as deployed proof.',
    pillars: [
      ['Continuity', 'Preserve authority, state, completed effects, and settlement obligations across independent trust domains.'],
      ['Adversarial intelligence', 'Constrain specified prohibited effects even when a model or credentialed handler is malicious.'],
      ['Private accountability', 'Verify material claims without making private lives or commercial activity publicly traceable.'],
      ['Evidence discipline', 'Research, implementation, verification, deployment, and live observation are labeled independently.'],
    ],
  },
}

const migrationSteps = [
  ['Map the service', 'Identify application state, owners, permissions, dependencies, and irreversible external effects.', 'Start with what must survive a provider change.'],
  ['Declare requirements', 'Describe compute, data, trust, geography, cognition, and service requirements in a blueprint.', 'Make capability and authority boundaries inspectable.'],
  ['Inspect a composition', 'Explore candidate capabilities and use explicit dry-run simulation when enabled.', 'Simulation is not a deployment or a guarantee of availability.'],
  ['Establish recovery evidence', 'Validate state availability, current authority, and recovery assumptions before live migration.', 'Deployment and economic actions remain gated.'],
]

const releaseGates = [
  ['Identity and transport', 'Authorization, telemetry, and fail-closed dependencies require verified deployment evidence.'],
  ['Independent providers', 'Mock adapters are not staging or production evidence.'],
  ['Economic actions', 'Registration, staking, rewards, and settlement remain unavailable on this surface.'],
]

function TopicComposition({ topic, page }) {
  if (topic === 'protocol' || topic === 'network') return (
    <StaggerGroup className="topic-principles">
      {page.pillars.map(([title, detail], index) => (
        <StaggerItem as="article" className="principle-row" key={title}>
          <span className="topic-number">0{index + 1}</span>
          <h2>{title}</h2>
          <p>{detail}</p>
        </StaggerItem>
      ))}
    </StaggerGroup>
  )
  if (topic === 'build') return (
    <section className="migration-path" aria-label="Migration stages">
      <Reveal className="topic-section-intro">
        <p className="eyebrow eyebrow--signal">An incremental path</p>
        <h2>Keep the service.<br /><span className="topic-muted">Expand its freedom.</span></h2>
        <p>Start with one capability. Preserve identity, permissions, state, and recovery.</p>
        <Link to="/blueprints" className="text-link">Inspect blueprints <ArrowRight size={16} aria-hidden="true" /></Link>
      </Reveal>
      <StaggerGroup as="ol" className="migration-steps">
        {migrationSteps.map(([title, detail, boundary], index) => (
          <StaggerItem as="li" className="migration-step" key={title}>
            <span className="topic-number">0{index + 1}</span>
            <div className="migration-step__body">
              <h3>{title}</h3>
              <p>{detail}</p>
              <small>{boundary}</small>
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
  if (topic === 'operate') return (
    <section className="operator-readiness" aria-label="Operator requirements and release gates">
      <Reveal className="operator-requirements">
        <p className="eyebrow eyebrow--signal">Prepare to participate</p>
        <h2>Capability requires accountability.</h2>
        <div className="requirement-list">
          {page.pillars.slice(0, 2).map(([title, detail]) => <article className="requirement-row" key={title}><h3>{title}</h3><p>{detail}</p></article>)}
        </div>
        <Link className="text-link" to="/nodes">Inspect node records <ArrowRight size={16} aria-hidden="true" /></Link>
      </Reveal>
      <Reveal className="release-gates" delay={0.1}>
        <p className="eyebrow eyebrow--signal">Before live participation</p>
        <h2>Release gates</h2>
        <ul>
          {releaseGates.map(([title, detail]) => (
            <li key={title}><CircleDashed aria-hidden="true" size={20} /><div><h3>{title}</h3><p>{detail}</p></div></li>
          ))}
        </ul>
        <Link to="/status" className="text-link">Review verification status <ArrowRight size={16} aria-hidden="true" /></Link>
      </Reveal>
    </section>
  )
  return (
    <section className="research-agenda" aria-label="Research agenda">
      <div className="topic-section-intro"><p className="eyebrow">Questions worth making precise</p><h2>Ambition needs an evidence trail.</h2><p>Research defines the questions. Implementation, verification, deployment, and live observation establish different kinds of evidence.</p><Link className="text-link" to="/evidence">Explore evidence <ArrowRight size={16} aria-hidden="true" /></Link></div>
      <div className="research-questions">{page.pillars.map(([title, detail], index) => <details key={title} open={index === 0}><summary><span className="topic-number">0{index + 1}</span><span>{title}</span><span aria-hidden="true" className="research-expand">+</span></summary><p>{detail}</p><small>Research direction · not a deployed guarantee</small></details>)}</div>
    </section>
  )
}

function TopicPage({ topic }) {
  const page = content[topic]
  return (
    <div className={`topic-page topic-page--${topic}`}>
      <div className="wrap">
        <PageHeader eyebrow={page.eyebrow} title={page.title} description={page.description} smoke>
          <span className="chip topic-lifecycle">Pre-testnet · {topic === 'research' ? 'Research agenda' : 'Architecture & requirements'}</span>
        </PageHeader>
        {topic === 'protocol' && <Reveal as="section" className="topic-experience"><ArchitectureDiagram variant="authority" /></Reveal>}
        <TopicComposition topic={topic} page={page} />
        <Reveal as="section" className="topic-callout">
          <div>
            <p className="eyebrow eyebrow--signal">Current lifecycle boundary</p>
            <h2>Explore safely. No live actions.</h2>
          </div>
          <ul>
            <li className="is-available"><CheckCircle2 aria-hidden="true" /> Read public protocol state</li>
            <li className="is-available"><CheckCircle2 aria-hidden="true" /> Simulate composition when explicitly enabled</li>
            <li className="is-pending"><CircleDashed aria-hidden="true" /> Deployment evidence pending</li>
            <li className="is-pending"><CircleDashed aria-hidden="true" /> Economic actions unavailable</li>
          </ul>
        </Reveal>
        <Reveal className="topic-actions">
          <Link className="button" to="/overview">Open read-only console <ArrowRight aria-hidden="true" size={16} /></Link>
          <a className="button button--ghost" href={appEnvironment.docsUrl}>Read repository docs <ExternalLink aria-hidden="true" size={15} /></a>
        </Reveal>
      </div>
    </div>
  )
}

export const ProtocolPage = () => <TopicPage topic="protocol" />
export const NetworkPage = () => <TopicPage topic="network" />
export const BuildPage = () => <TopicPage topic="build" />
export const OperatePage = () => <TopicPage topic="operate" />
