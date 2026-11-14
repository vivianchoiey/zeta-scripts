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
