// ==UserScript==
// @name         휄소 메모
// @namespace    hwelso-memo
// @version      1.0.0
// @description  방마다 적어둔 메모를 그 방 휄소(대화 프로필) 맨 아래에 자동으로 넣어줘요. 버튼 안 눌러도 매 답변에 반영돼요.
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @noframes
// @run-at       document-idle
// @grant        none
// @updateURL    https://vivianchoiey.github.io/zeta-scripts/hwelso-memo/hwelso-memo.user.js
// @downloadURL  https://vivianchoiey.github.io/zeta-scripts/hwelso-memo/hwelso-memo.user.js
// ==/UserScript==

(()=>{
  if(window.__HWELSO_MEMO__||window.__HWELSO_LOADING)return;
  window.__HWELSO_AUTO=1;
  window.__HWELSO_LOADING=1;
  const s=document.createElement('script');
  s.src='https://vivianchoiey.github.io/zeta-scripts/hwelso-memo/hwelso-memo.js?v='+Date.now();
  s.onload=()=>{window.__HWELSO_LOADING=0;s.remove()};
  s.onerror=()=>{window.__HWELSO_LOADING=0;s.remove();console.warn('[휄소 메모] 불러오지 못했어요')};
  (document.head||document.documentElement).appendChild(s);
})();
