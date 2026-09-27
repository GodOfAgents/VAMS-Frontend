// @vitest-environment jsdom

import { afterEach, describe, expect, it } from 'vitest'
import { applyRouteMetadata, getRouteMetadata } from './routeMetadata.js'

describe('route metadata', () => {
  afterEach(() => {
    document.head.innerHTML = ''
  })

  it('provides distinct metadata for public editorial routes', () => {
    const home = getRouteMetadata('/')
    const research = getRouteMetadata('/research')
    expect(research.title).not.toBe(home.title)
    expect(research.description).toMatch(/research foundations/i)
  })

  it('resolves detail routes without exposing record identifiers in metadata', () => {
    expect(getRouteMetadata('/nodes/example-node').title).toBe('Node record | VAMS')
    expect(getRouteMetadata('/blueprints/example-blueprint').description).toMatch(/blueprint/i)
  })

  it('updates standard and social metadata together', () => {
    applyRouteMetadata('/research')
    expect(document.title).toBe('Research and evidence | VAMS')
    expect(document.querySelector('meta[name="description"]')?.content).toMatch(/maturity states/i)
    expect(document.querySelector('meta[property="og:title"]')?.content).toBe(document.title)
    expect(document.querySelector('meta[name="twitter:description"]')?.content).toMatch(/pre-testnet gates/i)
  })
})
