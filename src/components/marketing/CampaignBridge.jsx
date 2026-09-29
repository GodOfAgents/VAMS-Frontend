import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function CampaignBridge({ number, question, answer, terms, to, action }) {
  return (
    <section className="campaign-bridge" aria-label="The exit test">
      <div className="campaign-bridge__index"><span>The exit test</span><strong>{number}</strong></div>
      <div className="campaign-bridge__message">
        <h2>{question}</h2>
        <p>{answer}</p>
      </div>
      <div className="campaign-bridge__path">
        <ol aria-label="Continuity requirements">{terms.map((term) => <li key={term}>{term}</li>)}</ol>
        <p>Conceptual framework · deployment pending</p>
        <Link to={to}>{action} <ArrowRight size={15} aria-hidden="true" /></Link>
      </div>
    </section>
  )
}
