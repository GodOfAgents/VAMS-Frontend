import { useEffect, useState } from 'react'
import { appEnvironment } from '../../config/environment.js'
import { createFrameBudgetController, isLowPowerDevice } from '../../motion/heroQuality.js'
import '../../styles/liquidGlass.css'

export function canEnhanceLiquidGlass({ isDesktop, coarsePointer, reducedMotion, lowPower, surface = 'all' }) {
  const marketingSurface = surface !== 'console' && surface !== 'status'
  return marketingSurface && isDesktop && !coarsePointer && !reducedMotion && !lowPower
}

export function useLiquidGlassEligibility(motion) {
  return canEnhanceLiquidGlass({ ...motion, lowPower: isLowPowerDevice(), surface: appEnvironment.surface })
}

export function LiquidGlassLens({ enabled, children }) {
  const [state, setState] = useState(enabled ? 'loading' : 'css')

  useEffect(() => {
    let active = true
    let lens = null
    let frame = 0
    let previousFrame = null
    let settleBudget
    let initTimeout
    let generation = 0

    const setCssFallback = () => {
      if (!active) return
      generation += 1
      if (frame) cancelAnimationFrame(frame)
      clearTimeout(initTimeout)
      settleBudget = null
      lens?.destroy()
      lens = null
      setState('css')
    }

    const monitorPerformance = (now) => {
      if (!active || document.hidden) return
      if (previousFrame !== null && settleBudget?.record(now - previousFrame, now)) {
        setCssFallback()
        return
      }
      previousFrame = now
      frame = requestAnimationFrame(monitorPerformance)
    }

    const initialize = async () => {
      if (!enabled || document.hidden) {
        setState('css')
        return
      }

      const currentGeneration = ++generation
      setState('loading')
      initTimeout = window.setTimeout(() => {
        if (active && generation === currentGeneration) setCssFallback()
      }, 4000)

      try {
        const { default: liquidGL } = await import('liquid-gl')

        if (!active || document.hidden || generation !== currentGeneration) return

        const target = document.querySelector('.marketing-nav__glass')
        if (!target) throw new Error('Navigation lens target is unavailable.')

        lens = liquidGL({
          engine: 'auto',
          snapshot: '.marketing-nav__backdrop-source',
          target: '.marketing-nav__glass',
          resolution: 1,
          zIndex: 91,
          content: false,
          refraction: 0.012,
          aberration: 0,
          bevelDepth: 0.06,
          bevelWidth: 0.12,
          frost: 0.35,
          shadow: false,
          specular: false,
          reveal: 'none',
          tilt: false,
          draggable: false,
          on: {
            init() {
              if (!active || !lens || generation !== currentGeneration) return
              clearTimeout(initTimeout)
              settleBudget = createFrameBudgetController({
                thresholdMs: 33,
                breachDuration: 2000,
                sampleSize: 45,
                warmupFrames: 15,
              })
              previousFrame = null
              setState('ready')
              frame = requestAnimationFrame(monitorPerformance)
            },
          },
        })

        if (!lens) throw new Error('Navigation lens could not be created.')

        const canvas = document.querySelector('.marketing-nav canvas[data-liquid-ignore]')
        if (canvas) {
          canvas.addEventListener('webglcontextlost', setCssFallback, { once: true })
        }
      } catch {
        if (generation === currentGeneration) setCssFallback()
      }
    }

    const handleVisibility = () => {
      if (document.hidden) setCssFallback()
      else initialize()
    }

    initialize()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      active = false
      document.removeEventListener('visibilitychange', handleVisibility)
      if (frame) cancelAnimationFrame(frame)
      clearTimeout(initTimeout)
      lens?.destroy()
    }
  }, [enabled])

  return (
    <div className="marketing-nav__inner" data-glass-renderer={state}>
      <span aria-hidden="true" className="marketing-nav__glass" />
      <div className="marketing-nav__content">{children}</div>
    </div>
  )
}
