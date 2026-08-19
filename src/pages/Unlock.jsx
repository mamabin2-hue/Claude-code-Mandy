import { useState } from 'react'
import { Link } from 'react-router-dom'
import { startCheckout } from '../utils/payment'
import { usePremium } from '../hooks/usePremium'

const PRICE = 299

// 賣方與聯絡資訊 —— 綠界信用卡審核會核對這裡的電話 / Email
// 是否與你在綠界後台填的「收款資料」一致。若不一致會被退件，請務必對齊。
const MERCHANT = {
  company: '卓信人資整合有限公司',
  email: 'zhuohsin@gmail.com',
  phone: '0989-269-822',
}

const PERKS = [
  '解鎖全部年度完整題庫與詳解',
  '術科計算題逐步解析',
  '知識卡片與法規重點全開放',
  '一次付費，永久使用',
]

export default function Unlock() {
  const { isPremium } = usePremium()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleBuy() {
    setLoading(true)
    setError('')
    try {
      await startCheckout()
      // startCheckout 成功會跳轉到綠界，不會回到這行。
    } catch (err) {
      setError(err.message || '發生錯誤，請稍後再試')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4 py-10">
      <div className="max-w-md mx-auto">
        <Link to="/" className="text-blue-200 text-sm">← 回首頁</Link>

        <div className="mt-4 bg-white rounded-3xl shadow-xl p-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🔓</div>
            <h1 className="text-2xl font-bold text-gray-900">解鎖完整題庫</h1>
            <p className="text-gray-500 mt-1">升級 Premium，全部功能一次到位</p>
          </div>

          {isPremium ? (
            <div className="mt-6 text-center bg-green-50 text-green-700 rounded-2xl py-6 px-4">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-semibold">你已經解鎖完整題庫！</p>
              <Link to="/practice" className="inline-block mt-4 px-5 py-2 bg-green-600 text-white rounded-full">
                開始練習
              </Link>
            </div>
          ) : (
            <>
              <ul className="mt-6 space-y-3">
                {PERKS.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 mt-0.5">✔</span>
                    <span>{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 text-center">
                <span className="text-4xl font-bold text-gray-900">NT${PRICE}</span>
                <span className="text-gray-400 ml-1">/ 一次性</span>
              </div>

              {error && (
                <p className="mt-4 text-center text-red-500 text-sm">{error}</p>
              )}

              <button
                onClick={handleBuy}
                disabled={loading}
                className="mt-6 w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold rounded-full transition"
              >
                {loading ? '前往付款…' : '立即解鎖'}
              </button>

              <p className="mt-3 text-center text-xs text-gray-400">
                由綠界 ECPay 提供安全金流，支援信用卡 / ATM / 超商
              </p>

              {/* 以下為綠界信用卡審核所需的必備資訊區塊 */}
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-5 text-sm text-gray-600">
                <section>
                  <h2 className="font-semibold text-gray-800 mb-1">商品／服務內容</h2>
                  <p>
                    本商品為「職業衛生管理甲級技術士」線上題庫的完整版存取權。付款後即
                    解鎖全部年度歷屆試題、詳解、術科計算題逐步解析、知識卡片與法規重點，
                    屬一次性付費之數位內容服務，購買後可長期使用。
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-gray-800 mb-1">售價</h2>
                  <p>新臺幣 {PRICE} 元（一次性，含稅）。幣別：新臺幣 TWD。</p>
                </section>

                <section>
                  <h2 className="font-semibold text-gray-800 mb-1">退款政策</h2>
                  <p>
                    本商品為數位內容，依《通訊交易解除權合理例外情事適用準則》，一經開通
                    解鎖即視為提供服務完成，恕不適用七日鑑賞期。如遇重複扣款、系統錯誤或
                    無法正常解鎖等情形，請於交易後 7 日內來信客服，經確認後將全額退款。
                  </p>
                </section>

                <section>
                  <h2 className="font-semibold text-gray-800 mb-1">賣方與客服聯絡資訊</h2>
                  <p>{MERCHANT.company}</p>
                  <p>
                    客服信箱：
                    <a href={`mailto:${MERCHANT.email}`} className="text-blue-600 underline">
                      {MERCHANT.email}
                    </a>
                  </p>
                  <p>客服電話：{MERCHANT.phone}</p>
                </section>
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-blue-200">
          © {MERCHANT.company}
        </p>
      </div>
    </div>
  )
}
