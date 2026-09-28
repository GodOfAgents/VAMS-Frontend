const DEFAULT_METADATA = {
  title: 'VAMS | Sovereign Web4 Infrastructure',
  description: 'VAMS is building sovereign infrastructure for durable, verifiable digital services across independent providers.',
}

const routeMetadata = {
  '/': {
    title: 'VAMS — Sovereign infrastructure for Web4',
    description: 'Explore VAMS: portable identity, governed execution, independent evidence, recoverable state, and accountable infrastructure.',
  },
  '/protocol': {
    title: 'Protocol architecture & developer guide | VAMS',
    description: 'Explore VAMS architecture, authority boundaries, composition, execution, evidence, recovery, and source-backed Gateway examples. Pre-testnet; deployment pending.',
  },
  '/network': {
    title: 'Network architecture & provider guide | VAMS',
    description: 'Understand VAMS nodes, Service Blocks, provider selection, data availability evidence, and source-backed read-only Gateway routes. Pre-testnet; deployment pending.',
  },
  '/build': {
    title: 'Build portable services | VAMS',
    description: 'Explore VAMS blueprints, service blocks, and the boundaries for building portable, inspectable digital services.',
  },
  '/operate': {
    title: 'Operator requirements | VAMS',
    description: 'Review VAMS operator responsibilities, participation requirements, and pre-testnet release gates.',
  },
  '/research': {
    title: 'Research and evidence | VAMS',
    description: 'Trace VAMS research foundations to implementation surfaces, maturity states, verification evidence, and open pre-testnet gates.',
  },
  '/status': {
    title: 'Verification status | VAMS',
    description: 'Review the current VAMS pre-testnet readiness, verified evidence, unresolved gates, and public capability boundaries.',
  },
  '/overview': {
    title: 'Read-only network overview | VAMS',
    description: 'Inspect the VAMS read-only explorer overview and its current data provenance and availability state.',
  },
  '/nodes': {
    title: 'Node records | VAMS',
    description: 'Inspect available VAMS node records, capabilities, and evidence through the read-only explorer.',
  },
  '/blueprints': {
    title: 'Blueprint registry | VAMS',
    description: 'Inspect VAMS service blueprints and their declared requirements through the read-only explorer.',
  },
  '/service-blocks': {
    title: 'Service Block registry | VAMS',
    description: 'Inspect VAMS Service Block records, capability declarations, and provenance through the read-only explorer.',
  },
  '/data-availability': {
    title: 'Data availability evidence | VAMS',
    description: 'Inspect VAMS data availability records and their reported evidence through the read-only explorer.',
  },
  '/evidence': {
    title: 'Evidence registry | VAMS',
    description: 'Inspect source-backed VAMS evidence records while preserving the boundary between implementation, deployment, and live observation.',
  },
  '/system': {
    title: 'System information | VAMS',
    description: 'Review VAMS explorer configuration, environment, provenance, and current system availability.',
  },
}

const detailRoutes = [
  [/^\/nodes\/[^/]+$/, { title: 'Node record | VAMS', description: 'Inspect a VAMS node record, its reported capabilities, and available evidence.' }],
  [/^\/blueprints\/[^/]+$/, { title: 'Blueprint record | VAMS', description: 'Inspect a VAMS blueprint, declared service requirements, and available evidence.' }],
  [/^\/service-blocks\/[^/]+$/, { title: 'Service Block record | VAMS', description: 'Inspect a VAMS Service Block record, capability declarations, and provenance.' }],
]

export function getRouteMetadata(pathname) {
  if (routeMetadata[pathname]) return routeMetadata[pathname]
  return detailRoutes.find(([pattern]) => pattern.test(pathname))?.[1] || DEFAULT_METADATA
}

function setMeta(selector, attribute, value) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement('meta')
    const [name, content] = attribute
    element.setAttribute(name, content)
    document.head.append(element)
  }
  element.setAttribute('content', value)
}

export function applyRouteMetadata(pathname) {
  const metadata = getRouteMetadata(pathname)
  document.title = metadata.title
  setMeta('meta[name="description"]', ['name', 'description'], metadata.description)
  setMeta('meta[property="og:title"]', ['property', 'og:title'], metadata.title)
  setMeta('meta[property="og:description"]', ['property', 'og:description'], metadata.description)
  setMeta('meta[name="twitter:title"]', ['name', 'twitter:title'], metadata.title)
  setMeta('meta[name="twitter:description"]', ['name', 'twitter:description'], metadata.description)
}
