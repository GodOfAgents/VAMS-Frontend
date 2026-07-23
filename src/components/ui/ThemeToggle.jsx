import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../../app/ThemeProvider.jsx'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button className="icon-button" type="button" onClick={toggleTheme} aria-label={`Use ${isDark ? 'light' : 'dark'} theme`}>
      {isDark ? <Sun aria-hidden="true" size={17} /> : <Moon aria-hidden="true" size={17} />}
    </button>
  )
}
