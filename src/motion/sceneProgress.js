export const HOME_SCENE_CHAPTERS = ['intro', 'lifecycle', 'architecture', 'evidence', 'journey', 'cta']

export const HOME_SCENE_CHAPTER_INDEX = Object.fromEntries(
  HOME_SCENE_CHAPTERS.map((chapter, index) => [chapter, index]),
)

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(maximum, Math.max(minimum, value))
}

function smoothstep(edgeStart, edgeEnd, value) {
  const progress = clamp((value - edgeStart) / Math.max(0.001, edgeEnd - edgeStart))
  return progress * progress * (3 - 2 * progress)
}

function getChapterSurfaceThemeMix(chapter, documentThemeMix) {
  return chapter === HOME_SCENE_CHAPTER_INDEX.intro || chapter === HOME_SCENE_CHAPTER_INDEX.cta
    ? 1
    : documentThemeMix
}

export function calculateSceneThemeMix({ chapterFrom, chapterMix, chapterTo, documentThemeMix }) {
  const from = getChapterSurfaceThemeMix(chapterFrom, documentThemeMix)
  const to = getChapterSurfaceThemeMix(chapterTo, documentThemeMix)
  const transition = from === to ? clamp(chapterMix) : smoothstep(0.72, 1, chapterMix)
  return from + (to - from) * transition
}

export function calculateSceneProgress({ chapters, documentHeight, scrollY, viewportHeight }) {
  const safeChapters = chapters
    .filter((chapter) => HOME_SCENE_CHAPTER_INDEX[chapter.id] !== undefined)
    .sort((left, right) => left.start - right.start)

  if (safeChapters.length === 0) {
    return {
      activeChapter: 'intro', chapterFrom: 0, chapterMix: 0, chapterProgress: 0,
      chapterTo: 0, nextChapter: 'intro', pageProgress: 0,
    }
  }

  const focusY = Math.max(0, scrollY) + Math.max(1, viewportHeight) * 0.52
  let activeIndex = safeChapters.length - 1
  for (let index = 0; index < safeChapters.length - 1; index += 1) {
    if (focusY < safeChapters[index + 1].start) {
      activeIndex = index
      break
    }
  }

  const active = safeChapters[activeIndex]
  const next = safeChapters[Math.min(activeIndex + 1, safeChapters.length - 1)]
  const transitionDistance = Math.max(1, next.start - active.start)
  const chapterProgress = activeIndex === safeChapters.length - 1
    ? 0
    : clamp((focusY - active.start) / transitionDistance)
  const scrollRange = Math.max(1, documentHeight - viewportHeight)

  return {
    activeChapter: active.id,
    chapterFrom: HOME_SCENE_CHAPTER_INDEX[active.id],
    chapterMix: chapterProgress,
    chapterProgress,
    chapterTo: HOME_SCENE_CHAPTER_INDEX[next.id],
    nextChapter: next.id,
    pageProgress: clamp(scrollY / scrollRange),
  }
}

export function readSceneChapterMetrics(root, scrollY = window.scrollY) {
  return [...root.querySelectorAll('[data-scene-chapter]')].map((element) => {
    const bounds = element.getBoundingClientRect()
    return {
      end: bounds.bottom + scrollY,
      id: element.dataset.sceneChapter,
      start: bounds.top + scrollY,
    }
  })
}
