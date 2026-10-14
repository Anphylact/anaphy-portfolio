'use strict';
(() => {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const stage = document.getElementById('carousel');
  const cardsRoot = document.getElementById('cards');
  const title = document.getElementById('project-title');
  const meta = document.getElementById('project-meta');
  const counter = document.getElementById('counter');
  const previous = document.getElementById('previous');
  const next = document.getElementById('next');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const n = projects.length;
  const mod = value => ((value % n) + n) % n;
  const pad = value => String(value).padStart(2, '0');
  if (!n) {
    document.getElementById('empty').hidden = false;
    previous.disabled = next.disabled = true;
    return;
  }
  let stored = '';
  try { stored = sessionStorage.getItem('anaphy-selected') || ''; } catch {}
  const requested = new URLSearchParams(location.search).get('selected') || stored;
  let position = Math.max(0, projects.findIndex(project => project.id === requested));
  let target = position, velocity = 0, mode = 'idle', frame = 0, lastTime = 0;
  let drag = null, suppressClickUntil = 0, selected = -1, titleTimer = 0;
  let spacing = 300, radius = 800;
  const arcStep = .38;
  let wheelTimer = 0;
  // Short collections need repeated visual instances to keep both sides continuous.
  const copies = n < 5 && n > 1 ? [-2, -1, 0, 1, 2] : [0];
  const cards = copies.flatMap(copy => projects.map((project, i) => {
    const card = document.createElement('button');
    card.className = 'card';
    card.dataset.index = i;
    card.dataset.copy = copy;
    card.type = 'button';
    card.setAttribute('aria-label', `${project.title}，选择作品`);
    const placeholder = document.createElement('div');
    placeholder.className = 'cover-placeholder';
    const number = document.createElement('span');
    number.className = 'cover-number';
    number.textContent = pad(i + 1);
    const label = document.createElement('small');
    label.textContent = '封面待上传';
    placeholder.append(number, label);
    card.append(placeholder);
    if (project.cover) {
      const image = document.createElement('img');
      image.alt = '';
      image.draggable = false;
      image.addEventListener('error', () => image.remove());
      image.src = project.cover;
      card.append(image);
    }
    const caption = document.createElement('span');
    caption.className = 'card-caption';
    caption.textContent = project.title;
    card.append(caption);
    card.addEventListener('click', () => {
      if (performance.now() < suppressClickUntil) return;
      const delta = distance(i) + copy * n;
      if (i === mod(Math.round(position)) && Math.abs(delta) < .15 && mode === 'idle' && copy === 0) {
        persist(i);
        location.href = `project.html?id=${encodeURIComponent(project.id)}`;
      } else {
        go(position + delta);
      }
    });
    cardsRoot.append(card);
    return card;
  }));
  function distance(i) {
    let delta = mod(i - position + n / 2) - n / 2;
    if (n === 1) delta = -position;
    return delta;
  }
  function persist(i) {
    try { sessionStorage.setItem('anaphy-selected', projects[i].id); } catch {}
    const url = new URL(location.href);
    url.searchParams.set('selected', projects[i].id);
    history.replaceState(null, '', url);
  }
  function updateTitle(i, immediate = false) {
    if (selected === i) return;
    selected = i;
    clearTimeout(titleTimer);
    counter.textContent = `${pad(i + 1)} / ${pad(n)}`;
    persist(i);
    // Update the text in the same render as the central selection; animate its entry only.
    title.textContent = projects[i].title;
    meta.textContent = [projects[i].year, projects[i].type].filter(Boolean).join(' / ');
    title.classList.remove('changing');
    if (!immediate && !reduced.matches) {
      void title.offsetWidth;
      title.classList.add('changing');
      titleTimer = setTimeout(() => title.classList.remove('changing'), 220);
    }
  }

  function render(immediate = false) {
    const current = mod(Math.round(position));
    cards.forEach(card => {
      const i = Number(card.dataset.index), copy = Number(card.dataset.copy);
      const delta = distance(i) + copy * n, depth = Math.abs(delta);
      const theta = delta * arcStep;
      const scale = 1 - Math.min(depth, 2.5) * .06;
      // A circle in screen coordinates: delta=0 is its lowest point.
      const x = radius * Math.sin(theta);
      const y = radius * (Math.cos(theta) - 1);
      const angle = -theta * 180 / Math.PI * .65;
      const visible = Math.abs(theta) < 1.25;
      const active = current === i && copy === 0;
      card.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${angle}deg) scale(${scale})`;
      card.style.zIndex = String(100 - Math.round(depth * 10));
      card.style.opacity = '1';
      card.style.visibility = visible ? 'visible' : 'hidden';
      card.tabIndex = active ? 0 : -1;
      card.setAttribute('aria-hidden', String(!visible));
      card.setAttribute('aria-current', String(active));
      card.setAttribute('aria-label', `${projects[i].title}，${active ? '进入作品详情' : '选择作品'}`);
    });
    updateTitle(current, immediate);
  }
  function request() { if (!frame) frame = requestAnimationFrame(tick); }
  function tick(now) {
    frame = 0;
    const dt = lastTime ? Math.min((now - lastTime) / 1000, .04) : 1 / 60;
    lastTime = now;
    if (mode === 'coast') {
      position += velocity * dt;
      velocity *= Math.exp(-5 * dt);
      if (Math.abs(velocity) < .12) { target = Math.round(position); mode = 'snap'; }
    }
    if (mode === 'snap' || mode === 'wheel') {
      const eased = (target - position) * (1 - Math.exp(-13 * dt));
      // Bound travel per frame when many commands arrive before the next paint.
      position += Math.max(-8 * dt, Math.min(8 * dt, eased));
      if (mode === 'snap' && Math.abs(target - position) < .001) { position = target; mode = 'idle'; }
    }
    render();
    if (mode === 'coast' || mode === 'snap' || mode === 'wheel') request();
    else lastTime = 0;
  }
  function go(value) {
    if (n < 2) return;
    clearTimeout(wheelTimer);
    velocity = 0; target = Math.round(value);
    if (reduced.matches) { position = mod(target); mode = 'idle'; render(true); }
    else { mode = 'snap'; request(); }
  }
  function step(direction) { go((mode === 'snap' || mode === 'wheel' ? target : Math.round(position)) + direction); }
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  previous.disabled = next.disabled = n < 2;
  stage.addEventListener('keydown', event => {
    if (drag?.moved) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || n < 2 || drag) return;
    if (mode === 'wheel') go(Math.round(position));
    drag = { id: event.pointerId, startX: event.clientX, lastX: event.clientX, lastTime: performance.now(), moved: false };
    clearTimeout(wheelTimer);
    // Keep a tap from interrupting a running snap.
    drag.startPosition = position; drag.startY = event.clientY; drag.samples = [];
    velocity = 0;
    // Capture only after dragging begins, so a tap still reaches the card button.
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const now = performance.now();
    if (!drag.moved && Math.abs(event.clientX - drag.startX) > 6) {
      if (event.pointerType !== 'mouse' && Math.abs(event.clientY - drag.startY) > Math.abs(event.clientX - drag.startX)) return;
      drag.moved = true;
      mode = 'drag';
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('dragging');
    }
    if (drag.moved) {
      position = drag.startPosition - (event.clientX - drag.startX) / spacing;
      drag.samples.push({ position, time: now });
      drag.samples = drag.samples.filter(sample => now - sample.time < 100);
      const first = drag.samples[0];
      velocity = Math.max(-5, Math.min(5, (position - first.position) / Math.max(.016, (now - first.time) / 1000)));
      render();
    }
    drag.lastX = event.clientX; drag.lastTime = now;
  });
  function release(event, cancelled = false) {
    if (!drag || event.pointerId !== drag.id) return;
    const moved = drag.moved;
    if (performance.now() - drag.lastTime > 100 || cancelled) velocity = 0;
    drag = null;
    stage.classList.remove('dragging');
    if (stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    if (moved) suppressClickUntil = performance.now() + 350;
    if (moved && !cancelled && !reduced.matches && Math.abs(velocity) > .12) { mode = 'coast'; request(); }
    else if (moved || cancelled) { go(Math.round(position)); }
    else if (mode === 'drag') { go(Math.round(position)); }
  }
  window.addEventListener('pointerup', event => release(event));
  window.addEventListener('pointercancel', event => release(event, true));
  stage.addEventListener('wheel', event => {
    if (n < 2 || drag || event.ctrlKey) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? stage.clientHeight : 1;
    if (reduced.matches) { step(delta > 0 ? 1 : -1); return; }
    clearTimeout(wheelTimer);
    // Accumulate trackpad deltas instead of discarding events with a throttle.
    if (mode !== 'wheel') target = position;
    target += Math.max(-.85, Math.min(.85, delta * unit / spacing));
    velocity = 0; mode = 'wheel'; request();
    wheelTimer = setTimeout(() => {
      target = Math.round(target); mode = 'snap'; request();
    }, 150);
  }, { passive: false });
  function measure() {
    spacing = parseFloat(getComputedStyle(cards[0]).width) * (stage.clientWidth <= 650 ? 1.04 : 1.16);
    radius = spacing / Math.sin(arcStep);
    render();
  }
  window.addEventListener('resize', measure);
  reduced.addEventListener('change', () => { if (reduced.matches) { clearTimeout(wheelTimer); mode = 'idle'; position = mod(Math.round(position)); velocity = 0; render(true); } });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { clearTimeout(wheelTimer); cancelAnimationFrame(frame); frame = 0; mode = 'idle'; position = mod(Math.round(position)); lastTime = 0; render(true); }
  });
  render(true); measure();
})();
