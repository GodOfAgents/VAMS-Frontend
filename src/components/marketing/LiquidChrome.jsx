import { useEffect, useRef } from 'react'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'

const BLOBS = 8
const FIELD_MAX = 3.4

const vertexSource = `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

// Liquid chrome. A metaball field (mercury droplets) is added to a field built
// from the wordmark's letterforms, so droplets and letters join with liquid
// bridges. The surface height comes from the field and reflects a monochrome
// studio. The pointer presses a dimple into the metal and sends out ripples.
const fragmentSource = `#version 300 es
precision highp float;
#define BLOBS ${BLOBS}

uniform float uScale;
uniform float uTime;
uniform float uForm;
uniform float uTone;
uniform vec3 uPointer;
uniform float uRipple;
uniform float uRelief;
uniform sampler2D uLetters;
uniform vec4 uLetterRect;
uniform vec4 uBlobs[BLOBS];

out vec4 outColor;

float letters(vec2 p) {
  vec2 uv = (p - uLetterRect.xy) / (uLetterRect.zw - uLetterRect.xy);
  if (uv.x <= 0.0 || uv.y <= 0.0 || uv.x >= 1.0 || uv.y >= 1.0) return 0.0;
  return texture(uLetters, uv).r;
}

float field(vec2 p) {
  float f = uForm * letters(p);
  for (int i = 0; i < BLOBS; i++) {
    vec4 b = uBlobs[i];
    vec2 d = p - b.xy;
    f += b.w * b.z * b.z / (dot(d, d) + 1.0);
  }
  float r = length(p - uPointer.xy) / uScale;
  f -= uPointer.z * 1.15 * exp(-r * r / 1300.0);
  f += uRipple * 0.2 * sin(r * 0.17 - uTime * 7.5) * exp(-r / 120.0) * smoothstep(6.0, 36.0, r);
  return f;
}

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float softbox(vec3 r, vec3 direction, float size, float soft) {
  return smoothstep(cos(size + soft), cos(size), dot(r, normalize(direction)));
}

// A monochrome photo studio: a bright ceiling, window panels around the walls,
// a crisp horizon line just below eye level, and a paper floor. The dark variant
// keeps only the lights.
float studio(vec3 r) {
  float y = r.y;
  float around = atan(r.x, r.z);
  float panels = smoothstep(0.17, 0.1, abs(abs(around) - 1.05)) * smoothstep(0.6, 0.12, abs(y));
  float camera = exp(-(around * around) / 0.2) * exp(-(y * y) / 0.06);
  float horizon = exp(-pow((y + 0.13) / 0.045, 2.0));

  float ceiling = mix(0.8, 1.0, smoothstep(0.0, 0.7, y));
  float paper = mix(0.68, 0.9, smoothstep(-0.25, -0.9, y));
  float light = mix(paper, ceiling, smoothstep(-0.1, 0.1, y));
  light += 0.26 * panels - 0.2 * camera - 0.62 * horizon;
  light += 0.45 * softbox(r, vec3(-0.55, 0.6, 0.58), 0.26, 0.14);
  light += 0.25 * softbox(r, vec3(0.72, 0.28, 0.63), 0.18, 0.1);

  float dark = 0.035 + 0.06 * smoothstep(-0.1, 0.9, y) + 0.16 * horizon + 0.3 * panels;
  dark += 1.05 * softbox(r, vec3(-0.55, 0.6, 0.58), 0.24, 0.12);
  dark += 0.55 * softbox(r, vec3(0.72, 0.28, 0.63), 0.16, 0.08);
  dark += 0.4 * smoothstep(0.15, -0.75, r.z);
  return mix(light, dark, uTone);
}

