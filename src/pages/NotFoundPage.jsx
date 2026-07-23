import { Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader.jsx'

export function NotFoundPage() {
  return (
    <div className="not-found">
      <PageHeader eyebrow="404" title="This protocol route does not exist." description="Return to the public site or open the read-only console." />
      <div><Link className="button" to="/">Protocol site</Link><Link className="button button--ghost" to="/overview">Open console</Link></div>
    </div>
  )
}
