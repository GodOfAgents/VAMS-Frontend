import { Euler, Quaternion, Vector3 } from 'three'
import earthView from '../data/earth-view.json'
import { describe, expect, it } from 'vitest'
import { isLand, lonLatToSphere, coastlineSegments } from './earthGeography.js'

describe('Earth geography', () => {
  it('centers India and Bangladesh in the default and reset orientation', () => {
    const q = new Quaternion().setFromEuler(new Euler(earthView.latitude * Math.PI / 180, -earthView.longitude * Math.PI / 180, 0, 'XYZ'))
    const center = new Vector3(...lonLatToSphere(85, 23, 1)).applyQuaternion(q)
    expect(center.x).toBeCloseTo(0, 10)
    expect(center.y).toBeCloseTo(0, 10)
    expect(center.z).toBeCloseTo(1, 10)
    for (const [lon, lat] of [[80, 23], [90, 24]]) {
      const p = new Vector3(...lonLatToSphere(lon, lat, 1)).applyQuaternion(q)
      expect(Math.abs(p.x)).toBeLessThan(0.15)
      expect(Math.abs(p.y)).toBeLessThan(0.05)
      expect(p.z).toBeGreaterThan(0.98)
    }
  })
  it('distinguishes real continental interiors from oceans', () => {
    for (const [lon, lat] of [[77, 28], [20, 23], [13, 52], [-62, -5], [0, -85]]) expect(isLand(lon, lat)).toBe(true)
    for (const [lon, lat] of [[-140, 0], [-30, 0], [90, -30]]) expect(isLand(lon, lat)).toBe(false)
  })
  it('keeps north up and east on the right of the initial view', () => {
    expect(lonLatToSphere(0, 0)).toEqual([0, 0, 3.5])
    expect(lonLatToSphere(90, 0)[0]).toBeCloseTo(3.5)
    expect(lonLatToSphere(0, 90)[1]).toBeCloseTo(3.5)
  })
  it('builds finite coastline segments outside the node sphere without chords through its center', () => {
    const positions = coastlineSegments()
    expect(positions.length).toBeGreaterThan(10000)
    expect(positions.length % 6).toBe(0)
    for (let i = 0; i < positions.length; i += 3) expect(Math.hypot(...positions.slice(i, i + 3))).toBeCloseTo(3.51, 5)
  })
})
