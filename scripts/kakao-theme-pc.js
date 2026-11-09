// ==UserScript==
// @name         카톡테마 로더 PC
// @namespace    zeta-local
// @version      1.8.5
// @description  hllim-svg 카톡테마를 자동으로 불러옴 — 원래 이름·원래 프로필 사진 고정, 글자 크기 키움, 입력창 띠 제거
// @match        https://zeta-ai.io/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(()=>{'use strict';
// ───── 글자 크기 설정 (여기 숫자만 바꾸면 됨 / 테마 원래 크기는 13) ─────
const FONT={
  chat:15,   // 말풍선 대사·지문
  narrator:15, // 나레이션(줄 세 개 아이콘 붙은 지문 칸)
  input:15   // 아래 입력창 + 메시지 수정창
};
// ────────────────────────────────────────────────────────────

const d=document,w=window;
const SRC='https://hllim-svg.github.io/kakao-theme/zeta-kakao.js';
const SETTINGS_KEY='zeta-kakao-profile-settings-v1';
const FONT_ID='zeta-kakao-loader-font-style';
const deepActive=()=>{let a=d.activeElement;while(a&&a.shadowRoot&&a.shadowRoot.activeElement)a=a.shadowRoot.activeElement;return a};
const isEditable=el=>!!(el&&(el.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)||(el.closest&&el.closest('[contenteditable="true"],[role="textbox"]'))));
// 역병킬러 같은 다른 창 입력칸에 글 쓰는 중엔 화면 다시 맞추기를 쉬어서 한글 입력을 방해하지 않게
const typingElsewhere=()=>{const a=deepActive();return !!(a&&isEditable(a)&&!(a.matches&&a.matches('textarea[name="message"]')))};

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
  const R='html body .relative.flex.flex-row.items-end.gap-1\\.5.border-t:has(textarea[name="message"])';
  const N='html body :is([data-sentry-component="NarratorBubble"],[data-sentry-component="NarratorContentView"],[data-sentry-source-file="NarratorBubble.tsx"])';
  st.textContent=
    `${N},${N} :is(p,span,em,i,strong,b,div){font-size:${FONT.narrator}px!important;line-height:${lh(FONT.narrator)}!important;}`+
    `${B} .chat,${B} .chat p,${B} .chat :is(span,em,i,strong,b){font-size:${FONT.chat}px!important;line-height:${lh(FONT.chat)}!important;}`+
    `html body .relative.flex.flex-row.items-end.gap-1\\.5.border-t:has(textarea[name="message"]) textarea[name="message"],html body textarea[name="message"],html body textarea.zeta-kakao-edit-textarea{font-size:${FONT.input}px!important;line-height:${lh(FONT.input)}!important;}`+
    // 입력바는 제타 원래 배치대로: 한 줄짜리 둥근 칸 안에 [무료] 내용 입력하기 [*] [전송]
    `${R}{height:auto!important;min-height:0!important;padding:8px 12px!important;background:transparent!important;border-top:0!important;display:flex!important;align-items:center!important;}`+
    `${R}>div:has(textarea[name="message"]){position:relative!important;left:auto!important;top:auto!important;height:auto!important;min-height:48px!important;width:100%!important;background:#fff!important;border-radius:24px!important;padding:6px 8px!important;display:flex!important;align-items:center!important;gap:6px!important;box-shadow:0 1px 3px rgba(0,0,0,.08)!important;}`+
    `${R} textarea[name="message"]{position:static!important;left:auto!important;top:auto!important;width:auto!important;flex:1 1 auto!important;height:auto!important;min-height:22px!important;max-height:120px!important;field-sizing:content!important;padding:4px!important;}`+
    `${R} [data-sentry-component="QuickReplyButton"],${R} [data-testid="chat-send-button"]{position:static!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;margin:0!important;}`+
    `${R} [data-sentry-component="QuickReplyButton"] svg{color:#191919!important;}`+
    `${R} [data-sentry-component="AsteriskInputButton"]{display:flex!important;}`+
    `html body #zeta-kakao-profile-toggle{display:none!important;}`+
    `html body *{scrollbar-color:rgba(92,104,114,.45) transparent!important;}`+
    `html body *::-webkit-scrollbar-track,html body *::-webkit-scrollbar-corner{background:transparent!important;}`+
    `html body *::-webkit-scrollbar-thumb{background:rgba(92,104,114,.45)!important;border-radius:8px!important;}`+
    // 신고·수정·재생성 아이콘은 제타 원래 자리(입력바 위 오른쪽, 스냅샷 줄)로 — 위치는 아래 placeActions가 잡음
    `html body .zeta-kakao-native-actions.zeta-kakao-native-actions{opacity:1!important;}`+
    `html body [data-sentry-component="LastMessageControlBar"]:has(>.zeta-kakao-native-actions){min-height:36px!important;}`+
    `html body .zeta-kakao-native-actions button,html body .zeta-kakao-native-actions svg,html body .zeta-kakao-native-actions svg *{color:#191919!important;opacity:1!important;}`;
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
  new MutationObserver(()=>{if(!typingElsewhere())queue()}).observe(d.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  setTimeout(queue,300);setTimeout(queue,1200);setTimeout(queue,3000);
  w.__zetaKakaoBandFix=1;
};

