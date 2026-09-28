import { describe, expect, it } from 'vitest'
import { researchFamilies, researchReferences } from './researchSnapshot.js'

describe('research snapshot', () => {
  it('covers every academic family with source-backed records', () => {
    const families = new Set(researchReferences.map((entry) => entry.family))
    expect(families).toEqual(new Set(researchFamilies.map((family) => family.id)))
    expect(researchReferences.length).toBeGreaterThanOrEqual(30)
  })

  it('keeps every reference attributable and evidence-labeled', () => {
    for (const entry of researchReferences) {
      expect(entry.id).toBeTruthy()
      expect(entry.sourceDocument).toBeTruthy()
      expect(entry.sourceAnchor).toBeTruthy()
      expect(entry.sourceDate).toBeTruthy()
      expect(entry.maturity).toBeTruthy()
      expect(entry.evidenceTier).toBeTruthy()
      expect(entry.caveat).toBeTruthy()
    }
  })

  it('does not silently label research references as live observation', () => {
    expect(researchReferences.some((entry) => entry.evidenceTier === 'live observed')).toBe(false)
  })
})
