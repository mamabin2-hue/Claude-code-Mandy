// 綠界 ECPay 全方位金流（AIO）共用工具
// 這裡放「簽章」相關邏輯，是整個金流最重要、最不能寫錯的部分。
// 這個檔案只會在後端（Vercel Serverless Function）執行，密鑰不會外洩到前端。

import crypto from 'node:crypto'

// 從環境變數讀取商店設定。實際的值請在 Vercel 後台或 .env 設定，不要寫死在程式裡。
// 若沒設定，預設用綠界官方「測試環境」的公開測試帳號，方便你先跑起來看效果。
export function getConfig() {
  const isProd = process.env.ECPAY_ENV === 'production'
  return {
    isProd,
    merchantId: process.env.ECPAY_MERCHANT_ID || '3002607',
    hashKey: process.env.ECPAY_HASH_KEY || 'pwFHCqoQZGmho4w6',
    hashIV: process.env.ECPAY_HASH_IV || 'EkRm7iFT261dpevs',
    // 綠界付款頁網址（測試 / 正式）
    aioCheckOutUrl: isProd
      ? 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5'
      : 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5',
  }
}

// 模擬 .NET HttpUtility.UrlEncode，綠界的 CheckMacValue 需要用這個編碼規則。
function dotNetUrlEncode(str) {
  return encodeURIComponent(str)
    .replace(/%20/g, '+')
    .replace(/%21/g, '!')
    .replace(/%28/g, '(')
    .replace(/%29/g, ')')
    .replace(/%2a/g, '*')
    .replace(/%2d/g, '-')
    .replace(/%2e/g, '.')
    .replace(/%5f/g, '_')
}

// 依照綠界規範計算檢查碼（CheckMacValue）
// 流程：參數依 key 排序 → 前後加上 HashKey/HashIV → URL 編碼 → 轉小寫 → SHA256 → 轉大寫
export function genCheckMacValue(params, hashKey, hashIV) {
  const sorted = Object.keys(params)
    .filter((k) => k !== 'CheckMacValue')
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((k) => `${k}=${params[k]}`)
    .join('&')

  const raw = `HashKey=${hashKey}&${sorted}&HashIV=${hashIV}`
  const encoded = dotNetUrlEncode(raw).toLowerCase()
  return crypto.createHash('sha256').update(encoded).digest('hex').toUpperCase()
}

// 驗證綠界回傳的資料是否被竄改：用同樣的密鑰算一次檢查碼，比對是否相同。
export function verifyCheckMacValue(params, hashKey, hashIV) {
  const received = params.CheckMacValue
  if (!received) return false
  const expected = genCheckMacValue(params, hashKey, hashIV)
  return received.toUpperCase() === expected
}

// 產生訂單編號（英數字，長度 20 以內，綠界規定）。
// 注意：正式環境每筆訂單編號不可重複，實務上建議接資料庫來產生流水號。
export function makeOrderId(prefix = 'MANDY') {
  const ts = Date.now().toString()
  const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `${prefix}${ts}${rand}`.slice(0, 20)
}

// 綠界要求的日期格式：yyyy/MM/dd HH:mm:ss
export function ecpayDate(d = new Date()) {
  const pad = (n) => n.toString().padStart(2, '0')
  return (
    `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ` +
    `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  )
}
