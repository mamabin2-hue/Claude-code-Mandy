import { useState, useCallback } from 'react'

// 記錄使用者是否已解鎖（付費）。
//
// ⚠️ 誠實提醒：這裡用瀏覽器 localStorage 記錄，屬於「方便版」。
//    懂技術的人理論上可以自己改 localStorage 來偽造解鎖。
//    對考試練習這種小工具通常可接受；若要嚴格防盜用，需改成：
//    登入帳號 → 後端查詢該帳號是否付款 → 後端回傳受保護的內容。
//    （後端查詢邏輯已在 api/ecpay/_store.js 預留 isOrderPaid。）

const KEY_PREMIUM = 'mandy_premium'

export function usePremium() {
  const [isPremium, setIsPremium] = useState(() => {
    try {
      return localStorage.getItem(KEY_PREMIUM) === '1'
    } catch {
      return false
    }
  })

  const unlock = useCallback(() => {
    try {
      localStorage.setItem(KEY_PREMIUM, '1')
    } catch {
      // 忽略（無痕模式等）
    }
    setIsPremium(true)
  }, [])

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(KEY_PREMIUM)
    } catch {
      // 忽略
    }
    setIsPremium(false)
  }, [])

  return { isPremium, unlock, reset }
}
