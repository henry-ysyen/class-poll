// 資料層：三個頁面都透過這一層讀寫，路徑長得像 'state'、'answers/<session>/<qid>/<seat>'。
// 有 Firebase 設定就走 Firebase 即時資料庫；沒有就走本機模式（localStorage＋分頁之間的 storage 事件）。
import { firebaseConfig } from './firebase-config.js';

// 網址加 ?local=1＝強制走本機模式（改程式時試流程用，不會碰到正式資料庫）
export async function createStore(room) {
  if (firebaseConfig && !qs('local')) return firebaseStore(room);
  return localStore(room);
}

// 圖片（繪本頁）的門禁：老師頁出「看圖／投影圖片」那一項時，把 pics 寫成當下的時間；
// 資料庫規則只在這個時間之後的 90 分鐘內讓人讀 gallery（圖片），過了自動關，老師忘了收也沒關係。
// 圖不放在倉庫裡（倉庫是公開的、刪了檔舊版紀錄還在），放資料庫，下課整包刪掉。
export const PICS_WINDOW = 90 * 60 * 1000;
export function picsOpen(pics) { return typeof pics === 'number' && pics > 0 && pics + PICS_WINDOW > Date.now(); }

// 圖片快取：同一張只抓一次；抓失敗（例如老師還沒開放）就不記，下次再抓
export function createImageCache(store, set) {
  const memo = new Map();
  return {
    get(id) {
      if (!memo.has(id)) memo.set(id, store.image(set, id).catch((e) => { memo.delete(id); throw e; }));
      return memo.get(id);
    },
    // 背景把整組先抓好（一張一張來，不搶頻寬）；onProgress(已抓到幾張)
    async preload(ids, onProgress) {
      let done = 0;
      for (const id of ids) { try { await this.get(id); done++; if (onProgress) onProgress(done); } catch { /* 之後看到那張時會再試 */ } }
      return done;
    },
  };
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
    stamp() { return Date.now(); },
    // 本機模式的圖片：直接讀資料夾 gallery-local/<題組>/<編號>.jpg（這個資料夾不進版本紀錄）；門禁照樣模擬
    async image(set, id) {
      if (!picsOpen(getAt(read(), 'pics'))) throw new Error('closed');
      return `gallery-local/${set}/${id}.jpg`;
    },
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
    // 第三個參數：讀不到（規則不准）時當成沒有資料，不讓頁面卡住
    on(path, cb) { return fdb.onValue(r(path), (snap) => cb(snap.val()), () => cb(null)); },
    async once(path) { return (await fdb.get(r(path))).val(); },
    async set(path, val) { await fdb.set(r(path), val); },
    async update(path, obj) { await fdb.update(r(path), obj); },
    async remove(path) { await fdb.remove(r(path)); },
    stamp() { return fdb.serverTimestamp(); }, // 資料庫自己的時鐘（不靠手機的時間）
    // 圖片存成一長串文字（data:image/jpeg;base64,…）。用一般的網頁下載去拿，不走即時連線，
    // 這樣 21 台平板抓圖時，出題、作答那條即時連線不會被塞住。規則不准（老師還沒開放／過了 90 分鐘）會回 401。
    async image(set, id) {
      const url = `${firebaseConfig.databaseURL}/rooms/${encodeURIComponent(room)}/gallery/${encodeURIComponent(set)}/${encodeURIComponent(id)}.json`;
      const res = await fetch(url);
      if (res.status === 401 || res.status === 403) throw new Error('closed');
      if (!res.ok) throw new Error('http ' + res.status);
      const v = await res.json();
      if (!v || typeof v !== 'string') throw new Error('missing');
      return v;
    },
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
// 選擇題的計數：單選存 a.i（一個編號）、複選存 a.is（編號陣列）；respondents＝作答人數，複選的百分比用它當分母（一人可選多項，長條加起來會超過 100%）
export function tally(q, ans) {
  const counts = q.options.map(() => 0);
  let respondents = 0;
  for (const a of Object.values(ans || {})) {
    if (!a) continue;
    const idx = Array.isArray(a.is) ? a.is : typeof a.i === 'number' ? [a.i] : [];
    if (!idx.length) continue;
    respondents++;
    for (const i of idx) if (counts[i] !== undefined) counts[i]++;
  }
  return { counts, respondents };
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
