import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Copy, ExternalLink } from 'lucide-react'
import { SmokeText } from '../../motion/primitives.jsx'
import { CampaignBridge } from '../../components/marketing/CampaignBridge.jsx'
import './NetworkPage.css'

const sourceRoot = 'https://github.com/GodOfAgents/VAMS/blob/main/'
const sources = {
  architecture: { label: 'Current architecture', href: `${sourceRoot}docs/ARCHITECTURE.md`, verified: '2026-07-13' },
  api: { label: 'Gateway API reference', href: `${sourceRoot}docs/API_REFERENCE.md`, verified: '2026-07-12' },
  status: { label: 'Repository status report', href: `${sourceRoot}REPO_STATUS_REPORT.md`, verified: '2026-07-25' },
}

const navigation = [
  ['architecture', 'Architecture'],
  ['components', 'Components'],
  ['provider-mechanics', 'Provider mechanics'],
  ['inspect', 'Developer path'],
  ['examples', 'API examples'],
  ['use-cases', 'Use cases'],
  ['faq', 'FAQ & sources'],
]

const flow = [
  ['01', 'Declare', 'A service describes required capabilities and constraints.'],
  ['02', 'Discover', 'Gateway records expose known nodes and Service Blocks.'],
  ['03', 'Match', 'Composer compares requirements with candidate resources.'],
  ['04', 'Run', 'Eligible Neurons provide bounded execution capabilities.'],
  ['05', 'Observe', 'State, DA status, and independent signals inform verification and recovery.'],
]

const components = [
  ['Neuron nodes', 'Execution hosts with declared resources, region, skills, and telemetry. A registry entry is not proof that a host is currently reachable.', 'Runtime'],
  ['Service Blocks', 'Composable capabilities described by metadata and requirements. Mock and live integration boundaries must remain visible.', 'Capability'],
  ['Gateway & registry', 'The source-implemented control plane exposes node, Service Block, composition, and status routes. Live configuration requires separate verification.', 'Control plane'],
  ['Composer', 'Matches blueprint requirements to candidates using documented scoring. A score is a selection aid, not an availability guarantee.', 'Selection'],
  ['Data availability', 'DA adapters and status records support state continuity. An adapter existing in source does not establish independently retrieved live evidence.', 'Persistence'],
  ['Sentinel', 'Independent observations and challenge signals can contest claims; they complement, rather than replace, authenticated receipts.', 'Observation'],
]

const endpoints = {
  nodes: { label: 'Nodes', path: '/nodes', purpose: 'Inspect node records known to the configured Gateway.' },
  blocks: { label: 'Service Blocks', path: '/services/blocks', purpose: 'Inspect registered Service Block metadata.' },
  da: { label: 'DA status', path: '/da/status', purpose: 'Inspect configured data-availability route status.' },
}

const faqs = [
  ['Are listed nodes necessarily live and available?', 'No. GET /nodes reports records known to a configured Gateway. Fresh, authenticated telemetry and independent live-route evidence are separate requirements before a provider should be treated as available.'],
  ['Does Composer choose network consensus?', 'No. Composer scores candidate resources against requirements. VAMS does not claim a separate provider-selection consensus algorithm. Authority and cross-host commitments are described in the protocol architecture.'],
  ['Are DA providers ready for production use?', 'Not by inclusion in source. The current status report requires real submission, independent retrieval, and payload-match evidence. Several mock or incomplete adapter paths remain release-ineligible.'],
  ['Can this page register a node or start an instance?', 'No. This is a read-only guide. The examples are local Gateway references and do not send requests from the website. Registration, composition writes, and economic actions are outside this public page.'],
]

function SourceLink({ source, children }) {
  return <a className="network-source" href={source.href} target="_blank" rel="noreferrer">{children || source.label}<ExternalLink size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
}

function SectionHeading({ id, index, eyebrow, title, description }) {
  return <div className="network-section-heading">
    <span className="network-index" aria-hidden="true">{index}</span>
    <div><p className="network-kicker">{eyebrow}</p><SmokeText as="h2" id={id} className="smoke-text--heading" mode="words" phrases={[title]} triggerOnView />{description && <p>{description}</p>}</div>
  </div>
}

