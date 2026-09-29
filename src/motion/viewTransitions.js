import { useEffect } from 'react'

const marketingPaths = new Set(['/', '/protocol', '/network', '/build', '/operate', '/research'])
const supportsViewTransitions = typeof document !== 'undefined' && typeof document.startViewTransition === 'function'
let pendingUntil = 0

export function isMotionRouteTransition() {
  return typeof performance !== 'undefined' && performance.now() < pendingUntil
}

export function canMorphRoutes(motion) {
  return supportsViewTransitions && !motion.reducedMotion && !motion.coarsePointer
}

function visibleHeading(anchor) {
  const candidate = anchor.querySelector('[data-morph-title]') || document.querySelector('#main-content h1')
  if (!candidate) return null
  const bounds = candidate.getBoundingClientRect()
  return bounds.bottom > 0 && bounds.top < window.innerHeight ? candidate : null
}

/** Native transitions are limited to marketing routes and fine pointers. */
export function useMarketingViewTransitions(navigate, enabled) {
  useEffect(() => {
    if (!enabled) return undefined

    const handleClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!anchor?.closest('.site-shell') || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return

      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname || !marketingPaths.has(url.pathname)) return

      const currentHeading = document.querySelector('#main-content h1')
      const heading = visibleHeading(anchor)
      if (currentHeading && currentHeading !== heading) currentHeading.style.viewTransitionName = 'none'
      if (heading) heading.style.viewTransitionName = 'vams-page-title'
      pendingUntil = performance.now() + 500
      event.preventDefault()
      navigate(`${url.pathname}${url.search}${url.hash}`, { viewTransition: true })
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [enabled, navigate])
}
