import { describe, expect, it } from 'vitest'
import { readEnvironment, validateGatewayOrigin } from './environment.js'

describe('Gateway origin validation', () => {
  it('allows HTTP only for local development', () => {
    expect(validateGatewayOrigin('http://127.0.0.1:8000')).toBe('http://127.0.0.1:8000')
    expect(() => validateGatewayOrigin('http://gateway.example.com')).toThrow(/HTTPS/)
  })

  it('rejects credentials, paths, queries, and fragments', () => {
    expect(() => validateGatewayOrigin('https://user:secret@gateway.example.com')).toThrow()
    expect(() => validateGatewayOrigin('https://gateway.example.com/v1')).toThrow()
    expect(() => validateGatewayOrigin('https://gateway.example.com?token=x')).toThrow()
    expect(() => validateGatewayOrigin('https://gateway.example.com#meta')).toThrow()
  })

  it('requires explicit simulation configuration', () => {
    expect(readEnvironment({ VITE_VAMS_SIMULATION_ENABLED: 'false' }).simulationEnabled).toBe(false)
    expect(readEnvironment({ VITE_VAMS_SIMULATION_ENABLED: 'true' }).simulationEnabled).toBe(true)
  })
})
