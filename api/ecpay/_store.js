// 「誰付款成功」的紀錄。這是把付款變成「解鎖權限」的關鍵一環。
//
// ⚠️ 目前是最簡易的示範版本：只印出 log，並沒有真正持久化儲存。
//    伺服器重開後紀錄就不見了，所以「正式上線前」一定要換成真正的資料庫。
//
// 建議做法（擇一，都有免費額度、跟 Vercel 很好接）：
//   1. Upstash Redis（最簡單，key-value）
//   2. Vercel Postgres / Neon
//   3. Supabase
//
// 換成 Upstash 的範例（安裝 @upstash/redis 後）：
//
//   import { Redis } from '@upstash/redis'
//   const redis = Redis.fromEnv()
//   export async function markOrderPaid(order) {
//     await redis.set(`order:${order.orderId}`, JSON.stringify(order))
//   }
//   export async function isOrderPaid(orderId) {
//     return (await redis.get(`order:${orderId}`)) !== null
//   }

export async function markOrderPaid(order) {
  // TODO: 換成資料庫寫入
  console.log('[store] 訂單已付款（示範版，未持久化）:', order.orderId, order.amount)
}

export async function isOrderPaid(orderId) {
  // TODO: 換成資料庫查詢
  console.log('[store] 查詢訂單（示範版，一律回 false）:', orderId)
  return false
}
