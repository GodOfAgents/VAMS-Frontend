import { Accessibility } from 'lucide-react'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'

export function MotionPreferenceToggle() {
  const { reducedMotion, systemReducedMotion, userReducedMotion, setUserReducedMotion } = useResponsiveMotion()
  const label = systemReducedMotion
    ? 'Reduced motion is enabled by your device settings'
    : userReducedMotion ? 'Turn off reduced motion' : 'Reduce motion'

  return (
    <button
      className="icon-button motion-preference-toggle"
      type="button"
      aria-label={label}
      aria-pressed={reducedMotion}
      title={label}
      disabled={systemReducedMotion}
      onClick={() => setUserReducedMotion(!userReducedMotion)}
    >
      <Accessibility aria-hidden="true" size={18} />
    </button>
  )
}
