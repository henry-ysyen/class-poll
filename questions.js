// 題庫：一個「題組」對應一節課。老師頁用網址 ?set=L2 選題組。
// type: 'choice'＝單選（最多 4 個選項）、'multi'＝複選（點一個存一個、再點取消；長條圖的百分比＝選這項的人 ÷ 作答人數）、
//       'text'＝開放題（學生打一句，prefix 會自動接在前面）、
//       'slide'＝投影頁（不作答；目前只有點字 0～9 對照表，highlight＝老師按「顯示答案」時要加黃框的數字，student＝平板上那行字）
// compareWith: 投影頁把這題和指定的題並排（前測／後測對照）

// 班級設定：網址沒帶 r／n 時就用這兩個。學生只要開 index.html（不用任何參數）就進得來，QR code 比較短。
export const DEFAULT_ROOM = '418';
export const DEFAULT_N = 21;

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '摸不出來'];

export const SETS = {
  L1: {
    // 11/10 照老師 1110 版詳案改：引起動機兩題改用問卷問、閉眼聽刪掉、活動二改「摸點字卡」（每輪一題，2～3 輪）。
    // 原本 11/04 的方位三題（d1～d3）拿掉。字句待老師確認（第 2 題課文答案有五樣，問卷最多四個選項，所以改問「哪一樣不是」）。
    title: '第 1 節　用手看（11/12）',
    questions: [
      { id: 'a1', tag: '引起動機 ①', type: 'text', text: '海倫的朋友從森林散步回來，說「沒有看見什麼特別的東西」。海倫為什麼驚訝？', prefix: '因為' },
      // 11/11 老婆要第 2 題改複選、選正確的（看同學注意到什麼最多），選項維持四個。課文第三段有五樣（蓓蕾、小鳥歡聲歌唱、流水、草地、陽光），
      // 塞不進四格 → 老婆 11/11 選定：四樣都是課文裡的，拿掉「小鳥歡聲歌唱」（海倫聽不到）。另一版「三樣＋花朵的香味當錯的」已刪。
      { id: 'a2', tag: '引起動機 ②', type: 'multi', text: '課文第三段，海倫用身體「看」到了哪些？（可複選）', options: ['樹枝上的蓓蕾', '清涼的流水', '柔軟的草地', '溫暖的陽光'] },
      // 選項 0～9＋摸不出來（11/10 Henry 定，不只列 2／4／7）；超過 4 個選項時三個頁面會改用格子排法
      { id: 'b1', tag: '點字卡 ①', type: 'choice', text: '你摸到的點字，是哪個數字？', options: DIGITS },
      { id: 'b2', tag: '點字卡 ②', type: 'choice', text: '這一張呢？你摸到的是哪個數字？', options: DIGITS },
      { id: 'b3', tag: '點字卡 ③', type: 'choice', text: '最後一張，你摸到的是哪個數字？', options: DIGITS },
      // 揭曉（11/11 Henry 要的）：三輪摸完，投影放整張 0～9 對照表讓學生自己找；老師按「顯示答案」才在今天摸的 2／4／7 加黃框。省掉切視窗開 PDF。
      { id: 'b4', tag: '揭曉', type: 'slide', text: '點字的數字 0～9', highlight: ['2', '4', '7'], student: '找找看，你剛剛摸到的是哪個數字？' },
    ],
  },
  L2: {
    title: '第 2 節　走進《地下鐵》',
    questions: [
      { id: 'q1', tag: '前測', type: 'choice', text: '你覺得看不見的人，他的世界是什麼樣子？', options: ['一片黑', '跟我們差不多', '不一樣，但也很豐富', '不知道'] },
      // 11/04 老師把第 2 節的「閉眼猜地點」刪了，原本的 q2、q3（這是哪裡？）跟著拿掉；題號不重排，免得跟存檔對不上。
      { id: 'q4', tag: '寧靜閱讀後', type: 'choice', text: '這幾頁裡，她最常靠哪個感官知道自己在哪裡？', options: ['耳朵', '手', '腳', '鼻子'] },
      { id: 'q5', tag: '接龍 ①', type: 'text', text: '列車門打開，你聽到什麼？', prefix: '我聽到' },
      { id: 'q6', tag: '接龍 ②', type: 'text', text: '你摸到什麼？', prefix: '我摸到' },
      { id: 'q7', tag: '接龍 ③', type: 'text', text: '你聞到什麼？', prefix: '我聞到' },
      { id: 'q8', tag: '後測', type: 'choice', text: '現在，你覺得看不見的人，他的世界是什麼樣子？', options: ['一片黑', '跟我們差不多', '不一樣，但也很豐富', '不知道'], compareWith: 'q1' },
    ],
  },
};

export function findQuestion(setId, qid) {
  const set = SETS[setId];
  if (!set) return null;
  return set.questions.find((q) => q.id === qid) || null;
}
