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
    antialias: false,
    budgetMs: 30,
    camera: [0, 4.6, 12.8],
    density: 0.82,
    height: 18,
    opacity: 0.6,
    pointScale: 2.75,
    pointerRadius: 4.2,
    position: [0, -3.2, -1.4],
    rotation: -1.14,
    segments: [48, 32],
    width: 24,
  },
  medium: {
    antialias: false,
    budgetMs: 30,
    camera: [0, 5, 12.4],
    density: 0.88,
    height: 26,
    opacity: 0.61,
    pointScale: 2.55,
    pointerRadius: 5.4,
    position: [0, -2.4, -1.1],
    rotation: -1.2,
    segments: [72, 48],
    width: 38,
  },
  high: {
    antialias: true,
    budgetMs: 22,
    camera: [0, 5.2, 12.4],
    density: 0.94,
    height: 36,
    opacity: 0.67,
    pointScale: 2.4,
    pointerRadius: 6.8,
    position: [0, -1.7, -0.9],
    rotation: -Math.PI / 2.5,
    segments: [112, 72],
    width: 58,
  },
  wide: {
    antialias: true,
    budgetMs: 22,
    camera: [0, 5.6, 13.2],
    density: 1,
    height: 42,
    opacity: 0.69,
    pointScale: 2.3,
    pointerRadius: 7.4,
    position: [0, -1.4, -0.8],
    rotation: -Math.PI / 2.5,
    segments: [128, 80],
    width: 68,
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
  uniform float uScrollProgress;
  uniform float uMotionScale;
  uniform vec2 uPointer;
  attribute float aDensity;
  attribute float aShade;
  varying float vDepth;
  varying float vElevation;
  varying float vProof;
  varying float vShade;
  varying float vVisible;
  varying vec2 vUv;

  vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec2 mod289(vec2 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec3 permute(vec3 x) {
    return mod289(((x * 34.0) + 10.0) * x);
  }

  float simplexNoise(vec2 value) {
    const vec4 C = vec4(
      0.211324865405187,
      0.366025403784439,
      -0.577350269189626,
      0.024390243902439
    );
    vec2 i = floor(value + dot(value, C.yy));
    vec2 x0 = value - i + dot(i, C.xx);
    vec2 i1 = x0.x > x0.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
      + i.x
      + vec3(0.0, i1.x, 1.0)
    );
    vec3 m = max(
      0.5 - vec3(
        dot(x0, x0),
        dot(x12.xy, x12.xy),
        dot(x12.zw, x12.zw)
      ),
      0.0
    );
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

  vec3 displacedPosition(vec3 source, vec2 terrainUv) {
    vec2 slowDrift = vec2(uTime * 0.042, -uTime * 0.026) * uMotionScale;
    float broadTerrain = simplexNoise(source.xy * 0.105 + slowDrift);
    float terrainDetail = simplexNoise(source.xy * 0.29 - slowDrift * 1.3) * 0.32;
    float longRidge = simplexNoise(source.xy * vec2(0.052, 0.072) + vec2(-uTime * 0.018, uTime * 0.012));
    float focalRidge = exp(-pow((terrainUv.x - 0.72) * 3.2, 2.0))
      * exp(-pow((terrainUv.y - 0.54) * 2.2, 2.0))
      * 0.92;
    float pointerDistance = distance(source.xy, uPointer);
    float pointerLift = smoothstep(uPointerRadius, 0.0, pointerDistance)
      * uPointerStrength
      * 2.1;
    float proofRipple = sin(pointerDistance * 1.45 - uTime * 1.15)
      * smoothstep(uPointerRadius * 1.35, 0.0, pointerDistance)
      * uPointerStrength
      * 0.16;
    float proofPath = terrainUv.x * 0.76 + (1.0 - terrainUv.y) * 0.24;
    float proofDistance = proofPath - uProofProgress;
    float proofWave = exp(-pow(proofDistance * 18.0, 2.0))
      * smoothstep(0.0, 0.12, uProofProgress)
      * (1.0 - smoothstep(0.92, 1.12, uProofProgress));
    float proofLift = proofWave * (0.7 + sin(terrainUv.y * 20.0) * 0.12);
    float scrollFlatten = 1.0 - uScrollProgress * 0.18;

    vec3 transformed = source;
    transformed.z = (broadTerrain * 1.28
      + terrainDetail
      + longRidge * 0.38
      + focalRidge
      + pointerLift
      + proofRipple
      + proofLift) * scrollFlatten;
    vProof = proofWave;
    return transformed;
  }

  void main() {
    vec3 transformed = displacedPosition(position, uv);
    vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vDepth = clamp((-viewPosition.z - 4.0) / 30.0, 0.0, 1.0);
    vElevation = transformed.z;
    vShade = aShade;
    vVisible = step(aDensity, uPointDensity);
    vUv = uv;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = max(
      1.0,
      uPointScale * uPixelRatio * (14.0 / max(3.5, -viewPosition.z)) * vVisible
    );
  }
`

const pointFragmentShader = `
  uniform float uOpacity;
  varying float vDepth;
  varying float vElevation;
  varying float vProof;
  varying float vShade;
  varying float vVisible;
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
    float shade = clamp(vShade * elevationLight + vProof * 0.34, 0.2, 1.0);
    float alpha = pointEdge * horizonFog * edgeFadeX * edgeFadeY * uOpacity * (1.0 + vProof * 0.42);

    gl_FragColor = vec4(vec3(shade), alpha);
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
    shades[index] = 0.28 + deterministicValue(index, 47) * 0.5
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
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.1,
      100,
    )
    camera.position.set(...profile.camera)
    camera.lookAt(0, -0.8, 0)

    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearAlpha(0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.maxDpr))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const geometry = createTerrainGeometry(profile)
    const uniforms = {
      uOpacity: { value: profile.opacity },
      uMotionScale: { value: tier === 'low' ? 0.62 : tier === 'medium' ? 0.78 : 1 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, quality.maxDpr) },
      uPointDensity: { value: profile.density },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerRadius: { value: profile.pointerRadius },
      uPointerStrength: { value: 0 },
      uPointScale: { value: profile.pointScale },
      uProofProgress: { value: -1 },
      uScrollProgress: { value: 0 },
      uTime: { value: 0 },
    }
    const material = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
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
    let scrollFrame = null
    let scrollTarget = 0
    let targetStrength = 0
    let visible = true

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
      if (!visible || !pageVisible) return

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
      uniforms.uTime.value = time
      uniforms.uPointer.value.lerp(pointerTarget, 0.065)
      uniforms.uPointerStrength.value += (targetStrength - uniforms.uPointerStrength.value) * 0.055
      uniforms.uScrollProgress.value += (scrollTarget - uniforms.uScrollProgress.value) * 0.075

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

      if (tier === 'high' || tier === 'wide') {
        camera.position.x = profile.camera[0] + Math.sin(time * 0.08) * 0.78
        camera.position.y = profile.camera[1]
          + Math.cos(time * 0.065) * 0.13
          + uniforms.uScrollProgress.value * 0.18
        camera.position.z = profile.camera[2]
          + Math.sin(time * 0.045) * 0.12
          - uniforms.uScrollProgress.value * profile.camera[2] * 0.04
        camera.lookAt(0, -0.8, 0)
      }

      uniforms.uOpacity.value = profile.opacity * (1 - uniforms.uScrollProgress.value * 0.28)
      renderer.render(scene, camera)

      if (!readyReported) {
        readyReported = true
        onReady?.()
      }
    }

    const updateLoop = () => {
      renderer.setAnimationLoop(visible && pageVisible ? render : null)
      if (visible && pageVisible) render()
    }

    const handlePointerMove = (event) => {
      const bounds = container.getBoundingClientRect()
      const withinHero = event.clientX >= bounds.left
        && event.clientX <= bounds.right
        && event.clientY >= bounds.top
        && event.clientY <= bounds.bottom

      if (!withinHero) {
        targetStrength = 0
        return
      }

      const normalizedX = (event.clientX - bounds.left) / bounds.width
      const normalizedY = (event.clientY - bounds.top) / bounds.height
      pointerTarget.set(
        (normalizedX - 0.5) * profile.width * 0.72,
        (0.48 - normalizedY) * profile.height * 0.68,
      )
      targetStrength = 1
    }

    const updateScrollTarget = () => {
      scrollFrame = null
      const hero = container.closest('.hero')
      if (!hero) return
      const bounds = hero.getBoundingClientRect()
      scrollTarget = THREE.MathUtils.clamp(-bounds.top / Math.max(bounds.height * 0.85, 1), 0, 1)
    }

    const handleScroll = () => {
      if (scrollFrame !== null) return
      scrollFrame = window.requestAnimationFrame(updateScrollTarget)
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

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      updateLoop()
    }, { rootMargin: '120px 0px' })
    const resizeObserver = new ResizeObserver(resize)
    intersectionObserver.observe(container)
    resizeObserver.observe(container)
    document.addEventListener('visibilitychange', handleVisibility)
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost)
    if (quality.pointerEnabled) window.addEventListener('pointermove', handlePointerMove, { passive: true })
    if (quality.scrollEnabled) {
      window.addEventListener('scroll', handleScroll, { passive: true })
      updateScrollTarget()
    }

    updateLoop()

    return () => {
      renderer.setAnimationLoop(null)
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('scroll', handleScroll)
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame)
      if (triggerProofRef.current === triggerProof) triggerProofRef.current = null
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.isConnected) renderer.domElement.remove()
    }
  }, [onDegrade, onFailure, onReady, quality])

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
