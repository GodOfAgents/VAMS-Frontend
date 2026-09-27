import { Activity, FileCheck2, ShieldAlert } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ClaimStatus } from '../../components/ui/ClaimStatus.jsx'
import { DataBoundary, Provenance } from '../../components/ui/DataBoundary.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { useProtocol } from '../../features/protocol/ProtocolProvider.jsx'
import { useResource } from '../../features/protocol/useResource.js'
import { Reveal } from '../../motion/primitives.jsx'

export function StatusPage() {
  const meta = useResource('meta')
  const evidence = useResource('evidence')
  const { load } = useProtocol()

  return (
    <div className="status-page wrap">
      <PageHeader eyebrow="Verification register" title="Operational status is not release readiness." description="A service can run locally while remaining unverified, undeployed, or blocked for public testnet." />
      <div className="status-columns">
        <Reveal as="section" className="status-column">
          <div className="status-column__head"><Activity aria-hidden="true" /><div><p className="eyebrow">Runtime observation</p><h2>Operational status</h2></div></div>
          <DataBoundary resource={meta} onRetry={() => load('meta')}>
            {(data, envelope) => (
              <>
                <div className="operational-row"><span>Gateway</span><StatusBadge state={data.gateway_status} /></div>
                <div className="operational-row"><span>Frontend</span><StatusBadge state="ONLINE" /></div>
                <div className="operational-row"><span>Deployment observation</span><StatusBadge state="UNKNOWN" /></div>
                <Provenance envelope={envelope} />
              </>
            )}
          </DataBoundary>
        </Reveal>
        <Reveal as="section" className="status-column status-column--readiness" delay={0.08}>
          <div className="status-column__head"><ShieldAlert aria-hidden="true" /><div><p className="eyebrow">Release qualification</p><h2>Readiness status</h2></div></div>
          <div className="readiness-summary"><StatusBadge state="BLOCKED" /><p>Public-testnet exposure requires browser security, accessibility, phishing, CSP, Gateway, and commit-bound evidence gates.</p></div>
          <Link className="text-link" to="/evidence">Open detailed evidence register →</Link>
        </Reveal>
      </div>
      <section className="status-records">
        <Reveal className="status-records__heading"><p className="eyebrow eyebrow--signal">Claim register</p><h2>Evidence supplied by the configured source</h2></Reveal>
        <DataBoundary resource={evidence} onRetry={() => load('evidence')}>
          {(records, envelope) => (
            <>
              <div className="claim-grid">{records.map((record) => <ClaimStatus key={record.id} claim={record.claim} state={record.state} lastVerified={record.verified_at} source={record.source} detail={record.detail} />)}</div>
              <Provenance envelope={envelope} />
            </>
          )}
        </DataBoundary>
      </section>
      <footer className="status-page__footer"><FileCheck2 aria-hidden="true" /> Evidence must be signed, clean-tree, commit-matched, schema-valid, and sanitized before public export.</footer>
    </div>
  )
}
