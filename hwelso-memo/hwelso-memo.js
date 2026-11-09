/* 휄소 메모 — 방마다 적어둔 메모를 그 방 휄소(대화 프로필) 설명 칸 맨 아래에 자동으로 넣어줌 */
(()=>{
'use strict';
if(window.__HWELSO_MEMO__){window.__HWELSO_MEMO__.open();return}

const API='https://api.zeta-ai.io/v1';
const SEP='━━ 메모 ━━';
const LIMIT=1000;
const LS_KEY='hwelso-memo:v1';
const POS_KEY='hwelso-memo:pos';
const AUTO=!!window.__HWELSO_AUTO;

/* ---------- 제타 API ---------- */
/* 로그인 토큰: 제타가 요청 보낼 때 쓰는 걸 그대로 따라 쓰고, 없으면 저장된 것 중 아직 안 끝난 최신 걸 씀 */
let liveAuth='';
try{
  const H=XMLHttpRequest.prototype.setRequestHeader;
  if(!H.__hwelso){
    const wrapped=function(k,v){try{if(/^authorization$/i.test(k)&&/^Bearer\s+\S+/.test(v))liveAuth=v.replace(/^Bearer\s+/,'')}catch(_){}return H.apply(this,arguments)};
    wrapped.__hwelso=1;XMLHttpRequest.prototype.setRequestHeader=wrapped;
  }
}catch(_){}
const jwtExp=t=>{try{return JSON.parse(atob(t.split('.')[1].replace(/-/g,'+').replace(/_/g,'/'))).exp*1000}catch(_){return 0}};
const storedTokens=()=>{
  const out=[];
  for(let i=0;i<localStorage.length;i++){
    const v=localStorage.getItem(localStorage.key(i))||'';
    const m=v.match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g);
    if(m)out.push(...m);
  }
  return out.filter(t=>jwtExp(t)>Date.now()+5000).sort((a,b)=>jwtExp(b)-jwtExp(a));
};
const token=()=>(liveAuth&&jwtExp(liveAuth)>Date.now()+5000)?liveAuth:(storedTokens()[0]||liveAuth||'');
const api=async(path,opt={})=>{
  const go=t=>fetch(API+path,{...opt,headers:{Authorization:'Bearer '+t,Accept:'application/json','Content-Type':'application/json'}});
  let r=await go(token());
  if(r.status===401){for(const t of storedTokens()){r=await go(t);if(r.status!==401)break}}
  if(!r.ok)throw new Error(r.status===401?'로그인 정보를 못 읽었어요. 새로고침 후 다시 해주세요':'HTTP '+r.status);
  const t=await r.text();
  return t?JSON.parse(t):null;
};
const roomId=()=>{const m=location.pathname.match(/\/rooms\/([0-9a-f-]{36})/i);return m?m[1]:null};

/* ---------- 메모 저장(기기별) ---------- */
const loadMap=()=>{try{return JSON.parse(localStorage.getItem(LS_KEY)||'{}')||{}}catch(_){return {}}};
const getMemo=id=>loadMap()[id]||'';
const setMemo=(id,t)=>{const m=loadMap();if(t)m[id]=t;else delete m[id];localStorage.setItem(LS_KEY,JSON.stringify(m))};

/* ---------- 휄소 설명 = 원래 내용 + 구분선 + 메모 ---------- */
const split=desc=>{
  desc=desc||'';
  const i=desc.indexOf(SEP);
  if(i<0)return {base:desc.replace(/\s+$/,''),memo:''};
  return {base:desc.slice(0,i).replace(/\s+$/,''),memo:desc.slice(i+SEP.length).replace(/^\s*\n/,'').trim()};
};
const join=(base,memo)=>memo?(base?base+'\n\n':'')+SEP+'\n'+memo:base;

let ctx=null;
const resolve=async()=>{
  const id=roomId();
  if(!id)throw new Error('대화방 안에서만 쓸 수 있어요');
  const room=await api('/rooms/'+id);
  const plotId=room&&room.plot&&room.plot.id;
  const sel=await api(`/plots/${plotId}/rooms/${id}/user-personas/selected`);
  const list=((await api('/user-chat-profiles'))||{}).userChatProfiles||[];
  const same=list.filter(p=>p.name===sel.name);
  const prof=same.find(p=>(p.description||'')===(sel.description||''))||same[0];
  if(!prof)throw new Error('이 방 휄소를 찾지 못했어요');
  ctx={roomId:id,title:(room.plot&&room.plot.name)||'',profile:prof};
  return ctx;
};
const sync=async memoText=>{
  const c=await resolve();
  const memo=(memoText==null?getMemo(c.roomId):memoText).trim();
  const {base}=split(c.profile.description);
  const next=join(base,memo);
  if(next.length>LIMIT)return {ok:false,over:next.length-LIMIT};
  if(next===(c.profile.description||''))return {ok:true,same:true};
  const r=await api('/user-chat-profiles/'+c.profile.id,{method:'PATCH',body:JSON.stringify({name:c.profile.name,description:next})});
  c.profile.description=(r&&typeof r.description==='string')?r.description:next;
  return {ok:true};
};

/* ---------- 화면 ---------- */
const host=document.createElement('div');
host.id='hwelso-memo-host';
host.style.cssText='position:fixed;z-index:2147483600;right:16px;bottom:150px;';
try{const p=JSON.parse(localStorage.getItem(POS_KEY)||'null');if(p){host.style.right=p.r+'px';host.style.bottom=p.b+'px'}}catch(_){}
const root=host.attachShadow({mode:'open'});
root.innerHTML=`<style>
*{box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans KR",sans-serif}
.fab{width:44px;height:44px;border-radius:50%;border:0;background:#fff;box-shadow:0 2px 10px rgba(0,0,0,.18);font-size:20px;cursor:pointer;display:flex;align-items:center;justify-content:center;touch-action:none}
.panel{position:absolute;right:0;bottom:54px;width:min(340px,calc(100vw - 32px));background:#fff;color:#191919;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.22);padding:14px;display:none}
.panel.on{display:block}
.top{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}
.ttl{font-weight:700;font-size:15px}
.x{border:0;background:none;font-size:20px;line-height:1;cursor:pointer;color:#888;padding:2px 4px}
.sub{font-size:12px;color:#777;margin-bottom:8px;line-height:1.45}
textarea{width:100%;height:150px;resize:vertical;border:1px solid #ddd;border-radius:10px;padding:10px;font-size:14px;line-height:1.5;color:#191919;background:#fafafa;outline:0}
textarea:focus{border-color:#999;background:#fff}
.row{display:flex;align-items:center;justify-content:space-between;margin-top:8px;gap:8px}
.cnt{font-size:12px;color:#777}
.cnt.over{color:#d33;font-weight:700}
.save{border:0;border-radius:10px;background:#191919;color:#fff;font-size:14px;font-weight:600;padding:9px 14px;cursor:pointer}
.save:disabled{opacity:.4;cursor:default}
.msg{font-size:12px;margin-top:8px;min-height:16px;color:#555}
.msg.err{color:#d33}
</style>
<button class="fab" title="휄소 메모">📝</button>
<div class="panel">
  <div class="top"><span class="ttl">휄소 메모</span><button class="x" title="닫기">×</button></div>
  <div class="sub">여기 적은 메모가 이 방 휄소 설명 맨 아래에 들어가요. 저장만 하면 다음 답변부터 반영돼요.<br><b class="who"></b></div>
  <textarea placeholder="예) 지난번에 둘이 바다에 다녀왔다. 카야는 요즘 야간 당직이 많다."></textarea>
  <div class="row"><span class="cnt"></span><button class="save">저장하고 적용</button></div>
  <div class="msg"></div>
</div>`;
const $=s=>root.querySelector(s);
const fab=$('.fab'),panel=$('.panel'),ta=$('textarea'),cnt=$('.cnt'),btn=$('.save'),msg=$('.msg'),who=$('.who');

const say=(t,err)=>{msg.textContent=t;msg.classList.toggle('err',!!err)};
const baseLen=()=>ctx?split(ctx.profile.description).base.length:0;
const count=()=>{
  const memo=ta.value.trim();
  const total=memo?baseLen()+(baseLen()?2:0)+SEP.length+1+memo.length:baseLen();
  const left=LIMIT-total;
  cnt.textContent=left>=0?`남은 글자 ${left}`:`${-left}자 넘었어요`;
  cnt.classList.toggle('over',left<0);
  btn.disabled=left<0;
};
ta.addEventListener('input',count);

const refresh=async()=>{
  const id=roomId();
  if(!id){who.textContent='';ta.value='';ta.disabled=true;btn.disabled=true;say('대화방에 들어가면 쓸 수 있어요');return}
  ta.disabled=false;
  ta.value=getMemo(id);
  try{
    await resolve();
    who.textContent=`적용 휄소: ${ctx.profile.name} (휄소 원래 내용 ${baseLen()}자)`;
    count();say('');
  }catch(e){who.textContent='';say('휄소 정보를 불러오지 못했어요 — '+e.message,true)}
};
const open=()=>{panel.classList.add('on');refresh()};
const close=()=>panel.classList.remove('on');

btn.addEventListener('click',async()=>{
  const id=roomId();if(!id)return;
  btn.disabled=true;say('적용하는 중…');
  setMemo(id,ta.value.trim());
  try{
    const r=await sync(ta.value);
    if(!r.ok){say(`휄소 원래 내용과 합쳐서 ${r.over}자 넘어요. 메모를 줄여주세요.`,true)}
    else{const t=new Date();say(`휄소에 적용했어요 (${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')})`)}
  }catch(e){say('적용하지 못했어요 — '+e.message,true)}
  count();
});
$('.x').addEventListener('click',close);

/* 버튼 클릭 = 열고 닫기, 끌기 = 위치 옮기기 */
let drag=null;
fab.addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,r:parseFloat(host.style.right),b:parseFloat(host.style.bottom),moved:false};fab.setPointerCapture(e.pointerId)});
fab.addEventListener('pointermove',e=>{
  if(!drag)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.moved&&Math.hypot(dx,dy)<6)return;
  drag.moved=true;
  host.style.right=Math.max(4,Math.min(innerWidth-48,drag.r-dx))+'px';
  host.style.bottom=Math.max(4,Math.min(innerHeight-48,drag.b-dy))+'px';
});
fab.addEventListener('pointerup',()=>{
  if(!drag)return;
  if(drag.moved){localStorage.setItem(POS_KEY,JSON.stringify({r:parseFloat(host.style.right),b:parseFloat(host.style.bottom)}))}
  else{panel.classList.contains('on')?close():open()}
  drag=null;
});

const mount=()=>{if(!host.isConnected)(document.body||document.documentElement).appendChild(host)};
mount();

/* 방이 바뀌면 그 방 메모로 휄소를 다시 맞춤 (유저스크립트는 처음부터, 북마클릿은 한 번 누른 뒤부터 새로고침 전까지) */
let lastRoom=null;
const onRoom=async()=>{
  mount();
  const id=roomId();
  host.style.display=id?'':'none';
  if(id===lastRoom)return;
  lastRoom=id;
  if(!id)return;
  try{await sync()}catch(_){}
  if(panel.classList.contains('on'))refresh();
};
setInterval(onRoom,1000);
onRoom();
if(!AUTO)open();

window.__HWELSO_MEMO__={open,close,sync};
})();
