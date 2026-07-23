import { AlertTriangle, RefreshCw } from 'lucide-react'

export function DataBoundary({ resource, children, emptyMessage = 'No records are visible in this environment.', onRetry }) {
  if (resource.loading) {
    return <div className="data-state" role="status"><span className="loading-mark" /> Retrieving protocol state…</div>
  }

  if (resource.error) {
    return (
      <div className="data-state data-state--error" role="alert">
        <AlertTriangle aria-hidden="true" size={22} />
        <div>
          <strong>Gateway unavailable</strong>
          <p>{resource.error.message}</p>
          <p className="mono-note">No simulated data has been substituted.</p>
        </div>
        {onRetry && <button className="text-button" type="button" onClick={onRetry}><RefreshCw aria-hidden="true" size={15} /> Retry</button>}
      </div>
    )
  }

  if (!resource.result?.data || (Array.isArray(resource.result.data) && resource.result.data.length === 0)) {
    return <div className="data-state">{emptyMessage}</div>
  }

  return children(resource.result.data, resource.result)
}

export function Provenance({ envelope }) {
  if (!envelope) return null
  return (
    <dl className="provenance-bar">
      <div><dt>Provenance</dt><dd>{envelope.provenance}</dd></div>
      <div><dt>Fetched</dt><dd>{new Date(envelope.fetched_at).toLocaleString()}</dd></div>
      <div><dt>Source</dt><dd>{envelope.source}</dd></div>
      <div><dt>Evidence</dt><dd>{envelope.evidence_state.replaceAll('_', ' ')}</dd></div>
    </dl>
  )
}
