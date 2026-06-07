// ------------------------------------------------------------------
// Qin Wang portfolio · shared interactions
// ------------------------------------------------------------------

(function () {
  // Mobile menu toggle (works with both the new <button id="hamburger-menu-icon">
  // and the legacy <li id="hamburger-menu-icon">).
  const toggle = document.getElementById('hamburger-menu-icon');
  const menu = document.getElementById('menu');

  if (toggle && menu) {
    const open = () => {
      menu.setAttribute('data-open', 'true');
      menu.style.display = 'flex';
      toggle.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      menu.setAttribute('data-open', 'false');
      menu.style.display = 'none';
      toggle.setAttribute('aria-expanded', 'false');
    };

    toggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = menu.getAttribute('data-open') === 'true';
      if (isOpen) close(); else open();
    });

    document.addEventListener('click', (event) => {
      if (menu.getAttribute('data-open') !== 'true') return;
      if (menu.contains(event.target) || toggle.contains(event.target)) return;
      close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  }

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

    const applyFilter = (filter) => {
      const isAll = filter === 'all';

      if (curatedGrid) curatedGrid.hidden = !isAll;
      if (timelineGrid) timelineGrid.hidden = isAll;

      if (isAll || !timelineGrid) return;

      timelineGrid.querySelectorAll('[data-tags]').forEach((card) => {
        const tags = (card.getAttribute('data-tags') || '')
          .toLowerCase()
          .split(',')
          .map((t) => t.trim());
        card.hidden = !tags.includes(filter);
      });

      updateSectionVisibility(timelineGrid);
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
