// Firebase 設定（2026-11-08 Henry 從主控台貼來；專案 class-poll-a84b0、資料庫在 asia-southeast1）。
// 這段本來就是給瀏覽器用的公開資訊，真正的門禁是 database.rules.json 那份規則。
// 想回本機模式試流程：把下面整個物件改成 null。
export const firebaseConfig = {
  apiKey: 'AIzaSyA_hPvEYVFL8WZZGj0mvzovU5RWAZfmU68',
  authDomain: 'class-poll-a84b0.firebaseapp.com',
  databaseURL: 'https://class-poll-a84b0-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'class-poll-a84b0',
  storageBucket: 'class-poll-a84b0.firebasestorage.app',
  messagingSenderId: '350161829372',
  appId: '1:350161829372:web:8a854bddca27c719b70679',
};
