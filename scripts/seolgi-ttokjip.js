// ==UserScript==
// @name         설기 떡집 랜덤 테마
// @namespace    seolgi-ttokjip
// @version      2.0.3
// @description  제타 채팅 테마 — 설기 떡 맛 10종 중 하나가 랜덤으로 적용. 들어갈 때마다 사이트에서 최신 테마를 불러와서 자동으로 업데이트돼요.
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @run-at       document-idle
// @grant        none
// @updateURL    https://chic-tanuki-19b051.netlify.app/seolgi-ttokjip.user.js
// @downloadURL  https://chic-tanuki-19b051.netlify.app/seolgi-ttokjip.user.js
// ==/UserScript==

(() => {
  const SRC = "https://vivianchoiey.github.io/zeta-scripts/share/seolgi-core.js";
  window.__seolgiAuto = 1;
  if (window.__seolgiTtokjip) return;
  if (window.__seolgiLoading) return;
  window.__seolgiLoading = 1;
  const say = (t) => { const d = document.createElement("div"); d.textContent = t; d.style.cssText = "position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:2147483647;padding:8px 14px;border-radius:10px;background:#222;color:#fff;font:700 13px/1.4 sans-serif;max-width:86vw;text-align:center"; document.body.appendChild(d); setTimeout(() => d.remove(), 3500); };
  const s = document.createElement("script");
  s.src = SRC + "?v=" + Date.now();
  // 답변 기다릴 때 콩콩 뛰는 설기 셋이 배경 무늬(설기 얼굴)와 섞여 안 보이던 문제 → 흰 말풍선 받침을 깔아 구분
  const fixDots = () => {
    if (document.getElementById("sg-dots-fix")) return;
    const S = ':is([data-sentry-component="LoadingDotsLottie"]:not(button *),[class~="mx-auto"][class~="h-[19.2px]"][class~="w-[30px]"])';
    const st = document.createElement("style");
    st.id = "sg-dots-fix";
    st.textContent = `html body ${S}{min-width:84px!important;min-height:36px!important;box-sizing:border-box!important;background:var(--sg-card,#fff)!important;border:2px solid var(--sg-ol,#4A3A22)!important;border-radius:999px!important;box-shadow:2px 3px 0 var(--sg-ol,#4A3A22)!important;isolation:isolate!important;z-index:1!important}`;
    (document.head || document.documentElement).appendChild(st);
  };
  s.onload = () => { window.__seolgiLoading = 0; s.remove(); fixDots(); };
  s.onerror = () => { window.__seolgiLoading = 0; s.remove(); say("설기 테마를 불러오지 못했어요. 인터넷 연결을 확인하고 다시 시도해 주세요"); };
  (document.head || document.documentElement).appendChild(s);
})();
