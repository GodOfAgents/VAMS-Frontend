import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { DataBoundary, Provenance } from '../../components/ui/DataBoundary.jsx'
import { useProtocol } from '../../features/protocol/ProtocolProvider.jsx'
import { useResource } from '../../features/protocol/useResource.js'

export function SystemPage() {
  const { environment, capabilities, load } = useProtocol()
  const meta = useResource('meta')
  return (
    <>
      <PageHeader eyebrow="System" title="Gateway and environment" description="Configuration, connectivity, effective capabilities, and response provenance." />
      <div className="detail-grid">
        <section className="panel">
          <p className="eyebrow">Frontend configuration</p><h2>{environment.environment}</h2>
          <dl className="definition-list">
            <div><dt>Gateway origin</dt><dd>{environment.gatewayOrigin || 'Not configured'}</dd></div>
            <div><dt>Simulation</dt><dd><StatusBadge state={environment.simulationEnabled ? 'SIMULATED' : 'DISABLED'} /></dd></div>
            <div><dt>Surface build</dt><dd>{environment.surface}</dd></div>
            <div><dt>Credentials</dt><dd>OMITTED</dd></div>
          </dl>
        </section>
        <section className="panel">
          <p className="eyebrow">Effective capability intersection</p><h2>Fail-closed features</h2>
          <ul className="capability-list">
            {Object.entries(capabilities).map(([name, value]) => <li key={name}><span>{name}</span><StatusBadge state={value ? 'AVAILABLE' : 'DISABLED'} /></li>)}
          </ul>
        </section>
      </div>
      <DataBoundary resource={meta} onRetry={() => load('meta')}>
        {(data, envelope) => (
          <section className="panel system-response">
            <p className="eyebrow">Gateway metadata</p><h2>{data.gateway_status}</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
            <Provenance envelope={envelope} />
          </section>
        )}
      </DataBoundary>
    </>
  )
}
