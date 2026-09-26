import { Pause, Play } from 'lucide-react'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'

export function MotionToggle() {
  const { paused, systemReducedMotion, togglePaused } = useResponsiveMotion()
  return <button className="icon-button motion-toggle" type="button" onClick={togglePaused}
    disabled={systemReducedMotion} aria-pressed={paused || systemReducedMotion}
    aria-label={systemReducedMotion ? 'Reduced motion enabled by your device' : paused ? 'Resume animation' : 'Pause animation'}
    title={systemReducedMotion ? 'Reduced motion enabled by your device' : paused ? 'Resume animation' : 'Pause animation'}>
    {paused || systemReducedMotion ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
  </button>
}
