import { ExternalLink, Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import * as m from 'motion/react-m'
import { Brand } from './Brand.jsx'
import { appEnvironment } from '../../config/environment.js'
import { useResponsiveMotion } from '../../motion/ResponsiveMotionProvider.jsx'

const links = [
  ['/protocol', 'Protocol'],
  ['/network', 'Network'],
  ['/build', 'Build'],
  ['/operate', 'Operate'],
  ['/research', 'Research'],
  ['/status', 'Status'],
]

const INLINE_NAVIGATION_MIN_WIDTH = 1100
const indicatorSpring = { type: 'spring', stiffness: 520, damping: 42, mass: 0.7 }
const SURFACE_COLORS = { dark: '#08090a', light: '#f7f6f3' }

function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = null
    const update = () => {
      frame = null
      setScrolled(window.scrollY > threshold)
    }
    const handleScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [threshold])

  return scrolled
}

// The site is light; some sections (the home hero) are dark islands. The bar takes the
// theme of whatever sits beneath its centre so it always reads against the page.
function useHeaderSurface(headerRef) {
  const [surface, setSurface] = useState('light')
  const { pathname } = useLocation()

  useEffect(() => {
    const header = headerRef.current
    if (!header) return undefined
    let frame = null

    const update = () => {
      frame = null
      const bar = header.querySelector('.site-header__bar')
      if (!bar) return
      const bounds = bar.getBoundingClientRect()
      let next = 'light'
      for (const element of document.elementsFromPoint(window.innerWidth / 2, bounds.top + bounds.height / 2)) {
        if (header.contains(element)) continue
        next = element.closest('[data-theme]')?.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
        break
      }
      setSurface(next)
    }
    const schedule = () => {
      if (frame === null) frame = window.requestAnimationFrame(update)
    }

    const main = document.getElementById('main-content')
    const mutations = new MutationObserver(schedule)
    if (main) mutations.observe(main, { childList: true, subtree: true })
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    schedule()
    return () => {
      mutations.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [headerRef, pathname])

  useEffect(() => {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', SURFACE_COLORS[surface])
  }, [surface])

  return surface
}

export function MarketingNav() {
  const [menuOpen, setOpen] = useState(false)
  const [hovered, setHovered] = useState(null)
  const menuButton = useRef(null)
  const header = useRef(null)
  const motion = useResponsiveMotion()
  const scrolled = useScrolled()
  const surface = useHeaderSurface(header)
  const inline = motion.viewportWidth >= INLINE_NAVIGATION_MIN_WIDTH
  const open = menuOpen && !inline
  const expandedNavigation = inline || open

  useEffect(() => {
    if (!open) return undefined
    const dismiss = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return
      if (event.type === 'pointerdown' && header.current?.contains(event.target)) return
      setOpen(false)
      if (event.type === 'keydown') menuButton.current?.focus()
    }
    document.addEventListener('keydown', dismiss)
    document.addEventListener('pointerdown', dismiss)
    return () => {
      document.removeEventListener('keydown', dismiss)
      document.removeEventListener('pointerdown', dismiss)
    }
  }, [open])

  const closeMenu = () => {
    if (!open) return
    setOpen(false)
    menuButton.current?.focus()
  }

  const itemVariants = inline || motion.reducedMotion
    ? undefined
    : {
      closed: { opacity: 0, y: -6 },
      open: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] } },
    }

  return (
    <header className="site-header" data-menu-open={open ? 'true' : 'false'} data-scrolled={scrolled ? 'true' : 'false'} data-theme={surface} ref={header}>
      <div className="site-header__bar" data-glass="true">
        <Brand />
        <m.nav
          animate={expandedNavigation ? 'open' : 'closed'}
          aria-hidden={!expandedNavigation}
          aria-label="Primary"
          className={`site-nav ${open ? 'is-open' : ''}`}
          id="primary-navigation"
          inert={!expandedNavigation}
          initial={false}
          onPointerLeave={() => setHovered(null)}
          variants={inline ? undefined : {
            closed: { opacity: 0, y: -8, scale: 0.985, transition: { duration: 0.16, ease: 'easeOut' } },
            open: {
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { duration: motion.reducedMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1], staggerChildren: 0.03, delayChildren: 0.04 },
            },
          }}
        >
          {links.map(([to, label]) => (
            <NavLink
              className="site-nav__link"
              key={to}
              onClick={closeMenu}
              onFocus={() => setHovered(to)}
              onPointerEnter={() => setHovered(to)}
              to={to}
            >
              {({ isActive }) => (
                <>
                  {inline && isActive && <m.span className="site-nav__active" layoutId="site-nav-active" transition={indicatorSpring} aria-hidden="true" />}
                  {inline && hovered === to && !isActive && <m.span className="site-nav__hover" layoutId="site-nav-hover" transition={indicatorSpring} aria-hidden="true" />}
                  <m.span className="site-nav__label" variants={itemVariants}>{label}</m.span>
                </>
              )}
            </NavLink>
          ))}
          <a
            className="site-nav__link site-nav__link--external"
            href={appEnvironment.docsUrl}
            onFocus={() => setHovered('docs')}
            onPointerEnter={() => setHovered('docs')}
          >
            {inline && hovered === 'docs' && <m.span className="site-nav__hover" layoutId="site-nav-hover" transition={indicatorSpring} aria-hidden="true" />}
            <m.span className="site-nav__label" variants={itemVariants}>Read docs <ExternalLink aria-hidden="true" size={13} /></m.span>
          </a>
        </m.nav>
        <div className="site-header__actions">
          <Link className="button button--small site-header__cta" to="/overview">Open console</Link>
          <button
            aria-controls="primary-navigation"
            aria-expanded={open}
            aria-label={open ? 'Close navigation' : 'Open navigation'}
            className="icon-button site-header__menu"
            onClick={() => setOpen(!open)}
            ref={menuButton}
            type="button"
          >
            {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  )
}
