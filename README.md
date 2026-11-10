# class-poll：課堂即時問卷

> 2026-11-04 建、11-06 第二版（操作與呈現定稿）、同日第三版（照老婆的三欄表：按鈕順序、倒數計時、投影提示條、筆電兩欄）。給老婆 11/18 公開課「用感官讀世界」第 2 節用；第 1 節 11/12 可先拿一題實測。
> 老師在手機上一題一題出、學生平板掃碼作答、投影幕即時統計。不用登入、不用名字，只按座號。

## 正式網址（2026-11-09 上線）

| 頁面 | 網址 |
|:--|:--|
| 學生（平板掃碼） | `https://henry-ysyen.github.io/class-poll/` |
| 老師遙控器（11/12 第 1 節） | `https://henry-ysyen.github.io/class-poll/teacher.html?set=L1` |
| 老師遙控器（11/18 第 2 節） | `https://henry-ysyen.github.io/class-poll/teacher.html?set=L2` |
| 投影 | `https://henry-ysyen.github.io/class-poll/screen.html` |

老師頁最上面有「題組」下拉選單，開錯節直接選另一個就好，不用改網址；學生頁與投影頁會跟著老師選的那一套走。

資料庫＝Firebase 專案 `class-poll-a84b0`（Henry 的 Google 帳號，主控台 https://console.firebase.google.com ）；程式＝GitHub 倉庫 `henry-ysyen/class-poll`（公開）。正式教室代碼 418 的老師密碼由第一個開老師頁的人設定、之後改不了（想重設：主控台 Realtime Database 裡把 `rooms/418/config` 刪掉）。教室 `test` 是 AI 測規則用的，密碼 1234，不要拿來上課。

## 三個頁面

| 頁面 | 誰用 | 網址 | 做什麼 |
|:--|:--|:--|:--|
| `index.html` | 學生（平板） | `index.html`（不用帶任何參數） | 掃碼進來 → 按座號 → 等老師出題。選擇題點了就送出（還可以改）；接龍打一句按送出或按 Enter |
| `teacher.html` | 老師（手機或筆電；筆電自動變兩欄） | `teacher.html?set=L2` | 遙控器：「▶ 下一題」照題組順序走；關閉作答／顯示結果／收題；投影倒數 1／2／3 分；看誰還沒答；點一句讓投影放大；匯出 CSV（這回合，或以前任何一回合）；新回合 |
| `screen.html` | 投影機 | `screen.html` | 課前放大 QR code＋座號亮燈；出題後顯示題目、選項、已作答 n／m、倒數；最下面一條黃色大字提示（作答結束變紅色）；選擇題按「顯示結果」才出長條圖；接龍句子即時一張張出現；後測跟前測並排；收題後顯示「請把平板蓋上」 |

網址參數都可省略：教室代碼與座號上限寫死在 `questions.js` 的 `DEFAULT_ROOM`（418）與 `DEFAULT_N`（21）。要換班級才帶 `?r=` 與 `?n=`（三個頁面的 `r` 要一樣）。`set`＝題組（`L1` 第 1 節五題：引起動機兩題＋點字卡三輪；`L2` 第 2 節六題），只有老師頁要帶。

**老師密碼**：老師頁第一次開會要你設一組（4 個字以上），之後誰要開老師頁都打同一組，裝置會記住。密碼擋的是「改投影在放哪一題」，學生頁不需要密碼。

## 課堂怎麼跑（第 2 節，老師手機）

每一題的按鈕順序固定是：**出題 → 關閉作答 → 顯示結果 → 下一題**（老婆 11/06 定）。輪到哪一步，那顆按鈕就亮黃色。

1. **課前**：投影機那台電腦開 `screen.html`（會放大 QR code）；手機開 `teacher.html?set=L2`（筆電也行，畫面會自動變兩欄），打密碼，到「工具」按**新回合**（投影與計數歸零）。
2. **學生掃碼、按座號**：投影幕上座號會一個個亮起來，手機上看到「n 人已加入」。沒亮的座號就是還沒進來。平板上會顯示自己的座號＋「已加入 ✓　請把平板蓋上，眼睛看老師」。
3. **前測**：按「▶ 出第 1 題：前測」。投影幕顯示題目、四個選項、「已作答 n／m」和最下面一條黃色大字「在平板上選一個，點了就送出。結果等老師公布。」，**不顯示分布**；分布只有你手機看得到。要限時就按「⏱ 投影倒數」的 1／2／3 分，投影幕右上角會倒數，最後 10 秒變紅、到 0 閃「時間到」（不會自動關閉作答，你自己按）。人齊了按「關閉作答」（平板按鈕反灰、投影提示條變紅色「作答結束，眼睛看老師」）。前測不評論，直接按「收題（投影：平板蓋上）」——投影幕變成「請把平板蓋上」，平板上也會出現同一句。
4. **寧靜閱讀＋三層提問**：投影幕放書頁（另一台或切視窗）。問卷這邊什麼都不用按。
5. **平板一題**：按「▶ 下一題：寧靜閱讀後」→ 學生答 → 「關閉作答」→ 按「顯示結果」投影出長條圖 → 問「選耳朵的，是哪一頁？」→ 按「收題」。
6. **三感官接龍**：按「▶ 下一題：接龍 ①」（要限時就按 2 分）。句子會即時出現在投影幕（不帶座號）；手機上每句旁邊有座號。**點一句，投影幕最上面會放大那句**，方便唸出來問「這是什麼地方？」；再點一次取消。接龍 ②、③ 同樣按下一題。
7. **後測**：按「▶ 下一題：後測」→ 學生答 → 「關閉作答」→ 按「顯示結果」，投影幕前測、後測兩張圖並排。
8. **下課後**：「工具」→「匯出這回合的答案（CSV）」給 P-3-R（有座號、題目、句子、時間）。

