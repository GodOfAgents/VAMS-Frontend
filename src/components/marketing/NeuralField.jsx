import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  createFrameBudgetController,
  getNextLowerHeroTier,
  getViewportHeroTier,
  HERO_QUALITY_ORDER,
} from '../../motion/heroQuality.js'

const qualityProfiles = {
  low: {
    antialias: false, budgetMs: 30, camera: [0, 4.6, 12.8], density: 0.78,
    height: 22, opacity: 0.48, pointScale: 2.75, pointerRadius: 4.2,
    position: [0, -2.8, -1.4], rotation: -1.14, segments: [48, 32], width: 30,
  },
  medium: {
    antialias: false, budgetMs: 30, camera: [0, 5, 12.4], density: 0.86,
    height: 30, opacity: 0.54, pointScale: 2.55, pointerRadius: 5.4,
    position: [0, -2.2, -1.1], rotation: -1.2, segments: [72, 48], width: 42,
  },
  high: {
    antialias: true, budgetMs: 22, camera: [0, 5.2, 12.4], density: 0.94,
    height: 38, opacity: 0.62, pointScale: 2.4, pointerRadius: 6.8,
    position: [0, -1.7, -0.9], rotation: -Math.PI / 2.5, segments: [112, 72], width: 60,
  },
  wide: {
    antialias: true, budgetMs: 22, camera: [0, 5.6, 13.2], density: 1,
    height: 44, opacity: 0.65, pointScale: 2.3, pointerRadius: 7.4,
    position: [0, -1.4, -0.8], rotation: -Math.PI / 2.5, segments: [128, 80], width: 70,
  },
}

const terrainVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPointDensity;
  uniform float uPointScale;
  uniform float uPointerRadius;
  uniform float uPointerStrength;
  uniform float uProofProgress;
  uniform float uPageProgress;
  uniform float uChapterFrom;
  uniform float uChapterTo;
  uniform float uChapterMix;
  uniform float uMotionScale;
  uniform vec2 uPointer;
  attribute float aDensity;
  attribute float aShade;
  varying float vDepth;
  varying float vElevation;
  varying float vProof;
  varying float vShade;
  varying float vVisible;
  varying float vPointer;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x * 34.0) + 10.0) * x); }

  float simplexNoise(vec2 value) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(value + dot(value, C.yy));
    vec2 x0 = value - i + dot(i, C.xx);
    vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 gradient;
    gradient.x = a0.x * x0.x + h.x * x0.y;
    gradient.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, gradient);
  }

  float peak(vec2 uv, vec2 origin, vec2 scale) {
    vec2 delta = (uv - origin) * scale;
    return exp(-dot(delta, delta));
  }

  float chapterElevation(float chapter, vec3 source, vec2 uv, float time) {
    float ambient = simplexNoise(source.xy * 0.105 + vec2(time * 0.042, -time * 0.026)) * 1.12;
    float detail = simplexNoise(source.xy * 0.29 - vec2(time * 0.055, -time * 0.034)) * 0.28;
    float intro = ambient + detail + peak(uv, vec2(0.72, 0.54), vec2(3.2, 2.2)) * 1.18;
    float lifecycle = ambient * 0.72 + detail + sin((uv.x * 0.72 + uv.y) * 19.0 - time * 0.42) * 0.18
      + peak(uv, vec2(0.58, 0.48), vec2(2.1, 4.8)) * 0.72;
    float architecture = ambient * 0.58 + detail * 0.72
      + (peak(uv, vec2(0.28, 0.38), vec2(5.0, 4.4))
      + peak(uv, vec2(0.54, 0.62), vec2(5.4, 4.8))
      + peak(uv, vec2(0.78, 0.34), vec2(5.0, 4.2))) * 0.82;
    float ringDistance = abs(distance(uv, vec2(0.64, 0.52)) - 0.2);
    float evidence = ambient * 0.5 + detail * 0.64 + exp(-pow(ringDistance * 17.0, 2.0)) * 0.92;
    float journey = ambient * 0.66 + detail * 0.72
      + (peak(uv, vec2(0.2, 0.58), vec2(7.0, 5.0))
      + peak(uv, vec2(0.42, 0.42), vec2(7.0, 5.0))
      + peak(uv, vec2(0.64, 0.6), vec2(7.0, 5.0))
      + peak(uv, vec2(0.84, 0.4), vec2(7.0, 5.0))) * 0.72;
    float cta = ambient * 0.48 + detail * 0.55
      + peak(uv, vec2(0.5, 0.5), vec2(2.4, 7.0)) * 1.08;

    if (chapter < 0.5) return intro;
    if (chapter < 1.5) return lifecycle;
    if (chapter < 2.5) return architecture;
    if (chapter < 3.5) return evidence;
    if (chapter < 4.5) return journey;
    return cta;
  }

  void main() {
    float time = uTime * uMotionScale;
    float elevationFrom = chapterElevation(uChapterFrom, position, uv, time);
    float elevationTo = chapterElevation(uChapterTo, position, uv, time);
    float elevation = mix(elevationFrom, elevationTo, smoothstep(0.0, 1.0, uChapterMix));
    float pointerDistance = distance(position.xy, uPointer);
    float pointerLift = smoothstep(uPointerRadius, 0.0, pointerDistance) * uPointerStrength * 1.9;
    float pointerRipple = sin(pointerDistance * 1.45 - uTime * 1.15)
      * smoothstep(uPointerRadius * 1.35, 0.0, pointerDistance) * uPointerStrength * 0.14;
    float pointerEcho = sin(pointerDistance * 2.8 - uTime * 0.72)
      * smoothstep(uPointerRadius * 1.7, 0.0, pointerDistance) * uPointerStrength * 0.07;
    float pointerField = smoothstep(uPointerRadius * 1.15, 0.0, pointerDistance) * uPointerStrength;
    float proofPath = uv.x * 0.76 + (1.0 - uv.y) * 0.24;
    float proofDistance = proofPath - uProofProgress;
    float proofWave = exp(-pow(proofDistance * 18.0, 2.0))
      * smoothstep(0.0, 0.12, uProofProgress)
      * (1.0 - smoothstep(0.92, 1.12, uProofProgress));

    vec3 transformed = position;
    transformed.z = elevation + pointerLift + pointerRipple + pointerEcho + proofWave * (0.7 + sin(uv.y * 20.0) * 0.12);
    vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vDepth = clamp((-viewPosition.z - 4.0) / 30.0, 0.0, 1.0);
    vElevation = transformed.z;
    vProof = proofWave;
    vShade = aShade;
    vVisible = step(aDensity, uPointDensity);
    vPointer = pointerField;
    vUv = uv;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = max(1.0, uPointScale * uPixelRatio * (14.0 / max(3.5, -viewPosition.z)) * vVisible);
  }
