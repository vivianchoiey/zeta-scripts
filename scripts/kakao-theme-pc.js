// ==UserScript==
// @name         카톡테마 로더 PC
// @namespace    zeta-local
// @version      1.3.0
// @description  hllim-svg 카톡테마를 자동으로 불러옴 — 원래 이름·원래 프로필 사진 고정, 글자 크기 키움, 입력창 띠 제거
// @match        https://zeta-ai.io/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(()=>{'use strict';
// ───── 글자 크기 설정 (여기 숫자만 바꾸면 됨 / 테마 원래 크기는 13) ─────
const FONT={
  chat:15,   // 말풍선 대사·지문
  input:15,  // 아래 입력창 + 메시지 수정창
  inputBoxHeight:48  // 아래 입력칸 전체 높이(px) — 테마 원래 78, 더 줄이고 싶으면 숫자 낮추기
};
// ────────────────────────────────────────────────────────────

const d=document,w=window;
const SRC='https://hllim-svg.github.io/kakao-theme/zeta-kakao.js';
const SETTINGS_KEY='zeta-kakao-profile-settings-v1';
const FONT_ID='zeta-kakao-loader-font-style';

// 이름은 원래 대화방 이름, 프로필 사진은 원래 캐릭터 사진으로 고정
const forceOriginal=()=>{
  try{
    const o=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'null');
    const next=(o&&typeof o==='object')?o:{};
    next.hidePhoto=false;
    next.nameMode='original';
    localStorage.setItem(SETTINGS_KEY,JSON.stringify(next));
  }catch(_){}
};

const lh=px=>Math.round(px*1.45)+'px';
const applyFont=()=>{
  d.getElementById(FONT_ID)?.remove();
  const st=d.createElement('style');
  st.id=FONT_ID;
  const B='html body [data-sentry-component="ChatBubbleContainer"]';
  const C='.relative.flex.flex-row.items-end.gap-1\\.5.border-t:has(textarea[name="message"])';
  const H=FONT.inputBoxHeight,line=parseInt(lh(FONT.input)),taH=Math.max(line,H-16),taTop=Math.round((H-taH)/2);
  st.textContent=
    `${B} .chat,${B} .chat p,${B} .chat :is(span,em,i,strong,b){font-size:${FONT.chat}px!important;line-height:${lh(FONT.chat)}!important;}`+
    `html body .relative.flex.flex-row.items-end.gap-1\\.5.border-t:has(textarea[name="message"]) textarea[name="message"],html body textarea[name="message"],html body textarea.zeta-kakao-edit-textarea{font-size:${FONT.input}px!important;line-height:${lh(FONT.input)}!important;}`+
    `html body ${C}{height:auto!important;min-height:0!important;}`+
    `html body ${C}>div:has(textarea[name="message"]){position:relative!important;height:${H}px!important;min-height:${H}px!important;}`+
    `html body ${C} textarea[name="message"]{top:${taTop}px!important;height:${taH}px!important;min-height:${taH}px!important;max-height:${taH}px!important;overflow-y:auto!important;}`+
    `html body ${C} [data-testid="chat-send-button"]{top:50%!important;bottom:auto!important;transform:translateY(-50%)!important;}`+
    `html body ${C} [data-sentry-component="QuickReplyButton"]{top:50%!important;bottom:auto!important;transform:translateY(-50%)!important;}`;
  (d.head||d.documentElement).appendChild(st);
};

