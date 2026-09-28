import { useEffect, useRef } from 'react'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'

const vertexSource = `
attribute vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

// Converging silver slats with grainy, dissolving ends. Light flows along each
// slat toward its vanishing point; the pointer brightens and bends the slats it
// passes, and a focused call to action lights the slats around it. The reading
// area is kept calm so text stays legible. The hero variant converges below the
// frame so light pours down into the panel beneath it; the closer mirrors it,
// converging above, so the page ends on the answering diagonal.
const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerAmt;
uniform vec2 uFocus;
uniform float uFocusAmt;
uniform float uScroll;
uniform float uOpen;
uniform vec4 uText;
uniform float uVanishY;
uniform float uDensity;
uniform float uEnvelopeY;
uniform float uPool;

float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 p = (frag - 0.5 * uRes) / uRes.y;
  vec2 pointer = (uPointer - 0.5 * uRes) / uRes.y;
  vec2 focus = (uFocus - 0.5 * uRes) / uRes.y;
  float halfWidth = 0.5 * uRes.x / uRes.y;

  // Slats are lines through a vanishing point outside the frame, so they read
  // as Raycast-like diagonals that converge off screen.
  vec2 vanish = vec2(halfWidth * 0.4 + 2.2, uVanishY);
  vec2 d = p - vanish;
  float angle = atan(d.y, d.x);
  float along = length(d);

  float pointerDistance = distance(p, pointer);
  float pointerField = exp(-pointerDistance * pointerDistance / 0.03) * uPointerAmt;
  float focusDistance = distance(p, focus);
  float focusField = exp(-focusDistance * focusDistance / 0.06) * uFocusAmt;
  float slat = angle * uDensity + pointerField * 0.55;

  float id = floor(slat);
  float across = fract(slat);
  float r1 = hash11(id * 1.37 + 3.1);
  float r2 = hash11(id * 2.11 + 7.7);
  float grain = hash12(frag + fract(uTime * 3.0) * 97.0) - 0.5;

  float crossing = across + grain * 0.07;
  float body = smoothstep(0.10, 0.24, crossing) * (1.0 - smoothstep(0.80, 0.95, crossing));
  float rim = smoothstep(0.12, 0.19, crossing) * (1.0 - smoothstep(0.19, 0.32, crossing));

  float lengthCoord = along + grain * 0.18;
  // Closed slats sit at the far edge; opening extends them toward the vanishing point.
  float start = mix(3.6, 2.35, uOpen) + r1 * 0.3;
  float stop = 3.9 + r2 * 0.6;
  float lengthMask = smoothstep(start, start + 0.45, lengthCoord) * (1.0 - smoothstep(stop - 0.5, stop, lengthCoord));

  float speed = 0.2 + uScroll * 0.3;
  float wave = 0.5 + 0.5 * sin(along * 3.1 + uTime * speed * 6.2831 + r1 * 6.2831);
  float drift = 0.5 + 0.5 * sin(along * 1.3 + uTime * speed * 3.1 + r2 * 6.2831);
  float flow = pow(wave, 3.0) * 0.75 + drift * 0.35;

  vec2 q = (p - vec2(0.04, uEnvelopeY - uScroll * 0.1)) * vec2(0.74 / max(halfWidth, 0.6), 1.0);
  float envelope = 1.0 - smoothstep(0.26, 0.86, length(q) + grain * 0.05);
  float level = 0.5 + r2 * 0.5;

  float lum = body * lengthMask * envelope * level * (0.22 + 0.85 * flow);
  lum += rim * lengthMask * envelope * level * (0.14 + 0.85 * pow(wave, 4.0));
  lum += (pointerField * 0.45 + focusField * 0.35) * body * lengthMask;

  // Light pools where the hero slats pour into the panel below.
  float pool = exp(-(p.x * p.x * 2.6 + (p.y + 0.62) * (p.y + 0.62) * 16.0));
  lum += pool * 0.16 * (0.7 + 0.3 * drift) * uPool;

  // Keep a rounded reading zone calm so the copy keeps its contrast.
  vec2 textCenter = 0.5 * (uText.xy + uText.zw);
  vec2 textRadius = max(0.5 * (uText.zw - uText.xy), vec2(1.0)) * vec2(1.06, 1.1);
  vec2 textRel = abs(frag - textCenter) / textRadius;
  float textDistance = pow(pow(textRel.x, 4.0) + pow(textRel.y, 4.0), 0.25);
  float shield = smoothstep(0.86, 1.32, textDistance);
  lum *= mix(0.3, 1.0, shield);

  lum += grain * 0.05 * smoothstep(0.02, 0.2, lum);
  lum = clamp(lum, 0.0, 1.0);

  vec3 silver = mix(vec3(0.64), vec3(0.95), clamp(flow, 0.0, 1.0));
  gl_FragColor = vec4(silver * lum, lum);
}
`

