import { describe, expect, it } from 'vitest'
import {
  calculateSceneProgress,
  calculateSceneThemeMix,
  HOME_SCENE_CHAPTER_INDEX,
} from './sceneProgress.js'

const chapters = [
  { id: 'intro', start: 0 },
  { id: 'lifecycle', start: 900 },
  { id: 'architecture', start: 1900 },
  { id: 'evidence', start: 2900 },
  { id: 'journey', start: 3900 },
  { id: 'cta', start: 4700 },
]

describe('calculateSceneProgress', () => {
  it('interpolates between the current and next homepage chapters', () => {
    const state = calculateSceneProgress({
      chapters,
      documentHeight: 5600,
      scrollY: 1000,
      viewportHeight: 800,
    })

    expect(state.activeChapter).toBe('lifecycle')
    expect(state.nextChapter).toBe('architecture')
    expect(state.chapterFrom).toBe(HOME_SCENE_CHAPTER_INDEX.lifecycle)
    expect(state.chapterTo).toBe(HOME_SCENE_CHAPTER_INDEX.architecture)
    expect(state.chapterMix).toBeCloseTo(0.516, 3)
    expect(state.pageProgress).toBeCloseTo(1 / 4.8, 3)
  })

  it('holds the final scene without reading beyond the chapter list', () => {
    const state = calculateSceneProgress({
      chapters,
      documentHeight: 5600,
      scrollY: 5000,
      viewportHeight: 800,
    })

    expect(state.activeChapter).toBe('cta')
    expect(state.nextChapter).toBe('cta')
    expect(state.chapterMix).toBe(0)
    expect(state.pageProgress).toBe(1)
  })

  it('fails safely to the intro scene when no valid markers exist', () => {
    expect(calculateSceneProgress({
      chapters: [{ id: 'unknown', start: 0 }],
      documentHeight: 0,
      scrollY: 0,
      viewportHeight: 0,
    })).toEqual({
      activeChapter: 'intro',
      chapterFrom: 0,
      chapterMix: 0,
      chapterProgress: 0,
      chapterTo: 0,
      nextChapter: 'intro',
      pageProgress: 0,
    })
  })
})

describe('calculateSceneThemeMix', () => {
  it('keeps the dark hero and CTA surfaces legible in light theme', () => {
    expect(calculateSceneThemeMix({
      chapterFrom: HOME_SCENE_CHAPTER_INDEX.intro,
      chapterMix: 0,
      chapterTo: HOME_SCENE_CHAPTER_INDEX.lifecycle,
      documentThemeMix: 0,
    })).toBe(1)
    expect(calculateSceneThemeMix({
      chapterFrom: HOME_SCENE_CHAPTER_INDEX.cta,
      chapterMix: 0,
      chapterTo: HOME_SCENE_CHAPTER_INDEX.cta,
      documentThemeMix: 0,
    })).toBe(1)
  })

  it('delays contrast blending until the dark hero nears its section boundary', () => {
    expect(calculateSceneThemeMix({
      chapterFrom: HOME_SCENE_CHAPTER_INDEX.intro,
      chapterMix: 0.5,
      chapterTo: HOME_SCENE_CHAPTER_INDEX.lifecycle,
      documentThemeMix: 0,
    })).toBe(1)
    expect(calculateSceneThemeMix({
      chapterFrom: HOME_SCENE_CHAPTER_INDEX.intro,
      chapterMix: 0.86,
      chapterTo: HOME_SCENE_CHAPTER_INDEX.lifecycle,
      documentThemeMix: 0,
    })).toBeCloseTo(0.5, 3)
  })

  it('keeps editorial chapters aligned with the selected theme', () => {
    expect(calculateSceneThemeMix({
      chapterFrom: HOME_SCENE_CHAPTER_INDEX.lifecycle,
      chapterMix: 0.25,
      chapterTo: HOME_SCENE_CHAPTER_INDEX.architecture,
      documentThemeMix: 0,
    })).toBe(0)
  })
})
