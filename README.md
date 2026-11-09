# zeta-scripts

제타(zeta-ai.io)용 유저스크립트 모음.

## 기기에 까는 것
각 기기 Tampermonkey에 **마스터 로더 하나만** 설치:

https://vivianchoiey.github.io/zeta-scripts/loader/zeta-master.user.js

## 켜고 끄기
제타 페이지에서 Tampermonkey 아이콘 → 메뉴에 스크립트 목록이 ✅/⬜로 뜸 → 눌러서 켜기/끄기 (기기마다 따로 저장).

## 구조
- `manifest.json` — 스크립트 목록 (이름, 파일, 실행 시점, 그룹, 기본 켜짐 여부)
- `scripts/` — 실제 스크립트
- `loader/zeta-master.user.js` — 기기에 까는 로더

## 로더로 안 옮기고 따로 까는 것
- 제타 익명 캡처 (Tampermonkey 전용 기능 사용)
- 다음카페 댓글 사진 전체저장 (제타 아님)