// 화면에서 직접 찾아서 고치기 — 나레이션 글자 크기 + 카톡 입력바 버튼 살리기
const installAutoFix=()=>{
  if(w.__zetaKakaoAutoFix)return;
  const st=d.createElement('style');
  st.id='zeta-kakao-loader-autofix-style';
  const nl=lh(FONT.narrator);
  st.textContent=
    `html body [data-zknar][data-zknar],html body [data-zknar][data-zknar] *,html body [data-sentry-component="NarratorBubble"] .chat,html body [data-sentry-component="NarratorBubble"] .chat *{font-size:${FONT.narrator}px!important;line-height:${nl}!important;}`;
  (d.head||d.documentElement).appendChild(st);
  const clear=c=>!c||c==='transparent'||/rgba\([^)]*,\s*0\)$/.test(c)||/\/\s*0\)$/.test(c);
  const SKIP='[data-sentry-component="ChatBubbleContainer"],button,textarea,input,[contenteditable="true"],#chat2img-codex-root,#zeta-kakao-profile-settings,header';
  const scanNarrator=()=>{
    const list=d.querySelector('[data-sentry-component="ChatMessageList"]')||d.body;
    list.querySelectorAll('em,i').forEach(em=>{
      if(em.closest(SKIP)||em.closest('[data-zknar]'))return;
      const box=em.closest('p')||em.parentElement;
      if(!box||box===list||box.closest(SKIP))return;
      const fs=parseFloat(getComputedStyle(em).fontSize);
      if(fs<FONT.narrator)box.setAttribute('data-zknar','');
    });
  };
  // 제타가 입력창 줄 구조를 바꿔서(border-t 클래스가 빠짐) 카톡테마가 입력창을 '메시지 수정창'으로 착각하고
  // 아래 버튼들(이모지·사이렌·연필 등)을 숨겨버림 → 입력창 줄에 border-t를 다시 붙여서 원래 카톡 입력바로 인식하게 함
  const keepComposerRow=()=>{
    const send=d.querySelector('button[data-testid="chat-send-button"]');
    const row=send&&send.closest('div.relative.flex.flex-row.items-end');
    if(row&&row.querySelector('textarea[name="message"]')&&!row.classList.contains('border-t'))row.classList.add('border-t');
  };
  // 아이콘을 마지막 메시지 밑 줄(제타 원래 자리)에 붙여서, 스크롤하면 같이 움직이고 글과 안 겹치게
  const placeActions=()=>{
    const na=d.querySelector('.zeta-kakao-native-actions');
    if(!na)return;
    const bar=na.parentElement;
    const row=d.querySelector('div.relative.flex.flex-row.items-end.border-t');
    const list=d.querySelector('div[role="log"]')||d.querySelector('[data-sentry-component="ChatMessageList"]');
    if(!bar)return;
    const b=bar.getBoundingClientRect(),wd=na.getBoundingClientRect().width;
    const top=list?list.getBoundingClientRect().top:0;
    const bottom=Math.min(list?list.getBoundingClientRect().bottom:w.innerHeight,row?row.getBoundingClientRect().top:w.innerHeight);
    const vis=b.height>0&&b.top>=top&&b.bottom<=bottom+2;
    const set=(k,v)=>{if(na.style.getPropertyValue(k)!==v||na.style.getPropertyPriority(k)!=='important')na.style.setProperty(k,v,'important')};
    set('position','fixed');set('left',Math.round(b.right-8-wd)+'px');set('top',Math.round(b.top+(b.height-28)/2)+'px');set('right','auto');set('bottom','auto');set('margin','0');set('visibility',vis?'visible':'hidden');
  };
  d.addEventListener('scroll',()=>{try{placeActions()}catch(_){}},true);
  // 메시지 수정할 때 수정칸이 글 길이만큼 늘어나게 (화면 높이의 45%까지, 넘으면 스크롤)
  const fitEdit=()=>{
    d.querySelectorAll('textarea.zeta-kakao-edit-textarea').forEach(ta=>{
      if(!ta.__zkEditFit){
        let busy=false,last='';
        const fit=()=>{if(busy)return;busy=true;ta.style.setProperty('height','auto','important');ta.style.setProperty('min-height','0px','important');const max=Math.round(innerHeight*0.45);const h=Math.min(max,Math.max(44,ta.scrollHeight+2));last=h+'px';ta.style.setProperty('height',last,'important');ta.style.setProperty('max-height',max+'px','important');ta.style.setProperty('overflow-y',ta.scrollHeight+2>max?'auto':'hidden','important');busy=false};
        new MutationObserver(()=>{if(!busy&&ta.style.height!==last)fit()}).observe(ta,{attributes:true,attributeFilter:['style']});
        ta.addEventListener('input',()=>requestAnimationFrame(fit));
        ta.__zkEditFit=fit;
      }
      ta.__zkEditFit();
    });
  };
  let t=0;
  const run=()=>{if(t)return;t=setTimeout(()=>{t=0;try{scanNarrator()}catch(_){}try{keepComposerRow()}catch(_){}try{placeActions()}catch(_){}try{fitEdit()}catch(_){}},120)};
  w.addEventListener('resize',run);
  new MutationObserver(()=>{if(!typingElsewhere())run()}).observe(d.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  d.addEventListener('focusout',()=>setTimeout(run,50),true);
  setTimeout(run,300);setTimeout(run,1500);setTimeout(run,3500);
  w.__zetaKakaoAutoFix=1;
};

