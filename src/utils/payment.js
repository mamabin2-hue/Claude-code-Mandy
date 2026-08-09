// 前端金流工具：呼叫後端建立訂單，然後把使用者導到綠界付款頁。

// 後端 API 的位置。
// - 若整個專案都部署在 Vercel：留空，會用同網域的 /api
// - 若前端留在 GitHub Pages、後端另外放 Vercel：把 VITE_PAYMENT_API 設成後端網址
//   例如 VITE_PAYMENT_API=https://mandy-pay.vercel.app
const API_BASE = import.meta.env.VITE_PAYMENT_API || ''

// 建立訂單並前往綠界付款頁。
export async function startCheckout() {
  const resp = await fetch(`${API_BASE}/api/ecpay/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  if (!resp.ok) throw new Error('建立訂單失敗，請稍後再試')

  const { action, params } = await resp.json()

  // 用一個隱藏表單，把綠界要的參數 POST 過去，瀏覽器就會跳轉到付款頁。
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = action
  form.style.display = 'none'
  for (const [key, value] of Object.entries(params)) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = value
    form.appendChild(input)
  }
  document.body.appendChild(form)
  form.submit()
}
