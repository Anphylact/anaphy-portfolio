'use strict';
(() => {
  const root = document.documentElement;
  const embedded = parent !== window && new URLSearchParams(location.search).has('site-detail');
  if (embedded) root.dataset.projectEmbedded = '';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = 800, easing = 'cubic-bezier(.22,.61,.36,1)';
  const rect = node => node.getBoundingClientRect();
  const bounds = nodes => {
    const boxes = [...nodes].map(rect), left = Math.min(...boxes.map(r => r.left)), top = Math.min(...boxes.map(r => r.top));
    return { left, top, width: Math.max(...boxes.map(r => r.right)) - left, height: Math.max(...boxes.map(r => r.bottom)) - top };
  };
  function detail() {
    const back=document.getElementById('back');
    if (!embedded||!back||back.dataset.portfolioCloseBound==='true') return;
    back.dataset.portfolioCloseBound='true';
    const send = () => parent.postMessage({ channel: 'portfolio-detail', type: 'close' }, location.origin);
    back.addEventListener('click', event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) { event.preventDefault(); send(); } });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !document.fullscreenElement) { event.preventDefault(); send(); } });
  }
  function create({ base, works, prepare, lock, unlock, error }) {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = new URL('assets/css/works-carousel.css', base);
    let styleReady = false;
    const styles = new Promise(resolve => { const timer = setTimeout(() => resolve(false), 3000); css.onload = () => { clearTimeout(timer); styleReady = true; resolve(true); }; css.onerror = () => { clearTimeout(timer); resolve(false); }; });
    document.head.append(css);
    let state = 'closed', layer = null, frame = null, clone = null, animations = [], restore = [], source = null;
    const owner=crypto.randomUUID?.()||String(Date.now()+Math.random());
    let operation = 0, motion = 0, id = null, returnURL = null, historyClosing = false, closeAfter = null, cancelLoad = null;
    const active = () => state !== 'closed';
    function setState(value) { state = value; if (value === 'closed') delete root.dataset.siteProject; else root.dataset.siteProject = value; }
    function clearVisual() { animations.forEach(a => a.cancel()); animations = []; restore.forEach(fn => fn()); restore = []; clone?.remove(); clone = null; }
    function cleanup() {
      cancelLoad?.(); cancelLoad = null; clearVisual(); frame?.contentDocument?.querySelector('video')?.pause(); layer?.remove(); frame = layer = null;
      works().contentWindow?.PortfolioWorks?.suspend(false); setState('closed'); historyClosing = false; unlock();
    }
    function recordStyle(node, key, value) { const before = node.style[key]; node.style[key] = value; restore.push(() => node.style[key] = before); }
    function animate(node, frames, options = {}) {
      const a = node.animate(frames, { duration, easing, fill: 'both', ...options }); a.pause(); a.currentTime = 0; animations.push(a); return a;
    }
    function revealNodes(doc) { return [doc.querySelector('header'), doc.querySelector('.information'), doc.querySelector('.video-note')].filter(Boolean); }
    function targetRect(ensureVisible) {
      const box = frame.contentDocument.querySelector('.video-frame');
      // The approved stacked mobile layout may put the video below the fold.
      const r = rect(box); if (ensureVisible && (r.bottom > frame.clientHeight || r.top < 0)) box.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      return rect(box);
    }
    function build(ensureVisible = true) {
      clearVisual();
      const win = works().contentWindow, doc = win.document, carousel = doc.querySelector('.circular-carousel');
      source = carousel?.querySelector(`[data-cc-index="${win.PortfolioWorks.getIndex()}"]`);
      if (!source || !styleReady || !Element.prototype.animate || reduced.matches) return false;
      const r = rect(carousel), index = Number(source.dataset.ccIndex), count = carousel.querySelectorAll('.circular-carousel__card').length;
      clone = carousel.cloneNode(true); clone.id = 'site-project-cover'; clone.removeAttribute('tabindex'); clone.removeAttribute('role'); clone.setAttribute('aria-hidden', 'true'); clone.inert = true;
      Object.assign(clone.style, { position: 'fixed', left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, overflow: 'visible', pointerEvents: 'none', transformOrigin: '0 0', zIndex: '900', color: 'white' });
      clone.querySelectorAll('.circular-carousel__card').forEach(card => { if (Number(card.dataset.ccIndex) !== index) card.remove(); });
      clone.querySelectorAll('.circular-carousel__caption, .circular-carousel__live').forEach(node => node.remove());
      clone.querySelectorAll('img').forEach(img => { img.style.filter = win.getComputedStyle(source.querySelector('img')).filter; img.decoding = 'sync'; });
      document.body.append(clone);
      const camera = clone.querySelector('.circular-carousel__camera'), ring = clone.querySelector('.circular-carousel__ring'), card = clone.querySelector('.circular-carousel__card');
      // Equivalent full turns are removed before interpolation, so a fifth-card opening never spins a full turn.
      const spin = /rotateY\(([-\d.]+)deg\)/.exec(ring.style.transform);
      if (spin) ring.style.transform = `rotateY(${Number(spin[1]) - 360 * Math.round((Number(spin[1]) + index * 360 / count) / 360)}deg)`;
      const transforms = [camera, ring, card].map(node => [node, node.style.transform, 'none']);
      for (const tile of clone.querySelectorAll('.circular-carousel__tile')) {
        const photo = tile.querySelector('img'), width = parseFloat(photo.style.width), offset = -parseFloat(photo.style.left);
        const back = tile.style.transform.endsWith(' rotateY(180deg)');
        transforms.push([tile, tile.style.transform, `translateX(${offset + parseFloat(tile.style.width) / 2 - width / 2}px) rotateY(${back ? 180 : 0}deg)`]);
      }
      transforms.forEach(([node,, end]) => node.style.transform = end);
      const flat = bounds(clone.querySelectorAll('.circular-carousel__frame')), target = targetRect(ensureVisible);
      if (!Number.isFinite(flat.width) || flat.width < 1) { clone.remove(); clone = null; return false; }
      const sx = target.width / flat.width, sy = target.height / flat.height;
      const dx = target.left - r.left - (flat.left - r.left) * sx, dy = target.top - r.top - (flat.top - r.top) * sy;
      transforms.forEach(([node, start]) => node.style.transform = start);
      for (const [node, start, end] of transforms) animate(node, [{ transform: start }, { transform: end }]);
      animate(clone, [{ transform: 'none' }, { transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})` }]);
      animate(clone, [{ opacity: 1, offset: 0 }, { opacity: 1, offset: .78 }, { opacity: 0, offset: 1 }], { easing: 'linear' });
      recordStyle(source, 'visibility', 'hidden');
      const remaining = [...carousel.querySelectorAll('.circular-carousel__card')].filter(node => node !== source);
      for (const node of [...remaining, ...doc.querySelectorAll('#app > h1, #app > .controls, #site-brand')]) animate(node, [{ opacity: 1, offset: 0 }, { opacity: 0, offset: .36 }, { opacity: 0, offset: 1 }]);
      const detailDoc = frame.contentDocument;
      for (const node of revealNodes(detailDoc)) {
        // A transformed header would make its fixed X scroll with the header on short phones.
        const start = node.tagName === 'HEADER' ? {} : { transform: 'translateY(8px)' };
        const end = node.tagName === 'HEADER' ? {} : { transform: 'none' };
        animate(node, [{ opacity: 0, ...start, offset: 0 }, { opacity: 0, ...start, offset: .60 }, { opacity: 1, ...end, offset: 1 }]);
      }
      animate(detailDoc.querySelector('.video-frame'), [{ opacity: 0, offset: 0 }, { opacity: 0, offset: .78 }, { opacity: 1, offset: 1 }], { easing: 'linear' });
      return true;
    }
    async function drive(open) {
      const turn = ++motion; setState(open ? 'opening' : 'closing'); lock(); layer.style.background = 'transparent'; frame.inert = true;
      if (!animations.length || reduced.matches) {
        animations.forEach(a => { a.pause(); a.currentTime = open ? duration : 0; });
        if (open) frame.contentDocument.documentElement.dataset.projectVisible = '';
      } else {
        animations.forEach(a => { a.playbackRate = open ? 1 : -1; a.play(); });
        await Promise.all(animations.map(a => a.finished.catch(() => {})));
      }
      if (turn !== motion) return false;
      if (open) { setState('open'); layer.style.background = '#002FA7'; frame.contentDocument.documentElement.dataset.projectVisible = ''; clearVisual(); frame.inert = false; unlock(); frame.contentDocument.getElementById('back').focus({ preventScroll: true }); }
      return true;
    }
    async function open(href, { push = true } = {}) {
      const url = new URL(href, base), nextId = url.searchParams.get('id');
      if (active()) {
        if (state === 'closing' && nextId === id) { ++operation; closeAfter = null; historyClosing = false; void drive(true); }
        else if (nextId !== id) void close(() => { if (/\/project(?:\.html)?\/?$/.test(location.pathname)) void open(href, { push }); });
        return;
      }
      const version = ++operation; id = nextId;
      if (!id) return;
      setState('loading'); lock();
      try {
        await styles; if (version !== operation) return;
        await prepare(id); if (version !== operation) return;
        returnURL = new URL('works.html', base); returnURL.searchParams.set('selected', id);
        const win = works().contentWindow;
        const started = performance.now();
        while (!win.PortfolioWorks?.suspend(true)) { if (performance.now() - started > 3000) throw Error('carousel unavailable'); await new Promise(resolve => setTimeout(resolve, 30)); if (version !== operation) return; }
        layer = document.createElement('section'); layer.id = 'site-project-layer'; layer.setAttribute('aria-label', '作品详情 / Project details');
        frame = document.createElement('iframe'); frame.name = 'portfolio-project'; frame.title = '作品详情 / Project details'; frame.inert = true; layer.append(frame); document.body.append(layer);
        const loaded = new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(Error('detail unavailable')), 15000);
          cancelLoad = () => { clearTimeout(timer); reject(Error('detail cancelled')); };
          frame.onload = () => { clearTimeout(timer); cancelLoad = null; resolve(); }; frame.onerror = () => { clearTimeout(timer); cancelLoad = null; reject(Error('detail unavailable')); };
        });
        url.searchParams.set('site-detail', 'runtime-5'); frame.src = url.href; await loaded;
        if (version !== operation) return;
        if (!frame.contentDocument.querySelector('.video-frame')) throw Error('detail unavailable');
        if (push) {
          // Always establish the actual WORKS return entry before adding the detail route.
          history.replaceState({chapter:'works'},'',returnURL);
          const route = new URL(href, base); history.pushState({ chapter: 'works', portfolioDetail: true, detailOwner:owner, id }, '', route);
        }
        document.title = frame.contentDocument.title;
        build(); await drive(true);
      } catch (e) { if (version === operation) { ++motion; cleanup(); error(); } }
    }
    async function close(after = () => {}) {
      if (!active()) { after(); return; }
      closeAfter = after;
      if (state === 'closing') return;
      ++operation; historyClosing = false;
      if (state === 'loading') { ++motion; const done = closeAfter; closeAfter = null; cleanup(); done?.(); return; }
      frame.contentDocument.querySelector('video')?.pause();
      if (state === 'open') { build(false); animations.forEach(a => a.currentTime = duration); }
      if (!await drive(false)) return;
      const done = closeAfter; closeAfter = null; cleanup(); done?.(); works().contentDocument?.querySelector('.circular-carousel')?.focus({ preventScroll: true });
    }
    function requestClose() {
      if (state !== 'open' || historyClosing) return;
      historyClosing = true;
      const entries=window.navigation?.entries(),at=window.navigation?.currentEntry?.index;
      const previousURL=entries&&at>0?entries[at-1]?.url:null;
      const previous=previousURL?new URL(previousURL):null;
      const knownList=history.state?.detailOwner===owner&&(!previous||/\/works(?:\.html)?\/?$/.test(previous.pathname));
      if(knownList)history.back();
      else { history.replaceState({ chapter: 'works' }, '', returnURL); void close(()=>window.dispatchEvent(new PopStateEvent('popstate',{state:history.state}))); }
    }
    function exitTo(after) { if (!active()) { after(); return; } history.replaceState({ chapter: 'works' }, '', returnURL); void close(after); }
    window.addEventListener('message', event => { if (event.origin === location.origin && event.source === frame?.contentWindow && event.data?.channel === 'portfolio-detail' && event.data.type === 'close') requestClose(); });
    window.addEventListener('resize', () => {
      if (!active()) return;
      animations.forEach(a => { if (a.playState === 'running') a.finish(); });
    });
    reduced.addEventListener('change', () => { if (reduced.matches) animations.forEach(a => { if (a.playState === 'running') a.finish(); }); });
    return Object.freeze({ active, open, close, exitTo });
  }
  window.PortfolioProjectTransition = Object.freeze({ create, detail });
  // Bind the embedded close independently of the chapter router, once per anchor.
  if(embedded){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',detail,{once:true});else detail();}
})();
