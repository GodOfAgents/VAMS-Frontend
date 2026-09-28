// Applies the visitor's explicit theme choice (light by default) before first paint so the
// page never flashes the wrong palette. Loaded as a same-origin file because the content
// security policy does not allow inline scripts.
(function applyInitialTheme() {
  var theme = 'light'
  try {
    var chosen = window.localStorage.getItem('vams-theme-choice')
    if (chosen === 'light' || chosen === 'dark') theme = chosen
  } catch {
    theme = 'light'
  }
  document.documentElement.dataset.theme = theme
})()
