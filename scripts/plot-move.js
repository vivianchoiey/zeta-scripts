// ==UserScript==
// @name         제타 플롯 이사 (복제·내보내기·가져오기)
// @namespace    zeta-local
// @version      1.0.1
// @description  비공개 플롯을 같은 계정에 복제하거나, 연결된 로어북까지 파일 하나로 내보내서 다른 계정에 한 번에 가져오기. 캐릭터·휄소·로어북 번호는 제타가 직접 붙이게 함(2026-10 제타 업데이트 대응).
// @match        https://zeta-ai.io/*
// @match        https://www.zeta-ai.io/*
// @run-at       document-start
// @inject-into  page
// @grant        none
// ==/UserScript==
// 원본: 젯달 "비캐 복제 북마클릿"(zetdal/plotcopy). 개인 사용용 수정본 — 밖으로 공유하지 말 것.

(function () {
  if (window.__ZMOVE__ || window.top !== window || location.hostname === 'frame.pingpong.ai') return;

  var API = "https://api.zeta-ai.io";
  var GAP = 800;
  var UUID_RE = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
  var AUTH = {};
  var CRED = "include";
  var lastCall = 0;
  var busy = false;
  var needList = false;
  var inited = false;
  var statusEl = null, logEl = null, listEl = null, box = null, pill = null;
  var lastExport = null;
  var origFetch = window.fetch.bind(window);
  var SKIPH = ["content-type", "accept", "content-length"];

  // ---------- 로그인 정보: 제타 화면이 보내는 요청에서 그대로 따라 씀 ----------
  function keep(k, v) {
    k = String(k).toLowerCase();
    if (SKIPH.indexOf(k) > -1) return;
    AUTH[k] = String(v);
    if (needList && !busy) { needList = false; setTimeout(function () { refresh(); }, 400); }
  }
  function grab(h) {
    try {
      if (!h) return;
      if (Array.isArray(h)) h.forEach(function (p) { keep(p[0], p[1]); });
      else if (typeof h.forEach === "function") h.forEach(function (v, k) { keep(k, v); });
      else Object.keys(h).forEach(function (k) { keep(k, h[k]); });
    } catch (e) {}
  }
  window.fetch = function (input, init) {
    try {
      var u = typeof input === "string" ? input : (input && (input.url || input.href)) || "";
      if (u.indexOf("api.zeta-ai.io") > -1) {
        if (input && typeof input === "object" && input.headers) grab(input.headers);
        if (init && init.headers) grab(init.headers);
      }
    } catch (e) {}
    return origFetch.apply(this, arguments);
  };
  var XOP = XMLHttpRequest.prototype.open;
  var XSH = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.open = function (m, u) { this.__zmu = String(u); return XOP.apply(this, arguments); };
  XMLHttpRequest.prototype.setRequestHeader = function (k, v) {
    try { if (this.__zmu && this.__zmu.indexOf("api.zeta-ai.io") > -1) keep(k, v); } catch (e) {}
    return XSH.apply(this, arguments);
  };

  // ---------- 공통 도우미 ----------
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function trunc(s, n) { s = s == null ? "" : String(s); return s.length > n ? s.slice(0, n) + "..." : s; }
  function bare(u) { return u ? String(u).split("?")[0] : u; }
  function log(msg) { if (!logEl) return; logEl.textContent += msg + "\n"; logEl.scrollTop = logEl.scrollHeight; }
  function say(msg) { if (statusEl) statusEl.textContent = msg; }
  function poke() {
    try { window.dispatchEvent(new Event("focus")); document.dispatchEvent(new Event("visibilitychange")); window.dispatchEvent(new Event("online")); } catch (e) {}
  }
  function scanTokens() {
    var found = [];
    function add(s) { var m = String(s).match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/g); if (m) m.forEach(function (t) { if (found.indexOf(t) < 0) found.push(t); }); }
    try { for (var i = 0; i < localStorage.length; i++) add(localStorage.getItem(localStorage.key(i))); } catch (e) {}
    try { for (var j = 0; j < sessionStorage.length; j++) add(sessionStorage.getItem(sessionStorage.key(j))); } catch (e2) {}
    try { add(decodeURIComponent(document.cookie)); } catch (e3) {}
    return found;
  }
  async function probeAuth() {
    var toks = scanTokens();
    for (var i = 0; i < toks.length && i < 6; i++) {
      AUTH.authorization = "Bearer " + toks[i];
      try { await api("GET", "/v1/coin/balance"); return true; } catch (e) { delete AUTH.authorization; }
    }
    return false;
  }

  async function api(method, path, body, form) {
    var url = path.indexOf("http") === 0 ? path : API + path;
    var flipped = false;
    for (var attempt = 0; attempt < 7; attempt++) {
      var wait = lastCall + GAP - Date.now();
      if (wait > 0) await sleep(wait);
      lastCall = Date.now();
      var headers = {};
      Object.keys(AUTH).forEach(function (k) { headers[k] = AUTH[k]; });
      var init = { method: method, headers: headers, credentials: CRED };
      if (body !== undefined && body !== null) {
        if (form) init.body = body;
        else { init.body = JSON.stringify(body); headers["content-type"] = "application/json"; }
      }
      var res;
      try { res = await origFetch(url, init); }
      catch (e) {
        if (!flipped) { flipped = true; CRED = CRED === "include" ? "omit" : "include"; continue; }
        throw e;
      }
      if (res.status === 429) { log("요청이 몰려 잠시 대기 중... (" + (attempt + 1) + ")"); await sleep(2500 * (attempt + 1)); continue; }
      var text = await res.text();
      var data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e2) { data = text; }
      if (!res.ok) {
        var err = new Error(method + " " + path + " -> " + res.status + " " + trunc(text, 300));
        err.status = res.status;
        err.body = text;
        throw err;
      }
      return data;
    }
    throw new Error(method + " " + path + " -> 429 반복");
  }

  async function getBlob(url) {
    var res = await origFetch(url);
    if (!res.ok) throw new Error("이미지 " + res.status);
    return await res.blob();
  }
  async function dims(blob) {
    if (window.createImageBitmap) {
      var bmp = await window.createImageBitmap(blob);
      var d = { w: bmp.width, h: bmp.height };
      if (bmp.close) bmp.close();
      return d;
    }
    return await new Promise(function (resolve, reject) {
      var img = new Image(); var u = URL.createObjectURL(blob);
      img.onload = function () { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(u); };
      img.onerror = function () { reject(new Error("이미지 해석 실패")); };
      img.src = u;
    });
  }
  async function upChar(plotId, charId, url) {
    var blob = await getBlob(url); var d = await dims(blob);
    var fd = new FormData();
    fd.append("images", blob, "blob"); fd.append("widths", String(d.w)); fd.append("heights", String(d.h)); fd.append("aspectRatios", String(d.w / d.h));
    var r = await api("POST", "/v2/plots/" + plotId + "/characters/" + charId + "/images", fd, true);
    var it = r && r.results && r.results[0];
    if (!it || it.type !== "Success") throw new Error("캐릭터 이미지 업로드 실패");
    return it.imageUrl;
  }
  async function upProf(plotId, cpId, url) {
    var blob = await getBlob(url); var d = await dims(blob);
    var fd = new FormData();
    fd.append("image", blob, "blob"); fd.append("width", String(d.w)); fd.append("height", String(d.h)); fd.append("aspectRatio", String(d.w / d.h));
    var r = await api("PUT", "/v2/plots/" + plotId + "/chat-profiles/" + cpId + "/images", fd, true);
    if (!r || !r.imageUrl) throw new Error("프로필 이미지 업로드 실패");
    return r.imageUrl;
  }

  function localePrefix() { var seg = location.pathname.split("/")[1]; return "/" + (seg && seg.length === 2 ? seg : "ko"); }
  async function createPlot() {
    var res = await origFetch(localePrefix() + "/plots/create", { credentials: "include", redirect: "follow" });
    var re = new RegExp("plots/(" + UUID_RE + ")/edit");
    var m = re.exec(res.url || "");
    if (m) return m[1];
    var html = await res.text();
    m = re.exec(html);
    return m ? m[1] : null;
  }
  function copyObj(o) { var n = {}; Object.keys(o).forEach(function (k) { n[k] = o[k]; }); return n; }
  // 옛 번호 → 새 번호를 통째로 바꿔치기 (인트로·상황예시·소개 안의 캐릭터 번호까지)
  function swapIds(obj, map) {
    if (obj == null) return obj;
    var s = JSON.stringify(obj);
    Object.keys(map).forEach(function (oldId) { if (oldId && map[oldId] && oldId !== map[oldId]) s = s.split(oldId).join(map[oldId]); });
    return JSON.parse(s);
  }
  function creatorIdOf(x) { return (x && x.creator && (x.creator.id || x.creator.userId)) || null; }

  // ---------- 1단계: 원본 읽어서 꾸러미(파일 내용) 만들기 ----------
  async function collect(srcId) {
    log("원본 읽는 중...");
    var src = await api("GET", "/v1/plots/" + srcId + "/creator");
    var D = src.draft || src;
    if (src.mode && src.mode !== "STORY_CHAT") throw new Error("스토리챗 플롯만 옮길 수 있어요 (" + src.mode + ")");
    var srcChars = D.characters || [];
    if (!srcChars.length) throw new Error("원본에 캐릭터가 없어요");

    var charImages = {};
    for (var i = 0; i < srcChars.length; i++) {
      var sc = srcChars[i];
      try {
        var lr = await api("GET", "/v2/plots/" + srcId + "/characters/" + sc.id + "/images/creator");
        charImages[sc.id] = ((lr && lr.images) || []).map(function (im) { return im.imageUrl; }).filter(Boolean);
      } catch (e) { charImages[sc.id] = []; log(sc.name + " 이미지 목록을 못 읽었어요"); }
    }
    var profImages = {};
    var profs = D.chatProfiles || [];
    for (var k = 0; k < profs.length; k++) {
      try {
        var pr = await api("GET", "/v2/plots/" + srcId + "/chat-profiles/" + profs[k].id + "/images/original");
        if (pr && pr.imageUrl) profImages[profs[k].id] = pr.imageUrl;
      } catch (e3) { if (e3.status !== 404) log("프로필 이미지를 못 읽었어요"); }
    }

    var lorebookIds = D.lorebookIds || (src.lorebooks || []).map(function (l) { return l.id; });
    var lorebooks = [];
    var exporterId = creatorIdOf(src);
    for (var j = 0; j < lorebookIds.length; j++) {
      try {
        log("로어북 읽는 중 (" + (j + 1) + "/" + lorebookIds.length + ")");
        var lb = await api("GET", "/v1/lorebooks/" + lorebookIds[j]);
        if (!exporterId) exporterId = creatorIdOf(lb);
        lorebooks.push({
          id: lb.id || lorebookIds[j],
          title: lb.title || "",
          description: lb.description || "",
          isSharingEnabled: !!lb.isSharingEnabled,
          mine: !exporterId || !creatorIdOf(lb) || creatorIdOf(lb) === exporterId,
          items: (lb.items || []).slice().sort(function (a, b) { return (a.sequence || 0) - (b.sequence || 0); })
            .map(function (it) { return { name: it.name || "", keywords: it.keywords || [], content: it.content || "" }; })
        });
      } catch (e4) { log("로어북 하나를 못 읽었어요: " + trunc(e4.message, 80)); }
    }

    var commentStatus = null;
    try { var cs = await api("GET", "/v1/creator/plots/" + srcId + "/comment-setting"); commentStatus = cs && cs.windowStatus || null; } catch (e5) {}

    var plotImageCount = 0;
    try { var pi = await api("GET", "/v2/plots/" + srcId + "/images/creator"); plotImageCount = (pi && pi.images && pi.images.length) || 0; } catch (e6) {}

    return {
      kind: "zeta-plot-move", v: 1, exportedAt: new Date().toISOString(),
      srcId: srcId, exporterId: exporterId,
      src: { status: src.status, isPrivate: src.isPrivate, mode: src.mode, stylePreset: src.stylePreset, infoBoxSetting: src.infoBoxSetting, cyoaSetting: src.cyoaSetting, plugins: src.plugins, imageUrl: src.imageUrl, initialRoomImageUrl: src.initialRoomImageUrl },
      draft: D, charImages: charImages, profImages: profImages, lorebooks: lorebooks,
      commentStatus: commentStatus, plotImageCount: plotImageCount
    };
  }

  // ---------- 2단계: 꾸러미를 지금 계정에 새 플롯으로 넣기 ----------
  async function lorebookCreate(lb) {
    var body = { title: lb.title, description: lb.description, items: lb.items.map(function (it) { return { name: it.name, keywords: it.keywords, content: it.content }; }), initialPlotIds: [], isSharingEnabled: false };
    var titles = [lb.title, (lb.title + " 복사").slice(0, 20), (lb.title.slice(0, 15) + " " + String(Date.now()).slice(-4))];
    var lastErr = null;
    for (var t = 0; t < titles.length; t++) {
      body.title = titles[t];
      try {
        var r = await api("POST", "/v1/lorebooks", body);
        var id = r && (r.id || (r.lorebook && r.lorebook.id) || r.lorebookId);
        if (id) return { id: id, title: body.title };
        lastErr = new Error("로어북은 만들었는데 번호를 못 받았어요");
        break;
      } catch (e) {
        lastErr = e;
        if (!(e.status === 400 || e.status === 409) || !/title|제목|duplicat|중복|exist/i.test(e.body || "")) break;
      }
    }
    throw lastErr;
  }

  async function putAll(nid, B, st) {
    var D = B.draft, S = B.src;
    var pick = function (k) { return D[k] != null ? D[k] : S[k]; };
    var idMap = st.idMap;
    var intros = (D.intros || []).map(function (it) {
      var conv = swapIds(it.conversation || {}, idMap);
      var msgs = (conv.messages || []).map(function (m) { var n = copyObj(m); n.tempId = Date.now() + "-" + Math.random(); return n; });
      return {
        conversation: { messages: msgs, cyoaChoices: conv.cyoaChoices || null },
        publicConversationMessageCount: it.publicConversationMessageCount,
        playerCharacterSelectionIndex: it.playerCharacterSelectionIndex,
        backgroundAudioUrl: it.backgroundAudioUrl || null,
        backgroundAudioDurationSeconds: it.backgroundAudioDurationSeconds || null
      };
    });
    var aboutSrc = D.about || null;
    var about = {
      characters: aboutSrc && aboutSrc.characters && aboutSrc.characters.length
        ? aboutSrc.characters.map(function (ac) { return { characterId: idMap[ac.characterId] || ac.characterId, name: ac.name, description: ac.description }; })
        : st.chars.map(function (c2) { return { characterId: c2.nid, name: c2.name, description: null }; }),
      contents: aboutSrc && aboutSrc.contents && aboutSrc.contents.length ? aboutSrc.contents : [{ type: "text", content: "" }]
    };
    await api("PUT", "/v1/plots/" + nid, {
      plotId: nid,
      chatProfiles: st.profs.map(function (p2) {
        var o = { name: p2.name, imageUrl: bare(p2.imageUrl), summary: p2.summary, description: p2.description, isUsingDefaultName: p2.isUsingDefaultName };
        if (p2.nid) o.id = p2.nid;
        return o;
      }),
      imageUrl: null,
      shortDescription: pick("shortDescription") || "",
      hashtags: [],
      isAboutPublic: !!pick("isAboutPublic"),
      about: about,
      isCreatorCommentPublic: !!pick("isCreatorCommentPublic"),
      creatorComment: pick("creatorComment") || "",
      isExampleConversationPublic: !!pick("isExampleConversationPublic"),
      lorebookIds: st.lorebookIds,
      stylePreset: D.stylePreset != null ? D.stylePreset : (S.stylePreset || null),
      infoBoxSetting: D.infoBoxSetting != null ? D.infoBoxSetting : (S.infoBoxSetting || null),
      cyoaSetting: D.cyoaSetting != null ? D.cyoaSetting : (S.cyoaSetting || null),
      plugins: D.plugins != null ? D.plugins : (S.plugins || null),
      name: pick("name") || "",
      longDescription: pick("longDescription") || "",
      narrator: pick("narrator") || "",
      characters: st.chars.map(function (c3) { return { id: c3.nid, imageUrl: bare(c3.imageUrl), name: c3.name, description: c3.description }; }),
      intros: intros,
      exampleConversations: swapIds(D.exampleConversation || D.exampleConversations || [], idMap)
    });
  }

  async function uploadProfImages(nid, B, st) {
    for (var k = 0; k < st.profs.length; k++) {
      var p = st.profs[k];
      var purl = B.profImages[p.sid];
      if (!p.nid) continue;
      if (purl) {
        try { log("프로필 이미지 올리는 중"); p.imageUrl = await upProf(nid, p.nid, purl); }
        catch (e4) { log("프로필 이미지 업로드 실패: " + trunc(e4.message, 100) + " (원본을 참조로 연결)"); p.imageUrl = bare(purl); }
      } else if (p.srcImage) { p.imageUrl = bare(p.srcImage); }
    }
  }

  async function importBundle(B, targetId, opt) {
    opt = opt || {};
    if (!B || B.kind !== "zeta-plot-move" || !B.draft) throw new Error("플롯 이사 파일이 아니에요");
    var D = B.draft, S = B.src || {};
    var nid = targetId || null;
    var rel = false;
    if (S.status === "RELEASE") rel = confirm("원본이 등록된 플롯이에요.\n새 플롯도 등록까지 할까요?\n(취소 = 미등록 상태로 두기)");

    if (!nid) {
      log("새 플롯 만드는 중...");
      nid = await createPlot();
      if (!nid) throw new Error("새 플롯을 자동으로 만들지 못했어요. + 버튼으로 빈 플롯을 직접 만들고, 그 편집 화면에서 다시 실행해 주세요.");
    }
    if (nid === B.srcId) throw new Error("원본과 같은 플롯이에요");
    var st = { nid: nid };
    try {
      var tgt = await api("GET", "/v1/plots/" + nid + "/creator");
      var TD = tgt.draft || tgt;
      var tchars = TD.characters || [];
      if (TD.name || TD.longDescription || tchars.length > 1 || (tchars[0] && tchars[0].name)) throw new Error("대상 플롯이 비어 있지 않아서 중단했어요");
      var blank = tchars[0] && tchars[0].id;
      var myId = creatorIdOf(tgt);
      var sameAccount = opt.sameAccount || (!!myId && !!B.exporterId && myId === B.exporterId);

      // 로어북: 같은 계정이면 그대로 연결, 다른 계정이면 새로 만들어서 연결
      st.lorebookIds = [];
      for (var l = 0; l < (B.lorebooks || []).length; l++) {
        var lb = B.lorebooks[l];
        if (sameAccount || !lb.mine && lb.isSharingEnabled) { st.lorebookIds.push(lb.id); continue; }
        log("로어북 만드는 중: " + lb.title);
        try {
          var made = await lorebookCreate(lb);
          st.lorebookIds.push(made.id);
          if (made.title !== lb.title) log("  같은 이름이 있어서 '" + made.title + "'(으)로 만들었어요");
        } catch (e) { log("로어북 '" + lb.title + "' 만들기 실패: " + trunc(e.message, 120)); }
      }

      st.chars = (D.characters || []).map(function (sc, i) {
        return { sid: sc.id, nid: i === 0 && blank ? blank : null, name: sc.name, description: sc.description, imageUrl: null, srcImage: sc.imageUrl };
      });
      st.profs = (D.chatProfiles || []).map(function (sp) {
        return { sid: sp.id, nid: null, name: sp.name, summary: sp.summary, description: sp.description, isUsingDefaultName: !!sp.isUsingDefaultName, imageUrl: null, srcImage: sp.imageUrl };
      });

      log("기본 내용 저장 중...");
      var basic = {
        name: D.name || "", longDescription: D.longDescription || "", narrator: D.narrator || "",
        // 새 캐릭터는 번호 없이 보냄 → 제타가 번호를 붙임
        characters: st.chars.map(function (c) { return c.nid ? { id: c.nid, name: c.name, description: c.description } : { name: c.name, description: c.description }; }),
        chatProfiles: st.profs.map(function (p) { return { isUsingDefaultName: p.isUsingDefaultName }; }),
        lorebookIds: st.lorebookIds
      };
      var profsLater = false;
      try { await api("PATCH", "/v1/plots/" + nid, basic); }
      catch (e) {
        if (!st.profs.length || !/profile/i.test(e.body || e.message)) throw e;
        log("휄소는 뒤에서 따로 넣을게요");
        profsLater = true;
        basic.chatProfiles = [];
        await api("PATCH", "/v1/plots/" + nid, basic);
      }

      // 제타가 붙인 번호 읽어오기
      var t2 = await api("GET", "/v1/plots/" + nid + "/creator");
      var T2 = t2.draft || t2;
      var gotC = T2.characters || [];
      if (gotC.length !== st.chars.length) throw new Error("캐릭터 수가 안 맞아요 (제타 " + gotC.length + "명 / 원본 " + st.chars.length + "명)");
      st.chars.forEach(function (c, i) { c.nid = gotC[i].id; });
      if (!profsLater) {
        var gotP = T2.chatProfiles || [];
        st.profs.forEach(function (p, i) { p.nid = gotP[i] && gotP[i].id || null; });
      }
      st.idMap = {};
      st.chars.forEach(function (c) { st.idMap[c.sid] = c.nid; });
      st.profs.forEach(function (p) { if (p.nid) st.idMap[p.sid] = p.nid; });

      for (var i = 0; i < st.chars.length; i++) {
        var c = st.chars[i];
        var list = B.charImages[c.sid] || [];
        for (var j = 0; j < list.length; j++) {
          try {
            log(c.name + " 이미지 올리는 중 (" + (j + 1) + "/" + list.length + ")");
            var up = await upChar(nid, c.nid, list[j]);
            if (j === 0) c.imageUrl = up;
          } catch (e2) {
            log("이미지 업로드 실패: " + trunc(e2.message, 100) + (j === 0 ? " (원본 이미지를 참조로 연결)" : ""));
            if (j === 0) c.imageUrl = bare(list[j]);
          }
        }
        if (!c.imageUrl && c.srcImage) { c.imageUrl = bare(c.srcImage); log(c.name + " 이미지는 원본을 참조로 연결했어요"); }
      }
      await uploadProfImages(nid, B, st);

      log("비공개 설정 적용 중...");
      await api("PATCH", "/v1/plots/" + nid + "/private", { isPrivate: S.isPrivate === true });

      log("전체 설정 저장 중...");
      await putAll(nid, B, st);
      if (profsLater && st.profs.length) {
        var t3 = await api("GET", "/v1/plots/" + nid + "/creator");
        var gotP3 = (t3.draft || t3).chatProfiles || [];
        st.profs.forEach(function (p, i) { p.nid = gotP3[i] && gotP3[i].id || null; if (p.nid) st.idMap[p.sid] = p.nid; });
        await uploadProfImages(nid, B, st);
        await putAll(nid, B, st);
      }

      if (B.commentStatus) {
        try { await api("PATCH", "/v1/creator/plots/" + nid + "/comment-setting", { status: B.commentStatus }); }
        catch (e5) { log("댓글 설정은 옮기지 못했어요"); }
      }
      if (rel) { log("등록 중..."); await api("PATCH", "/v1/plots/" + nid + "/status", { status: "RELEASE" }); }
      if (B.plotImageCount) log("플롯 이미지 " + B.plotImageCount + "장은 옮기지 않았어요");
      if (S.imageUrl || S.initialRoomImageUrl || D.imageUrl || D.initialRoomImageUrl) log("플롯 커버 이미지는 옮기지 않았어요");
      return nid;
    } catch (e) {
      e.plotId = nid;
      throw e;
    }
  }

  // ---------- 화면 ----------
  function el(tag, css, text) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (text != null) e.textContent = text; return e; }
  function btnCss(bg) { return "display:block;width:100%;text-align:left;margin:0 0 5px;padding:9px 11px;font-size:13px;background:" + bg + ";color:white;border:1px solid rgb(120,95,190);border-radius:8px;"; }
  function smallBtn(label, fn, bg) {
    var b = el("button", "padding:6px 9px;font-size:12px;background:" + (bg || "rgb(60,50,90)") + ";color:white;border:1px solid rgb(155,120,255);border-radius:8px;white-space:nowrap;", label);
    b.onclick = fn; return b;
  }
  function addOpenButton(id) {
    if (!listEl) return;
    var b = el("button", btnCss("rgb(100,70,180)"), "새 플롯 편집 화면 열기");
    b.onclick = function () { location.href = localePrefix() + "/plots/" + id + "/edit"; };
    listEl.insertBefore(b, listEl.firstChild);
  }
  function downloadText(name, text) {
    try {
      var blob = new Blob([text], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = name;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
      return true;
    } catch (e) { return false; }
  }

  async function ensureAuth() {
    try { await api("GET", "/v1/coin/balance"); return true; }
    catch (e) {
      if (e.status !== 401 && e.status !== 403) return true;
      poke(); await sleep(1200);
      try { await api("GET", "/v1/coin/balance"); return true; } catch (e2) {}
      return await probeAuth();
    }
  }
  async function withBusy(label, fn) {
    if (busy) { log("이미 진행 중이에요."); return; }
    busy = true; logEl.textContent = ""; say(label + " 화면을 닫지 마세요");
    try {
      if (!(await ensureAuth())) throw new Error("로그인 정보를 못 찾았어요. 화면의 탭(전체/스토리챗)을 한 번 누르고 다시 해 주세요");
      await fn();
    }
    catch (e) {
      log("실패: " + e.message);
      say("실패했어요. 아래 로그를 확인하세요");
      if (e.plotId) { log("만들다 만 플롯이 있어요: " + e.plotId + " (크리에이터 센터에서 지워 주세요)"); addOpenButton(e.plotId); }
    }
    busy = false;
  }

  function currentEditId() { var m = new RegExp("plots/(" + UUID_RE + ")/edit").exec(location.pathname); return m ? m[1] : null; }
  function pickTarget(srcId) {
    var cur = currentEditId();
    if (cur && cur !== srcId && confirm("지금 열려 있는 빈 플롯에 넣을까요?\n확인 = 지금 플롯에 넣기\n취소 = 새 플롯 만들기")) return cur;
    return null;
  }

  function doClone(it) {
    if (!confirm("'" + it.name + "' 을(를) 이 계정에 복제할까요?")) return;
    var target = pickTarget(it.id);
    withBusy("복제 중...", async function () {
      var B = await collect(it.id);
      var nid = await importBundle(B, target, { sameAccount: true });
      log("완료!"); say("복제 완료! 새로고침하면 목록에 나와요"); addOpenButton(nid);
    });
  }
  function doExport(it) {
    withBusy("내보내는 중...", async function () {
      var B = await collect(it.id);
      var text = JSON.stringify(B);
      // 파일 이름은 영문·숫자만 (한글 이름은 일부 브라우저에서 'download'로 바뀜) — 플롯 이름은 파일 안에 들어 있음
      var asciiName = String(D_name(B)).replace(/[^A-Za-z0-9_-]+/g, "").slice(0, 20) || String(it.id).slice(0, 8);
      var now = new Date(), pad = function (n) { return String(n).padStart(2, "0"); };
      lastExport = { name: "zeta-plot_" + asciiName + "_" + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + "-" + pad(now.getHours()) + pad(now.getMinutes()) + ".json", text: text };
      var ok = downloadText(lastExport.name, text);
      log("캐릭터 " + (B.draft.characters || []).length + "명, 휄소 " + (B.draft.chatProfiles || []).length + "개, 로어북 " + B.lorebooks.length + "개 담았어요");
      log(ok ? "파일 저장: " + lastExport.name : "파일 저장이 안 되면 '복사'를 눌러 메모장에 붙여 두세요");
      say("내보내기 완료! 다른 계정에서 '가져오기'로 넣으세요");
      renderCopyButton();
    });
  }
  function D_name(B) { return (B.draft && B.draft.name) || "플롯"; }
  function renderCopyButton() {
    if (!lastExport || !listEl) return;
    var b = el("button", btnCss("rgb(60,110,90)"), "방금 내보낸 내용 복사하기 (파일 저장이 안 될 때)");
    b.onclick = async function () {
      try { await navigator.clipboard.writeText(lastExport.text); say("복사했어요. 메모장 등에 붙여 두세요"); }
      catch (e) { openPaste(lastExport.text, true); }
    };
    listEl.insertBefore(b, listEl.firstChild);
  }

  function runImport(text) {
    var B;
    try { B = JSON.parse(text); } catch (e) { say("파일 내용을 읽지 못했어요"); return; }
    if (!B || B.kind !== "zeta-plot-move") { say("플롯 이사 파일이 아니에요"); return; }
    var lbn = (B.lorebooks || []).length;
    if (!confirm("'" + D_name(B) + "' 을(를) 지금 계정에 가져올까요?\n캐릭터 " + (B.draft.characters || []).length + "명 · 휄소 " + (B.draft.chatProfiles || []).length + "개 · 로어북 " + lbn + "개")) return;
    var target = pickTarget(B.srcId);
    withBusy("가져오는 중...", async function () {
      var nid = await importBundle(B, target, {});
      log("완료!"); say("가져오기 완료! 새로고침하면 목록에 나와요"); addOpenButton(nid);
    });
  }
  function pickFile() {
    var inp = document.createElement("input");
    inp.type = "file"; inp.accept = ".json,.txt,application/json,text/plain";
    inp.style.cssText = "position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;";
    document.body.appendChild(inp);
    inp.onchange = function () {
      var f = inp.files && inp.files[0];
      inp.remove();
      if (!f) return;
      var rd = new FileReader();
      rd.onload = function () { runImport(String(rd.result || "")); };
      rd.readAsText(f);
    };
    inp.click();
  }
  function openPaste(prefill, readOnly) {
    var ov = el("div", "position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:16px;");
    var card = el("div", "background:rgb(24,20,38);color:white;border:2px solid rgb(155,120,255);border-radius:12px;padding:12px;width:min(520px,100%);display:flex;flex-direction:column;gap:8px;font:13px -apple-system,sans-serif;");
    card.appendChild(el("b", "", readOnly ? "아래 글을 전부 복사해서 메모장에 붙여 두세요" : "내보낸 내용을 붙여넣으세요"));
    var ta = el("textarea", "width:100%;height:40vh;box-sizing:border-box;background:rgb(10,8,18);color:white;border:1px solid rgb(120,95,190);border-radius:8px;padding:8px;font:11px monospace;");
    ta.value = prefill || "";
    var row = el("div", "display:flex;gap:6px;justify-content:flex-end;");
    row.appendChild(smallBtn("닫기", function () { ov.remove(); }));
    if (!readOnly) row.appendChild(smallBtn("가져오기", function () { var v = ta.value; ov.remove(); runImport(v); }, "rgb(100,70,180)"));
    card.appendChild(ta); card.appendChild(row); ov.appendChild(card); document.body.appendChild(ov);
    if (readOnly) { ta.focus(); ta.select(); }
  }

  async function loadList() {
    var seen = {}; var out = [];
    var combos = [["true", "RELEASE"], ["false", "RELEASE"], ["true", "PRERELEASE"], ["false", "PRERELEASE"]];
    for (var i = 0; i < combos.length; i++) {
      var cursor = null;
      for (var pg = 0; pg < 8; pg++) {
        var q = "/v1/plots/creator?limit=15&isPrivate=" + combos[i][0] + "&orderBy.property=UPDATED_AT&orderBy.direction=DESC&status=" + combos[i][1] + "&modes=STORY_CHAT" + (cursor ? "&cursor=" + encodeURIComponent(cursor) : "");
        var r = null;
        try { r = await api("GET", q); }
        catch (e) { if (e.status === 401 || e.status === 403) return { items: out, authFail: true }; break; }
        var arr = (r && r.plots) || []; var added = 0;
        arr.forEach(function (p) {
          var id = p.id || p.plotId;
          if (id && !seen[id]) { seen[id] = 1; out.push({ id: id, name: p.name || (p.draft && p.draft.name) || "(제목 없음)", st: combos[i][1], pv: combos[i][0] }); added++; }
        });
        if (!r || !r.nextCursor || !added) break;
        cursor = r.nextCursor;
      }
    }
    return { items: out, authFail: false };
  }
  function renderList(items) {
    listEl.textContent = "";
    items.forEach(function (it) {
      var tag = (it.pv === "true" ? "비공개" : "공개") + " · " + (it.st === "RELEASE" ? "등록" : "미등록");
      var row = el("div", "display:flex;gap:6px;align-items:center;margin:0 0 5px;padding:7px 9px;background:rgb(50,42,80);border:1px solid rgb(120,95,190);border-radius:8px;");
      row.appendChild(el("div", "flex:1;min-width:0;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;", it.name + "  (" + tag + ")"));
      row.appendChild(smallBtn("복제", function () { doClone(it); }));
      row.appendChild(smallBtn("내보내기", function () { doExport(it); }));
      listEl.appendChild(row);
    });
  }
  async function refresh() {
    if (busy) return;
    say("목록 불러오는 중...");
    var r = await loadList();
    if (r.authFail && !r.items.length) { poke(); await sleep(1500); r = await loadList(); }
    if (r.authFail && !r.items.length) { if (await probeAuth()) r = await loadList(); }
    renderList(r.items);
    if (r.items.length) say("복제: 이 계정에 바로 복사 · 내보내기: 다른 계정용 파일 저장 · 가져오기: 파일 넣기");
    else if (r.authFail) { needList = true; say("화면의 탭(전체/스토리챗)을 한 번 눌러 주세요"); }
    else say("불러올 플롯이 없어요. '가져오기'는 그대로 쓸 수 있어요");
  }

  function setOpen(v) {
    if (v && !inited) { inited = true; refresh(); }
    box.style.display = v ? "flex" : "none";
    pill.style.display = v ? "none" : (wantPill() ? "block" : "none");
  }
  function wantPill() { return /\/(creator-center|plots\/[^/]+\/edit|plots\/create)/.test(location.pathname); }

  function buildUI() {
    box = el("div", "position:fixed;left:0;right:0;bottom:0;height:42vh;z-index:2147483646;background:rgb(24,20,38);color:rgb(240,235,255);font:13px/1.4 -apple-system,sans-serif;display:none;flex-direction:column;border-top:3px solid rgb(155,120,255);");
    var head = el("div", "display:flex;gap:6px;padding:6px 8px;flex:none;align-items:center;flex-wrap:wrap;");
    head.appendChild(el("b", "flex:1;font-size:14px;", "플롯 이사"));
    head.appendChild(smallBtn("새로고침", function () { refresh(); }));
    head.appendChild(smallBtn("가져오기", function () { if (busy) return; pickFile(); }, "rgb(100,70,180)"));
    head.appendChild(smallBtn("붙여넣기", function () { if (busy) return; openPaste("", false); }));
    head.appendChild(smallBtn("접기", function () { setOpen(false); }));
    statusEl = el("div", "padding:0 10px 5px;font-size:12px;color:rgb(200,190,235);flex:none;");
    listEl = el("div", "flex:1;overflow:auto;padding:0 8px;-webkit-overflow-scrolling:touch;");
    logEl = el("div", "height:64px;overflow:auto;padding:4px 10px;background:rgb(10,8,18);font:11px/1.35 monospace;white-space:pre-wrap;word-break:break-all;flex:none;");
    box.appendChild(head); box.appendChild(statusEl); box.appendChild(listEl); box.appendChild(logEl);
    pill = el("button", "position:fixed;right:10px;bottom:96px;z-index:2147483646;padding:8px 12px;font-size:13px;background:rgb(100,70,180);color:white;border:1px solid rgb(200,180,255);border-radius:18px;display:none;", "플롯 이사");
    pill.onclick = function () { setOpen(true); };
    document.body.appendChild(box); document.body.appendChild(pill);
    setInterval(function () { if (box.style.display === "none") pill.style.display = wantPill() ? "block" : "none"; }, 1000);
  }

  function boot() { if (!document.body) return setTimeout(boot, 200); buildUI(); }
  boot();
  window.__ZMOVE__ = { open: function () { setOpen(true); }, collect: collect, importBundle: importBundle, ensureAuth: ensureAuth, version: "1.0.1" };
})();