void main() {
  vec2 p = gl_FragCoord.xy;
  float t = field(p);
  float shadowField = field(p + vec2(-9.0, 13.0) * uScale);
  if (t < 0.22 && shadowField < 0.28) {
    outColor = vec4(0.0);
    return;
  }

  vec2 g = vec2(field(p + vec2(1.0, 0.0)) - field(p - vec2(1.0, 0.0)),
                field(p + vec2(0.0, 1.0)) - field(p - vec2(0.0, 1.0))) * 0.5;
  float aa = max(length(g), 0.002) * 0.9;
  float cover = smoothstep(1.0 - aa, 1.0 + aa, t);

  float tc = max(t, 1.0001);
  float z = sqrt(1.0 - 1.0 / tc);
  vec2 slope = g / max(2.0 * z * tc * tc, 0.04);
  vec3 n = normalize(vec3(-slope * uRelief, 1.0));

  float swing = 0.22 * sin(uTime * 0.23);
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);
  r.xz = mat2(cos(swing), -sin(swing), sin(swing), cos(swing)) * r.xz;

  float level = studio(r);
  level += pow(max(dot(r, normalize(vec3(-0.45, 0.62, 0.64))), 0.0), 90.0) * 1.1;
  // Metal turning away from the viewer darkens into a clean contour.
  level *= mix(mix(0.52, 0.75, uTone), 1.0, smoothstep(0.03, 0.42, n.z));
  level += (hash(p + fract(uTime) * 91.0) - 0.5) * 0.035;
  level = clamp(level, 0.0, 1.0);

  float shade = (1.0 - uTone) * (1.0 - cover);
  float under = shade * max(smoothstep(0.3, 1.25, shadowField) * 0.2, smoothstep(0.45, 1.0, t) * 0.18);
  outColor = vec4(vec3(level) * cover, cover + under);
}
`

const INFINITE = 1e20

function compile(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

// Squared Euclidean distance transform (Felzenszwalb and Huttenlocher), in place.
function distanceTransform(grid, width, height) {
  const size = Math.max(width, height)
  const f = new Float64Array(size)
  const d = new Float64Array(size)
  const v = new Int32Array(size)
  const z = new Float64Array(size + 1)

  const pass = (length) => {
    let k = 0
    v[0] = 0
    z[0] = -INFINITE
    z[1] = INFINITE
    for (let q = 1; q < length; q += 1) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
      while (s <= z[k]) {
        k -= 1
        s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k])
      }
      k += 1
      v[k] = q
      z[k] = s
      z[k + 1] = INFINITE
    }
    k = 0
    for (let q = 0; q < length; q += 1) {
      while (z[k + 1] < q) k += 1
      const offset = q - v[k]
      d[q] = offset * offset + f[v[k]]
    }
  }

  for (let x = 0; x < width; x += 1) {
    for (let y = 0; y < height; y += 1) f[y] = grid[y * width + x]
    pass(height)
    for (let y = 0; y < height; y += 1) grid[y * width + x] = d[y]
  }
  for (let y = 0; y < height; y += 1) {
    const row = y * width
    for (let x = 0; x < width; x += 1) f[x] = grid[row + x]
    pass(width)
    for (let x = 0; x < width; x += 1) grid[row + x] = d[x]
  }
}

function gaussianBlur(values, width, height, sigma) {
  if (sigma < 0.5) return values
  const radius = Math.ceil(sigma * 2.6)
  const kernel = new Float32Array(radius * 2 + 1)
  let total = 0
  for (let i = -radius; i <= radius; i += 1) {
    kernel[i + radius] = Math.exp(-(i * i) / (2 * sigma * sigma))
    total += kernel[i + radius]
  }
  for (let i = 0; i < kernel.length; i += 1) kernel[i] /= total

  const temp = new Float32Array(values.length)
  const out = new Float32Array(values.length)
  for (let y = 0; y < height; y += 1) {
    const row = y * width
    for (let x = 0; x < width; x += 1) {
      let sum = 0
      for (let k = -radius; k <= radius; k += 1) {
        const sx = Math.min(width - 1, Math.max(0, x + k))
        sum += values[row + sx] * kernel[k + radius]
      }
      temp[row + x] = sum
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let sum = 0
      for (let k = -radius; k <= radius; k += 1) {
        const sy = Math.min(height - 1, Math.max(0, y + k))
        sum += temp[sy * width + x] * kernel[k + radius]
      }
      out[y * width + x] = sum
    }
  }
  return out
}

// Layout position of an element relative to an ancestor, ignoring transforms.
function layoutBox(element, ancestor) {
  let left = 0
  let top = 0
  let node = element
  while (node && node !== ancestor) {
    left += node.offsetLeft
    top += node.offsetTop
    node = node.offsetParent
  }
  return { left, top, width: element.offsetWidth, height: element.offsetHeight }
}

/**
 * Rasterises the wordmark and turns it into a smooth field: 1 on the outline,
 * rising to FIELD_MAX along each stroke and falling off outside like a droplet.
 */
function buildLetterField({ box, font, fontSize, letterSpacing, lineHeight, scale, text }) {
  const margin = Math.round(fontSize * 0.5)
  const region = { left: box.left - margin, top: box.top - margin, width: box.width + margin * 2, height: box.height + margin * 2 }
  const width = Math.max(8, Math.round(region.width * scale))
  const height = Math.max(8, Math.round(region.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d', { willReadFrequently: true })
  context.setTransform(width / region.width, 0, 0, height / region.height, 0, 0)
  context.font = font
  context.textBaseline = 'alphabetic'
  context.fillStyle = '#fff'
  const spaced = 'letterSpacing' in context
  if (spaced) context.letterSpacing = `${letterSpacing}px`
  const metrics = context.measureText(text)
  const ascent = metrics.fontBoundingBoxAscent ?? fontSize * 0.97
  const descent = metrics.fontBoundingBoxDescent ?? fontSize * 0.24
  const baseline = margin + (lineHeight - (ascent + descent)) / 2 + ascent
  if (spaced) {
    context.fillText(text, margin, baseline)
  } else {
    for (let index = 0; index < text.length; index += 1) {
      const x = margin + context.measureText(text.slice(0, index + 1)).width - context.measureText(text[index]).width + index * letterSpacing
      context.fillText(text[index], x, baseline)
    }
  }

  const pixels = context.getImageData(0, 0, width, height).data
  const count = width * height
  const outside = new Float64Array(count)
  const inside = new Float64Array(count)
  for (let index = 0; index < count; index += 1) {
    const filled = pixels[index * 4 + 3] >= 128
    outside[index] = filled ? 0 : INFINITE
    inside[index] = filled ? INFINITE : 0
  }
  distanceTransform(outside, width, height)
  distanceTransform(inside, width, height)

  const texel = region.width / width
  const depths = []
  for (let index = 0; index < count; index += 1) {
    if (inside[index] > 0) depths.push(Math.sqrt(inside[index]))
  }
  depths.sort((a, b) => a - b)
  const halfStroke = Math.max(2, (depths[Math.floor(depths.length * 0.96)] || 4) * texel)
  const reach = halfStroke / 0.45

  const raw = new Float32Array(count)
  for (let index = 0; index < count; index += 1) {
    const distance = (Math.sqrt(outside[index]) - Math.sqrt(inside[index])) * texel
    const value = (reach / Math.max(reach + distance, reach * 0.2)) ** 2
    raw[index] = value <= 1 ? value : 1 + (FIELD_MAX - 1) * Math.tanh((value - 1) / (FIELD_MAX - 1))
  }
  const smooth = gaussianBlur(raw, width, height, (halfStroke * 0.28) / texel)

  // WebGL rows run bottom-up.
  const data = new Float32Array(count)
  for (let y = 0; y < height; y += 1) {
    data.set(smooth.subarray(y * width, (y + 1) * width), (height - 1 - y) * width)
  }

  // Anchor points along the stroke spines, spread across the word.
  const anchors = []
  const bins = BLOBS
  for (let bin = 0; bin < bins; bin += 1) {
    const x0 = Math.floor(((margin + (box.width * bin) / bins) / region.width) * width)
    const x1 = Math.floor(((margin + (box.width * (bin + 1)) / bins) / region.width) * width)
    let best = null
    for (let y = 0; y < height; y += 1) {
      for (let x = x0; x < x1; x += 1) {
        const depth = inside[y * width + x]
        if (depth > 0 && (!best || depth > best.depth)) best = { depth, x, y }
      }
    }
    if (best) anchors.push({ x: region.left + (best.x + 0.5) * texel, y: region.top + (best.y + 0.5) * texel })
  }

  return { anchors, data, halfStroke, height, region, width }
}

const clamp01 = (value) => Math.min(1, Math.max(0, value))
const smooth = (value) => value * value * (3 - 2 * value)
const mix = (a, b, amount) => a + (b - a) * amount
const seeded = (index) => {
  const value = Math.sin(index * 127.1 + 311.7) * 43758.5453
  return value - Math.floor(value)
}

/**
 * Decorative liquid-chrome wordmark for the home stage. Droplets merge into the
 * letters as `progress` advances and pull free again at the end. Needs WebGL2;
 * otherwise the CSS wordmark stays in place. Reduced motion renders one still.
 */
export function LiquidChrome({ liftRange = [0, 1], peek = 28, progress = null, tone = 'light', wordmarkRef }) {
  const hostRef = useRef(null)
  const { coarsePointer, isMobile, reducedMotion } = useResponsiveMotion()

  useEffect(() => {
    const host = hostRef.current
    const art = host?.parentElement
    const wordmark = wordmarkRef?.current
    if (!host || !art || !wordmark) return undefined

    const canvas = document.createElement('canvas')
    canvas.className = 'chrome__canvas'
    const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true })
    if (!gl) {
      art.dataset.chrome = 'fallback'
      return undefined
    }
    host.appendChild(canvas)

    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
    const program = gl.createProgram()
    const fail = () => {
      canvas.remove()
      art.dataset.chrome = 'fallback'
      return undefined
    }
    if (!vertex || !fragment || !program) return fail()
    gl.attachShader(program, vertex)
    gl.attachShader(program, fragment)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return fail()
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'aPosition')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)

    const uniforms = Object.fromEntries(['uScale', 'uTime', 'uForm', 'uTone', 'uPointer', 'uRipple', 'uRelief', 'uLetters', 'uLetterRect', 'uBlobs']
      .map((name) => [name, gl.getUniformLocation(program, name)]))
    gl.uniform1i(uniforms.uLetters, 0)
    gl.uniform1f(uniforms.uTone, tone === 'dark' ? 1 : 0)

    let scale = Math.min(window.devicePixelRatio || 1, 1.5) * (isMobile ? 0.7 : 0.8)
    const frameInterval = 1000 / (isMobile || coarsePointer ? 30 : 60)
    const blobData = new Float32Array(BLOBS * 4)
    const pointerTarget = { x: -9999, y: -9999, amount: 0 }
    const pointer = { x: -9999, y: -9999, amount: 0, ripple: 0 }
    let letters = null
    let blobs = []
    let layout = null
    let frame = null
    let lastFrame = 0
    let slowFrames = 0
    let visible = true
    let disposed = false
    let reported = false
    let buildToken = 0

    const readProgress = () => (reducedMotion || !progress ? 1 : clamp01(progress.get()))
    // Matches the CSS translate on the wordmark: 1 while the card peeks, 0 once open.
    const readLift = (stage) => 1 - clamp01((stage - liftRange[0]) / (liftRange[1] - liftRange[0]))

    const resize = () => {
      const bounds = host.getBoundingClientRect()
      const width = Math.max(1, Math.round(bounds.width * scale))
      const height = Math.max(1, Math.round(bounds.height * scale))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
      return bounds
    }

    const build = async () => {
      const token = ++buildToken
      const style = getComputedStyle(wordmark)
      const fontSize = parseFloat(style.fontSize) || 160
      const font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`
      try {
        await document.fonts.load(font, wordmark.textContent)
      } catch { /* Draw with whatever font is available. */ }
      if (disposed || token !== buildToken) return

      const bounds = resize()
      const box = layoutBox(wordmark, art)
      const letterSpacing = parseFloat(style.letterSpacing) || 0
      const lineHeight = parseFloat(style.lineHeight) || fontSize * 0.8
      letters = buildLetterField({ box, font, fontSize, letterSpacing, lineHeight, scale: Math.min(scale, 1.2), text: wordmark.textContent.trim() })
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, letters.width, letters.height, 0, gl.RED, gl.FLOAT, letters.data)
      if (gl.getError() !== gl.NO_ERROR) {
        letters = null
        fail()
        return
      }

      const peekTop = parseFloat(getComputedStyle(art).getPropertyValue('--wordmark-peek'))
      layout = { box, fontSize, height: bounds.height, peek: Number.isFinite(peekTop) ? peekTop : peek, width: bounds.width }
      blobs = Array.from({ length: BLOBS }, (_, index) => ({
        anchor: letters.anchors[index % Math.max(1, letters.anchors.length)] || { x: box.left + box.width / 2, y: box.top + box.height / 2 },
        angle: (index / BLOBS) * Math.PI * 2 + seeded(index + 3) * 0.6,
        phase: seeded(index + 11) * Math.PI * 2,
        radius: fontSize * (0.05 + 0.055 * seeded(index + 5)),
        speed: (0.05 + 0.04 * seeded(index + 7)) * (index % 2 ? 1 : -1),
        wobble: fontSize * (0.01 + 0.012 * seeded(index + 13)),
      }))
      draw(performance.now())
      start()
    }

    const updateBlobs = (seconds, stage, shift) => {
      const { box, fontSize, height } = layout
      const centerX = box.left + box.width / 2
      const centerY = box.top + box.height / 2 + shift
      const radiusX = box.width / 2 + fontSize * 0.34
      const radiusY = box.height / 2 + fontSize * 0.3
      // Droplets travel over their letter, drop into it and dissolve while the
      // letters fill; after a clean hold they bud off again and drift away.
      const pull = clamp01((stage - 0.02) / 0.46)
      const release = clamp01((stage - 0.66) / 0.26)
      const travel = release > 0 ? 1 - release : pull

      blobs.forEach((blob, index) => {
        const angle = blob.angle + seconds * blob.speed
        const orbitX = centerX + Math.cos(angle) * radiusX
        const orbitY = Math.max(blob.radius + 8, centerY + Math.sin(angle) * radiusY)
        const aboveY = Math.max(blob.radius + 8, box.top + shift - blob.radius * 1.6)
        const anchorY = blob.anchor.y + shift
        const approach = smooth(clamp01(travel * 2))
        const sink = smooth(clamp01(travel * 2 - 1))
        let x = mix(mix(orbitX, blob.anchor.x, approach), blob.anchor.x, sink)
        let y = mix(mix(orbitY, aboveY, approach), anchorY, sink)
        x += Math.sin(seconds * 1.3 + blob.phase) * blob.wobble * (1 - sink)
        y += Math.cos(seconds * 1.1 + blob.phase) * blob.wobble * (1 - sink)

        // Droplets drift away from the pointer.
        const dx = x - pointer.x
        const dy = y - pointer.y
        const distance = Math.hypot(dx, dy) || 1
        const push = pointer.amount * fontSize * 0.28 * Math.exp(-(distance * distance) / (fontSize * fontSize * 0.36))
        x += (dx / distance) * push
        y += (dy / distance) * push

        blobData[index * 4] = x * scale
        blobData[index * 4 + 1] = (height - y) * scale
        blobData[index * 4 + 2] = blob.radius * scale
        blobData[index * 4 + 3] = mix(1, 0.05, sink)
      })
    }

    const draw = (now) => {
      if (!letters || !layout) return
      const seconds = reducedMotion ? 7 : now / 1000
      const stage = readProgress()
      pointer.x += (pointerTarget.x - pointer.x) * 0.16
      pointer.y += (pointerTarget.y - pointer.y) * 0.16
      pointer.amount += (pointerTarget.amount - pointer.amount) * 0.08
      pointer.ripple *= 0.95

      const { region } = letters
      const { box, height } = layout
      const shift = readLift(stage) * Math.min(0, layout.peek - box.top)
      updateBlobs(seconds, stage, shift)
      gl.uniform1f(uniforms.uScale, scale)
      gl.uniform1f(uniforms.uTime, seconds)
      gl.uniform1f(uniforms.uForm, mix(0.42, 1, smooth(clamp01((stage - 0.02) / 0.5))))
      gl.uniform3f(uniforms.uPointer, pointer.x * scale, (height - pointer.y) * scale, pointer.amount)
      gl.uniform1f(uniforms.uRipple, Math.min(1, pointer.ripple))
      gl.uniform1f(uniforms.uRelief, letters.halfStroke * scale * 1.15)
      const top = region.top + shift
      gl.uniform4f(uniforms.uLetterRect, region.left * scale, (height - top - region.height) * scale, (region.left + region.width) * scale, (height - top) * scale)
      gl.uniform4fv(uniforms.uBlobs, blobData)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (!reported) {
        reported = true
        art.dataset.chrome = 'ready'
      }
    }

    const loop = (now) => {
      frame = null
      if (!visible || document.visibilityState !== 'visible') return
      const elapsed = now - lastFrame
      if (elapsed >= frameInterval - 1) {
        // Drop resolution once if the device cannot keep up.
        slowFrames = elapsed > frameInterval * 1.9 && lastFrame > 0 ? slowFrames + 1 : Math.max(0, slowFrames - 1)
        if (slowFrames > 24 && scale > 0.55) {
          slowFrames = 0
          scale *= 0.78
          resize()
        }
        lastFrame = now
        draw(now)
      }
      frame = window.requestAnimationFrame(loop)
    }

    const start = () => {
      if (reducedMotion || !letters) return
      if (frame === null && visible) frame = window.requestAnimationFrame(loop)
    }

    const handleMove = (event) => {
      if (coarsePointer || reducedMotion) return
      const bounds = host.getBoundingClientRect()
      const x = event.clientX - bounds.left
      const y = event.clientY - bounds.top
      if (pointerTarget.amount > 0) pointer.ripple += Math.min(0.2, Math.hypot(x - pointerTarget.x, y - pointerTarget.y) / 260)
      pointerTarget.x = x
      pointerTarget.y = y
      pointerTarget.amount = 1
      if (pointer.x < -9000) {
        pointer.x = x
        pointer.y = y
      }
    }

    const handleLeave = () => {
      pointerTarget.amount = 0
    }

    const handleVisibility = () => start()

    const handleContextLost = (event) => {
      event.preventDefault()
      if (frame !== null) window.cancelAnimationFrame(frame)
      frame = null
      art.dataset.chrome = 'fallback'
    }

    let resizeTimer = null
    const resizeObserver = new ResizeObserver(() => {
      // Resizing clears the canvas: repaint with the current field, then rebuild it.
      if (letters && layout) {
        const bounds = resize()
        layout = { ...layout, height: bounds.height, width: bounds.width }
        draw(performance.now())
      }
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(build, letters ? 160 : 0)
    })
    resizeObserver.observe(host)

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      start()
    })
    intersection.observe(host)

    const surface = art.closest('.stage__card') || art
    surface.addEventListener('pointermove', handleMove, { passive: true })
    surface.addEventListener('pointerleave', handleLeave)
    document.addEventListener('visibilitychange', handleVisibility)
    canvas.addEventListener('webglcontextlost', handleContextLost)

    return () => {
      disposed = true
      window.clearTimeout(resizeTimer)
      if (frame !== null) window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      surface.removeEventListener('pointermove', handleMove)
      surface.removeEventListener('pointerleave', handleLeave)
      document.removeEventListener('visibilitychange', handleVisibility)
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
      delete art.dataset.chrome
    }
  }, [coarsePointer, isMobile, liftRange, peek, progress, reducedMotion, tone, wordmarkRef])

  return <div className="chrome" ref={hostRef} aria-hidden="true" />
}
