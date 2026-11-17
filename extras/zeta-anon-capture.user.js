// ==UserScript==
// @name         제타 익명 캡처
// @namespace    vivianchoiey-zeta-anon-capture
// @version      2.1.0
// @description  배포 사이트의 최신 제타 익명 캡처를 불러옴 — 2026-11 제타 채팅창 프레임(frame.pingpong.ai) 대응판
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @match        https://*.zeta-ai.io/*
// @match        https://frame.pingpong.ai/v1/index.html*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      zeta-capture.netlify.app
// @updateURL    https://vivianchoiey.github.io/zeta-scripts/extras/zeta-anon-capture.user.js
// @downloadURL  https://vivianchoiey.github.io/zeta-scripts/extras/zeta-anon-capture.user.js
// @run-at       document-start
// ==/UserScript==

(() => {
  "use strict";
  // 2026-11: 제타 채팅방이 frame.pingpong.ai 프레임 안으로 들어감
  // 📸 버튼은 바깥 화면(zeta-ai.io)에 뜨고, 프레임 안에서는 대화 내용을 넘겨주는 역할 → 둘 다 실행해야 함
  const IN_FRAME = location.hostname === "frame.pingpong.ai";
  if (!IN_FRAME && window.top !== window) return;

  const remoteUrl = "https://zeta-capture.netlify.app/zeta-private-capture.user.js";
  const requestUrl = `${remoteUrl}${remoteUrl.includes("?") ? "&" : "?"}v=${Date.now()}`;
  const runLatest = (source) => {
    const executable = String(source || "").replace(
      /^\uFEFF?\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\s*/,
      ""
    );
    if (!executable.trim()) throw new Error("빈 업데이트 파일입니다.");
    (0, eval)(executable);
  };
  const reportError = (error) => {
    console.error("[제타 익명 캡처] 최신 버전을 불러오지 못했습니다.", error);
  };

  if (typeof GM_xmlhttpRequest === "function") {
    GM_xmlhttpRequest({
      method: "GET",
      url: requestUrl,
      responseType: "text",
      timeout: 15000,
      onload(response) {
        if (response.status < 200 || response.status >= 300) {
          reportError(new Error(`HTTP ${response.status}`));
          return;
        }
        try {
          runLatest(response.responseText);
        } catch (error) {
          reportError(error);
        }
      },
      onerror: reportError,
      ontimeout() {
        reportError(new Error("업데이트 요청 시간이 초과되었습니다."));
      },
    });
    return;
  }

  fetch(requestUrl, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.text();
    })
    .then(runLatest)
    .catch(reportError);
})();
