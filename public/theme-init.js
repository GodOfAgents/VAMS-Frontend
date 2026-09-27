// Applies the stored or preferred theme before first paint so the page never flashes the wrong palette.
// Loaded as a same-origin file because the content security policy does not allow inline scripts.
(function applyInitialTheme() {
  var theme = 'dark'
  try {
    var saved = window.localStorage.getItem('vams-theme')
    if (saved === 'light' || saved === 'dark') theme = saved
    else if (window.matchMedia('(prefers-color-scheme: light)').matches) theme = 'light'
  } catch {
    theme = 'dark'
  }
  document.documentElement.dataset.theme = theme
})()
