// @vitest-environment jsdom
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { GlobeChapter } from './GlobeChapter.jsx'

const environment = vi.hoisted(() => ({ coarsePointer: false, reducedMotion: false }))
vi.mock('../../motion/ResponsiveMotionProvider.jsx', () => ({ useResponsiveMotion: () => environment }))
afterEach(() => { cleanup(); environment.coarsePointer = false; environment.reducedMotion = false })
function setup(rendererState = 'ready') {
  const ref = { current: { yaw: 0, pitch: 0, zoom: 1, paused: false, exploring: false, resetVersion: 0 } }
  render(<GlobeChapter globeStateRef={ref} rendererState={rendererState} />)
  return ref
}

describe('globe interaction', () => {
  it('supports keyboard rotation, zoom bounds, pause, and reset through accessible controls', () => {
    const ref = setup()
    const region = screen.getByRole('group', { name: 'Rotate the illustrative planetary network' })
    fireEvent.keyDown(region, { key: 'ArrowRight' })
    expect(ref.current.yaw).toBeGreaterThan(0)
    for (let i = 0; i < 30; i++) fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }))
    expect(ref.current.zoom).toBe(1.35)
    fireEvent.click(screen.getByRole('button', { name: 'Pause globe motion' }))
    expect(ref.current.paused).toBe(true)
    expect(screen.getByRole('button', { name: 'Resume globe motion' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reset globe view' }))
    expect(ref.current).toMatchObject({ yaw: 0, pitch: 0, zoom: 1, resetVersion: 1 })
  })
  it('requires explicit touch exploration and allows Escape to restore scrolling', () => {
    environment.coarsePointer = true
    const ref = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Explore globe' }))
    expect(ref.current.exploring).toBe(true)
    fireEvent.keyDown(screen.getByRole('group', { name: 'Rotate the illustrative planetary network' }), { key: 'Escape' })
    expect(ref.current.exploring).toBe(false)
    expect(screen.getByRole('button', { name: 'Explore globe' })).toBeTruthy()
  })
  it('renders a complete static composition without unusable controls on fallback or reduced motion', () => {
    setup('fallback')
    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull()
    expect(screen.getByText('Illustrative planetary network')).toBeTruthy()
    cleanup()
    environment.reducedMotion = true
    setup()
    expect(screen.queryByRole('button', { name: 'Pause globe motion' })).toBeNull()
  })
})
