import { AlertTriangle, Boxes, Braces, Database, Network } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DataBoundary, Provenance } from '../../components/ui/DataBoundary.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { useProtocol } from '../../features/protocol/ProtocolProvider.jsx'
import { useResource } from '../../features/protocol/useResource.js'

export function OverviewPage() {
  const { environment, load, capabilities } = useProtocol()
  const meta = useResource('meta')
  const nodes = useResource('nodes')
  const blueprints = useResource('blueprints')
  const blocks = useResource('serviceBlocks')
  const da = useResource('daStatus')
  const evidence = useResource('evidence')

  const cards = [
    ['Visible nodes', nodes, Network, '/nodes'],
    ['Blueprints', blueprints, Braces, '/blueprints'],
    ['Service blocks', blocks, Boxes, '/service-blocks'],
  ]

  return (
    <>
      <PageHeader eyebrow="Mission control" title="Protocol overview" description="What environment is visible, which resources can be inspected, and what remains blocked." />
      <section className="environment-panel">
        <div><span>Environment</span><strong>{environment.environment}</strong></div>
        <div><span>Gateway origin</span><strong>{environment.gatewayOrigin || 'NOT CONFIGURED'}</strong></div>
        <div><span>Interaction</span><strong>READ-ONLY</strong></div>
        <div><span>Simulation</span><strong>{environment.simulationEnabled ? 'EXPLICITLY ENABLED' : 'DISABLED'}</strong></div>
      </section>

      <div className="metric-grid">
        {cards.map(([label, resource, Icon, to]) => (
          <Link className="metric-card" to={to} key={label}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
            <strong>{resource.result?.data?.length ?? '—'}</strong>
            <small>{resource.error ? 'Gateway unavailable' : resource.loading ? 'Retrieving' : 'Visible records'}</small>
          </Link>
        ))}
      </div>

      <div className="overview-grid">
        <section className="panel">
          <div className="panel__heading"><div><p className="eyebrow">Composition readiness</p><h2>Effective capabilities</h2></div></div>
          <p className="panel__lede">Capabilities fail closed. A feature is available only when frontend configuration and the Gateway both advertise support.</p>
          <ul className="capability-list">
            {Object.entries(capabilities).map(([name, enabled]) => (
              <li key={name}><span>{name.replace(/([A-Z])/g, ' $1')}</span><StatusBadge state={enabled ? 'AVAILABLE' : 'DISABLED'} /></li>
            ))}
          </ul>
          <DataBoundary resource={meta} onRetry={() => load('meta')}>
            {(_, envelope) => <Provenance envelope={envelope} />}
          </DataBoundary>
        </section>

        <section className="panel">
          <div className="panel__heading"><div><p className="eyebrow">Release readiness</p><h2>Known blockers</h2></div><AlertTriangle aria-hidden="true" /></div>
          <DataBoundary resource={evidence} onRetry={() => load('evidence')}>
            {(records, envelope) => (
              <>
                <ul className="evidence-mini-list">
                  {records.filter((record) => ['BLOCKED', 'DEPLOYMENT_PENDING'].includes(record.state)).map((record) => (
                    <li key={record.id}><div><strong>{record.claim}</strong><p>{record.detail}</p></div><StatusBadge state={record.state} /></li>
                  ))}
                </ul>
                <Provenance envelope={envelope} />
              </>
            )}
          </DataBoundary>
        </section>

        <section className="panel panel--wide">
          <div className="panel__heading"><div><p className="eyebrow">Data availability</p><h2>Route posture</h2></div><Database aria-hidden="true" /></div>
          <DataBoundary resource={da} onRetry={() => load('daStatus')}>
            {(status, envelope) => (
              <>
                <div className="route-grid">
                  {status.routes.map((route) => <div key={route.name}><strong>{route.name}</strong><span>{route.implementation}</span><StatusBadge state={route.operational_state} /></div>)}
                </div>
                <Provenance envelope={envelope} />
              </>
            )}
          </DataBoundary>
        </section>
      </div>
    </>
  )
}
