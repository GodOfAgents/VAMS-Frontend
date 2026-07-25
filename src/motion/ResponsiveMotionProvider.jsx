import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from 'motion/react'

const ResponsiveMotionContext = createContext({
  coarsePointer: true,
  distance: 0,
  heroQuality: 'static',
  isDesktop: false,
  isMobile: true,
  reducedMotion: true,
  viewportWidth: 320,
})

function readMotionEnvironment() {
  if (typeof window === 'undefined') {
    return {
      coarsePointer: true,
      reducedMotion: true,
      viewportWidth: 320,
    }
  }

  const supportsMediaQueries = typeof window.matchMedia === 'function'

  return {
    coarsePointer: supportsMediaQueries
      ? window.matchMedia('(hover: none), (pointer: coarse)').matches
      : true,
    reducedMotion: supportsMediaQueries
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : true,
    viewportWidth: window.innerWidth,
  }
}

function describeMotionEnvironment(environment) {
  const { coarsePointer, reducedMotion, viewportWidth } = environment
  const isMobile = viewportWidth < 768
  const isDesktop = viewportWidth >= 1200
  let heroQuality = 'desktop'

  if (viewportWidth < 360) heroQuality = 'static'
  else if (viewportWidth < 768) heroQuality = 'mobile'
  else if (viewportWidth < 1200) heroQuality = 'tablet'
  else if (viewportWidth >= 1600) heroQuality = 'wide'

  return {
    coarsePointer,
    distance: reducedMotion ? 0 : isDesktop ? 24 : isMobile ? 8 : 12,
    heroQuality: reducedMotion ? 'static' : heroQuality,
    isDesktop,
    isMobile,
    reducedMotion,
    viewportWidth,
  }
}

export function ResponsiveMotionProvider({ children }) {
  const [environment, setEnvironment] = useState(readMotionEnvironment)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return undefined

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointerQuery = window.matchMedia('(hover: none), (pointer: coarse)')
    let resizeFrame

    const update = () => {
      if (typeof window.requestAnimationFrame === 'function') {
        window.cancelAnimationFrame(resizeFrame)
        resizeFrame = window.requestAnimationFrame(() => setEnvironment(readMotionEnvironment()))
        return
      }

      setEnvironment(readMotionEnvironment())
    }

    reducedQuery.addEventListener('change', update)
    pointerQuery.addEventListener('change', update)
    window.addEventListener('resize', update, { passive: true })

    return () => {
      if (typeof window.cancelAnimationFrame === 'function') window.cancelAnimationFrame(resizeFrame)
      reducedQuery.removeEventListener('change', update)
      pointerQuery.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const value = useMemo(() => describeMotionEnvironment(environment), [environment])

  useEffect(() => {
    document.documentElement.dataset.motion = value.reducedMotion ? 'reduced' : 'full'
    document.documentElement.dataset.motionViewport = value.isDesktop ? 'desktop' : value.isMobile ? 'mobile' : 'tablet'
  }, [value])

  return (
    <ResponsiveMotionContext.Provider value={value}>
      <MotionConfig reducedMotion="user">
        <LazyMotion features={domAnimation} strict>
          {children}
        </LazyMotion>
      </MotionConfig>
    </ResponsiveMotionContext.Provider>
  )
}

export function useResponsiveMotion() {
  return useContext(ResponsiveMotionContext)
}

export function useHeroQuality() {
  return useResponsiveMotion().heroQuality
}
