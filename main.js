// ------------------------------------------------------------------
// Qin Wang portfolio · shared interactions
// ------------------------------------------------------------------

(function () {
  // Mobile menu lives in site-chrome.js with <site-header>.

  // ----------------------------------------------------------------
  // Work-page filter chips. Cards expose `data-tags="industry,skill"`.
  // ----------------------------------------------------------------
  const filterContainer = document.querySelector('[data-filter-container]');
  if (filterContainer) {
    const syncHeaderOffset = () => {
      const header = document.querySelector('.site-header');
      if (!header) return;
      document.documentElement.style.setProperty(
        '--header-height',
        `${header.getBoundingClientRect().height}px`
      );
    };

    syncHeaderOffset();
    window.addEventListener('resize', syncHeaderOffset);

    // ------------------------------------------------------------------
    // Merge header + filter bar into one visual unit when filter is stuck
    // ------------------------------------------------------------------
    const header = document.querySelector('.site-header');
    const filtersEl = document.querySelector('.filters');
    if (header && filtersEl) {
      let rafId = null;
      const checkStuck = () => {
        const filterTop = filtersEl.getBoundingClientRect().top;
        const headerBottom = header.getBoundingClientRect().bottom;
        header.classList.toggle('header--filter-attached', filterTop <= headerBottom + 1);
        rafId = null;
      };
      window.addEventListener('scroll', () => {
        if (!rafId) rafId = requestAnimationFrame(checkStuck);
      }, { passive: true });
      checkStuck();
    }
    // ------------------------------------------------------------------

    // Each tab shows the cards whose data-tags include it. Others swaps the grid
    // for a year rail built from the same cards. Cards sit in timeline order.
    const grid = document.querySelector('[data-filter-layout="timeline"]');
    const timeline = document.querySelector('[data-timeline]');
    const chips = Array.from(filterContainer.querySelectorAll('[data-filter]'));
    const DEFAULT = 'featured';
    const TIMELINE_TAB = 'others';
    const LEGACY = { web3: 'crypto', fintech: 'finance', all: 'others', research: 'others', academia: 'others' };
    let focus = DEFAULT;

    const tagsOf = (card) =>
      (card.getAttribute('data-tags') || '').toLowerCase().split(',').map((t) => t.trim()).filter(Boolean);

    // "2019–20" files under 2020, matching the newest-first order of the cards.
    const yearOf = (card) => {
      const caption = card.querySelector('.caption');
      const m = caption && caption.textContent.match(/(\d{4})(?:\s*[–-]\s*(\d{2,4}))?/);
      if (!m) return null;
      const start = Number(m[1]);
      if (!m[2]) return start;
      return m[2].length === 4 ? Number(m[2]) : Math.floor(start / 100) * 100 + Number(m[2]);
    };

    const buildTimeline = () => {
      if (!timeline || !grid) return;
      const groups = new Map();
      grid.querySelectorAll('[data-tags]').forEach((card) => {
        if (!tagsOf(card).includes(TIMELINE_TAB)) return;
        const year = yearOf(card);
        if (!groups.has(year)) groups.set(year, []);
        groups.get(year).push(card);
      });

      const list = document.createElement('ol');
      list.className = 'tl__years';
      [...groups].sort((a, b) => (b[0] || 0) - (a[0] || 0)).forEach(([year, cards]) => {
        const row = document.createElement('li');
        row.className = 'tl__year';
        row.innerHTML = `<div class="tl__marker"><span class="tl__label">${year}</span><span class="tl__count" data-zh="${cards.length} 个项目">${cards.length} ${cards.length === 1 ? 'project' : 'projects'}</span></div><div class="tl__items"></div>`;
        const items = row.querySelector('.tl__items');
        cards.forEach((card) => {
          const item = document.createElement('a');
          item.className = 'tl-item';
          item.href = card.getAttribute('href');
          const img = card.querySelector('.coverimg');
          if (img) {
            const thumb = img.cloneNode(false);
            thumb.className = 'tl-item__thumb';
            thumb.loading = 'lazy';
            item.appendChild(thumb);
          }
          const body = document.createElement('div');
          body.className = 'tl-item__body';
          [['.caption', 'tl-item__meta'], ['.card-title', 'tl-item__title'], ['.description', 'tl-item__desc'], ['.tags', 'tl-item__tags']].forEach(([sel, cls]) => {
            const src = card.querySelector(sel);
            if (!src) return;
            const copy = src.cloneNode(true);
            copy.classList.add(cls);
            // The rail already shows a single year; keep only ranges such as "2019–20".
            if (cls === 'tl-item__meta') {
              const strip = (html) => html.replace(new RegExp(`^\\s*${year}\\s*(<span class="dot"[^>]*></span>)?\\s*`), '');
              copy.innerHTML = strip(copy.innerHTML);
              if (copy.hasAttribute('data-zh')) copy.setAttribute('data-zh', strip(copy.getAttribute('data-zh')));
              if (!copy.textContent.trim()) return;
            }
            body.appendChild(copy);
          });
          item.appendChild(body);
          item.insertAdjacentHTML('beforeend', '<span class="tl-item__arrow" aria-hidden="true">→</span>');
          items.appendChild(item);
        });
        list.appendChild(row);
      });
      timeline.appendChild(list);
    };

    const markEarlierWorkRowStart = () => {
      grid.querySelectorAll('.card-small--row-start').forEach((el) => el.classList.remove('card-small--row-start'));
      const firstSmall = Array.from(grid.querySelectorAll('.card-small')).find((el) => !el.hidden);
      if (firstSmall) firstSmall.classList.add('card-small--row-start');
    };

    const render = () => {
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === focus)));
      const showTimeline = focus === TIMELINE_TAB && !!timeline;
      if (timeline) timeline.hidden = !showTimeline;
      grid.hidden = showTimeline;
      grid.querySelectorAll('[data-tags]').forEach((card) => {
        card.hidden = !tagsOf(card).includes(focus);
        const slot = (card.getAttribute('data-order') || '').split(/\s+/).find((pair) => pair.startsWith(`${focus}:`));
        card.style.order = slot ? slot.split(':')[1] : '';
      });
      markEarlierWorkRowStart();
    };

    const writeUrl = () => {
      const query = focus === DEFAULT ? '' : `?filter=${focus}`;
      window.history.replaceState(null, '', window.location.pathname + query);
    };

    const readUrl = () => {
      const params = new URLSearchParams(window.location.search);
      let next = (params.get('filter') || window.location.hash.replace(/^#/, '') || DEFAULT).toLowerCase();
      if (LEGACY[next]) next = LEGACY[next];
      focus = chips.some((c) => c.getAttribute('data-filter') === next) ? next : DEFAULT;
    };

    chips.forEach((chip) => chip.addEventListener('click', () => {
      focus = chip.getAttribute('data-filter');
      render();
      writeUrl();
      const target = focus === TIMELINE_TAB && timeline ? timeline : grid;
      const top = target.getBoundingClientRect().top + window.scrollY - filterContainer.offsetHeight - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 65) - 24;
      if (window.scrollY > top) window.scrollTo(0, Math.max(0, top));
    }));

    const init = () => {
      readUrl();
      render();
      writeUrl();
    };

    if (grid) {
      buildTimeline();
      init();
      window.addEventListener('popstate', init);
      window.addEventListener('pageshow', (event) => { if (event.persisted) init(); });
    }
  }

  // ----------------------------------------------------------------
  // Case-study chrome: measure sticky header, scrollspy active state,
  // and keep the horizontal chip strip in view below 1100px.
  // ----------------------------------------------------------------
  const caseHeader = document.querySelector('.site-header');
  const caseRail = document.querySelector('.scrollspy');
  if (caseHeader || caseRail) {
    const root = document.documentElement;
    const setVar = (name, el) => {
      if (!el) return;
      const h = Math.floor(el.getBoundingClientRect().height);
      if (h > 0) root.style.setProperty(name, `${h}px`);
    };
    const measure = () => {
      setVar('--header-h', caseHeader);
      setVar('--spy-h', caseRail);
    };
    measure();
    window.addEventListener('load', measure);
    window.addEventListener('resize', measure, { passive: true });
  }

  if (caseRail) {
    const list = caseRail.querySelector('.scrollspy__list') || caseRail;
    const links = Array.from(caseRail.querySelectorAll('a.list'));
    const sections = links
      .map((link) => {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#') || href === '#top') return null;
        const el = document.getElementById(href.slice(1));
        return el ? { el, link } : null;
      })
      .filter(Boolean);

    const centreActive = () => {
      if (list.scrollWidth <= list.clientWidth + 4) return;
      const active = caseRail.querySelector('a.list.active');
      if (!active) return;
      const want = active.offsetLeft - (list.clientWidth - active.offsetWidth) / 2;
      const left = Math.max(0, Math.min(want, list.scrollWidth - list.clientWidth));
      if (Math.abs(list.scrollLeft - left) < 2) return;
      list.scrollTo({ left, behavior: 'smooth' });
    };

    const onScroll = () => {
      /* Presentation mode owns the active rail item (one slide at a time).
         Hidden slides measure as top:0 and would steal the highlight. */
      if (sections.length && document.documentElement.getAttribute('data-pres') !== 'on') {
        let current = sections[0];
        for (let i = 0; i < sections.length; i++) {
          const smt = parseFloat(getComputedStyle(sections[i].el).scrollMarginTop) || 0;
          if (sections[i].el.getBoundingClientRect().top <= Math.max(140, smt + 8)) {
            current = sections[i];
          }
        }
        links.forEach((l) => l.classList.remove('active'));
        current.link.classList.add('active');
      }
      const stuckAt = parseFloat(getComputedStyle(caseRail).top) || 0;
      caseRail.classList.toggle(
        'is-stuck',
        caseRail.getBoundingClientRect().top <= stuckAt + 1
      );
      centreActive();
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
  }

  // Case-study hero: "Back" returns to the previous in-site page (preserves work filters).
  const caseBackLink = document.querySelector('.case-back__link');
  if (caseBackLink) {
    const canUseHistoryBack = () => {
      if (window.history.length <= 1) return false;
      let referrer = '';
      try {
        referrer = document.referrer || '';
      } catch (_) {}
      if (!referrer) return true;
      try {
        const refUrl = new URL(referrer, location.href);
        return refUrl.origin === location.origin || refUrl.protocol === 'file:';
      } catch (_) {
        return false;
      }
    };

    caseBackLink.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      if (!canUseHistoryBack()) return;
      event.preventDefault();
      history.back();
    });
  }

  // Homepage: "Selected work" scrolls to the section below the intro.
  const selectedWork = document.getElementById('selected-work');
  if (selectedWork) {
    document.querySelectorAll('a[href="#selected-work"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        selectedWork.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', '#selected-work');
      });
    });
  }

  // ----------------------------------------------------------------
  // Password gate (case-study NDA pages). Preserves prior behaviour.
  // ----------------------------------------------------------------
  const submitButton = document.getElementById('submit');
  const passwordInput = document.getElementById('password');
  const passwordLayer = document.getElementById('passwordlayer');

  if (submitButton && passwordInput && passwordLayer) {
    const unlock = (event) => {
      if (event) event.preventDefault();
      if (passwordInput.value === 'qinwang') {
        passwordLayer.style.display = 'none';
      } else {
        passwordInput.setAttribute('aria-invalid', 'true');
      }
    };
    submitButton.addEventListener('click', unlock);
    passwordInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') unlock(event);
    });
  }
})();
