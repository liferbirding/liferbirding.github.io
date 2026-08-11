/* ============================================================
   Lifer — shared site behaviour.
   Vanilla JS, no dependencies. Wrapped in an IIFE because every
   page also runs an inline script that declares `header` at the
   top level — a second top-level `const header` would throw.
   ============================================================ */
(function () {
  var header = document.getElementById('siteHeader');
  var toggle = document.getElementById('menuToggle');
  var panel = document.getElementById('mobileNav');
  if (!header || !toggle || !panel) return;

  var wide = window.matchMedia('(min-width:861px)');

  function setOpen(open) {
    header.setAttribute('data-menu-open', open ? 'true' : 'false');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  toggle.addEventListener('click', function () {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });

  /* A tap on any link closes the panel — in-page hash links do not reload. */
  panel.addEventListener('click', function (e) {
    if (e.target.closest('a')) setOpen(false);
  });

  /* A tap anywhere outside the header closes it. */
  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });

  /* Never leave the toggle reading "expanded" once the panel is out of play. */
  wide.addEventListener('change', function (e) {
    if (e.matches) setOpen(false);
  });
})();
