// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ProtocolPage } from './ProtocolPage.jsx'

class TestIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal('IntersectionObserver', TestIntersectionObserver)

function renderPage() {
  return render(<MemoryRouter><ProtocolPage /></MemoryRouter>)
}

describe('ProtocolPage', () => {
  it('presents the architecture and deployment boundary with section navigation', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: /protocol architecture/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Core mechanics' })).toHaveAttribute('href', '#mechanics')
    expect(screen.getByText(/No public deployment is claimed/i)).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Protocol request and recovery flow' }).children).toHaveLength(6)
  })

  it('uses the shared smoke reveal for the hero and every main section heading', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: /protocol architecture/i })).toHaveAttribute('data-smoke-mode', 'words')
    const sectionHeadings = document.querySelectorAll('.protocol-section-heading h2')
    expect(sectionHeadings).toHaveLength(6)
    sectionHeadings.forEach((heading) => expect(heading).toHaveAttribute('data-smoke-mode', 'words'))
  })

  it('switches code samples by keyboard and copies the visible example', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    renderPage()
    const curl = screen.getByRole('tab', { name: 'cURL' })
    curl.focus()
    fireEvent.keyDown(curl, { key: 'ArrowRight' })
    expect(screen.getByRole('tab', { name: 'JavaScript' })).toHaveAttribute('aria-selected', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Copy JavaScript example' }))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('fetch('))
    expect(await screen.findByRole('status')).toHaveTextContent('Copied JavaScript example')
  })

  it('keeps source links and FAQ controls accessible', () => {
    renderPage()
    expect(screen.getAllByRole('link', { name: /Gateway API reference/i })[0]).toHaveAttribute('href', expect.stringContaining('docs/API_REFERENCE.md'))
    expect(screen.getByText('Does VAMS run its own consensus?').closest('summary')).toBeInTheDocument()
  })
})
