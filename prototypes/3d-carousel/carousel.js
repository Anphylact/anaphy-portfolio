'use strict';
(() => {
  const projects = [
    { title: '测试封面 01 · 落日', cover: 'covers/sunset.svg' },
    { title: '测试封面 02 · 山脊', cover: 'covers/mountain.svg' },
    { title: '测试封面 03 · 海面', cover: 'covers/ocean.svg' },
    { title: '测试封面 04 · 城市', cover: 'covers/city.svg' },
    { title: '测试封面 05 · 光轨', cover: 'covers/light.svg' }
  ];
  const stage = document.getElementById('carousel'), ring = document.getElementById('ring');
  const title = document.getElementById('title'), counter = document.getElementById('counter');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const count = projects.length, stepAngle = 360 / count;
  const wrap = value => ((value % count) + count) % count;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let initial = Number(new URLSearchParams(location.search).get('selected'));
  if (!Number.isInteger(initial)) initial = 0;
  let position = wrap(initial), target = position, velocity = 0, mode = 'idle';
  let frame = 0, lastTime = 0, drag = null, spacing = 200, selected = -1, wheelTimer = 0, titleTimer = 0, suppressClickUntil = 0;
  const dialog = document.getElementById('detail');
  const cards = projects.map((project, index) => {
    const card = document.createElement('button');
    card.className = 'card'; card.type = 'button'; card.dataset.index = index;
    for (const side of ['front', 'back']) {
      const face = document.createElement('div'); face.className = `face ${side}`;
      const img = document.createElement('img'); img.src = project.cover; img.alt = ''; img.draggable = false;
      const label = document.createElement('span'); label.textContent = side === 'front' ? project.title : `背面 / ${String(index + 1).padStart(2, '0')}`;
      face.append(img, label); face.setAttribute('aria-hidden', 'true'); card.append(face);
    }
    card.addEventListener('click', () => {
      if (performance.now() < suppressClickUntil) return;
      const nearest = position + wrap(index - position + count / 2) - count / 2;
      if (wrap(Math.round(position)) === index && Math.abs(nearest - position) < .025 && mode === 'idle') {
        document.getElementById('detail-title').textContent = project.title;
        document.getElementById('detail-cover').src = project.cover;
        dialog.showModal();
      } else go(nearest);
    });
    ring.append(card); return card;
  });
  function render(immediate = false) {
    // Only one rigid ring rotates. Five persistent cards retain their physical slots.
    ring.style.transform = `rotateY(${-position * stepAngle}deg)`;
    // A gentle mechanical swivel keeps side images readable without flattening the ring.
    // Sine is continuous through every full turn; no card wraps or changes depth order manually.
    cards.forEach((card, i) => {
      const worldAngle = (i - position) * stepAngle * Math.PI / 180;
      const swivel = -35 * Math.sin(worldAngle);
      card.style.transform = `rotateY(${i * stepAngle}deg) translateZ(${parseFloat(stage.style.getPropertyValue('--radius'))}px) rotateY(${swivel}deg) rotateX(12deg)`;
    });
    const index = wrap(Math.round(position));
    cards.forEach((card, i) => {
      card.tabIndex = i === index ? 0 : -1;
      card.setAttribute('aria-current', String(i === index));
      card.setAttribute('aria-label', `${projects[i].title}，${i === index ? '查看测试说明' : '旋转至前方'}`);
    });
    if (selected !== index) {
      selected = index;
      title.textContent = projects[index].title;
      counter.textContent = `${String(index + 1).padStart(2, '0')} / 05`;
      const url = new URL(location.href); url.searchParams.set('selected', index); history.replaceState(null, '', url);
      clearTimeout(titleTimer); title.classList.remove('entering');
      if (!immediate && !reduced.matches) { void title.offsetWidth; title.classList.add('entering'); titleTimer = setTimeout(() => title.classList.remove('entering'), 240); }
    }
  }
  function request() { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); }
  function tick(now) {
    frame = 0; const dt = lastTime ? Math.min(.04, (now - lastTime) / 1000) : 1 / 60; lastTime = now;
    if (mode === 'coast') {
      position += velocity * dt; velocity *= Math.exp(-5.5 * dt);
      if (Math.abs(velocity) < .1) { target = Math.round(position); mode = 'snap'; }
    }
    if (mode === 'snap' || mode === 'wheel') {
      const eased = (target - position) * (1 - Math.exp(-12 * dt));
      position += clamp(eased, -5 * dt, 5 * dt);
      if (mode === 'snap' && Math.abs(target - position) < .001) { position = target; mode = 'idle'; }
    }
    render();
    if (['coast', 'snap', 'wheel'].includes(mode)) request(); else lastTime = 0;
  }
  function go(value) {
    clearTimeout(wheelTimer); target = Math.round(value); velocity = 0;
    if (reduced.matches) { position = target; mode = 'idle'; render(true); }
    else { mode = 'snap'; request(); }
  }
  function step(direction) { go((['snap', 'wheel'].includes(mode) ? target : Math.round(position)) + direction); }
  document.getElementById('previous').addEventListener('click', () => step(-1));
  document.getElementById('next').addEventListener('click', () => step(1));
  stage.addEventListener('keydown', event => {
    if (drag?.moved) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1); }
  });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || drag) return;
    clearTimeout(wheelTimer); mode = 'idle'; velocity = 0;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, origin: position, time: performance.now(), moved: false, samples: [] };
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || drag.id !== event.pointerId) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) > 6) {
      if (event.pointerType !== 'mouse' && Math.abs(dy) > Math.abs(dx)) return;
      drag.moved = true; mode = 'drag'; stage.setPointerCapture(event.pointerId); stage.classList.add('dragging');
    }
    if (!drag.moved) return;
    const now = performance.now(); position = drag.origin - dx / spacing;
    drag.samples.push({ p: position, t: now }); drag.samples = drag.samples.filter(sample => now - sample.t < 100);
    const first = drag.samples[0]; velocity = clamp((position - first.p) / Math.max(.016, (now - first.t) / 1000), -4, 4);
    drag.time = now; render();
  });
  function release(event, cancelled = false) {
    if (!drag || drag.id !== event.pointerId) return;
    const moved = drag.moved;
    if (cancelled || performance.now() - drag.time > 100) velocity = 0;
    drag = null; stage.classList.remove('dragging');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (moved) suppressClickUntil = performance.now() + 350;
    if (!moved && Math.abs(position - Math.round(position)) < .001) { mode = 'idle'; return; }
    if (moved && !reduced.matches && Math.abs(velocity) > .1) { mode = 'coast'; request(); }
    else go(Math.round(position));
  }
  window.addEventListener('pointerup', event => release(event));
  window.addEventListener('pointercancel', event => release(event, true));
  stage.addEventListener('wheel', event => {
    if (drag || event.ctrlKey) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return; event.preventDefault();
    if (reduced.matches) { step(Math.sign(delta)); return; }
    clearTimeout(wheelTimer);
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
    if (mode !== 'wheel') target = position;
    target += clamp(delta * unit / spacing, -.8, .8); mode = 'wheel'; velocity = 0; request();
    wheelTimer = setTimeout(() => go(target), 160);
  }, { passive: false });
  function resize() {
    const width = parseFloat(getComputedStyle(cards[0]).width);
    const radius = width * 1.15;
    stage.style.setProperty('--radius', `${radius}px`);
    stage.style.setProperty('--perspective', `${width * 2.8}px`);
    cards.forEach((card, i) => { card.style.transform = `rotateY(${i * stepAngle}deg) translateZ(${radius}px) rotateX(12deg)`; });
    spacing = width * .8;
    render(true);
  }
  window.addEventListener('resize', resize);
  reduced.addEventListener('change', () => { if (reduced.matches) go(Math.round(position)); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; clearTimeout(wheelTimer); mode = 'idle'; position = Math.round(position); lastTime = 0; render(true); }
  });
  document.getElementById('close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => cards[selected].focus({ preventScroll: true }));
  resize();
})();
