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
  let active = 0, camera = null, aim = { x: 0, y: 0 }, aimOffset = { x: 0, y: 0 };
  const content = [
    ['剪辑不只是连接画面，<br>也是组织节奏与叙事。', '熟练使用 Premiere Pro，具备不同类型视频的剪辑经验，能够独立完成素材整理、粗剪、精剪及基础后期包装。', 'CUT / ARRANGE / REPEAT'],
    ['关注画面构图、<br>镜头语言与现场光线。', '具备独立摄影及现场拍摄经验，能够根据内容需求组织镜头，并兼顾后期剪辑所需的素材结构。', 'COMPOSE / OBSERVE / CAPTURE'],
    ['从创意构思到最终呈现，<br>关注影像表达的整体性。', '具备影像项目的导演与现场协调经验，注重拍摄、表演和后期剪辑之间的衔接。', 'CONCEPT / PRODUCTION / POST'],
    ['从创作到后期，<br>选择适合表达的工具。', '熟练使用，主要用于视频剪辑、素材管理、节奏调整和完整后期制作。', 'SELECT / MAKE / REFINE'],
    ['', '', 'BACKGROUND / PRACTICE / CURIOSITY']
  ];
  function element(tag, parent, attributes = {}) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    parent.append(node); return node;
  }
  const names = ['EDITING', 'FILMING', 'DIRECTING', 'TOOLKIT', 'PROFILE'];
  const modules = names.map((name, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'module'; button.dataset.index = index;
    button.innerHTML = `<span class="caption">${String(index + 1).padStart(2, '0')} / ${name}</span><span class="explore" aria-hidden="true">EXPLORE ↗</span>`;
    button.setAttribute('aria-label', `展开 ${name}`);
    button.setAttribute('aria-expanded', 'false'); button.setAttribute('aria-controls', 'editing-copy');
    button.addEventListener('click', () => animateTo(1, index));
    button.addEventListener('pointerenter', () => { hovering = index; request(); });
    button.addEventListener('pointerleave', () => { hovering = -1; request(); });
    button.addEventListener('focus', () => { hovering = index; request(); });
    button.addEventListener('blur', () => { hovering = -1; request(); });
    document.getElementById('modules').append(button);
    let circle = null;
    if (index) { circle = document.createElementNS(NS, index === 1 ? 'path' : index === 2 ? 'g' : 'circle'); circle.setAttribute('fill', 'none'); circle.setAttribute('stroke', 'white'); circle.setAttribute('stroke-width', '1.2'); document.getElementById('satellites').append(circle); }
    if (index === 1) circle.id = 'filming-shape';
    if (index === 2) { circle.id = 'directing-shape'; for (let n = 0; n < 3; n++) element('path', circle); }
    return { button, circle };
  });
  const additions = window.createAboutAdditions({ root, svg, copy, request, reduced });
  const clips = [ [0, .16], [.19, .13], [.36, .21], [.60, .12], [.75, .18] ].map(([start, length], i) => {
    const rect = document.createElementNS(NS, 'rect'); rect.dataset.start = start; rect.dataset.length = length;
    if (i % 2) rect.setAttribute('stroke-dasharray', '3 4'); document.getElementById('clips').append(rect); return rect;
  });
  const ticks = Array.from({ length: 21 }, () => { const line = document.createElementNS(NS, 'line'); document.getElementById('ticks').append(line); return line; });
  const filming = element('g', svg, { id: 'filming-details', fill: 'none', stroke: 'white', 'stroke-width': 1, opacity: 0 });
  const corners = element('path', filming), crosshair = element('path', filming, { id: 'crosshair' });
  const directing = element('g', svg, { id: 'directing-details', opacity: 0 });
  const connections = [0, 1].map(() => element('line', directing, { stroke: 'white', 'stroke-width': 1 }));
  const labels = [['CONCEPT', '构思'], ['PRODUCTION', '拍摄'], ['POST-PRODUCTION', '后期']].map(pair => pair.map((text, i) => {
    const label = element('text', directing, { fill: 'white', 'text-anchor': 'middle', class: i ? 'graph-label graph-zh' : 'graph-label' });
    label.textContent = text; return label;
  }));
  // A fixed command topology: four circular corners continuously flatten into a 16:9 rectangle.
  function viewfinder(shape, cx, cy, r, morph, extra, mobile) {
    const width = mix(r * 2, Math.min(W * (mobile ? .78 : .50), H * (mobile ? .18 : .24) * 16 / 9), morph);
    const height = mix(r * 2, Math.min(W * (mobile ? .78 : .50), H * (mobile ? .18 : .24) * 16 / 9) * 9 / 16, morph);
    const k = r * (1 - morph), left = cx - width / 2, right = cx + width / 2, top = cy - height / 2, bottom = cy + height / 2;
    shape.setAttribute('d', `M${left+k},${top} H${right-k} A${k},${k} 0 0 1 ${right},${top+k} V${bottom-k} A${k},${k} 0 0 1 ${right-k},${bottom} H${left+k} A${k},${k} 0 0 1 ${left},${bottom-k} V${top+k} A${k},${k} 0 0 1 ${left+k},${top} Z`);
    if (active !== 1) return;
    camera = { cx, cy, width, height };
    filming.setAttribute('opacity', extra);
    corners.setAttribute('d', [[left,top,1,1],[right,top,-1,1],[left,bottom,1,-1],[right,bottom,-1,-1]].map(([x,y,dx,dy]) => `M${x-5*dx},${y+12*dy}V${y-5*dy}H${x+12*dx}`).join(' '));
    const x = cx + aimOffset.x * extra, y = cy + aimOffset.y * extra;
    crosshair.setAttribute('d', `M${x-7},${y}H${x+7} M${x},${y-7}V${y+7}`);
  }
  // Three contiguous arcs initially form the original ring. Each arc grows to 360 degrees
  // while its centre separates and its radius changes: no replacement or opacity swap.
  function relationship(shape, cx, cy, r, morph, extra, mobile, R) {
    const spread = W * (mobile ? .32 : .28), radii = R * (mobile ? .9 : 1);
    const nodes = [-1, 0, 1].map((side, i) => {
      const x = cx + side * spread * morph, y = cy - (side ? H * .025 : 0) * morph;
      const radius = mix(r, radii * [ .50, .72, .40 ][i], morph);
      const start = -Math.PI / 2 + i * 2 * Math.PI / 3, span = mix(2 * Math.PI / 3, 2 * Math.PI, morph);
      const point = angle => `${x+radius*Math.cos(angle)},${y+radius*Math.sin(angle)}`;
      shape.children[i].setAttribute('d', `M${point(start)} A${radius},${radius} 0 0 1 ${point(start+span/2)} A${radius},${radius} 0 0 1 ${point(start+span)}`);
      return { x, y, r: radius };
    });
    if (active !== 2) return;
    directing.setAttribute('opacity', extra);
    connections.forEach((line, i) => {
      const a = nodes[i], b = nodes[i+1], dx = b.x-a.x, dy = b.y-a.y, length = Math.hypot(dx,dy) || 1;
      line.setAttribute('x1', a.x+dx/length*a.r); line.setAttribute('y1', a.y+dy/length*a.r);
      line.setAttribute('x2', b.x-dx/length*b.r); line.setAttribute('y2', b.y-dy/length*b.r);
    });
    labels.forEach((pair, i) => pair.forEach((label, j) => {
      label.setAttribute('x', nodes[i].x); label.setAttribute('y', nodes[i].y+nodes[i].r+(mobile?15:22)+j*(mobile?13:16));
    }));
  }
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
    filming.setAttribute('opacity', '0'); directing.setAttribute('opacity', '0');
    const strength = (1 - layout) * (reduced.matches ? 0 : 1);
    modules.forEach(({ button, circle }, i) => {
      const from = origin[i];
      let to = i === active ? origin[i] : i === 0 && active ? (mobile ? [.50,.91,.35] : [.20,.90,.42]) : active && i === 1 && mobile && H <= 650 ? [.90,.23,.35] : edge[i];
      // Only the two new states need extra clearance from the footer / vertical axis.
      if (active >= 3 && i === 0 && mobile && H <= 650) to = [.32,.87,.35];
      if (active === 4 && i === 3 && mobile) to = [.055,.86,.35];
      const px = offset.x * (i % 2 ? -1 : 1) * strength, py = offset.y * (i % 2 ? 1 : -1) * strength;
      let cx = W * mix(from[0], to[0], layout) + px, cy = H * mix(from[1], to[1], layout) + py;
      let r = R * mix(from[2], to[2], layout) * (1 + hoverValues[i] * .045 * strength);
      if (i === active) {
        const anchor = active === 4 ? additions.profileAnchor(W, H) : { x: lineX, y: lineY };
        cx = mix(cx, anchor.x, phase(progress, 0, .55)); cy = mix(cy, anchor.y, phase(progress, 0, .55));
      }
      button.style.width = button.style.height = `${r * 2}px`;
      button.style.transform = `translate(${cx - r}px, ${cy - r}px)`;
      button.style.opacity = String(i === active ? 1 - phase(progress, .18, .42) : mix(1, .22, layout));
      button.style.pointerEvents = progress > 0 || transition ? 'none' : 'auto';
      button.tabIndex = progress > 0 || transition ? -1 : 0;
      if (circle) {
        circle.setAttribute('opacity', i === active ? 1 : mix(1, .22, layout));
        if (i === 1) viewfinder(circle, cx, cy, r, active === 1 ? morph : 0, phase(progress,.65,1), mobile);
        else if (i === 2) relationship(circle, cx, cy, r, active === 2 ? morph : 0, phase(progress,.65,1), mobile, R);
        else if (i === active && i >= 3) additions.renderShape({ index: i, cx, cy, r, morph, W, H, progress });
        else { circle.setAttribute('cx', cx); circle.setAttribute('cy', cy); circle.setAttribute('r', r); }
      }
      else {
        const editingMorph = active === 0 ? morph : 0;
        path.setAttribute('opacity', active === 0 ? 1 : mix(1,.22,layout));
        const length = mix(2 * Math.PI * r, lineWidth, editingMorph), angle = 2 * Math.PI * (1 - editingMorph);
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
    const extra = phase(progress, .65, 1); timeline.setAttribute('opacity', active === 0 ? extra : 0);
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
    additions.renderUI(active, progress, !!transition);
    root.dataset.progress = progress.toFixed(4);
  }
  function animateTo(next, index = active) {
    if (transition || next === progress) return;
    if (next) {
      active = index;
      if (active >= 3) additions.prepare(active, modules[active].circle);
      document.getElementById('editing-title').textContent = `${String(active+1).padStart(2,'0')} / ${names[active]}`;
      copy.querySelector('.lead').innerHTML = content[active][0];
      copy.querySelector('.detail').textContent = content[active][1];
      related.dataset.module = names[active].toLowerCase();
    }
    aim = { x: 0, y: 0 };
    destination = next; hovering = -1; pointer = { x: 0, y: 0 };
    feedback.textContent = ''; related.removeAttribute('aria-pressed');
    copy.hidden = close.hidden = related.hidden = false;
    close.disabled = related.disabled = true;
    root.dataset.state = next ? 'opening' : 'closing'; root.setAttribute('aria-busy', 'true');
    modules[active].button.setAttribute('aria-expanded', String(!!next));
    transition = { from: progress, to: next, start: performance.now(), duration: reduced.matches ? 1 : 1100 };
    request();
  }
  function finish() {
    transition = null; progress = destination; root.dataset.state = progress ? names[active].toLowerCase() : 'overview'; root.removeAttribute('aria-busy');
    copy.hidden = close.hidden = related.hidden = !progress;
    close.disabled = related.disabled = false;
    document.getElementById('footer-note').textContent = progress ? content[active][2] : 'SELECT A PRACTICE ↗';
    if (!progress) additions.restore();
    if (progress) close.focus({ preventScroll: true }); else { modules[active].button.focus({ preventScroll: true }); active = 0; }
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
    aimOffset.x = mix(aimOffset.x, aim.x, follow); aimOffset.y = mix(aimOffset.y, aim.y, follow);
    hoverValues = hoverValues.map((v, i) => mix(v, hovering === i ? 1 : 0, follow));
    render();
    if (transition || Math.abs(aimOffset.x-aim.x) > .01 || Math.abs(aimOffset.y-aim.y) > .01 || Math.abs(offset.x - pointer.x) > .01 || Math.abs(offset.y - pointer.y) > .01 || hoverValues.some((v, i) => Math.abs(v - (hovering === i ? 1 : 0)) > .001)) request(); else last = 0;
  }
  function request() { if (!raf) raf = requestAnimationFrame(tick); }
  window.addEventListener('pointermove', event => {
    if (active === 1 && progress === 1 && !transition && !reduced.matches && event.pointerType === 'mouse' && camera) {
      const x = (event.clientX-camera.cx)/(camera.width/2), y = (event.clientY-camera.cy)/(camera.height/2);
      aim = Math.abs(x) <= 1 && Math.abs(y) <= 1 ? { x: x*4, y: y*4 } : { x: 0, y: 0 }; request(); return;
    }
    if (progress || transition || reduced.matches || event.pointerType !== 'mouse') return;
    pointer = { x: (event.clientX / W - .5) * 10, y: (event.clientY / H - .5) * 8 }; request();
  });
  document.addEventListener('pointerleave', () => { pointer = aim = { x: 0, y: 0 }; hovering = -1; request(); });
  window.addEventListener('resize', () => { W = innerWidth; H = innerHeight; svg.setAttribute('viewBox', `0 0 ${W} ${H}`); render(); });
  reduced.addEventListener('change', () => { pointer = offset = aim = aimOffset = { x: 0, y: 0 }; if (transition && reduced.matches) { progress = destination; finish(); } render(); });
  close.addEventListener('click', () => animateTo(0));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && progress === 1 && !transition) animateTo(0); });
  related.addEventListener('click', () => { feedback.textContent = '作品链接将在正式接入时启用'; related.setAttribute('aria-pressed', 'true'); root.dispatchEvent(new CustomEvent('about:related-works', { bubbles: true, detail: { module: names[active].toLowerCase(), index: active } })); });
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); timeline.setAttribute('opacity', '0'); render();
})();
