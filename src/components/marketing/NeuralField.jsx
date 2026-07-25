import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const qualityProfiles = {
  mobile: {
    camera: [0.2, 2.1, 8.8],
    dpr: 1.25,
    height: 9,
    opacity: 0.58,
    pointScale: 2.8,
    position: [1.3, -2.2, -0.5],
    rotation: -1.02,
    segments: [42, 28],
    width: 14,
  },
  tablet: {
    camera: [0.8, 2.8, 9.5],
    dpr: 1.25,
    height: 12,
    opacity: 0.56,
    pointScale: 2.6,
    position: [2.8, -2.2, -0.8],
    rotation: -1.06,
    segments: [72, 48],
    width: 19,
  },
  desktop: {
    camera: [1.2, 3.2, 10.2],
    dpr: 1.5,
    height: 14,
    opacity: 0.62,
    pointScale: 2.45,
    position: [3.5, -2.1, -1],
    rotation: -1.08,
    segments: [96, 64],
    width: 22,
  },
  wide: {
    camera: [1.6, 3.4, 10.8],
    dpr: 1.5,
    height: 15,
    opacity: 0.66,
    pointScale: 2.35,
    position: [4.2, -2, -1],
    rotation: -1.08,
    segments: [112, 72],
    width: 24,
  },
}

const terrainVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPointScale;
  uniform float uPointerStrength;
  uniform vec2 uPointer;
  varying float vElevation;
  varying float vDepth;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  vec3 displacedPosition(vec3 source) {
    float broadNoise = noise(source.xy * 0.34 + vec2(uTime * 0.025, -uTime * 0.018));
    float detailNoise = noise(source.xy * 0.82 + vec2(-uTime * 0.02, uTime * 0.016));
    float ridge = sin(source.x * 0.52 + uTime * 0.12) * 0.22;
    ridge += cos(source.y * 0.66 - uTime * 0.09) * 0.18;
    float pointerDistance = distance(source.xy, uPointer);
    float proofWave = exp(-pointerDistance * 0.5)
      * sin(pointerDistance * 2.3 - uTime * 1.35)
      * uPointerStrength
      * 0.82;

    vec3 transformed = source;
    transformed.z = (broadNoise - 0.42) * 1.55
      + (detailNoise - 0.5) * 0.55
      + ridge
      + proofWave;
    return transformed;
  }

  void main() {
    vec3 transformed = displacedPosition(position);
    vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vElevation = transformed.z;
    vDepth = clamp((-viewPosition.z - 3.0) / 15.0, 0.0, 1.0);
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = max(1.15, uPointScale * uPixelRatio * (10.0 / max(2.0, -viewPosition.z)));
  }
`

const pointFragmentShader = `
  uniform float uOpacity;
  varying float vElevation;
  varying float vDepth;

  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    float edge = 1.0 - smoothstep(0.18, 0.5, distanceToCenter);
    float elevationGlow = clamp(0.62 + vElevation * 0.18, 0.38, 1.0);
    float fog = 1.0 - smoothstep(0.35, 1.0, vDepth);
    gl_FragColor = vec4(vec3(0.86), edge * elevationGlow * fog * uOpacity);
  }
`

const lineFragmentShader = `
  uniform float uLineOpacity;
  varying float vDepth;

  void main() {
    float fog = 1.0 - smoothstep(0.2, 1.0, vDepth);
    gl_FragColor = vec4(vec3(0.72), uLineOpacity * fog);
  }
