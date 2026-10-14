import { describe, expect, it } from 'vitest'
import { canEnhanceLiquidGlass } from './LiquidGlass.jsx'

const desktop = {
  isDesktop: true,
  coarsePointer: false,
  reducedMotion: false,
  lowPower: false,
}

describe('liquid navigation capability', () => {
  it('enables the renderer only for a full-motion fine-pointer desktop', () => {
    expect(canEnhanceLiquidGlass(desktop)).toBe(true)
    expect(canEnhanceLiquidGlass({ ...desktop, isDesktop: false })).toBe(false)
    expect(canEnhanceLiquidGlass({ ...desktop, coarsePointer: true })).toBe(false)
    expect(canEnhanceLiquidGlass({ ...desktop, reducedMotion: true })).toBe(false)
    expect(canEnhanceLiquidGlass({ ...desktop, lowPower: true })).toBe(false)
    expect(canEnhanceLiquidGlass({ ...desktop, surface: 'console' })).toBe(false)
    expect(canEnhanceLiquidGlass({ ...desktop, surface: 'status' })).toBe(false)
  })
})
