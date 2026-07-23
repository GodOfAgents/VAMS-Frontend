import { describe, expect, it } from 'vitest'
import { consolePaths, marketingPaths } from './route-paths.js'

describe('route architecture', () => {
  it('exposes the intent-based marketing routes', () => {
    expect(marketingPaths).toEqual([
      '/',
      '/protocol',
      '/network',
      '/build',
      '/operate',
      '/research',
      '/status',
    ])
  })

  it('exposes the read-only console collections', () => {
    expect(consolePaths).toEqual(expect.arrayContaining([
      '/overview',
      '/nodes',
      '/blueprints',
      '/service-blocks',
      '/data-availability',
      '/evidence',
      '/system',
    ]))
  })
})
