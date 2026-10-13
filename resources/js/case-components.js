/* Case-study component behaviour. Pairs with resources/css/case-components.css.
   Load at the end of <body>, after main.js. Pages that still carry these scripts inline
   must not load this file as well, or every connector is drawn twice. */

/* Annotated screen (.db-anno): pins on the screen, notes in the gutter, curved links between them */
(function () {
    var NS = 'http://www.w3.org/2000/svg';
    document.querySelectorAll('.db-anno').forEach(function (fig) {
        var stage = fig.querySelector('.db-anno__stage');
        var pins = stage.querySelectorAll('.db-pin');
        var notes = fig.querySelectorAll('.db-anno__notes li');
        if (!pins.length || pins.length !== notes.length) return;
        var svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'db-anno__links');
        svg.setAttribute('aria-hidden', 'true');
        fig.appendChild(svg);
        var paths = Array.prototype.map.call(pins, function () {
            var p = document.createElementNS(NS, 'path');
            svg.appendChild(p);
            return p;
        });
        var wide = window.matchMedia('(min-width: 721px)');
        var list = fig.querySelector('.db-anno__notes');

        function place() {
            var gap = 12;
            list.classList.add('is-placed');
            var L = list.getBoundingClientRect();
            var tops = [];
            var prev = -Infinity;
            notes.forEach(function (li, i) {
                var p = pins[i].getBoundingClientRect();
                var b = li.querySelector('.db-pin').getBoundingClientRect();
                var badgeMid = b.top + b.height / 2 - li.getBoundingClientRect().top;
                var t = i === 0 ? -8 : Math.max(p.top + p.height / 2 - L.top - badgeMid, prev);
                tops.push(t);
                prev = t + li.offsetHeight + gap;
            });
            notes.forEach(function (li, i) { li.style.top = tops[i] + 'px'; });
            list.style.minHeight = Math.ceil(prev - gap) + 'px';
        }

        function draw() {
            if (!wide.matches) {
                list.classList.remove('is-placed');
                list.style.minHeight = '';
                notes.forEach(function (li) { li.style.top = ''; });
                return;
            }
            place();
            var f = fig.getBoundingClientRect();
            svg.setAttribute('viewBox', '0 0 ' + f.width + ' ' + f.height);
            svg.setAttribute('width', f.width);
            svg.setAttribute('height', f.height);
            pins.forEach(function (pin, i) {
                var a = pin.getBoundingClientRect();
                var b = notes[i].querySelector('.db-pin').getBoundingClientRect();
                var x1 = a.right - f.left;
                var y1 = a.top + a.height / 2 - f.top;
                var x2 = b.left - f.left - 4;
                var y2 = b.top + b.height / 2 - f.top;
                var gutter = stage.getBoundingClientRect().right - f.left;
                var mid = (gutter + x2) / 2;
                paths[i].setAttribute('d', 'M' + x1 + ' ' + y1 + ' L' + gutter + ' ' + y1 + ' C' + mid + ' ' + y1 + ',' + mid + ' ' + y2 + ',' + x2 + ' ' + y2);
            });
        }

        function set(n) {
            fig.classList.toggle('has-on', n >= 0);
            [pins, notes, paths].forEach(function (group) {
                Array.prototype.forEach.call(group, function (el, j) { el.classList.toggle('on', j === n); });
            });
        }

        [pins, notes].forEach(function (group) {
            Array.prototype.forEach.call(group, function (el, i) {
                el.addEventListener('mouseenter', function () { set(i); });
                el.addEventListener('mouseleave', function () { set(-1); });
            });
        });

        var img = stage.querySelector('img');
        if (img && !img.complete) img.addEventListener('load', draw);
        if (window.ResizeObserver) {
            var ro = new ResizeObserver(draw);
            ro.observe(fig);
            notes.forEach(function (li) { ro.observe(li); });
        }
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
        window.addEventListener('resize', draw);
        document.addEventListener('case:lang', draw);
        draw();
    });
})();

