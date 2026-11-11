// ==UserScript==
// @name         제타 익명 캡처
// @namespace    https://zeta-ai.io/
// @version      1.6.49
// @description  배포 사이트의 최신 제타 익명 캡처를 자동으로 불러옵니다.
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @match        https://*.zeta-ai.io/*
// @grant        GM_xmlhttpRequest
// @grant        GM_registerMenuCommand
// @connect      zeta-capture.netlify.app
// @updateURL    https://zeta-capture.netlify.app/zeta-private-capture-auto.template.js
// @downloadURL  https://zeta-capture.netlify.app/zeta-private-capture-auto.template.js
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";

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
