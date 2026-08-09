// 綠界「伺服器對伺服器」付款結果通知（ReturnURL）
// 使用者付款成功後，綠界的伺服器會主動 POST 到這支 API。
// 這是最可信的付款確認來源（比瀏覽器導回可靠，因為使用者無法偽造）。
//
// 重點：一定要先「驗證檢查碼」，確認資料真的來自綠界、沒有被竄改，才能認定付款成功。

import { getConfig, verifyCheckMacValue } from './_lib.js'
import { markOrderPaid } from './_store.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).send('0|MethodNotAllowed')
    return
  }

  const cfg = getConfig()
  const data = req.body || {}

  // 1. 驗證檢查碼（安全關鍵，不能省略）
  if (!verifyCheckMacValue(data, cfg.hashKey, cfg.hashIV)) {
    console.error('[ecpay] CheckMacValue 驗證失敗', data.MerchantTradeNo)
    // 回傳非 1|OK，綠界會重試通知
    res.status(400).send('0|CheckMacValueError')
    return
  }

  // 2. 確認付款狀態（RtnCode === '1' 代表成功）
  const success = String(data.RtnCode) === '1'
  if (success) {
    try {
      // 3. 記錄「這筆訂單已付款」。實務上這裡要寫進資料庫。
      //    詳見 _store.js —— 目前是可替換的簡易版本。
      await markOrderPaid({
        orderId: data.MerchantTradeNo,
        tradeNo: data.TradeNo,
        amount: data.TradeAmt,
        paidAt: data.PaymentDate,
        raw: data,
      })
      console.log('[ecpay] 付款成功', data.MerchantTradeNo)
    } catch (err) {
      console.error('[ecpay] 記錄訂單失敗', err)
    }
  } else {
    console.warn('[ecpay] 付款未成功', data.RtnCode, data.RtnMsg)
  }

  // 4. 一定要回傳 "1|OK" 給綠界，否則綠界會判定通知失敗並不斷重試。
  res.status(200).send('1|OK')
}
