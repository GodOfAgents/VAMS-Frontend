try {
  const theme = 'dark'
  const background = '#050505'

  document.documentElement.dataset.theme = theme
  document.documentElement.style.background = background
  document.documentElement.style.colorScheme = theme
  document.documentElement.style.setProperty('--initial-bg', background)
  document.addEventListener('DOMContentLoaded', () => {
    document.body.style.background = background
  }, { once: true })
} catch {
  // The HTML defaults to the dark canvas when storage or media queries are unavailable.
}
