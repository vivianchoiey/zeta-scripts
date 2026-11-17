// ==UserScript==
// @name         제타 채팅 프레임 호환 (테마용)
// @namespace    vivianchoiey-zeta-frame-compat
// @version      1.0.0
// @description  2026-11 제타가 채팅방을 frame.pingpong.ai 안에서 그리면서 data-sentry-component 표시와 <main>이 사라짐 → 예전 이름표를 다시 붙이고 테마 CSS의 main 선택자를 프레임 구조에 맞춰 복제해서, 기존 테마들이 그대로 먹게 함
// @match        https://frame.pingpong.ai/*
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  if(location.hostname!=='frame.pingpong.ai'||window.__zetaFrameCompatV1)return;window.__zetaFrameCompatV1=1;
  var D=document;
  function tag(el,name){if(el&&el.nodeType===1&&el.getAttribute('data-sentry-component')!==name)el.setAttribute('data-sentry-component',name);}
  function up(el,n){while(el&&n-->0)el=el.parentElement;return el;}
  function run(){
    var root=D.getElementById('zeta');
    if(root){
      var shell=root.firstElementChild;tag(shell,'ChatRoomReadyView');
    }
    D.querySelectorAll('header').forEach(function(h){tag(h,'Header');});
    // 캐릭터/유저 말풍선
    D.querySelectorAll('.message-context-menu-trigger').forEach(function(b){
      var c=String(b.className);
      if(/bg-bubble-user|bg-gray-sub1/.test(c)){
        tag(b,'ChatBubbleContainer');
        var row=up(b,3);
        if(row){tag(row,/self-end|bg-bubble-user/.test(c)?'RightTextContent':'LeftTextContent');tag(row.parentElement,'BodyView');}
      }else if(/bg-gray-main/.test(c)&&/rounded-12/.test(c)){
        // 내레이션
        tag(b.parentElement,'NarratorBubble');tag(up(b,2),'BodyView');
      }
    });
    D.querySelectorAll('[role="log"] img.select-none').forEach(function(img){
      var w=img.closest('div.pointer-events-none.absolute');if(w&&/right-\[-30px\]/.test(w.className))tag(w,'ZetaWatermarkRaw');
    });
    D.querySelectorAll('[data-testid="message-loading"]').forEach(function(e){tag(e,'MessageLoadingIndicator');});
    var dock=D.querySelector('[data-testid="chat-bottom-dock"]');if(dock)tag(dock,'ChatComposer');
    var edit=D.querySelector('button[aria-label="Edit message"]');
    if(edit){var bar=edit.parentElement&&edit.parentElement.parentElement;tag(bar,'LastMessageControlBar');}
    D.querySelectorAll('textarea[name="message"]').forEach(function(t){
      if(!t.closest('[data-testid="composer-input-box"]'))tag(t.parentElement,'EditModeInputPanelContent');
    });
  }
  // 테마 CSS 안의 main 선택자를 프레임 루트(#zeta)에도 적용되게 복제
  var MAINRE=/(^|[\s,>+~{}()])main(?=[\s\[\.:>,{)#~+])/g;
  var done=new WeakSet();
  function cloneMain(){
    D.querySelectorAll('style').forEach(function(st){
      if(done.has(st)||st.id==='zfc-main-clone'||st.getAttribute('data-zfc-clone'))return;
      var t=st.textContent||'';
      if(!/(^|[\s,>+~{}()])main(?=[\s\[\.:>,{)#~+])/.test(t)){done.add(st);return;}
      // 제타 자체 스타일(아주 큼)은 건너뜀
      if(t.length>400000&&!st.id){done.add(st);return;}
      done.add(st);
      var c=D.createElement('style');c.setAttribute('data-zfc-clone',st.id||'anon');
      c.textContent=t.replace(MAINRE,'$1#zeta');
      st.after(c);
      // 원본이 바뀌면 다시 복제
      new MutationObserver(function(){c.textContent=(st.textContent||'').replace(MAINRE,'$1#zeta');}).observe(st,{childList:true,characterData:true,subtree:true});
    });
  }
  var q=0;function go(){if(q)return;q=1;requestAnimationFrame(function(){q=0;try{run();cloneMain();}catch(e){}});}
  var start=function(){go();new MutationObserver(go).observe(D.documentElement,{childList:true,subtree:true});};
  if(D.body)start();else D.addEventListener('DOMContentLoaded',start,{once:true});
})();
