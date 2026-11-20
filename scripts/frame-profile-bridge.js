// ==UserScript==
// @name         코냅샷 프로필 다리 (채팅 프레임 → 바깥)
// @namespace    vivianchoiey-frame-profile-bridge
// @version      1.0.0
// @description  채팅이 frame.pingpong.ai 프레임 안에 있어서 코냅샷이 실제 말풍선 프사를 못 봄 → 프레임 안에서 지금 방에 보이는 캐릭터·유저 프사를 찾아 바깥 화면(코냅샷)에 알려줌
// @match        https://frame.pingpong.ai/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  if(location.hostname!=='frame.pingpong.ai'||window.__C2I_FRAME_BRIDGE__)return;window.__C2I_FRAME_BRIDGE__=1;
  const USER_RE=/user-(?:plot-)?chat-profile-image/;
  const CHAR_RE=/\/profile-image(?:-generation)?\//;
  const clean=u=>{try{const x=new URL(u,location.href);if(/\/_next\/image$/.test(x.pathname)&&x.searchParams.get('url'))return clean(decodeURIComponent(x.searchParams.get('url')));return x.href;}catch(e){return '';}};
  const srcOf=img=>{const ss=(img.getAttribute('srcset')||'').split(',').map(s=>s.trim().split(/\s+/)[0]).filter(Boolean);return clean(ss[ss.length-1]||img.currentSrc||img.getAttribute('src')||'');};
  const side=el=>{const c=el.closest('[data-sentry-component]');let n=el;for(let i=0;i<12&&n;i++,n=n.parentElement){const s=n.getAttribute&&n.getAttribute('data-sentry-component')||'';if(/Right/.test(s))return 'R';if(/Left|Narrator/.test(s))return 'L';}return '';};
  let last='';
  const scan=()=>{
    const imgs=[...document.querySelectorAll('img')];
    const userC={},charC={};
    for(const img of imgs){
      const u=srcOf(img);if(!u||!/image\.zeta-ai\.io/.test(u))continue;
      const sd=side(img);
      if(USER_RE.test(u)||sd==='R'){if(USER_RE.test(u))userC[u]=(userC[u]||0)+1+(sd==='R'?5:0);}
      else if(CHAR_RE.test(u)){charC[u]=(charC[u]||0)+1+(sd==='L'?5:0);}
    }
    const best=o=>Object.keys(o).sort((a,b)=>o[b]-o[a])[0]||'';
    // 유저 프사: 가장 최근(아래쪽) 오른쪽 말풍선 프사를 우선
    let persona='';for(let i=imgs.length-1;i>=0;i--){const u=srcOf(imgs[i]);if(u&&USER_RE.test(u)&&side(imgs[i])==='R'){persona=u;break;}}
    persona=persona||best(userC);
    const char=best(charC);
    const msg=JSON.stringify({char,persona});
    if(msg!==last&&(char||persona)){last=msg;}
    try{window.parent.postMessage({type:'c2i-frame-profiles',char,persona},'https://zeta-ai.io');}catch(e){}
  };
  setInterval(scan,2000);setTimeout(scan,800);
})();
