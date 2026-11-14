// ==UserScript==
// @name         Clean Cozy · Pastel Collection
// @namespace    clean-cozy-netlify-loader
// @description  Load the latest Clean Cozy from the published JS
// @match        https://zeta-ai.io/*
// @match        https://*.zeta-ai.io/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  if(!/(^|\.)zeta-ai\.io$/.test(location.hostname))return;
  var s=document.createElement('script');
  s.src="https://clean-theme-js.netlify.app/clean-cozy.js"+'?v='+Date.now();
  s.onerror=function(){console.error('[Clean Cozy] JS 불러오기 실패');};
  (document.head||document.documentElement).appendChild(s);
  // 보정: 캐릭터 말풍선 테두리 복구 + 내레이션 칸 가운데 꽉 차게 (Clean Cozy v41이 말풍선 테두리를 없애고 내레이션을 왼쪽으로 붙여서)
  var B='html body [role="log"][aria-label="Chat messages"] [data-sentry-component="LeftTextContent"] [data-sentry-component="ChatBubbleContainer"][data-sentry-component]';
  var N='html body [role="log"][aria-label="Chat messages"] [data-sentry-component="NarratorBubble"]';
  var fix=document.createElement('style');fix.id='clean-cozy-fix-v2';
  fix.textContent=B+'{background:#fff!important;border:1px solid color-mix(in srgb,var(--cc-accent,#A7ABB1) 45%,#E6E7EA)!important;border-radius:4px 18px 18px 18px!important;padding:12px 16px!important;box-shadow:0 1px 3px rgba(0,0,0,.04)!important}'
    +B+'{position:relative!important;margin-top:24px!important;overflow:visible!important}'
    +B+'>.cc-meta{position:absolute!important;top:-24px!important;left:2px!important;margin:0!important;padding:0!important;white-space:nowrap!important;background:none!important;border:0!important}'
    +N+'[data-sentry-component]{justify-content:center!important}'
    +N+'>.message-context-menu-trigger.message-context-menu-trigger{flex:1 1 auto!important;width:100%!important;max-width:100%!important;margin:0 auto!important}';
  var put=function(){if(!fix.isConnected)(document.head||document.documentElement).appendChild(fix);else if(fix.nextElementSibling)fix.parentNode.appendChild(fix);};
  put();setInterval(put,1500);
})();
