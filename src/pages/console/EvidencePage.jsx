import { ClaimStatus } from '../../components/ui/ClaimStatus.jsx'
import { DataBoundary, Provenance } from '../../components/ui/DataBoundary.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { useProtocol } from '../../features/protocol/ProtocolProvider.jsx'
import { useResource } from '../../features/protocol/useResource.js'

const states = ['SOURCE_IMPLEMENTED', 'LOCALLY_VERIFIED', 'CI_VERIFIED', 'DEPLOYMENT_VERIFIED', 'INDEPENDENTLY_REVIEWED', 'LIVE_OBSERVED']

export function EvidencePage() {
  const resource = useResource('evidence')
  const { load } = useProtocol()
  return (
    <>
      <PageHeader eyebrow="Verification" title="Evidence center" description="The uncomfortable facts remain visible beside successful verification. No state is inferred from a lower evidence tier." />
      <ol className="evidence-ladder" aria-label="Evidence maturity states">
        {states.map((state, index) => <li key={state}><span>{index + 1}</span>{state.replaceAll('_', ' ')}</li>)}
      </ol>
      <DataBoundary resource={resource} onRetry={() => load('evidence')}>
        {(records, envelope) => (
          <>
            <div className="claim-grid">
              {records.map((record) => <ClaimStatus key={record.id} claim={record.claim} state={record.state} lastVerified={record.verified_at ? new Date(record.verified_at).toLocaleString() : null} source={record.source} detail={record.detail} />)}
            </div>
            <Provenance envelope={envelope} />
          </>
        )}
      </DataBoundary>
    </>
  )
}
