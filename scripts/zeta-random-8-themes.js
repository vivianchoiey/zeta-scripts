// ==UserScript==
// @name         Zeta Random 8 Themes
// @namespace    zeta-custom-themes
// @version      1.3.6
// @description  제타 8종 랜덤 테마 - 나레이션 및 입력창 수정, 글자 크기 15px, 밝은 배경 흰 글씨 보정, 새 입력창(검은 바) 대응
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(()=>{
"use strict";
const themes=[{"name":"핑크","bg":"#FFF5FC","other":"#FFFFFF","user":"#FFDAEB","border":"#F0C9DE","accent":"#E78BB6","scroll":"#E9A5C6","text":"#51434F","sub":"#8E7180","muted":"#A58B9B","soft":"#F8E1ED","buttonText":"#FFFFFF","image":"https://i.ifh.cc/w51mh1.jpg","narratorBg":"rgba(255,245,252,.92)","narratorText":"#8E7180"},{"name":"베이비 블루","bg":"#F1F8FD","other":"#FFFFFF","user":"#D5ECFA","border":"#C1DFEF","accent":"#70AACE","scroll":"#91C4E2","text":"#304654","sub":"#728995","muted":"#8196A3","soft":"#D5ECFA","buttonText":"#FFFFFF","image":"https://i.ifh.cc/k954BZ.jpg","narratorBg":"rgba(241,248,253,.88)","narratorText":"#728995"},{"name":"피스타치오","bg":"#F4F9ED","other":"#FFFFFF","user":"#DDEBC5","border":"#C8D9AC","accent":"#78964D","scroll":"#9AB871","text":"#39432F","sub":"#72805F","muted":"#839071","soft":"#DDEBC5","buttonText":"#FFFFFF","image":"https://i.ifh.cc/g80d5n.jpg","narratorBg":"rgba(244,249,237,.88)","narratorText":"#72805F"},{"name":"버터 옐로우","bg":"#FFFCF0","other":"#FFFFFF","user":"#F7EDB8","border":"#E7D995","accent":"#B99B38","scroll":"#D1B94F","text":"#49432E","sub":"#88805F","muted":"#9A916F","soft":"#F7EDB8","buttonText":"#FFFFFF","image":"https://i.ifh.cc/6ZDGs6.jpg","narratorBg":"rgba(255,249,229,.88)","narratorText":"#625936"},{"name":"라벤더","bg":"#F5F1FA","other":"#FFFFFF","user":"#E5D9F2","border":"#D7C8E7","accent":"#9A7BC0","scroll":"#B49BD0","text":"#40364A","sub":"#84758F","muted":"#9587A2","soft":"#E5D9F2","buttonText":"#FFFFFF","image":"https://i.ifh.cc/tT7dVG.jpg","narratorBg":"rgba(245,241,250,.88)","narratorText":"#84758F"},{"name":"코랄","bg":"#FFF5F1","other":"#FFFFFF","user":"#F7D2C5","border":"#E8BBAE","accent":"#D97862","scroll":"#E29A85","text":"#4B3732","sub":"#8D726B","muted":"#9C817A","soft":"#F7D2C5","buttonText":"#FFFFFF","image":"https://i.ifh.cc/nkTXGT.jpg","narratorBg":"rgba(255,245,241,.88)","narratorText":"#8D726B"},{"name":"미드나잇 블루","bg":"#1D2535","other":"#303B50","user":"#52678D","border":"#53647E","accent":"#A9C8FF","scroll":"#A9C8FF","text":"#F2F5FF","sub":"#AFBED4","muted":"#8F9DB3","soft":"#52678D","buttonText":"#1D2535","image":"https://i.ifh.cc/jsFrSf.jpg","narratorBg":"rgba(48,59,80,.88)","narratorText":"#AFBED4"},{"name":"다크 로즈","bg":"#29232A","other":"#39303A","user":"#68495B","border":"#765669","accent":"#F0A9C7","scroll":"#D987AC","text":"#FFF2F7","sub":"#C9A9BA","muted":"#B69CAA","soft":"#68495B","buttonText":"#FFF2F7","image":"https://i.ifh.cc/F59aOw.jpg","narratorBg":"rgba(57,48,58,.88)","narratorText":"#C9A9BA"}];
const C=themes[Math.floor(Math.random()*themes.length)];
const ID="zeta-random-eight-theme";
["__zetaPinkV4","__zetaPistachio","__zetaDarkRoseObserver","__zetaRandomObserver"].forEach(k=>{try{window[k]?.disconnect?.()}catch(e){}});
window.__zetaRandomBookmarklet?.observer?.disconnect?.();
["zeta-babyblue","zeta-pistachio","zeta-coral-theme","zeta-dark-rose","zeta-dark-rose-theme","zeta-random-eight-theme","zeta-random-bookmarklet","zeta-pink-plot-text","zeta-pink-creator-list-text"].forEach(id=>document.getElementById(id)?.remove());
for(let i=15;i<=22;i++)document.getElementById("zeta-pink-v"+i)?.remove();
const s=document.createElement("style");s.id=ID;
s.textContent=`

html,body,#__next,header[data-sentry-component="Header"]{background:${C.bg}!important}
html,body,#__next,*{scrollbar-color:${C.scroll} ${C.bg}!important}
*::-webkit-scrollbar{width:6px}*::-webkit-scrollbar-track{background:${C.bg}!important}*::-webkit-scrollbar-thumb{background:${C.scroll}!important;border-radius:99px!important}
header[data-sentry-component="Header"]{background:${C.bg}!important;border-bottom:1px solid ${C.border}!important;position:relative;z-index:20}
header[data-sentry-component="Header"] :is(.text-white,.text-gray-200),button[data-testid="chat-header-model"],header[data-sentry-component="Header"] .body1.font-medium{color:${C.sub}!important;-webkit-text-fill-color:${C.sub}!important}
button[data-testid="chat-header-model"]{background:transparent!important}
[role="log"][aria-label="Chat messages"]{background:transparent!important;scrollbar-color:${C.scroll} ${C.bg}!important}
[role="log"][aria-label="Chat messages"]::before{content:"";position:fixed;inset:50px 0 53px;background:${C.bg} url("${C.image}") center top/100% auto repeat;pointer-events:none;z-index:-1}
[data-sentry-component="ChatBubbleContainer"]{border-radius:21px!important;border:1px solid ${C.border}!important}
[data-sentry-component="ChatBubbleContainer"].bg-gray-sub1{background:${C.other}!important;border-color:${C.border}!important;box-shadow:inset 0 2px 3px #FFFFFF25,inset 0 -3px 6px ${C.border}50,0 3px 9px #00000012!important}
[data-sentry-component="ChatBubbleContainer"].bg-bubble-user{background:${C.user}!important;border-color:${C.border}!important;box-shadow:inset 0 1px 2px #FFFFFF35,inset 0 -2px 4px ${C.border}50,0 3px 8px #00000012!important}
[data-sentry-component="ChatBubbleContainer"] .chat,[data-sentry-component="ChatBubbleContainer"] .chat p{color:${C.text}!important;-webkit-text-fill-color:${C.text}!important;font-weight:400!important;text-decoration:none!important}
[data-sentry-component="ChatBubbleContainer"] .chat em,[data-sentry-component="ChatBubbleContainer"] .chat em *{color:color-mix(in srgb,${C.muted} 35%,${C.text})!important;-webkit-text-fill-color:color-mix(in srgb,${C.muted} 35%,${C.text})!important}
[data-sentry-component="ChatBubbleContainer"] .chat,[data-sentry-component="ChatBubbleContainer"] .chat *,.message-context-menu-trigger:has(svg[data-sentry-source-file="NarratorBubble.tsx"]) .chat,.message-context-menu-trigger:has(svg[data-sentry-source-file="NarratorBubble.tsx"]) .chat *{font-size:15px!important;line-height:1.4!important}
.message-context-menu-trigger:has(svg[data-sentry-source-file="NarratorBubble.tsx"]){background:${C.narratorBg}!important;background-color:${C.narratorBg}!important;border:1px solid ${C.border}!important;border-radius:12px!important;box-shadow:none!important}
.message-context-menu-trigger:has(svg[data-sentry-source-file="NarratorBubble.tsx"]) .chat,.message-context-menu-trigger:has(svg[data-sentry-source-file="NarratorBubble.tsx"]) .chat *{color:color-mix(in srgb,${C.narratorText} 35%,${C.text})!important;-webkit-text-fill-color:color-mix(in srgb,${C.narratorText} 35%,${C.text})!important}
.message-context-menu-trigger svg[data-sentry-source-file="NarratorBubble.tsx"]{color:${C.accent}!important}
[data-sentry-component="LeftTextContent"] .caption1,[data-sentry-component="RightTextContent"] .caption1{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important}
[data-sentry-component="NavigationBar"]{background:${C.bg}!important;border-top:1px solid ${C.border}!important}
[data-sentry-component="NavigationBar"] [id^="navigation-item-"] :is(svg,span){color:${C.sub}!important;-webkit-text-fill-color:${C.sub}!important}
[data-sentry-component="NavigationBar"] [id^="navigation-item-"].text-gray-200 :is(svg,span),[data-sentry-component="NavigationBar"] [id^="navigation-item-"] :is(svg.text-gray-200,span.text-gray-200){color:${C.accent}!important;-webkit-text-fill-color:${C.accent}!important}
a[testid^="room-list-item-"] .body2{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important}
a[testid^="room-list-item-"] :is([class*="text-white"],[class*="text-gray-100"],[class*="text-gray-200"],.font-medium:not(.body2)),[data-sentry-source-file="RoomListHeader.tsx"],[data-sentry-source-file="RoomListHeader.tsx"] *{color:${C.sub}!important;-webkit-text-fill-color:${C.sub}!important}
[data-sentry-component="QuickReplyButton"] button,[data-sentry-component="QuickReplyButton"] button>span,[data-sentry-component="LastMessageControlBar"] button,[data-sentry-component="ActionPanelButton"] button,button[data-testid="snapshot-action-button"]{background:transparent!important;border-color:transparent!important;box-shadow:none!important}
[data-sentry-component="QuickReplyButton"] button svg,[data-sentry-component="QuickReplyButton"]>span,[data-sentry-component="LastMessageControlBar"] button,[data-sentry-component="LastMessageControlBar"] button svg,[data-sentry-component="ActionPanelButton"] button :is(svg,span){color:${C.accent}!important;-webkit-text-fill-color:${C.accent}!important}
button[data-testid="chat-scroll-to-bottom"]{background:${C.other}!important}button[data-testid="chat-scroll-to-bottom"] svg{color:${C.accent}!important}
form[data-sentry-source-file="MyPlotChatProfileEdit.tsx"] :is(input[name="name"],textarea[name="description"]){color:${C.text}!important;-webkit-text-fill-color:${C.text}!important;caret-color:${C.accent}!important}
form[data-sentry-source-file="MyPlotChatProfileEdit.tsx"] :is(label:has(>input[name="name"]),textarea[name="description"]){background:${C.other}!important;border-color:${C.border}!important}
form[data-sentry-source-file="MyPlotChatProfileEdit.tsx"] :is(h3,.body16,.title18){color:${C.sub}!important}
form[data-sentry-source-file="MyPlotChatProfileEdit.tsx"] .body12{color:${C.muted}!important}
form[data-sentry-source-file="MyPlotChatProfileEdit.tsx"] .caption12{color:${C.accent}!important}
[data-sentry-component="PlotBasic"] p.heading3,[data-sentry-source-file="PlotBasic.tsx"] p.heading3,[data-sentry-component="PlotLongDescription"] h3,[data-sentry-component="PlotCharacterAbout"] .heading2{color:${C.text}!important;-webkit-text-fill-color:${C.text}!important}
[data-sentry-component="PlotLongDescription"] .body1,[data-sentry-component="PlotLongDescription"] .body1 p,[data-sentry-component="PlotCharacterAbout"] .body1,[data-sentry-component="PlotCharacterAbout"] .body1 p{color:${C.sub}!important;-webkit-text-fill-color:${C.sub}!important}
a:has([data-sentry-source-file="CreatorCenterMyPlotListItem.tsx"]) [data-sentry-source-file="CreatorCenterMyPlotListItem.tsx"].body1.font-medium{color:${C.text}!important;-webkit-text-fill-color:${C.text}!important}
a:has([data-sentry-source-file="CreatorCenterMyPlotListItem.tsx"]) .caption1{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important}
/* 일반 채팅 입력창 */
div.flex.flex-row.items-end.border-t:has([data-sentry-component="QuickReplyButton"]),div.flex.flex-row.items-end.gap-1\\.5.border-t:has([data-sentry-component="QuickReplyButton"]){background:${C.bg}!important;background-color:${C.bg}!important;border-color:${C.border}!important;align-items:flex-end!important}
div.flex.flex-row.items-end.border-t div:has(>textarea[name="message"][aria-label="내용 입력하기"]),div.flex.flex-row.items-end.gap-1\\.5.border-t div:has(>textarea[name="message"][aria-label="내용 입력하기"]){background:${C.other}!important;background-color:${C.other}!important;border:1px solid ${C.border}!important;border-radius:20px!important;min-height:40px!important;height:auto!important;align-self:stretch!important;display:flex!important;align-items:flex-end!important}
div:has(>textarea[name="message"][aria-label="내용 입력하기"])>textarea{background:transparent!important;background-color:transparent!important}
textarea[name="message"][aria-label="내용 입력하기"]{background:transparent!important;background-color:transparent!important;color:${C.text}!important;-webkit-text-fill-color:${C.text}!important;caret-color:${C.accent}!important;max-height:160px!important}
textarea[name="message"][aria-label="내용 입력하기"]::placeholder{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important;opacity:1!important}
[data-sentry-component="QuickReplyButton"]>button>span{background:transparent!important}
[data-sentry-component="QuickReplyButton"]>button svg,[data-sentry-component="QuickReplyButton"]>span.caption2{color:${C.accent}!important;-webkit-text-fill-color:${C.accent}!important}
button[data-testid="chat-send-button"]{background:${C.accent}!important;background-color:${C.accent}!important}button[data-testid="chat-send-button"] svg{color:${C.buttonText}!important}
textarea[name="message"][aria-label="내용 입력하기"]~[data-sentry-component="AsteriskInputButton"] button{background:transparent!important;border:0!important}
textarea[name="message"][aria-label="내용 입력하기"]~[data-sentry-component="AsteriskInputButton"] svg{color:${C.accent}!important}
/* 메시지 수정창 */
div.rounded-t-xl:has([aria-label="Resize edit area"]){background:${C.bg}!important;background-color:${C.bg}!important;border-color:${C.border}!important}
div.rounded-t-xl:has([aria-label="Resize edit area"]) div:has(>textarea[name="message"]){background:transparent!important;background-color:transparent!important}
div[aria-label="Resize edit area"]>div{background:${C.scroll}!important}
div.rounded-t-xl:has([aria-label="Resize edit area"]) textarea[name="message"]{background:transparent!important;background-color:transparent!important;color:${C.text}!important;-webkit-text-fill-color:${C.text}!important;caret-color:${C.accent}!important}
div.flex.shrink-0.flex-row:has(>button[aria-label="Cancel editing"]){background:${C.bg}!important;background-color:${C.bg}!important;border-color:${C.border}!important}
button[aria-label="Cancel editing"],div.flex.shrink-0.flex-row:has(>button[aria-label="Cancel editing"]) button[aria-label="Insert asterisk"]{background:${C.soft}!important;color:${C.accent}!important;border:1px solid ${C.border}!important}
button[aria-label="Save edit"]{background:${C.accent}!important;border:1px solid ${C.accent}!important;color:${C.buttonText}!important}
button[aria-label="Cancel editing"] svg,div.flex.shrink-0.flex-row:has(>button[aria-label="Cancel editing"]) button[aria-label="Insert asterisk"] svg{color:${C.accent}!important}
button[aria-label="Save edit"] svg{color:${C.buttonText}!important}
/* 크리에이터 센터 */
[data-sentry-source-file="Select.tsx"].caption1.font-medium{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important}
div[data-sentry-source-file="CreatorCenterHeader.tsx"] button.heading1{color:${C.text}!important;-webkit-text-fill-color:${C.text}!important}
div[data-sentry-source-file="CreatorCenterHeader.tsx"] button.heading1[class*="text-white/50"]{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important}
[data-sentry-component="CreatorCenterModeFilter"]{border-color:${C.border}!important}
[data-sentry-component="CreatorCenterModeFilter"] button.heading3{color:${C.text}!important;-webkit-text-fill-color:${C.text}!important}
[data-sentry-component="CreatorCenterModeFilter"] button.heading3[class*="text-white/50"]{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important}
.mb-1.flex.flex-col.gap-0\\.5.pt-4.pb-2>span.caption1{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important}
.mb-1.flex.flex-col.gap-0\\.5.pt-4.pb-2 .body1.font-medium{color:${C.text}!important;-webkit-text-fill-color:${C.text}!important}
[data-sentry-component="CreatorCenterMyLorebookListItem"]{border-color:${C.border}!important}
[data-sentry-component="CreatorCenterMyLorebookListItem"] span.body1.font-medium{color:${C.text}!important;-webkit-text-fill-color:${C.text}!important}
[data-sentry-component="CreatorCenterMyLorebookListItem"] span.caption1{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important}
[data-sentry-component="CreatorCenterMyLorebookListItem"] svg{color:${C.accent}!important}
/* 새 입력창(2026-10 업데이트) - 검은 바 자동 감지 후 테마색으로 */
[data-zbar="pill"]{background:${C.other}!important;background-color:${C.other}!important;background-image:none!important;border:1px solid ${C.border}!important;box-shadow:0 3px 10px #00000014!important}
[data-zbar="inner"],[data-zbar="clear"]{background:transparent!important;background-color:transparent!important;background-image:none!important;box-shadow:none!important}
[data-zbar="in"]{background:${C.soft}!important;background-color:${C.soft}!important;background-image:none!important;border-color:${C.border}!important;box-shadow:none!important}
[data-zbar="wrap"]{background:${C.bg}!important;background-color:${C.bg}!important;background-image:none!important;box-shadow:none!important}
[data-zgrad]{background-image:none!important}
[data-zsh]{box-shadow:none!important}
[data-zps*="b"]::before,[data-zps*="a"]::after{background:transparent!important;background-image:none!important;box-shadow:none!important}
[data-zbar="pill"] :is(textarea,input),[data-zbar="pill"] [contenteditable="true"],[data-zbar="pill"] [contenteditable="true"] *{background:transparent!important;background-color:transparent!important;color:${C.text}!important;-webkit-text-fill-color:${C.text}!important;caret-color:${C.accent}!important}
[data-zbar="pill"] :is(textarea,input)::placeholder{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important;opacity:1!important}
[data-zbar="pill"] [contenteditable="true"] *::before{color:${C.muted}!important;-webkit-text-fill-color:${C.muted}!important}
[data-zbar="pill"] :is(button,[role="button"]):not([data-testid="chat-send-button"]) svg{color:${C.accent}!important}
/* 밝은 배경 위 흰 글씨 보정 */
[data-zfix="1"]{color:${C.text}!important;-webkit-text-fill-color:${C.text}!important}
[data-zfix="2"]{color:${C.sub}!important;-webkit-text-fill-color:${C.sub}!important}
`;
document.head.appendChild(s);
const update=()=>{document.querySelectorAll('[data-sentry-component="ChatBubbleContainer"]').forEach(b=>{const left=b.closest('[data-sentry-component="LeftTextContent"]');const right=b.closest('[data-sentry-component="RightTextContent"]');if(!left&&!right)return;const rm=left?"bg-bubble-user":"bg-gray-sub1",ad=left?"bg-gray-sub1":"bg-bubble-user";if(b.classList.contains(rm))b.classList.remove(rm);if(!b.classList.contains(ad))b.classList.add(ad);["background","background-color","background-image","box-shadow"].forEach(p=>{if(b.style.getPropertyValue(p))b.style.removeProperty(p)})})};
const _cv=document.createElement("canvas");_cv.width=_cv.height=1;const _cx=_cv.getContext("2d",{willReadFrequently:true});const _cc=new Map();
const rgb=c=>{if(!c||c==="transparent")return null;if(_cc.has(c))return _cc.get(c);let r=null;try{_cx.clearRect(0,0,1,1);_cx.fillStyle="#000";_cx.fillStyle=c;_cx.fillRect(0,0,1,1);const d=_cx.getImageData(0,0,1,1).data;const a=d[3]/255;r=a?{r:d[0]/a,g:d[1]/a,b:d[2]/a,a}:{r:0,g:0,b:0,a:0}}catch(e){}_cc.set(c,r);return r};
const lum=c=>(0.2126*c.r+0.7152*c.g+0.0722*c.b)/255;
const pageBg=()=>rgb(getComputedStyle(document.body).backgroundColor)||{r:255,g:255,b:255,a:1};
const effBg=el=>{let e=el;while(e&&e!==document.documentElement){const c=rgb(getComputedStyle(e).backgroundColor);if(c&&c.a>=0.5)return c;e=e.parentElement}return pageBg()};
const hasText=el=>{for(const n of el.childNodes)if(n.nodeType===3&&n.textContent.trim())return true;return false};
const SKIPTAG={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1,NOSCRIPT:1};
const eachEl=fn=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_ELEMENT,{acceptNode:n=>(SKIPTAG[n.tagName]||n.isContentEditable||(n.getAttribute&&n.getAttribute('role')==='log'))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;while((n=w.nextNode()))fn(n)};
const fixText=()=>{eachEl(el=>{
  if(el.hasAttribute('data-zfix'))return;
  const isSvg=el.tagName==='svg';
  if(!isSvg&&!hasText(el))return;
  const c=rgb(getComputedStyle(el).color);if(!c)return;
  const L=lum(c);if(L<0.7)return;
  const mx=Math.max(c.r,c.g,c.b),mn=Math.min(c.r,c.g,c.b);if(mx&&(mx-mn)/mx>0.25)return;
  const bg=effBg(el);if(lum(bg)<0.6)return;
  el.setAttribute('data-zfix',(c.a<0.8||L<0.9)?'2':'1');
})};
const isDark=c=>!!c&&c.a>=0.35&&lum(c)<0.35;
const hasGrad=v=>!!v&&v!=="none"&&/gradient/.test(v);
const STOP=e=>!e||e===document.body||e===document.documentElement||e.id==="__next"||e.tagName==="MAIN"||e.matches('[role="log"]')||!!e.querySelector('[role="log"]');
const setA=(el,k,v)=>{if(el.getAttribute(k)!==v)el.setAttribute(k,v)};
const markPs=el=>{let v="";for(const p of ["::before","::after"]){const cs=getComputedStyle(el,p);if(!cs.content||cs.content==="none"||cs.content==="normal")continue;if(isDark(rgb(cs.backgroundColor))||hasGrad(cs.backgroundImage)||(cs.boxShadow&&cs.boxShadow!=="none"))v+=p==="::before"?"b":"a"}if(v)setA(el,"data-zps",v)};
const fixComposer=()=>{
  const send=document.querySelector('button[data-testid="chat-send-button"]');if(!send)return;
  let base=send.parentElement,input=null;
  for(let i=0;base&&i<7&&!STOP(base);i++,base=base.parentElement){input=base.querySelector('textarea,[contenteditable="true"]');if(input)break}
  if(!input||!base||STOP(base))return;
  let pill=null;
  for(let e=base,i=0;e&&i<5&&!STOP(e);i++,e=e.parentElement){if(e.getAttribute("data-zbar")==="pill"||isDark(rgb(getComputedStyle(e).backgroundColor))){pill=e;break}}
  if(!pill)pill=base;
  setA(pill,"data-zbar","pill");markPs(pill);
  pill.querySelectorAll("*").forEach(el=>{
    if(el===send||send.contains(el)||el.closest("svg")||el===input||el.tagName==="TEXTAREA"||el.tagName==="INPUT"||el.isContentEditable)return;
    const cs=getComputedStyle(el);
    if(!el.hasAttribute("data-zbar")&&isDark(rgb(cs.backgroundColor)))setA(el,"data-zbar",(el.contains(input)||el.contains(send))?"inner":"in");
    if(hasGrad(cs.backgroundImage))setA(el,"data-zgrad","1");
    markPs(el);
  });
  for(let e=pill.parentElement,i=0;e&&i<6&&!STOP(e);i++,e=e.parentElement){
    const cs=getComputedStyle(e),c=rgb(cs.backgroundColor);
    if(!e.hasAttribute("data-zbar")&&isDark(c))setA(e,"data-zbar",c.a>=0.9?"wrap":"clear");
    if(hasGrad(cs.backgroundImage))setA(e,"data-zgrad","1");
    if(cs.boxShadow&&cs.boxShadow!=="none")setA(e,"data-zsh","1");
    markPs(e);
  }
};
const run=()=>{update();try{fixComposer()}catch(e){}try{fixText()}catch(e){}};
run();let pending;
const queue=()=>{clearTimeout(pending);pending=setTimeout(run,80)};
window.__zetaRandomObserver=new MutationObserver(queue);
window.__zetaRandomObserver.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["class","style"]});
["transitionend","animationend","pageshow","popstate","focus"].forEach(ev=>window.addEventListener(ev,queue,true));
[300,800,1500,3000].forEach(ms=>setTimeout(run,ms));
if(window.__zetaEnterHandler)document.removeEventListener("keydown",window.__zetaEnterHandler,true);
window.__zetaEnterHandler=function(e){const t=e.target;if(!(t.matches?.('textarea[name="message"][aria-label="내용 입력하기"]')||(t.tagName==="TEXTAREA"&&t.closest?.('[data-zbar="pill"]'))))return;if(e.key!=="Enter"||e.isComposing||e.keyCode===229)return;if(e.ctrlKey&&!e.shiftKey&&!e.altKey&&!e.metaKey){e.preventDefault();e.stopImmediatePropagation();const btn=document.querySelector('button[data-testid="chat-send-button"]');if(btn&&!btn.disabled)btn.click()}else if(!e.ctrlKey&&!e.altKey&&!e.metaKey){e.stopImmediatePropagation()}};
document.addEventListener("keydown",window.__zetaEnterHandler,true);
console.log("Zeta Random Theme:",C.name);
})();