import { ThemeProvider } from './ThemeProvider.jsx'
import { ProtocolProvider } from '../features/protocol/ProtocolProvider.jsx'

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      <ProtocolProvider>{children}</ProtocolProvider>
    </ThemeProvider>
  )
}
