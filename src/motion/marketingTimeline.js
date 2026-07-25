import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function initLifecycleTimeline(section) {
  const rows = Array.from(section.querySelectorAll('.lifecycle-list li'))
  const progress = section.querySelector('.lifecycle-progress__bar')
  if (!rows.length || !progress) return () => {}

  const context = gsap.context(() => {
    gsap.fromTo(progress, { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top 62%',
        end: 'bottom 68%',
        scrub: 0.35,
      },
    })

    rows.forEach((row) => {
      ScrollTrigger.create({
        trigger: row,
        start: 'top 62%',
        end: 'bottom 42%',
        onToggle: ({ isActive }) => row.classList.toggle('is-active', isActive),
      })
    })
  }, section)

  return () => {
    rows.forEach((row) => row.classList.remove('is-active'))
    context.revert()
  }
}
