import { ProtocolProvider } from '../features/protocol/ProtocolProvider.jsx'
import { ResponsiveMotionProvider } from '../motion/ResponsiveMotionProvider.jsx'

export function AppProviders({ children }) {
  return (
    <ResponsiveMotionProvider>
      <ProtocolProvider>{children}</ProtocolProvider>
    </ResponsiveMotionProvider>
  )
}
