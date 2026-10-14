import { describe, expect, it } from 'vitest'
import { calculateMorphProgress, clampGlobeZoom, createGridEdges, smootherstep, sphereTarget } from './globeMorph.js'

describe('planetary morph contracts', () => {
  it('starts with the neural field and completes when the globe chapter enters', () => {
    const input = { viewportHeight: 900, globeStart: 1800 }
    expect(calculateMorphProgress({ ...input, scrollY: 0 })).toBe(0)
    expect(calculateMorphProgress({ ...input, scrollY: 144 })).toBe(0)
    expect(calculateMorphProgress({ ...input, scrollY: 1728 })).toBe(1)
    expect(calculateMorphProgress({ ...input, scrollY: 936 })).toBeCloseTo(0.5)
    expect(calculateMorphProgress({ ...input, scrollY: 99999 })).toBe(1)
  })
  it('reverses without accumulated integration state', () => {
    const sample = (scrollY) => smootherstep(calculateMorphProgress({ scrollY, viewportHeight: 800, globeStart: 1500 }))
    const forward = [0, 250, 500, 1000, 1600].map(sample)
    const reverse = [1600, 1000, 500, 250, 0].map(sample).reverse()
    expect(reverse).toEqual(forward)
    expect(smootherstep(0)).toBe(0)
    expect(smootherstep(1)).toBe(1)
    expect(smootherstep(0.5)).toBe(0.5)
  })
  it('maps every source ID to a unique finite point on the target sphere', () => {
    const targets = Array.from({ length: 73 * 49 }, (_, id) => sphereTarget(id, 73, 49))
    const unique = new Set(targets.map((p) => p.map((v) => v.toFixed(8)).join(',')))
    expect(unique.size).toBe(targets.length)
    for (const p of targets) {
      expect(p.every(Number.isFinite)).toBe(true)
      expect(Math.hypot(...p)).toBeCloseTo(3.5, 10)
    }
  })
  it('retains exactly the original sparse grid adjacency without wraparound', () => {
    expect(createGridEdges(2, 2, 2)).toEqual([[0, 2], [0, 6], [2, 8], [6, 8]])
    const edges = createGridEdges(48, 32, 3)
    expect(new Set(edges.map((pair) => pair.join(':'))).size).toBe(edges.length)
    for (const [a, b] of edges) {
      expect(a).toBeGreaterThanOrEqual(0)
      expect(b).toBeLessThan(49 * 33)
      const pa = sphereTarget(a, 49, 33)
      const pb = sphereTarget(b, 49, 33)
      // Local source edges must never become antipodal target arcs.
      expect(pa.reduce((sum, v, k) => sum + v * pb[k], 0) / 3.5 ** 2).toBeGreaterThan(-0.5)
    }
  })
  it('bounds zoom so the globe cannot disappear or engulf the camera', () => {
    expect(clampGlobeZoom(0)).toBe(0.72)
    expect(clampGlobeZoom(100)).toBe(1.35)
    expect(clampGlobeZoom(1)).toBe(1)
  })
})
