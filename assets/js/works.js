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
  let spacing = 300;
  const cards = projects.map((project, i) => {
    const card = document.createElement('button');
    card.className = 'card';
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
      const delta = distance(i);
      if (i === mod(Math.round(position)) && Math.abs(delta) < .15 && mode === 'idle') {
        persist(i);
        location.href = `project.html?id=${encodeURIComponent(project.id)}`;
      } else {
        go(position + delta);
      }
    });
    cardsRoot.append(card);
    return card;
  });
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
    const apply = () => {
      title.textContent = projects[i].title;
      meta.textContent = [projects[i].year, projects[i].type].filter(Boolean).join(' / ');
      title.classList.remove('changing');
    };
    if (immediate || reduced.matches) apply();
    else {
      title.classList.add('changing');
      titleTimer = setTimeout(apply, 180);
    }
  }
  function render(immediate = false) {
    const current = mod(Math.round(position));
    cards.forEach((card, i) => {
      const delta = distance(i), depth = Math.abs(delta);
      const scale = Math.max(.48, 1 - depth * .18);
      const x = delta * spacing;
      const y = Math.min(180, depth * depth * 35);
      const angle = Math.max(-12, Math.min(12, delta * 5));
      card.style.transform = `translateX(-50%) translate(${x}px, ${y}px) rotate(${angle}deg) scale(${scale})`;
      card.style.zIndex = String(100 - Math.round(depth * 10));
      card.style.opacity = String(Math.max(.25, 1 - depth * .23));
      card.style.visibility = depth > 2.6 ? 'hidden' : 'visible';
      card.tabIndex = current === i ? 0 : -1;
      card.setAttribute('aria-current', String(current === i));
      card.setAttribute('aria-label', `${projects[i].title}，${current === i ? '进入作品详情' : '选择作品'}`);
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
    if (mode === 'snap') {
      position += (target - position) * (1 - Math.exp(-13 * dt));
      if (Math.abs(target - position) < .001) { position = mod(target); target = position; mode = 'idle'; }
    }
    render();
    if (mode === 'coast' || mode === 'snap') request();
    else lastTime = 0;
  }
  function go(value) {
    if (n < 2) return;
    velocity = 0; target = Math.round(value);
    if (reduced.matches) { position = mod(target); mode = 'idle'; render(true); }
    else { mode = 'snap'; request(); }
  }
  function step(direction) { go((mode === 'snap' ? target : Math.round(position)) + direction); }
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  previous.disabled = next.disabled = n < 2;
  stage.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  stage.addEventListener('pointerdown', event => {
    if (event.button !== 0 || n < 2 || drag) return;
    drag = { id: event.pointerId, startX: event.clientX, lastX: event.clientX, lastTime: performance.now(), moved: false };
    mode = 'drag'; velocity = 0;
    // Capture only after dragging begins, so a tap still reaches the card button.
  });
  stage.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const now = performance.now();
    if (!drag.moved && Math.abs(event.clientX - drag.startX) > 6) {
      drag.moved = true;
      stage.setPointerCapture(event.pointerId);
      stage.classList.add('dragging');
    }
    if (drag.moved) {
      const delta = -(event.clientX - drag.lastX) / spacing;
      const dt = Math.max(.008, (now - drag.lastTime) / 1000);
      position += delta;
      velocity = velocity * .35 + Math.max(-8, Math.min(8, delta / dt)) * .65;
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
    else { mode = 'idle'; }
  }
  window.addEventListener('pointerup', event => release(event));
  window.addEventListener('pointercancel', event => release(event, true));
  let wheelTime = -Infinity;
  stage.addEventListener('wheel', event => {
    if (n < 2 || drag || event.ctrlKey) return;
    const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) return;
    event.preventDefault();
    const now = performance.now();
    if (now - wheelTime > 180) { step(delta > 0 ? 1 : -1); wheelTime = now; }
  }, { passive: false });
  // CSS width does not include the visual scale/rotation.
  function measure() { spacing = parseFloat(getComputedStyle(cards[0]).width) * .78; render(); }
  window.addEventListener('resize', measure);
  reduced.addEventListener('change', () => { if (reduced.matches) { mode = 'idle'; position = mod(Math.round(position)); velocity = 0; render(true); } });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; mode = 'idle'; position = mod(Math.round(position)); lastTime = 0; render(true); }
  });
  render(true); measure();
})();
