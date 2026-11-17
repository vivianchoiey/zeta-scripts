// ==UserScript==
// @name         문자 자동 인용(>) 변환
// @namespace    zeta-sms-quote
// @version      1.0.0
// @description  입력창에서 "문자:" / "[문자]" / "📱" 로 시작하는 줄을 자동으로 "> " 인용문으로 바꿔서, Clean Cozy 등에서 문자 카드로 보이게 함
// @match        https://zeta-ai.io/*
// @match        https://*.zeta-ai.io/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  if(window.__zetaSmsQuoteV1)return;window.__zetaSmsQuoteV1=true;
  // 줄 맨 앞 표시 → "> "
  const MARK=/^([ \t]*)(?:문자\s*[:：]|\[문자\]|📱)[ \t]*/;
  const setter=Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set;
  function convert(ta){
    if(!ta||ta.tagName!=='TEXTAREA')return;
    const v=ta.value;
    if(!/문자\s*[:：]|\[문자\]|📱|^[ \t]*> {2,}/m.test(v))return;
    const lines=v.split('\n');let changed=false;
    const out=lines.map(l=>{if(MARK.test(l)){changed=true;return l.replace(MARK,'$1> ');}if(/^[ \t]*> {2,}/.test(l)){changed=true;return l.replace(/^([ \t]*)> +/,'$1> ');}return l;});
    if(!changed)return;
    const nv=out.join('\n');
    const pos=ta.selectionStart,diff=nv.length-v.length;
    setter.call(ta,nv);
    ta.dispatchEvent(new Event('input',{bubbles:true}));
    try{const p=Math.max(0,pos+diff);ta.setSelectionRange(p,p);}catch(_){}
  }
  let composing=false;
  document.addEventListener('compositionstart',()=>{composing=true;},true);
  document.addEventListener('compositionend',e=>{composing=false;setTimeout(()=>convert(e.target),0);},true);
  document.addEventListener('input',e=>{if(composing||e.isComposing)return;convert(e.target);},true);
  // 보내기 직전에도 한 번 더 (붙여넣기 등 대비)
  document.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing)convert(e.target);},true);
  document.addEventListener('pointerdown',e=>{
    const b=e.target.closest&&e.target.closest('[data-testid=chat-send-button]');
    if(!b)return;
    const box=document.querySelector('[data-testid=composer-input-box] textarea')||document.querySelector('textarea[name="message"]');
    convert(box);
  },true);
})();

/* 임시 진단: 채팅 프레임 안 DOM 구조를 바깥으로 보내 테마 대응용으로 확인 (끝나면 삭제) */
(function(){
  if(location.hostname!=='frame.pingpong.ai'||window.__zprobe2)return;window.__zprobe2=1;
  function chain(el,n){var o=[];for(var i=0;i<n&&el&&el!==document.documentElement;i++){var cs=getComputedStyle(el);o.push(el.tagName+'.'+String(el.className).slice(0,160)+' [sc '+(el.getAttribute('data-sentry-component')||'')+'] bg:'+cs.backgroundColor+' col:'+cs.color+' bd:'+cs.borderTopWidth+' '+cs.borderTopColor);el=el.parentElement}return o}
  function textEl(re){var all=document.querySelectorAll('body *');for(var i=all.length-1;i>=0;i--){var e=all[i];for(var j=0;j<e.childNodes.length;j++){var n=e.childNodes[j];if(n.nodeType===3&&re.test(n.nodeValue))return e}}return null}
  function dump(){
    var sc={};document.querySelectorAll('[data-sentry-component]').forEach(function(e){sc[e.getAttribute('data-sentry-component')]=1});
    var cls={};document.querySelectorAll('[class]').forEach(function(e){String(e.className).split(/\s+/).forEach(function(c){if(/bg-|bubble|narrat|rounded-[lr]|self-(start|end)|text-white/.test(c))cls[c]=1})});
    var em=document.querySelector('.chat em, em');var narr=document.querySelector('[data-sentry-component="NarratorBubble"]');
    var data={sentry:Object.keys(sc),classes:Object.keys(cls).slice(0,150),styles:[].map.call(document.querySelectorAll('style[id]'),function(s){return s.id}),
      body:document.body.className+' | html:'+document.documentElement.className,
      emChain:em?chain(em,9):null,narrChain:narr?chain(narr.querySelector('.chat,p')||narr,8):null,
      userChain:(function(){var u=document.querySelector('[class*=bg-bubble-user],[data-sentry-component=RightTextContent] .chat');return u?chain(u,7):null})(),
      header:(function(){var h=document.querySelector('header');return h?chain(h,3):null})()};
    try{window.parent.postMessage({__zprobeAuto:JSON.stringify(data)},'*')}catch(e){}
  }
  setTimeout(dump,5000);setTimeout(dump,10000);setInterval(dump,15000);
})();
