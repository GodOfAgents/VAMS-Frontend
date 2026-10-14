import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import {
  createFrameBudgetController,
  getNextLowerHeroTier,
  getViewportHeroTier,
  HERO_QUALITY_ORDER,
} from '../../motion/heroQuality.js'
import { createPlanetaryConnections } from './PlanetaryConnections.js'
import earthView from '../../data/earth-view.json'
import { isLand, coastlineSegments } from '../../motion/earthGeography.js'
import { createGridEdges, sphereTarget } from '../../motion/globeMorph.js'
import { createTerrainPointerProjector } from '../../motion/neuralPointer.js'

const qualityProfiles = {
  low: {
    antialias: false, budgetMs: 30, camera: [0, 4.6, 12.8], density: 0.78,
    height: 22, opacity: 0.68, pointScale: 3.05, pointerRadius: 9.6,
    position: [0, -2.8, -1.4], rotation: -1.14, segments: [48, 32], width: 30,
  },
  medium: {
    antialias: false, budgetMs: 30, camera: [0, 5, 12.4], density: 0.86,
    height: 30, opacity: 0.6, pointScale: 2.65, pointerRadius: 7.2,
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
  uniform float uMorph;
  uniform float uGlobeScale;
  uniform vec4 uGlobeQuaternion;
  attribute float aLand;
  varying float vLand;
  attribute vec3 aTarget;
  #ifdef EDGE_PASS
    attribute vec3 aSourceTo;
    attribute vec3 aTargetTo;
    attribute vec2 aUvTo;
    attribute float aDensityTo;
    attribute float aEdgeT;
  #endif
  varying float vFront;
  varying float vMorph;
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

  vec3 rotateQuaternion(vec3 p, vec4 q) {
    return p + 2.0 * cross(q.xyz, cross(q.xyz, p) + q.w * p);
  }

  float proofAt(vec2 texcoord) {
    float distance = texcoord.x * 0.76 + (1.0 - texcoord.y) * 0.24 - uProofProgress;
    return exp(-pow(distance * 18.0, 2.0))
      * smoothstep(0.0, 0.12, uProofProgress)
      * (1.0 - smoothstep(0.92, 1.12, uProofProgress));
  }

  vec3 neuralAt(vec3 source, vec2 texcoord) {
    float time = uTime * uMotionScale;
    float elevation = mix(chapterElevation(uChapterFrom, source, texcoord, time),
      chapterElevation(uChapterTo, source, texcoord, time), smoothstep(0.0, 1.0, uChapterMix));
    float distance = length(source.xy - uPointer);
    float influence = 1.0 - smoothstep(0.0, uPointerRadius, distance);
    float lift = influence * uPointerStrength * 2.35;
    float ripple = sin(distance * 1.45 - uTime * 1.15)
      * (1.0 - smoothstep(0.0, uPointerRadius * 1.35, distance)) * uPointerStrength * 0.14;
    return vec3(source.xy, elevation + lift + ripple + proofAt(texcoord) * 0.7);
  }

  vec3 globeAt(vec3 target) {
    return rotateQuaternion(target * uGlobeScale, uGlobeQuaternion) + vec3(0.0, -0.8, 0.0);
  }

  vec3 morphAt(vec3 source, vec2 texcoord, vec3 target, float m) {
    vec3 original = (modelMatrix * vec4(neuralAt(source, texcoord), 1.0)).xyz;
    // This displacement depends on progress, so reversing the scroll retraces it.
    float envelope = 16.0 * uMorph * uMorph * (1.0-uMorph) * (1.0-uMorph);
    float phase = texcoord.x * 6.2831853 + uMorph * 3.14159265;
    vec3 swirl = vec3(sin(phase) * cos(texcoord.y * 5.0),
      sin(texcoord.y * 6.2831853 + uMorph * 4.0) * 0.45,
      cos(phase) * sin(texcoord.y * 3.14159265)) * 1.1;
    return mix(original, globeAt(target), m) + envelope * swirl;
  }

  vec3 arcAt(vec3 a, vec3 b, float t) {
    float cosine = clamp(dot(normalize(a), normalize(b)), -0.9999, 0.9999);
    float angle = acos(cosine);
    // All retained grid edges are local; the small-angle branch avoids 0/0.
    if (angle < 0.02) return normalize(mix(a, b, t)) * length(a);
    return (sin((1.0-t)*angle) * a + sin(t*angle) * b) / sin(angle);
  }

  void main() {
    float m = uMorph*uMorph*uMorph*(uMorph*(uMorph*6.0-15.0)+10.0);
    vec3 target = aTarget;
    vec3 world = morphAt(position, uv, aTarget, m);
    vec2 texcoord = uv;
    float density = aDensity;
    #ifdef EDGE_PASS
      vec3 end = morphAt(aSourceTo, aUvTo, aTargetTo, m);
      vec3 chord = mix(globeAt(aTarget), globeAt(aTargetTo), aEdgeT);
      vec3 arc = globeAt(arcAt(aTarget, aTargetTo, aEdgeT));
      world = mix(world, end, aEdgeT) + m * (arc - chord);
      target = arcAt(aTarget, aTargetTo, aEdgeT);
      texcoord = mix(uv, aUvTo, aEdgeT);
      density = max(aDensity, aDensityTo);
    #endif
    vec4 viewPosition = viewMatrix * vec4(world, 1.0);
    vec3 globePosition = globeAt(target);
    vec3 normal = normalize(globePosition - vec3(0.0,-0.8,0.0));
    float facing = dot(normal, normalize(cameraPosition-globePosition));
    vFront = mix(1.0, mix(0.015, 1.0, smoothstep(-0.04,0.18,facing)), m);
    vLand = aLand;
    vMorph = m;
    vDepth = clamp((-viewPosition.z - 4.0) / 30.0, 0.0, 1.0);
    vElevation = mix(neuralAt(position, uv).z, 0.4, m);
    vProof = proofAt(texcoord) * (1.0-m);
    vShade = aShade;
    vVisible = step(density, uPointDensity);
    vPointer = (1.0-smoothstep(0.0,uPointerRadius,length(position.xy-uPointer)))
      * uPointerStrength * (1.0-m);
    vUv = texcoord;
    gl_Position = projectionMatrix * viewPosition;
    gl_PointSize = clamp(uPointScale * uPixelRatio * (14.0 / max(3.5, -viewPosition.z))
      * (1.0 + vPointer * 0.85) * mix(1.0, mix(0.65, 1.15, aLand), m), 1.0, 12.0);
  }

`

const pointFragmentShader = `
  uniform float uOpacity;
  uniform float uThemeMix;
  uniform float uTime;
  varying float vDepth;
  varying float vElevation;
  varying float vProof;
  varying float vShade;
  varying float vVisible;
  varying float vPointer;
  varying vec2 vUv;
  varying float vFront;
  varying float vMorph;
  varying float vLand;

  void main() {
    if (vVisible < 0.5) discard;
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    if (distanceToCenter > 0.5) discard;
    float pointEdge = 1.0 - smoothstep(0.12, 0.5, distanceToCenter);
    float horizonFog = exp(-pow(vDepth * 1.62, 2.0));
    float edgeFadeX = smoothstep(0.0, 0.08, vUv.x) * smoothstep(0.0, 0.08, 1.0 - vUv.x);
    float edgeFadeY = smoothstep(0.0, 0.11, vUv.y) * smoothstep(0.0, 0.11, 1.0 - vUv.y);
    float elevationLight = clamp(0.72 + vElevation * 0.12, 0.42, 1.0);
    float elevatedNode = smoothstep(-0.12, 0.82, vElevation);
    float shimmer = 0.72 + 0.28 * sin(uTime * 5.2 + vUv.x * 14.0 + vUv.y * 9.0);
    // Light is emitted by the nodes that were lifted, not by a cursor sprite.
    float bioluminescence = clamp(elevatedNode * shimmer + vProof * 0.72
      + vPointer * (0.78 + shimmer * 0.34), 0.0, 1.0);
    bioluminescence *= mix(1.0, 0.45, vMorph);
    float shade = clamp(vShade * elevationLight + vProof * 0.34 + bioluminescence * 0.32, 0.18, 1.0);
    vec3 lightPoint = vec3(0.88) * shade;
    vec3 darkPoint = vec3(0.08 + (1.0 - shade) * 0.18);
    vec3 pointColor = mix(darkPoint, lightPoint, uThemeMix);
    vec3 neutralGlow = vec3(0.92) * (0.82 + uThemeMix * 0.18);
    pointColor = mix(pointColor, neutralGlow, min(1.0, bioluminescence * 1.12));
    pointColor += neutralGlow * bioluminescence * 0.62;
    float alpha = pointEdge * horizonFog * mix(edgeFadeX * edgeFadeY, 1.0, vMorph) * vFront * uOpacity
      * (1.0 + vProof * 0.42 + bioluminescence * 2.1);
    pointColor = mix(pointColor, vec3(0.94), vMorph * vLand * 0.72);
    alpha *= mix(1.0, mix(0.045, 1.25, vLand), vMorph);
    gl_FragColor = vec4(pointColor, alpha);
  }
`

const lineFragmentShader = `
  uniform float uLineOpacity;
  uniform float uThemeMix;
  varying float vDepth;
  varying float vElevation;
  varying float vProof;
  varying float vShade;
  varying float vPointer;
  varying float vVisible;
  varying float vFront;
  varying float vMorph;

  void main() {
    if (vVisible < 0.5) discard;
    float topography = smoothstep(-0.12, 0.82, vElevation);
    float fog = 1.0 - smoothstep(0.2, 1.0, vDepth);
    float signal = clamp(topography * 0.62 + vProof * 0.72 + vPointer * 0.58, 0.0, 1.0);
    vec3 quietLine = mix(vec3(0.12), vec3(0.62), uThemeMix);
    vec3 activeLine = vec3(0.9);
    vec3 lineColor = mix(quietLine, activeLine, signal * 0.78 + vShade * 0.08);
    float alpha = uLineOpacity * fog * vFront * (0.7 + signal * 0.92 + vMorph * 0.8) * mix(1.0, 0.16, vMorph);
    gl_FragColor = vec4(lineColor, alpha);
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

  const targets = new Float32Array(positions.count * 3)
  const landMask = new Float32Array(positions.count)
  for (let id = 0; id < positions.count; id += 1) {
    const target = sphereTarget(id, segmentsX + 1, segmentsY + 1)
    targets.set(target, id * 3)
    const longitude = Math.atan2(target[0], target[2]) * 180 / Math.PI
    const latitude = Math.asin(target[1] / 3.5) * 180 / Math.PI
    landMask[id] = isLand(longitude, latitude) ? 1 : 0
    // Edge anchors remain visible with their points during density degradation.
  }
  const step = segmentsX > 100 ? 4 : 3
  const edges = createGridEdges(segmentsX, segmentsY, step)
  for (const [from, to] of edges) {
    densities[from] = Math.min(densities[from], 0.3)
    densities[to] = Math.min(densities[to], 0.3)
  }
  geometry.setAttribute('aLand', new THREE.BufferAttribute(landMask, 1))
  geometry.setAttribute('aTarget', new THREE.BufferAttribute(targets, 3))
  const data = { position: [], uv: [], aTarget: [], aSourceTo: [], aTargetTo: [], aUvTo: [], aDensity: [], aDensityTo: [], aShade: [], aEdgeT: [] }
  const subdivisions = 12
  for (const [from, to] of edges) {
    for (let segment = 0; segment < subdivisions; segment += 1) {
      for (const t of [segment / subdivisions, (segment + 1) / subdivisions]) {
        data.position.push(positions.getX(from), positions.getY(from), positions.getZ(from))
        data.aSourceTo.push(positions.getX(to), positions.getY(to), positions.getZ(to))
        data.aTarget.push(...targets.subarray(from * 3, from * 3 + 3))
        data.aTargetTo.push(...targets.subarray(to * 3, to * 3 + 3))
        data.uv.push(geometry.attributes.uv.getX(from), geometry.attributes.uv.getY(from))
        data.aUvTo.push(geometry.attributes.uv.getX(to), geometry.attributes.uv.getY(to))
        data.aDensity.push(densities[from])
        data.aDensityTo.push(densities[to])
        data.aShade.push(shades[from])
        data.aEdgeT.push(t)
      }
    }
  }
  const lines = new THREE.BufferGeometry()
  for (const [key, values] of Object.entries(data)) {
    const size = ['position', 'aTarget', 'aSourceTo', 'aTargetTo'].includes(key) ? 3 : ['uv', 'aUvTo'].includes(key) ? 2 : 1
    lines.setAttribute(key, new THREE.Float32BufferAttribute(values, size))
  }
  lines.userData.edgeCount = edges.length
  geometry.userData.nodeCount = positions.count
  return { lines, points: geometry }
}

export default function NeuralField({
  onDegrade,
  onFailure,
  onReady,
  proofSignal = 0,
  quality,
  sceneStateRef,
  globeStateRef,
}) {
  const mountRef = useRef(null)
  const proofSignalRef = useRef(proofSignal)
  const triggerProofRef = useRef(null)
  const qualityRef = useRef(quality)

  useEffect(() => { qualityRef.current = quality }, [quality])

  useEffect(() => {
    proofSignalRef.current = proofSignal
    if (proofSignal > 0) triggerProofRef.current?.()
  }, [proofSignal])

  useEffect(() => {
    const container = mountRef.current
    const initialQuality = qualityRef.current
    const tier = initialQuality?.tier || 'high'
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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, qualityRef.current.maxDpr))
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.appendChild(renderer.domElement)

    const { lines: lineGeometry, points: pointGeometry } = createTerrainGeometry(profile)
    const initialSceneState = sceneStateRef.current
    let renderedChapterPosition = initialSceneState.renderedChapterPosition
      ?? initialSceneState.chapterPosition
      ?? initialSceneState.chapterFrom + initialSceneState.chapterMix
    const initialChapterFrom = Math.floor(renderedChapterPosition)
    const initialChapterTo = Math.min(initialChapterFrom + 1, 5)
    const uniforms = {
      uMorph: { value: initialSceneState.morphProgress || 0 },
      uGlobeScale: { value: 1 },
      uGlobeQuaternion: { value: new THREE.Vector4(0, 0, 0, 1) },
      uChapterFrom: { value: initialChapterFrom },
      uChapterMix: { value: renderedChapterPosition - initialChapterFrom },
      uChapterTo: { value: initialChapterTo },
      uLineOpacity: { value: profile.opacity * 0.16 },
      uMotionScale: { value: tier === 'low' ? 0.58 : tier === 'medium' ? 0.76 : 1 },
      uOpacity: { value: profile.opacity },
      uPageProgress: { value: initialSceneState.pageProgress },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, qualityRef.current.maxDpr) },
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
    const lineMaterial = new THREE.ShaderMaterial({
      defines: { EDGE_PASS: 1 },
      blending: THREE.NormalBlending,
      depthWrite: false,
      fragmentShader: lineFragmentShader,
      transparent: true,
      uniforms,
      vertexShader: terrainVertexShader,
    })
    const terrain = new THREE.Points(pointGeometry, material)
    const network = new THREE.LineSegments(lineGeometry, lineMaterial)
    // Shader positions span both the source terrain and a world-space sphere.
    terrain.frustumCulled = false
    network.frustumCulled = false
    terrain.position.set(...profile.position)
    terrain.rotation.x = profile.rotation
    network.position.copy(terrain.position)
    network.rotation.copy(terrain.rotation)
    terrain.renderOrder = 2
    network.renderOrder = 2
    scene.add(terrain)
    scene.add(network)

    const coastlineGeometry = new THREE.BufferGeometry()
    coastlineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(coastlineSegments(), 3))
    const coastlineMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: {
        uGlobeScale: uniforms.uGlobeScale,
        uGlobeQuaternion: uniforms.uGlobeQuaternion,
        uOpacity: { value: 0 },
      },
      vertexShader: `uniform float uGlobeScale; uniform vec4 uGlobeQuaternion; varying float vFacing;
        void main() {
          vec3 q = uGlobeQuaternion.xyz;
          vec3 p = position*uGlobeScale;
          vec3 rotated = p + 2.0*cross(q,cross(q,p)+uGlobeQuaternion.w*p);
          vec3 world = rotated+vec3(0.0,-0.8,0.0);
          vFacing=dot(normalize(rotated),normalize(cameraPosition-world));
          gl_Position=projectionMatrix*viewMatrix*vec4(world,1.0);
        }`,
      fragmentShader: `uniform float uOpacity; varying float vFacing;
        void main() { float front=smoothstep(0.0,0.16,vFacing);
          gl_FragColor=vec4(vec3(0.86),front*uOpacity); }`,
    })
    const coastlines = new THREE.LineSegments(coastlineGeometry, coastlineMaterial)
    coastlines.frustumCulled = false
    coastlines.renderOrder = 3
    scene.add(coastlines)

    const oceanGeometry = new THREE.SphereGeometry(3.485, 64, 40)
    const oceanMaterial = new THREE.MeshBasicMaterial({ color: 0x080808, transparent: true, opacity: 0, depthWrite: false })
    const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial)
    ocean.position.set(0,-0.8,0)
    ocean.renderOrder = 1
    scene.add(ocean)

    const atmosphereMaterial = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.BackSide,
      uniforms: { uMorph: uniforms.uMorph, uOpacity: { value: 0 } },
      vertexShader: `varying vec3 vNormal; varying vec3 vView;
        void main() { vec4 p=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vView=normalize(-p.xyz); gl_Position=projectionMatrix*p; }`,
      fragmentShader: `uniform float uOpacity; varying vec3 vNormal; varying vec3 vView;
        void main() { float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),3.5);
        gl_FragColor=vec4(vec3(0.88),rim*uOpacity); }`,
    })
    const atmosphereGeometry = new THREE.SphereGeometry(3.56, 64, 40)
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
    atmosphere.position.set(0,-0.8,0)
    atmosphere.frustumCulled = false
    scene.add(atmosphere)
    const planetaryConnections = createPlanetaryConnections(pointGeometry, profile.segments, uniforms)
    scene.add(planetaryConnections.group)
    container.dataset.networkHubs = String(planetaryConnections.group.userData.hubCount)
    container.dataset.networkRoutes = String(planetaryConnections.group.userData.routeCount)
    let renderedNetworkProgress = initialSceneState.networkProgress || 0
    const rotation = new THREE.Quaternion()
    const userRotation = new THREE.Quaternion()
    const identity = new THREE.Quaternion()
    const globeEuler = new THREE.Euler(0, 0, 0, 'YXZ')
    const homeRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(
      THREE.MathUtils.degToRad(earthView.latitude),
      -THREE.MathUtils.degToRad(earthView.longitude),
      0, 'XYZ',
    ))
    let idleRotation = 0
    let globeCompleteFor = 0
    let resetVersion = globeStateRef.current.resetVersion
    let elapsedTime = 0
    container.dataset.nodeCount = String(pointGeometry.userData.nodeCount)
    container.dataset.edgeCount = String(lineGeometry.userData.edgeCount)

    let frameBudget = createFrameBudgetController({ thresholdMs: profile.budgetMs })
    let budgetTier = tier
    const pointerTarget = new THREE.Vector2(0, 0)
    const projectPointer = createTerrainPointerProjector(camera, terrain)
    const minimumFrameInterval = 0
    let degradeRequested = false
    let lastAnimationAt = null
    let lastRenderAt = Number.NEGATIVE_INFINITY
    let previousRenderAt = null
    let pageVisible = document.visibilityState === 'visible'
    let proofPlayed = false
    let proofStartsAt = null
    let readyReported = false
    let targetStrength = 0
    let touchResetTimer = null

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
      if (budgetTier !== qualityRef.current.tier) {
        budgetTier = qualityRef.current.tier
        frameBudget = createFrameBudgetController({ thresholdMs: (qualityProfiles[budgetTier] || qualityProfiles.low).budgetMs })
        degradeRequested = false
        lastAnimationAt = null
      }
      if (lastAnimationAt !== null && !degradeRequested) {
        const frameInterval = animationTime - lastAnimationAt
        if (frameBudget.record(frameInterval, animationTime)) {
          degradeRequested = true
          onDegrade?.(getNextLowerHeroTier(qualityRef.current.tier))
        }
      }
      lastAnimationAt = animationTime
      if (animationTime - lastRenderAt < minimumFrameInterval - 0.5) return
      lastRenderAt = animationTime

      const sceneState = sceneStateRef.current
      const deltaSeconds = previousRenderAt === null
        ? 1 / 60
        : Math.min(0.1, Math.max(0, (animationTime - previousRenderAt) / 1000))
      previousRenderAt = animationTime
      const globeState = globeStateRef.current
      const morphTarget = sceneState.morphProgress || 0
      if (resetVersion !== globeState.resetVersion) {
        idleRotation = 0
        globeCompleteFor = 0
        resetVersion = globeState.resetVersion
      }
      if (!globeState.paused && !globeState.exploring) {
        elapsedTime += deltaSeconds
        // Reading the hero must not rotate the destination before it forms.
        globeCompleteFor = morphTarget >= 1 ? globeCompleteFor + deltaSeconds : 0
        if (globeCompleteFor > 6 && (sceneState.networkProgress || 0) > 0.98) idleRotation += deltaSeconds * 0.045
      }
      const time = elapsedTime
      // Pause freezes ambient time, never the scroll-controlled transformation.
      uniforms.uMorph.value += (morphTarget - uniforms.uMorph.value) * (1-Math.exp(-12*deltaSeconds))
      if (Math.abs(morphTarget-uniforms.uMorph.value) < 0.0001) uniforms.uMorph.value = morphTarget
      const morph = uniforms.uMorph.value
      const networkTarget = sceneState.networkProgress || 0
      renderedNetworkProgress += (networkTarget-renderedNetworkProgress)*(1-Math.exp(-8*deltaSeconds))
      if (Math.abs(networkTarget-renderedNetworkProgress)<0.0001) renderedNetworkProgress=networkTarget
      container.dataset.networkProgress = renderedNetworkProgress.toFixed(4)
      globeEuler.set(globeState.pitch, globeState.yaw + idleRotation, 0)
      userRotation.setFromEuler(globeEuler).multiply(homeRotation)
      rotation.copy(identity).slerp(userRotation, morph)
      uniforms.uGlobeQuaternion.value.set(rotation.x, rotation.y, rotation.z, rotation.w)
      uniforms.uGlobeScale.value += (globeState.zoom - uniforms.uGlobeScale.value) * (1-Math.exp(-10*deltaSeconds))
      atmosphere.scale.setScalar(uniforms.uGlobeScale.value)
      ocean.scale.setScalar(uniforms.uGlobeScale.value)
      coastlineMaterial.uniforms.uOpacity.value = THREE.MathUtils.smoothstep(morph, 0.6, 1) * 0.78
      oceanMaterial.opacity = THREE.MathUtils.smoothstep(morph, 0.65, 1) * 0.94
      atmosphereMaterial.uniforms.uOpacity.value = morph ** 3 * 0.19
      const activeQuality = qualityRef.current
      const desiredDpr = Math.min(window.devicePixelRatio, activeQuality.maxDpr)
      if (renderer.getPixelRatio() !== desiredDpr) renderer.setPixelRatio(desiredDpr)
      uniforms.uPixelRatio.value = renderer.getPixelRatio()
      const activeTier = activeQuality.tier
      const densityScale = { wide: 1, high: 0.94, medium: 0.82, low: 0.64 }
      uniforms.uPointDensity.value = densityScale[activeTier] || 0.64
      container.dataset.morphProgress = morph.toFixed(4)
      container.dataset.globeYaw = globeState.yaw.toFixed(4)
      container.dataset.globeZoom = globeState.zoom.toFixed(3)
      const chapterAlpha = 1 - Math.exp(-5 * deltaSeconds)
      const ambientAlpha = 1 - Math.exp(-4 * deltaSeconds)
      const targetChapterPosition = sceneState.chapterPosition
        ?? sceneState.chapterFrom + sceneState.chapterMix
      renderedChapterPosition += (targetChapterPosition - renderedChapterPosition) * chapterAlpha
      sceneState.renderedChapterPosition = renderedChapterPosition
      const chapterFrom = Math.floor(renderedChapterPosition)
      const chapterTo = Math.min(chapterFrom + 1, 5)
      uniforms.uTime.value = time
      uniforms.uChapterFrom.value = chapterFrom
      uniforms.uChapterTo.value = chapterTo
      uniforms.uChapterMix.value = renderedChapterPosition - chapterFrom
      uniforms.uPageProgress.value += (sceneState.pageProgress - uniforms.uPageProgress.value) * ambientAlpha
      uniforms.uThemeMix.value += (sceneState.themeMix - uniforms.uThemeMix.value) * chapterAlpha
      uniforms.uPointer.value.lerp(pointerTarget, ambientAlpha)
      uniforms.uPointerStrength.value += (targetStrength - uniforms.uPointerStrength.value) * ambientAlpha

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

      const scrollDrift = activeQuality.scrollEnabled ? uniforms.uPageProgress.value : 0
      const cameraMorph = morph*morph*(3-2*morph)
      const mobile = container.clientWidth < 768
      camera.position.x = (profile.camera[0] + Math.sin(time * 0.08) * 0.5) * (1-cameraMorph)
      camera.position.y = (profile.camera[1] + Math.cos(time * 0.065) * 0.12 + scrollDrift * 0.12) * (1-cameraMorph)
      // Fit the same sphere on narrow displays without clipping its silhouette.
      const globeDistance = mobile ? Math.max(10.5, 4.3 / Math.max(0.25,camera.aspect) / Math.tan(Math.PI/6)) : 10.6
      camera.position.z = THREE.MathUtils.lerp(profile.camera[2], globeDistance, cameraMorph)
      camera.lookAt(0, -0.8 + cameraMorph*0.5, 0)
      const footerFade = 1 - THREE.MathUtils.smoothstep(sceneState.pageProgress, 0.94, 1)
      uniforms.uOpacity.value = profile.opacity * footerFade
      uniforms.uLineOpacity.value = profile.opacity * THREE.MathUtils.lerp(0.16, 0.27, morph)
      atmosphereMaterial.uniforms.uOpacity.value *= footerFade
      coastlineMaterial.uniforms.uOpacity.value *= footerFade
      oceanMaterial.opacity *= footerFade
      planetaryConnections.update(renderedNetworkProgress, footerFade * morph ** 4 * 0.92)
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

    const clearPointer = () => {
      targetStrength = 0
      if (touchResetTimer !== null) window.clearTimeout(touchResetTimer)
      touchResetTimer = null
      uniforms.uPointerRadius.value = profile.pointerRadius
      const sceneElement = container.closest('.marketing-scene')
      sceneElement?.style.setProperty('--scene-pointer-opacity', '0')
      sceneElement?.style.setProperty('--scene-pointer-nx', '0')
      sceneElement?.style.setProperty('--scene-pointer-ny', '0')
    }

    const handlePointerMove = (event) => {
      if ((sceneStateRef.current.morphProgress || 0) > 0.8) return
      const sceneElement = container.closest('.marketing-scene')
      const bounds = sceneElement?.getBoundingClientRect()
      const withinScene = bounds && event.clientX >= bounds.left && event.clientX <= bounds.right
        && event.clientY >= bounds.top && event.clientY <= bounds.bottom
      if (!sceneElement || !withinScene) {
        clearPointer()
        return
      }
      if (!projectPointer(event.clientX, event.clientY, bounds, pointerTarget)) {
        clearPointer()
        return
      }
      uniforms.uPointerRadius.value = event.pointerType === 'touch'
        ? profile.pointerRadius * 1.9
        : profile.pointerRadius
      const normalizedX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2
      const normalizedY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2
      sceneElement?.style.setProperty('--scene-pointer-x', `${event.clientX}px`)
      sceneElement?.style.setProperty('--scene-pointer-y', `${event.clientY}px`)
      sceneElement?.style.setProperty('--scene-pointer-nx', normalizedX.toFixed(3))
      sceneElement?.style.setProperty('--scene-pointer-ny', normalizedY.toFixed(3))
      sceneElement?.style.setProperty('--scene-pointer-opacity', '1')
      // A finger covers more of the field than a cursor. Increase the lift so
      // the response remains legible on a small, high-density display.
      targetStrength = event.pointerType === 'touch' ? 1.28 : 1
    }

    const handlePointerDown = (event) => {
      handlePointerMove(event)
      targetStrength = event.pointerType === 'touch' ? 1.28 : 1
    }

    const handlePointerEnd = (event) => {
      if (event?.pointerType === 'touch') return
      targetStrength = 0
    }

    const handleTouchStart = (event) => {
      const point = event.touches?.[0]
      if (!point) return
      handlePointerDown({ clientX: point.clientX, clientY: point.clientY, pointerType: 'touch' })
    }

    const handleTouchMove = (event) => {
      const point = event.touches?.[0]
      if (!point) return
      handlePointerMove({ clientX: point.clientX, clientY: point.clientY, pointerType: 'touch' })
    }

    const handleTouchEnd = () => {
      if (touchResetTimer !== null) window.clearTimeout(touchResetTimer)
      // Let a tap remain visible briefly after the finger leaves the glass.
      touchResetTimer = window.setTimeout(() => {
        clearPointer()
      }, 720)
    }

    const handlePointerOut = (event) => {
      if (event.pointerType === 'touch') return
      if (!event.relatedTarget) clearPointer()
    }

    const handleVisibility = () => {
      pageVisible = document.visibilityState === 'visible'
      lastAnimationAt = null
      previousRenderAt = null
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
      }
      camera.aspect = container.clientWidth / container.clientHeight
      camera.updateProjectionMatrix()
      const pixelRatio = Math.min(window.devicePixelRatio, qualityRef.current.maxDpr)
      renderer.setPixelRatio(pixelRatio)
      uniforms.uPixelRatio.value = pixelRatio
      renderer.setSize(container.clientWidth, container.clientHeight)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(container)
    document.addEventListener('visibilitychange', handleVisibility)
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost)
    if (qualityRef.current.pointerEnabled) window.addEventListener('pointermove', handlePointerMove, { passive: true })
    if (qualityRef.current.pointerEnabled) window.addEventListener('pointerdown', handlePointerDown, { passive: true })
    if (qualityRef.current.pointerEnabled) window.addEventListener('pointerup', handlePointerEnd, { passive: true })
    if (qualityRef.current.pointerEnabled) window.addEventListener('pointercancel', handlePointerEnd, { passive: true })
    if (qualityRef.current.pointerEnabled) window.addEventListener('pointerout', handlePointerOut, { passive: true })
    if (qualityRef.current.pointerEnabled) window.addEventListener('touchstart', handleTouchStart, { passive: true })
    if (qualityRef.current.pointerEnabled) window.addEventListener('touchmove', handleTouchMove, { passive: true })
    if (qualityRef.current.pointerEnabled) window.addEventListener('touchend', handleTouchEnd, { passive: true })
    updateLoop()

    return () => {
      renderer.setAnimationLoop(null)
      resizeObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibility)
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerEnd)
      window.removeEventListener('pointercancel', handlePointerEnd)
      window.removeEventListener('pointerout', handlePointerOut)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      if (triggerProofRef.current === triggerProof) triggerProofRef.current = null
      if (touchResetTimer !== null) window.clearTimeout(touchResetTimer)
      planetaryConnections.dispose()
      coastlineGeometry.dispose()
      coastlineMaterial.dispose()
      oceanGeometry.dispose()
      oceanMaterial.dispose()
      atmosphereGeometry.dispose()
      atmosphereMaterial.dispose()
      lineGeometry.dispose()
      pointGeometry.dispose()
      lineMaterial.dispose()
      material.dispose()
      renderer.dispose()
      renderer.forceContextLoss()
      if (renderer.domElement.isConnected) renderer.domElement.remove()
    }
  }, [onDegrade, onFailure, onReady, sceneStateRef, globeStateRef])

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
