import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Reveal, SmokeText } from './primitives.jsx'

describe('Reveal', () => {
  it('forwards semantic scene markers to its rendered element', () => {
    const markup = renderToStaticMarkup(
      <Reveal as="section" data-scene-chapter="cta">Final CTA</Reveal>,
    )

    expect(markup).toContain('data-scene-chapter="cta"')
    expect(markup).toContain('<section')
  })
})

describe('SmokeText', () => {
  it('keeps the hero word sequence and one accessible heading label', () => {
    const markup = renderToStaticMarkup(
      <SmokeText mode="words" phrases={['Verifiable', 'infrastructure for', 'autonomous agents.']} />,
    )
    const indexes = [...markup.matchAll(/data-smoke-index="(\d+)"/g)].map((match) => Number(match[1]))

    expect(markup).toContain('aria-label="Verifiable infrastructure for autonomous agents."')
    expect(markup).toContain('data-smoke-mode="words"')
    expect(indexes).toEqual([0, 1, 2, 3, 4])
    expect(markup.indexOf('Verifiable')).toBeLessThan(markup.indexOf('infrastructure'))
    expect(markup.indexOf('infrastructure')).toBeLessThan(markup.indexOf('autonomous'))
  })

  it('renders the complete reduced-motion composition without hidden opacity', () => {
    const markup = renderToStaticMarkup(
      <SmokeText mode="words" phrases={['Verifiable', 'infrastructure for', 'autonomous agents.']} />,
    )

    expect(markup).not.toContain('opacity:0')
    expect(markup).not.toContain('blur(')
    expect(markup.match(/smoke-text__line/g)).toHaveLength(3)
  })
})
