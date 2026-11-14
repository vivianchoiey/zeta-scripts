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
})();
