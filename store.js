// 資料層：三個頁面都透過這一層讀寫，路徑長得像 'state'、'answers/<session>/<qid>/<seat>'。
// 有 Firebase 設定就走 Firebase 即時資料庫；沒有就走本機模式（localStorage＋分頁之間的 storage 事件）。
import { firebaseConfig } from './firebase-config.js';

export async function createStore(room) {
  if (firebaseConfig) return firebaseStore(room);
  return localStore(room);
}

// ---------- 本機模式 ----------
function localStore(room) {
  const KEY = `classpoll:${room}`;
  const subs = []; // { path, cb, last }
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } };
  const write = (doc) => { localStorage.setItem(KEY, JSON.stringify(doc)); notify(); };
  const getAt = (doc, path) => {
    if (!path) return doc;
    let cur = doc;
    for (const k of path.split('/').filter(Boolean)) { if (cur == null || typeof cur !== 'object') return null; cur = cur[k]; }
    return cur === undefined ? null : cur;
  };
  const setAt = (doc, path, val) => {
    const keys = path.split('/').filter(Boolean);
    if (!keys.length) return val == null ? {} : val;
    let cur = doc;
    for (const k of keys.slice(0, -1)) { if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {}; cur = cur[k]; }
    const last = keys[keys.length - 1];
    if (val == null) delete cur[last]; else cur[last] = val;
    return doc;
  };
  const notify = () => {
    const doc = read();
    for (const s of subs) {
      const v = getAt(doc, s.path);
      const j = JSON.stringify(v);
      if (j !== s.last) { s.last = j; s.cb(v); }
    }
  };
  window.addEventListener('storage', (e) => { if (e.key === KEY) notify(); });
  return {
    mode: 'local',
    on(path, cb) {
      const s = { path, cb, last: undefined };
      subs.push(s);
      const v = getAt(read(), path); s.last = JSON.stringify(v); cb(v);
      return () => { const i = subs.indexOf(s); if (i >= 0) subs.splice(i, 1); };
    },
    async once(path) { return getAt(read(), path); },
    async set(path, val) { write(setAt(read(), path, val)); },
    async update(path, obj) { let doc = read(); for (const [k, v] of Object.entries(obj)) doc = setAt(doc, path ? `${path}/${k}` : k, v); write(doc); },
    async remove(path) { write(setAt(read(), path, null)); },
  };
}

// ---------- Firebase 模式 ----------
async function firebaseStore(room) {
  const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
  const fdb = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js');
  const app = initializeApp(firebaseConfig);
  const db = fdb.getDatabase(app);
  const base = `rooms/${room}`;
  const r = (path) => fdb.ref(db, path ? `${base}/${path}` : base);
  return {
    mode: 'firebase',
    on(path, cb) { return fdb.onValue(r(path), (snap) => cb(snap.val())); },
    async once(path) { return (await fdb.get(r(path))).val(); },
    async set(path, val) { await fdb.set(r(path), val); },
    async update(path, obj) { await fdb.update(r(path), obj); },
    async remove(path) { await fdb.remove(r(path)); },
  };
}

// ---------- 共用小工具 ----------
export function qs(name, dflt = '') { return new URLSearchParams(location.search).get(name) ?? dflt; }
export function $(sel, root = document) { return root.querySelector(sel); }
export function el(tag, attrs = {}, ...children) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') n.className = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (v !== null && v !== undefined) n.setAttribute(k, v);
  }
  for (const c of children.flat()) if (c != null) n.append(c.nodeType ? c : document.createTextNode(String(c)));
  return n;
}
// 這一回合已加入的座號：學生頁每次看到回合編號變了就重新報到（students/<seat> 的 s），所以用回合比對、不比時間（平板時鐘不一定準）
export function joinedSeats(students, session) {
  return Object.entries(students || {}).filter(([, v]) => v && session && v.s === session).map(([k]) => k).sort((a, b) => +a - +b);
}
// 倒數計時：老師按下去時寫 end（結束的時間點），各畫面用自己的時鐘算剩幾秒。手機與投影電腦都會自動對時，差一兩秒沒關係。
export function timerLeft(timer) {
  if (!timer || !timer.end) return null;
  return Math.max(0, Math.ceil((timer.end - Date.now()) / 1000));
}
export function fmtTime(sec) { return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`; }
export const OPTION_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100']; // 選項 A～D 的顏色（dataviz 規範驗證過）
export const OPTION_INK = ['#ffffff', '#ffffff', '#ffffff', '#0b0b0b'];
export const LETTERS = ['A', 'B', 'C', 'D'];
// 選項的小圓標：4 個以內用 A～D 四色；超過 4 個（例如 0～9＋摸不出來）統一深藍底，短選項（兩字內）直接把選項字當標籤
export function optBadge(opt, i, n) {
  if (n <= 4) return { label: LETTERS[i], bg: OPTION_COLORS[i], ink: OPTION_INK[i] };
  return { label: String(opt).length <= 2 ? String(opt) : String.fromCharCode(65 + i), bg: '#1f3864', ink: '#ffffff' };
}
