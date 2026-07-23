import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { StatusBadge } from './StatusBadge.jsx'

describe('StatusBadge', () => {
  it('exposes status in text instead of relying on color', () => {
    const markup = renderToStaticMarkup(<StatusBadge prefix="Gateway" state="BLOCKED" />)
    expect(markup).toContain('Gateway: BLOCKED')
  })
})
