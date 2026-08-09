# 金流串接教學（綠界 ECPay）

這份文件教你把「解鎖完整題庫」的付款功能上線。程式碼已經寫好，你只需要照著做設定。

---

## 目前進度

- ✅ 程式碼已完成（後端簽章、付款、結果通知、前端付款頁）
- ⏳ **你的綠界帳號審核尚未通過**（見下方「第 0 步」）
- ⏳ 尚未部署到能執行後端的平台（見「第 2 步」）

---

## 第 0 步：先讓綠界帳號審核通過（最重要，只能你本人做）

你的綠界帳號（卓信人資整合有限公司）目前**審核未通過**，被退的原因：

1. **身分驗證**：公司設立登記表沒上傳完整頁數；負責人身分證正反面需重傳。
2. **非信用卡收款**：尚未完成身分驗證 + 銀行帳號設定。

### 要補的資料

- [ ] 公司設立登記表（**完整所有頁數**）
- [ ] 負責人最新身分證**正、反面**圖檔
- [ ] 銀行帳號設定（收款要匯入的公司帳戶）
- [ ] 確認網站上的聯絡電話 / Email 與綠界收款資料一致

### 操作路徑

1. 登入綠界廠商專區：<https://vendor.ecpay.com.tw/User/LogOn_Step1>
2. 廠商專區 → **廠商基本資料** → 公司登記資料 → **資料異動申請** → 下一步 → 上傳文件
3. 到 **驗證/服務申請** 完成銀行帳號設定
4. 送出後等綠界重新審核

> 客服專線：02-2655-1775（平日 09:00–18:00）

**審核通過後**，你會在綠界後台「系統開發管理 → 系統介接設定」拿到三個值：
`MerchantID`、`HashKey`、`HashIV` —— 這是接下來要填的密鑰。

---

## 第 1 步：先用「測試環境」把流程跑起來（不用等審核）

程式碼預設就是綠界的**官方測試帳號**，你現在就能在本機試跑整個付款流程：

```bash
npm install
npm run dev
```

打開 <http://localhost:5173/#/unlock> → 按「立即解鎖」→ 會跳到綠界測試付款頁。

> ⚠️ 測試環境的「付款成功通知」（ReturnURL）需要一個公開網址，本機（localhost）收不到通知是正常的。要完整測到「付款成功 → 自動解鎖」，請先做完第 2 步部署。
>
> 測試信用卡卡號：`4311-9522-2222-2222`，安全碼任意 3 碼，有效期限填未來日期。

---

## 第 2 步：部署到 Vercel（因為 GitHub Pages 不能跑後端）

你的網站目前在 GitHub Pages，那是純靜態、**不能執行金流後端**。把專案接到 Vercel（免費）就能同時跑前端 + 後端。

1. 到 <https://vercel.com> 用 GitHub 帳號登入
2. Import 這個 repo（`mamabin2-hue/claude-code-mandy`）
3. Framework 會自動偵測為 **Vite**，直接部署
4. 部署完成會給你一個網址，例如 `https://claude-code-mandy.vercel.app`

Vercel 會自動把 `api/` 資料夾裡的檔案變成後端 API，不用另外設定。

---

## 第 3 步：把密鑰填到 Vercel（審核通過後才做）

在 Vercel 專案 → **Settings → Environment Variables**，新增：

| 變數名稱 | 值 | 說明 |
|---|---|---|
| `ECPAY_ENV` | `production` | 切換到正式環境 |
| `ECPAY_MERCHANT_ID` | （綠界給的） | 商店代號 |
| `ECPAY_HASH_KEY` | （綠界給的） | 密鑰，**保密** |
| `ECPAY_HASH_IV` | （綠界給的） | 密鑰，**保密** |
| `PUBLIC_BASE_URL` | 你的 Vercel 網址 | 綠界付款通知會打到這 |
| `FRONTEND_URL` | 你的 Vercel 網址 | 付款完成導回前端 |

填完按 **Redeploy** 重新部署即可生效。

> 💡 測試環境（`ECPAY_ENV=test`）時，這些密鑰可以留空，程式會自動用綠界測試帳號。

---

## 第 4 步（上線前必做）：把「誰付款了」存進資料庫

目前 `api/ecpay/_store.js` 是**示範版**，重開機後付款紀錄會消失。正式收錢前，請換成真正的資料庫。

最簡單的做法是 **Upstash Redis**（免費、和 Vercel 一鍵整合）：

1. 在 Vercel → Storage → 建立 Upstash Redis
2. `npm install @upstash/redis`
3. 依 `api/ecpay/_store.js` 檔案內的註解範例改寫 `markOrderPaid` / `isOrderPaid`

---

## 檔案說明

| 檔案 | 作用 |
|---|---|
| `api/ecpay/_lib.js` | 綠界簽章計算（CheckMacValue），最核心 |
| `api/ecpay/create-order.js` | 建立訂單 API，前端按解鎖時呼叫 |
| `api/ecpay/callback.js` | 接收綠界付款結果通知（伺服器對伺服器） |
| `api/ecpay/result.js` | 付款後把使用者導回前端結果頁 |
| `api/ecpay/_store.js` | 記錄付款狀態（目前示範版，需接資料庫） |
| `src/pages/Unlock.jsx` | 「解鎖完整題庫」付款頁面 |
| `src/pages/PaymentResult.jsx` | 付款完成/失敗的結果頁面 |
| `src/utils/payment.js` | 前端呼叫後端、跳轉綠界的工具 |
| `src/hooks/usePremium.js` | 記錄使用者是否已解鎖 |
| `.env.example` | 環境變數範本（複製成 `.env`） |

---

## 安全提醒

- **密鑰（HashKey / HashIV）絕對不要**寫進程式碼或提交到 git，只放在 Vercel 環境變數。
- `.env` 已被 `.gitignore` 忽略，不會被提交。
- 付款成功與否，**一律以 `callback.js`（伺服器通知）為準**，不要只信前端。
