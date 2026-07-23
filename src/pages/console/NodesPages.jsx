import { Cpu, MapPin, ShieldCheck, Timer } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { CognitiveProfile } from '../../components/charts/CognitiveProfile.jsx'
import { ResourceTable } from '../../components/console/ResourceTable.jsx'
import { DataBoundary, Provenance } from '../../components/ui/DataBoundary.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { useProtocol } from '../../features/protocol/ProtocolProvider.jsx'
import { useResource } from '../../features/protocol/useResource.js'

export function NodesPage() {
  const resource = useResource('nodes')
  const { load } = useProtocol()

  return (
    <>
      <PageHeader eyebrow="Network" title="Nodes" description="Allowlisted public records only. Private telemetry and sensitive infrastructure fields are excluded.">
        <StatusBadge state="READ_ONLY" />
      </PageHeader>
      <DataBoundary resource={resource} onRetry={() => load('nodes')}>
        {(nodes, envelope) => (
          <>
            <ResourceTable
              label="Visible public node records"
              linkPrefix="/nodes"
              rows={nodes}
              columns={[
                { key: 'id', label: 'Node ID' },
                { key: 'status', label: 'Status', status: true },
                { key: 'region', label: 'Region' },
                { key: 'resources', label: 'Resources', render: (node) => `${node.resources.cpu_cores} CPU · ${node.resources.memory_gb} GB` },
                { key: 'trust', label: 'Trust', render: (node) => `${node.trust.tier} · ${node.trust.tee ? 'TEE' : 'No TEE'}` },
                { key: 'last_heartbeat', label: 'Freshness', render: (node) => new Date(node.last_heartbeat).toLocaleString() },
              ]}
            />
            <Provenance envelope={envelope} />
          </>
        )}
      </DataBoundary>
    </>
  )
}

export function NodeDetailPage() {
  const { nodeId } = useParams()
  const resource = useResource('nodes')
  const { load } = useProtocol()

  return (
    <DataBoundary resource={resource} onRetry={() => load('nodes')}>
      {(nodes, envelope) => {
        const node = nodes.find((item) => item.id === nodeId)
        if (!node) return <div className="data-state">Node <code>{nodeId}</code> is not visible in this environment.</div>

        return (
          <>
            <PageHeader eyebrow="Node detail" title={node.id} description="Public identity, resources, trust, skills, cognitive profile, cost, and freshness.">
              <StatusBadge state={node.status} />
            </PageHeader>
            <div className="detail-metrics">
              <div><MapPin aria-hidden="true" /><span>Region</span><strong>{node.region}</strong></div>
              <div><Cpu aria-hidden="true" /><span>Resources</span><strong>{node.resources.cpu_cores} CPU · {node.resources.memory_gb} GB</strong></div>
              <div><ShieldCheck aria-hidden="true" /><span>Trust</span><strong>{node.trust.tier} · {node.trust.tee ? 'TEE bound' : 'TEE absent'}</strong></div>
              <div><Timer aria-hidden="true" /><span>Heartbeat</span><strong>{new Date(node.last_heartbeat).toLocaleString()}</strong></div>
            </div>
            <div className="detail-grid">
              <section className="panel">
                <p className="eyebrow">Capabilities</p><h2>Skills and compute</h2>
                <div className="tag-list">{node.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                <dl className="definition-list">
                  <div><dt>GPU</dt><dd>{node.resources.gpu || 'Not advertised'}</dd></div>
                  <div><dt>Reputation</dt><dd>{Math.round(node.trust.reputation * 100)}%</dd></div>
                  <div><dt>Indicative cost</dt><dd>${node.indicative_cost_per_hour.toFixed(2)} / hour</dd></div>
                </dl>
              </section>
              <section className="panel panel--wide">
                <p className="eyebrow">Cognitive profile</p><h2>CHC decagon</h2>
                <CognitiveProfile values={node.chc} />
              </section>
            </div>
            <Provenance envelope={envelope} />
            <Link className="text-link" to="/nodes">← Back to nodes</Link>
          </>
        )
      }}
    </DataBoundary>
  )
}