// 카톡테마는 '글 쓰는 칸이 아닐 때 백스페이스 = 뒤로가기 막기'를 하는데,
// 역병킬러·코냅샷처럼 별도 상자(shadow DOM) 안의 입력칸은 글 쓰는 칸으로 못 알아봐서 백스페이스를 막아버림 → 안쪽까지 확인하게 감쌈
const installBackspaceFix=()=>{
  const tick=()=>{
    const cur=w.__zetaKakaoBackspaceHandler;
    if(typeof cur!=='function'||cur.__zkWrapped)return;
    const orig=cur;
    const wrapped=e=>{const k=e.key==='Backspace'||e.code==='Backspace'||e.keyCode===8;if(k&&isEditable(deepActive()))return;return orig(e)};
    wrapped.__zkWrapped=1;
    w.removeEventListener('keydown',orig,true);d.removeEventListener('keydown',orig,true);
    w.__zetaKakaoBackspaceHandler=wrapped;
    w.addEventListener('keydown',wrapped,true);
  };
  tick();setInterval(tick,1500);
};

const load=()=>{
  if(w.__zetaKakaoLoaderPending)return;
  w.__zetaKakaoLoaderPending=1;
  forceOriginal();
  const s=d.createElement('script');
  s.referrerPolicy='no-referrer';
  s.src=SRC+'?v='+Date.now();
  s.onload=()=>{w.__zetaKakaoLoaderPending=0;s.remove();applyFont();setTimeout(applyFont,800);installBackspaceFix()};
  s.onerror=()=>{w.__zetaKakaoLoaderPending=0;s.remove();console.warn('[카톡테마 로더] 테마 파일을 불러오지 못했습니다. URL 또는 스크립트 차단 설정을 확인해 주세요.')};
  (d.head||d.documentElement).appendChild(s);
};

applyFont();
installBandFix();
installAutoFix();
load();
})();
