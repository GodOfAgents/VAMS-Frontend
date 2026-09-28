// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { NetworkPage } from './TopicPages.jsx'

class TestIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('IntersectionObserver', TestIntersectionObserver)

function renderPage() {
  return render(<MemoryRouter><NetworkPage /></MemoryRouter>)
}

describe('NetworkPage', () => {
  it('presents a source-backed network guide with anchored sections', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: /independent infrastructure/i })).toHaveAttribute('data-smoke-mode', 'words')
    expect(screen.getByRole('link', { name: 'Provider mechanics' })).toHaveAttribute('href', '#provider-mechanics')
    expect(screen.getByRole('list', { name: 'Network architecture flow' }).children).toHaveLength(5)
    expect(screen.getByText(/No public deployment is claimed/i)).toBeInTheDocument()
    expect(screen.getByText('Source implemented')).toBeInTheDocument()
    expect(screen.getByText('Locally verified')).toBeInTheDocument()
    expect(screen.getByText('Deployment / live pending')).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Gateway API reference/i })[0]).toHaveAttribute('href', expect.stringContaining('docs/API_REFERENCE.md'))
  })

  it('switches read-only examples by keyboard and copies the selected route', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    renderPage()
    fireEvent.change(screen.getByLabelText('Read-only endpoint'), { target: { value: 'blocks' } })
    const curl = screen.getByRole('tab', { name: 'cURL' })
    curl.focus()
    fireEvent.keyDown(curl, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'JavaScript' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Copy JavaScript example' }))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/services/blocks'))
    expect(await screen.findByRole('status')).toHaveTextContent('Copied JavaScript example')
  })

  it('reports unavailable copy and keeps FAQ and source links accessible', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Copy cURL example' }))
    expect(await screen.findByRole('status')).toHaveTextContent('Copy unavailable')
    expect(screen.getByText('Are listed nodes necessarily live and available?').closest('summary')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Read protocol architecture/i })).toHaveAttribute('href', '/protocol')
  })
})
