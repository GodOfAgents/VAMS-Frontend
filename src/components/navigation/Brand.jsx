import { Link } from 'react-router-dom'
import logo from '../../assets/vams-logo-mark.png'

export function Brand({ to = '/', compact = false }) {
  return (
    <Link className={`brand ${compact ? 'brand--compact' : ''}`} to={to} aria-label="VAMS home">
      <img src={logo} alt="" width="576" height="120" />
    </Link>
  )
}
