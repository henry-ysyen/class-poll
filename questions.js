// 題庫：一個「題組」對應一節課。老師頁用網址 ?set=L2 選題組。
// type: 'choice'＝單選（最多 4 個選項）、'text'＝開放題（學生打一句，prefix 會自動接在前面）
// compareWith: 投影頁把這題和指定的題並排（前測／後測對照）
export const SETS = {
  L1: {
    title: '第 1 節　閉眼聽（平板實測）',
    questions: [
      { id: 'd1', type: 'choice', text: '第 3 種聲音，從哪個方向來？', options: ['前', '後', '左', '右'] },
      { id: 'd2', type: 'choice', text: '第 4 種聲音，從哪個方向來？', options: ['前', '後', '左', '右'] },
      { id: 'd3', type: 'choice', text: '第 5 種聲音，從哪個方向來？', options: ['前', '後', '左', '右'] },
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