function NetworkFlow() {
  return <div className="network-flow-panel">
    <div className="network-flow-panel__top"><span className="network-kicker">Requirements → evidence</span><span>Conceptual model · not live telemetry</span></div>
    <ol className="network-flow" aria-label="Network architecture flow">
      {flow.map(([number, title, detail]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p></li>)}
    </ol>
    <p className="network-flow-panel__note">Text equivalent: a service declares requirements; the Gateway exposes known resources; Composer scores candidates; an eligible Neuron runs bounded work; evidence informs later verification and recovery.</p>
  </div>
}

function CodeExamples() {
  const [language, setLanguage] = useState('curl')
  const [endpoint, setEndpoint] = useState('nodes')
  const [copyStatus, setCopyStatus] = useState('')
  const tabs = useRef([])
  const sample = endpoints[endpoint]
  const languages = [['curl', 'cURL'], ['javascript', 'JavaScript']]
  const code = language === 'curl'
    ? `# Supply the URL of your configured local Gateway. No public endpoint is implied.\nGATEWAY_BASE_URL="YOUR_LOCAL_GATEWAY_URL"\ncurl --fail-with-body "$GATEWAY_BASE_URL${sample.path}"`
    : `// Supply the URL of your configured local Gateway.\nconst gatewayBaseUrl = 'YOUR_LOCAL_GATEWAY_URL'\nconst response = await fetch(\`\${gatewayBaseUrl}${sample.path}\`)\nif (!response.ok) throw new Error(\`Gateway returned \${response.status}\`)\nconst result = await response.json()\nconsole.log(result)`

  function selectByKeyboard(event, index) {
    const next = event.key === 'ArrowRight' ? (index + 1) % languages.length
      : event.key === 'ArrowLeft' ? (index + languages.length - 1) % languages.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? languages.length - 1 : -1
    if (next < 0) return
    event.preventDefault()
    setLanguage(languages[next][0])
    setCopyStatus('')
    tabs.current[next]?.focus()
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopyStatus(`Copied ${language === 'curl' ? 'cURL' : 'JavaScript'} example`)
    } catch {
      setCopyStatus('Copy unavailable. Select the code to copy it manually.')
    }
  }

  return <div className="network-code-card">
    <div className="network-code-card__intro"><div><p className="network-kicker">Source-implemented · read-only</p><h3>Inspect before integrating.</h3><p>{sample.purpose}</p></div><label className="network-endpoint">Read-only endpoint<select value={endpoint} onChange={(event) => { setEndpoint(event.target.value); setCopyStatus('') }}>{Object.entries(endpoints).map(([key, value]) => <option key={key} value={key}>{value.label} · GET {value.path}</option>)}</select></label></div>
    <div className="network-code-card__toolbar"><div role="tablist" aria-label="Code language" className="network-code-tabs">{languages.map(([key, label], index) => <button key={key} ref={(node) => { tabs.current[index] = node }} type="button" role="tab" id={`network-tab-${key}`} aria-controls="network-code-panel" aria-selected={language === key} tabIndex={language === key ? 0 : -1} onClick={() => { setLanguage(key); setCopyStatus('') }} onKeyDown={(event) => selectByKeyboard(event, index)}>{label}</button>)}</div><button className="network-copy" type="button" onClick={copyCode} aria-label={`Copy ${language === 'curl' ? 'cURL' : 'JavaScript'} example`}>{copyStatus.startsWith('Copied') ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}Copy</button></div>
    <div id="network-code-panel" role="tabpanel" aria-labelledby={`network-tab-${language}`} tabIndex={0}><pre><code>{code}</code></pre></div>
    <p className="network-copy-status" role="status" aria-live="polite">{copyStatus}</p>
    <p className="network-code-card__note">Reference only; not a live public API endpoint. <SourceLink source={sources.api}>Gateway API reference · verified {sources.api.verified}</SourceLink></p>
  </div>
}

