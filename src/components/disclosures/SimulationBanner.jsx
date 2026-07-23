import { FlaskConical } from 'lucide-react'
import { useProtocol } from '../../features/protocol/ProtocolProvider.jsx'

export function SimulationBanner() {
  const { environment } = useProtocol()
  if (!environment.simulationEnabled) return null

  return (
    <div className="simulation-banner" role="status">
      <FlaskConical aria-hidden="true" size={16} />
      <strong>SIMULATED</strong>
      <span>All nodes, costs, profiles, telemetry, and matching results are synthetic. No deployed activity is claimed.</span>
    </div>
  )
}