// 입력창 주변 검은 그라데이션 띠 → 채팅방 배경색(카톡 하늘색)으로 덮어서 흰 입력칸만 보이게
const BAND_FALLBACK='#B2C7D9';
const installBandFix=()=>{
  if(w.__zetaKakaoBandFix)return;
  const st=d.createElement('style');
  st.id='zeta-kakao-loader-band-style';
  (d.head||d.documentElement).appendChild(st);
  const clear=c=>!c||c==='transparent'||/rgba\([^)]*,\s*0\)$/.test(c)||/\/\s*0\)$/.test(c);
  let lastBg='';
  const roomBg=()=>{
    const list=d.querySelector('[data-sentry-component="ChatMessageList"]');
    for(let el=list;el;el=el.parentElement){if(el.hasAttribute('data-zkband'))continue;const c=getComputedStyle(el).backgroundColor;if(!clear(c))return c}
    return BAND_FALLBACK;
  };
  const setCss=()=>{const bg=roomBg();if(bg===lastBg)return;lastBg=bg;st.textContent=`[data-zkband]{background:${bg}!important;background-color:${bg}!important;background-image:none!important;box-shadow:none!important;border-color:transparent!important;}[data-zkband-pseudo]::before,[data-zkband-pseudo]::after{background:none!important;background-image:none!important;box-shadow:none!important;}`};
  const lum=c=>{const m=c&&c.match(/rgba?\(([^)]+)\)/);if(!m)return 1;const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);if(p.length>3&&p[3]<0.5)return 1;return (0.2126*p[0]+0.7152*p[1]+0.0722*p[2])/255};
  const SKIP='button,[role="button"],svg,img,video,canvas,textarea,[data-testid="chat-send-button"],#zeta-kakao-profile-settings';
  const bad=(el,ps)=>{const cs=getComputedStyle(el,ps);if(ps&&(cs.content==='none'||cs.content==='normal'))return false;return /gradient/.test(cs.backgroundImage)||(!clear(cs.backgroundColor)&&lum(cs.backgroundColor)<0.35)};
  const mark=el=>{
    if(el.matches(SKIP)||el.closest(SKIP))return;
    if(bad(el))el.setAttribute('data-zkband','');
    if(bad(el,'::before')||bad(el,'::after'))el.setAttribute('data-zkband-pseudo','');
  };
  const scan=()=>{
    const ta=d.querySelector('textarea[name="message"],[data-sentry-component="ChatComposer"] textarea,[data-sentry-component="ChatInput"] textarea');
    if(!ta)return;
    const list=d.querySelector('[data-sentry-component="ChatMessageList"]');
    let root=ta;
    while(root.parentElement&&root.parentElement!==d.body&&!(list&&root.parentElement.contains(list)))root=root.parentElement;
    const zones=[root];
    const room=root.parentElement,tr=ta.getBoundingClientRect();
    if(room&&room!==d.body)[...room.children].forEach(ch=>{if(ch!==root&&!(list&&ch.contains(list))){const r=ch.getBoundingClientRect();if(r.bottom>=tr.top-80&&r.height<w.innerHeight*0.5)zones.push(ch)}});
    zones.forEach(z=>{mark(z);z.querySelectorAll('*').forEach(mark)});
    setCss();
  };
  let t=0;const queue=()=>{if(t)return;t=setTimeout(()=>{t=0;try{scan()}catch(_){}},150)};
  new MutationObserver(queue).observe(d.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});
  setTimeout(queue,300);setTimeout(queue,1200);setTimeout(queue,3000);
  w.__zetaKakaoBandFix=1;
};

const load=()=>{
  if(w.__zetaKakaoLoaderPending)return;
  w.__zetaKakaoLoaderPending=1;
  forceOriginal();
  const s=d.createElement('script');
  s.referrerPolicy='no-referrer';
  s.src=SRC+'?v='+Date.now();
  s.onload=()=>{w.__zetaKakaoLoaderPending=0;s.remove();applyFont();setTimeout(applyFont,800)};
  s.onerror=()=>{w.__zetaKakaoLoaderPending=0;s.remove();console.warn('[카톡테마 로더] 테마 파일을 불러오지 못했습니다. URL 또는 스크립트 차단 설정을 확인해 주세요.')};
  (d.head||d.documentElement).appendChild(s);
};

applyFont();
installBandFix();
load();
})();
