import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePremium } from '../hooks/usePremium'

// 付款完成後，綠界會透過後端把使用者導回這個頁面（帶上 status 參數）。
export default function PaymentResult() {
  const { unlock } = usePremium()
  const [status, setStatus] = useState('loading')
  const [orderId, setOrderId] = useState('')

  useEffect(() => {
    // HashRouter 的 query 參數，用 window.location.hash 解析。
    const hash = window.location.hash // 例如 #/payment-result?status=success&order=xxx
    const query = hash.includes('?') ? hash.split('?')[1] : ''
    const params = new URLSearchParams(query)
    const s = params.get('status')
    setOrderId(params.get('order') || '')
    if (s === 'success') {
      unlock() // 在前端標記為已解鎖
      setStatus('success')
    } else {
      setStatus('fail')
    }
  }, [unlock])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4 py-10 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
        {status === 'loading' && <p className="text-gray-500">處理中…</p>}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-3">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900">付款成功！</h1>
            <p className="text-gray-500 mt-2">完整題庫已解鎖，祝你金榜題名 💪</p>
            {orderId && <p className="text-xs text-gray-400 mt-2">訂單編號：{orderId}</p>}
            <Link to="/practice" className="inline-block mt-6 px-6 py-3 bg-green-600 text-white font-bold rounded-full">
              開始練習
            </Link>
          </>
        )}

        {status === 'fail' && (
          <>
            <div className="text-5xl mb-3">😢</div>
            <h1 className="text-2xl font-bold text-gray-900">付款未完成</h1>
            <p className="text-gray-500 mt-2">可能是取消付款或發生錯誤，可以再試一次。</p>
            <Link to="/unlock" className="inline-block mt-6 px-6 py-3 bg-orange-500 text-white font-bold rounded-full">
              重新付款
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
