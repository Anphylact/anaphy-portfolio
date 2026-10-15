'use strict';
(() => {
  const $ = id => document.getElementById(id);
  const root=$('contact'), frame=$('viewfinder'), autofocus=$('autofocus'), flash=$('shutter-flash'), trigger=$('focus-trigger'), panel=$('contact-panel');
  const control=$('capture-control'), feedback=$('copy-feedback');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let playhead=0, goal=0, animation=null, raf=0;
  let contact={email:null,wechat:null,resumeUrl:null,wechatQrUrl:null}, copyEpoch=0, feedbackToken=0;
  const ease=x=>(1-Math.cos(Math.PI*x))/2;
  function render() {
    // The composition stays fixed; only optical clarity and the auxiliary AF strokes change.
    const phase=(a,b)=>ease(Math.max(0,Math.min(1,(playhead-a)/(b-a))));
    panel.style.filter=`blur(${20*(1-phase(.12,.64))}px)`;
    // A permanent cross and nearby corner strokes form one compact AF reticle.
    const tightening=phase(0,.24)*(1-phase(.60,.68));
    const inset=34-7*tightening, arm=12;
    for(const path of $('af-corners').children)path.setAttribute('d',`M ${inset-arm} ${-inset} L ${inset} ${-inset} L ${inset} ${-inset+arm}`);
    autofocus.style.opacity=String(1-phase(.79,.85));
    autofocus.style.transform=`translate(-50%, -50%) scale(${1-.1*phase(0,.24)*(1-phase(.60,.68))})`;
    const weight=1.2+.45*phase(.60,.66);
    for(const path of $('af-corners').children)path.style.strokeWidth=String(weight);
    const exposure=goal===1&&animation&&playhead>.79&&playhead<.85;
    flash.style.opacity=String(exposure ? .16*Math.sin(Math.PI*(playhead-.79)/.06):0);
    const focused=playhead===1&&goal===1;
    const state=focused?'focused':!animation?'standby':goal===0?'defocusing':playhead<.64?'focusing':playhead<.79?'locked':'shutter';
    root.dataset.state=state;
    root.dataset.progress=String(playhead);
    panel.inert=!focused;
    trigger.disabled=focused||!!animation;
    $('camera-state').textContent=({focused:'FOCUSED / 已对焦',standby:'STANDBY / 待机',defocusing:'STANDBY / 待机',focusing:'FOCUSING / 对焦中',locked:'LOCKED / 已锁定',shutter:'CAPTURE / 拍摄'})[state];
    const message=focused?["IN FOCUS. LET'S CONNECT.",'已对焦，期待与你联系。']:!animation||goal===0?['OUT OF FOCUS','尚未对焦']:state==='locked'?['FOCUS LOCKED','焦点已锁定']:state==='shutter'?['CAPTURING...','正在拍摄…']:['FOCUSING...','正在对焦…'];
    if($('focus-en').textContent!==message[0])$('focus-en').textContent=message[0];
    if($('focus-zh').textContent!==message[1])$('focus-zh').textContent=message[1];
    control.children[0].textContent=focused?'REFOCUS':'CLICK TO FOCUS';
    control.children[1].textContent=focused?'重新对焦':'点击对焦';
    control.disabled=!!animation;
    control.setAttribute('aria-label',focused?'重新对焦，恢复尚未对焦状态 / Refocus':'点击对焦 / Click to focus');

  }
  function finish(next) {
    playhead=goal=next; animation=null; frame.removeAttribute('aria-busy');
    render();
    if(next)panel.focus({preventScroll:true});else trigger.focus({preventScroll:true});
  }
  function go(next) {
    cancelAnimationFrame(raf);raf=0;
    feedbackToken++;feedback.replaceChildren();
    goal=next;
    if(reduced.matches){finish(next);return;}
    if(next===playhead){finish(next);return;}
    // Reversal starts from the current blur value; no geometry or content is replaced.
    animation={from:playhead,to:next,start:performance.now(),duration:(next?1500:650)*Math.abs(next-playhead)};
    frame.setAttribute('aria-busy','true');render();raf=requestAnimationFrame(tick);
  }
  function tick(now) {
    raf=0;if(!animation)return;
    const t=Math.min(1,(now-animation.start)/animation.duration);
    playhead=animation.from+(animation.to-animation.from)*t;
    if(t===1||(animation.to===1&&playhead>=.85))finish(animation.to);else{render();raf=requestAnimationFrame(tick);}
  }
  trigger.addEventListener('click',()=>{if(!animation)go(1);});
  control.addEventListener('click',()=>{if(!animation)go(playhead===1?0:1);});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&(playhead||goal)){event.preventDefault();go(0);}});
  reduced.addEventListener('change',()=>{if(reduced.matches&&animation){const end=goal;cancelAnimationFrame(raf);raf=0;finish(end);}});
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
    Object.assign(panel.style,{left:`${mobile?16:w*.08}px`,top:'100px',width:`${mobile?w-32:w*.84}px`,height:`${h-182}px`});
  }
  window.addEventListener('resize',layout);layout();render();
})();
