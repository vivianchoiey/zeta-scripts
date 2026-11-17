// ==UserScript==
// @name         iOS 사파리 키보드 내려감 오류 픽스
// @namespace    vivianchoiey-ios-keyboard-fix
// @version      1.0.0
// @description  아이폰·아이패드 사파리에서 입력창을 누르면 키보드가 내려가거나 화면이 밀리는 오류 보정 (portal 픽스 북마클릿을 자동 실행으로 바꾸고, 2026-11 채팅 프레임 구조까지 대응)
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  if(window.top!==window||window.__zetaIosKbFix)return;window.__zetaIosKbFix=1;
  var vv=window.visualViewport;
  // 터치 기기(아이폰·아이패드)에서만 작동. 맥·윈도우에서는 아무것도 안 함
  if(!vv||!(navigator.maxTouchPoints>0))return;
  var setH=function(el,h,top){
    if(!el)return;
    if(h==null){el.style.removeProperty('height');el.style.removeProperty('top');return;}
    el.style.setProperty('height',h+'px','important');
    if(top!=null)el.style.setProperty('top',top+'px','important');
  };
  var fix=function(){
    var h=Math.round(vv.height),off=Math.round(vv.offsetTop||0);
    var open=h<window.innerHeight-80; // 키보드가 올라와 있을 때
    // 원래 북마클릿 동작: 화면 아래 팝업 영역 높이를 실제 보이는 높이에 맞춤
    setH(document.getElementById('portal-container'),h);
    // 2026-11 이후 채팅창(프레임)도 보이는 높이에 맞춤 → 입력창이 키보드 위에 붙어 있게
    document.querySelectorAll('iframe[src*="frame.pingpong.ai"]').forEach(function(f){
      if(open)setH(f,h,off);else setH(f,null);
    });
  };
  vv.addEventListener('resize',fix);
  vv.addEventListener('scroll',fix);
  setInterval(fix,1500);
  fix();
})();
