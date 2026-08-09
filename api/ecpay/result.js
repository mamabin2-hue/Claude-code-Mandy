// 使用者付款完成後，綠界會把「瀏覽器」導到這裡（OrderResultURL，用 POST）。
// 靜態前端頁面無法直接接收 POST，所以我們用這支後端接住，再 302 轉回前端的結果頁。
//
// 注意：這個導回「不能」當作付款成功的唯一依據（使用者理論上可偽造）。
// 真正認定付款成功，以 callback.js（伺服器通知）為準。這裡只負責畫面導向。

import { getConfig, verifyCheckMacValue } from './_lib.js'

export default function handler(req, res) {
  const cfg = getConfig()
  const data = req.body || {}

  const verified = verifyCheckMacValue(data, cfg.hashKey, cfg.hashIV)
  const paid = verified && String(data.RtnCode) === '1'
  const orderId = data.MerchantTradeNo || ''

  // 前端結果頁（HashRouter，所以用 /#/ 路徑）
  const frontendBase = process.env.FRONTEND_URL || `https://${req.headers.host}`
  const status = paid ? 'success' : 'fail'
  const target = `${frontendBase}/#/payment-result?status=${status}&order=${encodeURIComponent(orderId)}`

  res.writeHead(302, { Location: target })
  res.end()
}
