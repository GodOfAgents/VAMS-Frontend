import { describe, expect, it } from 'vitest'
import { createPlanetaryTopology, raisedArcPoint, calculateNetworkProgress } from './planetaryNetwork.js'
import { calculateMorphProgress, sphereTarget } from './globeMorph.js'

describe('scroll-grown planetary network', () => {
  it('starts after the globe forms and grows across a deliberate scroll interval', () => {
    const context = { globeStart: 1200, viewportHeight: 800 }
    expect(calculateMorphProgress({ ...context, scrollY: 1200 })).toBe(1)
    expect(calculateNetworkProgress({ ...context, scrollY: 1200 })).toBe(0)
    expect(calculateNetworkProgress({ ...context, scrollY: 1280 })).toBe(0)
    expect(calculateNetworkProgress({ ...context, scrollY: 2440 })).toBe(1)
    const positions = [1200, 1500, 1800, 2100, 2440]
    const forward = positions.map((scrollY) => calculateNetworkProgress({ ...context, scrollY }))
    expect(forward).toEqual([...positions].reverse().map((scrollY) => calculateNetworkProgress({ ...context, scrollY })).reverse())
    expect(forward).toEqual([...forward].sort((a,b) => a-b))
  })
  it('reuses canonical node IDs and starts in India and Bangladesh', () => {
    const { nodes, edges } = createPlanetaryTopology(49,33)
    expect(nodes.length).toBeGreaterThan(35)
    expect(new Set(nodes.map((n) => n.id)).size).toBe(nodes.length)
    expect(['Dhaka','Kolkata','Delhi']).toContain(nodes[0].name)
    for (const node of nodes) expect(node.position).toEqual(sphereTarget(node.id,49,33))
    for (const edge of edges) {
      expect(edge.from).toBeLessThan(edge.to)
      expect(edge.birth).toBeGreaterThanOrEqual(nodes[edge.from].birth)
      expect(edge.birth + edge.duration).toBeCloseTo(nodes[edge.to].birth, 8)
    }
    expect(edges.length).toBeGreaterThan(nodes.length)
  })
  it('keeps elevated connection endpoints attached and handles antipodal routes', () => {
    const a=[3.5,0,0],b=[0,3.5,0]
    expect(raisedArcPoint(a,b,0,.5)).toEqual(a)
    const end=raisedArcPoint(a,b,1,.5)
    expect(end[1]).toBeCloseTo(3.5)
    expect(Math.hypot(...raisedArcPoint(a,b,.5,.5))).toBeCloseTo(4)
    for (const t of [0,.25,.5,.75,1]) expect(raisedArcPoint(a,[-3.5,0,0],t,.5).every(Number.isFinite)).toBe(true)
  })
})