const variants = {
  hero: { density: 18, envelopeY: -0.2, pool: 1, text: '.hero__inner > *', vanishY: -2.3 },
  closer: { density: 26, envelopeY: 0.12, pool: 0, text: '.destination__inner > *', vanishY: 2.3 },
}

const clamp01 = (value) => Math.min(1, Math.max(0, value))

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

/**
 * Decorative background: silver light slats rendered by one small fragment
 * shader. The `hero` variant pours light downward; the `closer` variant mirrors
 * it and grows its slats as `progress` (a motion value) opens the panel. An
 * element marked `data-slats-focus` lights the slats around it while hovered or
 * focused. Falls back to a static CSS rendering when WebGL is unavailable.
 * Reduced motion renders a single still frame.
 */
export function LightSlats({ progress = null, variant = 'hero' }) {
  const hostRef = useRef(null)
  const { coarsePointer, isMobile, reducedMotion } = useResponsiveMotion()

  useEffect(() => {
    const settings = variants[variant] || variants.hero
    const host = hostRef.current
    const stage = host?.parentElement
    if (!host || !stage) return undefined

    // A fresh canvas per run: a context released on cleanup can never be reused.
    const canvas = document.createElement('canvas')
    canvas.className = 'slats__canvas'
    const gl = canvas.getContext('webgl', { alpha: true, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, powerPreference: 'low-power' })
    if (!gl) {
      host.dataset.slats = 'fallback'
      return undefined
    }
    host.appendChild(canvas)

    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource)
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource)
    const program = gl.createProgram()
    const fail = () => {
      canvas.remove()
      host.dataset.slats = 'fallback'
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

    const uniforms = Object.fromEntries(['uRes', 'uTime', 'uPointer', 'uPointerAmt', 'uFocus', 'uFocusAmt', 'uScroll', 'uOpen', 'uText', 'uVanishY', 'uDensity', 'uEnvelopeY', 'uPool']
      .map((name) => [name, gl.getUniformLocation(program, name)]))
    gl.uniform1f(uniforms.uVanishY, settings.vanishY)
    gl.uniform1f(uniforms.uDensity, settings.density)
    gl.uniform1f(uniforms.uEnvelopeY, settings.envelopeY)
    gl.uniform1f(uniforms.uPool, settings.pool)

    const renderScale = Math.min(window.devicePixelRatio || 1, 1) * (isMobile ? 0.55 : 0.75)
    const frameInterval = 1000 / (isMobile || coarsePointer ? 30 : 60)
    const focusElement = stage.querySelector('[data-slats-focus]')
    const pointerTarget = { x: 0, y: 0, amount: 0 }
    const pointer = { x: 0, y: 0, amount: 0 }
    const focus = { x: -9999, y: -9999, amount: 0, target: 0 }
    const text = [0, 0, 0, 0]
    let frame = null
    let lastFrame = 0
    let visible = true
    let started = false
    let reported = false

    const measure = () => {
      const bounds = host.getBoundingClientRect()
      const width = Math.max(1, Math.round(bounds.width * renderScale))
      const height = Math.max(1, Math.round(bounds.height * renderScale))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
      const blocks = [...stage.querySelectorAll(settings.text)].map((element) => element.getBoundingClientRect())
      if (blocks.length) {
        const left = Math.min(...blocks.map((rect) => rect.left))
        const right = Math.max(...blocks.map((rect) => rect.right))
        const top = Math.min(...blocks.map((rect) => rect.top))
        const bottom = Math.max(...blocks.map((rect) => rect.bottom))
        text[0] = (left - bounds.left) * renderScale
        text[2] = (right - bounds.left) * renderScale
        text[1] = (bounds.bottom - bottom) * renderScale
        text[3] = (bounds.bottom - top) * renderScale
      }
      if (focusElement) {
        const rect = focusElement.getBoundingClientRect()
        focus.x = (rect.left + rect.width / 2 - bounds.left) * renderScale
        focus.y = (bounds.bottom - rect.top - rect.height / 2) * renderScale
      }
    }

    const draw = (now) => {
      const seconds = reducedMotion ? 8 : now / 1000
      pointer.x += (pointerTarget.x - pointer.x) * 0.08
      pointer.y += (pointerTarget.y - pointer.y) * 0.08
      pointer.amount += (pointerTarget.amount - pointer.amount) * 0.06
      focus.amount += (focus.target - focus.amount) * 0.08
      const stageHeight = stage.offsetHeight || 1
      const scroll = variant === 'hero' && !reducedMotion ? clamp01(window.scrollY / stageHeight) : 0
      const open = variant === 'hero' || reducedMotion || !progress ? 1 : clamp01(progress.get())

      gl.uniform2f(uniforms.uRes, canvas.width, canvas.height)
      gl.uniform1f(uniforms.uTime, seconds)
      gl.uniform2f(uniforms.uPointer, pointer.x, pointer.y)
      gl.uniform1f(uniforms.uPointerAmt, pointer.amount)
      gl.uniform2f(uniforms.uFocus, focus.x, focus.y)
      gl.uniform1f(uniforms.uFocusAmt, focus.amount)
      gl.uniform1f(uniforms.uScroll, scroll)
      gl.uniform1f(uniforms.uOpen, open)
      gl.uniform4f(uniforms.uText, text[0], text[1], text[2], text[3])
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (!reported) {
        reported = true
        host.dataset.slats = 'ready'
      }
    }

    const loop = (now) => {
      frame = null
      if (!visible || document.visibilityState !== 'visible') return
      if (now - lastFrame >= frameInterval - 1) {
        lastFrame = now
        draw(now)
      }
      frame = window.requestAnimationFrame(loop)
    }

    const start = () => {
      if (reducedMotion) {
        draw(performance.now())
        return
      }
      if (frame === null && visible) frame = window.requestAnimationFrame(loop)
    }

    const handleMove = (event) => {
      if (coarsePointer || reducedMotion) return
      const bounds = host.getBoundingClientRect()
      pointerTarget.x = (event.clientX - bounds.left) * renderScale
      pointerTarget.y = (bounds.bottom - event.clientY) * renderScale
      pointerTarget.amount = 1
      if (!started) {
        pointer.x = pointerTarget.x
        pointer.y = pointerTarget.y
        started = true
      }
    }

    const handleLeave = () => {
      pointerTarget.amount = 0
    }

    const handleFocusOn = () => {
      focus.target = 1
    }

    const handleFocusOff = () => {
      focus.target = 0
    }

    const handleVisibility = () => start()

    const handleContextLost = (event) => {
      event.preventDefault()
      if (frame !== null) window.cancelAnimationFrame(frame)
      frame = null
      host.dataset.slats = 'fallback'
    }

    const resizeObserver = new ResizeObserver(() => {
      measure()
      if (reducedMotion) draw(performance.now())
    })
    resizeObserver.observe(host)
    resizeObserver.observe(stage)

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      start()
    })
    intersection.observe(host)

    stage.addEventListener('pointermove', handleMove, { passive: true })
    stage.addEventListener('pointerleave', handleLeave)
    focusElement?.addEventListener('pointerenter', handleFocusOn)
    focusElement?.addEventListener('pointerleave', handleFocusOff)
    focusElement?.addEventListener('focus', handleFocusOn)
    focusElement?.addEventListener('blur', handleFocusOff)
    document.addEventListener('visibilitychange', handleVisibility)
    canvas.addEventListener('webglcontextlost', handleContextLost)

    measure()
    start()

    return () => {
      if (frame !== null) window.cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      stage.removeEventListener('pointermove', handleMove)
      stage.removeEventListener('pointerleave', handleLeave)
      focusElement?.removeEventListener('pointerenter', handleFocusOn)
      focusElement?.removeEventListener('pointerleave', handleFocusOff)
      focusElement?.removeEventListener('focus', handleFocusOn)
      focusElement?.removeEventListener('blur', handleFocusOff)
      document.removeEventListener('visibilitychange', handleVisibility)
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertex)
      gl.deleteShader(fragment)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
      canvas.remove()
    }
  }, [coarsePointer, isMobile, progress, reducedMotion, variant])

  return (
    <div className={`slats slats--${variant}`} data-slats="loading" ref={hostRef} aria-hidden="true">
      <div className="slats__fallback" />
    </div>
  )
}