export function NetworkPage() {
  return <article className="network-guide">
    <header className="network-hero">
      <div><p className="network-kicker">VAMS / network / pre-testnet</p><SmokeText mode="words" phrases={['Independent', 'infrastructure.']} triggerOnView /><p className="network-hero__lead">A map of the resources behind a portable service—and the evidence needed before any provider can be trusted in operation.</p><div className="network-hero__actions"><a className="network-primary-link" href="#architecture">Explore the network <ArrowRight size={17} aria-hidden="true" /></a><Link className="network-secondary-link" to="/nodes">Inspect node records</Link></div></div>
      <aside className="network-hero__status" aria-label="Network lifecycle"><span className="network-status-dot" aria-hidden="true" /><div><strong>Hardened pre-testnet candidate</strong><p>No public deployment is claimed. Source implementation, local checks, and independently observed live operation are different evidence states.</p><SourceLink source={sources.status}>Status report · verified {sources.status.verified}</SourceLink></div></aside>
    </header>

    <CampaignBridge number="02 / Network" question="Can the next host be trusted?" answer="A candidate's declared capabilities need eligibility checks and current evidence before a provider change can be relied on." terms={['Requirements', 'Eligibility', 'Evidence']} to="/status" action="Review release gates" />

    <nav className="network-contents" aria-label="On this page"><span>On this page</span>{navigation.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav>

    <section className="network-section" aria-labelledby="architecture"><SectionHeading id="architecture" index="01" eyebrow="High-level architecture" title="From requirements to accountable resources." description="The network connects a service's needs to candidate capabilities, then keeps the claim of availability separate from proof of operation." /><NetworkFlow /><div className="network-evidence-line"><SourceLink source={sources.architecture}>Architecture source · verified {sources.architecture.verified}</SourceLink><span>Conceptual flow · deployment pending</span></div></section>

    <section className="network-section" aria-labelledby="components"><SectionHeading id="components" index="02" eyebrow="Network components" title="Separate roles. Inspectable claims." description="These are architectural and source-implemented surfaces—not a directory of verified live providers." /><div className="network-component-grid">{components.map(([name, detail, role], index) => <article className="network-glass-card" key={name}><span className="network-card-number">0{index + 1} / {role}</span><h3>{name}</h3><p>{detail}</p></article>)}</div><div className="network-evidence-line"><SourceLink source={sources.architecture}>Component architecture · verified {sources.architecture.verified}</SourceLink><SourceLink source={sources.status}>Maturity and readiness · verified {sources.status.verified}</SourceLink></div></section>

    <section className="network-section" aria-labelledby="provider-mechanics"><SectionHeading id="provider-mechanics" index="03" eyebrow="Provider mechanics" title="A match is not a guarantee." description="Selection is an evidence-aware decision process. It is not a new consensus algorithm or proof that a provider is available now." /><div className="network-mechanics"><article><span>01 / Discovery</span><h3>What is declared?</h3><p>Registry metadata describes capabilities and geography. Gateway node and Service Block routes expose records, not verified uptime.</p></article><article><span>02 / Eligibility</span><h3>What can be matched?</h3><p>Composer evaluates requirements against candidate resources. Real telemetry must still be mapped and checked before a score informs an operational choice.</p></article><article><span>03 / Evidence</span><h3>What is observed?</h3><p>Authenticated telemetry, DA retrieval, and Sentinel signals have distinct proof roles. Missing or mock evidence must not be silently promoted to live status.</p></article></div><dl className="network-evidence-tiers"><div><dt>Source implemented</dt><dd>Gateway routes, Neuron modules, and Composer logic exist in the repository.</dd></div><div><dt>Locally verified</dt><dd>The status report records local checks; exact-commit CI evidence remains a separate gate.</dd></div><div><dt>Deployment / live pending</dt><dd>Public provider, DA, and independent-observation evidence is not supplied here.</dd></div></dl><div className="network-evidence-line"><SourceLink source={sources.status}>Readiness evidence · verified {sources.status.verified}</SourceLink><Link to="/protocol">Read protocol architecture <ArrowRight size={14} aria-hidden="true" /></Link></div></section>

    <section className="network-section" aria-labelledby="inspect"><SectionHeading id="inspect" index="04" eyebrow="Developer path" title="Inspect first. Integrate deliberately." description="Start with read-only records and source contracts. Treat execution, registration, and economic actions as separately gated work." /><ol className="network-steps"><li><span>01</span><div><h3>Read the boundaries</h3><p>Map required compute, data, trust, and recovery needs. Confirm current release gates before designing around a provider.</p></div></li><li><span>02</span><div><h3>Inspect a local Gateway</h3><p>Use documented GET routes for nodes, Service Blocks, and DA status. Verify provenance, freshness, and error states rather than assuming every record is live.</p></div></li><li><span>03</span><div><h3>Compare candidates</h3><p>Review blueprint requirements and Composer concepts, then validate live telemetry and independent evidence in your own configured environment.</p></div></li><li><span>04</span><div><h3>Keep writes gated</h3><p>Do not treat a dry run or read-only console view as a deployment, registration, payment, or availability commitment.</p></div></li></ol><div className="network-evidence-line"><Link to="/overview">Open read-only console <ArrowRight size={14} aria-hidden="true" /></Link><Link to="/status">Review release gates <ArrowRight size={14} aria-hidden="true" /></Link></div></section>

    <section className="network-section" aria-labelledby="examples"><SectionHeading id="examples" index="05" eyebrow="Gateway examples" title="Copy the route. Verify the host." description="These snippets document source-implemented read-only routes for a configured local Gateway; this website sends no requests." /><CodeExamples /></section>

    <section className="network-section" aria-labelledby="use-cases"><SectionHeading id="use-cases" index="06" eyebrow="Developer use cases" title="Design for an exit path." description="Use the network model to ask sharper questions before depending on an external provider." /><div className="network-use-cases"><article><span className="network-card-number">01 / Portable service</span><h3>Plan a provider change</h3><p>Define which identity, permissions, and state must outlive one execution host; review recovery assumptions in the protocol guide.</p></article><article><span className="network-card-number">02 / Capability sourcing</span><h3>Compare service needs</h3><p>Describe compute, storage, model, and trust requirements, then inspect matching records without confusing declarations with proof.</p></article><article><span className="network-card-number">03 / Evidence review</span><h3>Challenge a claim</h3><p>Trace DA status and independent observation requirements before treating a receipt or telemetry signal as sufficient assurance.</p></article></div></section>

    <section className="network-section network-section--last" aria-labelledby="faq"><SectionHeading id="faq" index="07" eyebrow="FAQ & sources" title="Know what the network proves." /><div className="network-bottom-grid"><div className="network-faq">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div><aside className="network-resources"><p className="network-kicker">Primary sources</p><h3>Follow the evidence.</h3><ul>{Object.values(sources).map((source) => <li key={source.href}><SourceLink source={source} /><small>Last verified {source.verified}</small></li>)}</ul><p>External documents describe architecture and source status. They do not establish live deployment.</p><Link to="/evidence">Inspect evidence registry <ArrowRight size={15} aria-hidden="true" /></Link></aside></div></section>
  </article>
}
