import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { appEnvironment } from '../../config/environment.js'
import { PresenceRegion } from '../../motion/primitives.jsx'

function errorPresentation(error) {
  const code = error?.details?.code
  if (code === 'GATEWAY_NOT_CONFIGURED') return {
    title: 'Live Gateway records are not connected',
    message: 'This public preview is available, but no Gateway endpoint is configured. No simulated records have been substituted.',
    guidance: true,
    retry: false,
  }
  if (code === 'MALFORMED_GATEWAY_RESPONSE') return {
    title: 'Gateway response could not be verified',
    message: 'The response did not match the documented explorer schema, so it was not displayed.',
    guidance: false,
    retry: false,
  }
  if (code === 'GATEWAY_HTTP_ERROR') {
    const status = error.details.status
    const retry = status === 408 || status === 429 || status >= 500
    return {
      title: retry ? 'Gateway is temporarily unavailable' : 'Gateway rejected the request',
      message: error.message,
      guidance: false,
      retry,
    }
  }
  return {
    title: 'Gateway connection is temporarily unavailable',
    message: error?.message || 'The connection failed before a verified response arrived.',
    guidance: false,
    retry: true,
  }
}

export function DataBoundary({ resource, children, emptyMessage = 'No records are visible in this environment.', onRetry }) {
  if (resource.loading) {
    return (
      <PresenceRegion className="data-boundary-presence" stateKey="loading">
        <div className="data-state" role="status"><span className="loading-mark" /> Retrieving protocol state…</div>
      </PresenceRegion>
    )
  }

  if (resource.error) {
    const presentation = errorPresentation(resource.error)
    return (
      <PresenceRegion className="data-boundary-presence" stateKey="error">
        <div className="data-state data-state--error" role="alert">
          <AlertTriangle aria-hidden="true" size={22} />
          <div>
            <strong>{presentation.title}</strong>
            <p>{presentation.message}</p>
            {presentation.guidance && <div className="data-state__links"><Link to="/protocol#integration">Gateway architecture</Link><Link to="/research#sources">Dated evidence</Link><a href={appEnvironment.docsUrl}>Repository documentation</a></div>}
            <p className="mono-note">No simulated data has been substituted.</p>
          </div>
          {presentation.retry && onRetry && <button className="text-button" type="button" onClick={onRetry}><RefreshCw aria-hidden="true" size={15} /> Retry</button>}
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
