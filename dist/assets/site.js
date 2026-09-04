/* Green Man's — scroll choreography + interactions */
(function () {
  'use strict';

  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = RM.matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var raf = window.requestAnimationFrame.bind(window);

  /* ---------- 1. split headings into masked, staggered words ---------- */
  function splitText() {
    $$('[data-split]').forEach(function (el) {
      if (el.dataset.splitDone) return;
      el.dataset.splitDone = '1';
      var lines = el.innerHTML.split(/<br\s*\/?>/i);
      var n = 0;
      el.innerHTML = lines.map(function (line) {
        var tmp = document.createElement('div');
        tmp.innerHTML = line;
        var out = '';
        Array.prototype.forEach.call(tmp.childNodes, function (node) {
          if (node.nodeType === 3) {
            node.nodeValue.split(/(\s+)/).forEach(function (tok) {
              if (!tok.trim()) { out += tok; return; }
              out += '<span class="word" style="--i:' + n++ + '">' + tok + '</span>';
            });
          } else {
            var inner = node.textContent.split(/(\s+)/).map(function (tok) {
              if (!tok.trim()) return tok;
              return '<span class="word" style="--i:' + n++ + '">' + tok + '</span>';
            }).join('');
            var clone = node.cloneNode(false);
            clone.innerHTML = inner;
            out += clone.outerHTML;
          }
        });
        return '<span class="line-mask">' + out + '</span>';
      }).join('');
    });
  }

  /* ---------- 2. reveal on enter ---------- */
  function observeReveals() {
    var targets = $$('[data-split], [data-reveal], .step');
    if (!('IntersectionObserver' in window) || reduced) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    /* stagger index within a group */
    $$('[data-stagger]').forEach(function (group) {
      $$('[data-reveal]', group).forEach(function (el, i) {
        if (!el.style.getPropertyValue('--i')) el.style.setProperty('--i', i);
      });
    });
    targets.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 3. scroll-scrubbed statement ---------- */
  var scrubs = [];
  function buildScrub() {
    $$('[data-scrub]').forEach(function (el) {
      if (el.dataset.scrubDone) return;
      el.dataset.scrubDone = '1';
      var keys = (el.dataset.key || '').toLowerCase().split('|').filter(Boolean);
      var html = el.textContent.trim().split(/(\s+)/).map(function (tok) {
        if (!tok.trim()) return ' ';
        var bare = tok.toLowerCase().replace(/[^a-z']/g, '');
        var isKey = keys.indexOf(bare) > -1;
        return '<span class="w' + (isKey ? ' key' : '') + '">' + tok + '</span>';
      }).join('');
      el.innerHTML = html;
      scrubs.push({ el: el, words: $$('.w', el) });
    });
    if (reduced) scrubs.forEach(function (s) { s.words.forEach(function (w) { w.classList.add('on'); }); });
  }
  function paintScrub() {
    if (reduced) return;
    var vh = window.innerHeight;
    scrubs.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      var start = vh * 0.86;
      var end = vh * 0.24;
      var p = (start - r.top) / (start - end + r.height);
      p = Math.max(0, Math.min(1, p));
      var lit = Math.round(p * s.words.length * 1.12);
      s.words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
    });
  }

  /* ---------- 4. parallax layers ---------- */
  var plx = [];
  function buildParallax() {
    plx = $$('[data-plx]').map(function (el) {
      return { el: el, k: parseFloat(el.dataset.plx) || 0.12 };
    });
  }
  function paintParallax() {
    if (reduced) return;
    var y = window.scrollY;
    var vh = window.innerHeight;
    plx.forEach(function (p) {
      var r = p.el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      p.el.style.transform = 'translate3d(0,' + (y * p.k).toFixed(2) + 'px,0)';
    });
  }

  /* ---------- 5. progress bar + sticky nav ---------- */
  var bar = $('.progress');
  var nav = $('.nav');
  function paintChrome() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? window.scrollY / h : 0;
    if (bar) bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
    if (nav) nav.classList.toggle('is-stuck', window.scrollY > 12);
  }

  /* ---------- 6. timeline fill ---------- */
  function paintSteps() {
    $$('.steps').forEach(function (s) {
      var fill = $('.steps__fill', s);
      if (!fill) return;
      var r = s.getBoundingClientRect();
      var vh = window.innerHeight;
      var p = (vh * 0.62 - r.top) / r.height;
      fill.style.height = (Math.max(0, Math.min(1, p)) * 100).toFixed(2) + '%';
    });
  }

  /* ---------- 7. count-up stats ---------- */
  function counters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    if (reduced || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.textContent = el.dataset.count; });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target;
        var target = parseFloat(el.dataset.count);
        var dec = (el.dataset.count.split('.')[1] || '').length;
        var t0 = performance.now();
        var dur = 1500;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur);
          var eased = 1 - Math.pow(1 - p, 4);
          el.textContent = (target * eased).toFixed(dec);
          if (p < 1) raf(tick);
          else el.textContent = el.dataset.count;
        })(t0);
      });
    }, { threshold: 0.5 });
    els.forEach(function (el) { el.textContent = '0'; io.observe(el); });
  }

  /* ---------- 8. mobile menu ---------- */
  function menu() {
    var m = $('.menu');
    var open = $('.nav__toggle');
    var close = $('.menu__close');
    if (!m || !open) return;
    var last = null;
    function set(on) {
      m.classList.toggle('is-open', on);
      m.setAttribute('aria-hidden', on ? 'false' : 'true');
      open.setAttribute('aria-expanded', on ? 'true' : 'false');
      document.body.style.overflow = on ? 'hidden' : '';
      $$('.menu__link', m).forEach(function (l, i) {
        l.style.transitionDelay = on ? (90 + i * 55) + 'ms' : '0ms';
      });
      if (on) { last = document.activeElement; if (close) close.focus(); }
      else if (last) last.focus();
    }
    open.addEventListener('click', function () { set(true); });
    if (close) close.addEventListener('click', function () { set(false); });
    $$('.menu__link', m).forEach(function (l) {
      l.addEventListener('click', function () { set(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && m.classList.contains('is-open')) set(false);
    });
  }

  /* ---------- 9. FAQ accordion ---------- */
  function faq() {
    $$('.faq__q').forEach(function (q) {
      q.addEventListener('click', function () {
        var on = q.getAttribute('aria-expanded') === 'true';
        var panel = document.getElementById(q.getAttribute('aria-controls'));
        q.setAttribute('aria-expanded', on ? 'false' : 'true');
        if (panel) panel.setAttribute('data-open', on ? 'false' : 'true');
      });
    });
  }

  /* ---------- 10. estimate form ---------- */
  function form() {
    var f = $('#estimate');
    if (!f) return;
    var ok = $('.form__ok', f.parentNode) || $('.form__ok');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = false;
      $$('.field', f).forEach(function (fld) {
        var input = $('input, select, textarea', fld);
        if (!input || !input.required) return;
        var v = (input.value || '').trim();
        var invalid = !v || (input.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v));
        fld.classList.toggle('has-err', invalid);
        if (invalid && !bad) { input.focus(); bad = true; }
      });
      if (bad) return;
      f.hidden = true;
      if (ok) { ok.classList.add('is-on'); ok.setAttribute('tabindex', '-1'); ok.focus(); }
    });
    $$('.field input, .field select, .field textarea', f).forEach(function (i) {
      i.addEventListener('input', function () { i.closest('.field').classList.remove('has-err'); });
    });
  }

  /* ---------- 11. marquee duplication ---------- */
  function marquee() {
    $$('.marquee__track').forEach(function (t) {
      if (t.dataset.dup) return;
      t.dataset.dup = '1';
      t.innerHTML = t.innerHTML + t.innerHTML;
    });
  }

  /* ---------- rAF-throttled scroll loop ---------- */
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    raf(function () {
      paintChrome();
      paintScrub();
      paintParallax();
      paintSteps();
      ticking = false;
    });
  }

  function boot() {
    splitText();
    buildScrub();
    buildParallax();
    marquee();
    observeReveals();
    counters();
    menu();
    faq();
    form();
    paintChrome();
    paintScrub();
    paintSteps();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    RM.addEventListener && RM.addEventListener('change', function (e) {
      reduced = e.matches;
    });
    /* first paint after fonts settle so masks measure right */
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { onScroll(); });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
