// ------------------------------------------------------------------
// Shared site header. Cite it from any page:
//
//   <script src="site-chrome.js?v=4"></script>
//   ...
//   <site-header></site-header>
//
// Edit THIS file to change nav for the whole site. Optional:
//   <site-header current="home|work|about"></site-header>
//   <site-header lang-switch></site-header>   EN / 中文, off by default
//   <site-header progress></site-header>      reading-progress bar
// If current is omitted, it is inferred from the URL.
// ------------------------------------------------------------------

(function () {
  if (customElements.get('site-header')) return;

  const MARK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="10" cy="12" r="6.6"/><path d="M14 17.1H20.5"/></svg>';
  const LINKEDIN =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.4 20.4h-3.6v-5.6c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.7-1.9 3.4-1.9 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.4H3.5V9h3.6v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.5C0 23.2.8 24 1.8 24h20.4c1 0 1.8-.8 1.8-1.8V1.7C24 .8 23.2 0 22.2 0z"/></svg>';
  const MEDIUM =
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 12c0 3.6-3 6.5-6.8 6.5S0 15.6 0 12s3-6.5 6.8-6.5S13.5 8.4 13.5 12zm7.4 0c0 3.4-1.5 6.1-3.4 6.1-1.9 0-3.4-2.7-3.4-6.1s1.5-6.1 3.4-6.1c1.9 0 3.4 2.7 3.4 6.1zM24 12c0 3-.5 5.5-1.2 5.5-.7 0-1.2-2.5-1.2-5.5s.5-5.5 1.2-5.5c.7 0 1.2 2.5 1.2 5.5z"/></svg>';
  const MENU_ICON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';

  if (!document.getElementById('site-chrome-css')) {
    const style = document.createElement('style');
    style.id = 'site-chrome-css';
    style.textContent = [
      'site-header { display: block; }',
      '.langsw { display: inline-flex; align-items: center; flex: 0 0 auto; margin-left: var(--space-2, 8px); padding-left: var(--space-3, 12px); border-left: 1px solid var(--border, #ececec); }',
      '.langsw button { border: 0; background: none; cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 500; line-height: 1; color: var(--text-tertiary, #8a8a8a); padding: 6px 7px; border-radius: var(--radius-sm, 8px); }',
      '.langsw button:hover { color: var(--text-primary, #111); }',
      '.langsw button.on { color: var(--text-primary, #111); font-weight: 600; }',
      '.prog { position: absolute; left: 0; right: 0; bottom: -1px; height: 2px; z-index: 2; background: var(--border, #ececec); pointer-events: none; }',
      '.prog i { display: block; height: 100%; width: 0; background: var(--accent, #0034f0); }',
    ].join('');
    document.head.appendChild(style);
  }

  const flagOn = (el, name) => {
    if (!el.hasAttribute(name)) return false;
    const value = el.getAttribute(name);
    return value === '' || value === name || value === 'true';
  };

  const inferCurrent = () => {
    const file = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if (file === '' || file === 'index.html') return 'home';
    if (file === 'about.html') return 'about';
    return 'work';
  };

  const navLink = (href, id, label, current) => {
    const active = current === id ? ' aria-current="page"' : '';
    return `<a href="${href}" class="site-nav__link"${active}>${label}</a>`;
  };

  class SiteHeader extends HTMLElement {
    connectedCallback() {
      if (this._rendered) return;
      this._rendered = true;
      this.classList.add('site-header');

      const current = (this.getAttribute('current') || inferCurrent()).toLowerCase();
      const langSwitch = flagOn(this, 'lang-switch');
      const progress = flagOn(this, 'progress');

      const langMarkup = langSwitch
        ? `<div class="langsw" role="group" aria-label="Language / 语言">
                <button type="button" data-lang="en" class="on" aria-pressed="true">EN</button>
                <button type="button" data-lang="zh" aria-pressed="false">中文</button>
            </div>`
        : '';

      const progressMarkup = progress
        ? `<div class="prog" aria-hidden="true"><i id="progbar"></i></div>`
        : '';

      this.innerHTML = `
        <div class="site-header__inner">
            <a href="index.html" class="brand" aria-label="Qin Wang — home">
                <span class="brand__mark" aria-hidden="true">${MARK}</span>
                <span>Qin Wang</span>
                <span class="brand__role">Senior product designer / design lead</span>
            </a>
            <div class="site-header__end">
                <nav class="site-nav" aria-label="Primary">
                    ${navLink('index.html', 'home', 'Home', current)}
                    ${navLink('work.html', 'work', 'Work', current)}
                    ${navLink('about.html', 'about', 'About', current)}
                    <span class="site-nav__divider" aria-hidden="true"></span>
                </nav>
                <a class="icon-link" href="https://www.linkedin.com/in/qinwangux/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">${LINKEDIN}</a>
                <a class="icon-link" href="https://medium.com/@qinwangux" target="_blank" rel="noopener noreferrer" aria-label="Medium">${MEDIUM}</a>
                ${langMarkup}
                <button type="button" class="menu-toggle" id="hamburger-menu-icon" aria-expanded="false" aria-controls="menu" aria-label="Open menu">
                    ${MENU_ICON}
                </button>
            </div>
        </div>
        <div id="menu" role="menu">
            <a href="index.html" role="menuitem">Home</a>
            <a href="work.html" role="menuitem">Work</a>
            <a href="about.html" role="menuitem">About</a>
        </div>
        ${progressMarkup}
      `;

      this.bindMenu();
    }

    bindMenu() {
      const toggle = this.querySelector('#hamburger-menu-icon');
      const menu = this.querySelector('#menu');
      if (!toggle || !menu) return;

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
        if (isOpen) close();
        else open();
      });

      document.addEventListener('click', (event) => {
        if (menu.getAttribute('data-open') !== 'true') return;
        if (menu.contains(event.target) || toggle.contains(event.target)) return;
        close();
      });

      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth > 960) close();
      });
    }
  }

  customElements.define('site-header', SiteHeader);
})();
