import { ThemeProvider } from './ThemeProvider.jsx'
import { ProtocolProvider } from '../features/protocol/ProtocolProvider.jsx'
import { ResponsiveMotionProvider } from '../motion/ResponsiveMotionProvider.jsx'

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ResponsiveMotionProvider>
        <ProtocolProvider>{children}</ProtocolProvider>
      </ResponsiveMotionProvider>
    </ThemeProvider>
  )
}
