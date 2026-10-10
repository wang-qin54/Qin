// ------------------------------------------------------------------
// Shared site header. Cite it from any page:
//
//   <script src="site-chrome.js?v=4"></script>
//   ...
//   <site-header></site-header>
//
// Edit THIS file to change nav for the whole site. Optional:
//   <site-header current="work|about"></site-header>
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
                <span class="brand__role">Senior product designer / Lead designer</span>
            </a>
            <div class="site-header__end">
                <nav class="site-nav" aria-label="Primary">
                    ${navLink('index.html', 'work', 'Portfolio', current)}
                    ${navLink('about.html', 'about', 'About me', current)}
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
            <a href="index.html" role="menuitem">Portfolio</a>
            <a href="about.html" role="menuitem">About me</a>
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

// ------------------------------------------------------------------
// Image lightbox. Content images open in an overlay on the same page.
// Opt out with data-no-zoom on the image or any ancestor (pages with
// their own viewer, e.g. Asset, mark themselves this way).
// Images inside a link only open here when the link points at an image.
// ------------------------------------------------------------------
(function () {
  if (window.__siteLightbox) return;
  window.__siteLightbox = true;

  const IMAGE_HREF = /\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i;
  const MIN_SIZE = 120;

  const css = [
    '.lbx-zoom { cursor: zoom-in; }',
    'html.lbx-lock { overflow: hidden; }',
    '.lbx { padding: 0; border: 0; margin: 0; width: 100vw; height: 100vh; max-width: none; max-height: none; background: transparent; overflow: hidden; }',
    '.lbx::backdrop { background: rgba(10, 10, 12, 0.86); }',
    '.lbx[open] { display: flex; flex-direction: column; align-items: center; justify-content: center; animation: lbx-in 0.18s ease-out; }',
    '@keyframes lbx-in { from { opacity: 0; } to { opacity: 1; } }',
    '.lbx__stage { flex: 1 1 auto; min-height: 0; width: 100%; display: flex; align-items: center; justify-content: center; padding: 64px 24px 16px; box-sizing: border-box; overflow: auto; }',
    '.lbx__img { display: block; max-width: min(100%, 1600px); max-height: 100%; width: auto; height: auto; object-fit: contain; border-radius: 8px; background: #fff; box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45); cursor: zoom-out; }',
    '.lbx--tall .lbx__stage { align-items: flex-start; }',
    '.lbx--tall .lbx__img { max-height: none; width: min(100%, 1100px); }',
    '.lbx__cap { flex: 0 0 auto; max-width: min(760px, calc(100vw - 48px)); margin: 0; padding: 0 0 24px; font-size: 13px; line-height: 1.55; color: rgba(255, 255, 255, 0.78); text-align: center; }',
    '.lbx__cap:empty { display: none; }',
    '.lbx__close { position: fixed; top: 16px; right: 16px; z-index: 1; width: 40px; height: 40px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 999px; background: rgba(255, 255, 255, 0.14); color: #fff; cursor: pointer; transition: background 0.15s; }',
    '.lbx__close:hover, .lbx__close:focus-visible { background: rgba(255, 255, 255, 0.28); outline: none; }',
    '.lbx__close svg { width: 18px; height: 18px; }',
    '.lbx__nav { position: fixed; top: 50%; z-index: 1; width: 48px; height: 48px; margin-top: -24px; display: inline-flex; align-items: center; justify-content: center; border: 0; border-radius: 999px; background: rgba(255, 255, 255, 0.14); color: #fff; cursor: pointer; transition: background 0.15s, opacity 0.15s; }',
    '.lbx__nav:hover, .lbx__nav:focus-visible { background: rgba(255, 255, 255, 0.28); outline: none; }',
    '.lbx__nav:disabled { opacity: 0.25; cursor: default; background: rgba(255, 255, 255, 0.14); }',
    '.lbx__nav svg { width: 22px; height: 22px; }',
    '.lbx__nav--prev { left: 16px; }',
    '.lbx__nav--next { right: 16px; }',
    '.lbx--single .lbx__nav, .lbx--single .lbx__count { display: none; }',
    '.lbx--multi .lbx__stage { padding-left: 80px; padding-right: 80px; }',
    '.lbx__count { position: fixed; top: 26px; left: 50%; transform: translateX(-50%); margin: 0; font-size: 13px; font-variant-numeric: tabular-nums; color: rgba(255, 255, 255, 0.7); }',
    '@media (max-width: 720px) { .lbx__stage, .lbx--multi .lbx__stage { padding: 60px 12px 72px; } .lbx__cap { font-size: 12px; padding-bottom: 16px; } .lbx__nav { top: auto; bottom: 16px; margin-top: 0; width: 44px; height: 44px; } .lbx__nav--prev { left: calc(50% - 56px); } .lbx__nav--next { right: calc(50% - 56px); } .lbx--multi .lbx__cap { padding-bottom: 76px; } }',
  ].join('');

  const CHEVRON = (d) => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="' + d + '"/></svg>';

  let dlg, imgEl, capEl, countEl, prevBtn, nextBtn, lastFocus;
  let group = [];
  let at = -1;

  function build() {
    const style = document.createElement('style');
    style.id = 'site-lightbox-css';
    style.textContent = css;
    document.head.appendChild(style);

    dlg = document.createElement('dialog');
    dlg.className = 'lbx';
    dlg.setAttribute('aria-label', 'Enlarged image');
    dlg.innerHTML =
      '<button type="button" class="lbx__close" aria-label="Close">' +
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
      '</button>' +
      '<button type="button" class="lbx__nav lbx__nav--prev" aria-label="Previous image">' + CHEVRON('M15 5l-7 7 7 7') + '</button>' +
      '<button type="button" class="lbx__nav lbx__nav--next" aria-label="Next image">' + CHEVRON('M9 5l7 7-7 7') + '</button>' +
      '<p class="lbx__count" aria-live="polite"></p>' +
      '<div class="lbx__stage"><img class="lbx__img" alt=""></div>' +
      '<p class="lbx__cap"></p>';
    document.body.appendChild(dlg);
    imgEl = dlg.querySelector('.lbx__img');
    capEl = dlg.querySelector('.lbx__cap');
    countEl = dlg.querySelector('.lbx__count');
    prevBtn = dlg.querySelector('.lbx__nav--prev');
    nextBtn = dlg.querySelector('.lbx__nav--next');
    prevBtn.addEventListener('click', () => step(-1));
    nextBtn.addEventListener('click', () => step(1));
    document.addEventListener('keydown', (e) => {
      if (!dlg.open) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });

    dlg.querySelector('.lbx__close').addEventListener('click', close);
    imgEl.addEventListener('click', close);
    dlg.addEventListener('click', (e) => {
      if (e.target === dlg || e.target.classList.contains('lbx__stage')) close();
    });
    dlg.addEventListener('close', () => {
      document.documentElement.classList.remove('lbx-lock');
      imgEl.removeAttribute('src');
      const back = group[at] || lastFocus;
      if (back && document.contains(back)) back.focus({ preventScroll: true });
      group = [];
      at = -1;
    });
  }

  function captionFor(img) {
    const fig = img.closest('figure');
    const fc = fig && fig.querySelector('figcaption');
    if (fc && fc.textContent.trim()) return fc.textContent.trim();
    const next = (img.closest('a') || img).parentElement;
    const sib = next && next.nextElementSibling;
    if (sib && /cap/i.test(sib.className) && sib.textContent.trim().length < 400) return sib.textContent.trim();
    return '';
  }

  function visible(img) {
    return img.getClientRects().length > 0 && getComputedStyle(img).visibility !== 'hidden' && !img.closest('details:not([open])');
  }

  function open(img) {
    if (!dlg) build();
    lastFocus = img;
    group = [...document.querySelectorAll('img.lbx-zoom')].filter((el) => eligible(el) && visible(el));
    if (!group.includes(img)) group = [img];
    dlg.classList.toggle('lbx--multi', group.length > 1);
    dlg.classList.toggle('lbx--single', group.length < 2);
    show(group.indexOf(img));
    document.documentElement.classList.add('lbx-lock');
    if (!dlg.open) dlg.showModal();
  }

  function step(dir) {
    if (!dlg || !dlg.open) return;
    show(at + dir);
  }

  function show(i) {
    if (i < 0 || i >= group.length) return;
    at = i;
    const img = group[i];
    const a = imageLink(img);
    const src = a ? a.href : null;
    const w = img.naturalWidth || parseInt(img.getAttribute('width'), 10) || 0;
    const h = img.naturalHeight || parseInt(img.getAttribute('height'), 10) || 0;
    const viewRatio = window.innerHeight / window.innerWidth;
    dlg.classList.toggle('lbx--tall', w > 0 && h / w > Math.max(1.4, viewRatio * 1.6));
    imgEl.src = src || img.currentSrc || img.src;
    imgEl.alt = img.alt || '';
    capEl.textContent = captionFor(img);
    countEl.textContent = group.length > 1 ? (i + 1) + ' / ' + group.length : '';
    const lost = document.activeElement;
    prevBtn.disabled = i <= 0;
    nextBtn.disabled = i >= group.length - 1;
    if (lost && lost.disabled) (lost === prevBtn ? nextBtn : prevBtn).focus();
    dlg.querySelector('.lbx__stage').scrollTop = 0;
  }

  function close() {
    if (dlg && dlg.open) dlg.close();
  }

  function imageLink(img) {
    const a = img.closest('a');
    if (!a) return null;
    const href = a.getAttribute('href') || '';
    return IMAGE_HREF.test(href) ? a : false;
  }

  function eligible(img) {
    if (img.closest('[data-no-zoom], site-header, header, footer, nav, button, .lbx')) return false;
    if (img.classList.contains('zoomable')) return false;
    if (imageLink(img) === false) return false;
    const w = parseInt(img.getAttribute('width'), 10);
    if (w && w < MIN_SIZE) return false;
    return true;
  }

  function mark(root) {
    (root || document).querySelectorAll('img').forEach((img) => {
      if (img.dataset.lbx) return;
      if (!eligible(img)) return;
      img.dataset.lbx = '1';
      img.classList.add('lbx-zoom');
      if (!imageLink(img)) {
        img.setAttribute('tabindex', '0');
        img.setAttribute('role', 'button');
        img.setAttribute('aria-haspopup', 'dialog');
      }
    });
  }

  function targetImage(e) {
    const img = e.target.closest && e.target.closest('img.lbx-zoom');
    if (!img || !eligible(img)) return null;
    const rect = img.getBoundingClientRect();
    if (rect.width < 64 && rect.height < 64) return null;
    return img;
  }

  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const img = targetImage(e);
    if (!img) return;
    e.preventDefault();
    open(img);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const img = targetImage(e);
    if (!img) return;
    e.preventDefault();
    open(img);
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => mark());
  else mark();
  window.addEventListener('load', () => mark());
})();
