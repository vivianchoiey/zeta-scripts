// ==UserScript==

// @name Font Tuner
// @namespace font-tuner
// @version 1.3.1
// @description 채팅 폰트, 크기, 행간, 굵기 설정 및 사용자 폰트 추가
// @match https://zeta-ai.io/*
// @match https://*.zeta-ai.io/*
// @grant none
// @run-at document-start
// ==/UserScript==

(() => {
'use strict';

const STYLE_ID = 'fontTunerAppliedStyle';
const PREVIEW_STYLE_ID = 'fontTunerPreviewStyle';
const HOST_ID = 'font-tuner-host';

const SETTINGS_KEY = 'zeta_font_manager_settings';
const CUSTOM_FONTS_KEY = 'zeta_font_manager_custom_fonts';
const BUTTON_POSITION_KEY = 'zeta_font_manager_button_position';
const THEME_KEY = 'font_tuner_theme';

const DB_NAME = 'font_tuner_db';
const DB_STORE = 'font_files';
const DB_VERSION = 1;

const DEFAULT_SETTINGS = {
font: 'page',
size: '15',
lineHeight: '1.6',
weight: 'default'
};

const BUILTIN_FONTS = {
page: {
name: '제타 기본',
family: null,
faces: []
},

ridibatang: {
name: '리디바탕',
family:
"'FontTunerRIDIBatang','Apple SD Gothic Neo',serif",
faces: [
{
family: 'FontTunerRIDIBatang',
url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_twelve@1.0/RIDIBatang.woff',
format: 'woff',
weight: '400'
}
]
},

chosun: {
name: '조선굴림',
family:
"'FontTunerChosunGulim','Apple SD Gothic Neo',sans-serif",
faces: [
{
family: 'FontTunerChosunGulim',
url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-04@1.0/ChosunGu.woff',
format: 'woff',
weight: '400'
}
]
},

nanum: {
name: '나눔스퀘어라운드',
family:
"'FontTunerNanumSquareRound','Apple SD Gothic Neo',sans-serif",
faces: [
{
family: 'FontTunerNanumSquareRound',
url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_two@1.0/NanumSquareRound.woff',
format: 'woff',
weight: '400'
}
]
},

paperlogy: {
name: '페이퍼로지',
family:
"'FontTunerPaperlogy','Apple SD Gothic Neo',sans-serif",
faces: [
{
family: 'FontTunerPaperlogy',
url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/2408-3@1.0/Paperlogy-3Light.woff2',
format: 'woff2',
weight: '300'
}
]
},

universe: {
name: '학교안심 우주',
family:
"'FontTunerSchoolSafeUniverse','Apple SD Gothic Neo',sans-serif",
faces: [
{
family: 'FontTunerSchoolSafeUniverse',
url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2307-2@1.0/HakgyoansimWoojuR.woff2',
format: 'woff2',
weight: '400'
}
]
},

nixgon: {
name: '닉스곤',
family:
"'FontTunerNixgon','Apple SD Gothic Neo',sans-serif",
faces: [
{
family: 'FontTunerNixgon',
url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/NIXGONL-Vb.woff',
format: 'woff',
weight: '300'
},
{
family: 'FontTunerNixgon',
url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/NIXGONM-Vb.woff',
format: 'woff',
weight: '500'
},
{
family: 'FontTunerNixgon',
url: 'https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/NIXGONB-Vb.woff',
format: 'woff',
weight: '700'
}
]
}
};

const TARGETS = [
'[data-sentry-component="ChatBubbleContainer"]',
'[data-sentry-component="ChatBubbleContainer"] *',

'[data-sentry-component="NarratorBubble"]',
'[data-sentry-component="NarratorBubble"] *',

'[data-sentry-source-file="NarratorBubble.tsx"]',
'[data-sentry-source-file="NarratorBubble.tsx"] *',

'[data-sentry-component="InfoBoxContentView"]',
'[data-sentry-component="InfoBoxContentView"] *',

'[data-sentry-component="InfoBoxExpandedContent"]',
'[data-sentry-component="InfoBoxExpandedContent"] *',

'[data-sentry-component="InfoBoxContent"]',
'[data-sentry-component="InfoBoxContent"] *',

'[data-sentry-source-file="InfoBoxContentView.tsx"]',
'[data-sentry-source-file="InfoBoxContentView.tsx"] *',

'[data-sentry-source-file="InfoBoxExpandedContent.tsx"]',
'[data-sentry-source-file="InfoBoxExpandedContent.tsx"] *',

'[data-sentry-source-file="InfoBoxContent.tsx"]',
'[data-sentry-source-file="InfoBoxContent.tsx"] *',

'[class*="bg-bubble-user"]',
'[class*="bg-bubble-user"] *',

'.self-end[class*="rounded-l-xl"]',
'.self-end[class*="rounded-l-xl"] *',

'[class*="bg-gray-sub1"]',
'[class*="bg-gray-sub1"] *',

'.self-start[class*="bg-white"]',
'.self-start[class*="bg-white"] *',

'.self-start[class*="bg-gray"]',
'.self-start[class*="bg-gray"] *',

'textarea[name="message"]',
'textarea[testid="chat-message-input"]',
'textarea[data-testid="chat-message-input"]'
].join(',');

let settings = loadSettings();
let customFonts = loadCustomFonts();

let appliedBlobUrl = null;
let previewBlobUrl = null;

let applySequence = 0;
let previewSequence = 0;

function safeJsonParse(value, fallback) {
try {
return JSON.parse(value);
} catch {
return fallback;
}
}

function cssString(value) {
return String(value)
.replace(/\\/g, '\\\\')
.replace(/"/g, '\\"');
}

function loadTheme() {
return localStorage.getItem(THEME_KEY) === 'dark'
? 'dark'
: 'light';
}

function saveTheme(theme) {
localStorage.setItem(THEME_KEY, theme);
}

function loadSettings() {
const saved = safeJsonParse(
localStorage.getItem(SETTINGS_KEY),
null
);

if (saved) {
const merged = {
...DEFAULT_SETTINGS,
...saved
};

if (
merged.font === 'system' ||
merged.font === 'pretendard'
) {
merged.font = 'page';
}

if (!['default', 'bold'].includes(merged.weight)) {
merged.weight =
merged.weight === '700'
? 'bold'
: 'default';
}

return merged;
}

const old = (
localStorage.getItem('zeta_bubble_font') || ''
).split(',');

if (old[0] || old[1]) {
return {
...DEFAULT_SETTINGS,
size: (old[0] || '15').trim(),
lineHeight: (old[1] || '1.6').trim()
};
}

return {
...DEFAULT_SETTINGS
};
}

function saveSettings() {
localStorage.setItem(
SETTINGS_KEY,
JSON.stringify(settings)
);

localStorage.setItem(
'zeta_bubble_font',
`${settings.size},${settings.lineHeight}`
);
}

function loadCustomFonts() {
const saved = safeJsonParse(
localStorage.getItem(CUSTOM_FONTS_KEY),
[]
);

if (!Array.isArray(saved)) {
return [];
}

return saved
.filter(
font =>
font &&
font.id &&
font.name
)
.map(font => {
if (
font.type === 'file' ||
font.type === 'url'
) {
return font;
}

if (font.url) {
return {
...font,
type: 'url'
};
}

return null;
})
.filter(Boolean);
}

function saveCustomFonts() {
localStorage.setItem(
CUSTOM_FONTS_KEY,
JSON.stringify(customFonts)
);
}

function openFontDb() {
return new Promise((resolve, reject) => {
const request = indexedDB.open(
DB_NAME,
DB_VERSION
);

request.onupgradeneeded = () => {
const db = request.result;

if (!db.objectStoreNames.contains(DB_STORE)) {
db.createObjectStore(DB_STORE);
}
};

request.onsuccess = () => {
resolve(request.result);
};

request.onerror = () => {
reject(request.error);
};
});
}

async function saveFontFile(id, file) {
const db = await openFontDb();

return new Promise((resolve, reject) => {
const tx = db.transaction(
DB_STORE,
'readwrite'
);

tx.objectStore(DB_STORE).put(
file,
id
);

tx.oncomplete = () => {
db.close();
resolve();
};

tx.onerror = () => {
const error = tx.error;

db.close();
reject(error);
};
});
}

async function getFontFile(id) {
const db = await openFontDb();

return new Promise((resolve, reject) => {
const tx = db.transaction(
DB_STORE,
'readonly'
);

const request =
tx.objectStore(DB_STORE).get(id);

request.onsuccess = () => {
const result = request.result;

db.close();

resolve(result || null);
};

request.onerror = () => {
const error = request.error;

db.close();
reject(error);
};
});
}

async function deleteFontFile(id) {
const db = await openFontDb();

return new Promise((resolve, reject) => {
const tx = db.transaction(
DB_STORE,
'readwrite'
);

tx.objectStore(DB_STORE).delete(id);

tx.oncomplete = () => {
db.close();
resolve();
};

tx.onerror = () => {
const error = tx.error;

db.close();
reject(error);
};
});
}

function getCustomFont(id) {
return customFonts.find(
font => font.id === id
);
}

function getSelectedFont(fontId) {
if (
typeof fontId === 'string' &&
BUILTIN_FONTS[fontId]
) {
return {
type: 'builtin',
id: fontId,
...BUILTIN_FONTS[fontId]
};
}

if (
typeof fontId === 'string' &&
fontId.startsWith('custom:')
) {
const id = fontId.slice(7);

const font =
getCustomFont(id);

if (font) {
return {
...font,
id,
custom: true
};
}
}

return {
type: 'builtin',
id: 'page',
...BUILTIN_FONTS.page
};
}

function builtinFontFaceCss(font) {
if (
!Array.isArray(font.faces) ||
!font.faces.length
) {
return '';
}

return font.faces
.map(face => `
@font-face {
font-family: "${cssString(face.family)}";
src:
url("${cssString(face.url)}")
format("${cssString(face.format)}");
font-weight: ${face.weight || '400'};
font-style: normal;
font-display: swap;
}
`)
.join('\n');
}

async function prepareFont(font) {
if (!font) {
return {
css: '',
family: null,
objectUrl: null
};
}

if (font.type === 'builtin') {
return {
css:
builtinFontFaceCss(font),

family:
font.family,

objectUrl:
null
};
}

if (font.type === 'file') {
let blob = null;

try {
blob =
await getFontFile(font.id);
} catch {}

if (!blob) {
return {
css: '',
family:
'"Apple SD Gothic Neo",sans-serif',
objectUrl: null
};
}

const objectUrl =
URL.createObjectURL(blob);

const family =
`FontTunerCustom_${font.id}`;

return {
css: `
@font-face {
font-family: "${cssString(family)}";
src: url("${cssString(objectUrl)}");
font-weight: 400;
font-style: normal;
font-display: swap;
}
`,

family:
`"${cssString(family)}","Apple SD Gothic Neo",sans-serif`,

objectUrl
};
}

if (font.type === 'url') {
const family =
`FontTunerCustom_${font.id}`;

return {
css: `
@font-face {
font-family: "${cssString(family)}";
src: url("${cssString(font.url)}");
font-weight: 400;
font-style: normal;
font-display: swap;
}
`,

family:
`"${cssString(family)}","Apple SD Gothic Neo",sans-serif`,

objectUrl: null
};
}

return {
css: '',
family: null,
objectUrl: null
};
}

function getNativePageFont() {
const sample =
document.querySelector(
'[data-sentry-component="ChatBubbleContainer"]'
) ||
document.querySelector(
'[data-sentry-component="NarratorBubble"]'
);

if (!sample) {
return '"Apple SD Gothic Neo",sans-serif';
}

const style =
document.getElementById(STYLE_ID);

const sheet =
style?.sheet || null;

let disabled = false;

try {
if (sheet) {
disabled =
sheet.disabled;

sheet.disabled =
true;
}

return getComputedStyle(
sample
).fontFamily;
} catch {
return '"Apple SD Gothic Neo",sans-serif';
} finally {
if (sheet) {
try {
sheet.disabled =
disabled;
} catch {}
}
}
}

async function applySettings() {
if (!document.head) {
requestAnimationFrame(
() => applySettings()
);

return;
}

const sequence =
++applySequence;

const font =
getSelectedFont(
settings.font
);

const prepared =
await prepareFont(font);

if (
sequence !==
applySequence
) {
if (prepared.objectUrl) {
URL.revokeObjectURL(
prepared.objectUrl
);
}

return;
}

if (appliedBlobUrl) {
URL.revokeObjectURL(
appliedBlobUrl
);

appliedBlobUrl =
null;
}

appliedBlobUrl =
prepared.objectUrl || null;

document
.querySelectorAll(
`#${STYLE_ID},` +
'style[id^="zetaFont"],' +
'#zetaFontSizeOverride,' +
'style[data-line-font]'
)
.forEach(element => {
try {
element.remove();
} catch {}
});

const size =
Number(settings.size) || 15;

const lineHeight =
Number(
settings.lineHeight
) || 1.6;

const familyCss =
prepared.family
? `font-family:${prepared.family}!important;`
: '';

const weightCss =
settings.weight === 'bold'
? 'font-weight:700!important;'
: '';

const style =
document.createElement('style');

style.id =
STYLE_ID;

style.textContent = `
${prepared.css}

${TARGETS} {
${familyCss}
font-size:${size}px!important;
line-height:${lineHeight}!important;
${weightCss}
}
`;

document.head.appendChild(
style
);
}

function createUi() {
if (!document.documentElement) {
requestAnimationFrame(
createUi
);

return;
}

if (
document.getElementById(
HOST_ID
)
) {
return;
}

const host =
document.createElement('div');

host.id =
HOST_ID;

Object.assign(
host.style,
{
position: 'fixed',
inset: '0',
width: '0',
height: '0',
zIndex:
'2147483647'
}
);

document.documentElement
.appendChild(host);

const shadow =
host.attachShadow({
mode: 'open'
});

const style =
document.createElement('style');

style.textContent = `
:host {
all: initial;
}

* {
box-sizing: border-box;
}

button,
input,
select,
div,
span,
label {
font-family:
-apple-system,
BlinkMacSystemFont,
"Apple SD Gothic Neo",
Arial,
sans-serif;
}

#launcher {
position: fixed;

right: 12px;
bottom: 90px;

width: 25px;
height: 25px;

min-width: 25px;
min-height: 25px;

padding: 0;
margin: 0;

border:
1px solid
rgba(0,0,0,.14);

border-radius:
999px;

background:
rgba(255,255,255,.90);

color: #333;

box-shadow:
0 2px 8px
rgba(0,0,0,.14);

backdrop-filter:
blur(8px);

-webkit-backdrop-filter:
blur(8px);

display: flex;
align-items: center;
justify-content: center;

font-size: 9px;
font-weight: 700;
line-height: 1;

opacity: .80;

cursor: grab;

user-select: none;
-webkit-user-select: none;

touch-action: none;
}

#launcher:active {
opacity: 1;
}

#backdrop {
position: fixed;
inset: 0;

width: 100vw;
height: 100dvh;

background:
rgba(15,15,20,.42);

opacity: 0;

animation:
fadeIn .18s
ease forwards;

touch-action:
manipulation;
}

#sheet {
position: fixed;

left: 50%;
bottom: 0;

transform:
translateX(-50%);

width:
min(100vw, 430px);

max-height:
min(86dvh, 720px);

overflow-y: auto;

overscroll-behavior:
contain;

-webkit-overflow-scrolling:
touch;

padding:
8px 16px
max(
16px,
env(safe-area-inset-bottom)
);

background: #fff;
color: #17171b;

border-radius:
22px 22px
0 0;

box-shadow:
0 -8px 32px
rgba(0,0,0,.18);

font-size: 12px;

animation:
slideUp .22s
cubic-bezier(
.2,.8,.2,1
);
}

@keyframes fadeIn {
to {
opacity: 1;
}
}

@keyframes slideUp {
from {
transform:
translate(
-50%,
30px
);

opacity: .4;
}

to {
transform:
translate(
-50%,
0
);

opacity: 1;
}
}

#handle {
width: 34px;
height: 4px;

margin:
2px auto
10px;

border-radius:
999px;

background:
#d5d5da;
}

#header {
display: flex;
align-items: center;
justify-content:
space-between;

margin-bottom: 12px;
}

#title {
font-size: 15px;
font-weight: 750;
letter-spacing:
-.2px;
}

#headerActions {
display: flex;
align-items: center;
gap: 6px;
}

#themeToggle,
#close {
width: 28px;
height: 28px;

min-width: 28px;

padding: 0;
margin: 0;

border: 0;
border-radius:
999px;

background:
#f1f1f4;

color: #555;

display: flex;
align-items: center;
justify-content: center;

line-height: 1;
}

#themeToggle {
font-size: 15px;
}

#close {
font-size: 16px;
}

#preview {
min-height: 92px;

padding: 14px;

border:
1px solid
#ececf0;

border-radius: 14px;

background:
linear-gradient(
145deg,
#fafafa,
#f4f4f7
);

color: #202024;

white-space:
pre-wrap;
}

#previewTitle {
margin-bottom: 7px;

color: #8a8a91;

font-size: 10px;
font-weight: 600;
}

#previewText {
white-space:
pre-wrap;
}

.section {
margin-top: 15px;
}

.sectionTitle {
margin-bottom: 7px;

color: #74747b;

font-size: 10px;
font-weight: 700;

letter-spacing:
.3px;

text-transform:
uppercase;
}

select,
input {
width: 100%;
height: 38px;

padding:
7px 10px;

border:
1px solid
#dedee3;

border-radius:
10px;

outline: none;

background: #fff;
color: #19191d;

font-size: 12px;
}

select:focus,
input:focus {
border-color:
#9999a0;
}

#fontTools {
display: flex;

gap: 7px;

margin-top: 7px;
}

.softButton {
flex: 1;

min-height: 32px;

padding:
7px 9px;

border: 0;

border-radius:
9px;

background:
#f2f2f5;

color: #404046;

font-size: 11px;
font-weight: 650;
}

#deleteFont {
color: #c74343;
}

#deleteFont:disabled {
opacity: .35;
}

#metrics {
display: grid;

grid-template-columns:
1fr 1fr;

gap: 8px;
}

.metricLabel {
display: block;

margin-bottom: 5px;

color: #66666d;

font-size: 10px;
font-weight: 650;
}

#weightControl {
display: grid;

grid-template-columns:
1fr 1fr;

gap: 4px;

padding: 4px;

border-radius:
11px;

background:
#f1f1f4;
}

.weightButton {
height: 32px;

border: 0;

border-radius:
8px;

background:
transparent;

color: #6d6d74;

font-size: 11px;
font-weight: 650;
}

.weightButton.active {
background: #fff;
color: #17171b;

box-shadow:
0 1px 4px
rgba(0,0,0,.10);
}

#addPanel {
display: none;

margin-top: 8px;
padding: 11px;

border:
1px solid
#e7e7eb;

border-radius:
12px;

background:
#fafafa;
}

#addPanel.open {
display: block;
}

#sourceControl {
display: grid;

grid-template-columns:
1fr 1fr;

gap: 4px;

padding: 4px;

margin-bottom: 9px;

border-radius:
10px;

background:
#eeeef1;
}

.sourceButton {
height: 29px;

border: 0;

border-radius:
7px;

background:
transparent;

color: #6c6c72;

font-size: 11px;
font-weight: 650;
}

.sourceButton.active {
background: #fff;
color: #17171b;

box-shadow:
0 1px 3px
rgba(0,0,0,.10);
}

.fieldLabel {
display: block;

margin:
9px 0 5px;

color: #66666d;

font-size: 10px;
font-weight: 650;
}

#fileInput {
height: auto;
padding: 6px;
}

#urlArea {
display: none;
}

#help {
margin-top: 6px;

color: #85858c;

font-size: 9px;
line-height: 1.45;
}

#addConfirm {
width: 100%;
height: 34px;

margin-top: 10px;

border: 0;
border-radius:
9px;

background:
#29292e;

color: #fff;

font-size: 11px;
font-weight: 650;
}

#footer {
position: sticky;
bottom: 0;

display: grid;

grid-template-columns:
.8fr 1.5fr;

gap: 8px;

margin-top: 17px;

padding-top: 8px;

background:
linear-gradient(
to bottom,
rgba(255,255,255,0),
#fff 22%
);
}

#reset {
height: 38px;

border: 0;
border-radius:
10px;

background:
#f1f1f4;

color: #55555c;

font-size: 11px;
font-weight: 650;
}

#apply {
height: 38px;

border: 0;
border-radius:
10px;

background:
#1f1f23;

color: #fff;

font-size: 11px;
font-weight: 700;
}

#sheet.dark {
background: #1c1c1f;
color: #f4f4f5;
}

#sheet.dark #handle {
background: #55555c;
}

#sheet.dark #themeToggle,
#sheet.dark #close {
background: #303035;
color: #eeeeef;
}

#sheet.dark #preview {
border-color: #37373d;

background:
linear-gradient(
145deg,
#27272c,
#222226
);

color: #f0f0f2;
}

#sheet.dark #previewTitle,
#sheet.dark .sectionTitle,
#sheet.dark .metricLabel,
#sheet.dark .fieldLabel {
color: #aaaab1;
}

#sheet.dark select,
#sheet.dark input {
border-color: #414147;

background: #29292e;
color: #f4f4f5;

color-scheme: dark;
}

#sheet.dark .softButton {
background: #303035;
color: #e2e2e5;
}

#sheet.dark #deleteFont {
color: #ff7b7b;
}

#sheet.dark #weightControl,
#sheet.dark #sourceControl {
background: #29292e;
}

#sheet.dark .weightButton,
#sheet.dark .sourceButton {
color: #aaaab1;
}

#sheet.dark .weightButton.active,
#sheet.dark .sourceButton.active {
background: #424248;
color: #fff;

box-shadow:
0 1px 4px
rgba(0,0,0,.30);
}

#sheet.dark #addPanel {
border-color: #39393f;
background: #242428;
}

#sheet.dark #help {
color: #96969e;
}

#sheet.dark #addConfirm {
background: #ededf0;
color: #1d1d21;
}

#sheet.dark #footer {
background:
linear-gradient(
to bottom,
rgba(28,28,31,0),
#1c1c1f 22%
);
}

#sheet.dark #reset {
background: #303035;
color: #d4d4d8;
}

#sheet.dark #apply {
background: #f1f1f3;
color: #1c1c20;
}
`;

shadow.appendChild(style);

const launcher =
document.createElement('button');

launcher.id =
'launcher';

launcher.type =
'button';

launcher.textContent =
'Aa';

launcher.title =
'폰트 튜너';

shadow.appendChild(
launcher
);

restoreButtonPosition(
launcher
);

setupButtonDrag(
launcher,
openPanel
);

launcher.addEventListener(
'click',
event => {
event.preventDefault();
event.stopPropagation();
}
);

function openPanel() {
shadow
.getElementById(
'backdrop'
)
?.remove();

let selectedWeight =
settings.weight === 'bold'
? 'bold'
: 'default';

let sourceMode =
'file';

let currentTheme =
loadTheme();

const openedAt =
performance.now();

const backdrop =
document.createElement(
'div'
);

backdrop.id =
'backdrop';

const sheet =
document.createElement(
'div'
);

sheet.id =
'sheet';

sheet.classList.toggle(
'dark',
currentTheme === 'dark'
);

backdrop.appendChild(
sheet
);

shadow.appendChild(
backdrop
);

[
'pointerdown',
'pointerup',
'click'
].forEach(type => {
sheet.addEventListener(
type,
event => {
event.stopPropagation();
}
);
});

const handle =
document.createElement(
'div'
);

handle.id =
'handle';

sheet.appendChild(
handle
);

const header =
document.createElement(
'div'
);

header.id =
'header';

const title =
document.createElement(
'div'
);

title.id =
'title';

title.textContent =
'폰트 튜너';

const headerActions =
document.createElement(
'div'
);

headerActions.id =
'headerActions';

const themeToggle =
document.createElement(
'button'
);

themeToggle.id =
'themeToggle';

themeToggle.type =
'button';

const close =
document.createElement(
'button'
);

close.id =
'close';

close.type =
'button';

close.textContent =
'×';

function updateThemeUi() {
const isDark =
currentTheme ===
'dark';

sheet.classList.toggle(
'dark',
isDark
);

/*
* 현재 다크 → ☼ 표시
* 현재 라이트 → ☾ 표시
*/
themeToggle.textContent =
isDark
? '☼'
: '☾';

themeToggle.title =
isDark
? '라이트 모드'
: '다크 모드';

themeToggle.setAttribute(
'aria-label',
themeToggle.title
);
}

themeToggle.addEventListener(
'click',
() => {
currentTheme =
currentTheme === 'dark'
? 'light'
: 'dark';

saveTheme(
currentTheme
);

updateThemeUi();
}
);

updateThemeUi();

headerActions.append(
themeToggle,
close
);

header.append(
title,
headerActions
);

sheet.appendChild(
header
);

const preview =
document.createElement(
'div'
);

preview.id =
'preview';

const previewTitle =
document.createElement(
'div'
);

previewTitle.id =
'previewTitle';

previewTitle.textContent =
'PREVIEW';

const previewText =
document.createElement(
'div'
);

previewText.id =
'previewText';

previewText.textContent =
'가나다라마바사 ABC abc 123\n대화가 이렇게 표시됩니다.';

preview.append(
previewTitle,
previewText
);

sheet.appendChild(
preview
);

const fontSection =
document.createElement(
'div'
);

fontSection.className =
'section';

const fontSectionTitle =
document.createElement(
'div'
);

fontSectionTitle.className =
'sectionTitle';

fontSectionTitle.textContent =
'FONT';

const fontSelect =
document.createElement(
'select'
);

const fontTools =
document.createElement(
'div'
);

fontTools.id =
'fontTools';

const addFont =
document.createElement(
'button'
);

addFont.className =
'softButton';

addFont.type =
'button';

addFont.textContent =
'+ 폰트 추가';

const deleteFont =
document.createElement(
'button'
);

deleteFont.id =
'deleteFont';

deleteFont.className =
'softButton';

deleteFont.type =
'button';

deleteFont.textContent =
'삭제';

fontTools.append(
addFont,
deleteFont
);

fontSection.append(
fontSectionTitle,
fontSelect,
fontTools
);

sheet.appendChild(
fontSection
);

const addPanel =
document.createElement(
'div'
);

addPanel.id =
'addPanel';

const sourceControl =
document.createElement(
'div'
);

sourceControl.id =
'sourceControl';

const fileModeButton =
document.createElement(
'button'
);

fileModeButton.type =
'button';

fileModeButton.className =
'sourceButton active';

fileModeButton.textContent =
'파일';

const urlModeButton =
document.createElement(
'button'
);

urlModeButton.type =
'button';

urlModeButton.className =
'sourceButton';

urlModeButton.textContent =
'URL';

sourceControl.append(
fileModeButton,
urlModeButton
);

const fileArea =
document.createElement(
'div'
);

const fileLabel =
document.createElement(
'span'
);

fileLabel.className =
'fieldLabel';

fileLabel.textContent =
'폰트 파일';

const fileInput =
document.createElement(
'input'
);

fileInput.id =
'fileInput';

fileInput.type =
'file';

fileInput.accept =
'.woff,.woff2,.ttf,.otf,font/woff,font/woff2,font/ttf,font/otf';

fileArea.append(
fileLabel,
fileInput
);

const urlArea =
document.createElement(
'div'
);

urlArea.id =
'urlArea';

const urlLabel =
document.createElement(
'span'
);

urlLabel.className =
'fieldLabel';

urlLabel.textContent =
'폰트 URL';

const urlInput =
document.createElement(
'input'
);

urlInput.type =
'url';

urlInput.placeholder =
'https://.../font.woff2';

urlArea.append(
urlLabel,
urlInput
);

const nameLabel =
document.createElement(
'span'
);

nameLabel.className =
'fieldLabel';

nameLabel.textContent =
'표시 이름';

const nameInput =
document.createElement(
'input'
);

nameInput.type =
'text';

nameInput.placeholder =
'예: 내 폰트';

const help =
document.createElement(
'div'
);

help.id =
'help';

help.textContent =
'폰트 파일은 이 브라우저에 저장되어 새로고침 후에도 유지됩니다.';

const addConfirm =
document.createElement(
'button'
);

addConfirm.id =
'addConfirm';

addConfirm.type =
'button';

addConfirm.textContent =
'폰트 추가';

addPanel.append(
sourceControl,
fileArea,
urlArea,
nameLabel,
nameInput,
help,
addConfirm
);

sheet.appendChild(
addPanel
);

const styleSection =
document.createElement(
'div'
);

styleSection.className =
'section';

const styleSectionTitle =
document.createElement(
'div'
);

styleSectionTitle.className =
'sectionTitle';

styleSectionTitle.textContent =
'STYLE';

const metrics =
document.createElement(
'div'
);

metrics.id =
'metrics';

const sizeBox =
document.createElement(
'div'
);

const sizeLabel =
document.createElement(
'span'
);

sizeLabel.className =
'metricLabel';

sizeLabel.textContent =
'글씨 크기';

const sizeInput =
document.createElement(
'input'
);

sizeInput.type =
'number';

sizeInput.min =
'8';

sizeInput.max =
'40';

sizeInput.step =
'1';

sizeInput.value =
settings.size;

sizeBox.append(
sizeLabel,
sizeInput
);

const lineBox =
document.createElement(
'div'
);

const lineLabel =
document.createElement(
'span'
);

lineLabel.className =
'metricLabel';

lineLabel.textContent =
'행간';

const lineInput =
document.createElement(
'input'
);

lineInput.type =
'number';

lineInput.min =
'0.8';

lineInput.max =
'3';

lineInput.step =
'0.1';

lineInput.value =
settings.lineHeight;

lineBox.append(
lineLabel,
lineInput
);

metrics.append(
sizeBox,
lineBox
);

const weightLabel =
document.createElement(
'span'
);

weightLabel.className =
'metricLabel';

weightLabel.style.marginTop =
'10px';

weightLabel.textContent =
'글씨 굵기';

const weightControl =
document.createElement(
'div'
);

weightControl.id =
'weightControl';

const normalButton =
document.createElement(
'button'
);

normalButton.type =
'button';

normalButton.className =
'weightButton';

normalButton.textContent =
'기본';

const boldButton =
document.createElement(
'button'
);

boldButton.type =
'button';

boldButton.className =
'weightButton';

boldButton.textContent =
'굵게';

weightControl.append(
normalButton,
boldButton
);

styleSection.append(
styleSectionTitle,
metrics,
weightLabel,
weightControl
);

sheet.appendChild(
styleSection
);

const footer =
document.createElement(
'div'
);

footer.id =
'footer';

const reset =
document.createElement(
'button'
);

reset.id =
'reset';

reset.type =
'button';

reset.textContent =
'초기화';

const apply =
document.createElement(
'button'
);

apply.id =
'apply';

apply.type =
'button';

apply.textContent =
'적용';

footer.append(
reset,
apply
);

sheet.appendChild(
footer
);

function closePanel() {
++previewSequence;

document
.getElementById(
PREVIEW_STYLE_ID
)
?.remove();

if (previewBlobUrl) {
URL.revokeObjectURL(
previewBlobUrl
);

previewBlobUrl =
null;
}

backdrop.remove();
}

function refreshFontList(
selected
) {
fontSelect.innerHTML =
'';

const builtins =
document.createElement(
'optgroup'
);

builtins.label =
'기본 폰트';

Object.entries(
BUILTIN_FONTS
).forEach(
([id, font]) => {
const option =
document.createElement(
'option'
);

option.value =
id;

option.textContent =
font.name;

builtins.appendChild(
option
);
}
);

fontSelect.appendChild(
builtins
);

if (customFonts.length) {
const custom =
document.createElement(
'optgroup'
);

custom.label =
'내 폰트';

customFonts.forEach(
font => {
const option =
document.createElement(
'option'
);

option.value =
`custom:${font.id}`;

option.textContent =
font.name;

custom.appendChild(
option
);
}
);

fontSelect.appendChild(
custom
);
}

const exists =
Array.from(
fontSelect.options
).some(
option =>
option.value ===
selected
);

fontSelect.value =
exists
? selected
: 'page';

updateDeleteButton();
updatePreview();
}

function updateDeleteButton() {
deleteFont.disabled =
!fontSelect.value
.startsWith(
'custom:'
);
}

function updateWeightUi() {
normalButton.classList.toggle(
'active',
selectedWeight ===
'default'
);

boldButton.classList.toggle(
'active',
selectedWeight ===
'bold'
);
}

function updateSourceUi() {
const fileMode =
sourceMode === 'file';

fileModeButton.classList.toggle(
'active',
fileMode
);

urlModeButton.classList.toggle(
'active',
!fileMode
);

fileArea.style.display =
fileMode
? 'block'
: 'none';

urlArea.style.display =
fileMode
? 'none'
: 'block';

help.textContent =
fileMode
? '폰트 파일은 이 브라우저에 저장되어 새로고침 후에도 유지됩니다.'
: 'woff, woff2, ttf, otf 등의 직접 폰트 파일 URL을 입력하세요.';
}

async function updatePreview() {
const sequence =
++previewSequence;

const font =
getSelectedFont(
fontSelect.value
);

const prepared =
await prepareFont(font);

if (
sequence !==
previewSequence
) {
if (prepared.objectUrl) {
URL.revokeObjectURL(
prepared.objectUrl
);
}

return;
}

if (previewBlobUrl) {
URL.revokeObjectURL(
previewBlobUrl
);

previewBlobUrl =
null;
}

previewBlobUrl =
prepared.objectUrl ||
null;

document
.getElementById(
PREVIEW_STYLE_ID
)
?.remove();

if (prepared.css) {
const previewStyle =
document.createElement(
'style'
);

previewStyle.id =
PREVIEW_STYLE_ID;

previewStyle.textContent =
prepared.css;

document.head.appendChild(
previewStyle
);
}

previewText.style.fontFamily =
font.id === 'page'
? getNativePageFont()
: (
prepared.family ||
'"Apple SD Gothic Neo",sans-serif'
);

previewText.style.fontSize =
`${
Number(
sizeInput.value
) || 15
}px`;

previewText.style.lineHeight =
String(
Number(
lineInput.value
) || 1.6
);

previewText.style.fontWeight =
selectedWeight ===
'bold'
? '700'
: 'normal';
}

fontSelect.addEventListener(
'change',
() => {
updateDeleteButton();
updatePreview();
}
);

sizeInput.addEventListener(
'input',
updatePreview
);

lineInput.addEventListener(
'input',
updatePreview
);

normalButton.addEventListener(
'click',
() => {
selectedWeight =
'default';

updateWeightUi();
updatePreview();
}
);

boldButton.addEventListener(
'click',
() => {
selectedWeight =
'bold';

updateWeightUi();
updatePreview();
}
);

addFont.addEventListener(
'click',
() => {
addPanel.classList.toggle(
'open'
);
}
);

fileModeButton.addEventListener(
'click',
() => {
sourceMode =
'file';

updateSourceUi();
}
);

urlModeButton.addEventListener(
'click',
() => {
sourceMode =
'url';

updateSourceUi();
}
);

fileInput.addEventListener(
'change',
() => {
const file =
fileInput.files?.[0];

if (
!file ||
nameInput.value.trim()
) {
return;
}

const name =
file.name
.replace(
/\.(woff2?|ttf|otf)$/i,
''
)
.replace(
/[-_]+/g,
' '
)
.trim();

if (name) {
nameInput.value =
name;
}
}
);

urlInput.addEventListener(
'paste',
() => {
setTimeout(() => {
if (
nameInput.value.trim()
) {
return;
}

try {
const url =
new URL(
urlInput.value.trim()
);

let name =
decodeURIComponent(
url.pathname
.split('/')
.pop() ||
''
);

name =
name
.replace(
/\.(woff2?|ttf|otf)$/i,
''
)
.replace(
/[-_]+/g,
' '
)
.trim();

if (name) {
nameInput.value =
name;
}
} catch {}
}, 0);
}
);

addConfirm.addEventListener(
'click',
async () => {
let name =
nameInput.value.trim();

const id =
`${Date.now()
.toString(36)}_${Math.random()
.toString(36)
.slice(2, 8)}`;

if (sourceMode === 'file') {
const file =
fileInput.files?.[0];

if (!file) {
window.alert(
'폰트 파일을 선택해 주세요.'
);

return;
}

if (
!/\.(woff2?|ttf|otf)$/i
.test(file.name)
) {
window.alert(
'woff, woff2, ttf, otf 파일을 선택해 주세요.'
);

return;
}

if (!name) {
name =
file.name
.replace(
/\.(woff2?|ttf|otf)$/i,
''
)
.replace(
/[-_]+/g,
' '
)
.trim();
}

try {
await saveFontFile(
id,
file
);
} catch {
window.alert(
'폰트 파일을 저장하지 못했습니다.'
);

return;
}

customFonts.push({
id,
name:
name ||
'사용자 폰트',
type: 'file',
fileName:
file.name
});
} else {
const url =
urlInput.value.trim();

if (!url) {
window.alert(
'폰트 URL을 입력해 주세요.'
);

return;
}

try {
const parsed =
new URL(url);

if (
parsed.protocol !== 'https:' &&
parsed.protocol !== 'http:'
) {
throw new Error();
}
} catch {
window.alert(
'올바른 URL을 입력해 주세요.'
);

return;
}

customFonts.push({
id,
name:
name ||
'사용자 폰트',
type: 'url',
url
});
}

saveCustomFonts();

refreshFontList(
`custom:${id}`
);

fileInput.value =
'';

urlInput.value =
'';

nameInput.value =
'';

addPanel.classList.remove(
'open'
);
}
);

deleteFont.addEventListener(
'click',
async () => {
if (
!fontSelect.value
.startsWith(
'custom:'
)
) {
return;
}

const id =
fontSelect.value.slice(7);

const font =
getCustomFont(id);

if (!font) {
return;
}

if (
!window.confirm(
`"${font.name}" 폰트를 삭제할까요?`
)
) {
return;
}

if (font.type === 'file') {
try {
await deleteFontFile(
id
);
} catch {}
}

customFonts =
customFonts.filter(
item =>
item.id !== id
);

saveCustomFonts();

if (
settings.font ===
`custom:${id}`
) {
settings.font =
'page';

saveSettings();
applySettings();
}

refreshFontList(
'page'
);
}
);

reset.addEventListener(
'click',
() => {
fontSelect.value =
DEFAULT_SETTINGS.font;

sizeInput.value =
DEFAULT_SETTINGS.size;

lineInput.value =
DEFAULT_SETTINGS.lineHeight;

selectedWeight =
DEFAULT_SETTINGS.weight;

updateDeleteButton();
updateWeightUi();
updatePreview();
}
);

apply.addEventListener(
'click',
() => {
settings = {
font:
fontSelect.value,

size:
String(
Math.max(
8,
Math.min(
40,
Number(
sizeInput.value
) || 15
)
)
),

lineHeight:
String(
Math.max(
0.8,
Math.min(
3,
Number(
lineInput.value
) || 1.6
)
)
),

weight:
selectedWeight
};

saveSettings();
applySettings();
closePanel();
}
);

close.addEventListener(
'click',
closePanel
);

backdrop.addEventListener(
'click',
event => {
if (
event.target !== backdrop
) {
return;
}

if (
performance.now() -
openedAt <
400
) {
return;
}

closePanel();
}
);

updateWeightUi();
updateSourceUi();

refreshFontList(
settings.font
);
}
}

function restoreButtonPosition(
button
) {
const saved =
safeJsonParse(
localStorage.getItem(
BUTTON_POSITION_KEY
),
null
);

if (
!saved ||
typeof saved.left !== 'number' ||
typeof saved.top !== 'number'
) {
return;
}

const size = 25;

button.style.left =
`${Math.max(
4,
Math.min(
window.innerWidth -
size -
4,
saved.left
)
)}px`;

button.style.top =
`${Math.max(
4,
Math.min(
window.innerHeight -
size -
4,
saved.top
)
)}px`;

button.style.right =
'auto';

button.style.bottom =
'auto';
}

function setupButtonDrag(
button,
onClick
) {
let pointerId = null;

let startX = 0;
let startY = 0;

let startLeft = 0;
let startTop = 0;

let moved = false;

const threshold = 5;

button.addEventListener(
'pointerdown',
event => {
event.preventDefault();
event.stopPropagation();

pointerId =
event.pointerId;

const rect =
button.getBoundingClientRect();

startX =
event.clientX;

startY =
event.clientY;

startLeft =
rect.left;

startTop =
rect.top;

moved =
false;

try {
button.setPointerCapture(
pointerId
);
} catch {}
}
);

button.addEventListener(
'pointermove',
event => {
if (
event.pointerId !==
pointerId
) {
return;
}

event.preventDefault();
event.stopPropagation();

const dx =
event.clientX -
startX;

const dy =
event.clientY -
startY;

if (
Math.abs(dx) >
threshold ||
Math.abs(dy) >
threshold
) {
moved = true;
}

if (!moved) {
return;
}

const width =
button.offsetWidth || 25;

const height =
button.offsetHeight || 25;

const left =
Math.max(
4,
Math.min(
window.innerWidth -
width -
4,
startLeft + dx
)
);

const top =
Math.max(
4,
Math.min(
window.innerHeight -
height -
4,
startTop + dy
)
);

button.style.left =
`${left}px`;

button.style.top =
`${top}px`;

button.style.right =
'auto';

button.style.bottom =
'auto';
}
);

button.addEventListener(
'pointerup',
event => {
if (
event.pointerId !==
pointerId
) {
return;
}

event.preventDefault();
event.stopPropagation();

try {
button.releasePointerCapture(
pointerId
);
} catch {}

if (moved) {
const rect =
button.getBoundingClientRect();

localStorage.setItem(
BUTTON_POSITION_KEY,
JSON.stringify({
left:
Math.round(
rect.left
),
top:
Math.round(
rect.top
)
})
);
} else {
onClick();
}

pointerId =
null;
}
);

button.addEventListener(
'pointercancel',
() => {
pointerId =
null;
}
);
}

function start() {
applySettings();
createUi();
}

applySettings();

if (
document.readyState ===
'loading'
) {
document.addEventListener(
'DOMContentLoaded',
start,
{
once: true
}
);
} else {
start();
}

window.addEventListener(
'pageshow',
() => {
applySettings();
createUi();
}
);

document.addEventListener(
'visibilitychange',
() => {
if (document.hidden) {
return;
}

if (
!document.getElementById(
STYLE_ID
)
) {
applySettings();
}

if (
!document.getElementById(
HOST_ID
)
) {
createUi();
}
}
);
})();
