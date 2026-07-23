import { describe, expect, it, vi } from 'vitest'
import { ExplorerClient, ProtocolApiError } from './client.js'

describe('ExplorerClient', () => {
  it('never substitutes simulation when the Gateway is unconfigured', async () => {
    const client = new ExplorerClient()
    await expect(client.get('nodes')).rejects.toMatchObject({
      details: { code: 'GATEWAY_NOT_CONFIGURED' },
    })
  })

  it('exposes persistent simulated provenance only when explicitly enabled', async () => {
    const client = new ExplorerClient({ simulationEnabled: true })
    const result = await client.get('nodes')
    expect(result.provenance).toBe('SIMULATED')
    expect(result.source).toBe('explicit-local-simulation-fixture')
    expect(result.data.length).toBeGreaterThan(0)
  })

  it('rejects malformed Gateway envelopes', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    })
    const client = new ExplorerClient({ origin: 'https://gateway.example.com', fetchImpl })
    await expect(client.get('nodes')).rejects.toBeInstanceOf(ProtocolApiError)
    await expect(client.get('nodes')).rejects.toMatchObject({
      details: { code: 'MALFORMED_GATEWAY_RESPONSE' },
    })
  })

  it('returns a non-mutating explainable dry-run', async () => {
    const client = new ExplorerClient({ simulationEnabled: true })
    const result = await client.simulate({ blueprint_id: 'bp_research_verified_v1' })
    expect(result.provenance).toBe('SIMULATED')
    expect(result.data.mutating).toBe(false)
    expect(result.data.candidates[0]).toEqual(expect.objectContaining({
      score: expect.any(Number),
      strengths: expect.any(Array),
      shortfalls: expect.any(Array),
      exclusions: expect.any(Array),
    }))
  })
})
