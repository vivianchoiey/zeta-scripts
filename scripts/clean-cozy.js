// ==UserScript==
// @name         Clean Cozy · Pastel Collection
// @namespace    clean-cozy-netlify-loader
// @description  Load the latest Clean Cozy from the published JS
// @match        https://zeta-ai.io/*
// @match        https://*.zeta-ai.io/*
// @match        https://frame.pingpong.ai/*
// @run-at       document-idle
// @all-frames   true
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  if(!/(^|\.)(?:zeta-ai\.io|pingpong\.ai)$/.test(location.hostname))return;
  var s=document.createElement('script');
  s.src="https://clean-theme-js.netlify.app/clean-cozy.js"+'?v='+Date.now();
  s.onerror=function(){console.error('[Clean Cozy] JS 불러오기 실패');};
  (document.head||document.documentElement).appendChild(s);
  // 보정 (Vivian 요청): Clean Cozy가 숨기는 제타 원래 버튼(마지막 답변 아래 스냅샷·마법봉·새 답변·신고 줄, 추천답변 버튼)을 다시 보이게
  if(location.hostname==='frame.pingpong.ai'){
    var fix=document.createElement('style');fix.id='cc-show-native-buttons';
    fix.textContent='html.cc-tools-ready body [data-sentry-component="LastMessageControlBar"][data-sentry-component]{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;opacity:1!important;pointer-events:auto!important;user-select:auto!important;z-index:auto!important}'
      +'html.cc-tools-ready body [data-sentry-component="QuickReplyButton"][data-sentry-component]{display:flex!important}';
    var put=function(){var h=document.head||document.documentElement;if(!fix.isConnected||fix!==h.lastElementChild)h.appendChild(fix);};
    put();setInterval(put,1500);
  }
})();
