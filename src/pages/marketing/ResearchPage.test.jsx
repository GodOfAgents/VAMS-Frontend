import { describe, expect, it } from 'vitest'
import { researchReferences } from '../../data/researchSnapshot.js'
import { filterResearchReferences } from './ResearchPage.jsx'

describe('ResearchPage filtering', () => {
  it('filters by family and maturity together', () => {
    const results = filterResearchReferences(researchReferences, { family: 'R10', maturity: 'implemented' })
    expect(results.length).toBeGreaterThan(0)
    expect(results.every((entry) => entry.family === 'R10' && entry.maturity === 'implemented')).toBe(true)
  })

  it('searches across titles, paper identifiers, and implementation surfaces', () => {
    expect(filterResearchReferences(researchReferences, { query: '2606.31399' }).map((entry) => entry.title)).toContain('World-Model Collapse as a Phase Transition')
    expect(filterResearchReferences(researchReferences, { query: 'sentinel telemetry' }).length).toBeGreaterThan(0)
  })

  it('returns an empty result for an unknown query', () => {
    expect(filterResearchReferences(researchReferences, { query: 'no-such-research-record' })).toEqual([])
  })
})
