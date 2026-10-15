// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { researchReferences } from '../../data/researchSnapshot.js'
import { filterResearchReferences, ResearchPage } from './ResearchPage.jsx'

const TestIntersectionObserver = class {
  constructor(callback) { this.callback = callback }
  observe(target) { this.callback?.([{ isIntersecting: true, target }], this) }
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}
globalThis.IntersectionObserver = TestIntersectionObserver
window.IntersectionObserver = TestIntersectionObserver

function LocationOutput() {
  const { pathname, search, hash } = useLocation()
  return <output aria-label="Current location">{pathname}{search}{hash}</output>
}

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

  it('preserves the research section anchor while filters change and clear', () => {
    render(
      <MemoryRouter initialEntries={['/research#ledger']}>
        <LocationOutput />
        <Routes><Route path="/research" element={<ResearchPage />} /></Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Search research' }), { target: { value: 'no-such-research-record' } })
    expect(screen.getByLabelText('Current location')).toHaveTextContent('/research?q=no-such-research-record#ledger')
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }))
    expect(screen.getByLabelText('Current location')).toHaveTextContent('/research#ledger')
  })
})
