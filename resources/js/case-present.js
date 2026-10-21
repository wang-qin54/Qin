/* Presentation mode. Pair with resources/css/case-present.css.
   Load at the end of <body>, after the rail and the article exist.

   Opt in with a button at the end of .scrollspy:

     <button type="button" class="presw" aria-pressed="false"
             data-pres-key="my-case"
             data-zh="&lt;span class=&quot;tr&quot; aria-hidden=&quot;true&quot;&gt;&lt;/span&gt;演示模式">
       <span class="tr" aria-hidden="true"></span>Presentation
     </button>

   Slides are the .one-col groups that start at an .anchor whose id is linked
   from the rail (any hash except #top). Asset / KYC / AML use #sectionN;
   Dashboard uses named ids (#role, #dive-dashboard, …). Do not wrap sections:
   wrapping would break the reading-measure rule on direct children.

   The hero (#section1 by default, override with data-pres-hero) may sit outside
   .one-col; if it is not already a slide it becomes slide 1 and the next
   section stays visible beneath it.

   data-pres-key sets the localStorage key (default "case-presentation").
   window.CasePresent.init({ toggle, column, rail, key }) covers a page whose
   rail is not .scrollspy. A second call on the same button does nothing.

   The active .scrollspy link always matches the current slide; main.js skips
   its scroll-based highlight while data-pres="on". After each slide the script
   dispatches resize so annotation layouts remeasure once the slide is visible. */
