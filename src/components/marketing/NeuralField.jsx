import { useEffect, useRef } from 'react'
import * as THREE from 'three'

const qualityProfiles = {
  mobile: {
    camera: [0, 4.6, 12.8],
    dpr: 1.25,
    height: 18,
    opacity: 0.58,
    pointScale: 2.6,
    pointerRadius: 4.2,
    position: [0, -3.2, -1.4],
    rotation: -1.14,
    segments: [56, 40],
    width: 24,
  },
  tablet: {
    camera: [0, 5, 12.4],
    dpr: 1.25,
    height: 26,
    opacity: 0.58,
    pointScale: 2.45,
    pointerRadius: 5.4,
    position: [0, -2.4, -1.1],
    rotation: -1.2,
    segments: [88, 64],
    width: 38,
  },
  desktop: {
    camera: [0, 5.2, 12.4],
    dpr: 1.5,
    height: 36,
    opacity: 0.64,
    pointScale: 2.3,
    pointerRadius: 6.8,
    position: [0, -1.7, -0.9],
    rotation: -Math.PI / 2.5,
    segments: [128, 88],
    width: 58,
  },
  wide: {
    camera: [0, 5.6, 13.2],
    dpr: 1.5,
    height: 42,
    opacity: 0.66,
    pointScale: 2.2,
    pointerRadius: 7.4,
    position: [0, -1.4, -0.8],
    rotation: -Math.PI / 2.5,
    segments: [144, 96],
    width: 68,
  },
}

const terrainVertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPointScale;
  uniform float uPointerRadius;
  uniform float uPointerStrength;
  uniform vec2 uPointer;
  attribute float aShade;
  varying float vDepth;
  varying float vElevation;
  varying float vShade;
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

  vec3 displacedPosition(vec3 source) {
    vec2 slowDrift = vec2(uTime * 0.042, -uTime * 0.026);
    float broadTerrain = simplexNoise(source.xy * 0.105 + slowDrift);
    float terrainDetail = simplexNoise(source.xy * 0.29 - slowDrift * 1.3) * 0.32;
    float longRidge = simplexNoise(source.xy * vec2(0.052, 0.072) + vec2(-uTime * 0.018, uTime * 0.012));
    float pointerDistance = distance(source.xy, uPointer);
    float pointerLift = smoothstep(uPointerRadius, 0.0, pointerDistance)
      * uPointerStrength
      * 2.1;
    float proofRipple = sin(pointerDistance * 1.45 - uTime * 1.15)
      * smoothstep(uPointerRadius * 1.35, 0.0, pointerDistance)
      * uPointerStrength
      * 0.16;

    vec3 transformed = source;
    transformed.z = broadTerrain * 1.28
      + terrainDetail
      + longRidge * 0.38
      + pointerLift
      + proofRipple;
    return transformed;
  }

  void main() {
    vec3 transformed = displacedPosition(position);
    vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vDepth = clamp((-viewPosition.z - 4.0) / 30.0, 0.0, 1.0);
    vElevation = transformed.z;
    vShade = aShade;
    vUv = uv;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = max(
      1.0,
      uPointScale * uPixelRatio * (14.0 / max(3.5, -viewPosition.z))
    );
  }
`

const pointFragmentShader = `
  uniform float uOpacity;
  varying float vDepth;
  varying float vElevation;
  varying float vShade;
  varying vec2 vUv;

  void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    if (distanceToCenter > 0.5) discard;

    float pointEdge = 1.0 - smoothstep(0.12, 0.5, distanceToCenter);
    float horizonFog = exp(-pow(vDepth * 1.62, 2.0));
    float edgeFadeX = smoothstep(0.0, 0.08, vUv.x) * smoothstep(0.0, 0.08, 1.0 - vUv.x);
    float edgeFadeY = smoothstep(0.0, 0.11, vUv.y) * smoothstep(0.0, 0.11, 1.0 - vUv.y);
    float elevationLight = clamp(0.72 + vElevation * 0.12, 0.42, 1.0);
    float shade = clamp(vShade * elevationLight, 0.2, 0.88);
    float alpha = pointEdge * horizonFog * edgeFadeX * edgeFadeY * uOpacity;

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
  const shades = new Float32Array(positions.count)

  for (let index = 0; index < positions.count; index += 1) {
    positions.setX(index, positions.getX(index) + (deterministicValue(index) - 0.5) * 0.08)
    positions.setY(index, positions.getY(index) + (deterministicValue(index, 23) - 0.5) * 0.08)
    shades[index] = 0.28 + deterministicValue(index, 47) * 0.5
  }

  positions.needsUpdate = true
  geometry.setAttribute('aShade', new THREE.BufferAttribute(shades, 1))
  return geometry
}

export default function NeuralField({ onFailure, quality = 'desktop' }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const container = mountRef.current
    const profile = qualityProfiles[quality] || qualityProfiles.desktop
    if (!container) return undefined

    let renderer
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, profile.dpr))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const geometry = createTerrainGeometry(profile)
    const uniforms = {
      uOpacity: { value: profile.opacity },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, profile.dpr) },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerRadius: { value: profile.pointerRadius },
      uPointerStrength: { value: 0 },
      uPointScale: { value: profile.pointScale },
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
    const pointerTarget = new THREE.Vector2(0, 0)
    let pageVisible = document.visibilityState === 'visible'
    let targetStrength = 0.16
    let visible = true

    const render = () => {
      if (!visible || !pageVisible) return
      const time = clock.getElapsedTime()
      uniforms.uTime.value = time
      uniforms.uPointer.value.lerp(pointerTarget, 0.065)
      uniforms.uPointerStrength.value += (targetStrength - uniforms.uPointerStrength.value) * 0.055

      if (quality === 'desktop' || quality === 'wide') {
        camera.position.x = profile.camera[0] + Math.sin(time * 0.08) * 0.78
        camera.position.y = profile.camera[1] + Math.cos(time * 0.065) * 0.13
        camera.position.z = profile.camera[2] + Math.sin(time * 0.045) * 0.12
        camera.lookAt(0, -0.8, 0)
      }

      renderer.render(scene, camera)
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
        targetStrength = 0.16
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
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost)
    if (finePointer) window.addEventListener('pointermove', handlePointerMove, { passive: true })

    updateLoop()

    return () => {
      renderer.setAnimationLoop(null)
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost)
      window.removeEventListener('pointermove', handlePointerMove)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      renderer.domElement.remove()
    }
  }, [onFailure, quality])

  return (
    <div
      className="neural-field neural-field--canvas"
      ref={mountRef}
      aria-hidden="true"
      data-marketing-three="true"
      data-neural-quality={quality}
    />
  )
}
