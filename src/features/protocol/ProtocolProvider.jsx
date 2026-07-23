import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { appEnvironment } from '../../config/environment.js'
import { effectiveCapabilities } from '../../config/capabilities.js'
import { ExplorerClient } from '../../lib/api/client.js'

const ProtocolContext = createContext(null)

export function ProtocolProvider({ children, environment = appEnvironment, client: suppliedClient }) {
  const client = useMemo(
    () => suppliedClient || new ExplorerClient({
      origin: environment.gatewayOrigin,
      simulationEnabled: environment.simulationEnabled,
    }),
    [environment.gatewayOrigin, environment.simulationEnabled, suppliedClient],
  )
  const [resources, setResources] = useState({})

  const load = useCallback(async (key) => {
    setResources((current) => ({
      ...current,
      [key]: { ...current[key], loading: true, error: null },
    }))
    try {
      const result = await client.get(key)
      setResources((current) => ({ ...current, [key]: { loading: false, result, error: null } }))
      return result
    } catch (error) {
      setResources((current) => ({ ...current, [key]: { loading: false, result: null, error } }))
      return null
    }
  }, [client])

  const gatewayCapabilities = resources.meta?.result?.data?.capabilities || {}
  const capabilities = effectiveCapabilities(gatewayCapabilities)

  const value = useMemo(() => ({
    environment,
    client,
    resources,
    load,
    capabilities,
  }), [environment, client, resources, load, capabilities])

  return <ProtocolContext.Provider value={value}>{children}</ProtocolContext.Provider>
}

export function useProtocol() {
  const context = useContext(ProtocolContext)
  if (!context) throw new Error('useProtocol must be used within ProtocolProvider.')
  return context
}