(function () {
  function init(opts) {
    opts = opts || {};
    var sw = opts.toggle || document.querySelector('.scrollspy .presw');
    if (!sw || sw.dataset.presReady) return null;
    var col = opts.column || document.querySelector(sw.getAttribute('data-pres-column') || '.one-col');
    var rail = opts.rail || sw.closest('.scrollspy') || document.querySelector('.scrollspy');
    if (!col || !rail) return null;
    if (typeof col === 'string') col = document.querySelector(col);
    if (typeof rail === 'string') rail = document.querySelector(rail);
    if (!col || !rail) return null;

    var KEY = opts.key || sw.getAttribute('data-pres-key') || 'case-presentation';
    var heroId = sw.getAttribute('data-pres-hero') || 'section1';
    var WIDE = window.matchMedia(opts.wide || '(min-width: 601px)');
    var root = document.documentElement;

    /* Rail order is the walkthrough order. #top is a jump, not a slide. */
    var railOrder = [].slice.call(rail.querySelectorAll('a.list'))
      .map(function (a) { return (a.getAttribute('href') || '').split('#')[1]; })
      .filter(function (h) { return h && h !== 'top'; });
    var railIndex = {};
    railOrder.forEach(function (id, i) { railIndex[id] = i; });
    function isSlideAnchor(el) {
      return el.classList.contains('anchor') && el.id && Object.prototype.hasOwnProperty.call(railIndex, el.id);
    }

    /* Group .one-col's children at each rail-linked anchor. Anything before the
       first of those is the opening; trailing content belongs to the last slide. */
    var intro = [], slides = [], cur = null;
    [].forEach.call(col.children, function (el) {
      if (isSlideAnchor(el)) {
        cur = { id: el.id, els: [el] };
        slides.push(cur);
      } else if (cur) { cur.els.push(el); }
      else { intro.push(el); }
    });

    /* Hero may live outside the article (anchor + .page-title-box, and on
       Dashboard the system overview). Collect siblings up to .case-layout so
       the intro slide can hide them when you leave it. */
    if (!slides.some(function (s) { return s.id === heroId; })) {
      var hero = document.getElementById(heroId);
      if (hero) {
        var heroEls = [hero];
        var sib = hero.nextElementSibling;
        while (sib && !sib.classList.contains('case-layout')) {
          heroEls.push(sib);
          sib = sib.nextElementSibling;
        }
        slides.unshift({ id: heroId, els: heroEls });
      }
    }
    slides.sort(function (a, b) {
      var ia = Object.prototype.hasOwnProperty.call(railIndex, a.id) ? railIndex[a.id] : -1;
      var ib = Object.prototype.hasOwnProperty.call(railIndex, b.id) ? railIndex[b.id] : -1;
      return ia - ib;
    });
    slides.forEach(function (s, i) { s.n = i + 1; });
    if (slides.length < 2) return null;
    sw.dataset.presReady = '1';

    /* Prefer the rail length when every chip maps to a slide on this page;
       otherwise count the slides we actually built (split-file cases). */
    var total = railOrder.length >= slides.length ? railOrder.length : slides.length;
    var byId = {};
    slides.forEach(function (s) { byId[s.id] = s; });

    var bar = null, current = null, startY = 0;

    function railLink(id) {
      return rail.querySelector('a.list[href$="#' + id + '"]');
    }
    function buildBar() {
      if (bar) return bar;
      bar = document.createElement('div');
      bar.className = 'pres-bar';
      bar.innerHTML = '<button type="button" class="p" aria-label="Previous section">&lsaquo;</button>'
        + '<span class="n"></span>'
        + '<button type="button" class="x" aria-label="Next section">&rsaquo;</button>'
        + '<button type="button" class="esc" aria-label="Exit presentation mode">Esc</button>';
      bar.querySelector('.p').addEventListener('click', function () { step(-1); });
      bar.querySelector('.x').addEventListener('click', function () { step(1); });
      bar.querySelector('.esc').addEventListener('click', function () { setMode(false); });
      document.body.appendChild(bar);
      return bar;
    }
    function step(d) {
      if (!current) return;
      var i = slides.indexOf(current) + d;
      if (i < 0 || i >= slides.length) return;
      var next = slides[i];
      var a = railLink(next.id);
      if (a) a.click();
      else show(next.id);
    }

    /* Annotation scripts measure pins while a slide is on screen. A resize
       dispatched in this turn can run before layout, so kick it on the next
       frame and once more after images have settled. */
    function relayout() {
      function kick() { window.dispatchEvent(new Event('resize')); }
      requestAnimationFrame(function () {
        kick();
        requestAnimationFrame(kick);
      });
      setTimeout(kick, 80);
    }

    function show(id) {
      var hit = byId[id];
      if (!hit) return false;
      slides.forEach(function (s) {
        var on = s === hit;
        s.els.forEach(function (e) { e.hidden = !on; });
      });
      current = hit;
      /* The intro slide is only the short hero, so the page below it would sit
         blank. Let the next section run on beneath it, as at the top of the page. */
      if (hit === slides[0] && slides[1]) {
        slides[1].els.forEach(function (e) { e.hidden = false; });
      }
      /* The opening paragraphs introduce the case, so they ride with its first
         section and stay out of the way of the rest. */
      intro.forEach(function (e) { e.hidden = hit !== slides[0]; });

      [].forEach.call(rail.querySelectorAll('a.list'), function (a) { a.classList.remove('active'); });
      var link = railLink(id);
      if (link) link.classList.add('active');
      /* Keep the horizontal chip strip centred on the active section. */
      var list = rail.querySelector('.scrollspy__list') || rail;
      if (link && list.scrollWidth > list.clientWidth + 4) {
        var want = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
        list.scrollTo({
          left: Math.max(0, Math.min(want, list.scrollWidth - list.clientWidth)),
          behavior: 'smooth'
        });
      }

      var b = buildBar();
      b.querySelector('.n').textContent = hit.n + ' / ' + total;
      b.querySelector('.p').disabled = hit.n <= 1;
      b.querySelector('.x').disabled = hit.n >= slides.length;
      b.hidden = false;

      var top = hit === slides[0] ? 0 : hit.els[0].getBoundingClientRect().top + window.scrollY
        - (parseFloat(getComputedStyle(hit.els[0]).scrollMarginTop) || 88);
      startY = Math.max(0, top);
      window.scrollTo({ top: startY, behavior: 'instant' });
      try { localStorage.setItem(KEY + ':at', id); } catch (_) {}
      window.dispatchEvent(new Event('scroll'));
      relayout();
      return true;
    }

    function showAll() {
      slides.forEach(function (s) { s.els.forEach(function (e) { e.hidden = false; }); });
      intro.forEach(function (e) { e.hidden = false; });
      if (bar) bar.hidden = true;
      current = null;
      window.dispatchEvent(new Event('scroll'));
      relayout();
    }

    function active() { return root.getAttribute('data-pres') === 'on' && WIDE.matches; }
    /* The reading progress bar asks this which slide is up, so it fills by section. */
    window.presProgress = function () { return current ? { n: current.n, total: total, start: startY } : null; };

    function apply() {
      if (!active()) { showAll(); return; }
      var want = (location.hash || '').slice(1);
      if (!byId[want]) {
        try { want = localStorage.getItem(KEY + ':at') || ''; } catch (_) { want = ''; }
      }
      if (!show(want)) show(slides[0].id);
    }

    function setMode(on) {
      root.setAttribute('data-pres', on ? 'on' : 'off');
      sw.setAttribute('aria-pressed', on ? 'true' : 'false');
      try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (_) {}
      apply();
    }

    sw.addEventListener('click', function () { setMode(!active()); });

    /* Capture phase: this has to beat the smooth-scroll handler, which is a
       bubble listener on document. */
    document.addEventListener('click', function (e) {
      if (!active()) return;
      var a = e.target.closest && e.target.closest('.scrollspy a[href^="#"]');
      if (!a || !rail.contains(a)) return;
      var id = (a.getAttribute('href') || '').slice(1);
      if (id === 'top' || !byId[id]) return;
      if (!show(id)) return;
      e.preventDefault();
      e.stopPropagation();
      try { history.replaceState(null, '', '#' + id); } catch (_) {}
    }, true);

    document.addEventListener('keydown', function (e) {
      if (!active() || e.metaKey || e.ctrlKey || e.altKey) return;
      if (document.querySelector('dialog[open]')) return;
      var t = e.target;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      if (e.key === 'ArrowRight') { step(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { step(-1); e.preventDefault(); }
      else if (e.key === 'Escape') { setMode(false); }
    });

    /* Below 600px the toggle is hidden and the mode stands down — without
       forgetting the choice, so it comes back when the window widens. */
    var onWide = function () { apply(); };
    if (WIDE.addEventListener) WIDE.addEventListener('change', onWide);
    else WIDE.addListener(onWide);

    /* Arriving from the other file: the bridge posts the target section here. */
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (!d || d.type !== 'case:scroll' || !active()) return;
      var id = (d.hash || '').replace('#', '');
      if (byId[id]) show(id);
    });

    var saved = '0';
    try { saved = localStorage.getItem(KEY) || '0'; } catch (_) {}
    root.setAttribute('data-pres', saved === '1' ? 'on' : 'off');
    sw.setAttribute('aria-pressed', saved === '1' ? 'true' : 'false');
    apply();
    return { setMode: setMode, show: show };
  }

  window.CasePresent = { init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
