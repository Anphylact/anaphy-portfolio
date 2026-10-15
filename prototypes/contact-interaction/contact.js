'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const root=$('contact'), frame=$('viewfinder'), mark=$('focus-mark'), trigger=$('focus-trigger'), panel=$('contact-panel');
  const direct=$('direct-view'), controls=$('frame-controls'), back=$('back'), refocus=$('refocus'), feedback=$('copy-feedback');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const clamp=x=>Math.max(0,Math.min(1,x)), mix=(a,b,t)=>a+(b-a)*t;
  const ease=x=>(1-Math.cos(Math.PI*clamp(x)))/2, phase=(p,a,b)=>ease((p-a)/(b-a));
  let playhead=0, goal=0, rate=0, reopen=false, raf=0, last=0;
  const position={x:0,y:0}, velocity={x:0,y:0}, target={x:0,y:0};
  let contact={email:null,wechat:null,resumeUrl:null,wechatQrUrl:null}, copyEpoch=0, feedbackToken=0;
  function labels(state) {
    root.dataset.state=state;
    const text={
      standby:['STANDBY / 待机','CLICK TO FOCUS.','点击对焦，查看联系方式'],
      opening:['FOCUSING / 对焦中','FINDING FOCUS.','正在对焦，展开联系方式'],
      focused:['FOCUSED / 已对焦',"IN FOCUS. LET'S CONNECT.",'已对焦，期待与你联系。'],
      closing:['RETURNING / 返回取景','BACK TO THE FRAME.','正在返回取景'],
      refocusing:['REFOCUSING / 重新对焦','FINDING FOCUS.','重新对焦，期待与你联系']
    }[state];
    $('camera-state').textContent=text[0]; $('focus-en').textContent=text[1]; $('focus-zh').textContent=text[2];
  }
  function render() {
    const p=ease(playhead), expand=phase(p,.25,1), squeeze=mix(1,.60,phase(p,0,.25));
    const w=frame.clientWidth, h=frame.clientHeight, mobile=innerWidth<=650;
    const initialW=mobile?(innerHeight<=650?54:68):94, initialH=mobile?(innerHeight<=650?40:50):68;
    const box={x:mobile?16:w*.08,y:100,w:mobile?w-32:w*.84,h:h-182};
    const follow=1-phase(p,.08,.65);
    const width=mix(initialW*squeeze,box.w,expand), height=mix(initialH*squeeze,box.h,expand);
    const cx=mix(w/2,box.x+box.w/2,expand)+position.x*follow;
    const cy=mix(h*.45,box.y+box.h/2,expand)+position.y*follow;
    const x=cx-width/2, y=cy-height/2;
    // One persistent, fully opaque outline is both the autofocus box and the contact enclosure.
    Object.assign(mark.style,{left:`${x}px`,top:`${y}px`,width:`${width}px`,height:`${height}px`});
    mark.style.setProperty('--cross-opacity',1-phase(p,.18,.55));
    $('focus-message').style.top=`${mix(h*.45+54,45,phase(p,0,.25))}px`;
    direct.style.top=`${h*.45+112}px`;
    const reveal=phase(p,.48,.96), opened=playhead===1&&goal===1&&!reopen;
    panel.hidden=p<=.48; panel.inert=!opened; panel.setAttribute('aria-hidden',String(!opened));
    Object.assign(panel.style,{left:`${box.x}px`,top:`${box.y}px`,width:`${box.w}px`,height:`${box.h}px`,opacity:String(reveal),filter:`blur(${(1-reveal)*8}px)`,clipPath:`inset(${Math.max(0,y-box.y)}px ${Math.max(0,box.x+box.w-x-width)}px ${Math.max(0,box.y+box.h-y-height)}px ${Math.max(0,x-box.x)}px)`});
    trigger.hidden=opened; trigger.disabled=playhead!==0||goal!==0;
    trigger.setAttribute('aria-expanded',String(opened));
    direct.hidden=playhead!==0||goal!==0;
    controls.hidden=p<.005; controls.style.opacity=String(phase(p,.02,.25));
    refocus.disabled=!opened;
    root.dataset.progress=p.toFixed(4);
  }
  function request() { if (!raf&&!document.hidden) raf=requestAnimationFrame(tick); }
  function settle(endpoint) {
    playhead=goal=endpoint; rate=0; frame.removeAttribute('aria-busy');
    if (endpoint===0&&reopen) { reopen=false; goal=1; labels('opening'); frame.setAttribute('aria-busy','true'); render(); return; }
    labels(endpoint?'focused':'standby'); render();
    if (endpoint) panel.focus({preventScroll:true}); else trigger.focus({preventScroll:true});
  }
  function go(next,{immediate=false,again=false}={}) {
    if (next===goal&&playhead!==goal&&!immediate&&reopen===again) return;
    feedbackToken++; feedback.replaceChildren(); reopen=again;
    target.x=target.y=0;
    if (immediate||reduced.matches) { reopen=false; settle(again?1:next); return; }
    if (next===playhead) { settle(next); return; }
    goal=next; labels(again?'refocusing':next?'opening':'closing'); frame.setAttribute('aria-busy','true'); render(); request();
  }
  function tick(now) {
    raf=0; const dt=last?Math.min((now-last)/1000,.05):1/60; last=now;
    const omega=15, decay=Math.exp(-omega*dt);
    for (const axis of ['x','y']) {
      const d=position[axis]-target[axis], step=(velocity[axis]+omega*d)*dt;
      position[axis]=target[axis]+(d+step)*decay; velocity[axis]=(velocity[axis]-omega*step)*decay;
    }
    if (playhead!==goal) {
      const direction=goal>playhead?1:-1;
      // Retain playback speed on reversal, braking gently before tracing the same path back.
      rate=mix(rate,direction,1-Math.exp(-24*dt));
      const next=clamp(playhead+rate*dt/1.10);
      if ((direction>0&&next>=goal)||(direction<0&&next<=goal)) settle(goal); else playhead=next;
    }
    render();
    if (playhead!==goal||['x','y'].some(a=>Math.abs(position[a]-target[a])>.01||Math.abs(velocity[a])>.02)) request(); else last=0;
  }
  trigger.addEventListener('click',()=>go(1));
  direct.addEventListener('click',()=>go(1,{immediate:true}));
  back.addEventListener('click',()=>go(0));
  refocus.addEventListener('click',()=>go(0,{again:true}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(playhead||goal)){event.preventDefault();go(0);}});
  frame.addEventListener('pointermove',event=>{
    if(event.pointerType!=='mouse'||reduced.matches||playhead!==0||goal!==0)return;
    const b=frame.getBoundingClientRect(); target.x=Math.max(-12,Math.min(12,((event.clientX-b.left)/b.width-.5)*24)); target.y=Math.max(-9,Math.min(9,((event.clientY-b.top)/b.height-.5)*18)); request();
  });
  frame.addEventListener('pointerleave',()=>{target.x=target.y=0;request();});
  window.addEventListener('resize',render);
  document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;last=0;}else request();});
  reduced.addEventListener('change',()=>{
    if(!reduced.matches)return;
    root.classList.remove('is-entering'); position.x=position.y=target.x=target.y=velocity.x=velocity.y=0;
    if(playhead!==goal||reopen){const end=reopen?1:goal;reopen=false;settle(end);}else render();
  });
  function emailValue(value) {
    if(value===null||value===undefined||value==='')return null;
    if(typeof value!=='string'||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))throw new TypeError('请提供真实有效的邮箱地址');return value.trim();
  }
  function wechatValue(value) {
    if(value===null||value===undefined||value==='')return null;
    if(typeof value!=='string'||value.trim().length>100||/[\r\n]/.test(value))throw new TypeError('请提供真实微信号');return value.trim()||null;
  }
  function assetValue(value) {
    if(value===null||value===undefined||value==='')return null;
    if(typeof value!=='string')throw new TypeError('请提供真实文件地址');
    const url=new URL(value,document.baseURI);
    if(!['https:','http:'].includes(url.protocol)&&!(url.protocol==='file:'&&location.protocol==='file:'))throw new TypeError('文件只支持 HTTP(S) 或本地路径');return url.href;
  }
  function link(element,url,{download=false}={}) {
    if(url){element.href=url;element.removeAttribute('aria-disabled');if(download){element.setAttribute('download','');element.removeAttribute('target');element.removeAttribute('rel');}else{element.target='_blank';element.rel='noopener noreferrer';}}
    else{for(const attr of ['href','target','rel','download'])element.removeAttribute(attr);element.setAttribute('aria-disabled','true');}
  }
  function configure(next={}) {
    const merged={...contact,...next};
    const valid={email:emailValue(merged.email),wechat:wechatValue(merged.wechat),resumeUrl:assetValue(merged.resumeUrl),wechatQrUrl:assetValue(merged.wechatQrUrl)};
    contact=valid;copyEpoch++;feedbackToken++;feedback.replaceChildren();
    $('email-value').textContent=contact.email||'邮箱待接入';$('wechat-value').textContent=contact.wechat||'微信号待接入';$('resume-note').textContent=contact.resumeUrl?'PDF 个人简历':'PDF 简历待接入';
    if(contact.email){$('email').href=`mailto:${encodeURIComponent(contact.email)}`;$('email').removeAttribute('aria-disabled');}else{$('email').removeAttribute('href');$('email').setAttribute('aria-disabled','true');}
    $('copy-email').disabled=!contact.email;$('copy-wechat').disabled=!contact.wechat;
    link($('resume-view'),contact.resumeUrl);link($('resume-download'),contact.resumeUrl,{download:true});
    link($('wechat-qr'),contact.wechatQrUrl);$('wechat-qr').hidden=!contact.wechatQrUrl;
  }
  function showFeedback(english,chinese) {
    feedback.replaceChildren();const en=document.createElement('span'),zh=document.createElement('span');en.lang='en';en.textContent=english;zh.textContent=chinese;feedback.append(en,zh);
  }
  for(const field of ['email','wechat'])$('copy-'+field).addEventListener('click',async()=>{
    if(!contact[field]||playhead!==1||goal!==1)return;
    const epoch=copyEpoch,ticket=++feedbackToken,button=$('copy-'+field),value=contact[field];button.disabled=true;
    try{if(!navigator.clipboard?.writeText)throw new Error('clipboard_unavailable');await navigator.clipboard.writeText(value);if(epoch===copyEpoch&&ticket===feedbackToken)showFeedback(field==='email'?'EMAIL COPIED.':'WECHAT ID COPIED.',field==='email'?'邮箱已复制。':'微信号已复制。');}
    catch{if(epoch===copyEpoch&&ticket===feedbackToken)showFeedback('PLEASE COPY MANUALLY.','未能自动复制，请选中上方信息手动复制。');}
    finally{if(epoch===copyEpoch)button.disabled=!contact[field];}
  });
  window.ContactPrototype=Object.freeze({configure});configure(window.CONTACT_CONFIG||{});
  if(!reduced.matches){root.classList.add('is-entering');root.addEventListener('animationend',event=>{if(event.animationName==='draw-corner'&&event.target.closest('.corner-bl'))root.classList.remove('is-entering');});}
  render();
})();
