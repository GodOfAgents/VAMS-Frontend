import { useEffect, useRef } from 'react'

// Liquid glass: elements marked `data-glass` refract the content behind their
// rim like a slab of thick glass, with a specular sheen that follows the pointer.
// Each element gets its own SVG displacement map, drawn at its exact size, so the
// rim stays a constant thickness whatever the shape. Backdrop displacement maps
// only render in Chromium; other browsers keep the plain blurred glass from CSS.

const RIM = 16
const STRENGTH = 26
const BLUR = 11

const supportsLens = () => typeof window !== 'undefined'
  && 'chrome' in window
  && typeof CSS !== 'undefined'
  && CSS.supports('backdrop-filter', 'url(#glass)')

// Draws a displacement map: neutral grey inside, bending inward across the rim.
function drawMap(width, height, radius) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  const image = context.createImageData(width, height)
  const data = image.data
  const rim = Math.min(RIM, Math.min(width, height) * 0.42)
  const rx = Math.min(radius, width / 2)
  const ry = Math.min(radius, height / 2)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const px = x + 0.5
      const py = y + 0.5
      // Signed distance to the rounded rectangle's edge (negative inside).
      const qx = Math.abs(px - width / 2) - (width / 2 - rx)
      const qy = Math.abs(py - height / 2) - (height / 2 - ry)
      const outside = Math.hypot(Math.max(qx, 0), Math.max(qy, 0))
      const inside = Math.min(Math.max(qx, qy), 0)
      const distance = outside + inside - Math.min(rx, ry)
      const depth = Math.min(1, Math.max(0, 1 + distance / rim))
      const eased = depth * depth * (3 - 2 * depth)
      // Inward normal: toward the centre near the ends, toward the axis elsewhere.
      let nx = width / 2 - px
      let ny = height / 2 - py
      if (qx < 0) nx = 0
      if (qy < 0) ny = 0
      const length = Math.hypot(nx, ny) || 1
      const index = (y * width + x) * 4
      data[index] = 128 + Math.round((nx / length) * 127 * eased)
      data[index + 1] = 128 + Math.round((ny / length) * 127 * eased)
      data[index + 2] = 128
      data[index + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

const SVG = 'http://www.w3.org/2000/svg'
const XLINK = 'http://www.w3.org/1999/xlink'

function buildFilter(id) {
  const filter = document.createElementNS(SVG, 'filter')
  filter.setAttribute('id', id)
  filter.setAttribute('x', '0')
  filter.setAttribute('y', '0')
  filter.setAttribute('width', '100%')
  filter.setAttribute('height', '100%')
  filter.setAttribute('color-interpolation-filters', 'sRGB')

  const image = document.createElementNS(SVG, 'feImage')
  image.setAttribute('x', '0')
  image.setAttribute('y', '0')
  image.setAttribute('width', '100%')
  image.setAttribute('height', '100%')
  image.setAttribute('preserveAspectRatio', 'none')
  image.setAttribute('result', 'map')

  const displace = document.createElementNS(SVG, 'feDisplacementMap')
  displace.setAttribute('in', 'SourceGraphic')
  displace.setAttribute('in2', 'map')
  displace.setAttribute('scale', String(STRENGTH))
  displace.setAttribute('xChannelSelector', 'R')
  displace.setAttribute('yChannelSelector', 'G')
  displace.setAttribute('result', 'refracted')

  const blur = document.createElementNS(SVG, 'feGaussianBlur')
  blur.setAttribute('in', 'refracted')
  blur.setAttribute('stdDeviation', String(BLUR))

  filter.append(image, displace, blur)
  return { filter, image }
}

/**
 * Mount once per surface. Builds a refraction filter for every `data-glass`
 * element (including ones added later), keeps the maps sized to the elements,
 * and drives the pointer sheen through `--glass-x` / `--glass-y`.
 */
export function LiquidGlass() {
  const defsRef = useRef(null)

  useEffect(() => {
    const defs = defsRef.current
    if (!defs) return undefined

    const lens = supportsLens()
    const entries = new Map()
    let serial = 0

    const refresh = (element) => {
      const entry = entries.get(element)
      if (!entry) return
      const width = Math.round(element.offsetWidth)
      const height = Math.round(element.offsetHeight)
      if (!width || !height || (entry.width === width && entry.height === height)) return
      entry.width = width
      entry.height = height
      const radius = parseFloat(getComputedStyle(element).borderTopLeftRadius) || 0
      entry.image.setAttributeNS(XLINK, 'href', drawMap(width, height, radius))
      entry.image.setAttribute('href', entry.image.getAttributeNS(XLINK, 'href'))
    }

    const resizeObserver = lens ? new ResizeObserver((records) => records.forEach((record) => refresh(record.target))) : null

    const attach = (element) => {
      if (entries.has(element)) return
      if (!lens) {
        entries.set(element, { plain: true })
        return
      }
      serial += 1
      const id = `glass-${serial}`
      const { filter, image } = buildFilter(id)
      defs.appendChild(filter)
      entries.set(element, { filter, image, width: 0, height: 0 })
      element.style.backdropFilter = `url(#${id})`
      element.style.webkitBackdropFilter = `url(#${id})`
      refresh(element)
      resizeObserver.observe(element)
    }

    const detach = (element) => {
      const entry = entries.get(element)
      if (!entry) return
      entries.delete(element)
      if (entry.plain) return
      resizeObserver.unobserve(element)
      entry.filter.remove()
      element.style.backdropFilter = ''
      element.style.webkitBackdropFilter = ''
    }

    const scan = () => {
      const present = new Set(document.querySelectorAll('[data-glass]'))
      present.forEach(attach)
      entries.forEach((entry, element) => {
        if (!present.has(element)) detach(element)
      })
    }

    const mutations = new MutationObserver(scan)
    mutations.observe(document.body, { childList: true, subtree: true })
    scan()

    // The sheen: one delegated listener places the highlight on the glass under the pointer.
    let lit = null
    const handleMove = (event) => {
      const element = event.target instanceof Element ? event.target.closest('[data-glass]') : null
      if (lit && lit !== element) {
        lit.removeAttribute('data-glass-pointer')
        lit = null
      }
      if (!element) return
      const bounds = element.getBoundingClientRect()
      element.style.setProperty('--glass-x', `${(event.clientX - bounds.left).toFixed(1)}px`)
      element.style.setProperty('--glass-y', `${(event.clientY - bounds.top).toFixed(1)}px`)
      if (lit !== element) {
        element.setAttribute('data-glass-pointer', 'active')
        lit = element
      }
    }
    const handleLeave = () => {
      lit?.removeAttribute('data-glass-pointer')
      lit = null
    }
    document.addEventListener('pointermove', handleMove, { passive: true })
    document.addEventListener('pointerleave', handleLeave)

    return () => {
      mutations.disconnect()
      document.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerleave', handleLeave)
      handleLeave()
      ;[...entries.keys()].forEach(detach)
      resizeObserver?.disconnect()
    }
  }, [])

  return (
    <svg className="glass-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <defs ref={defsRef} />
    </svg>
  )
}
