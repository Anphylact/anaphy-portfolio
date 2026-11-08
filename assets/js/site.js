'use strict';
(() => {
  const root=document.documentElement, base=new URL('../../',document.currentScript.src);
  const pages=[['home','index.html','HOME','首页'],['works','works.html','WORKS','作品'],['about','about.html','ABOUT','关于'],['contact','contact.html','CONTACT','联系']];
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const absolute=name=>new URL(name,base).href;
  const pathKey=path=>path.replace(/\.html\/?$/, '').replace(/\/$/, '');
  const isProject=path=>pathKey(path)===pathKey(new URL('project.html',base).pathname);
  const pageIndex=path=>pages.findIndex(p=>pathKey(path)===pathKey(new URL(p[1],base).pathname));
  const onReady=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
  function closeControl(element,label){
    if(!element)return;
    element.classList.add('site-close');element.setAttribute('aria-label',label);element.title=label;
    element.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
  }
  const chapter=root.dataset.chapter;
  if(chapter){
    if(parent===window){ location.replace(absolute(pages.find(p=>p[0]===chapter)[1])+location.search); return; }
    bridge();return;
  }
  if(isProject(location.pathname)){
    onReady(()=>{document.body.classList.add('site-project');closeControl(document.getElementById('back'),'关闭作品详情，返回作品选集 / Close project, back to works');window.PortfolioProjectTransition?.detail();});return;
  }
  root.classList.add('site-host');onReady(host);

  function bridge(){
    const token=new URLSearchParams(location.search).get('site-frame');
    const send=(type,extra={})=>parent.postMessage({channel:'portfolio-chapters',type,token,...extra},location.origin);
    let hostPaused=false, active=false, ready=false;
    const announce=()=>send('ready',{id:chapter==='works'?new URLSearchParams(location.search).get('selected'):null});
    window.PortfolioNavigation=Object.freeze({openProject:href=>send('project',{href})});
    // Keep the approved carousel's own URL/session persistence; mirror its stable ID to the host URL.
    if(chapter==='works'){
      const replace=history.replaceState.bind(history);
      history.replaceState=(...args)=>{const result=replace(...args);send('selection',{id:new URLSearchParams(location.search).get('selected')});return result;};
    }
    function applyActivity(){
      const visible=active&&!document.hidden;root.dataset.chapterActive=String(visible);
      if(chapter==='home'){
        const motion=document.getElementById('motion');
        if(!visible&&motion?.getAttribute('aria-pressed')==='true'){hostPaused=true;motion.click();}
        else if(visible&&hostPaused){hostPaused=false;if(motion?.getAttribute('aria-pressed')==='false'&&!reduced.matches)motion.click();}
        window.PortfolioHome?.setActive(visible);
      }else if(chapter==='works')window.PortfolioWorks?.suspend(!visible);
      else if(chapter==='about')window.PortfolioAbout?.setActive(visible);
      else if(chapter==='contact')window.PortfolioContact?.setActive(visible);
    }
    document.addEventListener('visibilitychange',applyActivity);
    window.addEventListener('portfolio:works-ready',applyActivity);
    window.addEventListener('message',event=>{
      if(event.source!==parent||event.origin!==location.origin||event.data?.channel!=='portfolio-host')return;
      const data=event.data;
      if(data.type==='connect'){if(ready)announce();}
      else if(data.type==='active'){
        active=!!data.active;applyActivity();
      }
    });
    onReady(()=>{
      const existing=document.querySelector('.name, .masthead > span:first-child, .signature > span:first-child');
      const brand=existing||document.createElement('span');brand.id='site-brand';
      if(existing){if(chapter==='home')brand.firstChild.textContent='GAO MINGYUAN';}
      else{brand.textContent='GAO MINGYUAN';brand.className='site-brand-new';document.body.append(brand);}
      document.addEventListener('click',event=>{
        const a=event.target.closest('a[href]');
        if(!a||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
        const url=new URL(a.href),index=pages.findIndex(p=>url.origin===location.origin&&pathKey(url.pathname)===pathKey(new URL(p[1],base).pathname));
        if(index>=0){event.preventDefault();send('jump',{index,selected:url.searchParams.get('selected')});}
      });
      document.addEventListener('about:related-works',()=>{const feedback=document.getElementById('feedback');if(feedback)feedback.textContent='正在前往作品选集…';send('jump',{index:1});});
      if(chapter==='about'){
        closeControl(document.getElementById('close'),'关闭模块，返回关于概览 / Close module, back to About');
        document.getElementById('related').textContent='↗ VIEW RELATED WORKS / 查看相关作品';
      }
      document.addEventListener('wheel',event=>{
        if(!active||event.defaultPrevented||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
        if(event.target.closest('.circular-carousel, #profile-scroll, button:not(#focus-trigger), a, input, textarea, select, [contenteditable="true"]'))return;
        if(chapter==='about'&&document.getElementById('about').dataset.state!=='overview')return;
        const direction=Math.sign(event.deltaY);
        for(let node=event.target;node instanceof HTMLElement;node=node.parentElement){
          const style=getComputedStyle(node);
          if(/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight+1&&((direction>0&&node.scrollTop+node.clientHeight<node.scrollHeight-1)||(direction<0&&node.scrollTop>0)))return;
        }
        const scroll=document.scrollingElement;
        if(scroll.scrollHeight>innerHeight+1&&((direction>0&&scroll.scrollTop+innerHeight<scroll.scrollHeight-1)||(direction<0&&scroll.scrollTop>0)))return;
        event.preventDefault();send('wheel',{delta:event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1)});
      },{passive:false});
      // Offscreen frames may suspend rAF. Readiness must not wait for a paint that navigation itself enables.
      ready=true;applyActivity();announce();
    });
  }

  function host(){
    const viewport=document.getElementById('site-viewport'),track=document.getElementById('site-track');
    if(!viewport||!track)return;
    let current=Math.max(0,pageIndex(location.pathname)), animation=null, epoch=0, moving=false;
    let wheelSum=0,lastWheel=0,wheelDirection=0,lockUntil=0;
    const slots=pages.map((page,index)=>{
      const element=document.createElement('section');element.className='site-slot';element.dataset.chapter=page[0];element.style.top=`${index*100}%`;
      const frame=document.createElement('iframe');frame.addEventListener('load',()=>frame.contentWindow?.postMessage({channel:'portfolio-host',type:'connect'},location.origin));frame.title=`${page[2]} / ${page[3]}`;frame.name=`portfolio-${page[0]}`;
      element.append(frame);track.append(element);return{element,frame,ready:false,token:'',version:0,selected:null,resolve:null,promise:null};
    });
    const chrome=document.createElement('aside');chrome.id='site-chrome';chrome.setAttribute('aria-label','章节导航 / Chapter navigation');
    const rail=document.createElement('nav');rail.id='site-rail';rail.setAttribute('aria-label','章节 / Chapters');
    const links=pages.map((page,index)=>{
      const make=()=>{const a=document.createElement('a');a.href=absolute(page[1]);a.className='site-chapter';a.dataset.index=index;a.setAttribute('aria-label',`${page[2]} / ${page[3]}`);a.innerHTML=`<span class="site-en" lang="en">${page[2]}</span><span class="site-zh">${page[3]}</span>`;return a;};
      const a=make();rail.append(a);return a;
    });
    // Exactly one persistent indicator node. It is never replaced or faded.
    const indicator=document.createElement('div');indicator.id='site-indicator';indicator.setAttribute('aria-hidden','true');rail.append(indicator);chrome.append(rail);
    const next=document.createElement('button');next.type='button';next.id='site-next';next.innerHTML='<svg class="site-next-icon" viewBox="0 0 24 28" fill="none" aria-hidden="true"><path d="M5 5L12 11L19 5 M5 15L12 21L19 15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="site-next-label"><span class="site-en" lang="en">NEXT</span><span class="site-zh">下一页</span></span>';chrome.append(next);
    const status=document.createElement('p');status.id='site-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
    document.body.append(chrome,status);
    const detail=window.PortfolioProjectTransition.create({base,root,works:()=>slots[1].frame,
      prepare:async id=>{cancel();current=1;normalize();const ready=await load(1,id);if(!ready)throw Error('works unavailable');chromeState();activate();},
      lock:()=>{slots.forEach(s=>s.frame.inert=true);chrome.inert=true;},
      unlock:()=>{chrome.inert=false;activate();},
      error:()=>{status.textContent='作品详情未能加载，请重新选择 / Unable to load project, please try again';route(true);}
    });
    const height=()=>viewport.clientHeight;
    const transform=y=>`translate3d(0,${y}px,0)`;
    const send=(slot,type,extra={})=>slot.frame.contentWindow?.postMessage({channel:'portfolio-host',type,...extra},location.origin);
    function placeIndicator(instant=false){
      const r=rail.getBoundingClientRect(),a=links[current].getBoundingClientRect();
      const y=innerWidth<=650?a.bottom-r.top-4:a.top-r.top+a.height/2-1;
      if(instant)indicator.style.transition='none';
      indicator.style.transform=`translateY(${y}px)`;
      if(instant)requestAnimationFrame(()=>indicator.style.removeProperty('transition'));
    }
    function chromeState(instant=false){
      root.dataset.sitePage=pages[current][0];root.dataset.siteReady=String(slots[current].ready);document.title=`${pages[current][2]} / ${pages[current][3]} · GAO MINGYUAN`;
      links.forEach((a,i)=>{for(const link of[a]){if(i===current)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');}});
      const target=pages[(current+1)%4],last=current===3;next.dataset.next=target[0];
      next.querySelector('.site-next-label .site-en').textContent=last?'BACK TO HOME':'NEXT';
      next.querySelector('.site-next-label .site-zh').textContent=last?'返回首页':'下一页';
      next.setAttribute('aria-label',last?'返回首页 / Back to home':`下一页：${target[3]} / Next: ${target[2]}`);placeIndicator(instant);
    }
    function route(replace=false){
      if(detail.active())return;
      const url=new URL(absolute(pages[current][1]));if(current===1&&slots[1].selected)url.searchParams.set('selected',slots[1].selected);
      history[replace?'replaceState':'pushState']({chapter:pages[current][0]},'',url);chromeState();
    }
    function activate(){slots.forEach((s,i)=>{const visible=i===current;s.frame.inert=moving||detail.active()||!visible;s.element.style.visibility=visible?'visible':'hidden';s.element.setAttribute('aria-hidden',String(!visible));send(s,'active',{active:visible&&!detail.active()&&!document.hidden});});}
    function normalize(){slots.forEach((s,i)=>s.element.style.top=`${i*100}%`);track.style.transform=transform(-current*height());}
    function cancel(){epoch++;animation?.cancel();animation=null;moving=false;delete root.dataset.siteMoving;delete root.dataset.siteRewinding;chrome.inert=false;normalize();activate();next.removeAttribute('aria-disabled');}
    function load(index,selected){
      const s=slots[index];if(s.ready&&(!selected||selected===s.selected))return Promise.resolve(true);if(s.promise&&(!selected||selected===s.selected))return s.promise;
      s.resolve?.(false);clearTimeout(s.timeout);s.ready=false;s.token=`${index}-${++s.version}`;if(selected)s.selected=selected;
      s.promise=new Promise(resolve=>s.resolve=resolve);
      s.timeout=setTimeout(()=>{s.resolve?.(false);s.promise=null;if(current===index)status.textContent='章节未能加载，请点击章节重试 / Unable to load, select the chapter to retry';},15000);
      const url=new URL(`chapters/${pages[index][0]}.html`,base);url.searchParams.set('site-frame',s.token);if(index===1&&s.selected)url.searchParams.set('selected',s.selected);
      if(s.version>1){
        // Replace the child entry: a historic selected-ID restore must not truncate host forward history.
        try{s.frame.contentWindow.location.replace(url.href);}catch{s.frame.src=url.href;}
      }else s.frame.src=url.href;
      return s.promise;
    }
    function jump(index,{selected=null,push=true}={}){
      if(detail.active()){detail.exitTo(()=>jump(index,{selected,push}));return;}
      if(index===current&&!moving&&slots[index].ready&&(!selected||selected===slots[index].selected)){chromeState();return;}cancel();current=index;normalize();void load(index,selected);activate();chromeState();status.textContent='';if(push)route();lockUntil=performance.now()+550;wheelSum=0;
    }
    async function slide(direction){
      if(current===3&&direction===1)return rewindHome();
      if(moving||detail.active())return;const from=current,to=(from+direction+4)%4,version=++epoch;
      moving=true;root.dataset.siteMoving='true';next.setAttribute('aria-disabled','true');slots.forEach(s=>s.frame.inert=true);send(slots[from],'active',{active:false});slots[to].element.style.visibility='visible';
      const ready=await load(to);if(version!==epoch)return;
      if(!ready){cancel();status.textContent='章节未能加载，请重试 / Chapter unavailable, please retry';return;}
      const h=height(),virtual=from+direction;
      if(virtual!==to)slots[to].element.style.top=`${virtual*100}%`;
      send(slots[to],'active',{active:true});current=to;route();
      if(!reduced.matches&&track.animate){
        animation=track.animate([{transform:transform(-from*h)},{transform:transform(-virtual*h)}],{duration:1000,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});
        try{await animation.finished;}catch{return;}
      }
      if(version!==epoch)return;
      track.style.transform=transform(-to*height());animation?.cancel();animation=null;
      slots.forEach((s,i)=>s.element.style.top=`${i*100}%`);moving=false;delete root.dataset.siteMoving;next.removeAttribute('aria-disabled');activate();lockUntil=performance.now()+550;
    }
    async function rewindHome(){
      if(moving||detail.active())return;
      const version=++epoch;moving=true;root.dataset.siteMoving='true';root.dataset.siteRewinding='true';chrome.inert=true;
      next.setAttribute('aria-disabled','true');status.textContent='';
      slots.forEach(s=>{s.frame.inert=true;send(s,'active',{active:false});});
      const ready=await Promise.all([0,1,2].map(i=>load(i)));
      if(version!==epoch)return;
      if(ready.some(value=>!value)){cancel();status.textContent='章节未能加载，请重试 / Chapters unavailable, please retry';return;}
      // The actual existing documents pass the viewport, with their own animation clocks frozen.
      slots[0].frame.contentWindow?.PortfolioHome?.prime();
      slots.forEach(s=>s.element.style.visibility='visible');
      const h=height();current=0;route();
      if(!reduced.matches&&track.animate){
        animation=track.animate([{transform:transform(-3*h)},{transform:transform(0)}],{duration:1000,easing:'cubic-bezier(.16,.72,.24,1)',fill:'forwards'});
        try{await animation.finished;}catch{return;}
      }
      if(version!==epoch)return;
      track.style.transform=transform(0);animation?.cancel();animation=null;moving=false;
      delete root.dataset.siteMoving;delete root.dataset.siteRewinding;chrome.inert=false;next.removeAttribute('aria-disabled');
      normalize();activate();wheelSum=0;lockUntil=performance.now()+550;
    }
    function wheel(delta){
      const now=performance.now();if(moving||detail.active()||now<lockUntil||!Number.isFinite(delta))return;
      const direction=Math.sign(delta);if(!direction)return;
      if(now-lastWheel>200||direction!==wheelDirection)wheelSum=0;
      lastWheel=now;wheelDirection=direction;wheelSum+=Math.abs(delta);
      if(wheelSum>=100){wheelSum=0;void slide(direction);}
    }
    window.addEventListener('message',event=>{
      if(event.origin!==location.origin||event.data?.channel!=='portfolio-chapters')return;
      const index=slots.findIndex(s=>s.frame.contentWindow===event.source);if(index<0)return;
      const data=event.data,s=slots[index];if(data.token!==s.token)return;
      if(data.type==='ready'){
        clearTimeout(s.timeout);s.ready=true;if(typeof data.id==='string')s.selected=data.id;s.resolve?.(true);send(s,'active',{active:index===current&&!moving&&!detail.active()&&!document.hidden});
        if(index===current){status.textContent='';root.dataset.siteReady='true';if(index===1)route(true);}
      }else if(data.type==='selection'&&typeof data.id==='string'&&data.id.length<=200){s.selected=data.id;if(current===1)route(true);}
      else if(index===current){
        if(data.type==='wheel')wheel(data.delta);
        else if(data.type==='jump'&&Number.isInteger(data.index)&&data.index>=0&&data.index<4)jump(data.index,{selected:data.selected});
        else if(data.type==='project'&&typeof data.href==='string'){
          const url=new URL(data.href,base);if(url.origin===location.origin&&isProject(url.pathname))void detail.open(url.href);
        }
      }
    });
    // Native button owns its entire hit area (circle, labels and padding), including touch/keyboard.
    next.addEventListener('click',()=>void slide(1));
    document.addEventListener('click',event=>{
      const a=event.target.closest('a[href]');if(!a||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      if(a.closest('#site-rail')){event.preventDefault();jump(Number(a.dataset.index));}
    });
    document.addEventListener('wheel',event=>{if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.target.closest('#site-chrome'))return;event.preventDefault();wheel(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?height():1));},{passive:false});
    window.addEventListener('popstate',()=>{
      if(isProject(location.pathname)){void detail.open(location.href,{push:false});return;}
      const index=pageIndex(location.pathname);
      if(index>=0){const options={selected:new URLSearchParams(location.search).get('selected'),push:false};if(detail.active())void detail.close(()=>{if(pageIndex(location.pathname)===index)jump(index,options);});else jump(index,options);}
    });
    window.addEventListener('resize',()=>{cancel();placeIndicator(true);});
    reduced.addEventListener('change',()=>{if(reduced.matches&&animation)animation.finish();});
    if('scrollRestoration'in history)history.scrollRestoration='manual';
    const selected=new URLSearchParams(location.search).get('selected');if(selected)slots[1].selected=selected;
    normalize();chromeState(true);route(true);activate();
    void load(current,selected);
  }
})();
