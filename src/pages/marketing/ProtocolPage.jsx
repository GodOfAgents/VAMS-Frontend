import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { SmokeText } from '../../motion/primitives.jsx'
import { ArrowRight, Check, Copy, ExternalLink } from 'lucide-react'
import './ProtocolPage.css'

const sourceRoot = 'https://github.com/GodOfAgents/VAMS/blob/main/'
const sources = {
  architecture: { label: 'Current architecture', href: `${sourceRoot}docs/ARCHITECTURE.md`, verified: '2026-07-13' },
  api: { label: 'Gateway API reference', href: `${sourceRoot}docs/API_REFERENCE.md`, verified: '2026-07-12' },
  status: { label: 'Repository status report', href: `${sourceRoot}REPO_STATUS_REPORT.md`, verified: '2026-07-25' },
}

const flow = [
  ['01', 'Request', 'A service declares the outcome and capabilities it needs.'],
  ['02', 'Authority', 'Consent and policy bound what the service may do.'],
  ['03', 'Compose', 'The Gateway and Composer match requirements to eligible resources.'],
  ['04', 'Execute', 'A Neuron performs work within the authorized boundary.'],
  ['05', 'Evidence', 'Telemetry, receipts, and state commitments make claims inspectable.'],
  ['06', 'Recover', 'Durable state and current authority inform a controlled provider change.'],
]

const components = [
  ['Heart & Brain', 'The Brain proposes plans; the Heart enforces consent, policy, and revocation before effects.', 'Authority boundary'],
  ['Gateway & Composer', 'The Gateway exposes control and inspection surfaces. The Composer scores candidate resources against declared requirements.', 'Control plane'],
  ['Neuron runtime', 'The execution runtime connects routing, SDK capabilities, state, telemetry, and agent work.', 'Execution plane'],
  ['Sentinel & evidence', 'Sentinel observations and challenge signals complement receipts and state commitments; none alone proves live operation.', 'Observation plane'],
]

const examples = {
  health: { label: 'Health', path: '/health', purpose: 'Inspect Gateway health and version.' },
  nodes: { label: 'Nodes', path: '/nodes', purpose: 'List node records known to a configured Gateway.' },
  blueprints: { label: 'Blueprints', path: '/compose/blueprints', purpose: 'Inspect available composition blueprints.' },
}

const faqs = [
  ['Does VAMS run its own consensus?', 'No separate VAMS consensus algorithm is claimed here. The architecture assigns authority by state domain and targets underlying Polygon and Cardano environments for different responsibilities. Each domain has one authoritative writer at a time; cross-host proofs synchronize commitments without creating a second valid history.'],
  ['Are Polygon Amoy and Cardano Pre-Prod live?', 'They are intended testnet environments. The repository documents implementation surfaces, but does not provide public deployment evidence for either host.'],
  ['Can I call these Gateway examples against a public endpoint?', 'Not from this page. The routes are documented in source, but a public production endpoint is not claimed. Configure and secure a local Gateway before trying the copyable examples.'],
  ['Can a dry-run create a service or transfer value?', 'No. The frontend explorer simulation is explicitly non-mutating. Deployment, wallet transactions, staking, rewards, and settlement remain outside the current public read-only surface.'],
]

function SourceLink({ source, children }) {
  return <a className="protocol-source" href={source.href} target="_blank" rel="noreferrer">{children || source.label}<ExternalLink size={13} aria-hidden="true" /><span className="sr-only"> (opens in a new tab)</span></a>
}

function SectionHeading({ index, eyebrow, title, description, id }) {
  return <div className="protocol-section-heading">
    <span className="protocol-index" aria-hidden="true">{index}</span>
    <div><p className="protocol-kicker">{eyebrow}</p><SmokeText as="h2" id={id} className="smoke-text--heading" mode="words" phrases={[title]} triggerOnView />{description && <p>{description}</p>}</div>
  </div>
}

