import { ArrowRight, CheckCircle2, CircleDashed, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { appEnvironment } from '../../config/environment.js'
import { Reveal, StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'

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

function TopicPage({ topic }) {
  const page = content[topic]
  return (
    <div className="topic-page">
      <PageHeader eyebrow={page.eyebrow} title={page.title} description={page.description} smoke>
        <StatusBadge state="SOURCE_IMPLEMENTED" />
      </PageHeader>
      <StaggerGroup className="topic-grid">
        {page.pillars.map(([title, detail], index) => (
          <StaggerItem as="article" key={title}>
            <span>0{index + 1}</span>
            <h2>{title}</h2>
            <p>{detail}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
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
