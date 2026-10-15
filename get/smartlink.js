/* ============================================================
   Lifer smart link. Shared by /get/ and the short paths /ig, /fb, /tiktok and /yt.

   Each page sets window.LIFER_SMARTLINK = { forcedSource: '' } in a tiny inline
   script before loading this file. An empty forcedSource means the source comes
   from the query string (?src=NAME), which is how /get/ works. A non-empty one
   fixes the source for that page and the query string is ignored.

   iPhone and iPad go to the App Store, Android goes to Google Play, and the source
   is recorded in GA4 and handed to the store so the install is attributed. Anything
   else stays on the badge page, with its two badge links pointed at the right URLs.

   Loaded synchronously in the head before any stylesheet, so the redirect is never
   held up by a font or CSS fetch.
   ============================================================ */
(function () {
  var cfg = window.LIFER_SMARTLINK || {};

  /* ===================== EDIT HERE ===================== */
  var APPLE_APP_ID = '6762440686';
  /* The App Store Connect provider token (the pt= value of a campaign link).
     If ever emptied, iOS is sent to the plain App Store page with no campaign token. */
  var APPLE_PT = '128785659';
  var PLAY_PACKAGE = 'com.liferbirding.app';
  /* Recognised source names. Anything else is recorded as DEFAULT_SOURCE.
     Apple caps the campaign token at 30 characters, so keep every name within that. */
  var SOURCES = [
    'poster-sandspit', 'poster-beach', 'poster-city', 'poster-park', 'poster-bush',
    'web', 'email', 'ig', 'fb', 'tiktok', 'yt',
    'test'
  ];
  var DEFAULT_SOURCE = 'direct';
  var ANALYTICS_WAIT_MS = 400;
  /* Optional. Set per page through window.LIFER_SMARTLINK.forcedSource. When non-empty it
     replaces the query string and goes through the same sanitising and SOURCES check. */
  var FORCED_SOURCE = cfg.forcedSource ? String(cfg.forcedSource) : '';
  /* ================== end of edit block ================== */

  function appleUrl(src) {
    if (!APPLE_PT) return 'https://apps.apple.com/app/id' + APPLE_APP_ID;
    return 'https://apps.apple.com/app/apple-store/id' + APPLE_APP_ID +
      '?pt=' + encodeURIComponent(APPLE_PT) +
      '&ct=' + encodeURIComponent(src) +
      '&mt=8';
  }

  function playUrl(src) {
    var referrer = 'utm_source=' + src +
      '&utm_medium=smartlink' +
      '&utm_campaign=lifer' +
      '&utm_content=' + src;
    return 'https://play.google.com/store/apps/details?id=' + PLAY_PACKAGE +
      '&referrer=' + encodeURIComponent(referrer);
  }

  /* Forced source if the page set one, otherwise ?src=. Then lowercase, keep [a-z0-9-]
     only, cap at 30, and require a recognised name. */
  function readSource() {
    var raw = '';
    if (FORCED_SOURCE) {
      raw = FORCED_SOURCE;
    } else {
      try { raw = new URLSearchParams(location.search).get('src') || ''; } catch (e) { raw = ''; }
    }
    var clean = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
    return SOURCES.indexOf(clean) !== -1 ? clean : DEFAULT_SOURCE;
  }

  /* iOS covers iPhone, iPad, iPod and iPadOS Safari, which reports itself as a Mac with touch. */
  function detectPlatform() {
    var ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
    if (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'ios';
    if (/Android/.test(ua)) return 'android';
    return 'other';
  }

  var src = readSource();
  var platform = detectPlatform();
  var apple = appleUrl(src);
  var play = playUrl(src);
  var target = platform === 'ios' ? apple : (platform === 'android' ? play : null);

  /* location.replace keeps this page out of the back-button history. Runs once, whichever
     comes first: the analytics callback or the ANALYTICS_WAIT_MS timer. */
  var sent = false;
  function go() {
    if (sent || !target) return;
    sent = true;
    location.replace(target);
  }

  if (typeof gtag === 'function') {
    if (target) setTimeout(go, ANALYTICS_WAIT_MS);
    gtag('event', 'smartlink', { src: src, platform: platform, event_callback: go });
  } else {
    go();
  }

  /* Non-mobile: point the two badges at the store URLs for this source once the body exists. */
  function fillLinks() {
    var a = document.getElementById('appleLink');
    var p = document.getElementById('playLink');
    if (a) a.href = apple;
    if (p) p.href = play;
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fillLinks);
  } else {
    fillLinks();
  }
})();
