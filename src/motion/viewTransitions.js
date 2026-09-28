import { useEffect } from 'react'

// Route transitions use the native View Transitions API where it exists. Each
// page title carries the shared `page-title` transition name, so titles morph
// from one page to the next; a clicked journey row lends its own heading.

export const supportsViewTransitions = typeof document !== 'undefined'
  && typeof document.startViewTransition === 'function'

let pendingUntil = 0

/** Flags the next render as part of a view-transition navigation. */
export function markViewTransitionNavigation(duration = 900) {
  pendingUntil = performance.now() + duration
}

/** True while a view-transition navigation is committing. */
export function isViewTransitionNavigation() {
  return typeof performance !== 'undefined' && performance.now() < pendingUntil
}

// Only one element may hold a transition name, and an off-screen title should
// not fly in from outside the viewport.
function prepareTitleMorph(anchor) {
  const source = anchor.querySelector('[data-morph-title]')
  document.querySelectorAll('.vt-title').forEach((title) => {
    const bounds = title.getBoundingClientRect()
    const inView = bounds.bottom > 0 && bounds.top < window.innerHeight
    if (source || !inView) title.style.viewTransitionName = 'none'
  })
  if (source) source.style.viewTransitionName = 'page-title'
}

/**
 * Routes same-origin link clicks through `navigate(..., { viewTransition: true })`.
 * Runs in the capture phase, before React Router's own link handler.
 */
export function useViewTransitionLinks(navigate) {
  useEffect(() => {
    if (!supportsViewTransitions) return undefined

    const handleClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (document.documentElement.dataset.motion === 'reduced') return
      const anchor = event.target instanceof Element ? event.target.closest('a[href]') : null
      if (!anchor || (anchor.target && anchor.target !== '_self') || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, window.location.href)
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return

      event.preventDefault()
      prepareTitleMorph(anchor)
      markViewTransitionNavigation()
      navigate(`${url.pathname}${url.search}${url.hash}`, { viewTransition: true })
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [navigate])
}
