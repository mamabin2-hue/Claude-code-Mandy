// 建立綠界訂單：前端按下「解鎖」後會呼叫這支 API。
// 後端在這裡用密鑰把訂單參數簽章，回傳給前端；前端再把這些參數送到綠界付款頁。
//
// 為什麼要繞後端？因為 HashKey / HashIV 是機密，只能在後端使用。
// 前端永遠拿不到密鑰，只拿到「已經簽好章」的參數。

import {
  getConfig,
  genCheckMacValue,
  makeOrderId,
  ecpayDate,
} from './_lib.js'

// 你的商品設定。之後要改價格或品名，改這裡就好。
const PRODUCT = {
  amount: 299, // 解鎖完整題庫的價格（新台幣，整數）
  itemName: '職安技師題庫完整解鎖',
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: '只接受 POST' })
    return
  }

  const cfg = getConfig()

  // 這兩個網址：付款完成後綠界會通知 / 導回。
  // 需要是「公開的 HTTPS 網址」，所以本機測試時綠界通知會打不到你電腦（正常）。
  // 部署到 Vercel 後，把 PUBLIC_BASE_URL 設成你的網域即可。
  const base = process.env.PUBLIC_BASE_URL || `https://${req.headers.host}`

  const orderId = makeOrderId()

  const params = {
    MerchantID: cfg.merchantId,
    MerchantTradeNo: orderId,
    MerchantTradeDate: ecpayDate(),
    PaymentType: 'aio',
    TotalAmount: PRODUCT.amount,
    TradeDesc: 'MandyExamUnlock',
    ItemName: PRODUCT.itemName,
    // 綠界「伺服器對伺服器」的付款結果通知（最可信，用來記錄誰付款成功）
    ReturnURL: `${base}/api/ecpay/callback`,
    // 使用者付款完成後，瀏覽器被導回的網址（我們導回後端 result，再轉回前端頁面）
    OrderResultURL: `${base}/api/ecpay/result`,
    ChoosePayment: 'ALL', // 讓使用者自己選：信用卡 / ATM / 超商 等
    EncryptType: 1,
    NeedExtraPaidInfo: 'N',
  }

  params.CheckMacValue = genCheckMacValue(params, cfg.hashKey, cfg.hashIV)

  res.status(200).json({
    action: cfg.aioCheckOutUrl, // 前端要把表單 POST 到這個網址
    params, // 已簽章、可直接送出的完整參數
  })
}
