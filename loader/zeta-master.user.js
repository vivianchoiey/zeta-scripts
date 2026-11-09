// ==UserScript==
// @name         제타 스크립트 마스터 로더
// @namespace    vivianchoiey-zeta-scripts
// @version      1.0.1
// @description  GitHub(vivianchoiey/zeta-scripts)에 있는 제타 스크립트들을 불러옴 — 스크립트 켜고 끄기는 Tampermonkey 메뉴에서
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @match        https://*.zeta-ai.io/*
// @noframes
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      vivianchoiey.github.io
// @updateURL    https://vivianchoiey.github.io/zeta-scripts/loader/zeta-master.user.js
// @downloadURL  https://vivianchoiey.github.io/zeta-scripts/loader/zeta-master.user.js
// ==/UserScript==

(()=>{'use strict';
const BASE='https://vivianchoiey.github.io/zeta-scripts/';
const d=document;

const getManifest=()=>new Promise(resolve=>{
  const cached=GM_getValue('manifest',null);
  GM_xmlhttpRequest({
    method:'GET',
    url:BASE+'manifest.json?v='+Date.now(),
    timeout:8000,
    onload:r=>{
      try{const m=JSON.parse(r.responseText);if(m&&Array.isArray(m.scripts)){GM_setValue('manifest',m);resolve(m);return}}catch(_){}
      resolve(cached);
    },
    onerror:()=>resolve(cached),
    ontimeout:()=>resolve(cached)
  });
});

const getEnabled=m=>{
  const saved=GM_getValue('enabled',{})||{};
  const out={};
  m.scripts.forEach(s=>{out[s.id]=Object.prototype.hasOwnProperty.call(saved,s.id)?!!saved[s.id]:!!s.default});
  return out;
};

const inject=s=>{
  const el=d.createElement('script');
  el.src=BASE+s.file+'?v='+Date.now();
  el.async=false;
  el.onload=()=>el.remove();
  el.onerror=()=>{el.remove();console.warn('[제타 마스터 로더] 불러오기 실패:',s.name)};
  (d.head||d.documentElement).appendChild(el);
};

const whenReady=fn=>{
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',fn,{once:true});
  else fn();
};

getManifest().then(m=>{
  if(!m){console.warn('[제타 마스터 로더] 스크립트 목록을 불러오지 못했습니다');return}
  const enabled=getEnabled(m);

  m.scripts.forEach(s=>{
    GM_registerMenuCommand((enabled[s.id]?'✅ ':'⬜ ')+s.name,()=>{
      const next={...enabled,[s.id]:!enabled[s.id]};
      if(next[s.id]&&s.group)m.scripts.forEach(o=>{if(o.id!==s.id&&o.group===s.group)next[o.id]=false});
      GM_setValue('enabled',next);
      location.reload();
    });
  });

  m.scripts.forEach(s=>{
    if(!enabled[s.id])return;
    if(s.runAt==='start')inject(s);
    else whenReady(()=>inject(s));
  });
});
})();
