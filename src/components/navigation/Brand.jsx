import { Link } from 'react-router-dom'
import logo from '../../assets/vams-logo.png'

export function Brand({ to = '/', compact = false }) {
  return (
    <Link className={`brand ${compact ? 'brand--compact' : ''}`} to={to} aria-label="VAMS home">
      <img src={logo} alt="" />
      <span>VAMS</span>
    </Link>
  )
}
