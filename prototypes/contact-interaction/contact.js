'use strict';
(() => {
  const root = document.getElementById('contact'), frame = document.getElementById('viewfinder');
  const mark = document.getElementById('focus-mark'), reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const en = document.getElementById('focus-en'), zh = document.getElementById('focus-zh'), camera = document.getElementById('camera-state');
  const emailLink = document.getElementById('email'), copyButton = document.getElementById('copy-email'), resumeLink = document.getElementById('resume');
  const feedback = document.getElementById('copy-feedback');
  let raf = 0, last = 0, animation = null, scale = 1;
  const position = { x: 0, y: 0 }, velocity = { x: 0, y: 0 }, target = { x: 0, y: 0 };
  let contact = { email: null, resumeUrl: null }, copyVersion = 0;
  const ease = x => (1-Math.cos(Math.PI*Math.max(0,Math.min(1,x))))/2;
  const mix = (a,b,t) => a+(b-a)*t;
  function render() { mark.style.transform = `translate(${position.x}px,${position.y}px) scale(${scale})`; }
  function request() { if (!raf && !document.hidden) raf = requestAnimationFrame(tick); }
  function completeFocus() {
    animation = null; scale = .78; root.dataset.state = 'focused'; frame.removeAttribute('aria-busy');
    camera.textContent = 'FOCUSED / 已对焦'; en.textContent = "IN FOCUS. LET'S CONNECT."; zh.textContent = '已对焦，期待与你联系。';
    render();
  }
  function tick(now) {
    raf = 0; const dt = last ? Math.min((now-last)/1000,.05) : 1/60; last = now;
    // Analytic critically damped spring: retained velocity, no frame-rate dependent overshoot.
    const omega = 15, decay = Math.exp(-omega*dt);
    for (const axis of ['x','y']) {
      const distance = position[axis]-target[axis], step = (velocity[axis]+omega*distance)*dt;
      position[axis] = target[axis]+(distance+step)*decay;
      velocity[axis] = (velocity[axis]-omega*step)*decay;
    }
    if (animation) {
      const p = Math.min(1,(now-animation.start)/820);
      scale = p < .68 ? mix(animation.from,.60,ease(p/.68)) : mix(.60,.78,ease((p-.68)/.32));
      if (p===1) completeFocus();
    }
    render();
    const moving = ['x','y'].some(a => Math.abs(position[a]-target[a])>.01 || Math.abs(velocity[a])>.02);
    if (animation || moving) request(); else last = 0;
  }
  frame.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || reduced.matches || animation) return;
    const box = frame.getBoundingClientRect();
    target.x = Math.max(-12,Math.min(12,((event.clientX-box.left)/box.width-.5)*24));
    target.y = Math.max(-9,Math.min(9,((event.clientY-box.top)/box.height-.5)*18)); request();
  });
  frame.addEventListener('pointerleave', () => { target.x=target.y=0; request(); });
  frame.addEventListener('click', () => {
    if (animation) return;
    target.x=position.x; target.y=position.y;
    root.dataset.state='focusing'; frame.setAttribute('aria-busy','true');
    camera.textContent='FOCUSING / 对焦中'; en.textContent='FINDING FOCUS.'; zh.textContent='正在对焦…';
    if (reduced.matches) completeFocus();
    else { animation={start:performance.now(),from:scale}; request(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf=0; last=0; } else request();
  });
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    root.classList.remove('is-entering');
    position.x=position.y=target.x=target.y=velocity.x=velocity.y=0;
    if (animation) completeFocus(); render();
  });
  function normalizeEmail(value) {
    if (value===null || value===undefined || value==='') return null;
    if (typeof value!=='string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) throw new TypeError('请提供真实有效的邮箱地址');
    return value.trim();
  }
  function normalizeResume(value) {
    if (value===null || value===undefined || value==='') return null;
    if (typeof value!=='string') throw new TypeError('请提供真实简历文件路径');
    const url = new URL(value,document.baseURI);
    if (!['https:','http:'].includes(url.protocol) && !(url.protocol==='file:' && location.protocol==='file:')) throw new TypeError('简历仅支持 HTTP(S) 或本地文件路径');
    return url.href;
  }
  function configure(next = {}) {
    const merged={...contact,...next};
    const valid={email:normalizeEmail(merged.email),resumeUrl:normalizeResume(merged.resumeUrl)};
    contact=valid; copyVersion++; feedback.replaceChildren();
    document.getElementById('email-value').textContent=contact.email || '邮箱待接入';
    document.getElementById('copy-note').textContent=contact.email ? '复制到剪贴板' : '邮箱接入后启用';
    document.getElementById('resume-note').textContent=contact.resumeUrl ? '查看个人简历' : '简历文件待接入';
    copyButton.disabled=!contact.email;
    if (contact.email) { emailLink.href=`mailto:${encodeURIComponent(contact.email)}`; emailLink.removeAttribute('aria-disabled'); }
    else { emailLink.removeAttribute('href'); emailLink.setAttribute('aria-disabled','true'); }
    if (contact.resumeUrl) { resumeLink.href=contact.resumeUrl; resumeLink.target='_blank'; resumeLink.rel='noopener noreferrer'; resumeLink.removeAttribute('aria-disabled'); }
    else { resumeLink.removeAttribute('href'); resumeLink.removeAttribute('target'); resumeLink.removeAttribute('rel'); resumeLink.setAttribute('aria-disabled','true'); }
  }
  function copyFeedback(english,chinese) {
    feedback.replaceChildren();
    const first=document.createElement('span'), second=document.createElement('span'); first.lang='en'; first.textContent=english; second.textContent=chinese; feedback.append(first,second);
  }
  copyButton.addEventListener('click', async () => {
    if (!contact.email) return;
    const ticket=++copyVersion, value=contact.email; copyButton.disabled=true;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard_unavailable');
      await navigator.clipboard.writeText(value);
      if (ticket===copyVersion) copyFeedback('EMAIL COPIED.','邮箱已复制。');
    } catch {
      if (ticket===copyVersion) copyFeedback('PLEASE COPY THE ADDRESS MANUALLY.','未能自动复制，请选中邮箱手动复制。');
    } finally { if (ticket===copyVersion) copyButton.disabled=!contact.email; }
  });
  window.ContactPrototype=Object.freeze({configure});
  configure(window.CONTACT_CONFIG || {});
  if (!reduced.matches) {
    root.classList.add('is-entering');
    root.addEventListener('animationend',event => { if (event.animationName==='draw-corner' && event.target.closest('.corner-bl')) root.classList.remove('is-entering'); });
  }
  render();
})();