/* Before / after card (.db-wt__pair): captions centred on their box, dashed line from box to caption */
(function () {
    document.querySelectorAll('.db-wt__pair').forEach(function (fig) {
        var shots = fig.querySelectorAll('.db-wt__shot');
        var caps = fig.querySelectorAll('.db-wt__cap');
        var pairs = Array.prototype.map.call(shots, function (shot, i) {
            var box = shot.querySelector('.db-wt__box');
            var line = document.createElement('i');
            line.className = 'db-wt__line' + (box.classList.contains('db-wt__box--before') ? ' db-wt__line--before' : '');
            fig.appendChild(line);
            return { box: box, cap: caps[i], line: line, above: i === 0 };
        });

        function draw() {
            var f = fig.getBoundingClientRect();
            pairs.forEach(function (p) {
                p.cap.style.left = '0px';
                var b = p.box.getBoundingClientRect();
                var w = p.cap.getBoundingClientRect().width;
                var cx = b.left + b.width / 2 - f.left;
                p.cap.style.left = Math.max(0, Math.min(cx - w / 2, f.width - w)) + 'px';
                var c = p.cap.getBoundingClientRect();
                var y1 = p.above ? c.bottom - f.top + 2 : b.bottom - f.top;
                var y2 = p.above ? b.top - f.top : c.top - f.top - 2;
                p.line.style.left = cx + 'px';
                p.line.style.top = y1 + 'px';
                p.line.style.height = Math.max(0, y2 - y1) + 'px';
            });
        }

        function set(n) {
            fig.classList.toggle('has-on', n >= 0);
            pairs.forEach(function (p, j) {
                [p.box, p.cap, p.line].forEach(function (el) { el.classList.toggle('on', j === n); });
            });
        }

        pairs.forEach(function (p, i) {
            [p.box.parentNode, p.cap].forEach(function (el) {
                el.addEventListener('mouseenter', function () { set(i); });
                el.addEventListener('mouseleave', function () { set(-1); });
            });
        });

        fig.querySelectorAll('img').forEach(function (img) { if (!img.complete) img.addEventListener('load', draw); });
        if (window.ResizeObserver) new ResizeObserver(draw).observe(fig);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
        document.addEventListener('case:lang', draw);
        draw();
    });
})();

/* Language switch: every translatable node carries data-zh; the English original is
   cached on first switch so both directions stay lossless. */
(function () {
    var KEY = 'case-lang';
    function apply(lang, save) {
        var root = document.documentElement;
        root.setAttribute('data-lang', lang);
        root.lang = lang === 'zh' ? 'zh-CN' : 'en';
        var nodes = document.querySelectorAll('[data-zh]');
        for (var i = 0; i < nodes.length; i++) {
            var el = nodes[i];
            if (!el.hasAttribute('data-en-html')) el.setAttribute('data-en-html', el.innerHTML);
            var want = lang === 'zh' ? el.getAttribute('data-zh') : el.getAttribute('data-en-html');
            if (el.innerHTML !== want) el.innerHTML = want;
        }
        var btns = document.querySelectorAll('.langsw button');
        for (var j = 0; j < btns.length; j++) {
            var on = btns[j].getAttribute('data-lang') === lang;
            btns[j].classList.toggle('on', on);
            btns[j].setAttribute('aria-pressed', on ? 'true' : 'false');
        }
        if (save) { try { localStorage.setItem(KEY, lang); } catch (e) {} }
        document.dispatchEvent(new CustomEvent('case:lang', { detail: { lang: lang } }));
    }
    document.addEventListener('click', function (e) {
        var b = e.target.closest && e.target.closest('.langsw button');
        if (b) apply(b.getAttribute('data-lang'), true);
    });
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved === 'zh') {
        if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { apply('zh', false); });
        else apply('zh', false);
    }
})();
