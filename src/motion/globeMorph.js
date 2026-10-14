/** Pure graph/morph contracts. IDs and adjacency never depend on scroll or quality. */
export function smootherstep(value) {
  const p = Math.max(0, Math.min(1, value))
  return p * p * p * (p * (p * 6 - 15) + 10)
}

export function calculateMorphProgress({ scrollY, viewportHeight, globeStart }) {
  const start = Math.max(0, viewportHeight * 0.16)
  const end = Math.max(start + 1, globeStart - viewportHeight * 0.08)
  return Math.max(0, Math.min(1, (scrollY - start) / (end - start)))
}

// Equal-area rings keep the source grid's neighbors local on the sphere.
// Half-cell offsets avoid duplicate poles; the open longitude seam avoids twins.
export function sphereTarget(index, columns, rows, radius = 3.5) {
  const row = Math.floor(index / columns)
  const column = index % columns
  const y = 1 - 2 * ((row + 0.5) / rows)
  const longitude = (column / columns) * Math.PI * 2 - Math.PI
  const ring = Math.sqrt(Math.max(0, 1 - y * y))
  return [radius * ring * Math.sin(longitude), radius * y, radius * ring * Math.cos(longitude)]
}

export function createGridEdges(segmentsX, segmentsY, step) {
  const edges = []
  const columns = segmentsX + 1
  for (let y = 0; y <= segmentsY; y += step) {
    for (let x = 0; x <= segmentsX; x += step) {
      const id = y * columns + x
      if (x + step <= segmentsX) edges.push([id, id + step])
      if (y + step <= segmentsY) edges.push([id, id + step * columns])
    }
  }
  return edges
}

export function clampGlobeZoom(value) {
  return Math.max(0.72, Math.min(1.35, value))
}
