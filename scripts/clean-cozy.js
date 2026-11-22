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
    var B=':not(#zs-a):not(#zs-b):not(#zs-c)';
    fix.textContent='html body [data-sentry-component="LastMessageControlBar"]'+B+'{position:relative!important;inset:auto!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;opacity:1!important;pointer-events:auto!important;user-select:auto!important;z-index:auto!important;transform:none!important;visibility:visible!important}'
      +'html body [data-sentry-component="LastMessageControlBar"]'+B+' button{pointer-events:auto!important}'
      +'html body [data-sentry-component="QuickReplyButton"]'+B+'{display:flex!important}'
      +'html body [data-sentry-component="QuickReplyButton"]'+B+' button[aria-label="Suggested replies"]{display:flex!important}'
      +'html body :is([data-sentry-component="ChatComposer"],[data-testid="composer-input-box"]) button:is([aria-label="Suggested replies"],[aria-label="Get suggestions"],[aria-label="추천 답변"])'+B+'{display:flex!important}';
    // Clean Cozy가 요소에 직접 박는 숨김 스타일도 걷어냄
    var PROPS=['position','left','right','top','bottom','inset','opacity','pointer-events','user-select','z-index','transform','visibility','display'];
    var unhide=function(){
      document.querySelectorAll('[data-sentry-component="LastMessageControlBar"],[data-sentry-component="LastMessageControlBar"] button,[data-sentry-component="QuickReplyButton"],[data-sentry-component="QuickReplyButton"] button').forEach(function(el){
        if(!el.getAttribute('style'))return;
        PROPS.forEach(function(p){ if(el.style.getPropertyValue(p)&&(p!=='display'||el.style.getPropertyValue(p)==='none'))el.style.removeProperty(p); });
      });
    };
    setInterval(unhide,700);
    var put=function(){var h=document.head||document.documentElement;if(!fix.isConnected||fix!==h.lastElementChild)h.appendChild(fix);};
    put();setInterval(put,1500);
  }
})();