`

function deterministicJitter(index) {
  const value = Math.sin(index * 91.719 + 17.13) * 43758.5453
  return value - Math.floor(value)
}

function createTopologyGeometry(profile) {
  const [segmentsX, segmentsY] = profile.segments
  const points = new THREE.PlaneGeometry(profile.width, profile.height, segmentsX, segmentsY)
  const positions = points.attributes.position

  for (let index = 0; index < positions.count; index += 1) {
    const jitterX = (deterministicJitter(index) - 0.5) * 0.12
    const jitterY = (deterministicJitter(index + 411) - 0.5) * 0.12
    positions.setX(index, positions.getX(index) + jitterX)
    positions.setY(index, positions.getY(index) + jitterY)
  }
  positions.needsUpdate = true

  const linePositions = []
  const rowSize = segmentsX + 1
  const step = profile.segments[0] > 80 ? 4 : 3
  const appendConnection = (from, to) => {
    linePositions.push(
      positions.getX(from), positions.getY(from), positions.getZ(from),
      positions.getX(to), positions.getY(to), positions.getZ(to),
    )
  }

  for (let y = 0; y <= segmentsY; y += step) {
    for (let x = 0; x <= segmentsX; x += step) {
      const index = y * rowSize + x
      if (x + step <= segmentsX) appendConnection(index, index + step)
      if (y + step <= segmentsY) appendConnection(index, index + step * rowSize)
    }
  }

  const lines = new THREE.BufferGeometry()
  lines.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
  return { lines, points }
}

export default function NeuralField({ onFailure, quality = 'desktop' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    const profile = qualityProfiles[quality] || qualityProfiles.desktop
    if (!container) return undefined

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    } catch {
      onFailure?.()
      return undefined
    }

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(52, container.clientWidth / container.clientHeight, 0.1, 100)
    camera.position.set(...profile.camera)
    camera.lookAt(1.8, -0.8, 0)

    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearAlpha(0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.dpr))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const { lines: lineGeometry, points: pointGeometry } = createTopologyGeometry(profile)
    const uniforms = {
      uLineOpacity: { value: profile.opacity * 0.12 },
      uOpacity: { value: profile.opacity },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, profile.dpr) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerStrength: { value: 0 },
      uPointScale: { value: profile.pointScale },
      uTime: { value: 0 },
    }

    const pointMaterial = new THREE.ShaderMaterial({
      depthWrite: false,
      fragmentShader: pointFragmentShader,
      transparent: true,
      uniforms,
      vertexShader: terrainVertexShader,
    })
    const lineMaterial = new THREE.ShaderMaterial({
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fragmentShader: lineFragmentShader,
      transparent: true,
      uniforms,
      vertexShader: terrainVertexShader,
    })

    const group = new THREE.Group()
    const points = new THREE.Points(pointGeometry, pointMaterial)
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial)
    group.add(lines, points)
    group.position.set(...profile.position)
    group.rotation.x = profile.rotation
    scene.add(group)

    const clock = new THREE.Clock()
    const pointerTarget = new THREE.Vector2(0, 0)
    let targetStrength = 0
    let visible = true
    let pageVisible = document.visibilityState === 'visible'

    const render = () => {
      if (!visible || !pageVisible) return
      const time = clock.getElapsedTime()
      uniforms.uTime.value = time
      uniforms.uPointer.value.lerp(pointerTarget, 0.075)
      uniforms.uPointerStrength.value += (targetStrength - uniforms.uPointerStrength.value) * 0.06

      if (quality === 'desktop' || quality === 'wide') {
        camera.position.x = profile.camera[0] + Math.sin(time * 0.085) * 0.22
        camera.position.y = profile.camera[1] + Math.cos(time * 0.07) * 0.08
        camera.lookAt(1.8, -0.8, 0)
      }

      renderer.render(scene, camera)
    }

    const updateLoop = () => {
      renderer.setAnimationLoop(visible && pageVisible ? render : null)
      if (visible && pageVisible) render()
    }

    const handlePointerMove = (event) => {
      const bounds = container.getBoundingClientRect()
      const normalizedX = (event.clientX - bounds.left) / bounds.width
      const normalizedY = (event.clientY - bounds.top) / bounds.height
      pointerTarget.set((normalizedX - 0.5) * profile.width, (0.5 - normalizedY) * profile.height)
      targetStrength = 1
    }

    const handlePointerLeave = () => {
      pointerTarget.set(profile.width * 0.16, -profile.height * 0.08)
      targetStrength = 0.22
    }

    const handleVisibility = () => {
      pageVisible = document.visibilityState === 'visible'
      updateLoop()
    }

    const resize = () => {
      if (!container.clientWidth || !container.clientHeight) return
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      const pixelRatio = Math.min(window.devicePixelRatio, profile.dpr)
      renderer.setPixelRatio(pixelRatio)
      uniforms.uPixelRatio.value = pixelRatio
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      updateLoop()
    }, { rootMargin: '120px 0px' })
    const resizeObserver = new ResizeObserver(resize)
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

    intersectionObserver.observe(container)
    resizeObserver.observe(container)
    document.addEventListener('visibilitychange', handleVisibility)
    if (finePointer) {
      container.addEventListener('pointermove', handlePointerMove, { passive: true })
      container.addEventListener('pointerleave', handlePointerLeave)
    }

    handlePointerLeave()
    updateLoop()

    return () => {
      renderer.setAnimationLoop(null)
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerleave', handlePointerLeave)
      lineGeometry.dispose()
      pointGeometry.dispose()
      lineMaterial.dispose()
      pointMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [onFailure, quality])

  return <div className="neural-field neural-field--canvas" ref={mountRef} aria-hidden="true" data-marketing-three="true" />
}
