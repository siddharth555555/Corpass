/* ============================================================================
   CORPASS THEME — Optional theme toggle
   ----------------------------------------------------------------------------
   OPTIONAL. You do NOT need this if you're happy following the OS setting —
   dark-tokens.css already does that via prefers-color-scheme with zero JS.

   Use this only if you want a manual light/dark switch. It is the one piece of
   this theme that adds a little behavior: it sets data-theme on <html> and
   remembers the choice. It does not touch any of your app's existing logic.

   Wire a control to it, e.g.:
       <button onclick="toggleCorpassTheme()" aria-label="Toggle dark mode">🌙</button>
   ========================================================================== */
(function () {
  var KEY = 'corpass-theme';
  var root = document.documentElement;

  // Apply a saved manual choice on load (system preference handles the rest).
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  } catch (e) { /* storage unavailable — fall back to system preference */ }

  function currentlyDark() {
    var attr = root.getAttribute('data-theme');
    if (attr === 'dark') return true;
    if (attr === 'light') return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Exposed globally so any button/menu can call it.
  window.toggleCorpassTheme = function () {
    var next = currentlyDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    return next;
  };

  // Optional helper if you'd rather set it explicitly: setCorpassTheme('dark'|'light'|'system')
  window.setCorpassTheme = function (mode) {
    if (mode === 'system') {
      root.removeAttribute('data-theme');
      try { localStorage.removeItem(KEY); } catch (e) {}
    } else if (mode === 'dark' || mode === 'light') {
      root.setAttribute('data-theme', mode);
      try { localStorage.setItem(KEY, mode); } catch (e) {}
    }
  };
})();
