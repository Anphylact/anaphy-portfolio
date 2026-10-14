import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CircularCarousel from '../../prototypes/3d-carousel/src/vendor/CircularCarousel';

const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
const pad = n => String(n).padStart(2, '0');
function savedIndex() {
  let stored = '';
  try { stored = sessionStorage.getItem('anaphy-selected') || ''; } catch {}
  const id = new URLSearchParams(location.search).get('selected') || stored;
  return Math.max(0, projects.findIndex(project => project.id === id));
}
const initialIndex = savedIndex();
function placeholder(index) {
  // Self-contained neutral artwork for missing media; no invented project imagery.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540"><rect width="960" height="540" fill="#172443"/><text x="480" y="270" text-anchor="middle" fill="white" font-family="Arial,sans-serif" font-size="112">${pad(index + 1)}</text><text x="480" y="335" text-anchor="middle" fill="white" opacity=".55" font-family="Arial,sans-serif" font-size="24">封面待上传</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
function persist(index) {
  const project = projects[index];
  if (!project) return;
  try { sessionStorage.setItem('anaphy-selected', project.id); } catch {}
  const url = new URL(location.href); url.searchParams.set('selected', project.id); history.replaceState(null, '', url);
}
function Works() {
  const api = useRef(null), region = useRef(null);
  const [selected, setSelected] = useState(initialIndex), [width, setWidth] = useState(500);
  const [failed, setFailed] = useState({});
  const items = useMemo(() => projects.map((project, index) => ({
    title: project.title || `作品 ${pad(index + 1)}`,
    src: project.cover && !failed[project.id] ? project.cover : placeholder(index)
  })), [failed]);
  useEffect(() => {
    if (!region.current) return;
    const measure = () => {
      const r = region.current.getBoundingClientRect();
      // Identical sizing and installation layout to the visually approved prototype.
      setWidth(Math.max(90, Math.min(r.width * .90, r.height * 2)));
    };
    const observer = new ResizeObserver(measure); observer.observe(region.current); measure();
    return () => observer.disconnect();
  }, []);
  useEffect(() => { persist(initialIndex); }, []);
  useEffect(() => {
    let cancelled = false;
    const images = projects.filter(project => project.cover).map(project => {
      const image = new Image();
      image.onerror = () => { if (!cancelled) setFailed(old => ({ ...old, [project.id]: true })); };
      image.src = project.cover; return image;
    });
    return () => { cancelled = true; images.forEach(image => { image.onerror = null; }); };
  }, []);
  const change = index => { setSelected(index); persist(index); };
  const openProject = (_, index) => {
    const state = api.current?.readState();
    if (!state || !projects[index]) return;
    const angle = state.angle + index * (360 / projects.length);
    const offset = ((angle + 180) % 360 + 360) % 360 - 180;
    // The source component focuses side cards first; only an aligned front card opens.
    if (Math.abs(offset) > .1) return;
    persist(index);
    location.href = `project.html?id=${encodeURIComponent(projects[index].id)}`;
  };
  if (!projects.length) return <>
    <h1>暂时还没有作品</h1>
    <nav className="controls" aria-label="作品切换"><button disabled aria-label="上一个作品">←</button><span id="counter">00 / 00</span><button disabled aria-label="下一个作品">→</button></nav>
  </>;
  return <>
    <h1 key={selected}>{items[selected].title}</h1>
    <div className="installation" ref={region}>
      <CircularCarousel apiRef={api} initialIndex={initialIndex} items={items} preset="cylinder" intro="none"
        cardWidth={width} aspectRatio={16 / 9} gap={width * .10} curve={1} tilt={-2}
        perspective={width * 10} autoplay="off" momentum={.6} snap
        parallax={.3} stretch={.5} depthFade={.55} fadeColor="#002FA7"
        innerShade={.6} cornerRadius={Math.min(12, width * .035)} captions={false}
        onChange={change} onItemClick={openProject} />
    </div>
    <nav className="controls" aria-label="作品切换">
      <button id="previous" aria-label="上一个作品" disabled={projects.length < 2} onClick={() => api.current?.stepBy(-1)}>←</button>
      <span id="counter" aria-live="polite">{pad(selected + 1)} / {pad(projects.length)}</span>
      <button id="next" aria-label="下一个作品" disabled={projects.length < 2} onClick={() => api.current?.stepBy(1)}>→</button>
    </nav>
  </>;
}
createRoot(document.getElementById('app')).render(<Works />);
