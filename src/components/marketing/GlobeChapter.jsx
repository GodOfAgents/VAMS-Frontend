import { useRef, useState } from 'react'
import { Minus, Pause, Play, Plus, RotateCcw, Move, X } from 'lucide-react'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'
import { clampGlobeZoom } from '../../motion/globeMorph.js'

export function GlobeChapter({ globeStateRef, rendererState }) {
  const { coarsePointer, reducedMotion } = useResponsiveMotion()
  const [paused, setPaused] = useState(false)
  const [exploring, setExploring] = useState(false)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef(null)
  const interactive = rendererState === 'ready' && !reducedMotion

  const finishDrag = (event) => {
    if (event && dragRef.current?.id !== event.pointerId) return
    dragRef.current = null
    setDragging(false)
    globeStateRef.current.exploring = exploring
  }
  const toggleExplore = () => {
    const next = !exploring
    setExploring(next)
    globeStateRef.current.exploring = next
    dragRef.current = null
    setDragging(false)
  }
  const rotate = (yaw, pitch = 0) => {
    const state = globeStateRef.current
    state.yaw += yaw
    state.pitch = Math.max(-1.2, Math.min(1.2, state.pitch + pitch))
  }
  const zoom = (amount) => { globeStateRef.current.zoom = clampGlobeZoom(globeStateRef.current.zoom + amount) }
  const reset = () => {
    Object.assign(globeStateRef.current, { yaw: 0, pitch: 0, zoom: 1, resetVersion: globeStateRef.current.resetVersion + 1 })
  }
  const handleKey = (event) => {
    if (!interactive) return
    const actions = {
      ArrowLeft: () => rotate(-0.16), ArrowRight: () => rotate(0.16),
      ArrowUp: () => rotate(0, -0.12), ArrowDown: () => rotate(0, 0.12),
      '+': () => zoom(0.08), '=': () => zoom(0.08), '-': () => zoom(-0.08), '0': reset,
      Escape: () => { finishDrag(); if (exploring) toggleExplore() },
    }
    if (actions[event.key]) { event.preventDefault(); actions[event.key]() }
  }

  return (
    <section className={`planetary-chapter${reducedMotion || rendererState === 'fallback' ? ' planetary-chapter--static' : ''}`} data-globe-chapter aria-labelledby="planetary-heading">
      <div className="planetary-chapter__stage">
      <div className="planetary-chapter__heading">
        <p className="eyebrow">Distributed intelligence. Planetary scale.</p>
        <h2 id="planetary-heading">One network.<br /><em>Boundless possibility.</em></h2>
      </div>
      {interactive && <div className="network-evolution" aria-label="Illustrative network evolution">
        <span className="network-evolution__kicker">NETWORK EVOLUTION</span>
        <ol>
          <li data-network-step="local"><span>01</span> Local activation</li>
          <li data-network-step="regional"><span>02</span> Regional connections</li>
          <li data-network-step="planetary"><span>03</span> Planetary mesh</li>
        </ol>
        <span className="network-evolution__track"><i /></span>
      </div>}
      <div
        className={`globe-interaction${exploring ? ' globe-interaction--exploring' : ''}${dragging ? ' globe-interaction--dragging' : ''}`}
        role="group"
        aria-label="Rotate the illustrative planetary network"
        aria-describedby="globe-instructions"
        tabIndex={interactive ? 0 : -1}
        data-globe-interaction
        data-exploring={exploring}
        onKeyDown={handleKey}
        onPointerDown={(event) => {
          if (!interactive || (event.pointerType !== 'mouse' && !exploring)) return
          event.currentTarget.setPointerCapture(event.pointerId)
          dragRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
          globeStateRef.current.exploring = true
          setDragging(true)
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current
          if (!drag || drag.id !== event.pointerId) return
          rotate((event.clientX - drag.x) * 0.006, (event.clientY - drag.y) * 0.005)
          drag.x = event.clientX
          drag.y = event.clientY
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
        onBlur={() => finishDrag()}
      >
        {!interactive && <div className="globe-static-orb" aria-hidden="true"><img src="/earth-monochrome.svg" alt="" width="360" height="360" /></div>}
      </div>
      <div className="planetary-chapter__footer">
        {interactive && <p className="network-evolution__status" data-network-status>Scroll to grow the network</p>}
        <p className="globe-caption"><span aria-hidden="true" /> Illustrative planetary network</p>
        {interactive && <>
          <div className="globe-controls" role="group" aria-label="Globe controls">
            {coarsePointer && <button type="button" className="globe-controls__explore" aria-pressed={exploring} onClick={toggleExplore}>{exploring ? <X size={15} /> : <Move size={15} />}{exploring ? 'Done' : 'Explore globe'}</button>}
            <button type="button" aria-label="Rotate globe left" onClick={() => rotate(-0.2)}>←</button>
            <button type="button" aria-label="Rotate globe right" onClick={() => rotate(0.2)}>→</button>
            <span className="globe-controls__separator" />
            <button type="button" aria-label="Zoom out" onClick={() => zoom(-0.08)}><Minus size={15} /></button>
            <button type="button" aria-label="Zoom in" onClick={() => zoom(0.08)}><Plus size={15} /></button>
            <span className="globe-controls__separator" />
            <button type="button" aria-label={paused ? 'Resume globe motion' : 'Pause globe motion'} aria-pressed={paused} onClick={() => { const next = !paused; setPaused(next); globeStateRef.current.paused = next }}>{paused ? <Play size={14} /> : <Pause size={14} />}</button>
            <button type="button" aria-label="Reset globe view" onClick={reset}><RotateCcw size={14} /></button>
          </div>
          <p id="globe-instructions" className="globe-instructions">{coarsePointer ? 'Explore to rotate · Scroll to connect the globe' : 'Scroll to connect · Drag to rotate · Scroll up to reverse'}</p>
        </>}
        {!interactive && <p id="globe-instructions" className="globe-instructions">A modular network, represented at planetary scale.</p>}
      </div>
      </div>
    </section>
  )
}
