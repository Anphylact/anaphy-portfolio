'use strict';
(() => {
  const root = document.documentElement;
  const pages = [ ['home','index.html','HOME','首页'], ['works','works.html','WORKS','作品'], ['about','about.html','ABOUT','关于'], ['contact','contact.html','CONTACT','联系'] ];
  const base = new URL('../../', document.currentScript.src);
  const here = location.pathname.split('/').pop() || 'index.html';
  const detail = here === 'project.html';
  const current = detail ? pages[1] : pages.find(page => page[1] === here);
  if (!current) return;
  root.dataset.sitePage = detail ? 'project' : current[0];
  root.dataset.siteArriving = 'true';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let leaving = false, menu, brand, veil, outgoing, incoming;
  const absolute = name => new URL(name, base).href;
  function closeMenu(restore = false) {
    if (!menu || menu.hidden) return;
    menu.hidden = true; brand.setAttribute('aria-expanded', 'false');
    if (restore) brand.focus({ preventScroll: true });
  }
  async function go(destination) {
    const url = new URL(destination, location.href);
    if (url.origin !== location.origin || leaving) return;
    if (url.href === location.href) { closeMenu(true); return; }
    leaving = true; closeMenu(); root.dataset.siteLeaving = 'true';
    if (!reduced.matches) {
      incoming?.cancel();
      outgoing = veil.animate([{ opacity: getComputedStyle(veil).opacity }, { opacity: 1 }], { duration: 450, easing: 'ease-in-out', fill: 'forwards' });
      try { await outgoing.finished; } catch {}
    }
    location.assign(url.href);
  }
  function navigationLink(page) {
    const a = document.createElement('a'); a.href = absolute(page[1]); a.className = 'site-chapter';
    a.innerHTML = `<span class="site-en" lang="en">${page[2]}</span><span class="site-zh">${page[3]}</span>`;
    a.setAttribute('aria-label', `${page[2]} / ${page[3]}`);
    if (page === current) a.setAttribute('aria-current','page');
    return a;
  }
  function mountChrome() {
    const chrome = document.createElement('aside'); chrome.id = 'site-chrome'; chrome.setAttribute('aria-label','章节导航 / Chapter navigation');
    const rail = document.createElement('nav'); rail.id = 'site-rail'; rail.setAttribute('aria-label','章节 / Chapters');
    pages.forEach(page => rail.append(navigationLink(page))); chrome.append(rail);
    const next = pages[(pages.indexOf(current)+1)%pages.length];
    const nextLink = document.createElement('a'); nextLink.id = 'site-next'; nextLink.href = absolute(next[1]);
    nextLink.setAttribute('aria-label',`下一页：${next[3]} / Next: ${next[2]}`);
    nextLink.innerHTML = '<span class="site-next-circle" aria-hidden="true">↓</span><span class="site-next-label"><span class="site-en" lang="en">NEXT</span><span class="site-zh">下一页</span></span>';
    chrome.append(nextLink); document.body.append(chrome);
    const existing = document.querySelector('.name, .masthead > span:first-child, .signature > span:first-child');
    brand = document.createElement('button'); brand.type = 'button'; brand.id = 'site-brand';
    if (existing) {
      brand.className = existing.className;
      brand.innerHTML = existing.innerHTML;
      if (current[0] === 'home') brand.firstChild.textContent = 'GAO MINGYUAN';
      existing.replaceWith(brand);
    } else { brand.textContent = 'GAO MINGYUAN'; brand.className = 'site-brand-new'; chrome.append(brand); }
    brand.setAttribute('aria-label','GAO MINGYUAN · 快捷导航 / Quick navigation');
    brand.setAttribute('aria-expanded','false'); brand.setAttribute('aria-controls','site-quick');
    menu = document.createElement('nav'); menu.id = 'site-quick'; menu.hidden = true; menu.setAttribute('aria-label','快捷导航 / Quick navigation');
    pages.forEach(page => menu.append(navigationLink(page))); document.body.append(menu);
    brand.addEventListener('click', () => { const open = menu.hidden; menu.hidden = !open; brand.setAttribute('aria-expanded',String(open)); if (open) menu.querySelector('a').focus({preventScroll:true}); });
    document.addEventListener('pointerdown', event => { if (!menu.contains(event.target) && !brand.contains(event.target)) closeMenu(); });
    document.addEventListener('focusin', event => { if (!menu.contains(event.target) && !brand.contains(event.target)) closeMenu(); });
    document.addEventListener('keydown', event => {
      if (menu.hidden) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); closeMenu(true); }
      else if (['ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
        event.preventDefault(); const links = [...menu.children], index = links.indexOf(document.activeElement);
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? 3 : (index + (event.key === 'ArrowDown' ? 1 : -1) + 4)%4;
        links[nextIndex].focus();
      }
    }, true);
  }
  async function enter() {
    // Head-time blue cover prevents unstyled/white frames between independent documents.
    veil.style.opacity = '1'; delete root.dataset.siteArriving;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (leaving) return;
    if (!reduced.matches) {
      incoming = veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-in-out', fill: 'forwards' });
      try { await incoming.finished; } catch {}
    }
    veil.style.opacity = '0'; incoming?.cancel();
  }
  function start() {
    veil = document.createElement('div'); veil.id = 'site-transition'; veil.setAttribute('aria-hidden','true'); document.body.append(veil);
    if (!detail) mountChrome();
    document.addEventListener('click', event => {
      const a = event.target.closest('a[href]');
      if (!a || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || a.hasAttribute('download') || (a.target && a.target !== '_self')) return;
      const url = new URL(a.href);
      if (url.origin !== location.origin || ![...pages.map(p=>p[1]),'project.html'].some(name => url.pathname === new URL(name,base).pathname)) return;
      event.preventDefault(); void go(url.href);
    });
    // The approved ABOUT emits this integration hook without changing its morph logic.
    document.addEventListener('about:related-works', () => {
      const feedback = document.getElementById('feedback'); if (feedback) feedback.textContent = '正在前往作品选集…';
      void go(absolute('works.html'));
    });
    if (detail) document.getElementById('back')?.setAttribute('aria-label','返回作品选集 / Back to works');
    if (current[0] === 'about') {
      document.getElementById('close').textContent = '× CLOSE / 关闭';
      document.getElementById('related').textContent = '↗ VIEW RELATED WORKS / 查看相关作品';
    }
    // Warm only the following chapter's static files; never execute its interaction code here.
    const warm = () => {
      const resources = {
        home: ['works.html','assets/js/works.js','assets/js/projects-data.js','assets/css/works.css','assets/css/works-carousel.css'],
        works: ['about.html','prototypes/about-interaction/about.js','prototypes/about-interaction/toolkit-profile.js','prototypes/about-interaction/about.css','prototypes/about-interaction/toolkit-profile.css'],
        about: ['contact.html','prototypes/contact-interaction/contact.js','prototypes/contact-interaction/contact-config.js','prototypes/contact-interaction/contact.css'],
        contact: ['index.html','bubbles.js']
      };
      for (const path of resources[current[0]]) { const link=document.createElement('link'); link.rel='prefetch'; link.href=absolute(path); document.head.append(link); }
    };
    if (!detail) { if ('requestIdleCallback' in window) requestIdleCallback(warm,{timeout:1500}); else setTimeout(warm,300); }
    void enter();
  }
  document.addEventListener('DOMContentLoaded', start, { once: true });
  // A page restored from bfcache must not retain the outgoing opaque curtain or input lock.
  window.addEventListener('pageshow', event => {
    if (!event.persisted || !veil) return;
    leaving = false; delete root.dataset.siteLeaving; outgoing?.cancel(); incoming?.cancel(); closeMenu(); void enter();
  });
  reduced.addEventListener('change', () => { if (reduced.matches) { incoming?.cancel(); outgoing?.finish(); } });
})();
