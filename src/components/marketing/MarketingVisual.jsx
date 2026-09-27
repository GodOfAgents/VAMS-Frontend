import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTheme } from '../../app/ThemeProvider.jsx'
import { useHeroQuality } from '../../motion/ResponsiveMotionProvider.jsx'
import {
  HERO_QUALITY_ORDER,
  HERO_QUALITY_PROFILES,
  isLowPowerDevice,
} from '../../motion/heroQuality.js'
import {
  calculateSceneProgress,
  calculateSceneThemeMix,
  readSceneChapterMetrics,
} from '../../motion/sceneProgress.js'
import '../../styles/homeScene.css'

const NeuralField = lazy(() => import('./NeuralField.jsx'))

const initialSceneState = {
  activeChapter: 'intro',
  chapterFrom: 0,
  chapterMix: 0,
  chapterPosition: 0,
  chapterTo: 0,
  nextChapter: 'intro',
  pageProgress: 0,
  documentThemeMix: 1,
  themeMix: 1,
}

export function MarketingVisual({ proofSignal = 0 }) {
  const requestedQuality = useHeroQuality()
  const { theme } = useTheme()
  const lowPower = useMemo(() => isLowPowerDevice(), [])
  const mountRef = useRef(null)
  const sceneStateRef = useRef({
    ...initialSceneState,
    documentThemeMix: theme === 'dark' ? 1 : 0,
  })
  const [tier, setTier] = useState(() => {
    if (requestedQuality.tier === 'static') return 'static'
    return lowPower ? 'low' : requestedQuality.tier
  })
  const [degraded, setDegraded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const handleFailure = useCallback(() => {
    setFailed(true)
    setReady(false)
  }, [])
  const handleReady = useCallback(() => setReady(true), [])
  const handleDegrade = useCallback((nextTier) => {
    setDegraded(true)
    setTier((currentTier) => {
      const currentIndex = HERO_QUALITY_ORDER.indexOf(currentTier)
      const nextIndex = HERO_QUALITY_ORDER.indexOf(nextTier)
      return nextIndex < currentIndex ? nextTier : currentTier
    })
  }, [])

  const effectiveTier = requestedQuality.tier === 'static' ? 'static' : tier
  const quality = useMemo(
    () => ({
      ...HERO_QUALITY_PROFILES[effectiveTier],
      pointerEnabled: HERO_QUALITY_PROFILES[effectiveTier].pointerEnabled
        && requestedQuality.pointerEnabled,
      reducedMotion: requestedQuality.reducedMotion,
      scrollEnabled: HERO_QUALITY_PROFILES[effectiveTier].scrollEnabled
        && requestedQuality.scrollEnabled
        && !degraded,
    }),
    [degraded, effectiveTier, requestedQuality.pointerEnabled, requestedQuality.reducedMotion, requestedQuality.scrollEnabled],
  )
  const rendererState = failed || effectiveTier === 'static' ? 'fallback' : ready ? 'ready' : 'loading'

  useEffect(() => {
    const documentThemeMix = theme === 'dark' ? 1 : 0
    sceneStateRef.current.documentThemeMix = documentThemeMix
    sceneStateRef.current.themeMix = calculateSceneThemeMix({
      ...sceneStateRef.current,
      documentThemeMix,
    })
    mountRef.current?.style.setProperty('--scene-theme-mix', sceneStateRef.current.themeMix.toFixed(3))
  }, [theme])

  useEffect(() => {
    const sceneElement = mountRef.current
    const root = sceneElement?.closest('.marketing-home')
    if (!sceneElement || !root) return undefined

    let chapters = []
    let scrollFrame = null
    let resizeFrame = null

    const measure = () => {
      resizeFrame = null
      chapters = readSceneChapterMetrics(root)
    }

    const update = () => {
      scrollFrame = null
      const state = calculateSceneProgress({
        chapters,
        documentHeight: document.documentElement.scrollHeight,
        scrollY: window.scrollY,
        viewportHeight: window.innerHeight,
      })
      const themeMix = calculateSceneThemeMix({
        ...state,
        documentThemeMix: sceneStateRef.current.documentThemeMix,
      })
      Object.assign(sceneStateRef.current, state, { themeMix })
      sceneElement.dataset.sceneActive = state.activeChapter
      sceneElement.dataset.sceneNext = state.nextChapter
      sceneElement.dataset.sceneMix = state.chapterMix.toFixed(3)
      sceneElement.dataset.scenePage = state.pageProgress.toFixed(3)
      sceneElement.style.setProperty('--scene-theme-mix', themeMix.toFixed(3))
      sceneElement.style.setProperty('--scene-page-progress', state.pageProgress.toFixed(3))
    }

    const requestUpdate = () => {
      if (scrollFrame !== null) return
      scrollFrame = window.requestAnimationFrame(update)
    }

    const requestMeasure = () => {
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame)
      resizeFrame = window.requestAnimationFrame(() => {
        measure()
        update()
      })
    }

    const resizeObserver = new ResizeObserver(requestMeasure)
    resizeObserver.observe(root)
    root.querySelectorAll('[data-scene-chapter]').forEach((chapter) => resizeObserver.observe(chapter))
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestMeasure, { passive: true })
    measure()
    update()

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestMeasure)
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame)
      if (resizeFrame !== null) window.cancelAnimationFrame(resizeFrame)
    }
  }, [])

  return (
    <div
      className={`hero-visual marketing-scene hero-visual--${effectiveTier}`}
      aria-hidden="true"
      data-hero-quality={effectiveTier}
      data-hero-renderer={rendererState}
      data-marketing-scene="true"
      ref={mountRef}
      style={{ '--scene-theme-mix': 1 }}
    >
      <div className="neural-field neural-field--static" />
      <div className="scene-progress" aria-hidden="true">
        <span className="scene-progress__fill" />
        <span className="scene-progress__ticks"><i /><i /><i /><i /><i /><i /></span>
      </div>
      {!failed && effectiveTier !== 'static' && (
        <Suspense fallback={null}>
          <NeuralField
            onDegrade={handleDegrade}
            onFailure={handleFailure}
            onReady={handleReady}
            proofSignal={proofSignal}
            quality={quality}
            sceneStateRef={sceneStateRef}
          />
        </Suspense>
      )}
    </div>
  )
}
