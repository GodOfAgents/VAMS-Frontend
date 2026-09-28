import * as THREE from 'three'

export function createTerrainPointerProjector(camera, terrain) {
  const pointer = new THREE.Vector2()
  const normal = new THREE.Vector3()
  const origin = new THREE.Vector3()
  const intersection = new THREE.Vector3()
  const plane = new THREE.Plane()
  const raycaster = new THREE.Raycaster()

  return function projectPointer(clientX, clientY, bounds, target) {
    if (!bounds.width || !bounds.height) return false

    pointer.set(
      ((clientX - bounds.left) / bounds.width) * 2 - 1,
      1 - ((clientY - bounds.top) / bounds.height) * 2,
    )
    camera.updateMatrixWorld()
    terrain.updateWorldMatrix(true, false)
    normal.set(0, 0, 1).transformDirection(terrain.matrixWorld)
    terrain.getWorldPosition(origin)
    plane.setFromNormalAndCoplanarPoint(normal, origin)
    raycaster.setFromCamera(pointer, camera)
    if (!raycaster.ray.intersectPlane(plane, intersection)) return false

    terrain.worldToLocal(intersection)
    target.set(intersection.x, intersection.y)
    return true
  }
}
