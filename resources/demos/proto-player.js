/* Click-through prototype player for flattened Figma exports.
   Data (window.PROTO): frames { w, h, img, name?, ov?: 'manual' | 'center' | 'right', dim?, clear?,
   auto?: { to, ms, a }, hs: [...] }, variants { w, h, r, img, hs }.
   'right' is a drawer pinned to the top-right of the screen; auto fires one action after ms
   (Figma's "after delay"). Hotspot actions:
   N navigate · O open overlay (rel = offset from the hotspot origin) · C close · B back ·
   S swap a component slot to a variant · X set a flag the page renders itself (P.onFrame). */
(function () {
    var P = window.PROTO;
    var root = document.querySelector('.pp');
    var view = root.querySelector('.pp-view');
    var sizer = root.querySelector('.pp-sizer');
    var stage = root.querySelector('.pp-stage');
    var modal = root.querySelector('.pp-modal');
    var base = root.getAttribute('data-base') || '';
    var embed = /[?&]embed=1/.test(location.search);
    if (embed) document.documentElement.classList.add('embed');

    var T = {
        en: { restart: 'Restart', hint: 'Tap an empty spot to see what’s clickable', go: 'Go to ', open: 'Open menu', close: 'Close', back: 'Back', swap: 'Change view', fill: 'Fill in the form' },
        zh: { restart: '重新开始', hint: '点空白处可查看可点击区域', go: '前往', open: '打开菜单', close: '关闭', back: '返回', swap: '切换视图', fill: '填写表单' }
    };
    function lang() {
        var l = 'en';
        try { l = localStorage.getItem('case-lang') || 'en'; } catch (e) {}
        return l === 'zh' ? 'zh' : 'en';
    }
    function t(k) { return T[lang()][k]; }

    var screen, manual, center, hist, rpBack;

    function fresh(id) { return { id: id, slots: {}, cur: {}, flags: {} }; }
    function isRp(id) { return !!(P.frames[id] && P.frames[id].rp); }
    function snap(st) {
        return { id: st.id, slots: Object.assign({}, st.slots), cur: Object.assign({}, st.cur), flags: Object.assign({}, st.flags) };
    }
    function reset() {
        goto(P.start, true);
    }

    function goto(id, first) {
        if (!P.frames[id]) return;
        screen = fresh(id); manual = null; center = null; hist = []; rpBack = null;
        entering = first ? false : 0;
        render(!!first);
        view.scrollTop = 0;
    }

    var stepsEl = root.querySelector('.pp-steps');
    function buildSteps() {
        if (!stepsEl || !P.steps) return;
        stepsEl.innerHTML = '';
        var k = el('div', 'pp-steps__k');
        k.dataset.en = 'Pages';
        k.dataset.zh = '页面';
        stepsEl.appendChild(k);
        P.steps.forEach(function (step, i) {
            var b = el('button', 'pp-step' + (i === P.steps.length - 1 ? ' pp-step--aside' : ''));
            b.type = 'button';
            b.dataset.id = step.id;
            b.dataset.ids = (step.ids || [step.id]).join(',');
            b.dataset.en = step.en;
            b.dataset.zh = step.zh;
            var n = el('span', 'pp-step__n');
            n.textContent = String(i + 1);
            var label = el('span', 'pp-step__l');
            b.appendChild(n);
            b.appendChild(label);
            b.addEventListener('click', function () { goto(step.id, false); });
            stepsEl.appendChild(b);
        });
    }
    function paintSteps() {
        if (!stepsEl || !screen) return;
        var zh = lang() === 'zh';
        var k = stepsEl.querySelector('.pp-steps__k');
        if (k) k.textContent = zh ? k.dataset.zh : k.dataset.en;
        var buttons = stepsEl.querySelectorAll('.pp-step');
        var current = -1;
        for (var i = 0; i < buttons.length; i++) {
            if (buttons[i].dataset.ids.split(',').indexOf(screen.id) >= 0) current = i;
        }
        for (var j = 0; j < buttons.length; j++) {
            var b = buttons[j];
            var label = b.querySelector('.pp-step__l');
            label.textContent = zh ? b.dataset.zh : b.dataset.en;
            var on = j === current;
            b.classList.toggle('is-on', on);
            b.classList.toggle('is-done', current > j);
            if (on) b.setAttribute('aria-current', 'step');
            else b.removeAttribute('aria-current');
            if (on && stepsEl.scrollWidth > stepsEl.clientWidth + 4) {
                stepsEl.scrollTo({ left: Math.max(0, b.offsetLeft - 16), behavior: 'smooth' });
            }
        }
    }

    function scale() {
        var s = view.clientWidth / P.w;
        if (!embed && s < 0.5) s = 0.5;
        return Math.min(1, s);
    }

    function el(tag, cls) {
        var e = document.createElement(tag);
        if (cls) e.className = cls;
        return e;
    }
    function img(src, w, h, alt) {
        var i = el('img');
        var bust = P.assetV != null ? ((src.indexOf('?') >= 0 ? '&' : '?') + 'v=' + P.assetV) : '';
        i.src = base + src + bust; i.width = w; i.height = h;
        i.alt = alt || ''; i.draggable = false; i.decoding = 'async';
        return i;
    }
    function place(e, x, y, w, h) {
        e.style.left = x + 'px'; e.style.top = y + 'px';
        if (w != null) { e.style.width = w + 'px'; e.style.height = h + 'px'; }
    }

    function label(h) {
        if (h.a === 'N') { var f = P.frames[h.to]; return f && f.name ? t('go') + f.name : t('open'); }
        return { O: t('open'), C: t('close'), B: t('back'), S: t('swap'), X: t('fill') }[h.a];
    }

    /* Hotspots that share a box fire together (Figma allows a swap and an overlay on one click). */
    function addHotspots(parent, list) {
        var groups = {}, order = [];
        list.forEach(function (it) {
            var k = it.box.join(',');
            if (!groups[k]) { groups[k] = []; order.push(k); }
            groups[k].push(it);
        });
        order.forEach(function (k) {
            var g = groups[k], b = g[0].box;
            var btn = el('button', 'pp-hs');
            btn.type = 'button';
            btn.setAttribute('aria-label', label(g[g.length - 1].h));
            place(btn, b[0], b[1], b[2], b[3]);
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                g.forEach(function (it) { it.run(); });
                render(false);
            });
            parent.appendChild(btn);
        });
    }

    function frameEl(st, layer) {
        var f = P.frames[st.id];
        var wrap = el('div', 'pp-frame');
        place(wrap, 0, 0, f.w, f.h);
        wrap.style.position = 'relative';
        wrap.appendChild(img(f.img, f.w, f.h, f.name || ''));
        var list = [], seen = {};
        f.hs.forEach(function (h) {
            if (h.a === 'S') {
                st.cur[h.slot] = h.cur;
                if (st.slots[h.slot]) {
                    if (!seen[h.slot]) { seen[h.slot] = 1; slotEl(wrap, st, h, list, layer); }
                    return;
                }
            }
            if (h.a === 'X' && st.flags[h.to]) return;
            list.push({ box: h.b, h: h, run: function () { act(h, st, layer); } });
        });
        if (P.onFrame) P.onFrame(st.id, wrap, st);
        addHotspots(wrap, list);
        return wrap;
    }

    function slotEl(wrap, st, sh, list, layer) {
        var v = P.variants[st.slots[sh.slot]];
        var x = sh.sb[0], y = sh.sb[1];
        var vi = img(v.img, v.w, v.h);
        vi.className = 'pp-var' + (v.r ? ' pp-var--round' : '');
        place(vi, x, y, v.w, v.h);
        wrap.appendChild(vi);
        v.hs.forEach(function (h) {
            list.push({ box: [x + h.b[0], y + h.b[1], h.b[2], h.b[3]], h: h, run: function () {
                if (h.a === 'S') swap(st, sh.slot, h.to);
                else act(h, st, layer);
            } });
        });
    }

    function swap(st, slot, to) {
        if (to === st.cur[slot]) delete st.slots[slot];
        else st.slots[slot] = to;
    }

    function closeLayer(layer) {
        if (layer === 'center') center = null;
        else if (layer === 'manual') manual = null;
        else if (center) center = null;
        else if (manual) manual = null;
        else return false;
        return true;
    }

    var entering = false;
    function act(h, st, layer) {
        var dest = h.to && P.frames[h.to];
        if (h.a === 'S') { swap(st, h.slot, h.to); return; }
        if (h.a === 'X') { st.flags[h.to] = true; return; }
        if (h.a === 'C') { closeLayer(layer); return; }
        if (h.a === 'B') {
            if (closeLayer(layer)) return;
            if (isRp(screen.id) && rpBack) {
                screen = rpBack.st;
                entering = { panel: 'collapse', top: rpBack.top };
                rpBack = null;
                manual = null; center = null;
                return;
            }
            var prev = hist.pop();
            if (prev) { screen = prev.st; entering = prev.top; }
            return;
        }
        if (dest && dest.ov === 'center') {
            center = fresh(h.to);
            if (!(manual && manual.right)) manual = null;
            return;
        }
        if (dest && dest.ov === 'right') { manual = fresh(h.to); manual.right = true; center = null; return; }
        if (dest && dest.ov === 'manual') {
            var rel = h.rel || [0, 0];
            manual = fresh(h.to);
            manual.x = h.b[0] + rel[0]; manual.y = h.b[1] + rel[1];
            if (layer !== 'screen') { manual.x = 0; manual.y = 0; }
            return;
        }
        if (h.a === 'N' || h.a === 'O') {
            var fromRp = isRp(screen.id);
            var toRp = isRp(h.to);
            if (toRp) {
                if (!fromRp) rpBack = { st: snap(screen), top: view.scrollTop };
                screen = fresh(h.to); manual = null; center = null;
                entering = { panel: fromRp ? 'swap' : 'expand', top: view.scrollTop };
                return;
            }
            if (fromRp && !toRp) {
                var back = rpBack;
                rpBack = null;
                if (back) {
                    screen = back.st;
                    entering = { panel: 'collapse', top: back.top };
                } else {
                    hist.push({ st: screen, top: view.scrollTop });
                    screen = fresh(h.to);
                    entering = { panel: 'collapse', top: 0 };
                }
                manual = null; center = null;
                return;
            }
            hist.push({ st: screen, top: view.scrollTop });
            screen = fresh(h.to); manual = null; center = null;
            entering = 0;
        }
    }

    function panelAnim(mode, ghostFrame, h) {
        if (!ghostFrame || !mode) return;
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var px = P.panelX != null ? P.panelX : 1040;
        var top = 88;
        var bot = Math.min(h - 52, 748);
        var ghost = el('div', 'pp-panel-ghost');
        place(ghost, px, top, P.w - px, bot - top);
        var inner = el('div', 'pp-panel-ghost__in');
        place(inner, -px, -top, P.w, h);
        while (ghostFrame.firstChild) inner.appendChild(ghostFrame.firstChild);
        ghost.appendChild(inner);
        stage.appendChild(ghost);
        void ghost.offsetWidth;
        ghost.classList.add('is-out');
        function done() { if (ghost.parentNode) ghost.remove(); }
        ghost.addEventListener('transitionend', function (e) {
            if (e.propertyName === 'clip-path' || e.propertyName === 'opacity') done();
        });
        setTimeout(done, 720);
    }

    function render(first) {
        var f = P.frames[screen.id];
        var s = scale();
        var panelMode = (entering && typeof entering === 'object' && entering.panel) ? entering.panel : null;
        var ghostFrame = null;
        if (panelMode && !first) {
            var prev = stage.querySelector('.pp-frame');
            if (prev) {
                ghostFrame = prev.cloneNode(true);
                ghostFrame.querySelectorAll('.pp-hs').forEach(function (b) { b.remove(); });
            }
        }
        stage.innerHTML = '';
        stage.style.width = P.w + 'px';
        stage.style.height = f.h + 'px';
        stage.style.transform = 'scale(' + s + ')';
        sizer.style.width = Math.round(P.w * s) + 'px';
        sizer.style.height = Math.round(f.h * s) + 'px';
        stage.appendChild(frameEl(screen, 'screen'));
        if (ghostFrame) panelAnim(panelMode, ghostFrame, f.h);

        if (manual) {
            var catcher = el('div', 'pp-catch' + (manual.right ? ' pp-catch--dim' : ''));
            catcher.addEventListener('click', function (e) { e.stopPropagation(); manual = null; render(false); });
            stage.appendChild(catcher);
            var mf = P.frames[manual.id];
            var pop = el('div', 'pp-pop' + (manual.right ? ' pp-pop--right' : '') + (mf.clear ? ' pp-pop--clear' : ''));
            if (manual.right) place(pop, P.w - mf.w, 0, mf.w, Math.min(mf.h, f.h));
            else place(pop, manual.x, manual.y, mf.w, mf.h);
            pop.appendChild(frameEl(manual, 'manual'));
            stage.appendChild(pop);
        }

        modal.innerHTML = '';
        modal.classList.toggle('on', !!center);
        if (center) {
            var cf = P.frames[center.id];
            modal.style.background = 'rgba(0,0,0,' + (cf.dim || 0) + ')';
            var cs = Math.min(s, (view.clientHeight - 24) / cf.h, (view.clientWidth - 24) / cf.w);
            var dlg = el('div', 'pp-dialog');
            dlg.setAttribute('role', 'dialog');
            dlg.setAttribute('aria-modal', 'true');
            dlg.style.width = cf.w + 'px'; dlg.style.height = cf.h + 'px';
            dlg.style.transform = 'translate(-50%,-50%) scale(' + cs + ')';
            dlg.appendChild(frameEl(center, 'center'));
            modal.appendChild(dlg);
        }

        var navigated = entering !== false;
        if (navigated) {
            var top = (typeof entering === 'object' && entering) ? (entering.top || 0) : (entering || 0);
            view.scrollTop = top;
            if (!first && !panelMode) {
                stage.classList.remove('pp-enter');
                void stage.offsetWidth;
                stage.classList.add('pp-enter');
            }
            entering = false;
        }
        fixedBar(f, s);
        paintSteps();
        if ((navigated || first) && !panelMode) setTimeout(flash, first ? 600 : 250);
        preload(f);
        schedule();
        reportSize();
    }

    var reported = 0;
    function reportSize() {
        var f = P.frames[screen.id];
        if (!f) return;
        requestAnimationFrame(function () {
            if (!view.clientWidth) return;
            var steps = stepsEl ? stepsEl.offsetHeight : 0;
            var frameH = Math.ceil(f.h * scale());
            var h = steps + frameH;
            if (stepsEl) document.documentElement.classList.add('pp-sized');
            if (embed && window.parent !== window) {
                if (h === reported) return;
                reported = h;
                window.parent.postMessage({ type: 'pp-size', h: h }, '*');
                return;
            }
            if (!stepsEl) return;
            document.documentElement.classList.add('pp-fit');
            root.style.setProperty('--pp-frame-h', frameH + 'px');
            if (h === reported) return;
            reported = h;
            root.style.height = h + 'px';
        });
    }

    var autoFor = null, autoT;
    function schedule() {
        var top = center || manual || screen;
        var auto = P.frames[top.id].auto;
        if (autoFor === top) return;
        clearTimeout(autoT);
        autoFor = auto ? top : null;
        if (!auto) return;
        var layer = top === center ? 'center' : top === manual ? 'manual' : 'screen';
        var src = P.frames[auto.to] && P.frames[auto.to].img;
        if (src && !loaded[src]) { loaded[src] = 1; new Image().src = base + src; }
        autoT = setTimeout(function () {
            if (autoFor !== top) return;
            autoFor = null;
            act({ a: auto.a || 'N', to: auto.to, b: [0, 0, 0, 0] }, top, layer);
            render(false);
        }, auto.ms);
    }

    /* fixed: [x, y, w, h] — a strip of the screen (e.g. the action bar) pinned to the
       bottom of the viewport while the rest scrolls, like Figma's "fix position when scrolling". */
    function fixedBar(f, s) {
        var old = root.querySelector('.pp-fixed');
        if (old) old.remove();
        root.style.setProperty('--pp-fixed-h', f.fixed ? f.fixed[3] * s + 'px' : '0px');
        if (!f.fixed) return;
        var fx = f.fixed;
        var bar = el('div', 'pp-fixed');
        var visible = Math.min(view.clientHeight, sizer.offsetHeight);
        place(bar, sizer.offsetLeft + fx[0] * s, visible - fx[3] * s, fx[2] * s, fx[3] * s);
        var inner = el('div', 'pp-fixed__in');
        place(inner, 0, 0, fx[2], fx[3]);
        inner.style.transform = 'scale(' + s + ')';
        var bg = img(f.img, f.w, f.h);
        place(bg, -fx[0], -fx[1]);
        inner.appendChild(bg);
        var list = [];
        f.hs.forEach(function (h) {
            var b = h.b;
            if ('NBC'.indexOf(h.a) < 0 || b[1] < fx[1] || b[0] < fx[0]) return;
            list.push({ box: [b[0] - fx[0], b[1] - fx[1], b[2], b[3]], h: h, run: function () { act(h, screen, 'screen'); } });
        });
        addHotspots(inner, list);
        bar.addEventListener('click', flash);
        bar.appendChild(inner);
        root.appendChild(bar);
    }

    var loaded = {};
    function preload(f) {
        f.hs.forEach(function (h) {
            var src = h.to && ((P.frames[h.to] || P.variants[h.to] || {}).img);
            if (src && !loaded[src]) { loaded[src] = 1; new Image().src = base + src; }
        });
    }

    function flash() {
        root.classList.remove('pp-flash');
        void root.offsetWidth;
        root.classList.add('pp-flash');
        clearTimeout(flash.t);
        flash.t = setTimeout(function () { root.classList.remove('pp-flash'); }, 1400);
    }
    function isLive(e) { return e.target.closest && e.target.closest('input, textarea, select, a, label, .pp-live'); }
    stage.addEventListener('click', function (e) { if (!isLive(e)) flash(); });
    modal.addEventListener('click', function (e) {
        if (e.target === modal) { center = null; render(false); }
        else if (!isLive(e)) flash();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && closeLayer()) render(false);
    });

    var bar = root.querySelector('.pp-bar');
    var restart = bar.querySelector('[data-k="restart"]');
    var hint = bar.querySelector('[data-k="hint"]');
    restart.addEventListener('click', reset);
    function paintChrome() {
        restart.textContent = t('restart');
        if (hint) hint.textContent = t('hint');
        document.documentElement.lang = lang() === 'zh' ? 'zh-CN' : 'en';
        paintSteps();
    }
    root.addEventListener('pointerdown', function () { if (hint) hint.classList.add('is-gone'); }, { once: true });
    window.addEventListener('storage', function (e) { if (e.key === 'case-lang') { paintChrome(); render(false); } });

    var rt;
    window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
            var f = P.frames[screen.id], old = sizer.offsetHeight || 1;
            var ratio = view.scrollTop / old;
            render(false);
            view.scrollTop = ratio * Math.round(f.h * scale());
        }, 80);
    });

    window.addEventListener('message', function (e) {
        var d = e.data;
        if (!d || d.type !== 'pp-goto' || !P.frames[d.id]) return;
        goto(d.id, false);
    });

    buildSteps();
    reset();
    paintChrome();
})();
