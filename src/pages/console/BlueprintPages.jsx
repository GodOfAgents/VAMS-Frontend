import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ResourceTable } from '../../components/console/ResourceTable.jsx'
import { DataBoundary, Provenance } from '../../components/ui/DataBoundary.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { useProtocol } from '../../features/protocol/ProtocolProvider.jsx'
import { useResource } from '../../features/protocol/useResource.js'

export function BlueprintsPage() {
  const resource = useResource('blueprints')
  const { load } = useProtocol()
  return (
    <>
      <PageHeader eyebrow="Composition" title="Blueprints" description="Inspectable workload definitions for compute, cognition, trust, and service requirements." />
      <DataBoundary resource={resource} onRetry={() => load('blueprints')}>
        {(rows, envelope) => (
          <>
            <ResourceTable
              label="Available composition blueprints"
              linkPrefix="/blueprints"
              rows={rows}
              columns={[
                { key: 'name', label: 'Blueprint' },
                { key: 'purpose', label: 'Purpose' },
                { key: 'trust_tier', label: 'Trust tier' },
                { key: 'service_blocks', label: 'Service blocks', render: (row) => row.service_blocks.length },
              ]}
            />
            <Provenance envelope={envelope} />
          </>
        )}
      </DataBoundary>
    </>
  )
}

function CompositionSimulator({ blueprint }) {
  const { client, capabilities, environment } = useProtocol()
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!capabilities.compositionDryRun) {
    return (
      <div className="blocked-callout">
        <StatusBadge state="BLOCKED" />
        <div><strong>Composition simulation unavailable</strong><p>The frontend and Gateway have not jointly advertised this capability.</p></div>
      </div>
    )
  }

  const run = async () => {
    setLoading(true)
    setError(null)
    try {
      setResult(await client.simulate({ blueprint_id: blueprint.id }))
    } catch (caught) {
      setError(caught)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel panel--wide simulator">
      <div className="panel__heading">
        <div><p className="eyebrow">Explainable composition</p><h2>Non-mutating dry-run</h2></div>
        <StatusBadge state={environment.simulationEnabled ? 'SIMULATED' : 'AVAILABLE'} />
      </div>
      <p>This action never provisions an instance, reserves resources, changes counters, authorizes payment, or enters settlement.</p>
      <button className="button" type="button" disabled={loading} onClick={run}>{loading ? 'Evaluating…' : 'Run composition dry-run'}</button>
      {error && <div className="data-state data-state--error" role="alert">{error.message}</div>}
      {result && (
        <div className="simulation-result">
          <div className="simulation-result__summary">
            <StatusBadge state={result.provenance} />
            <span>Estimated allocation: {result.data.allocation.join(', ')}</span>
            <strong>${result.data.estimated_cost_per_hour.toFixed(2)} / hour</strong>
          </div>
          {result.data.candidates.map((candidate) => (
            <article key={candidate.node_id}>
              <div><h3>{candidate.node_id}</h3><StatusBadge state={candidate.decision} /></div>
              <strong>{Math.round(candidate.score * 100)}% composite match</strong>
              <dl>
                <div><dt>Strengths</dt><dd>{candidate.strengths.join(' · ')}</dd></div>
                <div><dt>Shortfalls</dt><dd>{candidate.shortfalls.join(' · ') || 'None'}</dd></div>
                <div><dt>Exclusions</dt><dd>{candidate.exclusions.join(' · ') || 'None'}</dd></div>
                <div><dt>Cost</dt><dd>${candidate.estimated_cost_per_hour.toFixed(2)} / hour</dd></div>
              </dl>
            </article>
          ))}
          <Provenance envelope={result} />
        </div>
      )}
    </section>
  )
}

export function BlueprintDetailPage() {
  const { blueprintId } = useParams()
  const resource = useResource('blueprints')
  const { load } = useProtocol()
  return (
    <DataBoundary resource={resource} onRetry={() => load('blueprints')}>
      {(rows, envelope) => {
        const blueprint = rows.find((item) => item.id === blueprintId)
        if (!blueprint) return <div className="data-state">Blueprint <code>{blueprintId}</code> is not visible.</div>
        return (
          <>
            <PageHeader eyebrow="Blueprint detail" title={blueprint.name} description={blueprint.purpose}><StatusBadge state="READ_ONLY" /></PageHeader>
            <div className="detail-grid">
              <section className="panel">
                <p className="eyebrow">Workload</p><h2>Required compute</h2>
                <dl className="definition-list">
                  {Object.entries(blueprint.required_compute).map(([key, value]) => <div key={key}><dt>{key.replaceAll('_', ' ')}</dt><dd>{String(value)}</dd></div>)}
                  <div><dt>Trust tier</dt><dd>{blueprint.trust_tier}</dd></div>
                </dl>
              </section>
              <section className="panel">
                <p className="eyebrow">Intelligence</p><h2>Cognitive requirements</h2>
                <dl className="definition-list">{Object.entries(blueprint.cognitive_requirements).map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{Math.round(value * 100)}%</dd></div>)}</dl>
              </section>
              <section className="panel">
                <p className="eyebrow">Capabilities</p><h2>Service blocks</h2>
                <div className="tag-list">{blueprint.service_blocks.map((item) => <span key={item}>{item}</span>)}</div>
              </section>
              <CompositionSimulator blueprint={blueprint} />
            </div>
            <Provenance envelope={envelope} />
            <Link className="text-link" to="/blueprints">← Back to blueprints</Link>
          </>
        )
      }}
    </DataBoundary>
  )
}
