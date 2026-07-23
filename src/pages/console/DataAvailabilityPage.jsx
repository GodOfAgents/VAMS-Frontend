import { Database, ShieldAlert } from 'lucide-react'
import { DataBoundary, Provenance } from '../../components/ui/DataBoundary.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { useProtocol } from '../../features/protocol/ProtocolProvider.jsx'
import { useResource } from '../../features/protocol/useResource.js'

export function DataAvailabilityPage() {
  const resource = useResource('daStatus')
  const { load } = useProtocol()
  return (
    <>
      <PageHeader eyebrow="Protocol" title="Data availability" description="Implementation posture and current operational evidence are reported separately." />
      <DataBoundary resource={resource} onRetry={() => load('daStatus')}>
        {(status, envelope) => (
          <>
            <div className="da-grid">
              {status.routes.map((route) => (
                <article key={route.name}>
                  <Database aria-hidden="true" />
                  <div><p className="eyebrow">Provider</p><h2>{route.name}</h2></div>
                  <dl className="definition-list">
                    <div><dt>Implementation</dt><dd>{route.implementation}</dd></div>
                    <div><dt>Operational state</dt><dd><StatusBadge state={route.operational_state} /></dd></div>
                    <div><dt>Provenance</dt><dd><StatusBadge state={route.provenance} /></dd></div>
                  </dl>
                </article>
              ))}
            </div>
            <div className="blocked-callout"><ShieldAlert aria-hidden="true" /><div><strong>Fail-closed adapter policy</strong><p>Stub or mock-backed adapters are not acceptable staging or production evidence.</p></div></div>
            <Provenance envelope={envelope} />
          </>
        )}
      </DataBoundary>
    </>
  )
}
