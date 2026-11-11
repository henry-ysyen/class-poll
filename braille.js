// 點字數字 0～9 的對照表（投影頁「揭曉」用）。11/11 建：三輪摸完直接在問卷裡揭曉，老師不用切視窗開 PDF。
// 一格 6 個點位：左欄由上而下 1、2、3，右欄由上而下 4、5、6。數字 1～0 跟字母 a～j 同形
// （真正的點字前面會再加一格「數字記號」，這裡不畫；跟列印檔 點字卡/make_braille_cards.py 的 DIGITS 一樣）。
import { el } from './store.js';

export const BRAILLE_DIGITS = { '1': [1], '2': [1, 2], '3': [1, 4], '4': [1, 4, 5], '5': [1, 5], '6': [1, 2, 4], '7': [1, 2, 4, 5], '8': [1, 2, 5], '9': [2, 4], '0': [2, 4, 5] };
export const DIGIT_ORDER = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

// 畫一格：2 欄 × 3 列；格子裡的順序是一列一列（1,4 / 2,5 / 3,6），黑點＝凸起、空圈＝沒有
export function brailleCell(num) {
  const on = new Set(BRAILLE_DIGITS[num] || []);
  return el('div', { class: 'bcell' }, [1, 4, 2, 5, 3, 6].map((p) => el('span', { class: 'dot' + (on.has(p) ? ' on' : '') })));
}

// 整張對照表：兩列五格。highlight＝要加黃框的數字（今天摸的卡）；show=false 時先不框，讓學生自己找
export function brailleChart({ highlight = [], show = false } = {}) {
  const hl = new Set(show ? highlight.map(String) : []);
  return el('div', { class: 'bchart' }, DIGIT_ORDER.map((num) =>
    el('div', { class: 'bdigit' + (hl.has(num) ? ' hl' : '') }, brailleCell(num), el('div', { class: 'bnum' }, num))));
}
