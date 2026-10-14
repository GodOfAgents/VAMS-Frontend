import polygons from '../data/earth-land.json'

// Natural Earth 1:110m land, public domain. Geographic coordinates, not deployment data.
const land = polygons.map((rings) => {
  const exterior = rings[0]
  return {
    rings,
    west: Math.min(...exterior.map(([x]) => x)),
    east: Math.max(...exterior.map(([x]) => x)),
    south: Math.min(...exterior.map(([, y]) => y)),
    north: Math.max(...exterior.map(([, y]) => y)),
  }
})

function inRing(lon, lat, ring) {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

export function isLand(lon, lat) {
  return land.some(({ rings, west, east, south, north }) =>
    lon >= west && lon <= east && lat >= south && lat <= north
    && inRing(lon, lat, rings[0]) && !rings.slice(1).some((ring) => inRing(lon, lat, ring)))
}

export function lonLatToSphere(lon, lat, radius = 3.5) {
  const longitude = lon * Math.PI / 180
  const latitude = lat * Math.PI / 180
  const ring = Math.cos(latitude)
  return [radius * ring * Math.sin(longitude), radius * Math.sin(latitude), radius * ring * Math.cos(longitude)]
}

export function coastlineSegments(radius = 3.51) {
  const positions = []
  for (const polygon of polygons) {
    for (const ring of polygon) {
      for (let i = 1; i < ring.length; i++) {
        const [lon, lat] = ring[i - 1]
        const [nextLon, nextLat] = ring[i]
        const delta = ((nextLon - lon + 540) % 360) - 180
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(delta), Math.abs(nextLat - lat)) / 1.5))
        for (let j = 0; j < steps; j++) {
          for (const t of [j / steps, (j + 1) / steps]) positions.push(...lonLatToSphere(lon + delta * t, lat + (nextLat - lat) * t, radius))
        }
      }
    }
  }
  return positions
}