出錯了怎麼辦：按錯題 → 「◀ 上一題」或題目清單裡「出這題」跳回去，答案都還在。收題後想接著出 → 「▶ 下一題」會接在最後出過的那題後面。想暫停作答但留在那題 → 「關閉作答」，再按一次就「開放作答」。倒數按錯 → 「停止倒數」。

## 投影幕在每個階段長什麼樣

| 階段 | 投影幕 | 學生平板 |
|:--|:--|:--|
| 課前（待機・掃碼） | 大 QR code＋三步驟＋座號亮燈 | 按座號 → 大大的座號＋「已加入 ✓　請把平板蓋上，眼睛看老師」 |
| 收題後（待機・蓋上） | 「請把平板蓋上／眼睛看老師」，右下角小 QR 給晚進的人 | 「請把平板蓋上／眼睛看老師」 |
| 選擇題作答中 | 題目＋四個選項＋已作答 n／m 進度條（沒有分布）＋右上角倒數（有按才出現）＋最下面黃色提示條「在平板上選一個，點了就送出。結果等老師公布。」 | 四個大按鈕，點了就送出，還可以改 |
| 關閉作答後 | 提示條變紅色「作答結束，眼睛看老師。」 | 按鈕反灰、「作答已結束」 |
| 選擇題顯示結果 | 長條圖（人數＋百分比）；後測跟前測並排 | 同上 |
| 接龍 | 句子卡片即時長出來（不帶座號）；老師點的那句放大在最上面；倒數與提示條同上 | 「我聽到……」＋一行輸入框＋送出；送出後顯示自己的句子，還可以改 |

倒數靠手機與投影電腦各自的時鐘算，兩邊都有自動對時就不會差；投影電腦若時間明顯不準，先到 Windows 設定把時間對準。

## 本機試玩（不用任何帳號）

```powershell
cd C:\Users\Henry\Desktop\class-poll
python -m http.server 8787
```

然後瀏覽器開三個分頁：
- `http://localhost:8787/teacher.html?set=L2`（老師）
- `http://localhost:8787/screen.html`（投影）
- `http://localhost:8787/index.html`（學生；想模擬多個學生就按「換座號」換一個座號再答）

本機模式的資料只在同一台電腦的瀏覽器分頁之間同步（靠 localStorage），別台裝置看不到。

## 上線（讓全班平板連得到）：三步

> ✅ 11/09 做完了（第 1、2 步）。Henry 在主控台建專案、資料庫、貼規則、註冊網頁應用程式，把設定貼給 AI 寫進 `firebase-config.js`；AI 先用網址直接敲資料庫把規則 11 條都測過（測試教室 `test`）；`gh repo create` 被 Henry 自己的煞車擋下，由他在對話框親自打那一行；Pages 用 `gh api` 開。以下留著當紀錄與重做步驟。

### 1. Firebase 建一個專案（Henry 的 Google 帳號，約 10 分鐘）

1. 開 https://console.firebase.google.com → 「新增專案」→ 名稱隨意（例如 `class-poll`）→ Google Analytics 關掉 → 建立。
2. 左邊「建構」→「Realtime Database」→「建立資料庫」→ 位置選 **asia-southeast1（新加坡）** → 安全規則先選「測試模式」→ 啟用。
3. 「規則」分頁，整段換成下面這份（同一份也在本資料夾 `database.rules.json`，用記事本打開全選複製最省事）→ 發布：

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
git add firebase-config.js
git commit -m "接上 Firebase"
gh repo create class-poll --public --source . --push
gh api -X POST repos/henry-ysyen/class-poll/pages -f build_type=legacy -f "source[branch]=master" -f "source[path]=/"
```

幾分鐘後網址是 `https://henry-ysyen.github.io/class-poll/`。學生頁＝`…/class-poll/`（或 `…/class-poll/index.html`）、老師頁＝`…/class-poll/teacher.html?set=L2`、投影頁＝`…/class-poll/screen.html`。
（`firebase-config.js` 裡的設定本來就是公開給瀏覽器用的，放公開倉庫沒關係；真正的門禁是上面那份規則。）

### 3. 實測

- Henry 手機（用行動網路，不要用家裡 Wi-Fi）開學生頁，電腦開老師頁和投影頁，跑一輪。
- 11/10 前老婆用一台學生平板、連學校網路，開學生頁，能按座號、能作答就過關。
- 11/12 第 1 節可用題組 `L1` 出一題實測（第 1 節到底用不用平板，等老婆定）。

## 上線後改東西

改好 → `git add 改的檔` → `git commit` → `git push`，約一分鐘後網址就是新版，網址與 QR code 不變。兩條規矩：上課或試用當下不存新版；存新版後平板還看到舊畫面就關掉重開。

## 改題目／改班級

只改 `questions.js`：
- `SETS` 裡加一個題組或改選項，不用碰其他檔。選擇題 4 個以內的選項用 A～D 四色、一列一個；超過 4 個（例如 0～9＋摸不出來）會自動改成格子排、投影長條變矮，選項字兩字以內就直接當標籤；開放題 `prefix` 會自動接在學生打的字前面；`compareWith` 讓投影頁把這題和指定的題並排。
- 換班級：改 `DEFAULT_ROOM`（教室代碼，換了舊答案就看不到）與 `DEFAULT_N`（座號到幾號）。

## 不用了

整個資料夾丟回收桶即可；GitHub 的倉庫和 Firebase 專案各自到網站上刪。母資料夾的 `000_Agent/policy/path-zones.json` 裡那一行白名單順手拿掉。
