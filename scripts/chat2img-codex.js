// ==UserScript==
// @name         Chat2Img-Codex 자동 실행
// @namespace    zeta-local
// @version      1.20.0
// @description  Chat2Img-Codex 자동 로드 + 기존 의상 조합 및 1980년 일본 다이스케·비비안 전용 조합
// @match        https://zeta-ai.io/*
// @match        https://*.zeta-ai.io/*
// @noframes
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(()=>{'use strict';
// 서버 주소 설정
const MAC_URL='http://127.0.0.1:5198';                              // 맥북·윈도우에서 쓸 주소
const MOBILE_URL='https://node.tail6a1536.ts.net/chat2img-codex';   // 아이폰·아이패드에서 쓸 주소

// ===== 여주 의상 랜덤 조합 재료 (자유롭게 추가·삭제) =====
// 색은 뉴트럴 + 데님 + 포인트 몇 개. 파스텔 없음
const COLORS=['화이트','아이보리','크림','베이지','카멜','브라운','그레이','차콜','블랙','네이비','버건디','올리브','코발트 블루','버터 옐로'];
const STYLES={
  // 크리스탈 — 데님 베이스, 톰보이 섞인 프렌치
  데님시크:{
    top:['화이트 티셔츠','블랙 롱슬리브','스트라이프 보더 티','오버핏 화이트 셔츠','블랙 탱크탑','얇은 크루넥 니트','블랙 니트 베스트와 화이트 셔츠 레이어드','네이비 티셔츠','오버핏 옥스포드 셔츠','핀스트라이프 셔츠','그레이 멜란지 스웨트셔츠','슬리브리스 니트 탑','크롭 폴로 니트','보트넥 롱슬리브','헨리넥 니트','화이트 셔츠와 그레이 크루넥 니트 레이어드'],
    bottom:['브라운 와이드 팬츠','블랙 슬랙스','네이비 슬랙스','브라운 코듀로이 팬츠','진청 배럴 데님','그레이 와이드 슬랙스','카키 카고 팬츠'],
    outer:['베이지 트렌치코트','블랙 가죽 재킷','블랙 크롭 가디건','없음','없음','없음','스웨이드 재킷','오버핏 블레이저','숏 트렌치코트','울 하프코트','코튼 초어 재킷','크롭 트위드 재킷'],
    shoes:['로퍼','화이트 스니커즈','스웨이드 앵클 부츠','가젤 스니커즈','블랙 부츠','메리제인','블랙 뮬','발레 플랫','뉴발란스 스니커즈'],
    acc:['블랙 숄더백','작은 크로스백','선글라스','없음','없음','얇은 블랙 벨트','실버 후프 귀걸이','집게 핀'],
  },
  // 김나영 — 와이드 데님 + 크롭 상의, 색 포인트
  꾸안꾸:{
    top:['블랙 크롭 가디건','블랙 슬림 니트','밴드 티셔츠','스웨트셔츠','오버핏 화이트 셔츠와 블랙 탱크 레이어드','페어아일 니트 베스트와 셔츠 레이어드','블루 오버셔츠와 스트라이프 티 레이어드','하늘색 롱슬리브','하프집업 니트','스트라이프 버튼다운 셔츠','크롭 스웨트셔츠','보트넥 니트','그래픽 티셔츠','오프숄더 니트','셔츠 위에 니트를 어깨에 두름','크롭 카디건 단추 잠금','립 슬리브리스 탑'],
    bottom:['블랙 와이드 슬랙스','브라운 코듀로이 팬츠','옐로 미니 스커트','화이트 미니 원피스','핑크 새틴 미디 스커트','진청 배럴 데님','깨끗한 원톤 중청 스트레이트 데님','카고 팬츠','블랙 미니 스커트','그레이 와이드 슬랙스','블랙 슬림 슬랙스'],
    outer:['블랙 가죽 재킷','블랙 크롭 재킷','블루 오버셔츠','없음','없음','없음','오버핏 블레이저','숏 트렌치코트','스웨이드 재킷','플리스 집업','울 하프코트'],
    shoes:['가젤 스니커즈','로퍼','부츠','화이트 스니커즈','메리제인','뉴발란스 스니커즈','발레 플랫','블랙 뮬'],
    acc:['버건디 숄더백','토트백','선글라스','없음','없음','작은 크로스백','얇은 벨트'],
  },
  // 미우미우 — 프레피 레이어드, 미니 + 삭스
  미우미우:{
    top:['폴로 셔츠','스트라이프 폴로','니트 베스트와 셔츠 레이어드','니트 티와 셔츠 레이어드','크롭 가디건','버건디 폴로','오버핏 셔츠에 얇은 벨트','크롭 니트','케이블 크롭 가디건','셔츠에 넥타이','스트라이프 셔츠와 니트 베스트 레이어드','크롭 블라우스','폴로 니트','럭비 셔츠','칼라 셔츠 위에 V넥 니트','크롭 케이블 가디건 단추 잠금에 셔츠 칼라','스트라이프 셔츠 소매 걷음','니트 폴로 셋업 상의','크롭 트랙 집업','실크 블라우스 단추 하나 풀림','슬림 크루넥 니트에 셔츠 칼라 레이어드','반팔 니트 폴로'],
    bottom:['블랙 플리츠 미니 스커트','화이트 플리츠 미니 스커트','스웨이드 미니 스커트','블랙 미니 스커트','로우라이즈 벨트 미니 스커트','브라운 스웨이드 롱스커트','그레이 플리츠 미니 스커트','체크 미니 스커트','네이비 플리츠 미니 스커트','슬림 펜슬 미니 스커트','새틴 슬립 미니 스커트','울 플리츠 미니 스커트','니트 폴로 셋업 미니 스커트','버건디 미니 스커트'],
    outer:['블랙 크롭 재킷','레더 재킷','숏 블레이저','없음','없음','없음','숏 트렌치코트','크롭 카디건','레더 트렌치','크롭 레더 재킷','울 하프코트','스포티 아노락','오버핏 카디건 어깨에 걸침','크롭 피코트'],
    shoes:['로퍼와 흰 삭스','메리제인과 삭스','브라운 롱부츠','발레 플랫과 니삭스','로퍼와 니삭스','메리제인 힐','앵클 부츠','스니커즈와 흰 삭스','발레 플랫 스니커즈','스웨이드 로퍼와 니삭스','키튼힐 메리제인과 흰 삭스','스트랩 발레 플랫','브라운 니하이 부츠'],
    acc:['작은 가죽 숄더백','선글라스','가는 벨트','없음','없음','집게 핀','니트 레그워머','얇은 프레임 안경','작은 진주 귀걸이','골반에 걸친 얇은 벨트','투명 스타킹','작은 레더 토트백'],
  },
};
// 이미 색이 정해진 아이템엔 색을 안 붙임
function hasOwnColor(item){return /화이트|블랙|네이비|데님|청|트렌치|스트라이프|블루|버건디|브라운|옐로|핑크|하늘색|베이지|페어아일|스웨이드|코듀로이|가젤|밴드|삭스|그레이|체크|카키|그래픽|뉴발란스|실버/.test(item);}
// 뽑힌 옷 뒤에 항상 붙는 문장
const OUTFIT_RULE='. 크리스탈·김나영·미우미우 룩처럼 세련되고 트렌디하게. 심플한 기본템을 핏과 비율, 레이어드로 잘 입어 보이게. 상의는 크롭이나 오버핏, 하의는 와이드 데님 아니면 미니로 길이 대비를 준다. 핏은 깔끔하게. 프릴, 리본, 레이스, 큰 로고, 알록달록한 색, 미디 길이 펑퍼짐한 치마, 터틀넥, 아줌마 같은 조합은 금지. 22세에 맞게 젊게.';

// ===== 권승재 수트 랜덤 (고정 프롬프트에 '권승재'가 있을 때만 작동) =====
// 어두운 고급 수트만. 베이지·브라운·회색빛 밝은 수트 없음
const SUIT_STYLES={
  '톰포드식':{color:['블랙','차콜','미드나잇 네이비'],fabric:['매끈한 울','새틴 라펠 울','은은한 광택 울'],cut:['와이드 피크 라펠 싱글 재킷','피크 라펠 더블 브레스티드 재킷','피크 라펠 쓰리피스(조끼 포함)'],shirt:['화이트 셔츠','블랙 셔츠','화이트 윙칼라 셔츠'],tie:['블랙 새틴 타이','없음(단추 하나 풀림)','블랙 니트 타이'],shoes:['블랙 옥스퍼드','블랙 첼시 부츠'],acc:['실버 커프스','슬림 실버 시계','없음']},
  '생로랑식':{color:['블랙','차콜'],fabric:['매트 울','얇은 울'],cut:['슬림핏 노치 라펠 싱글 재킷','슬림 숄칼라 턱시도 재킷','슬림핏 더블 브레스티드 재킷'],shirt:['블랙 셔츠','화이트 셔츠 단추 두 개 풀림','블랙 실크 셔츠'],tie:['없음','블랙 스키니 타이','없음'],shoes:['블랙 첼시 부츠','블랙 로퍼','블랙 옥스퍼드'],acc:['없음','실버 반지','없음']},
  '브리오니식':{color:['네이비','차콜','다크 그레이'],fabric:['핀스트라이프 울','초크 스트라이프 플란넬','헤링본 울','솔리드 울'],cut:['클래식 노치 라펠 싱글 재킷','더블 브레스티드 재킷','쓰리피스(조끼 포함)'],shirt:['화이트 셔츠','연한 블루 셔츠','화이트 더블커프 셔츠'],tie:['네이비 타이','버건디 타이','다크 그린 타이','블랙 타이','없음'],shoes:['블랙 옥스퍼드','다크 브라운 옥스퍼드','블랙 더비'],acc:['실버 타이바','실버 커프스','슬림 시계','없음']},
  '프라다식':{color:['블랙','차콜','네이비'],fabric:['매트 울','테크 울','울 개버딘'],cut:['미니멀 노치 라펠 싱글 재킷','칼라리스 미니멀 재킷','슬림 쓰리버튼 재킷'],shirt:['화이트 셔츠','블랙 크루넥 니트','연회색 셔츠'],tie:['없음','블랙 슬림 타이','없음'],shoes:['블랙 더비','블랙 로퍼','블랙 첼시 부츠'],acc:['없음','슬림 블랙 시계','없음']},
};
const SUIT_RULE='. 고급 테일러드 수트로 몸에 딱 맞게. 베이지·브라운·밝은 회색·광택 번쩍이는 원단·헐렁한 핏·촌스러운 조합은 금지. 38세 재벌에 맞게 세련되고 비싸 보이게.';
function hasColor(item){return /블랙|화이트|네이비|블루|버건디|그린|그레이|회색|브라운|실버/.test(item);}
function makeSuit(){
  const name=rnd(Object.keys(SUIT_STYLES));const st=SUIT_STYLES[name];
  const parts=[`${rnd(st.color)} ${rnd(st.fabric)} ${rnd(st.cut)}`,rnd(st.shirt)];
  const shirt=parts[1];
  let tie=rnd(st.tie);if(/니트|풀림/.test(shirt))tie='없음';
  if(!/^없음/.test(tie))parts.push(tie);else if(tie.includes('('))parts.push(tie.replace(/^없음/,'넥타이 없이'));
  parts.push(rnd(st.shoes));
  const acc=rnd(st.acc);if(acc!=='없음')parts.push(acc);
  return `${name} 수트 — ${parts.join(', ')}`;
}
// ===== 구달 수트 랜덤 (고정 프롬프트에 '구달'이 있을 때만 작동) =====
// 승재보다 거친 결. 블랙 셔츠·노타이·소매 걷기(문신 노출) 비중 높음. 베이지·브라운 없음
const GUDAL_STYLES={
  '올블랙':{color:['블랙','블랙','차콜'],fabric:['매트 울','얇은 울','새틴 라펠 울'],cut:['슬림핏 노치 라펠 싱글 재킷','피크 라펠 싱글 재킷','숄칼라 재킷'],shirt:['블랙 셔츠 단추 두 개 풀림','블랙 실크 셔츠 단추 풀림','화이트 셔츠 단추 두 개 풀림'],sleeve:['재킷 입음','재킷 벗고 셔츠 소매 걷어 양팔 문신 드러남','재킷 어깨에 걸침'],shoes:['블랙 첼시 부츠','블랙 로퍼','블랙 옥스퍼드'],acc:['실버 반지','없음','없음']},
  '화이트셔츠':{color:['블랙','차콜','미드나잇 네이비'],fabric:['매트 울','울'],cut:['슬림핏 싱글 재킷','더블 브레스티드 재킷','조끼만 입고 재킷 없음'],shirt:['화이트 셔츠 맨 위 단추 풀림','화이트 셔츠 단추 두 개 풀림','화이트 셔츠에 블랙 타이 느슨하게'],sleeve:['재킷 입음','셔츠 소매 팔꿈치까지 걷어 양팔 문신 드러남','조끼 차림에 소매 걷어 문신 드러남'],shoes:['블랙 옥스퍼드','블랙 더비','블랙 첼시 부츠'],acc:['실버 반지','없음','없음']},
  '스트라이프':{color:['블랙','차콜','네이비'],fabric:['핀스트라이프 울','초크 스트라이프 울'],cut:['더블 브레스티드 재킷','피크 라펠 싱글 재킷','쓰리피스(조끼 포함)'],shirt:['블랙 셔츠','화이트 셔츠 단추 풀림','다크 그레이 셔츠'],sleeve:['재킷 입음','재킷 입음','재킷 벗고 조끼 차림, 소매 걷어 문신 드러남'],shoes:['블랙 옥스퍼드','블랙 첼시 부츠'],acc:['실버 반지','없음']},
};
const GUDAL_RULE='. 고급 수트지만 단정하게 차려입은 느낌이 아니라 건들거리는 건달 느낌. 몸에 딱 맞는 핏. 소매를 걷거나 재킷을 벗은 장면에서는 양팔 이레즈미 풀 슬리브 문신이 보여야 한다. 베이지·브라운·밝은 회색·번쩍이는 원단·헐렁한 핏 금지.';
function makeGudalSuit(){
  const name=rnd(Object.keys(GUDAL_STYLES));const st=GUDAL_STYLES[name];
  const cut=rnd(st.cut);
  const parts=[/조끼만/.test(cut)?`${rnd(st.color)} 수트 조끼와 팬츠(재킷 없음)`:`${rnd(st.color)} ${rnd(st.fabric)} ${cut}`,rnd(st.shirt)];
  let sl=rnd(st.sleeve);if(/조끼만/.test(cut))sl='조끼 차림에 소매 걷어 문신 드러남';
  if(sl!=='재킷 입음')parts.push(sl);
  parts.push(rnd(st.shoes));
  const acc=rnd(st.acc);if(acc!=='없음')parts.push(acc);
  return `${name} 수트 — ${parts.join(', ')}`;
}
const LAST_GUDAL_KEY='chat2img_codex_last_gudal';
function pickGudalSuit(){
  let last='';try{last=localStorage.getItem(LAST_GUDAL_KEY)||'';}catch(e){}
  let pick=makeGudalSuit();let g=0;while(pick===last&&g++<5)pick=makeGudalSuit();
  try{localStorage.setItem(LAST_GUDAL_KEY,pick);}catch(e){}
  return pick;
}
const LAST_SUIT_KEY='chat2img_codex_last_suit';
function pickSuit(){
  let last='';try{last=localStorage.getItem(LAST_SUIT_KEY)||'';}catch(e){}
  let pick=makeSuit();let g=0;while(pick===last&&g++<5)pick=makeSuit();
  try{localStorage.setItem(LAST_SUIT_KEY,pick);}catch(e){}
  return pick;
}
// =====================================================

// ===== 서무겸 전용 의상: 상황별 아이템·색상을 각각 랜덤 조합 =====
const MUGYEOM_STYLES={
  work:{
    top:['코튼 워크셔츠','트윌 셔츠','탄탄한 크루넥 티셔츠','헨리넥 긴팔 티셔츠','와플 긴팔 티셔츠','포켓 티셔츠','코튼 저지 롱슬리브'],
    bottom:['스트레이트 캔버스 작업용 팬츠','트윌 작업용 팬츠','진청 스트레이트 데님 팬츠','테이퍼드 코튼 작업용 팬츠','더블니 작업용 팬츠','탄탄한 치노 팬츠'],
    outer:['코튼 초어 재킷','트윌 워크재킷','캔버스 워크재킷','코튼 커버올 재킷','없음','없음'],
    shoes:['검정 작업화','짙은 브라운 작업화','차콜 로우컷 작업화','검정 가죽 작업용 부츠'],
    acc:['없음'],
  },
  daily:{
    top:['헨리넥 티셔츠','탄탄한 크루넥 티셔츠','와플 롱슬리브','코튼 셔츠','옥스퍼드 셔츠','크루넥 니트','니트 폴로','코튼 맨투맨','메리노울 라운드 니트','포켓 티셔츠','얇은 보트넥 니트'],
    bottom:['진청 스트레이트 데님 팬츠','진청 테이퍼드 데님 팬츠','스트레이트 치노 팬츠','원턱 코튼 팬츠','트윌 팬츠','코듀로이 팬츠','코튼 베이커 팬츠'],
    outer:['코튼 워크재킷','울 집업 재킷','싱글 울 코트','없음','없음','없음'],
    shoes:['검정 로우탑 스니커즈','오프화이트 로우탑 스니커즈','회색 스웨이드 스니커즈','검정 스웨이드 단화','다크 브라운 데저트 부츠(낮은 굽)','검정 가죽 부츠(낮은 굽)'],
    acc:['없음','없음','단정한 검정 가죽 스트랩 시계','장식 없는 실버 시계','차콜 캔버스 토트백'],
  },
  outing:{
    top:['코튼 셔츠','옥스퍼드 셔츠','밴드칼라 셔츠','크루넥 니트','니트 폴로','얇은 메리노울 니트','탄탄한 크루넥 티셔츠','헨리넥 티셔츠','질감이 은은한 리브 니트','깔끔한 코튼 롱슬리브'],
    bottom:['스트레이트 치노 팬츠','원턱 코튼 팬츠','진청 스트레이트 데님 팬츠','진청 테이퍼드 데님 팬츠','울 혼방 캐주얼 팬츠','코듀로이 팬츠'],
    outer:['미니멀 집업 재킷','싱글 울 코트','맥코트','스웨이드 트러커 재킷','코튼 초어 재킷','울 집업 재킷','없음','없음'],
    shoes:['검정 스웨이드 단화','다크 브라운 스웨이드 단화','검정 가죽 부츠(낮은 굽)','다크 브라운 첼시 부츠(낮은 굽)','오프화이트 로우탑 스니커즈','검정 미니멀 스니커즈'],
    acc:['없음','없음','단정한 검정 가죽 스트랩 시계','장식 없는 실버 시계','짙은 브라운 가죽 스트랩 시계'],
  },
  home:{
    top:['부드러운 긴팔 티셔츠','탄탄한 반팔 티셔츠','헨리넥 티셔츠','와플 롱슬리브','얇은 크루넥 니트','편안한 코튼 맨투맨','코튼 저지 티셔츠','부드러운 니트 폴로'],
    bottom:['스트레이트 저지 팬츠','편안한 코튼 팬츠','부드러운 니트 팬츠','깔끔한 스웨트 팬츠','밴딩 코튼 팬츠'],
    outer:['얇은 가디건','부드러운 집업 가디건','없음','없음','없음','없음'],
    shoes:['실내 장면에 맞게 맨발 또는 단정한 실내화'],
    acc:['없음'],
  },
};
// 무채색 중심. 포인트 컬러는 상의 또는 겉옷 한 곳에만 사용.
const MUGYEOM_NEUTRALS=['블랙','차콜','그레이','스톤 그레이','오프화이트'];
const MUGYEOM_COLORS={
  top:['블랙','차콜','그레이','스톤 그레이','오프화이트','네이비','다크 올리브','다크 브라운'],
  bottom:['블랙','차콜','스톤 그레이','네이비','다크 올리브'],
  outer:['블랙','차콜','스톤 그레이','네이비','다크 올리브','다크 브라운'],
  denim:['진청','중청'],
};
function mugyeomColor(item,slot,topColor){
  if(/진청|중청/.test(item))return item;
  let colors=/데님/.test(item)?MUGYEOM_COLORS.denim:MUGYEOM_COLORS[slot];
  if(slot==='outer'&&!MUGYEOM_NEUTRALS.includes(topColor)){
    colors=colors.filter(c=>MUGYEOM_NEUTRALS.includes(c));
  }
  const color=rnd(colors);
  return {color,text:color+' '+item};
}
function makeMugyeomOutfit(group,scene){
  const st=MUGYEOM_STYLES[group];
  const hot=/여름|한여름|무더위|폭염|더운 날/.test(scene);
  const choose=items=>rnd(hot?items.filter(i=>!/울|코듀로이|와플|맨투맨|스웨트|스웨이드|코트|긴팔|롱슬리브/.test(i)):items);
  const top=mugyeomColor(choose(st.top),'top');
  const bottom=mugyeomColor(choose(st.bottom),'bottom');
  const parts=[top.text,bottom.text];
  const outer=hot?'없음':rnd(st.outer);
  if(outer!=='없음')parts.push(mugyeomColor(outer,'outer',top.color).text);
  parts.push(rnd(st.shoes));
  const acc=rnd(st.acc);if(acc!=='없음')parts.push(acc);
  return parts.join(', ');
}
const MUGYEOM_RULE='. 서무겸은 특수임무부대 소령 출신의 동네 목공방 운영자다. 의상만 변경하고 기존 외형·표정·자세·관계·장면은 유지한다. 188cm의 군살 없이 단단한 성인 체격이 드러나는 자연스러운 어깨선, 알맞은 여유와 깔끔한 바지 길이로 잘 입은 느낌을 낸다. 무채색 중심에 짙은 인디고·네이비·올리브·브라운을 절제해 사용하고, 코튼·트윌·데님·니트·스웨이드의 매트한 소재감을 살린다. 정장 세트, 수트 재킷, 블레이저, 턱시도, 넥타이, 재벌 같은 비즈니스 차림, 군복, 전술 장비, 큰 로고, 번쩍이는 원단, 과도한 스키니핏과 헐렁한 핏은 제외한다. 퇴역 군인 설정을 군복으로 표현하지 않는다. 손등과 팔의 기존 흉터는 옷 밖에 드러나는 부분에만 자연스럽게 유지하고 문신을 추가하지 않는다. 왼쪽 다리 설정은 그대로 유지하며 보조기나 지팡이를 임의로 추가하지 않는다. 장면의 계절·날씨·실내외에 맞춰 소매 길이와 두께를 조절하고 더운 날이나 실내에서는 불필요한 겉옷을 생략한다. 실내 맨발·실내화 설정은 장면을 따른다.';
const LAST_MUGYEOM_KEY='chat2img_codex_last_mugyeom';
function pickMugyeomOutfit(scene){
  // 직업 소개가 아니라 Scene description에 실제로 묘사된 장소·행동으로 선택.
  const atWork=/목공방|공방|작업실|작업대|목공 작업|나무를|목재|사포질|샌딩|대패질|톱질|대패|끌로|톱밥|나무 가루/.test(scene);
  const working=/사포질|샌딩|대패질|톱질|목재.{0,15}(자르|깎|다듬|손질)|나무.{0,15}(자르|깎|다듬|손질)|목공 작업|작업 중/.test(scene);
  const atHome=/집에서|집 안|집안|거실|침실|침대|소파|부엌|주방/.test(scene);
  const goingOut=/데이트|외출|산책|카페|식당|레스토랑|영화관|드라이브|장보기/.test(scene);
  const group=atWork?'work':goingOut?'outing':atHome?'home':'daily';
  let last='';try{last=localStorage.getItem(LAST_MUGYEOM_KEY)||'';}catch(e){}
  let outfit=makeMugyeomOutfit(group,scene);
  let attempts=0;
  while(outfit===last&&attempts++<8)outfit=makeMugyeomOutfit(group,scene);
  // 난수가 반복되는 경우에도 직전과 같은 코디는 피함.
  if(outfit===last){
    const parts=outfit.split(', ');
    const colors=[...MUGYEOM_COLORS.top,...MUGYEOM_COLORS.denim].sort((a,b)=>b.length-a.length);
    const oldColor=colors.find(color=>parts[0].startsWith(color+' '));
    const alternatives=/데님/.test(parts[0])?['진청','중청']:['블랙','차콜'];
    if(oldColor)parts[0]=alternatives.find(color=>color!==oldColor)+parts[0].slice(oldColor.length);
    outfit=parts.join(', ');
  }
  try{localStorage.setItem(LAST_MUGYEOM_KEY,outfit);}catch(e){}
  const apron=(atWork||working)?' 공방 안에 있으므로 옷 위에 차콜 캔버스 작업 앞치마(목에 거는 끈, 허리에 묶는 끈, 가슴 주머니, 나무 가루가 살짝 묻음)를 항상 두르고 있다.'+(working?' 회전 공구를 사용하는 경우 소매는 늘어지지 않게 정리한다.':''):' 공방 밖이므로 앞치마와 공구 벨트는 착용하지 않는다.';
  return outfit+apron;
}

// ===== 설기 전용 의상: 장면별 남성 스타일 + 아이템/색상 자유 조합 =====
// 복장만 변경. 은발·푸른 눈·눈표범 귀·꼬리 등 캐릭터 정체성은 절대 바꾸지 않음.
const SEOLGI_STYLES={
  minimal:{
    top:['코튼 크루넥 티셔츠','얇은 크루넥 니트','리브 니트','옥스퍼드 셔츠','오픈칼라 셔츠','니트 폴로','모크넥 니트','헨리넥 티셔츠','코튼 롱슬리브','코튼 셔츠'],
    bottom:['진청 스트레이트 데님 팬츠','원턱 울 슬랙스','세미와이드 슬랙스','스트레이트 치노 팬츠','테이퍼드 코튼 팬츠','플리츠 와이드 팬츠','코듀로이 스트레이트 팬츠','울 혼방 팬츠'],
    outer:['없음','없음','없음','스웨이드 재킷','싱글 울 코트','코튼 트러커 재킷','니트 집업','가벼운 가디건'],
    shoes:['깔끔한 화이트 스니커즈','블랙 로퍼','다크 브라운 첼시 부츠','블랙 더비 슈즈','스웨이드 로퍼','미니멀 레더 스니커즈'],
    acc:['없음','없음','가느다란 실버 시계','심플한 실버 반지','심플한 가죽 시계','얇은 실버 목걸이']
  },
  preppy:{
    top:['옥스퍼드 셔츠','잔줄 스트라이프 셔츠','셔츠와 V넥 니트 베스트 레이어드','셔츠 위 크리켓 니트','케이블 니트','니트 폴로','카라 니트','럭비 셔츠','셔츠 위 크루넥 니트','단정한 피케 폴로'],
    bottom:['원턱 치노 팬츠','스트레이트 울 슬랙스','플리츠 코튼 팬츠','코듀로이 스트레이트 팬츠','테이퍼드 치노 팬츠','투턱 슬랙스'],
    outer:['없음','없음','싱글 블레이저','코튼 맥코트','울 더플코트','바시티 재킷','클래식 트렌치코트','니트 가디건'],
    shoes:['페니 로퍼','브라운 스웨이드 로퍼','블랙 더비 슈즈','화이트 레더 스니커즈','옥스퍼드 슈즈','브라운 첼시 부츠'],
    acc:['없음','없음','얇은 가죽 벨트','가죽 스트랩 시계','단정한 실버 시계','메신저백']
  },
  street:{
    top:['오버핏 반팔 티셔츠','탄탄한 크루넥 맨투맨','워싱 롱슬리브','집업 후디','박시 코튼 셔츠','하프집업 스웨트셔츠','라글란 티셔츠','굵은 니트','레이어드 긴팔 티셔츠','코튼 헨리넥'],
    bottom:['진청 와이드 데님 팬츠','카고 팬츠','나일론 와이드 팬츠','코튼 베이커 팬츠','턱 잡힌 와이드 치노 팬츠','카펜터 팬츠','블랙 스트레이트 팬츠'],
    outer:['없음','없음','미니멀 바람막이','워크 재킷','집업 플리스 재킷','오버핏 코튼 셔츠 재킷'],
    shoes:['화이트 로우탑 스니커즈','블랙 캔버스 스니커즈','실버 러닝화','레트로 러너 스니커즈','스웨이드 스니커즈','블랙 레더 스니커즈'],
    acc:['없음','없음','실버 체인 팔찌','심플한 실버 반지','크로스백','캔버스 숄더백']
  },
  date:{
    top:['얇은 니트 폴로','오픈칼라 코튼 셔츠','실크 혼방 오픈칼라 셔츠','리브 크루넥 니트','부드러운 V넥 니트','드레이프가 자연스러운 셔츠','모던 헨리넥 티셔츠','단정한 셔츠와 니트 베스트','탄탄한 크루넥 티셔츠'],
    bottom:['원턱 울 팬츠','테이퍼드 슬랙스','세미와이드 슬랙스','진청 스트레이트 데님 팬츠','드레이프 있는 와이드 슬랙스','핀턱 치노 팬츠','슬림 스트레이트 코튼 팬츠'],
    outer:['없음','없음','없음','싱글 블레이저','미니멀 숏코트','가벼운 카디건','울 트렌치코트'],
    shoes:['블랙 로퍼','브라운 스웨이드 로퍼','블랙 첼시 부츠','화이트 레더 스니커즈','블랙 더비 슈즈','다크 브라운 레더 슈즈'],
    acc:['없음','없음','슬림 실버 시계','심플한 실버 반지','가느다란 실버 체인','깔끔한 가죽 벨트']
  },
  home:{
    top:['부드러운 코튼 반팔 티셔츠','긴팔 코튼 티셔츠','편안한 헨리넥 티셔츠','가벼운 크루넥 니트','얇은 와플 롱슬리브','탄탄한 맨투맨','부드러운 니트 폴로','가벼운 집업 스웨트셔츠'],
    bottom:['스트레이트 코튼 라운지 팬츠','조거 팬츠','편안한 저지 팬츠','부드러운 니트 팬츠','밴딩 코튼 팬츠','스트레이트 스웨트 팬츠'],
    outer:['없음','없음','없음','없음','얇은 니트 가디건','가벼운 집업 가디건'],
    shoes:['실내 맨발','심플한 실내 슬리퍼','깔끔한 실내화'],
    acc:['없음','없음','없음','얇은 실버 반지']
  },
  summer:{
    top:['반팔 코튼 셔츠','린넨 오픈칼라 셔츠','시원한 니트 폴로','탄탄한 반팔 티셔츠','슬리브리스 위 얇은 린넨 셔츠','가벼운 피케 폴로','반팔 스트라이프 셔츠','얇은 시어서커 셔츠','반팔 헨리넥'],
    bottom:['가벼운 와이드 코튼 팬츠','린넨 슬랙스','진청 스트레이트 데님 팬츠','테이퍼드 치노 팬츠','린넨 혼방 와이드 팬츠'],
    outer:['없음','없음','없음','없음','얇은 린넨 오버셔츠'],
    shoes:['화이트 스니커즈','브라운 스웨이드 로퍼','가죽 스트랩 샌들','캔버스 로우탑 스니커즈','심플한 블랙 로퍼'],
    acc:['없음','없음','얇은 실버 반지','미니멀 실버 시계','작은 캔버스 토트백']
  },
  winter:{
    top:['도톰한 케이블 니트','울 크루넥 니트','니트 폴로','얇은 터틀넥 니트','기모 스웨트셔츠','옥스퍼드 셔츠 위 니트 레이어드','하프집업 울 니트','도톰한 리브 니트'],
    bottom:['울 플란넬 슬랙스','코듀로이 스트레이트 팬츠','두꺼운 치노 팬츠','진청 스트레이트 데님 팬츠','헤비 코튼 와이드 팬츠','플리츠 울 팬츠'],
    outer:['싱글 울 롱코트','더블 브레스티드 울 코트','숏 패딩 재킷','무광 패딩 점퍼','울 더플코트','무광 가죽 재킷과 얇은 머플러'],
    shoes:['다크 브라운 첼시 부츠','블랙 첼시 부츠','블랙 레더 부츠','스웨이드 부츠','블랙 더비 슈즈'],
    acc:['없음','없음','베이직 니트 머플러','가죽 장갑','울 머플러','실버 손목시계']
  },
  active:{
    top:['기능성 반팔 티셔츠','무지 트레이닝 롱슬리브','가벼운 러닝 티셔츠','스포츠 하프집업','슬림한 기능성 크루넥','심플한 트레이닝 집업'],
    bottom:['테이퍼드 트레이닝 팬츠','기능성 조거 팬츠','스트레이트 트랙 팬츠'],
    outer:['없음','없음','가벼운 스포츠 바람막이','러닝 집업 재킷'],
    shoes:['화이트 러닝화','블랙 러닝화','심플한 트레이닝 슈즈','그레이 러닝화'],
    acc:['없음','없음','심플한 스포츠 워치','운동용 손목밴드']
  }
};
const SEOLGI_COLORS={
  top:['화이트','오프화이트','크림','라이트 그레이','차콜','블랙','네이비','딥 브라운','올리브','버건디','코발트 블루','세이지 그린'],
  bottom:['블랙','차콜','그레이','네이비','오프화이트','베이지','모카 브라운','다크 올리브'],
  outer:['블랙','차콜','네이비','그레이','아이보리','다크 브라운','베이지','올리브'],
  denim:['진청','중청']
};
const SEOLGI_NEUTRALS=['화이트','오프화이트','크림','라이트 그레이','차콜','블랙','네이비','그레이'];
function seolgiColor(item,slot,topColor){
  // 이미 색이 특정된 옷에는 색을 다시 붙이지 않음.
  if(/화이트|오프화이트|아이보리|크림색|베이지|브라운|블랙|검정|흰색|그레이|차콜|네이비|올리브|버건디|코발트|세이지|연청|중청|진청|흑청|인디고|실버/.test(item))return {color:'fixed',text:item};
  let colors=/데님/.test(item)?SEOLGI_COLORS.denim:SEOLGI_COLORS[slot];
  if(slot==='outer'&&!SEOLGI_NEUTRALS.includes(topColor))colors=colors.filter(c=>['블랙','차콜','네이비','그레이','아이보리','베이지'].includes(c));
  const color=rnd(colors);
  return {color,text:color+' '+item};
}
function seolgiStyle(scene){
  // 고정 프롬프트의 직업·세계관 설명이 아니라 이번 Scene description만 확인.
  if(/결혼식|시상식|연회|무도회|격식|공식 행사|정장 차림|턱시도|갈라 행사|리셉션/.test(scene))return 'formal';
  if(/헬스장|운동 중|러닝|조깅|트레이닝|체육관|웨이트/.test(scene))return 'active';
  if(/집에서|집 안|집안|거실|침실|소파|부엌|주방|자취방/.test(scene))return 'home';
  if(/여름|한여름|무더위|폭염|더운 날|해변|바닷가/.test(scene))return 'summer';
  if(/겨울|한겨울|혹한|눈 오는|눈 내리는|추운 날|영하|눈밭/.test(scene))return 'winter';
  if(/데이트|레스토랑|기념일|근사한 식당/.test(scene))return rnd(['date','date','preppy','minimal']);
  return rnd(['minimal','minimal','preppy','preppy','street','street','date']);
}
function makeSeolgiOutfit(scene){
  const style=seolgiStyle(scene);
  if(style==='formal'){
    const c=rnd(['블랙','차콜','미드나잇 네이비','딥 네이비']);
    const fabric=rnd(['매트 울','고급 트윌 울','은은한 헤링본 울','미세한 핀스트라이프 울']);
    const cut=rnd(['노치 라펠 싱글 수트','피크 라펠 더블 수트','단정한 쓰리피스 수트','슬림 스트레이트 테일러드 수트']);
    const shirt=rnd(['화이트 드레스 셔츠','아이보리 셔츠','블랙 실크 셔츠','연한 블루 드레스 셔츠']);
    const tie=/실크/.test(shirt)?'넥타이 없이':rnd(['넥타이 없이','블랙 실크 타이','네이비 슬림 타이','버건디 타이']);
    const shoes=rnd(['블랙 옥스퍼드','블랙 더비 슈즈','블랙 첼시 부츠']);
    const acc=rnd(['없음','은은한 실버 시계','심플한 실버 커프스']);
    return '격식 있는 테일러링 — '+[`${c} ${fabric} ${cut} (재킷과 팬츠 같은 색·소재)`,shirt,tie,shoes,acc].filter(t=>t!=='없음').join(', ');
  }
  const st=SEOLGI_STYLES[style];
  const top=seolgiColor(rnd(st.top),'top');
  const bottom=seolgiColor(rnd(st.bottom),'bottom');
  const parts=[top.text,bottom.text];
  let outer=rnd(st.outer);
  if(outer!=='없음')parts.push(seolgiColor(outer,'outer',top.color).text);
  parts.push(rnd(st.shoes));
  const acc=rnd(st.acc);if(acc!=='없음')parts.push(acc);
  const names={minimal:'미니멀',preppy:'영국 프레피',street:'모던 스트리트',date:'데이트룩',home:'홈웨어',summer:'여름 캐주얼',winter:'겨울 레이어드',active:'스포티'};
  return `${names[style]} — ${parts.join(', ')}`;
}
const SEOLGI_RULE='. 설기는 성인 남성 눈표범 캐릭터이며 이번에는 의상만 변경한다. 기존 얼굴·눈매·은빛 머리·푸른 눈·둥근 눈표범 귀·꼬리·체형·표정·자세·관계·배경은 절대 바꾸지 않는다. 머리카락은 매끄럽게 유지하고 눈표범 귀와 꼬리가 자연스럽게 보이게 한다. 사람 체형을 털로 덮거나 얼굴을 동물 얼굴로 바꾸지 않는다. 작거나 앳된 어린아이 체형, 치비 비율, 동물 탈·마스코트복, 귀를 가리는 모자, 큰 로고, 알록달록한 조잡한 조합, 과장된 액세서리는 금지한다. 성인 남성이 세련되고 잘 맞는 옷을 입은 느낌으로 소재와 핏을 자연스럽게 표현한다. 장면에 맞는 복장과 계절을 우선하고 여름에는 불필요한 두꺼운 외투를, 실내에서는 불필요한 겉옷을 강제로 입히지 않는다. 눈표범 귀와 꼬리는 원래 설정대로 유지하되 새 장식이나 의상을 임의로 추가하지 않는다.';
const LAST_SEOLGI_KEY='chat2img_codex_last_seolgi';
function pickSeolgiOutfit(scene){
  let last='';try{last=localStorage.getItem(LAST_SEOLGI_KEY)||'';}catch(e){}
  let outfit=makeSeolgiOutfit(scene),tries=0;
  while(outfit===last&&tries++<12)outfit=makeSeolgiOutfit(scene);
  try{localStorage.setItem(LAST_SEOLGI_KEY,outfit);}catch(e){}
  return outfit;
}

// =====================================================

// ===== 다이스케·비비안: 1980년 일본 가상 세계관 전용 =====
// 현대 여주/남주 풀과 완전히 분리. 완성 코디가 아닌 아이템·색상을 독립 조합.
const DV1980_WARDROBE={
  daisuke:{
    top:{
      mild:['코튼 셔츠','옥스퍼드 셔츠','잔줄무늬 셔츠','헨리넥 긴팔 셔츠','얇은 크루넥 니트','니트 폴로','코튼 긴팔 티셔츠','잔골지 라운드 니트'],
      hot:['반팔 코튼 셔츠','반팔 오픈칼라 셔츠','얇은 리넨 셔츠','무지 반팔 티셔츠','반팔 피케 폴로','시어서커 반팔 셔츠'],
      cold:['울 크루넥 니트','램스울 V넥 니트','잔골지 울 니트','도톰한 코튼 셔츠','플란넬 셔츠','얇은 울 터틀넥','케이블 니트','기모 코튼 긴팔 티셔츠'],
      home:['부드러운 코튼 긴팔 셔츠','코튼 헨리넥','무지 긴팔 티셔츠','얇은 라운드 니트','편안한 코튼 셔츠','잔골지 니트'],
    },
    bottom:{
      mild:['스트레이트 면바지','원턱 치노 팬츠','울 혼방 슬랙스','진청 스트레이트 데님','코튼 트윌 팬츠','잔골 코듀로이 팬츠'],
      hot:['얇은 면바지','리넨 혼방 팬츠','가벼운 치노 팬츠','여름용 트로피컬 울 슬랙스','얇은 코튼 트윌 팬츠'],
      cold:['울 플란넬 슬랙스','코듀로이 팬츠','두꺼운 치노 팬츠','울 혼방 스트레이트 팬츠','진청 두꺼운 데님'],
      home:['편안한 면바지','스트레이트 저지 팬츠','밴딩 코튼 팬츠','부드러운 트윌 팬츠','편안한 니트 팬츠'],
    },
    outer:{
      mild:['없음','없음','V넥 카디건','단정한 니트 카디건','코튼 맥코트','울 혼방 짧은 재킷'],
      hot:['없음'],
      cold:['싱글 울 코트','울 더플코트','울 피코트','모직 발마칸 코트','안감 있는 코튼 코트'],
      home:['없음','없음','얇은 니트 카디건','부드러운 V넥 카디건'],
    },
    shoes:['검정 가죽 더비 구두','짙은 갈색 가죽 단화','브라운 페니 로퍼','검정 로퍼','낮은 굽의 브라운 스웨이드 부츠','장식 없는 캔버스 운동화'],
    acc:['없음'],
    colors:{top:['오프화이트','오트밀','연회색','차콜','네이비','연한 블루','브라운','짙은 올리브'],bottom:['차콜','그레이','네이비','베이지','브라운','블랙'],outer:['차콜','네이비','카멜','브라운','오트밀','그레이']},
  },
  vivian:{
    top:{
      mild:['코튼 블라우스','작은 칼라의 셔츠','보트넥 니트','얇은 라운드 니트','잔골지 니트','니트 폴로','심플한 실크 혼방 블라우스','코튼 긴팔 티셔츠'],
      hot:['반팔 코튼 블라우스','반팔 칼라 셔츠','얇은 리넨 블라우스','반팔 니트','무지 코튼 티셔츠','캡소매 블라우스'],
      cold:['울 라운드 니트','잔골지 울 니트','얇은 터틀넥 니트','램스울 V넥 니트','도톰한 코튼 블라우스','케이블 니트'],
      home:['부드러운 코튼 블라우스','편안한 라운드 니트','코튼 긴팔 티셔츠','잔골지 니트','단정한 코튼 셔츠','얇은 보트넥 니트'],
    },
    bottom:{
      mild:['A라인 미디 스커트','일자 미디 스커트','원턱 슬랙스','진청 스트레이트 데님','코튼 스트레이트 팬츠','니트 미디 스커트','폭이 과하지 않은 와이드 팬츠','플리츠 미디 스커트'],
      hot:['코튼 A라인 스커트','가벼운 일자 미디 스커트','얇은 원턱 팬츠','리넨 스트레이트 팬츠','가벼운 코튼 와이드 팬츠','코튼 미디 스커트'],
      cold:['울 A라인 미디 스커트','울 일자 미디 스커트','울 슬랙스','코듀로이 팬츠','도톰한 니트 미디 스커트','진청 두꺼운 스트레이트 데님'],
      home:['편안한 면바지','코튼 A라인 미디 스커트','부드러운 니트 스커트','밴딩 코튼 팬츠','코튼 스트레이트 팬츠'],
    },
    dress:{
      mild:['단정한 셔츠 원피스','허리선이 자연스러운 미디 원피스','단색 랩 원피스','심플한 니트 원피스','칼라가 작은 A라인 원피스'],
      hot:['코튼 반팔 셔츠 원피스','리넨 미디 원피스','반팔 A라인 원피스','가벼운 단색 랩 원피스'],
      cold:['긴팔 울 혼방 원피스','도톰한 니트 미디 원피스','긴팔 셔츠형 모직 원피스'],
      home:['편안한 코튼 원피스','부드러운 니트 원피스','단정한 긴팔 셔츠 원피스'],
    },
    outer:{
      mild:['없음','없음','단정한 카디건','코튼 트렌치코트','짧은 울 혼방 재킷','코튼 맥코트','힙 길이의 니트 카디건'],
      hot:['없음'],
      cold:['싱글 울 코트','단정한 벨티드 울 코트','울 피코트','울 더플코트','모직 발마칸 코트'],
      home:['없음','없음','얇은 카디건','힙 길이의 부드러운 카디건'],
    },
    shoes:['브라운 가죽 로퍼','검정 가죽 단화','낮은 굽의 스트랩 슈즈','베이지 낮은 굽 펌프스','브라운 레이스업 단화','오프화이트 캔버스 운동화'],
    acc:['없음','없음','작은 브라운 가죽 숄더백','네이비 천 토트백','작은 검정 가죽 핸드백','가죽 스트랩 아날로그 시계'],
    colors:{top:['아이보리','크림','오트밀','베이지','연회색','하늘색','버터 옐로','세이지 그린','버건디','네이비'],bottom:['베이지','카멜','그레이','네이비','브라운','버건디','크림','세이지 그린'],outer:['베이지','카멜','네이비','그레이','크림','브라운','버건디']},
  },
};
const DV1980_WORLD_RULE='\n\n[다이스케·비비안 전용 시대·인물 유지 규칙]\n1980년 일본을 배경으로 한 가상 세계관이다. 실제 역사적 제도로 단정하지 않는다. 옷과 배경 소품은 1980년에 존재할 법한 기본적인 디자인으로 표현하며, 2020년대 유행 스타일·대형 로고·스마트폰·태블릿·스마트워치·무선 이어폰·현대식 터치스크린을 넣지 않는다. 필요한 소품은 장면에 있을 때만 유선 전화·종이책·당시의 가구 등으로 표현한다. 일본이라는 이유만으로 기모노·유카타·다다미·벚꽃·신사 등을 임의로 추가하지 않는다. 구체적인 장소·날씨·계절·생활수준·인물 배치는 현재 대화를 따른다.\n다이스케는 37세의 실제 성인 인간이며, 선천적 전맹이다. 인간 인형이라는 말은 착취와 강압을 겪은 사람을 뜻하는 세계관 용어이며 로봇·마네킹·구체관절 인형·도자기 피부·인형 관절로 표현하지 않는다. 비비안은 28세 성인 여성, 167cm, 48kg이며 현재 그의 17번째 주인이라는 관계 설정이다. 과거의 빈민가·선발 시설·학대·이전 주인들은 현재 장면에 명시되지 않는 한 그리지 않는다. 어린 시절 장면이나 아이들, 도축장, 구속 도구, 목줄, 사슬, 새로운 상처를 임의로 추가하지 않는다.\n다이스케는 키가 크고 어깨 골격은 넓지만 마른 체형이며 쇄골과 손가락뼈가 자연스럽게 드러난다. 러시아계·일본계 혼혈의 성숙하고 이국적인 미남, 갈색빛 흑발의 가슴 윗부분까지 오는 매끄러운 긴 머리, 회색 눈동자를 유지한다. 비비안은 갈색 긴 생머리와 갈색 눈, 살짝 처진 부드러운 눈꼬리, 곧은 콧날·짧은 인중·도톰하고 옅은 입술·희고 깨끗한 피부·가느다란 손목과 발목을 유지한다. 둘 다 아동처럼 어려지지 않는다. 얼굴의 할퀸 자국과 기존 흉터는 기존 설정대로만 유지하며 노출을 늘려 보여주지 않는다.\n다이스케의 눈동자는 허공이나 아래쪽에 느슨하게 머문다. 소리나 접촉에 반응하되 상대나 카메라와 정확하게 눈을 맞추거나 사물을 눈으로 추적하지 않는다. 회색 눈을 새하얗게 지우거나 항상 감기지 않는다. 흰지팡이·선글라스·안대·보행 보조 스틱은 현재 장면에 명시된 경우만 사용하고, 시각장애만으로 보행장애를 추가하지 않는다.\n현재 장면의 인물만 그린다. 아래 의상 후보가 있다는 이유로 부재한 인물을 추가하지 않는다. 얼굴·머리 길이·머리색·눈 색·체형·표정·포즈와 깔끔한 선화·부드러운 셀 셰이딩·매끄럽고 윤기 있는 머리카락 표현을 유지한다. 팔과 다리는 각 두 개, 손가락과 관절 연결은 자연스럽게 표현한다.';
const DV1980_OUTFIT_RULE=' 대화에 직접 지정된 옷과 #옷고정·#옷지정이 최우선이다. 이 조합은 의상이 지정되지 않은 경우의 후보이며 얼굴·포즈·배경을 바꾸는 지시가 아니다. 당시 기본적인 서양식 일상복을 중심으로 색·소재·핏을 조화롭게 표현한다. 평상복을 정장·하인 제복·죄수복·찢어진 누더기로 고정하지 않는다. 현대 올드머니·스칸디 시크·발레코어 같은 유행 라벨을 그대로 적용하지 않는다. 인물의 성인 체형을 유지하고 비비안을 과한 리본·프릴·레이스로 꾸미지 않는다. 실내에서는 실외 신발과 불필요한 외투를 벗고, 실제 계절·날씨·상황에 맞춰 두께를 조절한다.';
function dv1980Context(scene){
  const outside=/외출|산책|거리|골목|정원|카페|식당|상점|장보기|기차역|outside|outdoors|street|garden/i.test(scene);
  const indoors=!outside&&/집에서|집 안|집안|거실|침실|침대|소파|부엌|주방|서재|실내|indoors|living room|bedroom|kitchen/i.test(scene);
  const season=/여름|무더위|폭염|더운 날|summer|hot weather/i.test(scene)?'hot':/겨울|눈밭|눈 오는|눈 내리는|추운|혹한|winter|snow|cold weather/i.test(scene)?'cold':'mild';
  return {indoors,season};
}
function dv1980Colored(item,colors){
  if(/데님/.test(item))return /진청|중청/.test(item)?item:rnd(['진청','중청'])+' '+item;
  return rnd(colors)+' '+item;
}
function makeDV1980Outfit(role,scene){
  const st=DV1980_WARDROBE[role],ctx=dv1980Context(scene);
  const climate=ctx.indoors&&ctx.season==='mild'?'home':ctx.season;
  // 비비안은 원피스 또는 상·하의. 원피스 위에 하의를 중복시키지 않음.
  const dress=role==='vivian'&&Math.random()<0.3;
  const parts=dress?[dv1980Colored(rnd(st.dress[climate]),st.colors.top)]:[
    dv1980Colored(rnd(st.top[climate]),st.colors.top),
    dv1980Colored(rnd(st.bottom[climate]),st.colors.bottom),
  ];
  const outer=ctx.indoors?(ctx.season==='hot'?'없음':rnd(st.outer.home)):rnd(st.outer[climate]);
  if(outer!=='없음')parts.push(dv1980Colored(outer,st.colors.outer));
  if(ctx.indoors){
    parts.push('실내에서는 맨발 또는 양말·실내화(현재 장면에 따름)');
  }else{
    parts.push(rnd(st.shoes));
    if(role==='vivian'&&ctx.season==='cold'&&(dress||/스커트/.test(parts.join(' '))))parts.push('불투명한 보온 타이츠');
    const acc=rnd(st.acc);if(acc!=='없음')parts.push(acc);
  }
  return parts.join(', ');
}
function pickDV1980Outfit(role,scene){
  const key='chat2img_codex_last_1980_'+role;
  let last='';try{last=localStorage.getItem(key)||'';}catch(e){}
  let outfit=makeDV1980Outfit(role,scene),tries=0;
  while(outfit===last&&tries++<12)outfit=makeDV1980Outfit(role,scene);
  if(outfit===last){
    // 난수가 반복돼도 새 코디를 만들되 계절·아이템은 유지.
    const colors=[...DV1980_WARDROBE[role].colors.top].sort((a,b)=>b.length-a.length);
    const old=colors.find(c=>outfit.startsWith(c+' '));
    if(old)outfit=colors.find(c=>c!==old)+outfit.slice(old.length);
  }
  try{localStorage.setItem(key,outfit);}catch(e){}
  return outfit;
}
// 장면에서 옷을 직접 언급했다면 둘 모두 현재 복장을 보존. 프로필의 기본 의상 예시는 제외.
function dv1980KeepSceneClothes(scene){
  return /#옷고정|#옷지정|메이드복|환자복|병원복|수영복|잠옷|교복|기모노|유카타|상복|웨딩|제복|맨몸|알몸|탈의|목욕|샤워|속옷|상체 노출|옷을 벗|벗은|벗긴|벗기|갈아입|셔츠|블라우스|니트|카디건|가디건|코트|재킷|자켓|팬츠|바지|스커트|치마|원피스|드레스|수트|정장|조끼|목도리|머플러|티셔츠|반팔티|긴팔티|청바지|양말|구두|운동화|부츠|슬리퍼|\b(shirt|blouse|sweater|cardigan|coat|jacket|trousers|pants|skirt|dress|suit|pajamas|pyjamas|uniform|kimono|yukata|underwear|naked|nude|shirtless|undressed|bathing|shower)\b/i.test(scene);
}
function buildDV1980Prompt(prompt,scene,off){
  let add=DV1980_WORLD_RULE;
  if(!off&&!dv1980KeepSceneClothes(scene)&&!prompt.includes('Romance-fantasy setting')){
    add+='\n\n다이스케 의상 후보 (현재 장면에 등장할 때만 적용): '+pickDV1980Outfit('daisuke',scene)+DV1980_OUTFIT_RULE;
    add+='\n\n비비안 의상 후보 (현재 장면에 등장할 때만 적용): '+pickDV1980Outfit('vivian',scene)+DV1980_OUTFIT_RULE;
  }else{
    add+='\n현재 대화 또는 사용자 지정 의상을 그대로 유지한다. 랜덤 코디로 교체하지 않는다.';
  }
  return prompt+add;
}

// ===== 최모아 전용 풀 (고정 프롬프트에 '최모아'가 있으면 여주 풀 대신 이걸 씀) =====
// 23세 고아, 돈 없음. 가진 옷 몇 벌을 돌려 입는 느낌. 낡았지만 깔끔하게 잘 입음. '#모아업그레이드' 넣으면 일반 여주 풀로 전환
const MOA_COLORS=['화이트','오프화이트','연회색','차콜','블랙','네이비','베이지','카키','브라운'];
const MOA={
  top:['목 늘어난 흰 티셔츠','빛바랜 회색 맨투맨','오버핏 체크 셔츠','얇은 크루넥 니트','스트라이프 긴팔 티','기본 후드티','소매 긴 긴팔 티셔츠','오버핏 흰 셔츠','보풀 조금 있는 니트','검정 반팔 티'],
  bottom:['깨끗한 원톤 중청 와이드 데님','검정 면바지','베이지 치노 팬츠','무지 롱 면치마','회색 트레이닝 팬츠','검정 슬랙스'],
  outer:['낡은 집업 후드','오버핏 가디건','바람막이','큰 사이즈 체크 셔츠 겉옷','없음','없음','없음','오래 입은 코듀로이 재킷'],
  shoes:['낡은 컨버스','흰 스니커즈(살짝 때 탐)','검정 단화','낡은 운동화','슬리퍼'],
  acc:['에코백','낡은 백팩','머리끈 손목에','검정 머리끈으로 반묶음','없음','없음','없음'],
};
const MOA_RULE='. 23살 고아로 돈이 없어서 가진 옷 몇 벌을 돌려 입는다. 옷은 낡고 빛바래고 보풀이 있거나 살짝 늘어난 느낌이 보여야 하지만, 핏과 매치는 깔끔하고 센스 있게 — 꾸민 티 안 내고 잘 입는 사람. 새 옷 느낌, 비싸 보이는 아이템, 블레이저, 로퍼, 실크, 새틴, 명품, 액세서리, 화려한 색은 금지.';
function makeMoaOutfit(){
  const c1=rnd(MOA_COLORS);let c2=rnd(MOA_COLORS);let g=0;while(c2===c1&&g++<5)c2=rnd(MOA_COLORS);
  const top=rnd(MOA.top),bottom=rnd(MOA.bottom),outer=rnd(MOA.outer),shoes=rnd(MOA.shoes),acc=rnd(MOA.acc);
  const col=(c,i)=>/흰|회색|검정|베이지|청|스트라이프|체크|데님/.test(i)?i:`${c} ${i}`;
  const parts=[col(c1,top),col(c2,bottom)];
  if(outer!=='없음')parts.push(col(rnd(['차콜','네이비','베이지','카키','블랙']),outer));
  parts.push(shoes);if(acc!=='없음')parts.push(acc);
  return `수수한 꾸안꾸 — ${parts.join(', ')}`;
}
const LAST_MOA_KEY='chat2img_codex_last_moa';
function pickMoaOutfit(){
  let last='';try{last=localStorage.getItem(LAST_MOA_KEY)||'';}catch(e){}
  let pick=makeMoaOutfit();let g=0;while(pick===last&&g++<5)pick=makeMoaOutfit();
  try{localStorage.setItem(LAST_MOA_KEY,pick);}catch(e){}
  return pick;
}
// =====================================================

// 대화에 이 단어가 있으면 의상 랜덤을 건너뜀 (대화 속 옷 우선)
// '#옷지정'을 추가 지시에 쓰면 그 장면만 내가 정한 옷으로 (예: #옷지정 카야 의상: 버건디 니트 원피스)
const SKIP_WORDS=['메이드복','환자복','병원복','교복'];
// 코냅샷 장르가 로판·시대물이면 건너뜀 (현대 옷 방지)
const SKIP_GENRES=['Romance-fantasy setting','Historical period setting'];
// 추가 지시 칸에 이 단어를 적어두면 그 동안은 랜덤 끔
const OFF_WORD='#옷고정';
// =====================================================

if(window.__C2I_CODEX_BUNDLED_BOOTING__)return;
if(window.__C2I_CODEX_AUTOLOADED__&&window.__CHAT2IMG_CODEX__&&document.getElementById('chat2img-codex-root')){collapsePanel(1);return;}
window.__C2I_CODEX_BUNDLED_BOOTING__=true;
window.__C2I_CODEX_AUTOLOADED__=true;

const ua=navigator.userAgent||'';
const isMobile=/iPhone|iPad|iPod/.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const SERVER_URL=isMobile?MOBILE_URL:MAC_URL;

try{
  const K='chat2img_codex_state_v2';
  const s=JSON.parse(localStorage.getItem(K)||'{}');
  s.baseUrl=SERVER_URL;
  localStorage.setItem(K,JSON.stringify(s));
}catch(e){}

// ===== 의상 조합 생성 =====
const LAST_KEY='chat2img_codex_last_outfit';
const LAST_STYLE_KEY='chat2img_codex_last_style';
function rnd(arr){return arr[Math.floor(Math.random()*arr.length)];}
function twoColors(){
  const a=rnd(COLORS);let b=rnd(COLORS);
  let guard=0;while((b===a||(a==='블랙'&&b==='블랙'))&&guard++<10)b=rnd(COLORS);
  if(a==='블랙'&&b==='블랙')b='아이보리';
  return [a,b];
}
function pickStyle(){
  let last='';try{last=localStorage.getItem(LAST_STYLE_KEY)||'';}catch(e){}
  const names=Object.keys(STYLES).filter(n=>n!==last);
  const name=rnd(names.length?names:Object.keys(STYLES));
  try{localStorage.setItem(LAST_STYLE_KEY,name);}catch(e){}
  return name;
}
const OUTER_COLORS=['블랙','차콜','그레이','네이비','베이지','카멜','아이보리','브라운'];
function withColor(color,item){return hasOwnColor(item)?item:`${color} ${item}`;}
function makeOutfit(){
  const styleName=pickStyle();
  const st=STYLES[styleName];
  const [c1,c2]=twoColors();
  const bottom=rnd(st.bottom);
  const isDress=/원피스/.test(bottom);
  const outer=rnd(st.outer);
  const shoes=rnd(st.shoes);
  let parts=[];
  if(isDress){parts.push(withColor(c1,bottom));}
  else{parts.push(withColor(c1,rnd(st.top)),withColor(c2,bottom));}
  if(outer!=='없음'){
    const c3=rnd(OUTER_COLORS.filter(c=>c!==c1&&c!==c2))||'베이지';
    parts.push(withColor(c3,outer));
  }
  parts.push(shoes);
  const acc=rnd(st.acc||['없음']);
  if(acc!=='없음')parts.push(acc);
  return `${styleName} 룩 — ${parts.join(', ')}`;
}
function pickOutfit(){
  let last='';
  try{last=localStorage.getItem(LAST_KEY)||'';}catch(e){}
  let pick=makeOutfit();let guard=0;
  while(pick===last&&guard++<5)pick=makeOutfit();
  try{localStorage.setItem(LAST_KEY,pick);}catch(e){}
  return pick;
}
// ===== 윤이 전용 풀 (고정 프롬프트에 '윤이'가 있을 때만 작동) =====
// 토끼 수인, 190cm 슬렌더. 수트 없음. 아메카지 + 프레피, 캐주얼하고 귀엽게. 과하지 않게
const YUNI_COLORS=['아이보리','오프화이트','크림','오트밀','베이지','카키','올리브','네이비','차콜','연회색','브라운','머스타드','버건디','스카이블루','세이지'];
const YUNI_STYLES={
  아메카지:{
    top:['헨리넥 긴팔 티','포켓 반팔 티','와플 니트 티','오버핏 옥스포드 셔츠','체크 플란넬 셔츠','두꺼운 코튼 맨투맨','피셔맨 니트','크루넥 스웨트셔츠','보더 롱슬리브 티','라운드 카디건','하프집업 플리스','그래픽 반팔 티','레이어드 롱슬리브 티','하프집업 니트','오버핏 스트라이프 셔츠','체크 셔츠 위 크루넥 니트'],
    bottom:['진청 스트레이트 데님','카키 퍼티그 팬츠','베이커 팬츠','코듀로이 팬츠','치노 팬츠','카펜터 팬츠','코튼 이지 팬츠','진청 배럴 데님','그레이 와이드 스웻 팬츠'],
    outer:['초어 재킷','코듀로이 재킷','헌팅 재킷','M-65 필드 재킷','코튼 커버올','다운 베스트','보아 플리스 재킷','덕 캔버스 재킷','없음','없음','없음','니트 집업 카디건','나일론 아노락'],
    shoes:['캔버스 스니커즈','레드윙 스타일 워크부츠','클락스 왈라비','가죽 데크슈즈','뉴발란스 스니커즈','하이탑 스니커즈'],
    acc:['캔버스 토트백','니트 비니(토끼 귀가 밖으로 나오게)','반다나','없음','없음','없음'],
  },
  프레피:{
    top:['케이블 니트 베스트와 옥스포드 셔츠 레이어드','럭비 셔츠','폴로 셔츠','브이넥 니트 카디건','크루넥 니트','스트라이프 버튼다운 셔츠','셔츠 위 크루넥 니트 레이어드','카라 니트 폴로','케이블 크루넥 니트','코튼 니트 폴로','옥스포드 셔츠 위 브이넥 니트','스트라이프 럭비 셔츠','크리켓 니트'],
    bottom:['베이지 치노 팬츠','네이비 슬랙스','코듀로이 팬츠','플리츠 치노','그레이 울 팬츠'],
    outer:['네이비 더플코트','스타디움 재킷','니트 카디건','울 피코트','없음','없음','없음','울 발마칸 코트','코튼 맥코트','니트 집업 카디건'],
    shoes:['페니 로퍼','화이트 테니스 스니커즈','캔버스 스니커즈','보트슈즈','가죽 더비','브라운 스웨이드 로퍼','뉴발란스 스니커즈'],
    acc:['캔버스 토트백','가죽 숄더백','니트 머플러','없음','없음','없음'],
  },
  캐주얼:{
    top:['오버핏 후드티','루즈핏 맨투맨','오버핏 반팔 티','보트넥 니트','오버핏 니트','리브 긴팔 티','오버핏 셔츠','집업 후드','그래픽 맨투맨','하프집업 스웨트셔츠','오버핏 스트라이프 롱슬리브','와플 긴팔 티'],
    bottom:['진청 와이드 데님','스웻 팬츠','와이드 코튼 팬츠','카고 팬츠','진청 스트레이트 데님','진청 배럴 데님','나일론 와이드 팬츠'],
    outer:['오버핏 가디건','숏 패딩','플리스 재킷','오버핏 셔츠 재킷','없음','없음','없음','나일론 바람막이','보아 플리스 재킷','오버핏 니트 가디건'],
    shoes:['캔버스 스니커즈','청키 스니커즈','슬립온','뮬'],
    acc:['에코백','크로스백','없음','없음','없음'],
  },
};
const YUNI_RULE='. 윤이는 키 190cm의 마르고 길쭉한 슬렌더 체형이라 옷이 살짝 여유 있게 떨어지고 소매나 기장이 길어 보이게 입는다. 캐주얼하고 귀여운 분위기, 과하게 꾸미지 않은 담백한 조합. 수트, 정장, 넥타이, 블레이저 정장 차림, 가죽 라이더 재킷, 체인, 큰 로고, 알록달록한 조잡한 조합, 근육이 드러나는 딱 붙는 옷은 금지. 토끼 귀와 꼬리는 원래 설정대로 유지하고, 모자를 쓰면 토끼 귀가 모자 밖으로 나온다.';
function yuniSeason(scene){
  if(/여름|더운|더워|폭염|바다|해변|수영장|에어컨|반팔|장마/.test(scene))return'summer';
  if(/겨울|눈 오|눈이|추워|추운|영하|패딩|크리스마스|연말|입김/.test(scene))return'winter';
  return'mid';
}
function yuniWithColor(c,item){return /데님|청|생지|샴브레이|체크|스트라이프|보더|아가일|카키|네이비|베이지|그레이|화이트|레드윙|클락스|뉴발란스|코듀로이|덕 캔버스|M-65/.test(item)?item:`${c} ${item}`;}
function makeYuniOutfit(scene){
  const season=yuniSeason(scene||'');
  const name=rnd(Object.keys(YUNI_STYLES));const st=YUNI_STYLES[name];
  const c1=rnd(YUNI_COLORS);let c2=rnd(YUNI_COLORS);let g=0;while(c2===c1&&g++<5)c2=rnd(YUNI_COLORS);
  let top=rnd(st.top),bottom=rnd(st.bottom),outer=rnd(st.outer);
  if(season==='summer'){
    top=rnd(['포켓 반팔 티','오버핏 반팔 티','폴로 셔츠','린넨 셔츠','반팔 옥스포드 셔츠','헨리넥 반팔 티']);
    bottom=rnd(['와이드 코튼 팬츠','린넨 와이드 팬츠','얇은 치노 팬츠','린넨 이지 팬츠']);
    outer='없음';
  }else if(season==='winter'&&outer==='없음'){
    outer=rnd(['네이비 더플코트','숏 패딩','보아 플리스 재킷','울 피코트','다운 베스트']);
  }
  const c3=rnd(['네이비','차콜','올리브','카키','베이지','브라운','크림']);
  const parts=[yuniWithColor(c1,top),yuniWithColor(c2,bottom)];
  if(outer!=='없음')parts.push(yuniWithColor(c3,outer));
  parts.push(rnd(st.shoes));
  const acc=rnd(st.acc);if(acc!=='없음')parts.push(acc);
  return `${name} 룩 — ${parts.join(', ')}`;
}
const LAST_YUNI_KEY='chat2img_codex_last_yuni';
function pickYuniOutfit(scene){
  let last='';try{last=localStorage.getItem(LAST_YUNI_KEY)||'';}catch(e){}
  let pick=makeYuniOutfit(scene);let g=0;while(pick===last&&g++<5)pick=makeYuniOutfit(scene);
  try{localStorage.setItem(LAST_YUNI_KEY,pick);}catch(e){}
  return pick;
}
// =====================================================

// ===== 잠옷·수영복 장면 전용 풀 (대화에 잠옷/수영복 관련 단어가 있을 때) =====
function specialScene(scene){
  if(/수영복|비키니|수영장|해수욕|워터파크|래시가드|물놀이/.test(scene))return'swim';
  if(/잠옷|파자마|잘 준비|잠자리에|자기 전/.test(scene))return'sleep';
  return null;
}
const F_SLEEP={
  color:['아이보리','샴페인','크림','블랙','네이비','더스티 핑크','스카이블루','세이지','버건디','연회색','라벤더'],
  item:['실크 파자마 셋업(긴팔 셔츠+긴바지)','실크 파자마 셋업(반팔 셔츠+쇼츠)','새틴 슬립 원피스','새틴 캐미솔과 새틴 쇼츠','캐시미어 니트 라운지 셋업','코튼 셔츠형 파자마 셋업','리브 니트 탱크와 니트 쇼츠','오버핏 셔츠 하나만 입음','파이핑 들어간 코튼 파자마','와플 니트 라운지 셋업'],
  extra:['위에 같은 톤 실크 가운 걸침','위에 니트 가디건 걸침','머리에 실크 안대 올림','실내 슬리퍼','맨발','긴 머리 낮게 하나로 묶음','없음','없음'],
};
const F_SWIM={
  color:['블랙','화이트','아이보리','네이비','버건디','초콜릿 브라운','올리브','스카이블루','레드','샌드'],
  item:['스퀘어넥 원피스 수영복','하이컷 원피스 수영복','백리스 원피스 수영복','홀터넥 원피스 수영복','트라이앵글 비키니','반두 비키니','하이웨이스트 비키니','스포티한 크롭 탱크 비키니'],
  cover:['위에 오버핏 린넨 셔츠 걸침','시스루 랩스커트','크로셰 니트 커버업 원피스','허리에 실크 스카프 둘러 묶음','긴 비치 가운','없음','없음','없음'],
  acc:['선글라스','스트랩 샌들','플립플랍','라탄 백','없음','없음'],
};
const F_SLEEP_RULE='. 부유하고 세련된 취향이라 잠옷도 고급스럽고 예쁘게. 유아틱한 캐릭터 잠옷, 수면 바지, 늘어난 티셔츠, 큰 로고는 금지.';
const F_SWIM_RULE='. 세련되고 고급스러운 리조트 룩. 과하게 노출이 심하거나 유치한 무늬, 큰 로고는 금지.';
function makeFemaleSpecial(kind){
  if(kind==='sleep'){
    const parts=[`${rnd(F_SLEEP.color)} ${rnd(F_SLEEP.item)}`];const e=rnd(F_SLEEP.extra);if(e!=='없음')parts.push(e);
    return `잠옷 — ${parts.join(', ')}`;
  }
  const parts=[`${rnd(F_SWIM.color)} ${rnd(F_SWIM.item)}`];
  const c=rnd(F_SWIM.cover);if(c!=='없음')parts.push(c);
  const a=rnd(F_SWIM.acc);if(a!=='없음')parts.push(a);
  return `수영복 — ${parts.join(', ')}`;
}
const Y_SLEEP={
  color:['네이비','스카이블루','크림','연회색','세이지','베이지','오트밀','차콜','버건디'],
  item:['체크 코튼 파자마 셋업','스트라이프 코튼 파자마 셋업','오버핏 반팔 티와 스웻 쇼츠','와플 긴팔 티와 스웻 팬츠','오버핏 후드와 조거 팬츠','니트 라운지 셋업','오버핏 맨투맨과 체크 파자마 바지','헨리넥 긴팔과 코튼 이지 팬츠'],
  extra:['흰 양말','실내 슬리퍼','맨발','어깨에 담요 두름','없음','없음'],
};
const Y_SWIM={
  color:['네이비','스카이블루','올리브','크림','베이지','버건디','블랙','민트'],
  item:['무지 보드쇼츠','스트라이프 보드쇼츠','하와이안 패턴 보드쇼츠','짧은 스윔 쇼츠','무릎 길이 스윔 쇼츠'],
  top:['래시가드','앞섶 연 하와이안 셔츠','앞섶 연 린넨 셔츠','없음','없음'],
  acc:['선글라스','슬라이드 샌들','목에 수건','없음','없음'],
};
const Y_SLEEP_RULE='. 편하고 귀엽게. 190cm 슬렌더라 옷이 살짝 여유 있게. 토끼 귀와 꼬리는 원래대로 유지하고 꼬리는 옷 밖으로 나온다.';
const Y_SWIM_RULE='. 190cm 슬렌더 체형 그대로, 근육을 과장하지 않는다. 토끼 귀와 꼬리는 원래대로 유지하고 꼬리는 수영복 밖으로 나온다.';
function makeYuniSpecial(kind){
  if(kind==='sleep'){
    const parts=[`${rnd(Y_SLEEP.color)} ${rnd(Y_SLEEP.item)}`];const e=rnd(Y_SLEEP.extra);if(e!=='없음')parts.push(e);
    return `잠옷 — ${parts.join(', ')}`;
  }
  const parts=[`${rnd(Y_SWIM.color)} ${rnd(Y_SWIM.item)}`];
  const t=rnd(Y_SWIM.top);if(t!=='없음')parts.push(`${rnd(['화이트','크림','네이비','스카이블루','올리브'])} ${t}`);
  const a=rnd(Y_SWIM.acc);if(a!=='없음')parts.push(a);
  return `수영복 — ${parts.join(', ')}`;
}
// =====================================================

const CAR_RULE='\n\n차 안 장면일 때: 앞 유리 밖에서 정면으로 들여다보는 구도는 절대 금지(핸들 엠블럼이 정면으로 보이는 구도). 반드시 둘 중 하나로 찍는다. 1) 뒷좌석에서 앞좌석 두 사람의 뒷모습·옆얼굴을 찍는 구도. 2) 옆 창문 쪽에서 비스듬하게 찍는 구도.';
const NO_BUCKET='\n\n모든 인물(남녀 모두): 버킷햇(벙거지 모자), 볼캡(야구 모자), 데님 재킷, 데님 베스트, 데님 치마(청치마), 데님 셔츠, 데님 반바지, 연청·흑청·물 빠진 워싱 데님·해진 데님(청바지는 진청이나 깨끗한 원톤 중청만 허용), 반바지·쇼츠(수영복·잠옷 제외), 아가일 무늬 옷, 블루종·봄버 재킷·해링턴 재킷·코치 재킷 같은 허리 밴드 짧은 집업 점퍼는 절대 입히지 않는다.'+CAR_RULE;
// ===== 이지수 전용 풀 (고정 프롬프트에 '이지수'가 있을 때만 작동) =====
// 20살 대학생, 188cm. 밖에서는 단정한 모범생 프레피, 평소엔 깔끔한 캐주얼, 집에서는 편한 차림
const JISU_COLORS=['화이트','오프화이트','크림','아이보리','베이지','오트밀','연회색','그레이','차콜','네이비','스카이블루','카멜','브라운','세이지','버건디'];
const JISU_STYLES={
  프레피:{
    top:['옥스포드 버튼다운 셔츠','케이블 니트 베스트와 옥스포드 셔츠 레이어드','셔츠 위 크루넥 니트 레이어드','브이넥 니트 카디건과 셔츠','럭비 셔츠','카라 니트 폴로','스트라이프 버튼다운 셔츠','케이블 크루넥 니트','셔츠 위 브이넥 니트','크리켓 니트'],
    bottom:['베이지 치노 팬츠','네이비 슬랙스','그레이 울 슬랙스','플리츠 치노','코듀로이 팬츠'],
    outer:['네이비 더플코트','울 블레이저(캐주얼 단독)','코튼 맥코트','니트 카디건','울 발마칸 코트','스타디움 재킷','없음','없음','없음'],
    shoes:['페니 로퍼','브라운 스웨이드 로퍼','화이트 테니스 스니커즈','가죽 더비','캔버스 스니커즈'],
    acc:['가죽 백팩','캔버스 토트백','얇은 실버 시계','가죽 스트랩 시계','니트 머플러','없음','없음','없음'],
  },
  캐주얼:{
    top:['오버핏 맨투맨','오버핏 후드티','오버핏 반팔 티','보트넥 니트','루즈핏 니트','하프집업 스웨트셔츠','스트라이프 롱슬리브 티','오버핏 셔츠','와플 긴팔 티','그래픽 반팔 티'],
    bottom:['진청 와이드 데님','진청 스트레이트 데님','진청 배럴 데님','와이드 코튼 팬츠','카고 팬츠','스웻 팬츠','나일론 와이드 팬츠'],
    outer:['오버핏 가디건','숏 패딩','플리스 재킷','바람막이','니트 집업 카디건','없음','없음','없음'],
    shoes:['캔버스 스니커즈','청키 스니커즈','뉴발란스 스니커즈','슬립온','화이트 스니커즈'],
    acc:['에코백','크로스백','백팩','없음','없음','없음'],
  },
};
const JISU_HOME={
  top:['소매가 손등까지 내려오는 오버핏 후드티','오버핏 맨투맨','루즈한 니트','헐렁한 반팔 티','와플 긴팔 티','집업 후드'],
  bottom:['스웻 팬츠','체크 파자마 바지','코튼 이지 팬츠','트레이닝 팬츠'],
  extra:['흰 양말','실내 슬리퍼','맨발','없음','없음'],
};
const JISU_RULE='. 이지수는 20살 대학생, 키 188cm. 밖에서는 단정하고 깔끔한 모범생처럼 보이게 입고, 집에서는 헐렁하고 편한 차림이다. 깔끔하고 귀여운 분위기, 과하게 꾸미지 않은 담백한 조합. 수트, 정장, 넥타이, 가죽 라이더 재킷, 체인, 큰 로고, 알록달록한 조잡한 조합, 근육이 드러나는 딱 붙는 옷은 금지.';
function jisuWithColor(c,item){return /데님|청|체크|스트라이프|카키|네이비|베이지|그레이|화이트|코듀로이|파자마|흰|그래픽|뉴발란스|럭비|크리켓/.test(item)?item:`${c} ${item}`;}
function makeJisuOutfit(scene){
  const sc=scene||'';
  const c1=rnd(JISU_COLORS);let c2=rnd(JISU_COLORS);let g=0;while(c2===c1&&g++<5)c2=rnd(JISU_COLORS);
  if(/집에서|집 안|집안|거실|침실|침대|소파|부엌|주방|방 안|자기 방/.test(sc)&&!/외출|나가|학교|캠퍼스|강의|카페|식당/.test(sc)){
    const parts=[jisuWithColor(c1,rnd(JISU_HOME.top)),jisuWithColor(c2,rnd(JISU_HOME.bottom))];
    const e=rnd(JISU_HOME.extra);if(e!=='없음')parts.push(e);
    return `집 편한 차림 — ${parts.join(', ')}`;
  }
  const season=/여름|더운|더워|폭염|바다|해변|반팔|장마/.test(sc)?'summer':/겨울|눈 오|눈이|추워|추운|영하|패딩|크리스마스|연말|입김/.test(sc)?'winter':'mid';
  const name=/학교|캠퍼스|강의|도서관|과제|시험|교수|수업/.test(sc)?(Math.random()<0.7?'프레피':'캐주얼'):rnd(Object.keys(JISU_STYLES));
  const st=JISU_STYLES[name];
  let top=rnd(st.top),bottom=rnd(st.bottom),outer=rnd(st.outer);
  if(season==='summer'){
    top=rnd(['반팔 옥스포드 셔츠','폴로 셔츠','오버핏 반팔 티','린넨 셔츠','반팔 니트 폴로','그래픽 반팔 티']);
    bottom=rnd(['와이드 코튼 팬츠','린넨 와이드 팬츠','얇은 치노 팬츠','린넨 이지 팬츠']);
    outer='없음';
  }else if(season==='winter'){
    let g2=0;while(/반팔/.test(top)&&g2++<10)top=rnd(st.top);
    g2=0;while(/쇼츠|하프 팬츠/.test(bottom)&&g2++<10)bottom=rnd(st.bottom);
    if(outer==='없음')outer=rnd(['네이비 더플코트','숏 패딩','울 발마칸 코트','플리스 재킷']);
  }
  const parts=[jisuWithColor(c1,top),jisuWithColor(c2,bottom)];
  if(outer!=='없음')parts.push(jisuWithColor(rnd(['네이비','차콜','카멜','베이지','크림','그레이','브라운']),outer));
  parts.push(rnd(st.shoes));
  const acc=rnd(st.acc);if(acc!=='없음')parts.push(acc);
  return `${name} 룩 — ${parts.join(', ')}`;
}
const LAST_JISU_KEY='chat2img_codex_last_jisu';
function pickJisuOutfit(scene){
  let last='';try{last=localStorage.getItem(LAST_JISU_KEY)||'';}catch(e){}
  let pick=makeJisuOutfit(scene);let g=0;while(pick===last&&g++<5)pick=makeJisuOutfit(scene);
  try{localStorage.setItem(LAST_JISU_KEY,pick);}catch(e){}
  return pick;
}
const J_SLEEP_RULE='. 20살 대학생답게 편하고 헐렁한 잠옷. 키 188cm.';
const J_SWIM_RULE='. 20살 대학생, 키 188cm. 근육을 과장하지 않는다.';

// ===== 서담윤 전용 풀 (고정 프롬프트에 '서담윤'이 있을 때만 작동) =====
// 담비 수인 A급 가이드, 190cm 넘는 장신. 임무·센터에서는 흰 전투복, 평소엔 체격이 커 보이는 오버핏 사복.
const DAMYOON_MISSION_RE=/임무|작전|출동|센터|훈련|가이딩|게이트|토벌|현장|브리핑|전투|던전|순찰|대기실|의무실/;
const DAMYOON_UNIFORM=[
  '흰색 하이넥 전투 슈트(몸에 맞게 떨어지는 매끈한 소재), 가슴을 가로지르는 흰 하네스 스트랩과 은색 버클, 흰 전술 장갑',
  '흰색 하이넥 전투 슈트 위 흰색 경량 전술 아머(어깨·가슴 보호대), 허리 전술 벨트, 흰 전술 장갑',
  '흰색 하이넥 전투 슈트 위 회색 택티컬 베스트(가슴 파우치), 흰 전술 장갑, 전술 벨트',
  '소매를 걷은 흰 셔츠 위 올리브색 플레이트 캐리어, 올리브 카고 팬츠, 검정 전술 시계',
  '검정 하이넥 이너 위 흰색 센터 제복 재킷(어깨 계급장), 슬림 전투 팬츠, 컴뱃 부츠',
];
const DAMYOON_COLORS=['블랙','차콜','그레이','오프화이트','크림','네이비','카멜','다크 브라운','올리브','버건디'];
const DAMYOON_OFF={
  top:['오버핏 헤비 코튼 티셔츠','두툼한 케이블 니트','오버핏 옥스포드 셔츠','헤비 코튼 크루넥 맨투맨','리브 하이넥 니트','오버핏 헨리넥 티','오버핏 니트 폴로','와플 긴팔 티'],
  bottom:['와이드 슬랙스','와이드 치노 팬츠','진청 와이드 데님','깨끗한 원톤 중청 와이드 데님','카고 팬츠','울 와이드 팬츠'],
  outer:['오버핏 레더 재킷','두꺼운 울 오버코트','무톤 재킷','오버핏 워크 재킷','오버핏 블레이저(캐주얼 단독)','오버핏 니트 카디건','없음','없음','없음'],
  shoes:['첼시 부츠','컴뱃 부츠','블랙 더비','화이트 스니커즈','스웨이드 로퍼'],
  acc:['가죽 스트랩 시계','얇은 실버 반지','블랙 레더 벨트','없음','없음','없음'],
};
const DAMYOON_HOME={
  top:['오버핏 반팔 티','헐렁한 맨투맨','루즈한 니트','와플 긴팔 티','오버핏 후드티'],
  bottom:['스웻 팬츠','코튼 이지 팬츠','트레이닝 팬츠'],
  extra:['맨발','실내 슬리퍼','없음','없음'],
};
const DAMYOON_RULE='. 서담윤은 190cm가 넘는 장신에 넓은 어깨와 단단한 체격이다. 사복은 입히지 않고 항상 센터 전투복을 입힌다. 머리 위 담비 귀와 길고 풍성한 갈색 꼬리는 항상 보이게 그리고, 꼬리는 옷 밖으로 나온다. 큰 로고, 알록달록한 조잡한 조합, 귀여운 캐릭터 프린트는 금지.';
const D_SLEEP_RULE='. 190cm가 넘는 장신, 넓은 어깨. 담비 귀와 꼬리는 원래대로 유지하고 꼬리는 옷 밖으로 나온다.';
const D_SWIM_RULE='. 190cm가 넘는 장신, 넓은 어깨와 단단한 체격. 담비 귀와 꼬리는 원래대로 유지하고 꼬리는 수영복 밖으로 나온다.';
function damyoonWithColor(c,item){return /데님|청|레더|무톤/.test(item)?item:`${c} ${item}`;}
function makeDamyoonOutfit(scene){
  const sc=scene||'';
  return `센터 전투복 — ${rnd(DAMYOON_UNIFORM)}`; // 사복 없음: 항상 전투복
  const c1=rnd(DAMYOON_COLORS);let c2=rnd(DAMYOON_COLORS);let g=0;while(c2===c1&&g++<5)c2=rnd(DAMYOON_COLORS);
  if(/집에서|집 안|집안|거실|침실|침대|소파|부엌|주방|방 안|숙소/.test(sc)&&!/외출|나가|카페|식당|데이트/.test(sc)){
    const parts=[`${c1} ${rnd(DAMYOON_HOME.top)}`,`${c2} ${rnd(DAMYOON_HOME.bottom)}`];
    const e=rnd(DAMYOON_HOME.extra);if(e!=='없음')parts.push(e);
    return `집 편한 차림 — ${parts.join(', ')}`;
  }
  const season=/여름|더운|더워|폭염|바다|해변|반팔|장마/.test(sc)?'summer':/겨울|눈 오|눈이|추워|추운|영하|패딩|크리스마스|연말|입김/.test(sc)?'winter':'mid';
  let top=rnd(DAMYOON_OFF.top),bottom=rnd(DAMYOON_OFF.bottom),outer=rnd(DAMYOON_OFF.outer);
  if(season==='summer'){
    top=rnd(['오버핏 헤비 코튼 티셔츠','오버핏 린넨 셔츠','반팔 니트 폴로','오버핏 반팔 셔츠']);
    bottom=rnd(['와이드 코튼 팬츠','린넨 와이드 팬츠','얇은 와이드 치노']);
    outer='없음';
  }else if(season==='winter'&&outer==='없음'){
    outer=rnd(['두꺼운 울 오버코트','무톤 재킷','오버핏 레더 재킷']);
  }
  const parts=[damyoonWithColor(c1,top),damyoonWithColor(c2,bottom)];
  if(outer!=='없음')parts.push(damyoonWithColor(rnd(['블랙','차콜','카멜','다크 브라운','그레이']),outer));
  parts.push(rnd(DAMYOON_OFF.shoes));
  const acc=rnd(DAMYOON_OFF.acc);if(acc!=='없음')parts.push(acc);
  return `사복 — ${parts.join(', ')}`;
}
const LAST_DAMYOON_KEY='chat2img_codex_last_damyoon';
function pickDamyoonOutfit(scene){
  let last='';try{last=localStorage.getItem(LAST_DAMYOON_KEY)||'';}catch(e){}
  let pick=makeDamyoonOutfit(scene);let g=0;while(pick===last&&g++<5)pick=makeDamyoonOutfit(scene);
  try{localStorage.setItem(LAST_DAMYOON_KEY,pick);}catch(e){}
  return pick;
}
// ===== 선우현 전용 풀 (고정 프롬프트에 '선우현'이 있을 때만 작동) =====
// 26살 미술 강사, 181cm 마른 체형, 전동휠체어 사용. 부드럽고 차분한 담백한 옷, 앉은 자세에 맞는 여유 있는 핏.
const WOOHYUN_COLORS=['오트밀','크림','아이보리','베이지','카멜','브라운','그레이','차콜','네이비','세이지','블랙','오프화이트'];
const WOOHYUN_OUT={
  top:['오버핏 브이넥 니트','크루넥 캐시미어 니트','옥스포드 셔츠','린넨 셔츠','셔츠 위 크루넥 니트 레이어드','셔츠 위 무지 니트 베스트','하이넥 니트','헨리넥 긴팔 티','오버핏 맨투맨','브이넥 니트 카디건과 흰 티'],
  bottom:['와이드 코튼 팬츠','울 슬랙스','코듀로이 와이드 팬츠','와이드 치노 팬츠','진청 와이드 데님','린넨 혼방 팬츠'],
  outer:['니트 가디건','숄칼라 가디건','싱글 울 코트','코튼 맥코트','오버핏 셔츠 재킷','없음','없음','없음'],
  shoes:['부드러운 가죽 로퍼','스웨이드 로퍼','캔버스 스니커즈','화이트 스니커즈','첼시 부츠'],
  acc:['가죽 스트랩 시계','얇은 실버 반지','없음','없음','없음'],
};
const WOOHYUN_HOME={
  top:['헐렁한 니트','오버핏 맨투맨','부드러운 긴팔 티','니트 가디건과 흰 티','오버핏 후드티'],
  bottom:['코튼 이지 팬츠','스웻 팬츠','니트 조거 팬츠'],
  extra:['무릎 담요','흰 양말','없음','없음'],
};
const WOOHYUN_RULE='. 선우현은 26살 미술 강사, 181cm에 다소 마른 체형. 부드럽고 차분한 분위기의 담백한 옷. 항상 전동휠체어에 앉아 있으므로 앉은 자세에서 자연스럽게 떨어지는 여유 있는 핏으로 그린다. 수트, 넥타이, 가죽 라이더 재킷, 체인, 큰 로고, 알록달록한 조잡한 조합, 운동복 차림은 금지.';
const W_SLEEP_RULE='. 181cm에 다소 마른 체형. 하반신마비라 다리에 힘이 없는 자세로 자연스럽게 그린다.';
const W_SWIM_RULE='. 181cm에 다소 마른 체형. 하반신마비라 서 있지 않는다. 물가나 휠체어에 앉은 자세로 그린다.';
function woohyunWithColor(c,item){return /데님|흰/.test(item)?item:`${c} ${item}`;}
function makeWoohyunOutfit(scene){
  const sc=scene||'';
  const c1=rnd(WOOHYUN_COLORS);let c2=rnd(WOOHYUN_COLORS);let g=0;while(c2===c1&&g++<5)c2=rnd(WOOHYUN_COLORS);
  if(/집에서|집 안|집안|거실|침실|침대|소파|부엌|주방|방 안/.test(sc)&&!/외출|나가|카페|식당|학원|데이트/.test(sc)){
    const parts=[woohyunWithColor(c1,rnd(WOOHYUN_HOME.top)),woohyunWithColor(c2,rnd(WOOHYUN_HOME.bottom))];
    const e=rnd(WOOHYUN_HOME.extra);if(e!=='없음')parts.push(e);
    return `집 편한 차림 — ${parts.join(', ')}`;
  }
  const season=/여름|더운|더워|폭염|바다|해변|반팔|장마/.test(sc)?'summer':/겨울|눈 오|눈이|추워|추운|영하|패딩|크리스마스|연말|입김/.test(sc)?'winter':'mid';
  let top=rnd(WOOHYUN_OUT.top),bottom=rnd(WOOHYUN_OUT.bottom),outer=rnd(WOOHYUN_OUT.outer);
  if(season==='summer'){
    top=rnd(['린넨 셔츠','반팔 니트','오버핏 반팔 셔츠','헨리넥 반팔 티']);
    bottom=rnd(['린넨 혼방 팬츠','와이드 코튼 팬츠','얇은 와이드 치노']);
    outer='없음';
  }else if(season==='winter'&&outer==='없음'){
    outer=rnd(['싱글 울 코트','숄칼라 가디건','코튼 맥코트']);
  }
  const parts=[woohyunWithColor(c1,top),woohyunWithColor(c2,bottom)];
  if(outer!=='없음')parts.push(woohyunWithColor(rnd(['카멜','차콜','네이비','베이지','브라운','그레이']),outer));
  parts.push(rnd(WOOHYUN_OUT.shoes));
  if(season==='winter'&&Math.random()<0.5)parts.push('무릎 위에 덮은 부드러운 울 담요');
  if(/학원|화실|수업|그림 그리|붓|물감|캔버스|이젤/.test(sc))parts.push('옷 위에 물감이 살짝 묻은 리넨 앞치마');
  const acc=rnd(WOOHYUN_OUT.acc);if(acc!=='없음')parts.push(acc);
  return parts.join(', ');
}
const LAST_WOOHYUN_KEY='chat2img_codex_last_woohyun';
function pickWoohyunOutfit(scene){
  let last='';try{last=localStorage.getItem(LAST_WOOHYUN_KEY)||'';}catch(e){}
  let pick=makeWoohyunOutfit(scene);let g=0;while(pick===last&&g++<5)pick=makeWoohyunOutfit(scene);
  try{localStorage.setItem(LAST_WOOHYUN_KEY,pick);}catch(e){}
  return pick;
}
// 담윤 방에서 임무·센터 장면이면 여주(백호 센티넬)도 전투복
const F_SENTINEL_UNIFORM=[
  '흰색 하이넥 전투 슈트(몸에 맞게 떨어지는 매끈한 소재), 허리 전술 벨트, 검정 전술 장갑, 컴뱃 부츠',
  '검정 하이넥 전투 슈트 위 흰색 크롭 전술 재킷, 허리 전술 벨트, 컴뱃 부츠',
  '흰색 하이넥 전투 슈트 위 회색 경량 택티컬 베스트, 검정 전술 장갑, 컴뱃 부츠',
  '검정 하이넥 이너 위 흰색 센터 제복 재킷(어깨 계급장), 슬림 전투 팬츠, 롱 컴뱃 부츠',
];
const F_SENTINEL_RULE='. S급 센티넬다운 세련되고 날렵한 전투복. 사복은 입히지 않는다. 백호 귀와 꼬리는 원래대로 유지하고 꼬리는 옷 밖으로 나온다.';
// =====================================================

const _fetch=window.fetch;
window.fetch=function(input,init){
  try{
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(/\/generate(\?|$)/.test(url)&&init&&init.body&&typeof init.body==='string'){
      const body=JSON.parse(init.body);
      if(body&&typeof body.prompt==='string'){
        const p=body.prompt;
        // 대화 부분(Scene description 이후)에서만 건너뛰기 단어를 찾음 — 고정 프롬프트에 있는 단어는 무시
        const sceneIdx=p.indexOf('Scene description:');
        const sceneText=sceneIdx>=0?p.slice(sceneIdx):p;
        const off=p.includes(OFF_WORD)||p.includes('#옷지정');
        const skip=SKIP_WORDS.some(w=>sceneText.includes(w))||SKIP_GENRES.some(w=>p.includes(w));
        // 다이스케 방에서는 일반 현대 의상 풀 대신 1980년 전용 분기를 사용.
        const profileText=sceneIdx>=0?p.slice(0,sceneIdx):p;
        const daisukeRoom=/다이스케|\bDaisuke\b/i.test(profileText);
        if(daisukeRoom){
          body.prompt=buildDV1980Prompt(p,sceneIdx>=0?sceneText:'',off||dv1980KeepSceneClothes(sceneIdx>=0?'':p));
          init={...init,body:JSON.stringify(body)};
        }else if(!off&&!skip&&specialScene(sceneText)&&!(sceneIdx>=0?p.slice(0,sceneIdx):p).includes('최모아')){
          // 잠옷·수영복 장면: 여주와 윤이만 전용 풀에서 랜덤. 다른 남캐는 대화 그대로
          const kind=specialScene(sceneText);
          const head=sceneIdx>=0?p.slice(0,sceneIdx):p;
          const fo=makeFemaleSpecial(kind);
          let add='\n\n유저(여주) 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+fo+(kind==='sleep'?F_SLEEP_RULE:F_SWIM_RULE);
          console.log('[Chat2Img-Codex] 여주 '+kind+':',fo);
          if(head.includes('이지수')){
            const jo=makeYuniSpecial(kind).replace(/\(토끼 귀가 밖으로 나오게\)/g,'');
            add+='\n\n이지수 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+jo+(kind==='sleep'?J_SLEEP_RULE:J_SWIM_RULE);
            console.log('[Chat2Img-Codex] 이지수 '+kind+':',jo);
          }
          if(head.includes('선우현')){
            const wj=makeYuniSpecial(kind).replace(/\(토끼 귀가 밖으로 나오게\)/g,'');
            add+='\n\n선우현 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+wj+(kind==='sleep'?W_SLEEP_RULE:W_SWIM_RULE);
            console.log('[Chat2Img-Codex] 선우현 '+kind+':',wj);
          }
          if(head.includes('서담윤')){
            const dj=makeYuniSpecial(kind).replace(/\(토끼 귀가 밖으로 나오게\)/g,'');
            add+='\n\n서담윤 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+dj+(kind==='sleep'?D_SLEEP_RULE:D_SWIM_RULE);
            console.log('[Chat2Img-Codex] 서담윤 '+kind+':',dj);
          }
          if(/(^|[^담])윤이/.test(head)){
            const yo=makeYuniSpecial(kind);
            add+='\n\n윤이 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+yo+(kind==='sleep'?Y_SLEEP_RULE:Y_SWIM_RULE);
            console.log('[Chat2Img-Codex] 윤이 '+kind+':',yo);
          }
          body.prompt=p+add+NO_BUCKET;
          init={...init,body:JSON.stringify(body)};
        }else if(!off&&!skip&&!specialScene(sceneText)){
          let add='';
          if(p.includes('최모아')&&!p.includes('#모아업그레이드')){
            const mo=pickMoaOutfit();
            add='\n\n최모아 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+mo+MOA_RULE;
            console.log('[Chat2Img-Codex] 모아 의상:',mo);
          }else if(p.slice(0,sceneIdx>=0?sceneIdx:p.length).includes('서담윤')){
            const fu=rnd(F_SENTINEL_UNIFORM);
            add='\n\n유저(여주) 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): 임무복 — '+fu+F_SENTINEL_RULE;
            console.log('[Chat2Img-Codex] 여주 임무복:',fu);
          }else{
            const outfit=pickOutfit();
            add='\n\n유저(여주) 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+outfit+OUTFIT_RULE;
            console.log('[Chat2Img-Codex] 여주 의상:',outfit);
          }
          // 승재 방: 수트 장면이면 수트 스타일도 랜덤 (대화에 사복·환자복·잠옷 언급 있으면 건너뜀)
          if(p.includes('권승재')&&!/사복|캐주얼|니트|후드|티셔츠|잠옷|환자복|수영복|맨몸|상의 탈의/.test(sceneText)){
            const suit=pickSuit();
            add+='\n\n권승재 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+suit+SUIT_RULE+' 보조 스틱은 기존 규칙대로 유지.';
            console.log('[Chat2Img-Codex] 승재 수트:',suit);
          }
          // 구달 방: 수트 장면이면 수트 스타일 랜덤
          if(p.includes('구달')&&!/사복|캐주얼|후드|티셔츠|스웻|잠옷|환자복|수영복|맨몸|상의 탈의|메이드복/.test(sceneText)){
            const gs=pickGudalSuit();
            add+='\n\n구달 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+gs+GUDAL_RULE+' 문신 규칙은 기존대로 유지.';
            console.log('[Chat2Img-Codex] 구달 수트:',gs);
          }
          // 서무겸: 정장이 아닌 전용 워크웨어·캐주얼. 명시된 특수 의상과 옷 고정은 우선.
          const characterText=sceneIdx>=0?p.slice(0,sceneIdx):p;
          if(characterText.includes('서무겸')&&!/맨몸|상의\s*탈의|알몸|탈의 중|목욕|샤워/.test(sceneText)){
            const mg=pickMugyeomOutfit(sceneIdx>=0?sceneText:'');
            add+='\n\n서무겸 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+mg+MUGYEOM_RULE;
            console.log('[Chat2Img-Codex] 서무겸 의상:',mg);
          }
          // 설기: 상황에 맞춰 여러 스타일의 상·하의·아우터·신발을 각각 랜덤 조합.
          // 고정 외형 유지, 특수 의상/명시적 옷 고정/탈의 장면은 위 조건 또는 아래 조건으로 보호.
          if(characterText.includes('설기')&&!/맨몸|상의\s*탈의|알몸|탈의 중|목욕|샤워|속옷만|상체 노출/.test(sceneText)){
            const sg=pickSeolgiOutfit(sceneIdx>=0?sceneText:'');
            add+='\n\n설기 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+sg+SEOLGI_RULE;
            console.log('[Chat2Img-Codex] 설기 의상:',sg);
          }
          // 이지수: 프레피·캐주얼 랜덤 조합, 집에서는 편한 차림. 탈의·잠옷 등 장면은 건너뜀
          if(characterText.includes('이지수')&&!/맨몸|상의\s*탈의|알몸|탈의 중|목욕|샤워|속옷만|잠옷|파자마|수영복/.test(sceneText)){
            const jo=pickJisuOutfit(sceneIdx>=0?sceneText:'');
            add+='\n\n이지수 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+jo+JISU_RULE;
            console.log('[Chat2Img-Codex] 이지수 의상:',jo);
          }
          // 선우현: 부드럽고 차분한 담백한 옷, 휠체어에 앉은 핏
          if(characterText.includes('선우현')&&!/맨몸|상의\s*탈의|알몸|탈의 중|목욕|샤워|속옷만|잠옷|파자마|수영복/.test(sceneText)){
            const wh=pickWoohyunOutfit(sceneIdx>=0?sceneText:'');
            add+='\n\n선우현 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+wh+WOOHYUN_RULE;
            console.log('[Chat2Img-Codex] 선우현 의상:',wh);
          }
          // 서담윤: 임무·센터면 흰 전투복, 평소엔 오버핏 사복, 집에서는 편한 차림
          if(characterText.includes('서담윤')&&!/맨몸|상의\s*탈의|알몸|탈의 중|목욕|샤워|속옷만|잠옷|파자마|수영복|본체화|본체로/.test(sceneText)){
            const dy=pickDamyoonOutfit(sceneIdx>=0?sceneText:'');
            add+='\n\n서담윤 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+dy+DAMYOON_RULE;
            console.log('[Chat2Img-Codex] 서담윤 의상:',dy);
          }
          // 윤이: 아메카지·프레피·캐주얼 랜덤 조합. 탈의·잠옷 등 장면은 건너뜀
          if(/(^|[^담])윤이/.test(characterText)&&!/맨몸|상의\s*탈의|알몸|탈의 중|목욕|샤워|속옷만|잠옷|파자마|수영복/.test(sceneText)){
            const yo=pickYuniOutfit(sceneIdx>=0?sceneText:'');
            add+='\n\n윤이 의상 (대화 내용에 이 인물이 입은 옷이 나와 있으면 대화 속 옷을 그대로 그리고 아래는 무시한다. 대화에 옷 언급이 없을 때만 아래 옷을 입힌다): '+yo+YUNI_RULE;
            console.log('[Chat2Img-Codex] 윤이 의상:',yo);
          }
          body.prompt=p+add+NO_BUCKET;
          init={...init,body:JSON.stringify(body)};
        }
        // 옷 랜덤이 꺼진 장면(#옷고정, 메이드복 등)에도 버킷햇 금지는 항상 붙임
        if(!daisukeRoom&&!body.prompt.includes(NO_BUCKET)){
          body.prompt+=NO_BUCKET;
          init={...init,body:JSON.stringify(body)};
        }
      }
    }
  }catch(e){}
  return _fetch.call(this,input,init);
};
// =====================================================

// ===== 로드 후 패널 접기 (🎨 버튼만 남김) =====
function collapsePanel(tries){
  const api=window.__CHAT2IMG_CODEX__;
  const root=document.getElementById('chat2img-codex-root');
  const panel=root?.shadowRoot?.getElementById('panel');
  if(api&&panel){
    if(!panel.classList.contains('hidden')){try{api.toggle();}catch(e){panel.classList.add('hidden');}}
    return;
  }
  if(tries>0)setTimeout(()=>collapsePanel(tries-1),200);
}
// =====================================================

// 본체 0.2.5 내장: 외부 본체 스크립트 태그가 차단되거나 다운로드에 실패해도 UI를 생성.
// 대화 추출 보조 모듈과 이미지 생성 서버 연결은 기존 본체의 방식 그대로 유지.
const bootNotice=document.createElement('button');
bootNotice.id='chat2img-codex-boot-notice';
bootNotice.type='button';
bootNotice.textContent='🎨 Chat2Img 시작 중…';
bootNotice.setAttribute('role','status');
bootNotice.style.cssText='all:initial;position:fixed;right:16px;bottom:16px;z-index:2147483647;padding:10px 14px;border:1px solid #bbb;border-radius:10px;background:#fff;color:#222;font:13px/1.5 system-ui;box-shadow:0 2px 10px #0002;cursor:pointer;max-width:320px;white-space:pre-wrap;';
document.getElementById(bootNotice.id)?.remove();
document.documentElement.appendChild(bootNotice);
bootNotice.addEventListener('click',()=>{if(!window.__C2I_CODEX_BUNDLED_BOOTING__)location.reload();});
function reportBootFailure(error){
  window.__C2I_CODEX_AUTOLOADED__=false;
  window.__C2I_CODEX_BUNDLED_BOOTING__=false;
  const message=String(error?.message||error||'버튼 초기화를 완료하지 못했습니다.');
  bootNotice.textContent='🎨 Chat2Img 실행 실패\n'+message+'\n눌러서 새로고침';
  bootNotice.setAttribute('role','alert');
  console.error('[Chat2Img-Codex] 사용자 스크립트 초기화 실패',error);
}
// BEGIN BUNDLED CORE — https://chat2img.pages.dev/chat2img-codex.js (0.2.5)
const coreBoot=(async()=>{
  'use strict';
  try {
    console.log('[Chat2Img-Codex] boot');

    const KEY='__CHAT2IMG_CODEX__';
    const VERSION='0.2.6';
    const ROOT_ID='chat2img-codex-root';
    const RANGE_STYLE_ID='chat2img-codex-range-style';
    const ZETA_CHAT_DOM_URL='https://zetakit.pages.dev/tools/zeta-chat-dom.js';
    const STORE='chat2img_codex_state_v2';
    const HISTORY_STORE='chat2img_codex_history_v1';
    const HISTORY_LIMIT=30;
    const FAB_STORE='chat2img_codex_fab_pos_v1';

    if(window[KEY]?.version===VERSION){ window[KEY].toggle?.(); return; }
    if(window[KEY]){ try{window[KEY].destroy?.();}catch(_){} }
    document.getElementById(ROOT_ID)?.remove();
    document.getElementById(RANGE_STYLE_ID)?.remove();

    function ensureZetaChatDOM(){
      if(window.ZetaChatDOM?.extractRecords) return Promise.resolve(window.ZetaChatDOM);
      if(window.__CHAT2IMG_CODEX_ZETA_DOM_PROMISE__) return window.__CHAT2IMG_CODEX_ZETA_DOM_PROMISE__;
      window.__CHAT2IMG_CODEX_ZETA_DOM_PROMISE__=new Promise(resolve=>{
        const done=()=>resolve(window.ZetaChatDOM?.extractRecords ? window.ZetaChatDOM : null);
        const existing=document.querySelector('script[data-chat2img-codex-zeta-dom]');
        if(existing){ existing.addEventListener('load',done,{once:true}); existing.addEventListener('error',done,{once:true}); setTimeout(done,2500); return; }
        const script=document.createElement('script');
        script.async=true;
        script.dataset.chat2imgCodexZetaDom='1';
        script.src=ZETA_CHAT_DOM_URL+'?cb='+Date.now();
        script.onload=done;
        script.onerror=done;
        document.head.appendChild(script);
        setTimeout(done,2500);
      });
      return window.__CHAT2IMG_CODEX_ZETA_DOM_PROMISE__;
    }
    ensureZetaChatDOM();

    const GENRE_PROMPTS={
      daily:'Everyday contemporary scene. Use a grounded modern-day atmosphere, casual or familiar surroundings, and natural interpersonal emotion. Keep the scene relatable and focused on ordinary life rather than fantasy spectacle.',
      romance_fantasy:'Romance-fantasy setting. Emphasize elegant aristocratic mood, graceful posing, decorative costume detail, refined architecture or interiors, and a heightened emotional atmosphere with subtle fantasy richness.',
      period:'Historical period setting. Emphasize era-appropriate clothing, props, architecture, and manners. Keep the setting clearly historical and avoid modern visual cues unless explicitly stated in the scene text.',
    };

    const STYLE_PROMPTS={
      webtoon:'Webtoon-style illustration with clean linework, readable silhouettes, expressive faces, polished color blocking, and crisp scene clarity suited to character storytelling.',
      semireal:'Semi-realistic illustration with believable anatomy, expressive faces, soft cinematic lighting, and detailed rendering while retaining a stylized illustration feel.',
      realistic:'Realistic character-focused image with natural proportions, lifelike materials, grounded lighting, and a convincing real-world visual feel.',
    };

    const DEFAULTS={
      baseUrl:'http://127.0.0.1:5198',
      mode:'scene',
      genre:'daily',
      stylePreset:'webtoon',
      sizeHint:'auto',
      qualityHint:'auto',
      extraPrompt:'',
      scene:'',
      soloTarget:'char',
      activeTab:'create',
    };

    function readStore(key,fallback){ try{ const v=JSON.parse(localStorage.getItem(key)||'null'); return v??fallback; }catch(_){ return fallback; } }
    function writeStore(key,value){ try{ localStorage.setItem(key,JSON.stringify(value)); return true; }catch(_){ return false; } }
    function loadConfig(){ return {...DEFAULTS,...readStore(STORE,{})}; }
    function loadHistory(){ const v=readStore(HISTORY_STORE,[]); return Array.isArray(v)?v.slice(0,HISTORY_LIMIT):[]; }
    function saveHistory(){ writeStore(HISTORY_STORE,state.history.slice(0,HISTORY_LIMIT)); }
    function esc(s){ return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
    function bridgeBase(){ return (els.baseUrl.value.trim()||DEFAULTS.baseUrl).replace(/\/+$/,''); }
    function joinBridge(path){ const p=String(path||''); return /^https?:\/\//i.test(p)?p:`${bridgeBase()}${p.startsWith('/')?'':'/'}${p}`; }
    function normalizeBlockText(value){ return String(value||'').replace(/\r/g,'').replace(/\u00a0/g,' ').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/[ \t]+\n/g,'\n').replace(/\n[ \t]+/g,'\n').replace(/[ \t]{2,}/g,' ').replace(/\n{3,}/g,'\n\n').trim(); }
    function compactText(value){ return String(value||'').replace(/\s+/g,' ').trim(); }

    const config=loadConfig();
    const state={
      open:true,
      activeTab:['create','result','history'].includes(config.activeTab)?config.activeTab:'create',
      refs:{char:null,persona:null,style:null},
      fabMoved:false,
      loading:false,
      result:null,
      history:loadHistory(),
      picker:null,
    };

    const wrap=document.createElement('div');
    wrap.id=ROOT_ID;
    document.documentElement.appendChild(wrap);
    const shadow=wrap.attachShadow({mode:'open'});

    const rangeStyle=document.createElement('style');
    rangeStyle.id=RANGE_STYLE_ID;
    rangeStyle.textContent=`
      [data-chat2img-codex-range-hover="true"]{outline:2px solid #777!important;outline-offset:-2px!important;cursor:crosshair!important}
      [data-chat2img-codex-range-selected="true"]{outline:2px solid #222!important;outline-offset:-2px!important}
      [data-chat2img-codex-range-boundary="start"]{outline:3px solid #111!important;outline-offset:-3px!important}
      [data-chat2img-codex-range-boundary="end"]{outline:3px dashed #111!important;outline-offset:-3px!important}
      [data-chat2img-codex-range-boundary="both"]{outline:3px solid #111!important;outline-offset:-3px!important}
    `;
    document.head.appendChild(rangeStyle);

    shadow.innerHTML=`
    <style>
      :host{all:initial}
      *,*:before,*:after{box-sizing:border-box}
      button,input,textarea,select{font:inherit}
      .hidden{display:none!important}
      .fab{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:30px;height:30px;padding:0;border:1px solid #d8d8d8;border-radius:50%;background:#fff;color:#111;box-shadow:none;opacity:.8;display:flex;align-items:center;justify-content:center;font:17px/1 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;cursor:grab;touch-action:none;user-select:none;-webkit-user-select:none}.fab:active{cursor:grabbing;opacity:1}
      .panel{position:fixed;right:14px;bottom:64px;z-index:2147483646;width:min(94vw,440px);max-height:min(84vh,760px);display:flex;flex-direction:column;background:#fff;color:#161616;border:1px solid #dedede;border-radius:15px;overflow:hidden;font:13px/1.45 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
      .head{display:flex;align-items:center;justify-content:space-between;padding:12px 14px 10px;border-bottom:1px solid #ececec;background:#fff}
      .title{font-size:15px;font-weight:750;letter-spacing:-.2px}.sub{font-size:10px;color:#999;margin-top:1px}.close{width:30px;height:30px;border:0;background:transparent;border-radius:8px;color:#777;font-size:20px;cursor:pointer}
      .tabs{display:grid;grid-template-columns:repeat(3,1fr);padding:0 10px;border-bottom:1px solid #ececec;background:#fff}
      .tab{height:40px;border:0;border-bottom:2px solid transparent;background:transparent;color:#888;font-weight:700;cursor:pointer}.tab.active{color:#111;border-bottom-color:#111}
      .body{overflow:auto;padding:12px 13px 14px}.view{display:none}.view.active{display:block}
      .card{border:1px solid #e7e7e7;border-radius:12px;padding:11px;background:#fff;margin-bottom:10px}.card:last-child{margin-bottom:0}
      .sectionTitle{font-size:12px;font-weight:750;margin:0 0 8px}.hint{font-size:10.5px;color:#8a8a8a;margin-top:5px}.muted{color:#888}.mini{font-size:10.5px;color:#888}
      .row{display:flex;align-items:center;gap:7px}.row.wrap{flex-wrap:wrap}.grow{flex:1;min-width:0}
      .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
      input[type=text],input[type=number],textarea,select{width:100%;border:1px solid #dcdcdc;border-radius:9px;background:#fff;color:#111;outline:none;padding:8px 9px}input:focus,textarea:focus,select:focus{border-color:#999}
      textarea{resize:vertical;min-height:128px;line-height:1.5}.smallText{min-height:68px}
      .btn{border:1px solid #171717;border-radius:9px;background:#171717;color:#fff;padding:8px 11px;font-weight:700;cursor:pointer;white-space:nowrap}.btn.secondary{background:#fff;color:#222;border-color:#d6d6d6}.btn.ghost{background:transparent;color:#666;border-color:transparent}.btn:disabled{opacity:.45;cursor:default}.btn.full{width:100%;height:42px;font-size:13px}
      .turnInput{width:58px!important;text-align:center}.unit{font-size:11px;color:#777}
      .seg{display:grid;grid-template-columns:1fr 1fr;gap:6px}.seg label input{display:none}.seg label span{display:block;text-align:center;padding:8px;border:1px solid #ddd;border-radius:9px;cursor:pointer;font-weight:650;color:#666}.seg label input:checked+span{border-color:#111;background:#111;color:#fff}
      .status{padding:8px 9px;border:1px solid #e5e5e5;border-radius:9px;background:#fafafa;color:#555;font-size:11px;white-space:pre-wrap;word-break:break-word}.status.ok{border-color:#cddfd2;background:#f5faf6;color:#315c3c}.status.err{border-color:#ebcccc;background:#fff7f7;color:#8a3434}
      .serverLine{display:grid;grid-template-columns:1fr auto;gap:7px}
      .refs{display:grid;grid-template-columns:1fr;gap:8px}.ref{display:grid;grid-template-columns:70px minmax(0,1fr);gap:9px;align-items:start;border:1px solid #e5e5e5;border-radius:11px;padding:8px;min-width:0}.refBody{min-width:0}.refTop{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:5px}.refName{font-size:11.5px;font-weight:750}.thumbWrap{width:70px;height:70px;border-radius:9px;background:#f5f5f5;overflow:hidden;display:flex;align-items:center;justify-content:center}.thumb{width:100%;height:100%;object-fit:cover;display:block}.thumbPlaceholder{font-size:10px;color:#aaa;text-align:center;padding:6px}.refMeta{font-size:10px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin:0 0 6px}.refUrl{font-size:10px!important;padding:6px 7px!important;margin-bottom:6px}.refBtns{display:flex;gap:4px;flex-wrap:wrap}.tiny{flex:0 1 auto;min-width:54px;border:1px solid #ddd;border-radius:7px;background:#fff;color:#444;padding:6px 7px;font-size:10px;cursor:pointer}.useToggle{display:flex;align-items:center;gap:4px;font-size:10px;color:#666;white-space:nowrap}.useToggle input{accent-color:#111}.refTools{display:flex;justify-content:flex-end;margin-bottom:8px}
      .resultEmpty{padding:54px 16px;text-align:center;color:#999;border:1px dashed #ddd;border-radius:12px}.resultImage{display:block;width:100%;max-height:58vh;object-fit:contain;border-radius:11px;border:1px solid #e5e5e5;background:#fafafa}.resultActions{display:flex;gap:7px;margin-top:9px}.resultMeta{font-size:10.5px;color:#888;margin-top:7px;word-break:break-all}
      .historyGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.historyItem{border:1px solid #e5e5e5;border-radius:11px;padding:7px;background:#fff}.historyImg{display:block;width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px;background:#f3f3f3}.historyInfo{font-size:10px;color:#888;margin:6px 1px 5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.historyActions{display:flex;gap:5px}.historyActions .tiny{padding:6px}.emptyHistory{text-align:center;padding:44px 10px;color:#999;border:1px dashed #ddd;border-radius:12px}
      .rangeBanner{position:fixed;top:max(12px,env(safe-area-inset-top,0px));left:50%;z-index:2147483647;transform:translateX(-50%);display:flex;align-items:center;gap:8px;max-width:calc(100vw - 24px);padding:8px 9px 8px 11px;border:1px solid #ccc;border-radius:10px;background:#fff;color:#222;font:700 12px/1.3 system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}.rangeBanner span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rangeBanner button{border:1px solid #ddd;border-radius:7px;background:#fff;padding:6px 8px;color:#555;font-size:10px;cursor:pointer}
      @media(max-width:390px){.panel{right:8px;bottom:58px;width:calc(100vw - 16px)}.body{padding:10px}.ref{grid-template-columns:62px minmax(0,1fr)}.thumbWrap{width:62px;height:62px}.grid3{grid-template-columns:1fr 1fr}}
    </style>
    <button class="fab" id="fab" aria-label="Chat2Img-Codex 열기">🎨</button>
    <div class="panel" id="panel">
      <div class="head"><div><div class="title">Chat2Img-Codex</div><div class="sub">제타용 이미지 생성</div></div><div style="display:flex;align-items:center;gap:4px"><button class="close" id="sizeBtn" aria-label="창 크기" title="창 크기 바꾸기" style="font-size:12px;font-weight:700;width:auto;padding:0 8px">100%</button><button class="close" id="close" aria-label="닫기">×</button></div></div>
      <div class="tabs">
        <button class="tab" data-tab="create">생성</button>
        <button class="tab" data-tab="result">결과</button>
        <button class="tab" data-tab="history">이력</button>
      </div>
      <div class="body">
        <section class="view" data-view="create">
          <div class="card">
            <div class="sectionTitle">대화 선택</div>
            <div class="row wrap">
              <button class="btn secondary" id="pickRange">구간 선택</button><button class="btn ghost" id="clearScene">지우기</button>
            </div>
            <textarea id="scene" style="margin-top:8px" placeholder="선택한 구간의 대화가 여기에 들어옵니다. 직접 수정하거나 붙여넣어도 됩니다."></textarea>
            <div id="conversationStatus" class="hint">시작 말풍선과 끝 말풍선을 눌러 필요한 대화만 정확하게 가져옵니다.</div>
          </div>

          <div class="card">
            <div class="sectionTitle">생성 설정</div>
            <div class="seg">
              <label><input type="radio" name="mode" id="modeScene" checked><span>장면샷</span></label>
              <label><input type="radio" name="mode" id="modeSolo"><span>1인샷</span></label>
            </div>
            <div class="grid2" id="soloTargetWrap" style="margin-top:8px">
              <select id="soloTarget" aria-label="1인샷 대상"><option value="char">1인샷 대상 · 캐릭터</option><option value="persona">1인샷 대상 · 유저</option></select>
              <div class="hint" style="margin:0;align-self:center">1인샷에서는 선택한 대상 1명만 그립니다.</div>
            </div>
            <div class="grid2" style="margin-top:8px">
              <select id="genre" aria-label="장르"><option value="daily">장르 · 일상</option><option value="romance_fantasy">장르 · 로판</option><option value="period">장르 · 시대물</option></select>
              <select id="stylePreset" aria-label="화풍"><option value="webtoon">화풍 · 웹툰</option><option value="semireal">화풍 · 반실사</option><option value="realistic">화풍 · 실사</option></select>
            </div>
            <div class="grid2" style="margin-top:8px">
              <select id="sizeHint" aria-label="크기"><option value="auto">크기 auto</option><option value="square">정사각</option><option value="portrait">세로</option><option value="landscape">가로</option></select>
              <select id="qualityHint" aria-label="품질"><option value="auto">품질 auto</option><option value="high">high</option><option value="medium">medium</option></select>
            </div>
            <div class="hint">장르 정의: 일상 = 현대의 자연스러운 일상 장면 / 로판 = 귀족풍 로맨스 판타지 분위기 / 시대물 = 역사·시대 배경 중심</div>
            <div class="hint">화풍 정의: 웹툰 = 선명한 선화와 읽기 쉬운 연출 / 반실사 = 스타일감이 남는 정교한 일러스트 / 실사 = 사실적 질감과 현실감 중심</div>
            <textarea class="smallText" id="extraPrompt" style="margin-top:8px" placeholder="추가 지시 (선택) — 구도, 분위기, 의상, 배경, 표정 등"></textarea>
          </div>

          <div class="card">
            <div class="row" style="justify-content:space-between"><div class="sectionTitle" style="margin:0">참조 이미지 <span class="mini">(선택)</span></div><button class="btn ghost" id="loadProfiles" type="button">프로필 불러오기</button></div>
            <div class="hint" style="margin:3px 0 8px">캐릭터·유저는 현재 대화방 프로필 URL을 자동 감지할 수 있습니다. 체크한 항목만 참고 이미지로 전달됩니다.</div>
            <div class="refs">
              <div class="ref" data-ref-card="char"><div class="thumbWrap"><span class="thumbPlaceholder" id="charPlaceholder">캐릭터</span><img class="thumb hidden" id="charThumb"></div><div class="refBody"><div class="refTop"><span class="refName">캐릭터</span><label class="useToggle"><input type="checkbox" id="charUse"><span>참고 사용</span></label></div><div class="refMeta" id="charMeta">없음</div><input class="refUrl" id="charUrl" type="text" placeholder="프로필 이미지 URL (자동 감지/직접 입력)"><div class="refBtns"><button class="tiny" data-url-apply="char">URL 적용</button><button class="tiny" data-pick="char">파일</button><button class="tiny" data-clipboard="char">붙여넣기</button><button class="tiny" data-clear="char">삭제</button></div></div></div>
              <div class="ref" data-ref-card="persona"><div class="thumbWrap"><span class="thumbPlaceholder" id="personaPlaceholder">유저</span><img class="thumb hidden" id="personaThumb"></div><div class="refBody"><div class="refTop"><span class="refName">유저</span><label class="useToggle"><input type="checkbox" id="personaUse"><span>참고 사용</span></label></div><div class="refMeta" id="personaMeta">없음</div><input class="refUrl" id="personaUrl" type="text" placeholder="프로필 이미지 URL (자동 감지/직접 입력)"><div class="refBtns"><button class="tiny" data-url-apply="persona">URL 적용</button><button class="tiny" data-pick="persona">파일</button><button class="tiny" data-clipboard="persona">붙여넣기</button><button class="tiny" data-clear="persona">삭제</button></div></div></div>
              <div class="ref" data-ref-card="style"><div class="thumbWrap"><span class="thumbPlaceholder" id="stylePlaceholder">화풍</span><img class="thumb hidden" id="styleThumb"></div><div class="refBody"><div class="refTop"><span class="refName">화풍</span><label class="useToggle"><input type="checkbox" id="styleUse"><span>참고 사용</span></label></div><div class="refMeta" id="styleMeta">없음</div><div class="refBtns"><button class="tiny" data-pick="style">파일</button><button class="tiny" data-clipboard="style">붙여넣기</button><button class="tiny" data-clear="style">삭제</button></div></div></div>
            </div>
          </div>

          <div class="card">
            <div class="sectionTitle">연결 설정</div>
            <div class="serverLine"><input id="baseUrl" type="text" placeholder="http://127.0.0.1:5198"><button class="btn secondary" id="checkStatus">상태</button></div>
            <div class="hint">PC: http://127.0.0.1:5198 · Tailscale: https://내PC.ts.net/chat2img-codex</div>
            <div id="statusBox" class="status hidden" style="margin-top:7px"></div>
          </div>

          <button class="btn full" id="generate">이미지 생성</button>
          <div id="runStatus" class="status hidden" style="margin-top:8px"></div>
        </section>

        <section class="view" data-view="result">
          <div id="resultEmpty" class="resultEmpty">아직 생성된 이미지가 없습니다.</div>
          <div id="resultContent" class="hidden">
            <img id="resultImg" class="resultImage" alt="generated image">
            <div class="resultActions"><button class="btn grow" id="saveImage">PNG 저장</button><button class="btn secondary" id="backCreate">다시 생성</button></div>
            <div id="resultMeta" class="resultMeta"></div>
            <div id="resultStatus" class="status hidden" style="margin-top:8px"></div>
          </div>
        </section>

        <section class="view" data-view="history">
          <div class="row" style="justify-content:space-between;margin-bottom:9px"><span class="mini" id="historyLabel">최근 생성 이미지</span><button class="btn ghost" id="clearHistory">이력 비우기</button></div>
          <div id="historyList"></div>
        </section>
      </div>
    </div>
    <div id="rangeBanner" class="rangeBanner hidden"><span id="rangeBannerText">시작할 대화 말풍선을 누르세요</span><button id="rangeCancel">취소</button></div>`;

    const $=id=>shadow.getElementById(id);
    const els={
      fab:$('fab'),panel:$('panel'),close:$('close'),baseUrl:$('baseUrl'),checkStatus:$('checkStatus'),statusBox:$('statusBox'),
      pickRange:$('pickRange'),clearScene:$('clearScene'),scene:$('scene'),conversationStatus:$('conversationStatus'),
      modeScene:$('modeScene'),modeSolo:$('modeSolo'),soloTarget:$('soloTarget'),soloTargetWrap:$('soloTargetWrap'),genre:$('genre'),stylePreset:$('stylePreset'),sizeHint:$('sizeHint'),qualityHint:$('qualityHint'),extraPrompt:$('extraPrompt'),
      generate:$('generate'),runStatus:$('runStatus'),resultEmpty:$('resultEmpty'),resultContent:$('resultContent'),resultImg:$('resultImg'),resultMeta:$('resultMeta'),resultStatus:$('resultStatus'),saveImage:$('saveImage'),backCreate:$('backCreate'),
      historyList:$('historyList'),clearHistory:$('clearHistory'),rangeBanner:$('rangeBanner'),rangeBannerText:$('rangeBannerText'),rangeCancel:$('rangeCancel'),
      charThumb:$('charThumb'),personaThumb:$('personaThumb'),styleThumb:$('styleThumb'),charMeta:$('charMeta'),personaMeta:$('personaMeta'),styleMeta:$('styleMeta'),
      charPlaceholder:$('charPlaceholder'),personaPlaceholder:$('personaPlaceholder'),stylePlaceholder:$('stylePlaceholder'),charUse:$('charUse'),personaUse:$('personaUse'),styleUse:$('styleUse'),charUrl:$('charUrl'),personaUrl:$('personaUrl'),loadProfiles:$('loadProfiles'),
    };

    function saveConfig(){
      const data={
        baseUrl:els.baseUrl.value.trim()||DEFAULTS.baseUrl,
        mode:els.modeSolo.checked?'solo':'scene',soloTarget:els.soloTarget.value,genre:els.genre.value,stylePreset:els.stylePreset.value,sizeHint:els.sizeHint.value,qualityHint:els.qualityHint.value,
        extraPrompt:els.extraPrompt.value,scene:els.scene.value,activeTab:state.activeTab,
      };
      writeStore(STORE,data);
    }

    function updateSoloTargetUI(){const solo=!!els.modeSolo.checked; els.soloTargetWrap.classList.toggle('hidden', !solo);}

    function hydrate(){
      els.baseUrl.value=config.baseUrl; els.scene.value=config.scene;
      els.modeSolo.checked=config.mode==='solo'; els.modeScene.checked=config.mode!=='solo'; els.genre.value=config.genre; els.stylePreset.value=config.stylePreset; els.sizeHint.value=config.sizeHint; els.qualityHint.value=config.qualityHint; els.extraPrompt.value=config.extraPrompt;
    }

    // 창 크기: 버튼 누를 때마다 100% → 85% → 70% → 55% 순서로 바뀌고, 기기마다 기억함 (폰·아이패드는 처음에 70%)
    (()=>{
      const KEY='chat2img-codex-panel-zoom';
      const STEPS=[100,85,70,55];
      const btn=shadow.getElementById('sizeBtn');
      const touch=matchMedia('(pointer:coarse)').matches;
      let z=parseInt(localStorage.getItem(KEY)||'',10);
      if(!STEPS.includes(z))z=touch?70:100;
      const apply=()=>{els.panel.style.zoom=String(z/100);if(btn)btn.textContent=z+'%'};
      apply();
      if(btn)btn.addEventListener('click',e=>{e.stopPropagation();z=STEPS[(STEPS.indexOf(z)+1)%STEPS.length];try{localStorage.setItem(KEY,String(z))}catch(_){}apply()});
    })();
    function setOpen(open){ state.open=!!open; els.panel.classList.toggle('hidden',!state.open); }
    function toggle(){ setOpen(!state.open); }
    function switchTab(tab){
      if(!['create','result','history'].includes(tab)) tab='create';
      state.activeTab=tab;
      shadow.querySelectorAll('.tab').forEach(el=>el.classList.toggle('active',el.dataset.tab===tab));
      shadow.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.dataset.view===tab));
      if(tab==='history'){ renderHistory(); fetchServerHistory(false); }
      saveConfig();
    }
    function setStatus(el,kind,text){ el.className=`status ${kind||''}`.trim(); el.textContent=text||''; el.classList.toggle('hidden',!text); }
    function setConversationStatus(text,kind=''){ els.conversationStatus.textContent=text||''; els.conversationStatus.style.color=kind==='error'?'#963c3c':kind==='ok'?'#376643':'#8a8a8a'; }

    function refEls(slot){
      const map={
        char:{img:els.charThumb,meta:els.charMeta,placeholder:els.charPlaceholder,use:els.charUse,url:els.charUrl},
        persona:{img:els.personaThumb,meta:els.personaMeta,placeholder:els.personaPlaceholder,use:els.personaUse,url:els.personaUrl},
        style:{img:els.styleThumb,meta:els.styleMeta,placeholder:els.stylePlaceholder,use:els.styleUse,url:null},
      };
      return map[slot];
    }
    function snapshotRef(slot,data,options={}){
      const previous=state.refs[slot];
      const normalized=data?{...data,enabled:options.enabled??data.enabled??previous?.enabled??true}:null;
      state.refs[slot]=normalized;
      const ui=refEls(slot); if(!ui)return;
      const src=normalized?.dataUrl||normalized?.url||'';
      if(src){ui.img.src=src;ui.img.classList.remove('hidden');ui.placeholder.classList.add('hidden');ui.meta.textContent=normalized.name||(normalized.url?'프로필 URL':'선택됨');}
      else{ui.img.removeAttribute('src');ui.img.classList.add('hidden');ui.placeholder.classList.remove('hidden');ui.meta.textContent='없음';}
      ui.use.checked=!!(normalized&&normalized.enabled!==false);
      ui.use.disabled=!normalized;
      if(ui.url)ui.url.value=normalized?.url||'';
    }
    function fileToDataUrl(file){ return new Promise((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(new Error('파일 읽기 실패'));r.onload=()=>resolve(String(r.result||''));r.readAsDataURL(file);}); }
    async function pickFile(slot){
      const input=document.createElement('input'); input.type='file'; input.accept='image/png,image/jpeg,image/webp';
      input.onchange=async()=>{const f=input.files?.[0];if(!f)return;snapshotRef(slot,{name:f.name,dataUrl:await fileToDataUrl(f),enabled:true});}; input.click();
    }
    async function readClipboardImage(slot){
      if(!navigator.clipboard?.read) throw new Error('이 브라우저에서는 클립보드 이미지 읽기를 사용할 수 없습니다.');
      for(const item of await navigator.clipboard.read()){
        const type=item.types.find(t=>/^image\/(png|jpeg|webp)$/i.test(t)); if(!type) continue;
        const blob=await item.getType(type); const file=new File([blob],`${slot}.${type.split('/')[1]}`,{type}); snapshotRef(slot,{name:file.name,dataUrl:await fileToDataUrl(file),enabled:true}); return;
      }
      throw new Error('클립보드에 이미지가 없습니다.');
    }
    function cleanHighResolutionImageUrl(value=''){
      const raw=String(value||'').trim();
      if(!raw||/^(data:|blob:)/i.test(raw))return raw;
      try{
        const url=new URL(raw,location.href);
        if(/\/_next\/image$/i.test(url.pathname)){
          const original=url.searchParams.get('url');
          if(original)return cleanHighResolutionImageUrl(decodeURIComponent(original));
        }
        url.search='';url.hash='';return url.href;
      }catch(_){return raw.split('?')[0].split('#')[0];}
    }
    function nestedValue(object,path){try{return path.split('.').reduce((current,key)=>current?.[key],object);}catch(_){return undefined;}}
    function currentZetaRoomId(){
      const source=[location.pathname,location.search,location.hash].join(' ');
      const patterns=[/\/rooms?\/([^/?#]+)/i,/\/(?:chats?|conversations?)\/([^/?#]+)/i,/[?&#](?:roomId|room_id|room|chatId|chat_id|conversationId|conversation_id)=([^&#\s]+)/i];
      for(const pattern of patterns){const match=source.match(pattern);if(!match?.[1])continue;try{return decodeURIComponent(match[1]).trim();}catch(_){return String(match[1]).trim();}}
      return '';
    }
    function snapshotRoomId(snapshot){
      return ['session.room.id','session.room.roomId','room.id','room.roomId','roomId'].map(path=>nestedValue(snapshot,path)).find(value=>value!==undefined&&value!==null&&String(value).trim())||'';
    }
    function primaryCharacterFromSnapshot(snapshot){
      if(!snapshot)return null;const roomId=currentZetaRoomId(),actualRoomId=snapshotRoomId(snapshot);if(roomId&&actualRoomId&&String(actualRoomId)!==String(roomId))return null;
      const paths=['session.room.plot.characters','room.plot.characters','plotData.draft.characters','plotData.characters','plotData.plot.characters','roomData.plot.draft.characters','roomData.plot.characters','roomData.characters','plot.draft.characters','plot.characters'];
      for(const path of paths){const characters=nestedValue(snapshot,path);if(Array.isArray(characters)&&characters.length)return characters[0];}
      return null;
    }
    function reactFibersFromElement(element){
      const fibers=[];let keys=[];try{keys=Object.keys(element||{});}catch(_){}for(const key of keys){if(!key.startsWith('__reactFiber$')&&!key.startsWith('__reactInternalInstance$'))continue;if(element[key])fibers.push(element[key]);}return fibers;
    }
    function characterFromReactRoomState(){
      const roots=[];const pushRoot=element=>{if(element&&!roots.includes(element))roots.push(element);};
      ['[data-sentry-component="ChatRoomReadyView"]','[data-sentry-component="ChatRoomView"]','[data-sentry-component="ChatRoomPageContent"]','[data-sentry-component="LeftTextContent"]','[data-sentry-component="RightTextContent"]','main'].forEach(selector=>{try{document.querySelectorAll(selector).forEach(pushRoot);}catch(_){}});
      const visitedFibers=new Set(),visitedValues=new WeakSet();let inspected=0,resolved=null;
      const inspectValue=(value,depth=0)=>{
        if(resolved||!value||typeof value!=='object'||depth>10||inspected>12000)return;if(typeof Node!=='undefined'&&value instanceof Node)return;if(visitedValues.has(value))return;visitedValues.add(value);inspected++;
        const direct=primaryCharacterFromSnapshot(value);if(direct){resolved=direct;return;}
        for(const readerName of ['getChat','getState','getSnapshot']){if(resolved)break;let reader;try{reader=value[readerName];}catch(_){continue;}if(typeof reader!=='function')continue;try{const snapshot=reader.call(value);if(snapshot&&snapshot!==value&&typeof snapshot==='object')inspectValue(snapshot,depth+1);}catch(_){}}
        if(resolved||depth>=10)return;if(Array.isArray(value)){value.slice(0,30).forEach(item=>inspectValue(item,depth+1));return;}
        let keys=[];try{keys=Object.keys(value);}catch(_){return;}keys.filter(key=>/^(?:model|store|value|state|snapshot|session|activeSession|chat|room|plot|plotData|roomData|plugin|context|data|current|memoizedState|baseState|next)$/i.test(key)).forEach(key=>{if(resolved)return;let child;try{child=value[key];}catch(_){return;}if(child&&typeof child==='object')inspectValue(child,depth+1);});
      };
      const inspectFiber=fiber=>{for(let current=fiber,depth=0;current&&depth<90&&!resolved;current=current.return,depth++){if(visitedFibers.has(current))continue;visitedFibers.add(current);inspectValue(current.memoizedProps);inspectValue(current.pendingProps);inspectValue(current.memoizedState);inspectValue(current.updateQueue);if(current.alternate&&!visitedFibers.has(current.alternate)){inspectValue(current.alternate.memoizedProps);inspectValue(current.alternate.memoizedState);}}};
      roots.forEach(element=>reactFibersFromElement(element).forEach(inspectFiber));return resolved;
    }
    function characterFromSharedState(){
      const nativeCharacter=characterFromReactRoomState();if(nativeCharacter)return nativeCharacter;const found=[];const append=snapshot=>{if(!snapshot)return;const character=primaryCharacterFromSnapshot(snapshot);if(character)found.push(character);};
      try{const bridge=window.ZetaRoomBridge;append(typeof bridge?.getSnapshot==='function'?bridge.getSnapshot():bridge);}catch(_){}
      try{const editor=window.ZetaPersonaEditor;if(editor)append({roomId:editor.roomId,plotData:editor.plotData,roomData:editor.recRoomData});}catch(_){}
      try{const review=window.__ZETAKIT_REVIEW_ZETA_LORE_HOOK__?.state;if(review)append({roomId:review.roomId,plotData:review.plot});}catch(_){}
      return found[0]||null;
    }
    function characterImageFromSharedState(primary=characterFromSharedState()){
      const paths=['profileImageUrl','profile_image_url','profileImage.url','profileImage.originalUrl','profileImage.src','imageUrl','image_url','image.url','image.originalUrl','thumbnailUrl','thumbnail_url','avatarUrl','avatar_url','avatar.url','characterProfileImageUrl'];
      for(const path of paths){const image=cleanHighResolutionImageUrl(nestedValue(primary,path));if(image)return image;}return '';
    }
    const USER_CONTENT_SELECTOR='[data-sentry-component="RightContentView"],[data-sentry-component="RightTextContent"]';
    const CONVERSATION_CONTENT_SELECTOR=[USER_CONTENT_SELECTOR,'[data-sentry-component="LeftContentView"]','[data-sentry-component="LeftTextContent"]','[data-sentry-component="NarratorContentView"]','[data-sentry-component="NarratorBubble"]','[data-sentry-component*="ChatMessage" i]','[data-message-id]'].join(',');
    function isInsideConversationContent(element){try{return !!element?.closest?.(CONVERSATION_CONTENT_SELECTOR);}catch(_){return false;}}
    function parseSrcset(value){
      return String(value||'').split(',').map(part=>part.trim()).filter(Boolean).map(part=>{const m=part.match(/^(\S+)\s*(?:(\d+(?:\.\d+)?)(w|x))?$/);return m?{url:m[1],score:Number(m[2]||1)*(m[3]==='x'?10000:1)}:{url:part.split(/\s+/)[0],score:1};}).sort((a,b)=>b.score-a.score);
    }
    function imageUrlFromElement(img){
      if(!(img instanceof HTMLImageElement))return '';
      const candidates=[...parseSrcset(img.getAttribute('srcset')),...parseSrcset(img.getAttribute('data-srcset'))];
      const direct=[img.getAttribute('data-original'),img.getAttribute('data-src'),img.currentSrc,img.getAttribute('src')].filter(Boolean).map(url=>({url,score:0}));
      for(const item of [...candidates,...direct]){
        try{const url=new URL(item.url,location.href);if(/^https?:$/.test(url.protocol)||url.protocol==='data:'){const cleaned=cleanHighResolutionImageUrl(url.href);if(cleaned)return cleaned;}}catch(_){}
      }
      return '';
    }
    function isLikelyProfileImage(img,url){
      const text=`${url} ${img?.className||''} ${img?.getAttribute?.('alt')||''}`.toLowerCase();
      return /zeta-ai\.io|profile|avatar|rounded-full|chat-profile/.test(text);
    }
    function firstProfileUrl(selectors,excludeUrl=''){
      for(const selector of selectors){
        for(const img of document.querySelectorAll(selector)){
          const url=imageUrlFromElement(img);
          if(!url||url===excludeUrl||!isLikelyProfileImage(img,url))continue;
          return url;
        }
      }
      return '';
    }
    function selectedUserProfileImage(){
      const badge=document.querySelector('[data-sentry-source-file="ChatProfileListItem.tsx"] .bg-primary-400');
      let node=badge;
      for(let i=0;i<8&&node;i++,node=node.parentElement){
        if(node.tagName!=='BUTTON')continue;
        const img=node.querySelector('img[src*="user-chat-profile-image"],img[srcset*="user-chat-profile-image"]');
        const url=imageUrlFromElement(img); if(url)return url;
      }
      return firstProfileUrl(['img[src*="user-plot-chat-profile-image"]','img[srcset*="user-plot-chat-profile-image"]','a[href*="/my-plot-chat-profile/"] img','[data-sentry-component="RightContentView"] img','[data-sentry-component="RightTextContent"] img']);
    }
    function characterProfileImage(){
      const sharedCharacter=characterFromSharedState();
      let image=characterImageFromSharedState(sharedCharacter);
      const imageFromElement=element=>{
        if(!element||isInsideConversationContent(element))return '';
        const url=imageUrlFromElement(element);if(!url)return '';
        if(/user-(?:plot-)?chat-profile-image|default-profile|zeta_watermark|zeta-rework|\/icon\/|logo|favicon|watermark/i.test(url))return '';
        return url;
      };
      if(!image){
        const plotCharacter=document.querySelector('[data-sentry-component="PlotCharacter"]');
        image=imageFromElement(plotCharacter?.querySelector?.('img[alt^="Profile image of"],img[alt*="profile" i],img[src*="/profile-image/"]'));
      }
      const selectors=['img[alt*="profile" i][src*="/profile-image/"]','img[alt*="character" i]','main img[src*="/profile-image/"]','main img[src*="profile"]','main img[src]'];
      for(const selector of selectors){if(image)break;let elements=[];try{elements=[...document.querySelectorAll(selector)];}catch(_){}for(const element of elements){image=imageFromElement(element);if(image)break;}}
      return image||'';
    }
    function detectProfileImageUrls(){
      const persona=selectedUserProfileImage();
      const char=characterProfileImage();
      return {char:char&&char!==persona?char:'',persona};
    }
    function applyRefUrl(slot,value,name='URL'){
      const raw=String(value||'').trim();
      if(!raw){snapshotRef(slot,null);return false;}
      let url;try{url=new URL(raw,location.href).href;}catch(_){throw new Error('올바른 이미지 URL을 입력하세요.');}
      if(!/^https?:\/\//i.test(url)&&!/^data:image\//i.test(url))throw new Error('HTTP(S) 이미지 URL만 사용할 수 있습니다.');
      if(/^data:image\//i.test(url))snapshotRef(slot,{name,dataUrl:url,enabled:true});
      else snapshotRef(slot,{name,url,enabled:true});
      return true;
    }
    function loadProfileRefs(showMessage=true){
      const found=detectProfileImageUrls(); const messages=[];
      if(found.char){snapshotRef('char',{name:'캐릭터 프로필',url:found.char,enabled:state.refs.char?.enabled??true});messages.push('캐릭터');}
      if(found.persona){snapshotRef('persona',{name:'유저 프로필',url:found.persona,enabled:state.refs.persona?.enabled??true});messages.push('유저');}
      if(showMessage)setConversationStatus(messages.length?`${messages.join(' · ')} 프로필 이미지를 불러왔습니다.`:'현재 대화방에서 프로필 이미지 URL을 찾지 못했습니다.',messages.length?'ok':'error');
      return found;
    }

    // ---- Conversation extraction: adapted from Chat2Img ----
    function htmlToTxtPreserve(html){
      const root=document.createElement('div'); root.innerHTML=String(html||'');
      const walk=node=>{
        if(node.nodeType===Node.TEXT_NODE) return node.nodeValue||'';
        if(node.nodeType!==Node.ELEMENT_NODE) return '';
        const tag=String(node.tagName||'').toLowerCase(); if(['script','style','svg','button'].includes(tag)) return ''; if(tag==='br') return '\n';
        let value=Array.from(node.childNodes).map(walk).join('');
        if(tag==='em'||tag==='i'){const inner=compactText(value);return inner?`*${inner}*`:'';}
        if(['p','div','li'].includes(tag)){value=normalizeBlockText(value);return value?`${value}\n`:'';}
        return value;
      };
      return normalizeBlockText(Array.from(root.childNodes).map(walk).join(''));
    }
    function componentName(el){ return (el?.getAttribute?.('data-sentry-component')||'').trim(); }
    function closestBy(el,pred){ let cur=el;while(cur){if(pred(cur))return cur;cur=cur.parentElement;}return null; }
    function isMessageBoundary(el){const c=componentName(el);return ['ChatMessage','BodyView','LastChatMessage','CandidatePanel','Candidate'].includes(c);}
    function speakerBoundary(el,root){return root||closestBy(el,isMessageBoundary)||document.body||document.documentElement;}
    function validSpeaker(value){const s=compactText(value);return (!s||/^(?:zeta|제타)$/i.test(s)||/^\d+\s*\/\s*\d+$/.test(s)||s.length>40)?'':s;}
    function speakerName(chatEl,root){
      const boundary=speakerBoundary(chatEl,root); if(!boundary?.querySelectorAll)return '';
      const names=Array.from(boundary.querySelectorAll('[class*="caption1"]')).filter(el=>el===chatEl||!!(el.compareDocumentPosition(chatEl)&Node.DOCUMENT_POSITION_FOLLOWING)||boundary.contains(chatEl)).map(el=>validSpeaker(el.textContent)).filter(Boolean);
      return names[names.length-1]||'';
    }
    function recordFromChat(chatEl,contentView,root){
      if(!chatEl||!contentView)return null; const c=componentName(contentView); const type=(c==='RightContentView'||c==='RightTextContent')?'user':(c==='LeftContentView'||c==='LeftTextContent')?'ai':'narration';
      const innerHTML=String(chatEl.innerHTML||''); const text=htmlToTxtPreserve(innerHTML); if(!text)return null; return {type,name:type==='narration'?'':speakerName(chatEl,root),innerHTML,text};
    }
    function statusRecord(box){ const text=normalizeBlockText(box?.innerText||box?.textContent||''); return text?{type:'status',name:'',innerHTML:String(box?.innerHTML||''),text}:null; }
    function recordsFromContainer(container){
      if(!container?.querySelectorAll)return[];
      const statusSel='[data-sentry-component="InfoBoxExpandedContent"],[data-sentry-source-file="InfoBoxExpandedContent.tsx"]';
      const nodes=Array.from(container.querySelectorAll(`div.chat,${statusSel}`)).filter(node=>{
        if(node.matches?.(statusSel))return !node.parentElement?.closest?.(statusSel); if(node.closest?.(statusSel))return false; const p=node.parentElement?.closest?.('div.chat');return !p||!container.contains(p);
      });
      if(container.matches?.('div.chat,'+statusSel)) nodes.unshift(container);
      const out=[];
      for(const node of [...new Set(nodes)]){
        if(node.matches?.(statusSel)){const r=statusRecord(node);if(r)out.push(r);continue;}
        const content=closestBy(node,e=>['LeftContentView','LeftTextContent','RightContentView','RightTextContent','NarratorContentView','NarratorBubble'].includes(componentName(e)));
        const r=recordFromChat(node,content,container);if(r)out.push(r);
      }
      return out;
    }
    function normalizeRecords(records){return Array.from(records||[]).map((r,index)=>({id:r.id||'',messageId:r.messageId||'',timestamp:r.timestamp??null,type:r.type||r.role||'',name:r.name||'',innerHTML:r.innerHTML||'',text:r.text||'',imageUrl:r.imageUrl||'',_seq:index})).filter(r=>r.text||r.type==='image');}
    function renderRecord(record){
      if(!record)return''; if(record.type==='status'){const body=htmlToTxtPreserve(record.innerHTML)||String(record.text||'').trim();return body?`\`\`\`InfoBox\n${body}\n\`\`\``:'';} if(record.type==='image')return'[이미지]';
      const body=htmlToTxtPreserve(record.innerHTML)||String(record.text||'').trim();if(!body)return''; if(record.type==='narration')return`@: ${body}`; const name=String(record.name||'').trim()||(record.type==='user'?'user':'char');return`@${name}: ${body}`;
    }
    function groupTurns(records){
      const turns=[];let current=null;for(const r of records||[]){if(r.type==='user'){if(current?.user&&current.responses.length)turns.push(current);current={user:r,responses:[]};}else if(current){current.responses.push(r);}}if(current?.user&&current.responses.length)turns.push(current);return turns;
    }
    async function resolveChatDOM(){ if(window.ZetaChatDOM?.extractRecords)return window.ZetaChatDOM; return await ensureZetaChatDOM(); }
    function readShared(chatDOM,method,root=document){
      const fn=chatDOM?.[method];if(typeof fn!=='function')return[];try{return normalizeRecords(fn.call(chatDOM,{root,exclude:[wrap],includeStatus:true}));}catch(_){return[];}
    }
    const RANGE_SELECTOR=[
      '[data-sentry-component="LeftContentView"]','[data-sentry-component="LeftTextContent"]','[data-sentry-component="RightContentView"]','[data-sentry-component="RightTextContent"]','[data-sentry-component="NarratorContentView"]','[data-sentry-component="NarratorBubble"]','[data-sentry-component="InfoBoxContentView"]','[data-sentry-component="InfoBoxExpandedContent"]','[data-sentry-source-file="LeftTextContent.tsx"]','[data-sentry-source-file="RightTextContent.tsx"]','[data-sentry-source-file="InfoBoxExpandedContent.tsx"]'
    ].join(',');
    function unitVisible(el){
      if(!(el instanceof HTMLElement)||el.closest('#'+ROOT_ID))return false; try{if(window.ZetaChatDOM?.isInactiveCandidate?.(el))return false;}catch(_){}
      const slide=el.closest('.swiper-slide');if(slide&&!slide.classList.contains('swiper-slide-active'))return false;const st=getComputedStyle(el),r=el.getBoundingClientRect();return st.display!=='none'&&st.visibility!=='hidden'&&r.width>0&&r.height>0;
    }
    function collectUnits(){
      const c=Array.from(document.querySelectorAll(RANGE_SELECTOR));return c.filter(el=>!c.some(other=>other!==el&&other.contains(el))).filter(unitVisible).sort((a,b)=>{const rel=a.compareDocumentPosition(b);return rel&Node.DOCUMENT_POSITION_FOLLOWING?-1:rel&Node.DOCUMENT_POSITION_PRECEDING?1:0;});
    }
    async function recordsForUnit(unit){
      const dom=await resolveChatDOM(); let records=readShared(dom,'extractRecords',unit); if(records.length)return records; records=recordsFromContainer(unit); if(records.length)return records;
      const text=normalizeBlockText(unit.innerText||unit.textContent||''); if(!text)return[]; const c=componentName(unit); const type=/^Right/.test(c)?'user':/^Left/.test(c)?'ai':c.includes('InfoBox')?'status':'narration';return[{type,name:'',text,innerHTML:String(unit.innerHTML||'')}];
    }
    function recordKey(r){
      if(r?.messageId)return `m:${r.messageId}`; if(r?.id)return `i:${r.id}`;
      return `t:${r?.type||''}|n:${r?.name||''}|x:${compactText(r?.text||htmlToTxtPreserve(r?.innerHTML||''))}`;
    }
    function mergeConversationRecords(loaded,current){
      const base=[...(loaded||[])];
      if(!base.length)return [...(current||[])];
      if(!(current||[]).length)return base;
      const keyToIndex=new Map();base.forEach((record,index)=>keyToIndex.set(recordKey(record),index));
      let lastMatched=-1;
      for(const record of current||[]){
        const key=recordKey(record),matched=keyToIndex.get(key);
        if(matched!==undefined){lastMatched=Math.max(lastMatched,matched);base[matched]={...base[matched],...record};continue;}
        // 화면의 활성 대화는 extractLoadedRecords보다 최신인 경우가 많다.
        // 원래 loaded 순서는 건드리지 않고, 새 레코드만 뒤에 붙인다.
        base.push(record);keyToIndex.set(key,base.length-1);
      }
      return base;
    }
    async function allConversationRecords(){
      const dom=await resolveChatDOM();
      const loaded=readShared(dom,'extractLoadedRecords',document);
      const current=readShared(dom,'extractRecords',document);
      let records=mergeConversationRecords(loaded,current);
      if(groupTurns(records).length)return records;
      const fallback=[];for(const unit of collectUnits()){for(const r of await recordsForUnit(unit)){const key=recordKey(r);if(fallback.some(x=>recordKey(x)===key))continue;fallback.push(r);}}
      records=mergeConversationRecords(records,fallback);return records;
    }
    function clearRangeMarks(units=null){
      const list=Array.isArray(units)?units:Array.from(document.querySelectorAll('[data-chat2img-codex-range-hover],[data-chat2img-codex-range-selected],[data-chat2img-codex-range-boundary]'));
      for(const unit of list){
        try{
          unit.removeAttribute('data-chat2img-codex-range-hover');
          unit.removeAttribute('data-chat2img-codex-range-selected');
          unit.removeAttribute('data-chat2img-codex-range-boundary');
        }catch(_){}
      }
    }
    function finishPicker(reopen=true){
      const picker=state.picker;
      if(picker){
        document.removeEventListener('mouseover',picker.over,true);
        document.removeEventListener('mouseout',picker.out,true);
        document.removeEventListener('click',picker.click,true);
        document.removeEventListener('keydown',picker.key,true);
        clearRangeMarks(picker.units);
      }else{
        clearRangeMarks();
      }
      state.picker=null;
      els.rangeBanner.classList.add('hidden');
      if(reopen)setOpen(true);
    }

    async function startRangePicker(){
      finishPicker(false);const units=collectUnits();if(!units.length){setConversationStatus('선택할 대화 말풍선을 찾지 못했습니다.','error');return;}setOpen(false);els.rangeBannerText.textContent='① 시작할 대화 말풍선을 누르세요';els.rangeBanner.classList.remove('hidden');
      let start=-1;const set=new Set(units);const resolve=t=>{let cur=t instanceof Element?t:null;while(cur){if(set.has(cur))return cur;cur=cur.parentElement;}return null;};
      const over=e=>{const u=resolve(e.target);if(u)u.setAttribute('data-chat2img-codex-range-hover','true');};const out=e=>{const u=resolve(e.target);if(u)u.removeAttribute('data-chat2img-codex-range-hover');};
      const key=e=>{if(e.key==='Escape'){e.preventDefault();finishPicker(true);setConversationStatus('구간 선택을 취소했습니다.');}};
      const click=async e=>{
        const u=resolve(e.target);if(!u)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();const idx=units.indexOf(u);
        if(start<0){start=idx;u.setAttribute('data-chat2img-codex-range-boundary','start');els.rangeBannerText.textContent='② 끝낼 대화 말풍선을 누르세요 · 같은 말풍선도 가능';return;}
        const lo=Math.min(start,idx),hi=Math.max(start,idx),selected=units.slice(lo,hi+1);clearRangeMarks(units);selected.forEach(x=>x.setAttribute('data-chat2img-codex-range-selected','true'));units[start].setAttribute('data-chat2img-codex-range-boundary',start===idx?'both':'start');if(start!==idx)u.setAttribute('data-chat2img-codex-range-boundary','end');
        const records=[];for(const item of selected){for(const r of await recordsForUnit(item)){const p=records[records.length-1];if(p&&p.type===r.type&&p.name===r.name&&p.text===r.text)continue;records.push(r);}}
        const text=records.map(renderRecord).filter(Boolean).join('\n\n');finishPicker(true);if(!text){setConversationStatus('선택한 구간에서 대화 내용을 읽지 못했습니다.','error');return;}els.scene.value=text;saveConfig();setConversationStatus(`${selected.length}개 대화 항목을 불러왔습니다.`,'ok');
      };
      state.picker={units,over,out,click,key};document.addEventListener('mouseover',over,true);document.addEventListener('mouseout',out,true);document.addEventListener('click',click,true);document.addEventListener('keydown',key,true);
    }

    function buildPrompt(){const scene=els.scene.value.trim();if(!scene)throw new Error('대화/장면 텍스트가 비어 있습니다.');const genre=GENRE_PROMPTS[els.genre.value]||GENRE_PROMPTS.daily;const style=STYLE_PROMPTS[els.stylePreset.value]||STYLE_PROMPTS.webtoon;const extra=els.extraPrompt.value.trim();const subject=els.modeSolo.checked?(els.soloTarget.value==='persona'?'Solo subject: the user/persona only. Do not depict the character or any other person.':'Solo subject: the main character only. Do not depict the user/persona or any other person.'):'Scene focus: depict the key moment of the selected conversation scene.';return[`Genre direction: ${genre}`,`Visual style: ${style}`,subject,extra?`Additional direction: ${extra}`:'',`Scene description:
${scene}`].filter(Boolean).join('\n\n');}
    function gatherRefs(){return['char','persona','style'].map(slot=>{const ref=state.refs[slot];if(!ref||ref.enabled===false)return null;if(ref.dataUrl)return{slot,dataUrl:ref.dataUrl};if(ref.url)return{slot,url:ref.url};return null;}).filter(Boolean);}

    async function checkStatus(force=false){
      saveConfig();setStatus(els.statusBox,'','확인 중...');try{const res=await fetch(`${bridgeBase()}/status${force?'?refresh=1':''}`);const data=await res.json();const lines=[];lines.push(data.available?'Codex CLI 사용 가능':'Codex CLI 사용 불가');if(data.version)lines.push(data.version);lines.push(data.loggedInWithChatGPT?'ChatGPT 로그인 확인됨':(data.loginStatus||'로그인 확인 필요'));if(data.error)lines.push(data.error);setStatus(els.statusBox,data.available&&data.loggedInWithChatGPT?'ok':'err',lines.join('\n'));}catch(e){setStatus(els.statusBox,'err',e?.message||String(e));}
    }

    function historyImageUrl(item){return joinBridge(item.imagePath||(`/image/${encodeURIComponent(item.filename||'')}`));}
    function addHistory(data){
      const item={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,createdAt:Date.now(),filename:data.filename||'',imagePath:String(data.imageUrl||''),elapsedMs:Number(data.elapsedMs||0)};
      state.history=[item,...state.history.filter(x=>x.filename!==item.filename)].slice(0,HISTORY_LIMIT);saveHistory();renderHistory();
    }
    async function downloadUrl(url,filename){
      const res=await fetch(url);if(!res.ok)throw new Error(`이미지 저장 실패 (HTTP ${res.status})`);const blob=await res.blob();const object=URL.createObjectURL(blob);const a=document.createElement('a');a.href=object;a.download=filename||'codex-image.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(object),1500);
    }
    async function fetchServerHistory(more){
      try{
        const last=more&&state.history.length?state.history[state.history.length-1].createdAt:0;
        const res=await fetch(`${bridgeBase()}/history?limit=60${last?`&before=${last}`:''}`,{cache:'no-store'});
        if(!res.ok)throw new Error('HTTP '+res.status);
        const data=await res.json();if(!data?.ok||!Array.isArray(data.items))throw new Error('bad');
        state.history=more?[...state.history,...data.items.filter(x=>!state.history.some(h=>h.filename===x.filename))]:data.items;
        state.serverHistory=true;state.historyHasMore=!!data.hasMore;state.historyTotal=Number(data.total||0);
      }catch(_){ if(!more){state.serverHistory=false;state.historyHasMore=false;} }
      renderHistory();
    }
    function renderHistory(){
      const label=document.getElementById('historyLabel');
      if(label)label.textContent=state.serverHistory?`모든 기기 이력 · 맥에 저장된 이미지 ${state.historyTotal||state.history.length}개`:'이 기기 이력 (맥 서버 연결 안 됨) · 최대 30개';
      if(!state.history.length){els.historyList.innerHTML='<div class="emptyHistory">생성 이력이 없습니다.</div>';return;}
      els.historyList.innerHTML=`<div class="historyGrid">${state.history.map((item,i)=>`<div class="historyItem"><img class="historyImg" data-himg="${i}" alt="history"><div class="historyInfo">${esc(new Date(item.createdAt).toLocaleString())}</div><div class="historyActions"><button class="tiny" data-open-history="${i}">보기</button><button class="tiny" data-save-history="${i}">저장</button></div></div>`).join('')}</div>${state.serverHistory&&state.historyHasMore?'<div class="row" style="justify-content:center;margin-top:9px"><button class="btn ghost" data-more-history="1">더 보기</button></div>':''}`;
      els.historyList.querySelectorAll('[data-himg]').forEach(img=>{const item=state.history[Number(img.dataset.himg)];img.src=historyImageUrl(item)+'?h='+encodeURIComponent(item.id);img.onerror=()=>{img.style.opacity='.25';};});
    }
    function showHistoryItem(index){
      const item=state.history[index];if(!item)return;state.result={...item,imageUrl:historyImageUrl(item)};els.resultImg.src=state.result.imageUrl+'?h='+encodeURIComponent(item.id);els.resultEmpty.classList.add('hidden');els.resultContent.classList.remove('hidden');els.resultMeta.textContent=`${new Date(item.createdAt).toLocaleString()}${item.filename?' · '+item.filename:''}`;setStatus(els.resultStatus,'','');switchTab('result');
    }

    async function generate(){
      if(state.loading)return;let prompt='';try{saveConfig();prompt=buildPrompt();state.loading=true;els.generate.disabled=true;setStatus(els.runStatus,'','Codex 이미지 생성 중...');
        const payload={prompt,mode:els.modeSolo.checked?'solo':'scene',soloTarget:els.soloTarget.value,sizeHint:els.sizeHint.value,qualityHint:els.qualityHint.value,refs:gatherRefs()};const res=await fetch(`${bridgeBase()}/generate`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const data=await res.json().catch(()=>({ok:false,error:`HTTP ${res.status}`}));if(!res.ok||!data.ok)throw new Error(data.error||`HTTP ${res.status}`);
        const imageUrl=joinBridge(data.imageUrl);state.result={...data,imageUrl,createdAt:Date.now()};els.resultImg.src=imageUrl+'?t='+Date.now();els.resultEmpty.classList.add('hidden');els.resultContent.classList.remove('hidden');els.resultMeta.textContent=`완료 · ${(Number(data.elapsedMs||0)/1000).toFixed(1)}초${data.filename?' · '+data.filename:''}`;const details=[];if(data.warning)details.push(`warning: ${data.warning}`);setStatus(els.resultStatus,details.length?'':'ok',details.join('\n\n')||'이미지 생성 완료');addHistory(data);setStatus(els.runStatus,'ok','이미지 생성 완료');switchTab('result');
      }catch(e){setStatus(els.runStatus,'err',e?.message||String(e));switchTab('create');}finally{state.loading=false;els.generate.disabled=false;}
    }

    hydrate();switchTab(state.activeTab);setOpen(true);renderHistory();if(state.result){};

    function applyFabPosition(pos){
      if(!pos||!Number.isFinite(pos.x)||!Number.isFinite(pos.y))return;const size=30,pad=4;const x=Math.max(pad,Math.min(innerWidth-size-pad,pos.x)),y=Math.max(pad,Math.min(innerHeight-size-pad,pos.y));els.fab.style.left=x+'px';els.fab.style.top=y+'px';els.fab.style.right='auto';els.fab.style.bottom='auto';
    }
    function initFabDrag(){
      applyFabPosition(readStore(FAB_STORE,null));let drag=null,suppressClick=false;
      els.fab.addEventListener('pointerdown',e=>{if(e.button!==undefined&&e.button!==0)return;const rect=els.fab.getBoundingClientRect();drag={id:e.pointerId,startX:e.clientX,startY:e.clientY,left:rect.left,top:rect.top,moved:false};try{els.fab.setPointerCapture(e.pointerId);}catch(_){}e.preventDefault();});
      els.fab.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.startX,dy=e.clientY-drag.startY;if(Math.hypot(dx,dy)>4)drag.moved=true;if(!drag.moved)return;applyFabPosition({x:drag.left+dx,y:drag.top+dy});e.preventDefault();});
      const finish=e=>{if(!drag||e.pointerId!==drag.id)return;const moved=drag.moved;drag=null;if(moved){const r=els.fab.getBoundingClientRect();writeStore(FAB_STORE,{x:r.left,y:r.top});suppressClick=true;setTimeout(()=>{suppressClick=false;},80);}else if(!suppressClick)toggle();};
      els.fab.addEventListener('pointerup',finish);els.fab.addEventListener('pointercancel',e=>{drag=null;});
      addEventListener('resize',()=>{const r=els.fab.getBoundingClientRect();if(els.fab.style.left)applyFabPosition({x:r.left,y:r.top});});
    }
    shadow.querySelectorAll('.tab').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn.dataset.tab)));
    initFabDrag();els.close.addEventListener('click',()=>setOpen(false));els.pickRange.addEventListener('click',()=>startRangePicker().catch(e=>setConversationStatus(e?.message||String(e),'error')));els.clearScene.addEventListener('click',()=>{els.scene.value='';saveConfig();setConversationStatus('대화 내용을 지웠습니다.');});els.rangeCancel.addEventListener('click',()=>{finishPicker(true);setConversationStatus('구간 선택을 취소했습니다.');});
    els.checkStatus.addEventListener('click',()=>checkStatus(true));els.generate.addEventListener('click',generate);els.backCreate.addEventListener('click',()=>switchTab('create'));
    els.saveImage.addEventListener('click',()=>{if(!state.result?.imageUrl)return;downloadUrl(state.result.imageUrl,state.result.filename||'codex-image.png').catch(e=>setStatus(els.resultStatus,'err',e?.message||String(e)));});
    els.clearHistory.addEventListener('click',async()=>{if(!state.history.length)return;
      if(state.serverHistory){if(!confirm('모든 기기의 이력 목록을 비울까요?\n맥에 저장된 이미지 파일은 지우지 않습니다.'))return;try{await fetch(`${bridgeBase()}/history/clear`,{method:'POST'});}catch(_){}}
      else if(!confirm('이 기기의 이력 목록을 비울까요?\n서버의 원본 이미지 파일은 삭제하지 않습니다.'))return;
      state.history=[];state.historyHasMore=false;state.historyTotal=0;saveHistory();renderHistory();});
    els.historyList.addEventListener('click',e=>{const more=e.target.closest?.('[data-more-history]');if(more){more.disabled=true;more.textContent='불러오는 중…';fetchServerHistory(true);return;}const open=e.target.closest?.('[data-open-history]'),save=e.target.closest?.('[data-save-history]');if(open){showHistoryItem(Number(open.dataset.openHistory));return;}if(save){const item=state.history[Number(save.dataset.saveHistory)];if(item)downloadUrl(historyImageUrl(item),item.filename||'codex-image.png').catch(err=>alert(err?.message||String(err)));}});
    for(const el of [els.baseUrl,els.scene,els.soloTarget,els.genre,els.stylePreset,els.sizeHint,els.qualityHint,els.extraPrompt]){el.addEventListener('change',saveConfig);el.addEventListener('input',saveConfig);}
    shadow.querySelectorAll('[data-pick]').forEach(btn=>btn.addEventListener('click',()=>pickFile(btn.dataset.pick).catch(e=>alert(e?.message||String(e)))));shadow.querySelectorAll('[data-clipboard]').forEach(btn=>btn.addEventListener('click',()=>readClipboardImage(btn.dataset.clipboard).catch(e=>alert(e?.message||String(e)))));shadow.querySelectorAll('[data-clear]').forEach(btn=>btn.addEventListener('click',()=>snapshotRef(btn.dataset.clear,null)));
    shadow.querySelectorAll('[data-url-apply]').forEach(btn=>btn.addEventListener('click',()=>{const slot=btn.dataset.urlApply;const input=slot==='char'?els.charUrl:els.personaUrl;try{applyRefUrl(slot,input.value,slot==='char'?'캐릭터 URL':'유저 URL');}catch(e){alert(e?.message||String(e));}}));
    [['char',els.charUse],['persona',els.personaUse],['style',els.styleUse]].forEach(([slot,input])=>input.addEventListener('change',()=>{if(state.refs[slot])state.refs[slot].enabled=input.checked;}));
    els.loadProfiles.addEventListener('click',()=>loadProfileRefs(true));
    loadProfileRefs(false);

    // Do not block UI while checking the bridge.
    checkStatus(false);

    window[KEY]={version:VERSION,toggle,destroy(){finishPicker(false);try{rangeStyle.remove();}catch(_){}try{wrap.remove();}catch(_){}try{delete window[KEY];}catch(_){window[KEY]=undefined;}}};
  } catch(error){
    console.error('[Chat2Img-Codex] boot failed',error);
    try{alert('[Chat2Img-Codex] 실행 실패\n'+(error?.stack||error?.message||String(error)));}catch(_){}
  }
})();
// END BUNDLED CORE
Promise.resolve(coreBoot).then(()=>{
  const root=document.getElementById('chat2img-codex-root');
  const fab=root?.shadowRoot?.querySelector('.fab');
  if(!window.__CHAT2IMG_CODEX__||!fab)throw new Error('본체가 버튼을 생성하지 못했습니다.');
  collapsePanel(1);
  bootNotice.remove();
  window.__C2I_CODEX_BUNDLED_BOOTING__=false;
  console.log('[Chat2Img-Codex] 본체 내장 버전 1.11.1 실행 완료');
}).catch(reportBootFailure);
})();