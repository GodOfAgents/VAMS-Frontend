const dimensions = {
  K: 'General knowledge',
  RW: 'Reading and writing',
  M: 'Mathematical ability',
  R: 'Fluid reasoning',
  WM: 'Working memory',
  MS: 'Memory storage',
  MR: 'Memory retrieval',
  V: 'Visual processing',
  A: 'Auditory processing',
  S: 'Processing speed',
}

export function CognitiveProfile({ values = {} }) {
  return (
    <div className="chc-profile">
      <div className="chc-profile__visual" aria-hidden="true">
        {Object.entries(dimensions).map(([key]) => (
          <div key={key}><span>{key}</span><i style={{ '--value': `${(values[key] || 0) * 100}%` }} /></div>
        ))}
      </div>
      <table>
        <caption>Accessible CHC cognitive profile values</caption>
        <thead><tr><th>Dimension</th><th>Code</th><th>Capability</th></tr></thead>
        <tbody>
          {Object.entries(dimensions).map(([key, label]) => (
            <tr key={key}><td>{label}</td><td>{key}</td><td>{Math.round((values[key] || 0) * 100)}%</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
