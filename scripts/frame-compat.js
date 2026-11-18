// ==UserScript==
// @name         제타 채팅 프레임 호환 (테마용)
// @namespace    vivianchoiey-zeta-frame-compat
// @version      1.3.1
// @description  2026-11 제타가 채팅방을 frame.pingpong.ai 안에서 그리면서 data-sentry-component 표시와 <main>이 사라짐 → 예전 이름표를 다시 붙이고 테마 CSS의 main 선택자를 프레임 구조에 맞춰 복제해서, 기존 테마들이 그대로 먹게 함
// @match        https://frame.pingpong.ai/*
// @match        https://zeta-ai.io/*
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  var D=document;
  // ── 바깥 화면(zeta-ai.io): 채팅 프레임을 화면 전체로 펼쳐서, 안·밖 테마가 따로 놀지 않게 함 (채팅 폭은 프레임 안에서 480px로 유지)
  if(location.hostname!=='frame.pingpong.ai'){
    if(window.top!==window||window.__zetaFrameCompatTop)return;window.__zetaFrameCompatTop=1;
    var css='html.zfc-room iframe[src*="frame.pingpong.ai"]{position:fixed!important;inset:0!important;left:0!important;top:0!important;width:100vw!important;height:100%!important;max-width:none!important;z-index:2147480000!important;border:0!important;background:transparent!important}';
    var st=D.createElement('style');st.id='zfc-top';st.textContent=css;(D.head||D.documentElement).appendChild(st);
    var tick=function(){if(!st.isConnected)(D.head||D.documentElement).appendChild(st);D.documentElement.classList.toggle('zfc-room',!!D.querySelector('iframe[src*="frame.pingpong.ai"]'));};
    tick();setInterval(tick,500);
    return;
  }
  if(window.__zetaFrameCompatV1)return;window.__zetaFrameCompatV1=1;
  // ── 프레임 안: 화면 전체로 펼쳐진 프레임에서 채팅 영역만 가운데 480px로
  (function(){var st=D.createElement('style');st.id='zfc-frame';st.textContent='#zeta header,#zeta [role="log"],#zeta [data-testid="chat-bottom-dock"]{max-width:480px!important;width:100%!important;margin-left:auto!important;margin-right:auto!important;}#zeta [role="log"]{left:0!important;right:0!important;}#zeta div:has(>header){background-color:transparent!important;background-image:none!important;}';(D.head||D.documentElement).appendChild(st);setInterval(function(){if(!st.isConnected)(D.head||D.documentElement).appendChild(st)},1500);})();
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
  // 테마가 채팅 목록 칸에만 그린 배경(무늬)을 화면 전체(body)로 옮겨서 안·밖이 같은 배경이 되게 함
  var hoisted=null;
  function hoist(){
    var log=D.querySelector('#zeta [role="log"]');if(!log)return;
    var el=log,pick=null;
    for(var i=0;i<8&&el&&el!==D.body;i++,el=el.parentElement){
      if(el===hoisted)continue;
      var cs=getComputedStyle(el);
      if(cs.backgroundImage!=='none'){pick=el;break;}
    }
    if(!pick)return;
    var cs2=getComputedStyle(pick);
    var key=cs2.backgroundImage.length+'|'+cs2.backgroundImage.slice(0,200)+'|'+cs2.backgroundColor;
    if(D.body.getAttribute('data-zfc-bg')===key)return;
    var b=D.body.style,h=D.documentElement.style;
    ['background-color','background-image','background-size','background-repeat','background-position'].forEach(function(p){
      var v=cs2.getPropertyValue(p);b.setProperty(p,v,'important');h.setProperty(p,v,'important');});
    b.setProperty('background-attachment','fixed','important');h.setProperty('background-attachment','fixed','important');
    D.body.setAttribute('data-zfc-bg',key);
    pick.style.setProperty('background','transparent','important');hoisted=pick;
  }
  setInterval(function(){try{hoist()}catch(e){}},1200);
  var q=0;function go(){if(q)return;q=1;requestAnimationFrame(function(){q=0;try{run();cloneMain();}catch(e){}});}
  var start=function(){go();new MutationObserver(go).observe(D.documentElement,{childList:true,subtree:true});};
  if(D.body)start();else D.addEventListener('DOMContentLoaded',start,{once:true});
})();

