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
    const chips = filterContainer.querySelectorAll('[data-filter]');
    const cards = document.querySelectorAll('[data-tags]');

    const applyFilter = (filter) => {
      cards.forEach((card) => {
        const tags = (card.getAttribute('data-tags') || '').toLowerCase().split(',').map((t) => t.trim());
        const match = filter === 'all' || tags.includes(filter);
        card.hidden = !match;
      });

      // Section headings: hide if every following card up to the next heading
      // is hidden.
      document.querySelectorAll('[data-filter-section]').forEach((heading) => {
        let next = heading.nextElementSibling;
        let anyVisible = false;
        while (next && !next.hasAttribute('data-filter-section')) {
          if (next.hasAttribute('data-tags') && !next.hidden) {
            anyVisible = true;
            break;
          }
          next = next.nextElementSibling;
        }
        heading.hidden = !anyVisible;
      });
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
      const hash = window.location.hash.replace(/^#/, '').toLowerCase();
      if (hash) return hash;
      const fromQuery = new URLSearchParams(window.location.search)
        .get('filter')
        ?.toLowerCase();
      return fromQuery || '';
    };

    const applyFilterFromUrl = (scrollToSection) => {
      const filter = getFilterFromUrl();
      if (!filter) return false;

      const chip = Array.from(chips).find(
        (c) => c.getAttribute('data-filter') === filter
      );
      if (!chip) return false;

      setActiveFilter(filter);

      if (scrollToSection) {
        const section = document.getElementById(filter);
        if (section) {
          requestAnimationFrame(() => {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }
      }
      return true;
    };

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const filter = chip.getAttribute('data-filter');
        setActiveFilter(filter);
        const path = window.location.pathname;
        if (filter && filter !== 'all') {
          window.history.replaceState(null, '', `${path}?filter=${filter}#${filter}`);
        } else {
          window.history.replaceState(null, '', path);
        }
      });
    });

    const initFiltersFromUrl = () => applyFilterFromUrl(true);

    initFiltersFromUrl();
    window.addEventListener('hashchange', () => applyFilterFromUrl(false));
    window.addEventListener('popstate', () => applyFilterFromUrl(false));
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
