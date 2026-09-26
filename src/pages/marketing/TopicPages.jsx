import { ArrowRight, CheckCircle2, CircleDashed, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { appEnvironment } from '../../config/environment.js'
import { Reveal } from '../../motion/primitives.jsx'

const content = {
  protocol: {
    eyebrow: 'Protocol',
    title: 'Infrastructure whose authority and claims can be inspected.',
    description: 'VAMS connects portable identity, durable state, governed execution, independent evidence, and economic responsibility without hiding their boundaries.',
    pillars: [
      ['Immortal Execution', 'Supported services aim to recover authenticated state and authority beyond the life of one host.'],
      ['Heart and Brain', 'Reasoning proposes and composes; consent, policy, and revocation remain independent authority boundaries.'],
      ['Evidence and accountability', 'Claims, receipts, challenges, and settlement stay linked to explicit responsibilities.'],
      ['Dual-host architecture', 'Polygon Amoy targets execution while Cardano Pre-Prod targets governance, identity, and insurance. Both remain deployment pending.'],
    ],
  },
  network: {
    eyebrow: 'Network',
    title: 'Replace providers without surrendering the service.',
    description: 'VAMS treats compute, storage, networking, models, and verification as replaceable resources whose claims must remain inspectable.',
    pillars: [
      ['Nodes', 'Availability, region, resources, skills, trust posture, and freshness.'],
      ['Service Blocks', 'Composable capabilities with integration and mock/live boundaries.'],
      ['Data availability', 'Provider implementation and operational readiness remain distinct.'],
      ['Network state', 'No response is silently replaced with synthetic activity.'],
    ],
  },
  build: {
    eyebrow: 'Build',
    title: 'Move from Web2 toward portable services.',
    description: 'Package existing capabilities, declare requirements, preserve state, and add independent providers incrementally without pretending migration is only a file transfer.',
    pillars: [
      ['Blueprints', 'Describe compute, data, trust, geography, cognition, and service requirements.'],
      ['Dry-run composition', 'A non-mutating simulation reuses scoring concepts while remaining visibly synthetic or Gateway-sourced.'],
      ['SDK-ready output', 'Export paths are designed for later phases; submission is intentionally absent.'],
      ['Gateway contract', 'Versioned, schema-validated explorer APIs carry provenance in every response.'],
    ],
  },
  operate: {
    eyebrow: 'Operate',
    title: 'Operational participation begins with evidence.',
    description: 'The current public surface explains requirements and blockers. It does not register operators, authorize identities, or create economic expectations.',
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

function TopicComposition({ topic, page }) {
  if (topic === 'protocol' || topic === 'network') return (
    <div className="topic-principles">
      {page.pillars.map(([title, detail], index) => <Reveal as="article" key={title}><span className="topic-number">0{index + 1}</span><h2>{title}</h2><p>{detail}</p></Reveal>)}
    </div>
  )
  if (topic === 'build') return (
    <section className="migration-path" aria-label="Migration stages">
      <div className="topic-section-intro"><p className="eyebrow">An incremental path</p><h2>Keep the service.<br />Expand its independence.</h2><p>Migration includes identity, permissions, application state, and recovery. Begin with one bounded capability.</p><Link to="/blueprints" className="text-link">Inspect blueprints <ArrowRight size={16} aria-hidden="true" /></Link></div>
      <ol>{migrationSteps.map(([title, detail, boundary], index) => <li key={title}><span className="topic-number">0{index + 1}</span><div><h3>{title}</h3><p>{detail}</p><small>{boundary}</small></div></li>)}</ol>
    </section>
  )
  if (topic === 'operate') return (
    <section className="operator-readiness" aria-label="Operator requirements and release gates">
      <div className="operator-requirements"><p className="eyebrow">Prepare to participate</p><h2>Capabilities come with responsibilities.</h2>{page.pillars.slice(0, 2).map(([title, detail]) => <article key={title}><h3>{title}</h3><p>{detail}</p></article>)}<Link className="text-link" to="/nodes">Inspect node requirements <ArrowRight size={16} aria-hidden="true" /></Link></div>
      <div className="release-gates"><p className="eyebrow">Before live participation</p><h2>Release gates</h2><ul>{[['Identity and transport', 'Authorization, telemetry, and fail-closed dependencies require verified deployment evidence.'], ['Independent providers', 'Mock adapters are not staging or production evidence.'], ['Economic actions', 'Registration, staking, rewards, and settlement remain unavailable on this surface.']].map(([title, detail]) => <li key={title}><CircleDashed aria-hidden="true" size={20} /><div><h3>{title}</h3><p>{detail}</p></div></li>)}</ul><Link to="/status" className="text-link">Review verification status <ArrowRight size={16} aria-hidden="true" /></Link></div>
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
      <PageHeader eyebrow={page.eyebrow} title={page.title} description={page.description} smoke>
        <span className="topic-lifecycle">Pre-testnet · {topic === 'research' ? 'Research agenda' : 'Architecture & requirements'}</span>
      </PageHeader>
      <TopicComposition topic={topic} page={page} />
      <Reveal as="section" className="topic-callout">
        <div>
          <p className="eyebrow">Current lifecycle boundary</p>
          <h2>Inspection and explicit simulation only.</h2>
        </div>
        <ul>
          <li><CheckCircle2 aria-hidden="true" /> Read public protocol state</li>
          <li><CheckCircle2 aria-hidden="true" /> Simulate composition when explicitly enabled</li>
          <li><CircleDashed aria-hidden="true" /> Deployment evidence pending</li>
          <li><CircleDashed aria-hidden="true" /> Economic actions unavailable</li>
        </ul>
      </Reveal>
      <Reveal className="topic-actions">
        <Link className="button" to="/overview">Open read-only console <ArrowRight aria-hidden="true" size={16} /></Link>
        <a className="button button--ghost" href={appEnvironment.docsUrl}>Read repository docs <ExternalLink aria-hidden="true" size={15} /></a>
      </Reveal>
    </div>
  )
}

export const ProtocolPage = () => <TopicPage topic="protocol" />
export const NetworkPage = () => <TopicPage topic="network" />
export const BuildPage = () => <TopicPage topic="build" />
export const OperatePage = () => <TopicPage topic="operate" />
export const ResearchPage = () => <TopicPage topic="research" />
