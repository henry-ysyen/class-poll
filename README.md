# class-poll：課堂即時問卷

> 2026-11-04 建。給老婆 11/18 公開課「用感官讀世界」第 2 節用；第 1 節 11/11 先拿一題實測。
> 老師一題一題出、學生平板掃碼作答、投影幕即時統計。不用登入、不用名字，只打座號。

## 三個頁面

| 頁面 | 誰用 | 網址 | 做什麼 |
|:--|:--|:--|:--|
| `index.html` | 學生（平板） | `index.html?r=418&n=21` | 掃碼進來 → 按座號 → 看到當前那一題就答。選擇題點了就送出（還可以改）；開放題打一句按送出 |
| `teacher.html` | 老師（手機或筆電） | `teacher.html?r=418&set=L2&n=21` | 按「出這題」、「開放／關閉作答」、「顯示／隱藏結果」；看誰還沒答；匯出 CSV；新回合 |
| `screen.html` | 投影機 | `screen.html?r=418` | 沒出題時放大 QR code 給大家掃；出題後顯示「已作答 n／m」；選擇題按「顯示結果」才出長條圖；開放題句子即時一張張出現；後測跟前測並排 |

網址參數：`r`＝教室代碼（三個頁面要一樣）、`set`＝題組（`L1` 第 1 節實測三題、`L2` 第 2 節八題）、`n`＝座號到幾號。

## 本機試玩（不用任何帳號）

```powershell
cd C:\Users\Henry\Desktop\class-poll
python -m http.server 8787
```

然後瀏覽器開三個分頁：
- `http://localhost:8787/teacher.html?r=418&set=L2&n=21`（老師）
- `http://localhost:8787/screen.html?r=418`（投影）
- `http://localhost:8787/index.html?r=418&n=21`（學生；想模擬多個學生就開無痕視窗或換座號）

本機模式的資料只在同一台電腦的瀏覽器分頁之間同步（靠 localStorage），別台裝置看不到。

## 上線（讓全班平板連得到）：三步

### 1. Firebase 建一個專案（Henry 的 Google 帳號，約 10 分鐘）

1. 開 https://console.firebase.google.com → 「新增專案」→ 名稱隨意（例如 `class-poll`）→ Google Analytics 關掉 → 建立。
2. 左邊「建構」→「Realtime Database」→「建立資料庫」→ 位置選 **asia-southeast1（新加坡）** → 安全規則先選「測試模式」→ 啟用。
3. 「規則」分頁，整段換成下面這份 → 發布：

```json
{
  "rules": {
    "rooms": {
      "$room": {
        "config": { ".read": false, ".write": "!data.exists()",
          "pin": { ".validate": "newData.isString() && newData.val().length >= 4" } },
        "token": { ".read": false, ".write": true },
        "state": { ".read": true,
          ".write": "newData.parent().child('token').val() === root.child('rooms/' + $room + '/config/pin').val()" },
        "students": { ".read": true, "$seat": { ".write": true, ".validate": "newData.hasChild('t')" } },
        "answers": { ".read": true,
          "$session": { "$qid": { "$seat": {
            ".write": "root.child('rooms/' + $room + '/state/open').val() === true && root.child('rooms/' + $room + '/state/qid').val() === $qid && root.child('rooms/' + $room + '/state/session').val() === $session",
            ".validate": "newData.child('v').isString() && newData.child('v').val().length <= 200"
          } } } }
      }
    }
  }
}
```

   白話：老師密碼只能寫一次、誰都讀不到；只有帶對密碼的寫入能改「現在哪一題」；學生只能在老師開放作答時、對當前那一題、寫自己座號那一格，而且最多 200 字。

4. 專案設定（齒輪）→「一般」→ 最下面「你的應用程式」→ 加入網頁應用程式（`</>`）→ 名稱隨意、不勾 Hosting → 註冊 → 把 `const firebaseConfig = { ... }` 那一段複製，貼進本資料夾的 `firebase-config.js`（把 `null` 換掉）。

### 2. 放到 GitHub Pages（免費網頁空間，網址給平板用）

```powershell
cd C:\Users\Henry\Desktop\class-poll
gh auth login            # 第一次：照提示用瀏覽器登入 GitHub
git init
git add index.html teacher.html screen.html app.css store.js questions.js firebase-config.js README.md
git commit -m "class-poll 第一版"
gh repo create class-poll --public --source . --push
gh api -X POST repos/henry-ysyen/class-poll/pages -f build_type=legacy -f "source[branch]=master" -f "source[path]=/"
```

幾分鐘後網址是 `https://henry-ysyen.github.io/class-poll/`。學生頁＝`…/class-poll/index.html?r=418&n=21`。
（`firebase-config.js` 裡的設定本來就是公開給瀏覽器用的，放公開倉庫沒關係；真正的門禁是上面那份規則。）

### 3. 實測

- Henry 手機（用行動網路，不要用家裡 Wi-Fi）開學生頁，電腦開老師頁和投影頁，跑一輪。
- 11/10 前老婆用一台學生平板、連學校網路，開學生頁，能按座號、能作答就過關。
- 11/11 第 1 節用題組 `L1` 出一題實測。

## 課堂怎麼跑（第 2 節）

1. 課前：投影頁開著（會顯示 QR）、老師手機開老師頁、按「新回合」。
2. 學生掃碼、按座號；老師頁看到「n 人已加入」。
3. 要問時按「出這題」（自動開放作答）。選擇題：投影只顯示人數，討論時按「顯示結果」。開放題：句子即時出現。
4. 問完按「收題」回到等待畫面（或直接出下一題）。
5. 下課後「匯出這回合的答案」→ CSV 給 P-3-R。

## 改題目

只改 `questions.js`：`SETS` 裡加一個題組或改選項，不用碰其他檔。選擇題最多 4 個選項（顏色固定藍、橘、青、黃）；開放題 `prefix` 會自動接在學生打的字前面；`compareWith` 讓投影頁把這題和指定的題並排。

## 不用了

整個資料夾丟回收桶即可；GitHub 的倉庫和 Firebase 專案各自到網站上刪。母資料夾的 `000_Agent/policy/path-zones.json` 裡那一行白名單順手拿掉。
