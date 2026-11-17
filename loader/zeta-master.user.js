// ==UserScript==
// @name         제타 스크립트 마스터 로더
// @namespace    vivianchoiey-zeta-scripts
// @version      1.1.0
// @description  GitHub(vivianchoiey/zeta-scripts)에 있는 제타 스크립트들을 불러옴 — 스크립트 켜고 끄기는 Tampermonkey 메뉴에서
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @match        https://*.zeta-ai.io/*
// @match        https://frame.pingpong.ai/*
// @run-at       document-start
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @grant        GM_addElement
// @connect      vivianchoiey.github.io
// @connect      raw.githubusercontent.com
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

// 2026-11: 제타가 채팅방을 frame.pingpong.ai 안(iframe)에서 그리도록 바뀜 → 그 안에서도 스크립트를 돌림
const IN_FRAME=location.hostname==='frame.pingpong.ai';
const IS_TOP=window.top===window;
const injectText=(s,code)=>{
  try{GM_addElement('script',{textContent:code+'\n//# sourceURL=zeta-scripts/'+s.file});}
  catch(e){const el=d.createElement('script');el.textContent=code;(d.head||d.documentElement).appendChild(el);el.remove();}
};
const inject=s=>{
  if(IN_FRAME){
    // 프레임 안은 다른 도메인이라 <script src>가 막힐 수 있어서 코드를 받아 직접 넣음
    GM_xmlhttpRequest({method:'GET',url:BASE+s.file+'?v='+Date.now(),timeout:10000,
      onload:r=>{if(r.status>=200&&r.status<300)injectText(s,r.responseText);else console.warn('[제타 마스터 로더] 불러오기 실패:',s.name,r.status)},
      onerror:()=>console.warn('[제타 마스터 로더] 불러오기 실패:',s.name)});
    return;
  }
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

  if(IS_TOP)m.scripts.forEach(s=>{
    GM_registerMenuCommand((enabled[s.id]?'✅ ':'⬜ ')+s.name,()=>{
      const next={...enabled,[s.id]:!enabled[s.id]};
      if(next[s.id]&&s.group)m.scripts.forEach(o=>{if(o.id!==s.id&&o.group===s.group)next[o.id]=false});
      GM_setValue('enabled',next);
      location.reload();
    });
  });

  if(IN_FRAME)setTimeout(()=>{try{
    const sc=[...new Set([...d.querySelectorAll('[data-sentry-component]')].map(e=>e.dataset.sentryComponent))];
    const cls=[...new Set([...d.querySelectorAll('[class]')].flatMap(e=>String(e.className).split(/\s+/)).filter(c=>/bubble|bg-gray|chat|message|narrat/i.test(c)))].slice(0,80);
    console.log('[ZMLDIAG] frame',location.pathname,'sentry:',sc.join(','),'classes:',cls.join(' '));
  }catch(e){console.log('[ZMLDIAG] err',e)}},6000);
  m.scripts.forEach(s=>{
    if(!enabled[s.id])return;
    if(!IS_TOP&&!IN_FRAME)return;
    if(s.runAt==='start')inject(s);
    else whenReady(()=>inject(s));
  });
});
})();
