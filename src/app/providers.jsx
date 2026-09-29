import { ThemeProvider } from './ThemeProvider.jsx'
import { ProtocolProvider } from '../features/protocol/ProtocolProvider.jsx'
import { ResponsiveMotionProvider } from '../motion/ResponsiveMotionProvider.jsx'
import { GooCursor } from '../motion/GooCursor.jsx'
import '../styles/motionAdaptation.css'

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ResponsiveMotionProvider>
        <ProtocolProvider>{children}</ProtocolProvider>
        <GooCursor />
      </ResponsiveMotionProvider>
    </ThemeProvider>
  )
}