/* 임시 진단: 채팅 프레임 안 DOM 구조를 바깥으로 보내 테마 대응용으로 확인 (끝나면 삭제) */
(function(){
  if(location.hostname!=='frame.pingpong.ai'||window.__zprobe3)return;window.__zprobe3=1;
  function chain(el,n){var o=[];for(var i=0;i<n&&el&&el!==document.documentElement;i++){var cs=getComputedStyle(el);o.push(el.tagName+'.'+String(el.className).slice(0,160)+' [sc '+(el.getAttribute('data-sentry-component')||'')+'] bg:'+cs.backgroundColor+' col:'+cs.color+' bd:'+cs.borderTopWidth+' '+cs.borderTopColor);el=el.parentElement}return o}
  function textEl(re){var all=document.querySelectorAll('body *');for(var i=all.length-1;i>=0;i--){var e=all[i];for(var j=0;j<e.childNodes.length;j++){var n=e.childNodes[j];if(n.nodeType===3&&re.test(n.nodeValue))return e}}return null}
  function dump(){
    var sc={};document.querySelectorAll('[data-sentry-component]').forEach(function(e){sc[e.getAttribute('data-sentry-component')]=1});
    var cls={};document.querySelectorAll('[class]').forEach(function(e){String(e.className).split(/\s+/).forEach(function(c){if(/bg-|bubble|narrat|rounded-[lr]|self-(start|end)|text-white/.test(c))cls[c]=1})});
    var em=document.querySelector('.chat em, em');var narr=document.querySelector('[data-sentry-component="NarratorBubble"]');
    var data={sentry:Object.keys(sc),classes:Object.keys(cls).slice(0,150),styles:[].map.call(document.querySelectorAll('style[id]'),function(s){return s.id}),
      body:document.body.className+' | html:'+document.documentElement.className,
      emChain:em?chain(em,9):null,narrChain:narr?chain(narr.querySelector('.chat,p')||narr,8):null,
      userChain:(function(){var u=document.querySelector('[class*=bg-bubble-user],[data-sentry-component=RightTextContent] .chat');return u?chain(u,7):null})(),
      header:(function(){var h=document.querySelector('header');return h?chain(h,3):null})(),
      bgs:(function(){var r=[];document.querySelectorAll('html,body,body *').forEach(function(e){var cs=getComputedStyle(e);if(cs.backgroundImage!=='none'||(cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&e.getBoundingClientRect().width>300)){var b=e.getBoundingClientRect();if(b.width>300&&b.height>300)r.push(e.tagName+'#'+e.id+'.'+String(e.className).slice(0,80)+' [sc '+(e.getAttribute('data-sentry-component')||'')+'] '+Math.round(b.width)+'x'+Math.round(b.height)+' pos:'+cs.position+' bgc:'+cs.backgroundColor+' bgi:'+cs.backgroundImage.slice(0,40))}});return r.slice(0,25)})()};
    try{window.parent.postMessage({__zprobeAuto:JSON.stringify(data)},'*')}catch(e){}
  }
  function outline(){
    var out=[];var budget=60000;
    function walk(el,dep){
      if(out.join('').length>budget)return;
      var a=el.attributes,extra='';
      for(var i=0;i<a.length;i++){var n=a[i].name;if(/^(role|aria-label|data-testid|id|name|type|placeholder|title)$/.test(n)||n.indexOf('data-')===0)extra+=' '+n+'='+String(a[i].value).slice(0,40)}
      var txt='';if(!el.children.length)txt=' «'+(el.textContent||'').trim().slice(0,25)+'»';
      out.push(Array(dep+1).join(' ')+el.tagName.toLowerCase()+(el.className&&typeof el.className==='string'?'.'+el.className.trim().replace(/\s+/g,'.').slice(0,140):'')+extra+txt+'\n');
      var kids=el.children;var n2=kids.length;
      for(var j=0;j<n2;j++){ if(n2>8&&j>=3&&j<n2-3){if(j===3)out.push(Array(dep+2).join(' ')+'… '+(n2-6)+' more\n');continue;} if(/^(SCRIPT|STYLE|SVG|PATH|LINK|META)$/i.test(kids[j].tagName))continue; walk(kids[j],dep+1);}
    }
    walk(document.body,0);return out.join('');
  }
  function dump2(){try{window.parent.postMessage({__zprobeOutline:outline()},'*')}catch(e){}}
  setTimeout(dump,5000);setTimeout(dump,10000);setInterval(dump,15000);
  setTimeout(dump2,7000);setInterval(dump2,20000);
})();
