'use strict';
(() => {
  const root = document.getElementById('about'), svg = document.getElementById('drawing');
  const path = document.getElementById('morph-line'), identity = document.getElementById('identity');
  const copy = document.getElementById('editing-copy'), close = document.getElementById('close'), related = document.getElementById('related');
  const timeline = document.getElementById('timeline'), feedback = document.getElementById('feedback');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)'), NS = 'http://www.w3.org/2000/svg';
  const clamp = x => Math.max(0, Math.min(1, x));
  const mix = (a, b, t) => a + (b - a) * t;
  const ease = t => (1 - Math.cos(Math.PI * clamp(t))) / 2;
  const phase = (p, start, end) => ease((p - start) / (end - start));
  let progress = 0, destination = 0, transition = null, raf = 0, last = 0, W = innerWidth, H = innerHeight;
  let pointer = { x: 0, y: 0 }, offset = { x: 0, y: 0 }, hovering = -1, hoverValues = [0, 0, 0, 0, 0];
  const names = ['EDITING', 'FILMING', 'DIRECTING', 'TOOLKIT', 'PROFILE'];
  const modules = names.map((name, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'module'; button.dataset.index = index;
    button.innerHTML = `<span class="caption">${String(index + 1).padStart(2, '0')} / ${name}</span><span class="explore" aria-hidden="true">EXPLORE ↗</span>`;
    button.setAttribute('aria-label', index ? `${name}，仅展示` : '展开 EDITING');
    if (index) button.setAttribute('aria-disabled', 'true');
    else { button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', 'editing-copy'); button.addEventListener('click', () => animateTo(1)); }
    button.addEventListener('pointerenter', () => { hovering = index; request(); });
    button.addEventListener('pointerleave', () => { hovering = -1; request(); });
    button.addEventListener('focus', () => { hovering = index; request(); });
    button.addEventListener('blur', () => { hovering = -1; request(); });
    document.getElementById('modules').append(button);
    let circle = null;
    if (index) { circle = document.createElementNS(NS, 'circle'); circle.setAttribute('fill', 'none'); circle.setAttribute('stroke', 'white'); circle.setAttribute('stroke-width', '1.2'); document.getElementById('satellites').append(circle); }
    return { button, circle };
  });
  const clips = [ [0, .16], [.19, .13], [.36, .21], [.60, .12], [.75, .18] ].map(([start, length], i) => {
    const rect = document.createElementNS(NS, 'rect'); rect.dataset.start = start; rect.dataset.length = length;
    if (i % 2) rect.setAttribute('stroke-dasharray', '3 4'); document.getElementById('clips').append(rect); return rect;
  });
  const ticks = Array.from({ length: 21 }, () => { const line = document.createElementNS(NS, 'line'); document.getElementById('ticks').append(line); return line; });
  function positions() {
    const mobile = W <= 650, R = mobile ? Math.min(W * .12, H * .055) : Math.min(W * .060, H * .095, 90);
    const origin = mobile ? [[.73,.40,1],[.77,.15,.65],[.73,.69,.87],[.27,.78,.65],[.20,.20,.48]] : [[.59,.31,1],[.84,.18,.65],[.85,.63,1.06],[.53,.78,.64],[.31,.16,.46]];
    const edge = mobile ? [[.73,.40,1],[.90,.15,.35],[.945,.54,.35],[.09,.86,.35],[.055,.54,.35]] : [[.59,.31,1],[.94,.18,.42],[.95,.53,.42],[.60,.90,.42],[.04,.53,.42]];
    return { mobile, R, origin, edge };
  }
  function render() {
    const { mobile, R, origin, edge } = positions();
    const layout = phase(progress, 0, .85), morph = phase(progress, .24, .90);
    const lineX = W * (mobile ? .5 : .52), lineY = H * (mobile ? .735 : .73), lineWidth = W * (mobile ? .82 : .68);
    const strength = (1 - layout) * (reduced.matches ? 0 : 1);
    modules.forEach(({ button, circle }, i) => {
      const from = origin[i], to = edge[i];
      const px = offset.x * (i % 2 ? -1 : 1) * strength, py = offset.y * (i % 2 ? 1 : -1) * strength;
      let cx = W * mix(from[0], to[0], layout) + px, cy = H * mix(from[1], to[1], layout) + py;
      let r = R * mix(from[2], to[2], layout) * (1 + hoverValues[i] * .045 * strength);
      if (!i) { cx = mix(cx, lineX, phase(progress, 0, .55)); cy = mix(cy, lineY, phase(progress, 0, .55)); }
      button.style.width = button.style.height = `${r * 2}px`;
      button.style.transform = `translate(${cx - r}px, ${cy - r}px)`;
      button.style.opacity = String(i ? mix(1, .22, layout) : 1 - phase(progress, .18, .42));
      button.style.pointerEvents = progress > 0 || transition ? 'none' : 'auto';
      button.tabIndex = progress > 0 || transition ? -1 : 0;
      if (circle) { circle.setAttribute('cx', cx); circle.setAttribute('cy', cy); circle.setAttribute('r', r); circle.setAttribute('opacity', mix(1, .22, layout)); }
      else {
        const length = mix(2 * Math.PI * r, lineWidth, morph), angle = 2 * Math.PI * (1 - morph);
        const mean = angle > .001 ? Math.sin(angle / 2) / (angle / 2) : 1;
        const points = Array.from({ length: 129 }, (_, n) => {
          const s = n / 128 - .5;
          const x = angle > .001 ? length / angle * Math.sin(angle * s) : length * s;
          const y = angle > .001 ? length / angle * (Math.cos(angle * s) - mean) : 0;
          return `${n ? 'L' : 'M'}${(cx + x).toFixed(3)},${(cy + y).toFixed(3)}`;
        });
        path.setAttribute('d', points.join(' '));
        // The very same path is the closed ring, opening arc, and final timeline baseline.
      }
    });
    const nameScale = mix(1, mobile ? .42 : .25, layout);
    const nameX = W * mix(mobile ? .09 : .10, mobile ? .07 : .045, layout);
    const nameY = H * mix(mobile ? .47 : .46, mobile ? .085 : .073, layout);
    identity.style.transform = `translate(${nameX}px, ${nameY}px) scale(${nameScale})`;
    identity.querySelector('.latin').style.fontSize = `${12 / nameScale}px`;
    identity.querySelector('.role').style.opacity = String(1 - phase(progress, 0, .45));
    identity.querySelector('.role').style.visibility = progress > .8 ? 'hidden' : 'visible';
    const textProgress = phase(progress, .40, .94);
    copy.style.opacity = String(textProgress); copy.style.transform = textProgress === 1 ? 'none' : `translateY(${(1 - textProgress) * 12}px)`;
    close.style.opacity = String(phase(progress, .22, .60)); related.style.opacity = String(phase(progress, .72, 1));
    const extra = phase(progress, .65, 1); timeline.setAttribute('opacity', extra);
    clips.forEach((rect, i) => {
      const x = lineX - lineWidth / 2 + lineWidth * Number(rect.dataset.start);
      rect.setAttribute('x', x); rect.setAttribute('y', lineY - mix(0, mobile ? 22 : 32, extra));
      rect.setAttribute('width', lineWidth * Number(rect.dataset.length)); rect.setAttribute('height', mix(0, mobile ? 13 : 20, extra));
    });
    ticks.forEach((tick, i) => {
      const x = lineX - lineWidth / 2 + i / 20 * lineWidth;
      tick.setAttribute('x1', x); tick.setAttribute('x2', x); tick.setAttribute('y1', lineY + 10);
      tick.setAttribute('y2', lineY + (i % 5 ? 14 : 20));
    });
    const playX = lineX - lineWidth / 2 + lineWidth * .43;
    document.getElementById('playhead').setAttribute('d', `M${playX-4},${lineY-47}L${playX+4},${lineY-47}L${playX},${lineY-41}Z M${playX},${lineY-41}L${playX},${lineY+25}`);
    const timecode = document.getElementById('timecode'); timecode.setAttribute('x', lineX - lineWidth / 2); timecode.setAttribute('y', lineY + 38);
    root.dataset.progress = progress.toFixed(4);
  }
  function animateTo(next) {
    if (transition || next === progress) return;
    destination = next; hovering = -1; pointer = { x: 0, y: 0 };
    feedback.textContent = ''; related.removeAttribute('aria-pressed');
    copy.hidden = close.hidden = related.hidden = false;
    close.disabled = related.disabled = true;
    root.dataset.state = next ? 'opening' : 'closing'; root.setAttribute('aria-busy', 'true');
    modules[0].button.setAttribute('aria-expanded', String(!!next));
    transition = { from: progress, to: next, start: performance.now(), duration: reduced.matches ? 1 : 1100 };
    request();
  }
  function finish() {
    transition = null; progress = destination; root.dataset.state = progress ? 'editing' : 'overview'; root.removeAttribute('aria-busy');
    copy.hidden = close.hidden = related.hidden = !progress;
    close.disabled = related.disabled = false;
    document.getElementById('footer-note').textContent = progress ? 'CUT / ARRANGE / REPEAT' : 'SELECT A PRACTICE ↗';
    if (progress) close.focus({ preventScroll: true }); else modules[0].button.focus({ preventScroll: true });
  }
  function tick(now) {
    raf = 0; const dt = last ? Math.min((now - last) / 1000, .05) : 1 / 60; last = now;
    if (transition) {
      const t = clamp((now - transition.start) / transition.duration);
      progress = mix(transition.from, transition.to, ease(t));
      if (t === 1) finish();
    }
    const follow = 1 - Math.exp(-dt * 10);
    offset.x = mix(offset.x, pointer.x, follow); offset.y = mix(offset.y, pointer.y, follow);
    hoverValues = hoverValues.map((v, i) => mix(v, hovering === i ? 1 : 0, follow));
    render();
    if (transition || Math.abs(offset.x - pointer.x) > .01 || Math.abs(offset.y - pointer.y) > .01 || hoverValues.some((v, i) => Math.abs(v - (hovering === i ? 1 : 0)) > .001)) request(); else last = 0;
  }
  function request() { if (!raf) raf = requestAnimationFrame(tick); }
  window.addEventListener('pointermove', event => {
    if (progress || transition || reduced.matches || event.pointerType !== 'mouse') return;
    pointer = { x: (event.clientX / W - .5) * 10, y: (event.clientY / H - .5) * 8 }; request();
  });
  document.addEventListener('pointerleave', () => { pointer = { x: 0, y: 0 }; hovering = -1; request(); });
  window.addEventListener('resize', () => { W = innerWidth; H = innerHeight; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); render(); });
  reduced.addEventListener('change', () => { pointer = offset = { x: 0, y: 0 }; if (transition && reduced.matches) { progress = destination; finish(); } render(); });
  close.addEventListener('click', () => animateTo(0));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && progress === 1 && !transition) animateTo(0); });
  related.addEventListener('click', () => { feedback.textContent = '作品链接将在正式接入时启用'; related.setAttribute('aria-pressed', 'true'); });
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); timeline.setAttribute('opacity', '0'); render();
})();
