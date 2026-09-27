import { useEffect, useRef, useState } from 'react'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'
import { StaggerGroup, StaggerItem } from '../../motion/primitives.jsx'

const CENTER = 260

function polar(radius, degrees) {
  const radians = ((degrees - 90) * Math.PI) / 180
  return [CENTER + radius * Math.cos(radians), CENTER + radius * Math.sin(radians)]
}

function arcPath(radius, fromDegrees, toDegrees) {
  const [x1, y1] = polar(radius, fromDegrees)
  const [x2, y2] = polar(radius, toDegrees)
  const large = toDegrees - fromDegrees > 180 ? 1 : 0
  return `M${x1.toFixed(1)} ${y1.toFixed(1)}A${radius} ${radius} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}

const reasoningNodes = [20, 88, 150, 212, 290].map((angle) => polar(92, angle))
const reasoningEdges = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3]]
const blockAngles = Array.from({ length: 10 }, (_, index) => index * 36 + 8)
const checkpointAngles = Array.from({ length: 24 }, (_, index) => index * 15)
const providerAngles = [0, 60, 120, 180, 240, 300].map((angle) => angle + 24)

/**
 * Decorative orbital diagram: one ring per architecture boundary. The ring that
 * matches the active list entry is lit. The drawing carries no text or data.
 */
function OrbitDiagram({ active }) {
  const ring = (index) => `orbit__ring${active === index ? ' is-active' : ''}`

  return (
    <svg className="orbit" viewBox="0 0 520 520" fill="none" aria-hidden="true" focusable="false" data-active={active}>
      <defs>
        <radialGradient id="orbit-core-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.55" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Sentinel: independent observer on an outer orbit */}
      <g className={ring(3)} data-ring="sentinel">
        <circle className="orbit__track orbit__track--dashed" cx={CENTER} cy={CENTER} r="252" />
        <g className="orbit__satellite">
          <path className="orbit__beam" d={`M${CENTER} ${CENTER - 252}L${CENTER - 34} ${CENTER - 196}L${CENTER + 34} ${CENTER - 196}Z`} />
          <circle className="orbit__satellite-body" cx={CENTER} cy={CENTER - 252} r="7" />
        </g>
      </g>

      {/* Portable infrastructure: providers on the outer ring */}
      <g className={ring(5)} data-ring="portable">
        <circle className="orbit__track" cx={CENTER} cy={CENTER} r="222" />
        {providerAngles.map((angle) => {
          const [x, y] = polar(222, angle)
          return <rect className="orbit__mark orbit__provider" height="18" key={angle} rx="5" width="18" x={x - 9} y={y - 9} />
        })}
      </g>

      {/* Durable runtime: checkpoints and recorded progress */}
      <g className={ring(4)} data-ring="runtime">
        <circle className="orbit__track" cx={CENTER} cy={CENTER} r="178" />
        {checkpointAngles.map((angle) => {
          const [x1, y1] = polar(172, angle)
          const [x2, y2] = polar(184, angle)
          return <path className="orbit__tick" d={`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`} key={angle} />
        })}
        <path className="orbit__progress" d={arcPath(178, -120, 105)} />
      </g>

      {/* Service Blocks: replaceable capabilities */}
      <g className={ring(2)} data-ring="blocks">
        <circle className="orbit__track" cx={CENTER} cy={CENTER} r="134" />
        {blockAngles.map((angle, index) => {
          const [x, y] = polar(134, angle)
          return <rect className={`orbit__mark orbit__block${index === 3 ? ' orbit__block--swap' : ''}`} height="14" key={angle} rx="3.5" transform={`rotate(${angle} ${x.toFixed(1)} ${y.toFixed(1)})`} width="14" x={x - 7} y={y - 7} />
        })}
      </g>

      {/* Brain: reasoning graph within permitted bounds */}
      <g className={ring(1)} data-ring="brain">
        <circle className="orbit__track orbit__track--dashed" cx={CENTER} cy={CENTER} r="92" />
        {reasoningEdges.map(([from, to]) => (
          <path className="orbit__edge" d={`M${reasoningNodes[from][0].toFixed(1)} ${reasoningNodes[from][1].toFixed(1)}L${reasoningNodes[to][0].toFixed(1)} ${reasoningNodes[to][1].toFixed(1)}`} key={`${from}-${to}`} />
        ))}
        {reasoningNodes.map(([x, y]) => <circle className="orbit__node" cx={x} cy={y} key={`${x}-${y}`} r="5" />)}
      </g>

      {/* Heart: the authority boundary at the core */}
      <g className={ring(0)} data-ring="heart">
        <circle className="orbit__core-glow" cx={CENTER} cy={CENTER} r="58" fill="url(#orbit-core-glow)" />
        <circle className="orbit__track orbit__track--strong" cx={CENTER} cy={CENTER} r="44" />
        <circle className="orbit__track" cx={CENTER} cy={CENTER} r="36" />
        <circle className="orbit__core" cx={CENTER} cy={CENTER} r="7" />
      </g>
    </svg>
  )
}

export function ArchitectureOrbit({ items }) {
  const listRef = useRef(null)
  const { reducedMotion } = useResponsiveMotion()
  const [active, setActive] = useState(0)

  useEffect(() => {
    const list = listRef.current
    if (!list || typeof IntersectionObserver === 'undefined') return undefined
    const rows = [...list.querySelectorAll('[data-orbit-index]')]
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(Number(entry.target.dataset.orbitIndex))
      }
    }, { rootMargin: '-42% 0px -52% 0px' })
    rows.forEach((row) => observer.observe(row))
    return () => observer.disconnect()
  }, [])

  return (
    <div className={`architecture${reducedMotion ? '' : ' architecture--animated'}`}>
      <div className="architecture__visual">
        <OrbitDiagram active={active} />
      </div>
      <div ref={listRef}>
        <StaggerGroup as="ol" className="architecture__list">
          {items.map(([Icon, title, detail], index) => (
            <StaggerItem
              as="li"
              className={`architecture__item${index === active ? ' is-active' : ''}`}
              data-orbit-index={index}
              key={title}
              onFocus={() => setActive(index)}
              onPointerEnter={() => setActive(index)}
            >
              <span className="architecture__icon"><Icon aria-hidden="true" /></span>
              <div>
                <h3>{title}</h3>
                <p>{detail}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </div>
  )
}
