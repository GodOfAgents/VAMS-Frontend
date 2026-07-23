import { useEffect } from 'react'
import { useProtocol } from './ProtocolProvider.jsx'

export function useResource(key) {
  const { resources, load } = useProtocol()
  const resource = resources[key]

  useEffect(() => {
    if (!resource) load(key)
  }, [key, load, resource])

  return resource || { loading: true, result: null, error: null }
}
