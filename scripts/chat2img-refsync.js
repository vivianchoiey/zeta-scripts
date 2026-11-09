// ==UserScript==
// @name         Chat2Img 참조사진·설정 방별 동기화
// @namespace    zeta-local
// @version      1.2.1
// @description  Chat2Img-Codex 참조사진(캐릭터·유저·스타일)과 생성 설정을 방마다 Supabase에 저장해 폰·윈도우·맥 어디서든 자동으로 채움 + 아이폰 사진 넣기 오류 보정
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @run-at       document-idle
// @inject-into  page
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  // ===== 설정: Supabase 프로젝트 정보 (Project Settings → API) =====
  const SUPABASE_URL = 'https://jipedgzecalohcojanvr.supabase.co';   // 예: https://abcdefgh.supabase.co
  const SUPABASE_KEY = 'sb_publishable_qbBFHHcybnNPVKMNTWU_eA_XuY5-ZDx';   // anon public key
  const BUCKET = 'c2d';
  const MAX_SIDE = 1600;     // 올릴 때 긴 변 최대 픽셀 (아이폰 사진 용량 줄이기)
  // ================================================================

(() => {
    if (window.__C2I_REFSYNC__) return;
    const SB_URL = SUPABASE_URL.replace(/\/+$/, '');
    const SB_KEY = SUPABASE_KEY;


    const SLOTS = ['char', 'persona', 'style'];
    const cloudOn = !!(SB_URL && SB_KEY);
    const log = (...a) => console.log('[C2I 참조사진 동기화]', ...a);
    const toast = (msg, bad) => {
      try {
        let t = document.getElementById('c2i-refsync-toast');
        if (!t) { t = document.createElement('div'); t.id = 'c2i-refsync-toast'; document.body.appendChild(t); }
        t.textContent = '참조사진 동기화: ' + msg;
        t.style.cssText = 'position:fixed;left:50%;bottom:90px;transform:translateX(-50%);z-index:2147483647;padding:8px 14px;border-radius:12px;font:600 13px/1.4 -apple-system,sans-serif;box-shadow:0 4px 14px #0003;max-width:90vw;' + (bad ? 'background:#ffe5e5;color:#9b1c1c;' : 'background:#eef6ee;color:#1d5c2e;');
        clearTimeout(t._h); t._h = setTimeout(() => t.remove(), bad ? 8000 : 3000);
      } catch (e) {}
    };
    const headers = (extra = {}) => (/^sb_/.test(SB_KEY) ? { apikey: SB_KEY, ...extra } : { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY, ...extra });

    const roomId = () => (location.pathname.match(/\/rooms\/([0-9a-f-]{20,})/i) || [])[1] || null;
    const objPath = (room, slot) => room + '/' + slot + '.jpg';
    const panel = () => document.getElementById('chat2img-codex-root')?.shadowRoot || null;

    // 사진 줄이기 (JPEG, 긴 변 MAX_SIDE)
    const shrink = (file) => new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
        if (s === 1 && file.type === 'image/jpeg' && file.size < 1.5e6) { URL.revokeObjectURL(url); return resolve(file); }
        const c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * s); c.height = Math.round(img.naturalHeight * s);
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(b => resolve(b ? new File([b], (file.name || 'ref').replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' }) : file), 'image/jpeg', 0.9);
      };
      img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });

    const upload = async (room, slot, file) => {
      if (!cloudOn || !room) return;
      try {
        const r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + objPath(room, slot), {
          method: 'POST', headers: headers({ 'x-upsert': 'true', 'Content-Type': 'image/jpeg', 'cache-control': 'no-cache' }), body: file
        });
        if (r.ok) { log('업로드 완료', slot); toast('저장 완료 (' + slot + ')'); } else { const tx = await r.text().catch(() => ''); log('업로드 실패', r.status, tx); toast('저장 실패 ' + r.status + ' ' + tx.slice(0, 80), true); }
      } catch (e) { log('업로드 오류', e); toast('저장 실패: 연결 차단됨 (' + (e && e.message || e) + ')', true); }
    };
    const remove = async (room, slot) => {
      if (!cloudOn || !room) return;
      try {
        await fetch(SB_URL + '/storage/v1/object/' + BUCKET, { method: 'DELETE', headers: headers({ 'Content-Type': 'application/json' }), body: JSON.stringify({ prefixes: [objPath(room, slot)] }) });
        log('삭제', slot);
      } catch (e) { log('삭제 오류', e); }
    };
    const download = async (room, slot) => {
      if (!cloudOn || !room) return null;
      try {
        const r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + objPath(room, slot) + '?t=' + Date.now(), { headers: headers(), cache: 'no-store' });
        if (!r.ok) return null;
        const b = await r.blob();
        return new File([b], slot + '.jpg', { type: 'image/jpeg' });
      } catch (e) { return null; }
    };

    // ---- 방별 생성 설정 ----
    const SET_IDS = ['soloTarget', 'genre', 'stylePreset', 'sizeHint', 'qualityHint', 'extraPrompt'];
    const setPath = (room) => room + '/settings.json';
    let applying = false, saveTimer = 0;
    const readSettings = (root) => {
      const o = { mode: root.getElementById('modeSolo')?.checked ? 'solo' : 'scene' };
      SET_IDS.forEach(id => { const el = root.getElementById(id); if (el) o[id] = el.value; });
      return o;
    };
    const saveSettings = async () => {
      const room = roomId(), root = panel();
      if (!cloudOn || !room || !root || applying) return;
      try {
        const r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + setPath(room), {
          method: 'POST', headers: headers({ 'x-upsert': 'true', 'Content-Type': 'application/json', 'cache-control': 'no-cache' }),
          body: JSON.stringify(readSettings(root))
        });
        if (r.ok) { log('설정 저장'); toast('설정 저장 완료'); } else { const tx = await r.text().catch(() => ''); toast('설정 저장 실패 ' + r.status + ' ' + tx.slice(0, 80), true); }
      } catch (e) { toast('설정 저장 실패: 연결 차단됨', true); }
    };
    const queueSave = () => { if (applying) return; clearTimeout(saveTimer); saveTimer = setTimeout(saveSettings, 1500); };
    const loadSettings = async (room) => {
      if (!cloudOn || !room) return false;
      try {
        const r = await fetch(SB_URL + '/storage/v1/object/' + BUCKET + '/' + setPath(room) + '?t=' + Date.now(), { headers: headers(), cache: 'no-store' });
        const root = panel(); if (!root) return false;
        if (!r.ok) {
          // 이 방에 저장된 설정이 아직 없으면, 지금 기기의 설정을 처음 한 번 올려 둔다 (추가 지시 글이 있을 때만)
          if (r.status === 400 || r.status === 404) {
            const cur = readSettings(root);
            if ((cur.extraPrompt || '').trim()) { await saveSettings(); }
          }
          return false;
        }
        const o = await r.json();
        applying = true;
        const radio = root.getElementById(o.mode === 'solo' ? 'modeSolo' : 'modeScene');
        if (radio && !radio.checked) radio.click();
        SET_IDS.forEach(id => {
          const el = root.getElementById(id);
          if (!el || o[id] == null || el.value === o[id]) return;
          if (o[id] === '' && (el.value || '').trim()) return;   // 비어 있는 값으로 내 글을 덮어쓰지 않음
          el.value = o[id];
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        });
        setTimeout(() => { applying = false; }, 300);
        log('설정 불러옴', room); toast('설정 불러옴');
        return true;
      } catch (e) { applying = false; return false; }
    };

    // ---- 파일 선택창 가로채기 ----
    // Chat2Img는 파일 입력칸을 화면에 붙이지 않고 눌러서, 아이폰에서 선택이 자주 씹힘 → 화면에 붙여서 유지
    let pending = null;       // 클라우드에서 받아 자동으로 넣을 파일
    let pickSlot = null;      // 사용자가 누른 슬롯
    const keep = new Set();
    const origClick = HTMLInputElement.prototype.click;
    HTMLInputElement.prototype.click = function () {
      if (this.type !== 'file' || this.isConnected) return origClick.apply(this, arguments);
      const input = this;
      const handler = input.onchange;
      if (pending) {                       // 자동 채우기: 선택창 없이 바로 넣기
        const { file } = pending; pending = null;
        try { const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files; } catch (e) { return; }
        handler && handler.call(input, new Event('change'));
        return;
      }
      const slot = pickSlot; pickSlot = null;
      input.style.cssText = 'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;';
      document.body.appendChild(input); keep.add(input);
      input.onchange = async (ev) => {
        const f = input.files?.[0];
        if (f) {
          const small = await shrink(f);
          try { const dt = new DataTransfer(); dt.items.add(small); input.files = dt.files; } catch (e) {}
          if (slot) upload(roomId(), slot, small);
        }
        try { handler && await handler.call(input, ev); } finally { input.remove(); keep.delete(input); }
      };
      return origClick.apply(this, arguments);
    };

    // 패널 버튼 감시 (사진 넣기 / 지우기)
    const hooked = new WeakSet();
    const hookPanel = () => {
      const root = panel();
      if (!root || hooked.has(root)) return;
      hooked.add(root);
      root.addEventListener('click', (e) => {
        const pick = e.target.closest?.('[data-pick]');
        if (pick && !pending) pickSlot = pick.getAttribute('data-pick');
        const clr = e.target.closest?.('[data-clear]');
        if (clr && e.isTrusted) remove(roomId(), clr.getAttribute('data-clear'));
      }, true);
      const onSet = (e) => {
        if (!e.isTrusted) return;
        const id = e.target && e.target.id;
        if (SET_IDS.includes(id) || id === 'modeSolo' || id === 'modeScene') queueSave();
      };
      root.addEventListener('input', onSet, true);
      root.addEventListener('change', onSet, true);
    };

    // 방이 바뀌면 그 방 사진을 받아서 채우기
    let lastRoom = null, busy = false;
    const fillRoom = async () => {
      const room = roomId(); const root = panel();
      if (!room || !root || busy || room === lastRoom) return;
      busy = true; lastRoom = room;
      await new Promise(r => setTimeout(r, 2000));   // Chat2Img의 프사 자동 감지가 끝난 뒤에 채움
      if (roomId() === room) await loadSettings(room);
      for (const slot of SLOTS) {
        if (roomId() !== room) break;
        const file = await download(room, slot);
        const btn = panel()?.querySelector('[data-pick="' + slot + '"]');
        if (!file || !btn) continue;
        pending = { file };
        btn.click();
        pending = null;
        await new Promise(r => setTimeout(r, 300));
        log('채움', room, slot); toast('불러옴 (' + slot + ')');
      }
      busy = false;
    };

    const tick = () => { hookPanel(); fillRoom(); };
    setInterval(tick, 1500);
    tick();
    window.__C2I_REFSYNC__ = { version: '1.2.1', cloud: cloudOn, refill: () => { lastRoom = null; tick(); } };
    log(cloudOn ? '켜짐 (클라우드 동기화)' : '켜짐 (Supabase 설정 없음: 아이폰 보정만 작동)'); setTimeout(() => toast(cloudOn ? '켜짐' : '켜짐 (클라우드 설정 없음)'), 1500);
  })();
})();