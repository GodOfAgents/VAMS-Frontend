const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1'])

function parseBoolean(value) {
  return String(value).toLowerCase() === 'true'
}

export function validateGatewayOrigin(value) {
  if (!value) return null

  const origin = new URL(value)
  const isLocal = LOCAL_HOSTS.has(origin.hostname)

  if (!isLocal && origin.protocol !== 'https:') {
    throw new Error('Gateway origin must use HTTPS outside local development.')
  }

  if (origin.username || origin.password || origin.search || origin.hash) {
    throw new Error('Gateway origin cannot include credentials, a query, or a fragment.')
  }

  if (origin.pathname !== '/' && origin.pathname !== '') {
    throw new Error('Gateway origin cannot include a path.')
  }

  return origin.origin
}

export function readEnvironment(source = import.meta.env) {
  const simulationEnabled = parseBoolean(source.VITE_VAMS_SIMULATION_ENABLED)

  return Object.freeze({
    gatewayOrigin: validateGatewayOrigin(source.VITE_VAMS_GATEWAY_ORIGIN),
    environment: source.VITE_VAMS_ENVIRONMENT || (simulationEnabled ? 'SIMULATION' : 'LOCAL'),
    simulationEnabled,
    surface: source.VITE_VAMS_SURFACE || 'all',
    docsUrl: source.VITE_VAMS_DOCS_URL || 'https://github.com/GodOfAgents/VAMS/tree/main/docs',
  })
}

export const appEnvironment = readEnvironment()