`

const pointFragmentShader = `
  uniform float uOpacity;
  uniform float uThemeMix;
  varying float vDepth;
  varying float vElevation;
  varying float vProof;
  varying float vShade;
  varying float vVisible;
  varying float vPointer;
  varying vec2 vUv;

  void main() {
    if (vVisible < 0.5) discard;
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    float pointEdge = 1.0 - smoothstep(0.12, 0.5, distanceToCenter);
    float horizonFog = exp(-pow(vDepth * 1.62, 2.0));
    float edgeFadeX = smoothstep(0.0, 0.08, vUv.x) * smoothstep(0.0, 0.08, 1.0 - vUv.x);
    float edgeFadeY = smoothstep(0.0, 0.11, vUv.y) * smoothstep(0.0, 0.11, 1.0 - vUv.y);
    float elevationLight = clamp(0.72 + vElevation * 0.12, 0.42, 1.0);
    float shade = clamp(vShade * elevationLight + vProof * 0.34 + vPointer * 0.3, 0.18, 1.0);
    vec3 lightPoint = vec3(0.88) * shade;
    vec3 darkPoint = vec3(0.08 + (1.0 - shade) * 0.18);
    vec3 pointColor = mix(darkPoint, lightPoint, uThemeMix);
    float alpha = pointEdge * horizonFog * edgeFadeX * edgeFadeY * uOpacity * (1.0 + vProof * 0.42 + vPointer * 0.28);
    gl_FragColor = vec4(pointColor, alpha);
  }
