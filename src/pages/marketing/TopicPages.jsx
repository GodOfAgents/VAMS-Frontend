import { ArrowRight, CheckCircle2, CircleDashed, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { appEnvironment } from '../../config/environment.js'

const content = {
  protocol: {
    eyebrow: 'Protocol',
    title: 'Infrastructure whose claims can be inspected.',
    description: 'VAMS separates agent execution, identity, verification, data availability, composition, and settlement into explicit architectural boundaries.',
    pillars: [
      ['Agent execution', 'Neuron runtimes expose capabilities and public health through allowlisted explorer records.'],
      ['Resource composition', 'The Composer scores compute, SLA, latency, region, skills, and CHC cognitive fit.'],
      ['Verification', 'Proof state is cumulative only when source-linked evidence exists.'],
      ['Dual-host architecture', 'Polygon Amoy targets execution; Cardano Pre-Prod targets governance, identity, and insurance. Both remain deployment pending.'],
    ],
  },
  network: {
    eyebrow: 'Network',
    title: 'Inspect resources before trusting them.',
    description: 'The public explorer exposes sanitized node, blueprint, service, DA, and evidence records—never private telemetry or sensitive infrastructure fields.',
    pillars: [
      ['Nodes', 'Availability, region, resources, skills, CHC profile, trust tier, and freshness.'],
      ['Service Blocks', 'Composable capabilities with integration and mock/live boundaries.'],
      ['Data availability', 'Provider implementation and operational readiness remain distinct.'],
      ['Network state', 'No response is silently replaced with synthetic activity.'],
    ],
  },
  build: {
    eyebrow: 'Build',
    title: 'Compose with explanations, not opaque recommendations.',
    description: 'Developer simulation compares candidate nodes, exclusions, shortfalls, allocations, and estimated cost without provisioning or settlement.',
    pillars: [
      ['Blueprints', 'Describe compute, cognition, trust, geography, and service requirements.'],
      ['Dry-run composition', 'A non-mutating simulation reuses scoring concepts while remaining visibly synthetic or Gateway-sourced.'],
      ['SDK-ready output', 'Export paths are designed for later phases; submission is intentionally absent.'],
      ['Gateway contract', 'Versioned, schema-validated explorer APIs carry provenance in every response.'],
    ],
  },
  operate: {
    eyebrow: 'Operate',
    title: 'Operational participation begins with verification.',
    description: 'The current frontend explains requirements and blockers. It does not register operators, authorize identities, or create economic expectations.',
    pillars: [
      ['Neuron requirements', 'Compute, telemetry, identity, heartbeat, trust, and service capabilities.'],
      ['Security posture', 'mTLS, DID authorization, strict request schemas, and fail-closed dependencies are release requirements.'],
      ['Mock boundaries', 'Avail and EigenDA stubs are not staging or production evidence.'],
      ['Economic lifecycle', 'Rewards, staking, fiat, settlement, and insurance interactions remain gated.'],
    ],
  },
  research: {
    eyebrow: 'Research',
    title: 'Neuro-symbolic infrastructure, open to inspection.',
    description: 'VAMS joins cognitive matching, sovereign memory, lexical retrieval, verifiable execution, and decentralized coordination without presenting papers as deployed proof.',
    pillars: [
      ['CHC matching', 'Ten cognitive dimensions inform an explainable cognitive shortfall contribution.'],
      ['S-MMU and HORMA', 'Tiered semantic memory with integrity-checked hierarchical state.'],
      ['SIRA', 'Expected-response expansion and dual BM25 retrieval.'],
      ['Evidence discipline', 'Research, implementation, verification, and deployment are labeled independently.'],
    ],
  },
}

function TopicPage({ topic }) {
  const page = content[topic]
  return (
    <div className="topic-page">
      <PageHeader eyebrow={page.eyebrow} title={page.title} description={page.description}>
        <StatusBadge state="SOURCE_IMPLEMENTED" />
      </PageHeader>
      <div className="topic-grid">
        {page.pillars.map(([title, detail], index) => (
          <article key={title}>
            <span>0{index + 1}</span>
            <h2>{title}</h2>
            <p>{detail}</p>
          </article>
        ))}
      </div>
      <section className="topic-callout">
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
      </section>
      <div className="topic-actions">
        <Link className="button" to="/overview">Open read-only console <ArrowRight aria-hidden="true" size={16} /></Link>
        <a className="button button--ghost" href={appEnvironment.docsUrl}>Read repository docs <ExternalLink aria-hidden="true" size={15} /></a>
      </div>
    </div>
  )
}

export const ProtocolPage = () => <TopicPage topic="protocol" />
export const NetworkPage = () => <TopicPage topic="network" />
export const BuildPage = () => <TopicPage topic="build" />
export const OperatePage = () => <TopicPage topic="operate" />
export const ResearchPage = () => <TopicPage topic="research" />
