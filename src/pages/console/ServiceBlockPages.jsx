import { Link, useParams } from 'react-router-dom'
import { ResourceTable } from '../../components/console/ResourceTable.jsx'
import { DataBoundary, Provenance } from '../../components/ui/DataBoundary.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { useProtocol } from '../../features/protocol/ProtocolProvider.jsx'
import { useResource } from '../../features/protocol/useResource.js'

export function ServiceBlocksPage() {
  const resource = useResource('serviceBlocks')
  const { load } = useProtocol()
  return (
    <>
      <PageHeader eyebrow="Capabilities" title="Service Blocks" description="Composable services with explicit implementation, provenance, and compatibility boundaries." />
      <DataBoundary resource={resource} onRetry={() => load('serviceBlocks')}>
        {(rows, envelope) => (
          <>
            <ResourceTable
              label="Visible Service Block records"
              linkPrefix="/service-blocks"
              rows={rows}
              columns={[
                { key: 'name', label: 'Service Block' },
                { key: 'category', label: 'Category' },
                { key: 'integration_state', label: 'Integration state' },
                { key: 'provenance', label: 'Provenance', status: true },
              ]}
            />
            <Provenance envelope={envelope} />
          </>
        )}
      </DataBoundary>
    </>
  )
}

export function ServiceBlockDetailPage() {
  const { serviceBlockId } = useParams()
  const resource = useResource('serviceBlocks')
  const { load } = useProtocol()
  return (
    <DataBoundary resource={resource} onRetry={() => load('serviceBlocks')}>
      {(rows, envelope) => {
        const block = rows.find((item) => item.id === serviceBlockId)
        if (!block) return <div className="data-state">Service Block <code>{serviceBlockId}</code> is not visible.</div>
        return (
          <>
            <PageHeader eyebrow={block.category} title={block.name} description={block.description}><StatusBadge state={block.provenance} /></PageHeader>
            <div className="detail-grid">
              <section className="panel">
                <p className="eyebrow">Integration</p><h2>{block.integration_state}</h2>
                <p>Implementation presence is not treated as live operational evidence.</p>
              </section>
              <section className="panel">
                <p className="eyebrow">Compatibility</p><h2>Blueprint relationships</h2>
                <div className="tag-list">{block.compatible_blueprints.map((id) => <Link to={`/blueprints/${id}`} key={id}>{id}</Link>)}</div>
              </section>
            </div>
            <Provenance envelope={envelope} />
            <Link className="text-link" to="/service-blocks">← Back to Service Blocks</Link>
          </>
        )
      }}
    </DataBoundary>
  )
}
