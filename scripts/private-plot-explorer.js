// ==UserScript==
// @name         비캐 검색·정리기 (Private Plot Explorer) 버튼
// @namespace    vivianchoiey-private-plot-explorer
// @version      1.0.0
// @description  zdbookmarklet의 Private Plot Explorer 북마클릿을 버튼으로. 화면 왼쪽 아래 "비캐" 버튼을 누르면 내 비공개 플롯 검색·정리기가 열림 (코어는 누를 때마다 원본에서 최신으로 받아옴)
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  if(window.top!==window||window.__ppeBtn)return;window.__ppeBtn=1;
  const CORE='https://raw.githubusercontent.com/zdbookmarklet/private-plot-explorer/main/private_plot_explorer_core.js';
  let loading=false;
  const run=()=>{
    if(loading)return;loading=true;btn.textContent='…';
    fetch(CORE+'?_='+Date.now(),{cache:'no-store'})
      .then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.text()})
      .then(c=>{(0,eval)(c)})
      .catch(e=>{console.error('[Private Plot Explorer]',e);alert('Private Plot Explorer 코어를 불러오지 못했습니다.')})
      .finally(()=>{loading=false;btn.textContent='비캐'});
  };
  const btn=document.createElement('button');
  btn.id='zs-ppe-btn';btn.type='button';btn.textContent='비캐';btn.title='비캐 검색·정리기 열기';
  btn.style.cssText='position:fixed;left:14px;bottom:86px;z-index:2147483000;width:44px;height:44px;border-radius:50%;border:1px solid rgba(0,0,0,.12);background:#fff;color:#333;font:700 12px/1 sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.18);cursor:pointer;opacity:.85';
  btn.addEventListener('click',run);
  const mount=()=>{if(!document.getElementById('zs-ppe-btn'))(document.body||document.documentElement).appendChild(btn)};
  mount();setInterval(mount,2000);
})();
