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

    const chips = filterContainer.querySelectorAll('[data-filter]');
    const recentGrid = document.querySelector('[data-filter-layout="recent"]');
    const curatedGrid = document.querySelector('[data-filter-layout="all"]');
    const timelineGrid = document.querySelector('[data-filter-layout="timeline"]');

    const updateSectionVisibility = (root) => {
      if (!root) return;

      let firstVisibleHeading = true;

      root.querySelectorAll('[data-filter-section]').forEach((heading) => {
        let next = heading.nextElementSibling;
        let anyVisible = false;
        const boundElements = [];

        while (next && !next.hasAttribute('data-filter-section')) {
          if (next.classList.contains('work-section-intro')) {
            boundElements.push(next);
          }
          if (next.hasAttribute('data-tags') && !next.hidden) {
            anyVisible = true;
          }
          next = next.nextElementSibling;
        }

        heading.hidden = !anyVisible;
        heading.classList.toggle('section-title--first-visible', anyVisible && firstVisibleHeading);
        if (anyVisible) firstVisibleHeading = false;

        boundElements.forEach((el) => {
          el.hidden = !anyVisible;
        });
      });
    };

    // Earlier-work cards stay compact (span-3). In the flat filtered grid we
    // tag the first visible small card so CSS can break it onto its own row,
    // keeping the cluster from stranding beside a half-width card.
    const markEarlierWorkRowStart = (root) => {
      if (!root) return;
      root.querySelectorAll('.card-small--row-start').forEach((el) =>
        el.classList.remove('card-small--row-start')
      );
      const firstVisibleSmall = Array.from(
        root.querySelectorAll('.card-small')
      ).find((el) => !el.hidden);
      if (firstVisibleSmall) firstVisibleSmall.classList.add('card-small--row-start');
    };

    const updateEarlierWorkLabel = (root, { forceShow } = {}) => {
      if (!root) return;
      const heading = root.querySelector('[data-earlier-work-section]');
      const intro = root.querySelector('[data-earlier-work-intro]');
      if (!heading) return;

      const anyVisibleSmall = Array.from(root.querySelectorAll('.card-small')).some(
        (el) => !el.hidden
      );
      const show = forceShow === undefined ? anyVisibleSmall : forceShow;
      heading.hidden = !show;
      if (intro) intro.hidden = !show;

      if (show) {
        const anyVisibleLarge = Array.from(root.querySelectorAll('a.card[data-tags]')).some(
          (el) => !el.hidden
        );
        heading.classList.toggle('section-title--first-visible', !anyVisibleLarge);
      } else {
        heading.classList.remove('section-title--first-visible');
      }
    };

    const applyFilter = (filter) => {
      if (filter === 'recent') filter = 'all';
      const isAll = filter === 'all';
      const isRecent = false;

      if (recentGrid) recentGrid.hidden = !isRecent;
      if (curatedGrid) curatedGrid.hidden = !isAll;
      if (timelineGrid) timelineGrid.hidden = isAll || isRecent;

      if (isAll || isRecent || !timelineGrid) {
        // Restore section headings for next time timeline is used
        if (timelineGrid) {
          timelineGrid.querySelectorAll('[data-filter-section]').forEach((h) => {
            h.hidden = false;
            h.classList.remove('section-title--first-visible');
          });
          timelineGrid.querySelectorAll('[data-earlier-work-intro]').forEach((intro) => {
            intro.hidden = false;
          });
          updateSectionVisibility(timelineGrid);
          markEarlierWorkRowStart(timelineGrid);
        }
        return;
      }

      // Hide category headings — filtered view is a flat card grid
      timelineGrid.querySelectorAll('[data-filter-section]:not([data-earlier-work-section])').forEach((h) => {
        h.hidden = true;
        h.classList.remove('section-title--first-visible');
        const intro = h.nextElementSibling;
        if (intro && intro.classList.contains('work-section-intro')) intro.hidden = true;
      });

      timelineGrid.querySelectorAll('[data-tags]').forEach((card) => {
        const tags = (card.getAttribute('data-tags') || '')
          .toLowerCase()
          .split(',')
          .map((t) => t.trim());
        card.hidden = !tags.includes(filter);
      });

      updateEarlierWorkLabel(timelineGrid);
      markEarlierWorkRowStart(timelineGrid);
    };

    const setActiveFilter = (filter) => {
      const normalized = (filter || 'all').toLowerCase();
      const chip = Array.from(chips).find(
        (c) => c.getAttribute('data-filter') === normalized
      );
      if (!chip) return;

      chips.forEach((c) => c.setAttribute('aria-pressed', 'false'));
      chip.setAttribute('aria-pressed', 'true');
      applyFilter(normalized);
    };

    const getFilterFromUrl = () => {
      const fromQuery = new URLSearchParams(window.location.search)
        .get('filter')
        ?.toLowerCase();
      if (fromQuery) return fromQuery;

      // Legacy hash URLs (?filter=crypto#crypto) — read once, no scroll.
      const fromHash = window.location.hash.replace(/^#/, '').toLowerCase();
      return fromHash || '';
    };

    const applyFilterFromUrl = () => {
      const filter = getFilterFromUrl();
      if (!filter) return false;

      const chip = Array.from(chips).find(
        (c) => c.getAttribute('data-filter') === filter
      );
      if (!chip) return false;

      setActiveFilter(filter);
      if (filter !== 'all') updateFilterUrl(filter);
      return true;
    };

    const updateFilterUrl = (filter) => {
      const path = window.location.pathname;
      if (filter && filter !== 'all') {
        window.history.replaceState(null, '', `${path}?filter=${filter}`);
      } else {
        window.history.replaceState(null, '', path);
      }
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const filter = chip.getAttribute('data-filter');
        setActiveFilter(filter);
        updateFilterUrl(filter);
        window.scrollTo(0, 0);
      });
    });

    const initFiltersFromUrl = () => applyFilterFromUrl();

    initFiltersFromUrl();
    window.addEventListener('popstate', () => applyFilterFromUrl());
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) initFiltersFromUrl();
    });
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
      if (sections.length) {
        const y = window.scrollY + 140;
        let current = sections[0];
        for (let i = 0; i < sections.length; i++) {
          if (sections[i].el.getBoundingClientRect().top + window.scrollY <= y) {
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
