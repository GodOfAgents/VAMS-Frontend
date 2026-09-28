import { ArrowUpRight, BookOpen, CheckCircle2, CircleDashed, GitBranch, History, Search, ShieldCheck } from 'lucide-react'
import { useMemo } from 'react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'
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

function ResearchHeading({ eyebrow, id, title, children }) {
  return (
    <Reveal className="research-section-heading">
      <p className="eyebrow eyebrow--signal">{eyebrow}</p>
      <div className="research-section-heading__row">
        <h2 id={id}>{title}</h2>
        {children && <p>{children}</p>}
      </div>
    </Reveal>
  )
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
        <dl className="research-card__grid">
          <div><dt className="research-label">VAMS relevance</dt><dd>{entry.vamsRelevance}</dd></div>
          <div><dt className="research-label">Implementation surface</dt><dd className="research-code">{entry.implementationSurface}</dd></div>
          <div><dt className="research-label">Evidence tier</dt><dd><ResearchBadge tone="neutral">{label(entry.evidenceTier)}</ResearchBadge></dd></div>
          <div><dt className="research-label">Source record</dt><dd><SourceLink path={entry.sourceDocument}>{entry.sourceAnchor}</SourceLink><small>Source snapshot dated {entry.sourceDate}</small></dd></div>
        </dl>
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
      <label className="research-search field-control"><Search aria-hidden="true" size={16} /><span className="sr-only">Search research</span><input value={query} onChange={(event) => update('q', event.target.value)} placeholder="Search papers, systems, or IDs" /></label>
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

function ResearchLedger({ entries }) {
  const motion = useResponsiveMotion()

  if (!entries.length) {
    return (
      <div className="research-ledger">
        <div className="research-empty"><Search aria-hidden="true" size={22} /><h3>No research references match those filters.</h3><p>Clear the search or choose “All” to restore the complete ledger.</p></div>
      </div>
    )
  }

  return (
    <div className="research-ledger">
      <AnimatePresence initial={false} mode="popLayout">
        {entries.map((entry, index) => (
          <m.div
            animate={{ opacity: 1 }}
            className="research-ledger__item"
            exit={motion.reducedMotion ? undefined : { opacity: 0 }}
            initial={motion.reducedMotion ? false : { opacity: 0 }}
            key={entry.id}
            layout={motion.reducedMotion ? false : 'position'}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <ResearchCard anchorId={index === 0 || entries[index - 1].family !== entry.family ? `ledger-${entry.family}` : undefined} entry={entry} />
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export function ResearchPage() {
  const [params] = useSearchParams()
  const query = (params.get('q') || '').trim().toLowerCase()
  const family = params.get('family') || 'all'
  const maturity = params.get('maturity') || 'all'
  const filteredReferences = useMemo(() => filterResearchReferences(researchReferences, { query, family, maturity }), [family, maturity, query])

  return (
    <div className="research-hub">
      <div className="wrap">
        <PageHeader eyebrow="Research and evidence" title="Questions. Sources. Proof." description="A clear view of what informs VAMS, what exists in code, and what remains unproven." smoke>
          <span className="chip topic-lifecycle">{researchSnapshotMeta.architecture} · Snapshot {researchSnapshotMeta.snapshotDate}</span>
        </PageHeader>

        <nav className="research-contents" aria-label="Research page contents">
          <span>On this page</span>
          <a href="#posture">Posture</a>
          <a href="#updates">Updates</a>
          <a href="#ledger">Research ledger</a>
          <a href="#implementation-map">Implementation map</a>
          <a href="#sources">Sources</a>
        </nav>

        <section className="research-block research-posture" id="posture" aria-labelledby="research-posture-title">
          <ResearchHeading eyebrow="Current research posture" id="research-posture-title" title="Promise is not proof.">These five research areas shape the current VAMS design.</ResearchHeading>
          <StaggerGroup className="research-frontiers">
            {postureFamilies.map((id) => {
              const familyData = researchFamilies.find((item) => item.id === id)
              return (
                <StaggerItem as="article" className="research-frontier" key={id}>
                  <span className="research-card__id">{id}</span>
                  <h3>{familyData.title}</h3>
                  <p>{familyData.description}</p>
                  <a className="text-link" href={`#ledger-${id}`}>Inspect ledger <ArrowUpRight aria-hidden="true" size={15} /></a>
                </StaggerItem>
              )
            })}
          </StaggerGroup>
        </section>

        <section className="research-block research-ledger-section" id="ledger" aria-labelledby="research-ledger-title">
          <ResearchHeading eyebrow="Academic research ledger" id="research-ledger-title" title={`${researchReferences.length} references, mapped.`}>A citation shows influence—not implementation or deployment.</ResearchHeading>
          <ResearchFilters />
          <div className="research-ledger-meta" aria-live="polite"><span>{filteredReferences.length} of {researchReferences.length} references</span><span>Bundled snapshot dated {researchSnapshotMeta.snapshotDate}</span></div>
          <ResearchLedger entries={filteredReferences} />
        </section>

        <section className="research-block" aria-labelledby="architecture-timeline-title">
          <ResearchHeading eyebrow="Architecture evolution" id="architecture-timeline-title" title="How the architecture evolved." />
          <StaggerGroup as="ol" className="research-timeline">
            {architectureTimeline.map((item) => (
              <StaggerItem as="li" className={item.status.includes('current') ? 'is-current' : undefined} key={item.id}>
                <span className="research-timeline__marker">{item.id}</span>
                <div className="research-timeline__body">
                  <div className="research-timeline__head"><h3>{item.label}</h3><ResearchBadge tone={item.status.includes('current') ? 'positive' : 'neutral'}>{item.status}</ResearchBadge></div>
                  <p>{item.detail}</p>
                  <SourceLink path={item.source}>Read source</SourceLink>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        <section className="research-block" id="implementation-map" aria-labelledby="implementation-map-title">
          <ResearchHeading eyebrow="Research-to-implementation map" id="implementation-map-title" title="Implementation map" />
          <Reveal className="research-map" role="table" aria-label="Research to implementation map">
            <div className="research-map__row research-map__row--head" role="row"><span role="columnheader">Surface</span><span role="columnheader">Research</span><span role="columnheader">Maturity</span><span role="columnheader">Evidence</span></div>
            {implementationMap.map((item) => (
              <div className="research-map__row" role="row" key={item.surface}>
                <strong role="cell">{item.surface}</strong>
                <span role="cell">{item.families.join(' · ')}</span>
                <span role="cell"><ResearchBadge tone={item.maturity === 'implemented' ? 'positive' : 'info'}>{label(item.maturity)}</ResearchBadge></span>
                <span role="cell"><ResearchBadge tone="neutral">{label(item.evidenceTier)}</ResearchBadge><small>{item.note}</small></span>
              </div>
            ))}
          </Reveal>
        </section>

        <section className="research-block" aria-labelledby="audit-posture-title">
          <ResearchHeading eyebrow="Audit and verification posture" id="audit-posture-title" title="Past fixes do not prove release readiness.">The audit resolved 68 findings. CI, deployment, and independent evidence are still required.</ResearchHeading>
          <StaggerGroup className="research-audit">
            <StaggerItem as="article" className="research-audit__stat">
              <History aria-hidden="true" size={20} />
              <span className="research-label">{auditPosture.historical.label}</span>
              <strong>{auditPosture.historical.value}</strong>
              <p>{auditPosture.historical.detail}</p>
              <SourceLink path={auditPosture.historical.source}>Audit baseline</SourceLink>
            </StaggerItem>
            <StaggerItem as="article" className="research-audit__stat research-audit__stat--current">
              <ShieldCheck aria-hidden="true" size={20} />
              <span className="research-label">{auditPosture.current.label}</span>
              <strong>{auditPosture.current.value}</strong>
              <p>{auditPosture.current.detail}</p>
              <SourceLink path={auditPosture.current.source}>Current status</SourceLink>
            </StaggerItem>
          </StaggerGroup>
          <div className="research-gates">
            {auditPosture.gates.map(([title, detail, state]) => (
              <div key={title}>
                <span className="research-gate-icon" aria-hidden="true">{state === 'locally verified' ? <CheckCircle2 size={17} /> : <CircleDashed size={17} />}</span>
                <div><strong>{title}</strong><p>{detail}</p></div>
                <ResearchBadge tone={state === 'locally verified' ? 'positive' : 'warning'}>{state}</ResearchBadge>
              </div>
            ))}
          </div>
        </section>

        <section className="research-block" id="updates" aria-labelledby="updates-title">
          <ResearchHeading eyebrow="Project updates" id="updates-title" title="Documented project updates" />
          <StaggerGroup as="ol" className="research-updates">
            {projectUpdates.map((item) => (
              <StaggerItem as="li" key={item.id}>
                <span className="research-update-date">{item.date}</span>
                <div>
                  <div className="research-timeline__head"><h3>{item.label}</h3><ResearchBadge tone="neutral">{item.evidenceTier}</ResearchBadge></div>
                  <p>{item.detail}</p>
                  <small>{item.surface} · <SourceLink path={item.source}>source</SourceLink></small>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        <section className="research-block" aria-labelledby="context-title">
          <ResearchHeading eyebrow="Strategy and historical context" id="context-title" title="Context is not proof.">These documents explain direction and history. They do not prove delivery or deployment.</ResearchHeading>
          <StaggerGroup className="research-docs">
            {strategyDocuments.map((item) => (
              <StaggerItem as="article" className="research-doc" key={item.path}>
                <BookOpen aria-hidden="true" size={18} />
                <span className="research-label">{item.type}</span>
                <div className="research-doc__main"><h3>{item.title}</h3><p>{item.detail}</p></div>
                <SourceLink path={item.path}>Open document</SourceLink>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>

        <section className="research-block research-sources-section" id="sources" aria-labelledby="sources-title">
          <ResearchHeading eyebrow="Sources and methodology" id="sources-title" title="Follow every claim to its source.">{researchSnapshotMeta.scope} Dates are preserved. Paper links show influence, not implementation.</ResearchHeading>
          <StaggerGroup className="research-docs research-docs--sources">
            {sourceDocuments.map((source) => (
              <StaggerItem as="article" className="research-doc" key={source.path}>
                <GitBranch aria-hidden="true" size={18} />
                <small>Source dated {source.date}</small>
                <div className="research-doc__main"><h3>{source.title}</h3><p>{source.role}</p></div>
                <SourceLink path={source.path}>Open source</SourceLink>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      </div>
    </div>
  )
}
