'use strict';
// Isolated additions: the approved three renderers, positions and easing remain in about.js.
window.createAboutAdditions = ({ root, svg, copy, request, reduced }) => {
  const NS = 'http://www.w3.org/2000/svg', mix = (a,b,t) => a+(b-a)*t;
  const ease = t => (1-Math.cos(Math.PI*Math.max(0,Math.min(1,t))))/2;
  const tools = [
    ['PREMIERE PRO', '熟练使用，主要用于视频剪辑、素材管理、节奏调整和完整后期制作。'],
    ['AFTER EFFECTS', '用于剪辑辅助动画、动态包装和基础视觉效果。'],
    ['PHOTOSHOP', '熟练用于图像编辑与视觉素材制作。'],
    ['DAVINCI RESOLVE', '具备基础调色与剪辑操作能力。'],
    ['剪映', '熟练用于短视频剪辑与快速制作。'],
    ['LIGHTROOM', '用于摄影作品的基础参数调整。'],
    ['MEDIA ENCODER', '用于视频转码与输出管理。'],
    ['AI TOOLS', '具有生成式 AI 影像及辅助制作工作流的实践经验。']
  ];
  const detail = copy.querySelector('.detail');
  const matrix = document.createElement('div'); matrix.id = 'tool-matrix'; matrix.hidden = true;
  matrix.setAttribute('role', 'group'); matrix.setAttribute('aria-label', '选择软件查看能力说明'); root.append(matrix);
  let selected = 0, descriptionAnimation = null, selectionVersion = 0, mounted = null, scrollRatio = 0;
  function cancelDescription() { selectionVersion++; descriptionAnimation?.cancel(); descriptionAnimation = null; }
  const choices = tools.map(([name, description], index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'tool-choice';
    button.textContent = name; button.setAttribute('aria-controls', 'tool-description');
    button.addEventListener('click', async () => {
      if (matrix.inert || root.dataset.state !== 'toolkit' || index === selected) return;
      selected = index; choices.forEach((choice,i) => choice.setAttribute('aria-pressed', String(i === selected)));
      cancelDescription(); const version = selectionVersion;
      if (reduced.matches) { detail.textContent = description; return; }
      try {
        descriptionAnimation = detail.animate([{ opacity: .8, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(-3px)' }], { duration: 130, fill: 'forwards' });
        await descriptionAnimation.finished;
        if (version !== selectionVersion) return;
        descriptionAnimation.cancel(); detail.textContent = description;
        descriptionAnimation = detail.animate([{ opacity: 0, transform: 'translateY(3px)' }, { opacity: .8, transform: 'translateY(0)' }], { duration: 180, fill: 'forwards' });
        await descriptionAnimation.finished;
        if (version === selectionVersion) { descriptionAnimation.cancel(); descriptionAnimation = null; }
      } catch (error) { if (error.name !== 'AbortError') throw error; }
    });
    matrix.append(button); return button;
  });
  const profile = document.createElement('section'); profile.id = 'profile-scroll'; profile.hidden = true;
  profile.tabIndex = 0; profile.setAttribute('aria-label', '个人经历时间轴，可独立纵向滚动');
  profile.innerHTML = `<div class="profile-track">
    <section><h3>EDUCATION <span>/ 教育背景</span></h3><p>东西大学（동서대학교）<br>影像内容学科<br>艺术学硕士</p></section>
    <section><h3>EXPERIENCE <span>/ 项目经历</span></h3><p class="profile-placeholder">项目经历待补充</p><p class="profile-note">保留可编辑区域，后续填写真实项目。</p></section>
    <section><h3>INTERESTS <span>/ 创作兴趣</span></h3><p>影像叙事、动画、游戏文化与视觉表达。</p></section>
    <section><h3>RESUME <span>/ 简历</span></h3><a id="resume-link" aria-disabled="true" role="link">↓ DOWNLOAD CV</a><p id="resume-status" class="profile-note">简历文件待接入</p></section>
  </div>`;
  root.append(profile);
  profile.addEventListener('scroll', () => {
    if (root.dataset.state === 'closing') return;
    scrollRatio = profile.scrollTop / Math.max(1, profile.scrollHeight-profile.clientHeight); request();
  }, { passive: true });
  // Future real CV integration. No href, download or network request exists until configured.
  window.AboutPrototype = Object.freeze({
    setResume(value) {
      const link = profile.querySelector('#resume-link'), status = profile.querySelector('#resume-status');
      if (!value) { link.removeAttribute('href'); link.setAttribute('aria-disabled','true'); status.textContent='简历文件待接入'; return; }
      const url = new URL(value, document.baseURI);
      if (!['https:','http:'].includes(url.protocol) && !(url.protocol === 'file:' && location.protocol === 'file:')) throw new TypeError('简历仅支持真实文件路径或 HTTP(S) 链接');
      link.href = url.href; link.removeAttribute('aria-disabled'); status.textContent = '简历已接入';
    }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) { cancelDescription(); if (mounted?.index === 3) detail.textContent = tools[selected][1]; }
  });
  const groups = [3,4].map(index => {
    const group = document.createElementNS(NS, 'g'); group.id = index === 3 ? 'toolkit-shape' : 'profile-shape';
    group.setAttribute('fill','none'); group.setAttribute('stroke','white'); group.setAttribute('stroke-width','1.2');
    for (let i=0;i<(index===3?8:1);i++) { const path=document.createElementNS(NS,'path'); group.append(path); }
    return group;
  });
  const markers = document.createElementNS(NS, 'g'); markers.id='profile-markers'; markers.setAttribute('fill','white'); markers.setAttribute('opacity','0'); svg.append(markers);
  const markerNodes = Array.from(profile.querySelectorAll('.profile-track > section'), () => { const dot = document.createElementNS(NS,'circle'); dot.setAttribute('r','2'); markers.append(dot); return dot; });
  function profileGeometry(W,H) {
    const mobile = W<=650, top = H*(mobile?.33:.36), height = H*(mobile?.52:.48);
    const fits = profile.clientHeight > 0 && profile.scrollHeight <= profile.clientHeight + 1;
    return { x: W*(mobile?.125:.31), top, height, length: height*(.88+.12*(fits ? 1 : scrollRatio)) };
  }
  function toolPositions(W,H) {
    const coords = W<=650 ? [[.12,.55],[.57,.55],[.16,.63],[.54,.63],[.10,.71],[.59,.71],[.20,.79],[.53,.79]] : [[.20,.60],[.47,.57],[.73,.60],[.26,.69],[.53,.67],[.76,.70],[.34,.78],[.60,.78]];
    return coords.map(([x,y]) => ({ x:x*W, y:y*H }));
  }
  return {
    prepare(index, circle) {
      cancelDescription(); root.dataset.extra = index===3?'toolkit':'profile';
      const shape = groups[index-3]; mounted = { index, circle, shape };
      if (index===3) {
        selected=0; choices.forEach((b,i)=>b.setAttribute('aria-pressed',String(!i)));
        detail.id='tool-description'; detail.setAttribute('aria-live','polite'); detail.setAttribute('aria-atomic','true');
      } else { profile.hidden=false; profile.style.opacity='0'; profile.inert=true; profile.scrollTop=0; scrollRatio=0; }
      // Mount only after the paths already describe the exact displayed circular contour.
      this.renderShape({ index, cx:Number(circle.getAttribute('cx')), cy:Number(circle.getAttribute('cy')), r:Number(circle.getAttribute('r')), morph:0, W:innerWidth, H:innerHeight });
      circle.replaceWith(shape);
    },
    profileAnchor(W,H) { const g=profileGeometry(W,H); return { x:g.x, y:g.top+g.length/2 }; },
    renderShape({ index,cx,cy,r,morph,W,H }) {
      const shape=groups[index-3]; shape.setAttribute('opacity','1');
      if (index===3) {
        const positions=toolPositions(W,H);
        shape.setAttribute('stroke-width',mix(1.2,3,morph));
        positions.forEach((point,i)=>{
          const x=mix(cx,point.x,morph), y=mix(cy,point.y,morph), radius=mix(r,1.5,morph);
          const start=-Math.PI/2+i*Math.PI/4, span=mix(Math.PI/4,2*Math.PI,morph);
          const at=a=>`${x+radius*Math.cos(a)},${y+radius*Math.sin(a)}`;
          shape.children[i].setAttribute('d',`M${at(start)} A${radius},${radius} 0 0 1 ${at(start+span/2)} A${radius},${radius} 0 0 1 ${at(start+span)}`);
          choices[i].style.transform=`translate(${point.x+12}px,${point.y-22}px)`;
        });
      } else {
        const g=profileGeometry(W,H), length=mix(2*Math.PI*r,g.length,morph), angle=2*Math.PI*(1-morph);
        const mean=angle>.001?Math.sin(angle/2)/(angle/2):1;
        const points=Array.from({length:129},(_,n)=>{
          const s=n/128-.5, x=angle>.001?-length/angle*(Math.cos(angle*s)-mean):0, y=angle>.001?length/angle*Math.sin(angle*s):length*s;
          return `${n?'L':'M'}${(cx+x).toFixed(3)},${(cy+y).toFixed(3)}`;
        });
        shape.firstChild.setAttribute('d',points.join(' '));
        profile.querySelectorAll('.profile-track > section').forEach((section,i)=>{
          const y=g.top+section.offsetTop-profile.scrollTop+8;
          markerNodes[i].setAttribute('cx',g.x); markerNodes[i].setAttribute('cy',y);
          markerNodes[i].setAttribute('visibility',y>=g.top+2&&y<=g.top+g.length-2?'visible':'hidden');
        });
      }
    },
    renderUI(active,progress,transition) {
      const shown=active>=3&&progress>0, opacity=ease((progress-.40)/.54);
      matrix.hidden=!(shown&&active===3); profile.hidden=!(shown&&active===4);
      matrix.inert=profile.inert=progress!==1||transition;
      matrix.style.opacity=profile.style.opacity=String(opacity);
      markers.setAttribute('opacity',shown&&active===4?ease((progress-.65)/.35):0);
      if (transition) cancelDescription();
    },
    restore() {
      cancelDescription(); if (mounted) { mounted.shape.replaceWith(mounted.circle); mounted=null; }
      delete root.dataset.extra; matrix.hidden=profile.hidden=true;
      markers.setAttribute('opacity','0'); detail.removeAttribute('id'); detail.removeAttribute('aria-live'); detail.removeAttribute('aria-atomic');
    }
  };
};
