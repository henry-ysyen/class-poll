// 繪本圖片的小工具（直接用網址敲資料庫，不經過網頁）。老師密碼從指令帶進來，不寫在檔案裡。
//
//   node tools/gallery-tool.mjs test   <教室> <老師密碼>                     測資料庫規則（門禁）有沒有照設計擋人。用測試教室跑，不要用正式教室
//   node tools/gallery-tool.mjs upload <教室> <老師密碼> <題組> <圖片資料夾>   把資料夾裡的 .jpg 傳上去（檔名＝編號；要先自己縮好圖，老師頁的「上傳圖片」會自動縮）
//   node tools/gallery-tool.mjs delete <教室> <老師密碼> <題組>               刪掉這個題組的圖，順便關閉
//
// 規則的設計（database.rules.json 的 key／pics／gallery 三段）：
//   - gallery（圖）平常讀不到；pics 寫成一個時間點之後的 90 分鐘內才讀得到
//   - 寫 pics、寫 gallery 都要同時寫一把 key：以「老師密碼:」開頭、而且跟上一把不一樣
import { readdirSync, readFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import { firebaseConfig } from '../firebase-config.js';

const [cmd, room, pin, ...rest] = process.argv.slice(2);
if (!cmd || !room || !pin) { console.log('用法見檔頭'); process.exit(1); }
const base = `${firebaseConfig.databaseURL}/rooms/${encodeURIComponent(room)}`;
let n = 0;
const key = () => `${pin}:${Date.now()}:${++n}`;
const call = async (method, path, body) => {
  const res = await fetch(`${base}${path}.json`, { method, body: body === undefined ? undefined : JSON.stringify(body) });
  let json = null; try { json = await res.json(); } catch {}
  return { status: res.status, json };
};
const patch = (body) => call('PATCH', '', body);
const SV = { '.sv': 'timestamp' };

if (cmd === 'upload') {
  const [set, dir] = rest;
  const files = readdirSync(dir).filter((f) => /\.jpe?g$/i.test(f)).sort();
  for (const f of files) {
    const id = parse(f).name;
    const url = 'data:image/jpeg;base64,' + readFileSync(join(dir, f)).toString('base64');
    const r = await patch({ key: key(), [`gallery/${set}/${id}`]: url });
    console.log(id, Math.round(url.length / 1024) + ' KB', r.status === 200 ? '上傳成功' : `失敗 ${r.status} ${JSON.stringify(r.json)}`);
    if (r.status !== 200) process.exit(1);
  }
  console.log(`完成 ${files.length} 張（目前是關閉的，老師頁出圖片那一項才會開放）`);
} else if (cmd === 'delete') {
  const [set] = rest;
  const r = await patch({ key: key(), [`gallery/${set}`]: null, pics: 0 });
  console.log(r.status === 200 ? '已刪除、已關閉' : `失敗 ${r.status} ${JSON.stringify(r.json)}`);
} else if (cmd === 'test') {
  const SET = '_ruletest';
  const img = `/gallery/${SET}/x`;
  let fail = 0;
  const expect = (name, r, want) => {
    const ok = Array.isArray(want) ? want.includes(r.status) : r.status === want;
    if (!ok) fail++;
    console.log(`${ok ? '✅' : '❌'} ${name}　→ ${r.status}${ok ? '' : `（應該是 ${want}）${JSON.stringify(r.json)}`}`);
  };
  await call('PUT', '/config/pin', pin); // 測試教室還沒有密碼就設一次（已經有就會被擋，沒關係）
  expect('01 帶對的鑰匙關閉圖片', await patch({ key: key(), pics: 0 }), 200);
  expect('02 關閉時讀圖：擋', await call('GET', img), 401);
  expect('03 不帶鑰匙想開放：擋', await patch({ pics: SV }), 401);
  expect('04 帶錯的鑰匙想開放：擋', await patch({ key: 'wrong:' + Date.now(), pics: SV }), 401);
  expect('05 帶對的鑰匙上傳一張（關閉時也能傳）', await patch({ key: key(), [`gallery/${SET}/x`]: 'data:test' }), 200);
  expect('06 傳完還是關閉的，讀圖：擋', await call('GET', img), 401);
  const k = key();
  expect('07 帶對的鑰匙開放', await patch({ key: k, pics: SV }), 200);
  const got = await call('GET', img);
  expect('08 開放後讀圖：讀得到', got, 200);
  if (got.json !== 'data:test') { fail++; console.log('❌ 08b 讀回來的內容不對', got.json); }
  expect('09 同一把鑰匙再用一次：擋', await patch({ key: k, pics: 0 }), 401);
  expect('10 不帶鑰匙想改圖：擋', await patch({ [`gallery/${SET}/x`]: 'hack' }), 401);
  expect('11 把開放時間改成 91 分鐘前', await patch({ key: key(), pics: Date.now() - 91 * 60 * 1000 }), 200);
  expect('12 過了 90 分鐘，讀圖：擋', await call('GET', img), 401);
  expect('13 把開放時間改成 80 分鐘前', await patch({ key: key(), pics: Date.now() - 80 * 60 * 1000 }), 200);
  expect('14 還在 90 分鐘內，讀圖：讀得到', await call('GET', img), 200);
  expect('15 沒人可以讀鑰匙', await call('GET', '/key'), 401);
  expect('16 刪掉測試圖、關閉', await patch({ key: key(), [`gallery/${SET}`]: null, pics: 0 }), 200);
  expect('17 刪掉後讀圖：擋', await call('GET', img), 401);
  expect('18 原本的出題寫入（帶老師密碼）照常', await patch({ token: pin, 'state/at': Date.now() }), 200);
  // 參考用（不算過不過）：不帶密碼能不能改「現在哪一題」。舊規則的已知弱點，見 README
  const weak = await patch({ 'state/at': Date.now() });
  console.log(`ℹ️ 參考：不帶密碼改出題狀態 → ${weak.status}（200＝改得動，是 11/08 那份規則就有的弱點）`);
  console.log(fail ? `\n有 ${fail} 項不符` : '\n全部符合');
  process.exit(fail ? 1 : 0);
} else {
  console.log('不認得的指令：' + cmd);
}