function ArchitectureFlow() {
  return <div className="protocol-flow-panel">
    <div className="protocol-flow-panel__top"><span className="protocol-kicker">Request → recovery</span><span>Conceptual flow · not live telemetry</span></div>
    <ol className="protocol-flow" aria-label="Protocol request and recovery flow">
      {flow.map(([number, title, detail]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p></li>)}
    </ol>
    <p className="protocol-flow-panel__note">Text equivalent: a request passes authority checks, resource composition, bounded execution, and evidence capture before any recovery decision.</p>
  </div>
}

function CodeExamples() {
  const [language, setLanguage] = useState('curl')
  const [endpoint, setEndpoint] = useState('health')
  const [copyStatus, setCopyStatus] = useState('')
  const tabs = useRef([])
  const sample = examples[endpoint]
  const snippets = {
    curl: `# Set this to your configured local Gateway; no public URL is implied.\nexport GATEWAY_BASE_URL="YOUR_LOCAL_GATEWAY_URL"\ncurl --fail-with-body "$GATEWAY_BASE_URL${sample.path}"`,
    javascript: `// Use a configured local Gateway; no public URL is implied.\nconst gatewayBaseUrl = 'YOUR_LOCAL_GATEWAY_URL'\nconst response = await fetch(\`\${gatewayBaseUrl}${sample.path}\`)\nif (!response.ok) throw new Error(\`Gateway returned \${response.status}\`)\nconst result = await response.json()\nconsole.log(result)`,
  }
  const code = snippets[language]
  const languages = [['curl', 'cURL'], ['javascript', 'JavaScript']]

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

  return <div className="protocol-code-card">
    <div className="protocol-code-card__intro">
      <div><p className="protocol-kicker">Source-implemented routes</p><h3>Inspect, then integrate.</h3><p>{sample.purpose}</p></div>
      <label className="protocol-endpoint">Endpoint
        <select value={endpoint} onChange={(event) => { setEndpoint(event.target.value); setCopyStatus('') }}>
          {Object.entries(examples).map(([key, value]) => <option key={key} value={key}>{value.label} · GET {value.path}</option>)}
        </select>
      </label>
    </div>
    <div className="protocol-code-card__toolbar">
      <div role="tablist" aria-label="Code language" className="protocol-code-tabs">
        {languages.map(([key, label], index) => <button key={key} ref={(node) => { tabs.current[index] = node }} type="button" role="tab" id={`protocol-tab-${key}`} aria-controls="protocol-code-panel" aria-selected={language === key} tabIndex={language === key ? 0 : -1} onClick={() => { setLanguage(key); setCopyStatus('') }} onKeyDown={(event) => selectByKeyboard(event, index)}>{label}</button>)}
      </div>
      <button className="protocol-copy" type="button" onClick={copyCode} aria-label={`Copy ${language === 'curl' ? 'cURL' : 'JavaScript'} example`}>{copyStatus.startsWith('Copied') ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}Copy</button>
    </div>
    <div id="protocol-code-panel" role="tabpanel" aria-labelledby={`protocol-tab-${language}`} tabIndex={0}><pre><code>{code}</code></pre></div>
    <p className="protocol-copy-status" role="status" aria-live="polite">{copyStatus}</p>
    <p className="protocol-code-card__note">Reference only. The Gateway API is implemented in source; live deployment and public availability are not evidenced. <SourceLink source={sources.api} /></p>
  </div>
}

export function ProtocolPage() {
  return <article className="protocol-guide">
    <header className="protocol-hero">
      <div className="protocol-hero__copy"><p className="protocol-kicker">VAMS / protocol / v0.8.0</p><SmokeText mode="words" phrases={['Protocol', 'architecture.']} triggerOnView /><p className="protocol-hero__lead">A developer’s map of authority, composition, execution, evidence, and recovery across independent infrastructure.</p><div className="protocol-hero__actions"><a href="#architecture" className="protocol-primary-link">Explore the architecture <ArrowRight size={17} aria-hidden="true" /></a><Link to="/status" className="protocol-secondary-link">Check readiness</Link></div></div>
      <aside className="protocol-hero__status" aria-label="Protocol lifecycle"><span className="protocol-status-dot" aria-hidden="true" /><div><strong>Hardened pre-testnet candidate</strong><p>No public deployment is claimed. Source implementation, verification, and live observation are distinct evidence states.</p><SourceLink source={sources.status}>Status source · verified {sources.status.verified}</SourceLink></div></aside>
    </header>

    <nav className="protocol-contents" aria-label="On this page"><span>On this page</span><a href="#architecture">Architecture</a><a href="#components">Components</a><a href="#mechanics">Core mechanics</a><a href="#integration">Integration</a><a href="#examples">API examples</a><a href="#faq">FAQ & resources</a></nav>

    <section className="protocol-section" aria-labelledby="architecture">
      <SectionHeading index="01" eyebrow="High-level architecture" title="A service is more than its host." description="VAMS separates who may act, where work runs, what survives, and how a claim is checked. Moving execution should not silently move authority." id="architecture" />
      <ArchitectureFlow />
      <div className="protocol-evidence-line"><SourceLink source={sources.architecture}>Architecture source · verified {sources.architecture.verified}</SourceLink><span>Conceptual model; not deployment evidence</span></div>
    </section>

    <section className="protocol-section" aria-labelledby="components">
      <SectionHeading index="02" eyebrow="Core components" title="Clear boundaries. Composable parts." description="These components have source implementation; their presence in a repository is not proof of a live, secure deployment." id="components" />
      <div className="protocol-component-grid">{components.map(([name, detail, category], index) => <article className="protocol-glass-card" key={name}><span className="protocol-card-number">0{index + 1} / {category}</span><h3>{name}</h3><p>{detail}</p></article>)}</div>
    </section>

    <section className="protocol-section" aria-labelledby="mechanics">
      <SectionHeading index="03" eyebrow="Core mechanics" title="Authority before activity." description="The protocol’s useful guarantees depend on enforcing boundaries—not on assuming every integration is live." id="mechanics" />
      <div className="protocol-mechanics">
        <article><span>01 / Decision boundary</span><h3>Plan ≠ permission</h3><p>Cognitive planning can propose work. Consent, policy, and revocation determine whether a bounded effect may proceed.</p></article>
        <article><span>02 / State continuity</span><h3>One writer per domain</h3><p>Each state domain has exactly one authoritative writer at a time. Cross-host proofs synchronize commitments; they do not create a second valid history.</p></article>
        <article><span>03 / Host roles</span><h3>Execution and governance</h3><p>Polygon Amoy is the intended EVM execution environment. Cardano Pre-Prod is intended for governance, identity, and insurance. Neither deployment is evidenced.</p></article>
        <article><span>04 / Evidence boundary</span><h3>Observe what can be checked</h3><p>Receipts, telemetry, and invariants can support inspection. They do not by themselves establish public deployment, independent assurance, or live observation.</p></article>
      </div>
      <div className="protocol-evidence-line"><SourceLink source={sources.architecture} /><Link to="/evidence">Inspect evidence states <ArrowRight size={14} aria-hidden="true" /></Link></div>
    </section>

    <section className="protocol-section" aria-labelledby="integration">
      <SectionHeading index="04" eyebrow="Developer path" title="Start with inspection." description="Build against documented contracts, validate provenance, and keep deployment-dependent actions behind explicit gates." id="integration" />
      <ol className="protocol-steps">
        <li><span>01</span><div><h3>Read the architecture and lifecycle</h3><p>Map your service’s state, consent, and irreversible effects before choosing providers. Confirm the current release gates.</p></div></li>
        <li><span>02</span><div><h3>Inspect a local Gateway</h3><p>Use documented read-only routes such as <code>GET /health</code>, <code>GET /nodes</code>, and <code>GET /compose/blueprints</code>. Do not assume a public base URL.</p></div></li>
        <li><span>03</span><div><h3>Evaluate composition without side effects</h3><p>Compare blueprint requirements with eligible resources. Explorer simulation, where configured, is a dry run—not service creation or a payment.</p></div></li>
        <li><span>04</span><div><h3>Gate anything live</h3><p>Require environment-specific security, integration, CI, and deployment evidence before relying on live execution, cross-host state, or economics.</p></div></li>
      </ol>
      <div className="protocol-evidence-line"><SourceLink source={sources.api} /><Link to="/overview">Open read-only console <ArrowRight size={14} aria-hidden="true" /></Link></div>
    </section>

    <section className="protocol-section" aria-labelledby="examples">
      <SectionHeading index="05" eyebrow="API examples" title="Copy the contract. Verify the environment." description="These examples show documented Gateway routes for a configured local instance. They do not run requests from this website." id="examples" />
      <CodeExamples />
    </section>

    <section className="protocol-section protocol-section--last" aria-labelledby="faq">
      <SectionHeading index="06" eyebrow="FAQ & resources" title="Know the boundary of every claim." id="faq" />
      <div className="protocol-bottom-grid"><div className="protocol-faq">{faqs.map(([question, answer]) => <details key={question}><summary>{question}<span aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div><aside className="protocol-resources"><p className="protocol-kicker">Primary sources</p><h3>Trace the design to source.</h3><ul>{Object.values(sources).map((source) => <li key={source.href}><SourceLink source={source} /><small>Last verified {source.verified}</small></li>)}</ul><Link to="/research">Explore research and evidence <ArrowRight size={15} aria-hidden="true" /></Link></aside></div>
    </section>
  </article>
}
