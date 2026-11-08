'use strict';
(() => {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const embedded = parent !== window && new URLSearchParams(location.search).has('site-detail');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const back = document.getElementById('back'), video = document.getElementById('video');
  const placeholder = document.getElementById('placeholder'), poster = document.getElementById('poster');
  const note = document.getElementById('video-note'), play = document.getElementById('play-video');
  const nav = document.getElementById('project-navigation'), counter = document.getElementById('project-counter');
  const content = [document.querySelector('.information'), document.querySelector('.media')];
  let index = -1, busy = false, generation = 0, animations = [];
  const pad = n => String(n).padStart(2, '0');
  function release() {
    generation++;
    video.pause();
    if (video.hasAttribute('src')) { video.removeAttribute('src'); video.load(); }
    video.removeAttribute('poster'); video.hidden = true;
  }
  function cancel() { animations.forEach(a => a.cancel()); animations = []; }
  function render(id) {
    release();
    index = projects.findIndex(project => project.id === id);
    const project = projects[index];
    back.href = `works.html${id ? '?selected=' + encodeURIComponent(id) : ''}`;
    poster.hidden = true; poster.removeAttribute('src'); play.hidden = true; placeholder.hidden = false;
    note.hidden = false;
    nav.querySelectorAll('button').forEach(button => button.disabled = projects.length < 2);
    counter.textContent = `${pad(Math.max(0,index + 1))} / ${pad(projects.length)}`;
    if (!project) {
      document.getElementById('title').textContent = '未找到作品';
      document.getElementById('description').textContent = '作品可能已移除，或链接不完整。请返回作品选集重新选择。';
      for (const key of ['year','type','role']) document.getElementById(key).textContent = '—';
      placeholder.querySelector('p').textContent = '暂无可显示的影像';
      placeholder.querySelector('small').textContent = '可切换作品，或关闭后返回作品选集';
      note.hidden = true; return;
    }
    document.title = `${project.title} · GAO MINGYUAN`;
    try { sessionStorage.setItem('anaphy-selected',project.id); } catch {}
    document.getElementById('number').textContent = `作品 ${pad(index+1)} / ${pad(projects.length)}`;
    for (const key of ['title','year','type','role','description']) document.getElementById(key).textContent = project[key] || (key === 'year' ? '年份待填写' : '待填写');
    if (project.cover) { poster.src = project.cover; poster.hidden = false; video.poster = project.cover; }
    placeholder.querySelector('span').textContent = project.video ? 'VIDEO / 作品影像' : 'VIDEO / COMING SOON';
    placeholder.querySelector('p').textContent = project.video ? '点击播放作品' : '视频待上传';
    placeholder.querySelector('small').textContent = project.video ? 'PLAY VIDEO / 播放视频' : '作品影像将在这里呈现';
    placeholder.hidden = !!project.cover;
    play.hidden = !project.video;
    note.textContent = project.video ? '点击播放后加载视频 / Video loads when you press play' : '此作品尚未添加视频';
  }
  async function show(id,{animate=false,direction=1}={}) {
    const turn=++generation; cancel(); video.pause(); busy=true; nav.setAttribute('aria-busy','true');
    nav.querySelectorAll('button').forEach(button=>button.disabled=true);
    const move = async (opening) => {
      if(!animate||reduced.matches||!Element.prototype.animate)return;
      animations=content.map(node=>node.animate(opening ? [{opacity:0,transform:`translateX(${direction*12}px)`},{opacity:1,transform:'none'}] : [{opacity:1,transform:'none'},{opacity:0,transform:`translateX(${-direction*12}px)`}],{duration:180,easing:'cubic-bezier(.4,0,.2,1)',fill:'both'}));
      await Promise.all(animations.map(a=>a.finished.catch(()=>{})));
    };
    await move(false); if(turn!==generation)return false;
    // No new document, stylesheets or video nodes are created during a switch.
    render(id); const rendered=generation;
    nav.querySelectorAll('button').forEach(button=>button.disabled=true);
    await move(true); if(rendered!==generation)return false;
    cancel(); busy=false; nav.removeAttribute('aria-busy');
    nav.querySelectorAll('button').forEach(button=>button.disabled=projects.length<2);
    return true;
  }
  function step(direction) {
    if(busy||projects.length<2)return;
    const next=projects[index<0?(direction>0?0:projects.length-1):(index+direction+projects.length)%projects.length];
    if(embedded)parent.postMessage({channel:'portfolio-detail',type:'select',id:next.id,direction},location.origin);
    else {
      const url=new URL(location.href);url.searchParams.set('id',next.id);history.replaceState({project:next.id},'',url);
      void show(next.id,{animate:true,direction});
    }
  }
  nav.querySelector('[data-direction="-1"]').addEventListener('click',()=>step(-1));
  nav.querySelector('[data-direction="1"]').addEventListener('click',()=>step(1));
  poster.addEventListener('error',()=>{poster.hidden=true;placeholder.hidden=false;});
  play.addEventListener('click',()=>{
    const project=projects[index];if(!project?.video||busy)return;
    const turn=generation;
    video.src=project.video;video.hidden=false;poster.hidden=true;placeholder.hidden=true;play.hidden=true;
    note.textContent='视频加载中 / Loading video…';
    const playing=video.play();
    playing?.catch(()=>{if(turn===generation&&!video.error)note.textContent='请使用播放器继续播放 / Use the player to continue';});
  });
  video.addEventListener('playing',()=>{note.textContent='视频不自动播放 / Playback is controlled by you';});
  video.addEventListener('error',()=>{
    if(!video.hasAttribute('src'))return;
    release();poster.hidden=!projects[index]?.cover;placeholder.hidden=false;play.hidden=!projects[index]?.video;
    placeholder.querySelector('p').textContent='视频暂时无法播放';placeholder.querySelector('small').textContent='请重试或切换作品 / Retry or browse another project';
    note.textContent='视频未能加载 / Video unavailable';
  });
  window.addEventListener('pagehide',release);
  if(!embedded)window.addEventListener('popstate',()=>void show(new URLSearchParams(location.search).get('id'),{animate:true}));
  window.PortfolioProject=Object.freeze({show,release,getId:()=>projects[index]?.id,isBusy:()=>busy});
  render(new URLSearchParams(location.search).get('id'));
})();
