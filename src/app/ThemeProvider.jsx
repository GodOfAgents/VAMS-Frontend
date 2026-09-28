import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)

const CHOICE_KEY = 'vams-theme-choice'

// Light is the default theme. Only an explicit toggle is remembered.
function initialTheme() {
  if (typeof window === 'undefined') return 'light'
  try {
    const chosen = window.localStorage.getItem(CHOICE_KEY)
    if (chosen === 'light' || chosen === 'dark') return chosen
  } catch { /* Storage is optional. */ }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark'
      try { window.localStorage.setItem(CHOICE_KEY, next) } catch { /* Storage is optional. */ }
      return next
    }),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider.')
  return context
}