`

function deterministicValue(index, salt = 0) {
  const value = Math.sin(index * 91.719 + salt * 17.13) * 43758.5453
  return value - Math.floor(value)
}

function createTerrainGeometry(profile) {
  const [segmentsX, segmentsY] = profile.segments
  const geometry = new THREE.PlaneGeometry(profile.width, profile.height, segmentsX, segmentsY)
  const positions = geometry.attributes.position
  const densities = new Float32Array(positions.count)
  const shades = new Float32Array(positions.count)
  for (let index = 0; index < positions.count; index += 1) {
    positions.setX(index, positions.getX(index) + (deterministicValue(index) - 0.5) * 0.08)
    positions.setY(index, positions.getY(index) + (deterministicValue(index, 23) - 0.5) * 0.08)
    densities[index] = deterministicValue(index, 71)
    shades[index] = 0.32 + deterministicValue(index, 47) * 0.58
  }
  positions.needsUpdate = true
  geometry.setAttribute('aDensity', new THREE.BufferAttribute(densities, 1))
  geometry.setAttribute('aShade', new THREE.BufferAttribute(shades, 1))
  return geometry
}

export default function NeuralField({
  onDegrade,
  onFailure,
  onReady,
  proofSignal = 0,
  quality,
  sceneStateRef,
}) {
  const mountRef = useRef(null)
  const proofSignalRef = useRef(proofSignal)
  const triggerProofRef = useRef(null)

  useEffect(() => {
    proofSignalRef.current = proofSignal
    if (proofSignal > 0) triggerProofRef.current?.()
  }, [proofSignal])

  useEffect(() => {
    const container = mountRef.current
    const tier = quality?.tier || 'high'
    const profile = qualityProfiles[tier] || qualityProfiles.high
    if (!container) return undefined

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: profile.antialias,
        powerPreference: 'high-performance',
      })
    } catch {
      onFailure?.()
      return undefined
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / Math.max(container.clientHeight, 1), 0.1, 100)
    camera.position.set(...profile.camera)
    camera.lookAt(0, -0.8, 0)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearAlpha(0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxDpr))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const geometry = createTerrainGeometry(profile)
    const uniforms = {
      uChapterFrom: { value: 0 },
      uChapterMix: { value: 0 },
      uChapterTo: { value: 0 },
      uMotionScale: { value: tier === 'low' ? 0.58 : tier === 'medium' ? 0.76 : 1 },
      uOpacity: { value: profile.opacity },
      uPageProgress: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, quality.maxDpr) },
      uPointDensity: { value: profile.density },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerRadius: { value: profile.pointerRadius },
      uPointerStrength: { value: 0 },
      uPointScale: { value: profile.pointScale },
      uProofProgress: { value: -1 },
      uThemeMix: { value: sceneStateRef.current.themeMix },
      uTime: { value: 0 },
    }
    const material = new THREE.ShaderMaterial({
      blending: THREE.NormalBlending,
      depthWrite: false,
      fragmentShader: pointFragmentShader,
      transparent: true,
      uniforms,
      vertexShader: terrainVertexShader,
    })
    const terrain = new THREE.Points(geometry, material)
    terrain.position.set(...profile.position)
    terrain.rotation.x = profile.rotation
    scene.add(terrain)

    const clock = new THREE.Clock()
    const frameBudget = createFrameBudgetController({ thresholdMs: profile.budgetMs })
    const pointerTarget = new THREE.Vector2(0, 0)
    const minimumFrameInterval = quality.targetFps ? 1000 / quality.targetFps : 0
    let degradeRequested = false
    let lastAnimationAt = null
    let lastRenderAt = Number.NEGATIVE_INFINITY
    let pageVisible = document.visibilityState === 'visible'
    let proofPlayed = false
    let proofStartsAt = null
    let readyReported = false
    let targetStrength = 0

    const triggerProof = () => {
      if (proofPlayed) return
      proofPlayed = true
      proofStartsAt = performance.now() + 250
      container.dataset.proofCount = '1'
      container.dataset.proofWave = 'scheduled'
    }
    triggerProofRef.current = triggerProof
    container.dataset.proofCount = '0'
    if (proofSignalRef.current > 0) triggerProof()

    const render = (animationTime = performance.now()) => {
      if (!pageVisible) return
      if (lastAnimationAt !== null && !degradeRequested) {
        const frameInterval = animationTime - lastAnimationAt
        if (frameBudget.record(frameInterval, animationTime)) {
          degradeRequested = true
          onDegrade?.(getNextLowerHeroTier(tier))
        }
      }
      lastAnimationAt = animationTime
      if (animationTime - lastRenderAt < minimumFrameInterval - 0.5) return
      lastRenderAt = animationTime

      const time = clock.getElapsedTime()
      const sceneState = sceneStateRef.current
      uniforms.uTime.value = time
      uniforms.uChapterFrom.value = sceneState.chapterFrom
      uniforms.uChapterTo.value = sceneState.chapterTo
      uniforms.uChapterMix.value += (sceneState.chapterMix - uniforms.uChapterMix.value) * 0.08
      uniforms.uPageProgress.value += (sceneState.pageProgress - uniforms.uPageProgress.value) * 0.065
      uniforms.uThemeMix.value += (sceneState.themeMix - uniforms.uThemeMix.value) * 0.08
      uniforms.uPointer.value.lerp(pointerTarget, 0.065)
      uniforms.uPointerStrength.value += (targetStrength - uniforms.uPointerStrength.value) * 0.055

      if (proofStartsAt !== null && animationTime >= proofStartsAt) {
        const proofProgress = (animationTime - proofStartsAt) / 1400
        if (proofProgress <= 1.12) {
          uniforms.uProofProgress.value = proofProgress
          container.dataset.proofWave = 'active'
        } else {
          uniforms.uProofProgress.value = -1
          container.dataset.proofWave = 'complete'
          proofStartsAt = null
        }
      }

      const scrollDrift = quality.scrollEnabled ? uniforms.uPageProgress.value : 0
      camera.position.x = profile.camera[0] + Math.sin(time * 0.08) * (tier === 'low' ? 0.2 : 0.66)
      camera.position.y = profile.camera[1] + Math.cos(time * 0.065) * 0.12 + scrollDrift * 0.12
      camera.position.z = profile.camera[2] + Math.sin(time * 0.045) * 0.1 - scrollDrift * profile.camera[2] * 0.03
      camera.lookAt(0, -0.8, 0)
      const footerFade = 1 - THREE.MathUtils.smoothstep(sceneState.pageProgress, 0.94, 1)
      uniforms.uOpacity.value = profile.opacity * (0.82 + (1 - sceneState.chapterMix) * 0.18) * footerFade
      renderer.render(scene, camera)

      if (!readyReported) {
        readyReported = true
        onReady?.()
      }
    }

    const updateLoop = () => {
      renderer.setAnimationLoop(pageVisible ? render : null)
      if (pageVisible) render()
    }

    const handlePointerMove = (event) => {
      const sceneElement = container.closest('.marketing-scene')
      const bounds = sceneElement?.getBoundingClientRect()
      const withinScene = bounds && event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom
      if (!sceneElement || !withinScene) {
        targetStrength = 0
        sceneElement?.style.setProperty('--scene-pointer-opacity', '0')
        sceneElement?.style.setProperty('--scene-pointer-nx', '0')
        sceneElement?.style.setProperty('--scene-pointer-ny', '0')
        return
      }
      const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      sceneElement?.style.setProperty('--scene-pointer-x', `${event.clientX}px`)
      sceneElement?.style.setProperty('--scene-pointer-y', `${event.clientY}px`)
      sceneElement?.style.setProperty('--scene-pointer-nx', normalizedX.toFixed(3))
      sceneElement?.style.setProperty('--scene-pointer-ny', normalizedY.toFixed(3))
      sceneElement?.style.setProperty('--scene-pointer-opacity', '1')
      pointerTarget.set(
        ((event.clientX - bounds.left) / bounds.width - 0.5) * profile.width * 0.72,
        (0.48 - (event.clientY - bounds.top) / bounds.height) * profile.height * 0.68,
      )
      targetStrength = 1
    }

    const handleVisibility = () => {
      pageVisible = document.visibilityState === 'visible'
      updateLoop()
    }
    const handleContextLost = (event) => {
      event.preventDefault()
      renderer.setAnimationLoop(null)
      onFailure?.()
    }
    const resize = () => {
      if (!container.clientWidth || !container.clientHeight) return
      const viewportTier = getViewportHeroTier(window.innerWidth)
      if (HERO_QUALITY_ORDER.indexOf(viewportTier) < HERO_QUALITY_ORDER.indexOf(tier)) {
        degradeRequested = true
        onDegrade?.(viewportTier)
        return
      }
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      const pixelRatio = Math.min(window.devicePixelRatio, quality.maxDpr)
      renderer.setPixelRatio(pixelRatio)
      uniforms.uPixelRatio.value = pixelRatio
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    document.addEventListener('visibilitychange', handleVisibility)
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost)
    if (quality.pointerEnabled) window.addEventListener('pointermove', handlePointerMove, { passive: true })
    updateLoop()

    return () => {
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost)
      window.removeEventListener('pointermove', handlePointerMove)
      if (triggerProofRef.current === triggerProof) triggerProofRef.current = null
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.isConnected) renderer.domElement.remove()
    }
  }, [onDegrade, onFailure, onReady, quality, sceneStateRef])

  return (
    <div
      className="neural-field neural-field--canvas"
      ref={mountRef}
      aria-hidden="true"
      data-marketing-three="true"
      data-neural-quality={quality?.tier || 'high'}
    />
  )
}
