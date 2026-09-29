const diagrams = {
  continuity: {
    eyebrow: 'Web 4.0 · continuity',
    title: 'Toward Immortal Execution in a Truly Decentralized Agentic Economy.',
    description: 'People, organizations, applications, agents, builders, operators, and verifiers coordinate useful work. VAMS researches the portable identity, bounded authority, checkable evidence, and responsibility-linked compensation needed to sustain that cooperation.',
  },
  authority: {
    eyebrow: 'Authority model',
    title: 'A navigator cannot open the gate.',
    description: 'The Brain can propose a route. The Heart checks authority before bounded work can proceed.',
    nodes: [
      ['heart', '01', 'Gatekeeper', 'Heart · consent · policy'],
      ['brain', '02', 'Navigator', 'Brain · reason · plan'],
      ['effects', '03', 'Work lane', 'Bounded effects only'],
    ],
    legend: 'Checked authority boundary',
  },
}

export function ArchitectureDiagram({ variant = 'continuity' }) {
  const diagram = diagrams[variant]

  return (
    <figure className={`architecture-diagram architecture-diagram--${variant}`}>
      <figcaption>
        <p className="eyebrow">{diagram.eyebrow}</p>
        <h3>{diagram.title}</h3>
        <p>{diagram.description}</p>
      </figcaption>
      {variant === 'continuity' ? (
        <div className="architecture-diagram__canvas exit-model" role="img" aria-label="Conceptual architecture: a service carries identity, authority, and state as its execution host changes from provider A to an eligible provider B. Deployment is pending.">
          <div className="exit-model__heading"><span>Service continuity model</span><span>Deployment pending</span></div>
          <div className="exit-model__host"><span>01 / Current host</span><strong>Provider A</strong><small>Replaceable execution layer</small></div>
          <div className="exit-model__core">
            <span className="exit-model__rail-label">The service carries forward</span>
            <div className="exit-model__terms"><strong>Identity</strong><strong>Authority</strong><strong>State</strong></div>
          </div>
          <div className="exit-model__host exit-model__host--next"><span>02 / Eligible next host</span><strong>Provider B</strong><small>Subject to policy and evidence</small></div>
          <p className="architecture-diagram__legend">Conceptual path · no live handoff claimed</p>
        </div>
      ) : (
        <div className="architecture-diagram__canvas">
          <ol className="architecture-diagram__flow" aria-label={`${diagram.title} ${diagram.description}`}>
            {diagram.nodes.map(([id, step, label, detail]) => (
              <li className={`architecture-diagram__node architecture-diagram__node--${id}`} key={id}>
                <span className="architecture-diagram__step">{step}</span>
                <strong>{label}</strong>
                <small>{detail}</small>
              </li>
            ))}
          </ol>
          <p className="architecture-diagram__legend">{diagram.legend}</p>
        </div>
      )}
    </figure>
  )
}
