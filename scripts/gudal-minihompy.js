// ==UserScript==
// @name         구달's 미니홈피 랜덤 테마
// @namespace    gudal-minihompy
// @version      2.0.0
// @description  제타 채팅방을 옛날 싸이월드 미니홈피처럼! 스킨 10가지 중 하나가 랜덤. 들어갈 때마다 사이트에서 최신 테마를 불러와서 자동으로 업데이트돼요.
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(() => {
  const SRC = "https://elaborate-tapioca-ff7a2c.netlify.app/gudal-core.js";
  window.__gudalAuto = 1;
  if (window.__gudalMinihompy) return;
  if (window.__gudalLoading) return;
  window.__gudalLoading = 1;
  const say = (t) => { const d = document.createElement("div"); d.textContent = t; d.style.cssText = "position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:2147483647;padding:8px 14px;border:1px solid #B5B5B5;background:#fff;color:#4A4A4A;font:700 13px/1.4 sans-serif;max-width:86vw;text-align:center;box-shadow:0 0 0 3px #E6E6E6"; document.body.appendChild(d); setTimeout(() => d.remove(), 3500); };
  const s = document.createElement("script");
  s.src = SRC + "?v=" + Date.now();
  s.onload = () => { window.__gudalLoading = 0; s.remove(); };
  s.onerror = () => { window.__gudalLoading = 0; s.remove(); say("구달 미니홈피 테마를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요"); };
  (document.head || document.documentElement).appendChild(s);
})();
