import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CircularCarousel from './vendor/CircularCarousel';

const projects = ['落日', '山脊', '海面', '城市', '光轨'].map((title, i) => ({
  title: `测试作品 ${String(i + 1).padStart(2, '0')} · ${title}`,
  src: `covers/${['sunset','mountain','ocean','city','light'][i]}.svg`
}));
function App() {
  const api = useRef(null), region = useRef(null), restored = useRef(false);
  const [selected, setSelected] = useState(0), [width, setWidth] = useState(500);
  const reference = new URLSearchParams(location.search).get('reference') === '1';
  useEffect(() => {
    const measure = () => {
      const r = region.current.getBoundingClientRect();
      // Size only the 3D installation. Its original fit routine is the final safety net.
      setWidth(reference ? 250 : Math.max(90, Math.min(r.width * .90, r.height * 2)));
    };
    const observer = new ResizeObserver(measure); observer.observe(region.current); measure();
    return () => observer.disconnect();
  }, [reference]);
  useEffect(() => {
    window.carouselPrototype = api;
    if (!restored.current && api.current) {
      restored.current = true;
      const initial = Number(new URLSearchParams(location.search).get('selected'));
      if (Number.isInteger(initial) && initial >= 0 && initial < projects.length) api.current.focusIndex(initial);
    }
    return () => { delete window.carouselPrototype; };
  }, []);
  const change = index => {
    setSelected(index);
    const url = new URL(location.href); url.searchParams.set('selected', index); history.replaceState(null, '', url);
  };
  return <>
    <h1 key={selected}>{projects[selected].title}</h1>
    <div className="installation" ref={region}>
      <CircularCarousel apiRef={api} items={projects} preset="cylinder" intro="none"
        cardWidth={width} aspectRatio={16 / 9} gap={width * .10} curve={1} tilt={reference ? -5 : -2}
        perspective={reference ? 2500 : width * 10} autoplay="off" momentum={.6} snap
        parallax={.3} stretch={.5} depthFade={.55} fadeColor="#002FA7"
        innerShade={.6} cornerRadius={Math.min(12, width * .035)} captions={false}
        onChange={change} />
    </div>
    <nav className="controls" aria-label="作品切换">
      <button id="previous" aria-label="上一个作品" onClick={() => api.current?.stepBy(-1)}>←</button>
      <span id="counter" aria-live="polite">{String(selected + 1).padStart(2, '0')} / 05</span>
      <button id="next" aria-label="下一个作品" onClick={() => api.current?.stepBy(1)}>→</button>
    </nav>
  </>;
}
createRoot(document.getElementById('app')).render(<App />);
