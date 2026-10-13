(function () {
    const versions = window.resumeVersions || {};
    const root = document.getElementById('cv-root');
    const titleEn = document.title;
    const languageToggle = document.getElementById('language-toggle');
    const back = document.getElementById('back-to-portfolio');
    let version = '01';
    let resumeTranslations = {};

    function renderVersion(id) {
        const template = document.getElementById('cv-' + id);
        if (!template || !root) return;
        version = id;
        resumeTranslations = versions[id] || {};
        root.innerHTML = template.innerHTML;
        document.querySelectorAll('.cv-tabs a').forEach(function (tab) {
            if (tab.dataset.version === id) tab.setAttribute('aria-current', 'page');
            else tab.removeAttribute('aria-current');
        });
    }

    const requested = new URLSearchParams(location.search).get('v');
    renderVersion(requested && document.getElementById('cv-' + requested) ? requested : '01');

    document.querySelectorAll('.cv-tabs a').forEach(function (tab) {
        tab.addEventListener('click', function (event) {
            event.preventDefault();
            renderVersion(tab.dataset.version);
            const url = new URL(location.href);
            url.searchParams.delete('lang');
            if (version === '01') url.searchParams.delete('v');
            else url.searchParams.set('v', version);
            history.replaceState(null, '', url);
            setLanguage(document.documentElement.lang === 'zh-CN' ? 'zh' : 'en');
        });
    });

    function setCollection(selector, values) {
        document.querySelectorAll(selector).forEach(function (element, index) {
            if (!element.dataset.en) element.dataset.en = element.innerHTML;
            element.innerHTML = values ? values[index] : element.dataset.en;
        });
    }

    function setSingle(selector, value) {
        const element = document.querySelector(selector);
        if (!element) return;
        if (!element.dataset.en) element.dataset.en = element.innerHTML;
        element.innerHTML = value != null ? value : element.dataset.en;
    }

    function setLanguage(language) {
        const copy = language === 'zh' ? resumeTranslations.zh : null;
        document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
        document.title = copy ? copy.title : titleEn;
        setSingle('.eyebrow', copy ? copy.eyebrow : null);
        setSingle('.subtitle', copy ? copy.subtitle : null);
        setCollection('.section-title', copy ? copy.sections : null);
        setCollection('.role-org', copy ? copy.orgs : null);
        setCollection('.role-scope', copy ? copy.scopes : null);
        setCollection('.role li', copy ? copy.bullets : null);
        setCollection('.side-list li', copy ? copy.skills : null);
        setCollection('.degree', copy ? copy.degrees : null);
        setSingle('.portfolio-title', copy ? copy.portfolioTitle : null);
        setSingle('.portfolio-access', copy ? copy.portfolioAccess : null);
        setCollection('.work-meta', copy ? copy.workMeta : null);
        setCollection('.work-title', copy ? copy.workTitle : null);
        setCollection('.work-outcome', copy ? copy.workOutcome : null);
        document.querySelectorAll('.cv-tabs a').forEach(function (tab) {
            if (!tab.dataset.en) tab.dataset.en = tab.textContent;
            tab.textContent = copy ? tab.dataset.zh : tab.dataset.en;
        });
        if (languageToggle) {
            languageToggle.textContent = language === 'zh' ? 'EN' : '中文';
            languageToggle.setAttribute('aria-label', language === 'zh' ? '切换至英文简历' : '切换至中文简历');
        }
        localStorage.setItem('resume-language', language);
        syncPreviewPages();
    }

    function syncPreviewPages() {
        const page = document.querySelector('.page');
        const ruler = document.getElementById('a4-ruler');
        const zh = document.documentElement.lang === 'zh-CN';
        const breakEl = document.querySelector(zh ? '.role--page-two-zh' : '.role--page-two');
        if (!page || !ruler || !breakEl) return;

        let gap = document.getElementById('preview-page-gap');
        if (!gap) {
            gap = document.createElement('div');
            gap.id = 'preview-page-gap';
            gap.setAttribute('aria-hidden', 'true');
            gap.innerHTML = '<div class="preview-page-rest"></div><div class="preview-page-cut"></div>';
        }
        breakEl.parentNode.insertBefore(gap, breakEl);
        page.style.paddingBottom = '';
        gap.querySelector('.preview-page-rest').style.height = '0px';

        const pageH = ruler.getBoundingClientRect().height;
        const cut = gap.querySelector('.preview-page-cut');
        const cutH = cut.getBoundingClientRect().height;
        const used = breakEl.getBoundingClientRect().top - page.getBoundingClientRect().top - cutH;
        gap.querySelector('.preview-page-rest').style.height = Math.max(0, pageH - used) + 'px';

        const page2Start = breakEl.getBoundingClientRect().top - page.getBoundingClientRect().top;
        const page2Used = page.scrollHeight - page2Start;
        page.style.paddingBottom = Math.max(0, pageH - page2Used) + 'px';
    }

    if (languageToggle) {
        const savedLanguage = localStorage.getItem('resume-language');
        if (new URLSearchParams(location.search).get('lang') === 'zh' || savedLanguage === 'zh') setLanguage('zh');
        languageToggle.addEventListener('click', function () {
            setLanguage(document.documentElement.lang === 'zh-CN' ? 'en' : 'zh');
        });
    }

    if (back) {
        let sameOrigin = false;
        try {
            const ref = new URL(document.referrer);
            sameOrigin = ref.origin === location.origin && !/\/resume[\w-]*\.html$/.test(ref.pathname);
        } catch (e) {
            sameOrigin = false;
        }
        if (sameOrigin) {
            back.addEventListener('click', function (event) {
                event.preventDefault();
                history.back();
            });
        }
    }

    function savePdf() {
        const label = { '02': 'Financial Products ', '03': 'Enterprise ', '04': 'DL ' }[version] || '';
        const lang = document.documentElement.lang === 'zh-CN' ? 'CN' : 'EN';

        document.body.classList.add('force-print-desktop');
        const previousTitle = document.title;
        // Suggested filename in the system Save dialog
        document.title = 'Qin CV ' + label + lang;

        const cleanup = function () {
            document.title = previousTitle;
            document.body.classList.remove('force-print-desktop');
            window.removeEventListener('afterprint', cleanup);
            syncPreviewPages();
        };

        window.addEventListener('afterprint', cleanup);
        setTimeout(cleanup, 60 * 1000);
        // Opens the system print dialog — choose "Save as PDF" to pick a location
        window.print();
    }

    const saveButton = document.getElementById('save-pdf');
    if (saveButton) saveButton.addEventListener('click', savePdf);

    function schedulePreviewPages() {
        syncPreviewPages();
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(syncPreviewPages);
    }
    window.addEventListener('load', schedulePreviewPages);
    window.addEventListener('resize', syncPreviewPages);
    window.addEventListener('beforeprint', function () {
        const page = document.querySelector('.page');
        if (page) page.style.paddingBottom = '';
    });
    schedulePreviewPages();

    if (new URLSearchParams(window.location.search).has('pdf')) {
        window.addEventListener('load', function () {
            setTimeout(savePdf, 400);
        });
    }
})();
