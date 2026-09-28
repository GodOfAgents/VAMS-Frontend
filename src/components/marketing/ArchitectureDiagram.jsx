const diagrams = {
  continuity: {
    eyebrow: 'Continuity model',
    title: 'The service changes vehicles, not identity.',
    description: 'Think of infrastructure as a vehicle: authority and durable state travel with the service when execution moves.',
    nodes: [
      ['authority', '01', 'Passport', 'Authority · consent'],
      ['provider-a', '02', 'Current vehicle', 'Provider A · current host'],
      ['state', '03', 'Service core', 'Identity · progress · recovery'],
      ['provider-b', '04', 'Next vehicle', 'Provider B · eligible host'],
    ],
    legend: 'Verified handoff path',
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
    </figure>
  )
}
