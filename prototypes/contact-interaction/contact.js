'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const root=$('contact'), frame=$('viewfinder'), autofocus=$('autofocus'), flash=$('shutter-flash'), trigger=$('focus-trigger'), panel=$('contact-panel');
  const back=$('back'), refocus=$('refocus'), feedback=$('copy-feedback');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let playhead=0, goal=0, animation=null, raf=0, reopen=false;
  let contact={email:null,wechat:null,resumeUrl:null,wechatQrUrl:null}, copyEpoch=0, feedbackToken=0;
  const ease=x=>(1-Math.cos(Math.PI*x))/2;
  function render() {
    // The composition stays fixed; only optical clarity and the auxiliary AF strokes change.
    const phase=(a,b)=>ease(Math.max(0,Math.min(1,(playhead-a)/(b-a))));
    panel.style.filter=`blur(${20*(1-phase(.12,.64))}px)`;
    const shrink=1-.3*phase(0,.16), spread=phase(.16,.57);
    const mix=(a,b)=>a+(b-a)*spread;
    const d=`M ${mix(0,28)} ${mix(-7*shrink,-42)} L ${mix(0,42)} ${mix(0,-42)} L ${mix(7*shrink,42)} ${mix(0,-28)}`;
    for(const path of autofocus.children)path.setAttribute('d',d);
    autofocus.style.opacity=String(1-phase(.85,.96));
    for(const path of autofocus.children)path.style.strokeWidth=String(1.2+.5*phase(.57,.64));
    const exposure=goal===1&&animation&&playhead>.79&&playhead<.85;
    flash.style.opacity=String(exposure ? .16*Math.sin(Math.PI*(playhead-.79)/.06):0);
    const focused=playhead===1&&goal===1&&!reopen;
    const state=focused?'focused':!animation?'standby':goal===0?'defocusing':playhead<.64?'focusing':playhead<.79?'locked':playhead<.85?'shutter':'freezing';
    root.dataset.state=state;
    root.dataset.progress=String(playhead);
    panel.inert=!focused;
    trigger.disabled=focused;
    $('camera-state').textContent=({focused:'FOCUSED / 已对焦',standby:'STANDBY / 待机',defocusing:'STANDBY / 待机',focusing:'FOCUSING / 对焦中',locked:'LOCKED / 已锁定',shutter:'CAPTURE / 拍摄',freezing:'FOCUSED / 已对焦'})[state];
    back.children[0].textContent=goal||focused?'BACK TO FRAME':'CLICK TO FOCUS';
    back.children[1].textContent=goal||focused?'返回取景':'点击对焦';
    refocus.children[0].textContent=focused?'REFOCUS':'VIEW NOW';
    refocus.children[1].textContent=focused?'重新对焦':'直接查看';
    refocus.setAttribute('aria-label',focused?'重新对焦 / Refocus':'直接查看联系方式，跳过动画 / View contacts without animation');
  }
  function finish(next) {
    playhead=goal=next; animation=null; frame.removeAttribute('aria-busy');
    if(!next&&reopen){reopen=false;go(1);return;}
    render();
    if(next)panel.focus({preventScroll:true});else trigger.focus({preventScroll:true});
  }
  function go(next,{immediate=false,again=false}={}) {
    cancelAnimationFrame(raf);raf=0;reopen=again;
    feedbackToken++;feedback.replaceChildren();
    goal=next;
    if(immediate||reduced.matches){reopen=false;finish(again?1:next);return;}
    if(next===playhead){finish(next);return;}
    // Reversal starts from the current blur value; no geometry or content is replaced.
    animation={from:playhead,to:next,start:performance.now(),duration:(next?1500:650)*Math.abs(next-playhead)};
    frame.setAttribute('aria-busy','true');render();raf=requestAnimationFrame(tick);
  }
  function tick(now) {
    raf=0;if(!animation)return;
    const t=Math.min(1,(now-animation.start)/animation.duration);
    playhead=animation.from+(animation.to-animation.from)*t;
    if(t===1)finish(animation.to);else{render();raf=requestAnimationFrame(tick);}
  }
  trigger.addEventListener('click',()=>{if(!animation)go(1);});
  back.addEventListener('click',()=>go(goal||playhead===1?0:1));
  refocus.addEventListener('click',()=>playhead===1&&!animation?go(0,{again:true}):go(1,{immediate:true}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(playhead||goal)){event.preventDefault();go(0);}});
  reduced.addEventListener('change',()=>{if(reduced.matches&&animation){const end=reopen?1:goal;cancelAnimationFrame(raf);raf=0;reopen=false;finish(end);}});
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
  function layout() {
    // Preserve the approved final geometry, including its integer clientWidth rounding.
    const w=frame.clientWidth,h=frame.clientHeight,mobile=innerWidth<=650;
    for(const element of [$('focus-mark'),panel])Object.assign(element.style,{left:`${mobile?16:w*.08}px`,top:'100px',width:`${mobile?w-32:w*.84}px`,height:`${h-182}px`});
  }
  window.addEventListener('resize',layout);layout();render();
})();
