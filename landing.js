// Sububu landing page. No trackers, no cookies, no network calls.
(function () {
  'use strict';

  // Fill these in when the store pages are live; empty means "coming soon".
  var PLAY_URL = '';  // e.g. 'https://play.google.com/store/apps/details?id=studio.difira.sububu'
  var APP_STORE_URL = '';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- store badges (hero + final CTA share one source) ----
  var heroBadges = document.getElementById('hero-badges');
  var ctaBadges = document.getElementById('cta-badges');
  if (heroBadges && ctaBadges) ctaBadges.innerHTML = heroBadges.innerHTML;
  document.querySelectorAll('.store').forEach(function (a) {
    var live = a.dataset.store === 'play' ? PLAY_URL : APP_STORE_URL;
    if (!live) return;
    a.href = live;
    a.target = '_blank';
    a.rel = 'noopener';
    var small = a.querySelector('small');
    var label = a.dataset.live || '';
    if (small) small.textContent = label;
    a.setAttribute('aria-label', label + ' ' + (a.dataset.store === 'play' ? 'Google Play' : 'App Store'));
  });

  // ---- language: picker, remembered choice, first-visit suggestion ----
  var LANGS = ['en', 'fr', 'pt', 'es', 'id', 'ar', 'tr'];
  function pathFor(lang) { return lang === 'en' ? '/' : '/' + lang + '/'; }
  function remember(lang) { try { localStorage.setItem('sububu-lang', lang); } catch (e) {} }
  function remembered() { try { return localStorage.getItem('sububu-lang'); } catch (e) { return null; } }
  var pageLang = document.documentElement.lang;
  document.querySelectorAll('.lang__select').forEach(function (sel) {
    sel.addEventListener('change', function () {
      var lang = LANGS.filter(function (l) { return pathFor(l) === sel.value; })[0] || 'en';
      remember(lang);
      location.href = sel.value + location.hash;
    });
  });
  document.querySelectorAll('[data-lang]').forEach(function (a) {
    a.addEventListener('click', function () { remember(a.dataset.lang); });
  });
  // On the English home page, a first-time visitor whose browser prefers
  // another supported language is sent to that version once.
  if (pageLang === 'en' && !remembered()) {
    var prefs = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < prefs.length; i++) {
      var code = String(prefs[i]).toLowerCase().split('-')[0];
      if (code === 'en') break;
      if (LANGS.indexOf(code) > 0) { remember(code); location.replace(pathFor(code) + location.hash); break; }
    }
  }

  // ---- nav background on scroll ----
  var nav = document.getElementById('nav');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- count-up numbers ----
  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var prefix = el.dataset.prefix || '';
    var suffix = el.dataset.suffix || '';
    function show(v) { el.textContent = prefix + v.toFixed(decimals) + suffix; }
    if (reduceMotion || target === 0) { show(target); return; }
    var start = null, dur = 1400;
    function frame(t) {
      if (start === null) start = t;
      var p = Math.min(1, (t - start) / dur);
      show(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ---- typewriter for the refund email ----
  function typeOut(el) {
    var text = el.dataset.text || '';
    if (reduceMotion) { el.textContent = text; return; }
    var i = 0;
    (function tick() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, 22 + Math.random() * 30);
    })();
  }

  // ---- reveal on scroll ----
  var seen = new WeakSet();
  function activate(el) {
    if (seen.has(el)) return;
    seen.add(el);
    el.classList.add('is-in');
    el.querySelectorAll('[data-count]').forEach(countUp);
    el.querySelectorAll('.type').forEach(typeOut);
    if (el.matches('[data-count]')) countUp(el);
  }
  var targets = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { activate(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(activate);
  }

  // ---- hero phone: cycle through app screens ----
  var shots = document.querySelectorAll('.phone--hero .shot');
  if (shots.length > 1 && !reduceMotion) {
    var cur = 0;
    setInterval(function () {
      var prev = shots[cur];
      prev.classList.remove('is-on');
      prev.classList.add('was-on'); // stays under the new screen while it fades in
      cur = (cur + 1) % shots.length;
      shots[cur].classList.add('is-on');
      setTimeout(function () { prev.classList.remove('was-on'); }, 800);
    }, 3200);
  }

  // ---- 3D tilt + card spotlight (mouse only) ----
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('.tilt').forEach(function (el) {
      var max = el.classList.contains('card') ? 5 : 9;
      el.addEventListener('mousemove', function (ev) {
        var r = el.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateY(' + (x * max) + 'deg) rotateX(' + (-y * max) + 'deg)';
        el.style.setProperty('--mx', ((x + 0.5) * 100) + '%');
        el.style.setProperty('--my', ((y + 0.5) * 100) + '%');
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
