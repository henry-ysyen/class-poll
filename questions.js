// 題庫：一個「題組」對應一節課。老師頁用網址 ?set=L2 選題組。
// type: 'choice'＝單選（最多 4 個選項）、'text'＝開放題（學生打一句，prefix 會自動接在前面）
// compareWith: 投影頁把這題和指定的題並排（前測／後測對照）

// 班級設定：網址沒帶 r／n 時就用這兩個。學生只要開 index.html（不用任何參數）就進得來，QR code 比較短。
export const DEFAULT_ROOM = '418';
export const DEFAULT_N = 21;

export const SETS = {
  L1: {
    // 11/10 照老師 1110 版詳案改：引起動機兩題改用問卷問、閉眼聽刪掉、活動二改「摸點字卡」（每輪一題，2～3 輪）。
    // 原本 11/04 的方位三題（d1～d3）拿掉。字句待老師確認（第 2 題課文答案有五樣，問卷最多四個選項，所以改問「哪一樣不是」）。
    title: '第 1 節　用手看（11/12）',
    questions: [
      { id: 'a1', tag: '引起動機 ①', type: 'text', text: '海倫的朋友從森林散步回來，說「沒有看見什麼特別的東西」。海倫為什麼驚訝？', prefix: '因為' },
      { id: 'a2', tag: '引起動機 ②', type: 'choice', text: '課文第三段，下面哪一樣「不是」海倫用身體看到的？', options: ['樹枝上的蓓蕾', '柔軟的草地', '清涼的流水', '花朵的香味'] },
      { id: 'b1', tag: '點字卡 ①', type: 'choice', text: '你摸到的點字，是哪個數字？', options: ['2', '4', '7', '摸不出來'] },
      { id: 'b2', tag: '點字卡 ②', type: 'choice', text: '這一張呢？你摸到的是哪個數字？', options: ['2', '4', '7', '摸不出來'] },
      { id: 'b3', tag: '點字卡 ③', type: 'choice', text: '最後一張，你摸到的是哪個數字？', options: ['2', '4', '7', '摸不出來'] },
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
