import { describe, expect, it } from 'vitest'
import { effectiveCapabilities, FRONTEND_CAPABILITIES, intersectCapabilities } from './capabilities.js'

describe('capability intersection', () => {
  it('fails closed when the Gateway advertises nothing', () => {
    expect(intersectCapabilities(FRONTEND_CAPABILITIES, {})).toEqual(
      expect.objectContaining({
        compositionDryRun: false,
        walletConnection: false,
        staking: false,
      }),
    )
  })

  it('requires both frontend and Gateway support', () => {
    const result = intersectCapabilities(FRONTEND_CAPABILITIES, {
      compositionDryRun: true,
      walletConnection: true,
      staking: true,
    })
    expect(result.compositionDryRun).toBe(true)
    expect(result.walletConnection).toBe(false)
    expect(result.staking).toBe(false)
  })

  it('keeps the explorer read-only', () => {
    expect(effectiveCapabilities({ readOnly: false }).readOnly).toBe(true)
  })
})
