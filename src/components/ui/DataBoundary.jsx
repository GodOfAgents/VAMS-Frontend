import { AlertTriangle, RefreshCw } from 'lucide-react'
import { PresenceRegion } from '../../motion/primitives.jsx'

export function DataBoundary({ resource, children, emptyMessage = 'No records are visible in this environment.', onRetry }) {
  if (resource.loading) {
    return (
      <PresenceRegion className="data-boundary-presence" stateKey="loading">
        <div className="data-state" role="status"><span className="loading-mark" /> Retrieving protocol state…</div>
      </PresenceRegion>
    )
  }

  if (resource.error) {
    return (
      <PresenceRegion className="data-boundary-presence" stateKey="error">
        <div className="data-state data-state--error" role="alert">
          <AlertTriangle aria-hidden="true" size={22} />
          <div>
            <strong>Gateway unavailable</strong>
            <p>{resource.error.message}</p>
            <p className="mono-note">No simulated data has been substituted.</p>
          </div>
          {onRetry && <button className="text-button" type="button" onClick={onRetry}><RefreshCw aria-hidden="true" size={15} /> Retry</button>}
        </div>
      </PresenceRegion>
    )
  }

  if (!resource.result?.data || (Array.isArray(resource.result.data) && resource.result.data.length === 0)) {
    return (
      <PresenceRegion className="data-boundary-presence" stateKey="empty">
        <div className="data-state">{emptyMessage}</div>
      </PresenceRegion>
    )
  }

  return (
    <PresenceRegion className="data-boundary-presence" stateKey="ready">
      {children(resource.result.data, resource.result)}
    </PresenceRegion>
  )
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
