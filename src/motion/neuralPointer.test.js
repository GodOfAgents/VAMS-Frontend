import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { createTerrainPointerProjector } from './neuralPointer.js'

describe('terrain pointer projection', () => {
  it.each([
    ['desktop', 1200, 600, [0, 5.2, 12.4], [0, -1.7, -0.9], -Math.PI / 2.5, [2.5, -1.25]],
    ['phone', 390, 844, [0, 4.6, 12.8], [0, -2.8, -1.4], -1.14, [0.8, -0.5]],
  ])('maps a screen point back to the same %s node on a tilted terrain plane', (_name, width, height, cameraPosition, terrainPosition, rotation, nodePosition) => {
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    camera.position.set(...cameraPosition)
    camera.lookAt(0, -0.8, 0)
    camera.updateMatrixWorld()
    const terrain = new THREE.Object3D()
    terrain.position.set(...terrainPosition)
    terrain.rotation.x = rotation
    terrain.updateMatrixWorld()
    const node = new THREE.Vector3(...nodePosition, 0)
    const screen = terrain.localToWorld(node.clone()).project(camera)
    const bounds = { left: 30, top: 45, width, height }
    const clientX = bounds.left + (screen.x + 1) * bounds.width / 2
    const clientY = bounds.top + (1 - screen.y) * bounds.height / 2
    const target = new THREE.Vector2()

    expect(createTerrainPointerProjector(camera, terrain)(clientX, clientY, bounds, target)).toBe(true)
    expect(target.x).toBeCloseTo(node.x, 4)
    expect(target.y).toBeCloseTo(node.y, 4)
  })

  it('does not project through a zero-sized scene', () => {
    const camera = new THREE.PerspectiveCamera()
    const terrain = new THREE.Object3D()
    const target = new THREE.Vector2(3, 4)
    expect(createTerrainPointerProjector(camera, terrain)(10, 10, { left: 0, top: 0, width: 0, height: 10 }, target)).toBe(false)
    expect(target.toArray()).toEqual([3, 4])
  })
})
