import { StatusBadge } from './StatusBadge.jsx'

export function ClaimStatus({ claim, state, lastVerified, source, detail }) {
  return (
    <article className="claim-card">
      <div className="claim-card__head">
        <h3>{claim}</h3>
        <StatusBadge state={state} />
      </div>
      <p>{detail}</p>
      <dl className="provenance-list">
        <div><dt>Verified</dt><dd>{lastVerified || 'No verification supplied'}</dd></div>
        <div><dt>Source</dt><dd>{source || 'Unknown'}</dd></div>
      </dl>
    </article>
  )
}
