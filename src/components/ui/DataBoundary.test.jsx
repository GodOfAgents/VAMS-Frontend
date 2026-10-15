// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { DataBoundary } from './DataBoundary.jsx'

function renderBoundary(resource, onRetry = vi.fn()) {
  return render(
    <MemoryRouter>
      <DataBoundary resource={resource} onRetry={onRetry}>{() => <p>Verified records</p>}</DataBoundary>
    </MemoryRouter>,
  )
}

describe('DataBoundary public preview states', () => {
  it('explains a missing Gateway and does not offer a non-recoverable retry', () => {
    renderBoundary({ error: { details: { code: 'GATEWAY_NOT_CONFIGURED' } } })
    expect(screen.getByText('Live Gateway records are not connected')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gateway architecture' })).toHaveAttribute('href', '/protocol#integration')
  })

  it('offers retry after a temporary Gateway failure', () => {
    const onRetry = vi.fn()
    renderBoundary({ error: { message: 'Gateway returned HTTP 503.', details: { code: 'GATEWAY_HTTP_ERROR', status: 503 } } }, onRetry)
    fireEvent.click(screen.getByRole('button', { name: /retry/i }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('does not invite retry when the response is invalid', () => {
    renderBoundary({ error: { message: 'Gateway response failed schema validation.', details: { code: 'MALFORMED_GATEWAY_RESPONSE' } } })
    expect(screen.getByText('Gateway response could not be verified')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument()
  })

  it('distinguishes an empty collection from a verified response', () => {
    renderBoundary({ loading: false, error: null, result: { data: [] } })
    expect(screen.getByText('No records are visible in this environment.')).toBeInTheDocument()
    expect(screen.queryByText('Verified records')).not.toBeInTheDocument()
  })
})
