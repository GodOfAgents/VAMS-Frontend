import { ArrowUpRight, BookOpen, CheckCircle2, CircleDashed, GitBranch, History, Search, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { CampaignBridge } from '../../components/marketing/CampaignBridge.jsx'
import { Reveal, StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'
import {
  architectureTimeline,
  auditPosture,
  implementationMap,
  maturityOptions,
  projectUpdates,
  researchFamilies,
  researchReferences,
  researchSnapshotMeta,
  sourceDocuments,
  strategyDocuments,
} from '../../data/researchSnapshot.js'

const postureFamilies = ['R1', 'R2', 'R3', 'R4', 'R10']

function label(value) {
  return String(value).replaceAll('-', ' ').replaceAll('_', ' ')
}

function ResearchBadge({ children, tone = 'neutral' }) {
  return <span className={`research-badge research-badge--${tone}`}><span aria-hidden="true" />{children}</span>
}

function SourceLink({ path, children = path }) {
  return <a className="research-source-link" href={`https://github.com/GodOfAgents/VAMS/blob/main/${path}`} target="_blank" rel="noreferrer">{children}<ArrowUpRight aria-hidden="true" size={14} /></a>
}

function ResearchCard({ anchorId, entry }) {
  return (
    <details className="research-card" id={anchorId}>
      <summary>
        <span className="research-card__id">{entry.family}</span>
        <span className="research-card__title"><strong>{entry.title}</strong><small>{entry.paperId || `${entry.year} · VAMS research alignment`}</small></span>
        <ResearchBadge tone={entry.maturity === 'implemented' ? 'positive' : entry.maturity === 'planned' || entry.maturity === 'blocked' ? 'warning' : 'info'}>{label(entry.maturity)}</ResearchBadge>
        <span className="research-card__toggle" aria-hidden="true">+</span>
      </summary>
      <div className="research-card__body">
        <p>{entry.researchSummary}</p>
        <div className="research-card__grid">
          <div><span className="research-label">VAMS relevance</span><p>{entry.vamsRelevance}</p></div>
          <div><span className="research-label">Implementation surface</span><p className="research-code">{entry.implementationSurface}</p></div>
          <div><span className="research-label">Evidence tier</span><p><ResearchBadge tone="neutral">{label(entry.evidenceTier)}</ResearchBadge></p></div>
          <div><span className="research-label">Source record</span><p><SourceLink path={entry.sourceDocument}>{entry.sourceAnchor}</SourceLink><small>Source snapshot dated {entry.sourceDate}</small></p></div>
        </div>
        <p className="research-card__caveat"><CircleDashed aria-hidden="true" size={15} /> {entry.caveat}</p>
        {entry.externalUrl && <a className="text-link" href={entry.externalUrl} target="_blank" rel="noreferrer">Open canonical paper reference <ArrowUpRight aria-hidden="true" size={15} /></a>}
      </div>
    </details>
  )
}

function ResearchFilters() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const family = params.get('family') || 'all'
  const maturity = params.get('maturity') || 'all'

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  return (
    <div className="research-filters" aria-label="Research ledger filters">
      <label className="research-search"><Search aria-hidden="true" size={16} /><span className="sr-only">Search research</span><input value={query} onChange={(event) => update('q', event.target.value)} placeholder="Search papers, systems, or IDs" /></label>
      <label><span className="research-label">Family</span><select value={family} onChange={(event) => update('family', event.target.value)}><option value="all">All families</option>{researchFamilies.map((item) => <option value={item.id} key={item.id}>{item.id} · {item.title}</option>)}</select></label>
      <label><span className="research-label">Maturity</span><select value={maturity} onChange={(event) => update('maturity', event.target.value)}>{maturityOptions.map((item) => <option value={item} key={item}>{item === 'all' ? 'All maturity states' : label(item)}</option>)}</select></label>
    </div>
  )
}

export function filterResearchReferences(entries, { query = '', family = 'all', maturity = 'all' } = {}) {
  const normalizedQuery = query.trim().toLowerCase()
  return entries.filter((entry) => {
    const searchable = [entry.title, entry.family, entry.paperId, entry.researchSummary, entry.vamsRelevance, entry.implementationSurface].filter(Boolean).join(' ').toLowerCase()
    return (!normalizedQuery || searchable.includes(normalizedQuery)) && (family === 'all' || entry.family === family) && (maturity === 'all' || entry.maturity === maturity)
  })
}

export function ResearchPage() {
  const [params] = useSearchParams()
  const query = (params.get('q') || '').trim().toLowerCase()
  const family = params.get('family') || 'all'
  const maturity = params.get('maturity') || 'all'
  const filteredReferences = useMemo(() => filterResearchReferences(researchReferences, { query, family, maturity }), [family, maturity, query])

  return (
    <div className="research-hub">
      <PageHeader eyebrow="Research and evidence" title="Questions. Sources. Proof." description="A clear view of what informs VAMS, what exists in code, and what remains unproven." smoke>
        <span className="topic-lifecycle">{researchSnapshotMeta.architecture} · Snapshot {researchSnapshotMeta.snapshotDate}</span>
      </PageHeader>

      <CampaignBridge number="05 / Research" question="What counts as proof?" answer="Keep research, implementation, verification, deployment, and live observation distinct when evaluating continuity claims." terms={['Question', 'Source', 'Evidence']} to="/status" action="Inspect verification status" />

      <nav className="research-contents" aria-label="Research page contents">
        <span>On this page</span>
        <a href="#posture">Posture</a>
        <a href="#updates">Updates</a>
        <a href="#ledger">Research ledger</a>
        <a href="#implementation-map">Implementation map</a>
        <a href="#sources">Sources</a>
      </nav>

      <section className="research-posture" id="posture" aria-labelledby="research-posture-title">
        <div className="research-section-heading"><p className="eyebrow">Current research posture</p><h2 id="research-posture-title">Promise is not proof.</h2><p>These five research areas shape the current VAMS design.</p></div>
        <StaggerGroup className="research-frontier-grid">
          {postureFamilies.map((id) => { const familyData = researchFamilies.find((item) => item.id === id); return <StaggerItem as="article" className="research-frontier" key={id}><span className="research-card__id">{id}</span><h3>{familyData.title}</h3><p>{familyData.description}</p><a className="text-link" href={`#ledger-${id}`}>Inspect ledger <ArrowUpRight aria-hidden="true" size={15} /></a></StaggerItem> })}
        </StaggerGroup>
      </section>

      <section className="research-ledger-section" id="ledger" aria-labelledby="research-ledger-title">
        <div className="research-section-heading"><p className="eyebrow">Academic research ledger</p><h2 id="research-ledger-title">{researchReferences.length} references, mapped.</h2><p>A citation shows influence—not implementation or deployment.</p></div>
        <ResearchFilters />
        <div className="research-ledger-meta" aria-live="polite"><span>{filteredReferences.length} of {researchReferences.length} references</span><span>Bundled snapshot dated {researchSnapshotMeta.snapshotDate}</span></div>
        <div className="research-ledger">
          {filteredReferences.length ? filteredReferences.map((entry, index) => <ResearchCard anchorId={index === 0 || filteredReferences[index - 1].family !== entry.family ? `ledger-${entry.family}` : undefined} entry={entry} key={entry.id} />) : <div className="research-empty"><Search aria-hidden="true" size={22} /><h3>No research references match those filters.</h3><p>Clear the search or choose “All” to restore the complete ledger.</p></div>}
        </div>
      </section>

      <section className="research-timeline-section" aria-labelledby="architecture-timeline-title">
        <div className="research-section-heading"><p className="eyebrow">Architecture evolution</p><h2 id="architecture-timeline-title">How the architecture evolved.</h2></div>
        <ol className="research-timeline">{architectureTimeline.map((item) => <li key={item.id}><span className="research-timeline__marker">{item.id}</span><div><div className="research-timeline__head"><h3>{item.label}</h3><ResearchBadge tone={item.status.includes('current') ? 'positive' : 'neutral'}>{item.status}</ResearchBadge></div><p>{item.detail}</p><SourceLink path={item.source}>Read source</SourceLink></div></li>)}</ol>
      </section>

      <section className="research-map-section" id="implementation-map" aria-labelledby="implementation-map-title">
        <div className="research-section-heading"><p className="eyebrow">Research-to-implementation map</p><h2 id="implementation-map-title">Implementation map</h2></div>
        <div className="research-map" role="table" aria-label="Research to implementation map"><div className="research-map__row research-map__row--head" role="row"><span role="columnheader">Surface</span><span role="columnheader">Research</span><span role="columnheader">Maturity</span><span role="columnheader">Evidence</span></div>{implementationMap.map((item) => <div className="research-map__row" role="row" key={item.surface}><strong role="cell">{item.surface}</strong><span role="cell">{item.families.join(' · ')}</span><span role="cell"><ResearchBadge tone={item.maturity === 'implemented' ? 'positive' : 'info'}>{label(item.maturity)}</ResearchBadge></span><span role="cell"><ResearchBadge tone="neutral">{label(item.evidenceTier)}</ResearchBadge><small>{item.note}</small></span></div>)}</div>
      </section>

      <section className="research-audit-section" aria-labelledby="audit-posture-title">
        <div className="research-section-heading"><p className="eyebrow">Audit and verification posture</p><h2 id="audit-posture-title">Past fixes do not prove release readiness.</h2><p>The audit resolved 68 findings. CI, deployment, and independent evidence are still required.</p></div>
        <div className="research-audit-grid"><article className="research-audit-card"><History aria-hidden="true" size={22} /><span className="research-label">{auditPosture.historical.label}</span><strong>{auditPosture.historical.value}</strong><p>{auditPosture.historical.detail}</p><SourceLink path={auditPosture.historical.source}>Audit baseline</SourceLink></article><article className="research-audit-card research-audit-card--current"><ShieldCheck aria-hidden="true" size={22} /><span className="research-label">{auditPosture.current.label}</span><strong>{auditPosture.current.value}</strong><p>{auditPosture.current.detail}</p><SourceLink path={auditPosture.current.source}>Current status</SourceLink></article></div>
        <div className="research-gates">{auditPosture.gates.map(([title, detail, state]) => <div key={title}><span className="research-gate-icon" aria-hidden="true">{state === 'locally verified' ? <CheckCircle2 size={17} /> : <CircleDashed size={17} />}</span><div><strong>{title}</strong><p>{detail}</p></div><ResearchBadge tone={state === 'locally verified' ? 'positive' : 'warning'}>{state}</ResearchBadge></div>)}</div>
      </section>

      <section className="research-updates-section" id="updates" aria-labelledby="updates-title">
        <div className="research-section-heading"><p className="eyebrow">Project updates</p><h2 id="updates-title">Documented project updates</h2></div>
        <ol className="research-updates">{projectUpdates.map((item) => <li key={item.id}><span className="research-update-date">{item.date}</span><div><div className="research-timeline__head"><h3>{item.label}</h3><ResearchBadge tone="neutral">{item.evidenceTier}</ResearchBadge></div><p>{item.detail}</p><small>{item.surface} · <SourceLink path={item.source}>source</SourceLink></small></div></li>)}</ol>
      </section>

      <section className="research-context-section" aria-labelledby="context-title">
        <div className="research-section-heading"><p className="eyebrow">Strategy and historical context</p><h2 id="context-title">Context is not proof.</h2><p>These documents explain direction and history. They do not prove delivery or deployment.</p></div>
        <div className="research-context-grid">{strategyDocuments.map((item) => <article key={item.path}><BookOpen aria-hidden="true" size={19} /><span className="research-label">{item.type}</span><h3>{item.title}</h3><p>{item.detail}</p><SourceLink path={item.path}>Open document</SourceLink></article>)}</div>
      </section>

      <Reveal as="section" className="research-sources-section" id="sources" aria-labelledby="sources-title">
        <div className="research-section-heading"><p className="eyebrow">Sources and methodology</p><h2 id="sources-title">Follow every claim to its source.</h2><p>{researchSnapshotMeta.scope} Dates are preserved. Paper links show influence, not implementation.</p></div>
        <div className="research-sources-grid">{sourceDocuments.map((source) => <article key={source.path}><GitBranch aria-hidden="true" size={18} /><div><h3>{source.title}</h3><p>{source.role}</p><small>Source dated {source.date}</small><SourceLink path={source.path}>Open source</SourceLink></div></article>)}</div>
      </Reveal>
    </div>
  )
}
