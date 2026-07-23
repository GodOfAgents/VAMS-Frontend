const tones = {
  LIVE: 'positive',
  AVAILABLE: 'positive',
  ONLINE: 'positive',
  NORMAL: 'positive',
  CI_VERIFIED: 'positive',
  LOCALLY_VERIFIED: 'positive',
  SIMULATED: 'warning',
  MOCK: 'critical',
  STALE: 'warning',
  BLOCKED: 'critical',
  OFFLINE: 'critical',
  DEPLOYMENT_PENDING: 'warning',
  SOURCE_IMPLEMENTED: 'info',
  UNKNOWN: 'neutral',
  UNAVAILABLE: 'neutral',
}

export function StatusBadge({ state, prefix, title }) {
  const normalized = String(state || 'UNKNOWN').toUpperCase().replaceAll(' ', '_')
  const label = normalized.replaceAll('_', ' ')

  return (
    <span className={`status-badge status-badge--${tones[normalized] || 'neutral'}`} title={title}>
      <span aria-hidden="true" className="status-badge__mark" />
      {prefix ? `${prefix}: ` : ''}{label}
    </span>
  )
}
