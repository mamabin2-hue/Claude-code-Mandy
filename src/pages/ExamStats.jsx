import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

// Topic mapping and display order
const TOPICS = [
  { code: 'MONITOR',  label: '作業環境監測技術',      icon: '🔬', color: 'bg-blue-500' },
  { code: 'HEALTH',   label: '勞工健康管理與職業病',   icon: '🏥', color: 'bg-green-500' },
  { code: 'CHEM',     label: '化學性危害 / GHS',     icon: '⚗️', color: 'bg-purple-500' },
  { code: 'PSY',      label: '心理壓力 / 不法侵害',   icon: '🧠', color: 'bg-rose-500' },
  { code: 'MATERNAL', label: '母性健康保護',          icon: '🤱', color: 'bg-pink-500' },
  { code: 'ERGO',     label: '人因工程 / 肌骨傷害',   icon: '🦾', color: 'bg-orange-500' },
  { code: 'CONFINED', label: '局限空間 / 缺氧危害',   icon: '🚪', color: 'bg-slate-500' },
  { code: 'ASSESS',   label: '暴露評估 / 風險分析',   icon: '📊', color: 'bg-teal-500' },
  { code: 'CONTROL',  label: '工程控制 / 通風換氣',   icon: '🌀', color: 'bg-cyan-500' },
  { code: 'PPE',      label: '個人防護具',            icon: '🦺', color: 'bg-yellow-500' },
  { code: 'PHYS',     label: '物理性危害（噪音等）',  icon: '🔊', color: 'bg-indigo-500' },
  { code: 'SYSTEM',   label: '管理系統 CNS 45001',   icon: '⚙️', color: 'bg-gray-500' },
  { code: 'COMMON',   label: 'ESG / GRI / 共用',    icon: '🌍', color: 'bg-emerald-600' },
  { code: 'LAW',      label: '職安衛法規',            icon: '⚖️', color: 'bg-amber-600' },
]

const TOPIC_CODE_MAP = {
  '作業環境監測技術': 'MONITOR',
  '勞工健康管理與職業病': 'HEALTH',
  '心理壓力與不法侵害預防': 'PSY',
  '化學性危害與GHS標示通識': 'CHEM',
  '母性健康保護': 'MATERNAL',
  '人因工程與肌肉骨骼疾病': 'ERGO',
  '局限空間與缺氧危害': 'CONFINED',
  '工程控制與通風換氣': 'CONTROL',
  '暴露評估與風險分析': 'ASSESS',
  '個人防護具': 'PPE',
  '物理性危害（噪音、輻射、振動、溫熱）': 'PHYS',
  '職安衛法規': 'LAW',
  '職安衛管理系統（CNS 45001）': 'SYSTEM',
  'ESG報告與GRI準則': 'COMMON',
  'ESG報告與GRI準則（職業健康與安全）': 'COMMON',
  'GRI 403 職業健康與安全 10項子準則': 'COMMON',
  'KIM人因危害風險分析 + 中高齡健康管理（照護人員案例）': 'ERGO',
}

const YEARS = [106, 107, 108, 109, 111, 112, 113, 114, 115]
const RECENT_YEARS = [111, 112, 113, 114, 115]

// Law amendment timeline items relevant to exam
const LAW_TIMELINE = [
  {
    date: '2022/01-07',
    title: '勞工健康保護規則修正',
    detail: '50人以上設醫護人員；特殊健檢4級管理',
    risk: 'high',
    topic: 'HEALTH',
  },
  {
    date: '2024/03/08',
    title: '性平三法修正施行',
    detail: '性騷擾定義擴大；知悉即須介入（不再等申訴）',
    risk: 'high',
    topic: 'PSY',
  },
  {
    date: '2025/02/21',
    title: '不法侵害預防指引第四版',
    detail: '明確化霸凌/暴力樣態定義（第三版→第四版）',
    risk: 'high',
    topic: 'PSY',
  },
  {
    date: '2026年（已三讀）',
    title: '職安法 §22-1 職場霸凌防治',
    detail: '職場霸凌定義入法；申訴機制；重大情節不需持續即構成',
    risk: 'critical',
    topic: 'PSY',
  },
  {
    date: '2026年（已三讀）',
    title: '職安法大修：工程業主責任 / 承攬管理',
    detail: '業主須編製安全衛生圖說；交付承攬須風險評估+危害告知',
    risk: 'high',
    topic: 'LAW',
  },
]

function getHeatColor(count, max) {
  if (!count) return 'bg-gray-100 text-gray-300'
  const intensity = count / max
  if (intensity >= 0.8) return 'bg-blue-700 text-white font-bold'
  if (intensity >= 0.5) return 'bg-blue-500 text-white font-semibold'
  if (intensity >= 0.3) return 'bg-blue-300 text-blue-900'
  return 'bg-blue-100 text-blue-700'
}

export default function ExamStats() {
  const [shukeyiData, setShukeyiData] = useState([])
  const [activeTab, setActiveTab] = useState('heatmap')

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/shukeyi_questions.json')
      .then(r => r.json())
      .then(setShukeyiData)
  }, [])

  // Build frequency matrix
  const matrix = {}
  const yearTotals = {}
  for (const q of shukeyiData) {
    const year = parseInt(q.id?.split('-')[0])
    if (!YEARS.includes(year)) continue
    const code = TOPIC_CODE_MAP[q.topic] || 'OTHER'
    const key = `${year}:${code}`
    matrix[key] = (matrix[key] || 0) + 1
    yearTotals[year] = (yearTotals[year] || 0) + 1
  }

  const topicTotals = {}
  for (const t of TOPICS) {
    topicTotals[t.code] = YEARS.reduce((s, y) => s + (matrix[`${y}:${t.code}`] || 0), 0)
  }
  const recentTotals = {}
  for (const t of TOPICS) {
    recentTotals[t.code] = RECENT_YEARS.reduce((s, y) => s + (matrix[`${y}:${t.code}`] || 0), 0)
  }

  const maxCell = Math.max(...Object.values(matrix))
  const sortedTopics = [...TOPICS].sort((a, b) => topicTotals[b.code] - topicTotals[a.code])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 px-4 pt-8 pb-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="text-blue-300 text-sm mb-3 inline-block">← 返回首頁</Link>
          <h1 className="text-2xl font-bold text-white">歷年考題分析</h1>
          <p className="text-blue-200 text-sm mt-1">術科主題分布 × 法令時間軸 × 預測熱點</p>
          <div className="flex gap-2 mt-4">
            <span className="text-xs px-3 py-1 bg-blue-600/60 text-blue-200 rounded-full">
              術科 {shukeyiData.length} 題（106–115年）
            </span>
            <span className="text-xs px-3 py-1 bg-orange-500/70 text-white rounded-full">
              ⚠️ 2026年重大修法
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex">
          {[
            { id: 'heatmap', label: '📊 主題熱圖' },
            { id: 'trend',   label: '📈 近年趨勢' },
            { id: 'law',     label: '⚖️ 法令時間軸' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">

        {/* ===== TAB: HEATMAP ===== */}
        {activeTab === 'heatmap' && (
          <div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-xs text-blue-800">
              <strong>📌 讀圖說明：</strong>顏色越深代表該年出題次數越多。<br />
              橫排看一個主題的「出題軌跡」；縱排看一年的「出題分布」。
            </div>

            {/* Heatmap table - scrollable on mobile */}
            <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-800 text-white">
                    <th className="text-left px-3 py-2 min-w-[140px]">主題</th>
                    {YEARS.map(y => (
                      <th key={y} className="text-center px-2 py-2 min-w-[36px]">
                        {y}
                      </th>
                    ))}
                    <th className="text-center px-2 py-2 text-yellow-300">合計</th>
                    <th className="text-center px-2 py-2 text-blue-300 min-w-[48px]">近5年</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedTopics.map(t => (
                    <tr key={t.code} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium text-gray-700">
                        <span className="mr-1">{t.icon}</span>
                        {t.label}
                      </td>
                      {YEARS.map(y => {
                        const cnt = matrix[`${y}:${t.code}`] || 0
                        return (
                          <td key={y} className="text-center py-2">
                            {cnt > 0 ? (
                              <span className={`inline-block w-6 h-6 rounded text-xs leading-6 ${getHeatColor(cnt, maxCell)}`}>
                                {cnt}
                              </span>
                            ) : (
                              <span className="text-gray-200">·</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="text-center py-2">
                        <span className="font-bold text-gray-800">{topicTotals[t.code] || 0}</span>
                      </td>
                      <td className="text-center py-2">
                        <span className={`font-semibold ${recentTotals[t.code] >= 5 ? 'text-red-600' : recentTotals[t.code] >= 3 ? 'text-orange-500' : 'text-gray-500'}`}>
                          {recentTotals[t.code] || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100 font-semibold border-t-2 border-gray-300">
                    <td className="px-3 py-2 text-gray-600">各年合計</td>
                    {YEARS.map(y => (
                      <td key={y} className="text-center py-2 text-gray-700">
                        {yearTotals[y] || 0}
                      </td>
                    ))}
                    <td className="text-center py-2 text-gray-800">
                      {shukeyiData.filter(q => YEARS.includes(parseInt(q.id?.split('-')[0]))).length}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-400 mt-2 text-right">
              * 112/113年部分場次、110年術科資料尚未完整收錄
            </p>
          </div>
        )}

        {/* ===== TAB: TREND ===== */}
        {activeTab === 'trend' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <strong>🎯 備考重點：</strong>近5年（111–115年）高頻出現的主題，最可能繼續出現。
              紅色 = 超高頻（5次以上），橙色 = 高頻（3–4次）。
            </div>

            {/* Recent 5-year ranking */}
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-red-600 to-orange-500 px-4 py-3">
                <h2 className="text-white font-bold text-sm">近5年術科考題頻率排行（111–115年）</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {sortedTopics
                  .filter(t => recentTotals[t.code] > 0)
                  .sort((a, b) => recentTotals[b.code] - recentTotals[a.code])
                  .map((t, idx) => {
                    const cnt = recentTotals[t.code]
                    const total = topicTotals[t.code]
                    const barWidth = Math.round(cnt / Math.max(...Object.values(recentTotals)) * 100)
                    return (
                      <div key={t.code} className="px-4 py-3 flex items-center gap-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          idx === 0 ? 'bg-red-500 text-white' :
                          idx === 1 ? 'bg-orange-500 text-white' :
                          idx === 2 ? 'bg-yellow-500 text-white' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-800">
                              {t.icon} {t.label}
                            </span>
                            <span className={`text-sm font-bold ${cnt >= 5 ? 'text-red-600' : cnt >= 3 ? 'text-orange-500' : 'text-gray-600'}`}>
                              {cnt}次
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${cnt >= 5 ? 'bg-red-500' : cnt >= 3 ? 'bg-orange-400' : 'bg-blue-400'}`}
                              style={{ width: `${barWidth}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">歷年合計 {total} 次</p>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>

            {/* New emerging topics */}
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-3">
                <h2 className="text-white font-bold text-sm">🆕 近年新興考點（113–115年出現）</h2>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <p className="font-semibold text-emerald-800 text-sm">ESG / GRI 403 職業健康安全</p>
                    <p className="text-xs text-emerald-700 mt-0.5">112年起連續3年出現。GRI 403共10項子準則，需熟記。</p>
                    <Link to="/shukeyi" className="text-xs text-emerald-600 underline mt-1 inline-block">→ 查看113年ESG考題</Link>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-2xl">⚙️</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">管理系統 CNS 45001</p>
                    <p className="text-xs text-gray-600 mt-0.5">114–115年連續出現，預測未來持續考。ISO 45001框架8大要素。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
                  <span className="text-2xl">🧠</span>
                  <div>
                    <p className="font-semibold text-rose-800 text-sm">心理壓力 / 不法侵害 / 霸凌</p>
                    <p className="text-xs text-rose-700 mt-0.5">2026年職安法§22-1霸凌防治入法，預計成為高頻考點。</p>
                    <Link to="/laws" className="text-xs text-rose-600 underline mt-1 inline-block">→ 查看修法速覽</Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Prediction box */}
            <div className="bg-orange-50 border border-orange-300 rounded-xl p-4">
              <p className="font-bold text-orange-800 text-sm mb-2">🎯 116年術科預測（基於近年趨勢）</p>
              <ol className="text-xs text-orange-700 space-y-1.5 list-decimal list-inside">
                <li><strong>作業環境監測</strong>：幾乎每年必考，預測仍為必考主題</li>
                <li><strong>心理壓力 / 職場霸凌</strong>：2026年新法上路，高機率考新法條</li>
                <li><strong>勞工健康管理</strong>：特殊健檢4級管理，母性保護搭配考</li>
                <li><strong>化學性危害 / GHS</strong>：近5年6次，優先管理化學品持續熱點</li>
                <li><strong>ESG / GRI 403</strong>：2026考試很可能出現，需掌握10項子準則</li>
              </ol>
              <p className="text-xs text-orange-500 mt-2">⚠️ 預測僅供參考，實際以考選部公布題目為準</p>
            </div>
          </div>
        )}

        {/* ===== TAB: LAW TIMELINE ===== */}
        {activeTab === 'law' && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800">
              <strong>⚠️ 法令時間點注意：</strong>考題答案以「考試當時有效法律」為準。
              2026年修法三讀通過但尚未施行的條文，在116年考試中可能已施行，需特別留意。
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              {LAW_TIMELINE.map((item, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-xl shadow border overflow-hidden ${
                    item.risk === 'critical' ? 'border-red-400' : 'border-gray-200'
                  }`}
                >
                  <div className={`px-4 py-2 flex items-center gap-2 ${
                    item.risk === 'critical' ? 'bg-red-600' :
                    item.risk === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                  }`}>
                    <span className="text-white text-xs font-bold">
                      {item.risk === 'critical' ? '🔴 超高機率' : '🟠 高機率'}
                    </span>
                    <span className="text-white/80 text-xs ml-auto">{item.date}</span>
                  </div>
                  <div className="px-4 py-3">
                    <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.detail}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {TOPICS.find(t => t.code === item.topic)?.icon}{' '}
                        {TOPICS.find(t => t.code === item.topic)?.label}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning about law accuracy */}
            <div className="bg-gray-100 rounded-xl p-4 text-xs text-gray-600 space-y-2">
              <p className="font-bold text-gray-700">📋 法規引用原則（防止幻覺）</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>本系統所有法規引用以<strong>官方法規資料庫（全國法規資料庫）</strong>為準</li>
                <li>修法內容標注「生效日期」，區分施行中 vs 已三讀待施行</li>
                <li>若您發現法規引用有誤，請以官方版本為準</li>
                <li><strong>2026年職安法修正</strong>：2025年12月已三讀，預計2026年施行；部分條文施行日期仍待公告</li>
              </ul>
            </div>

            {/* Quick links */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/laws"
                className="bg-indigo-600 rounded-xl p-4 text-white text-center hover:bg-indigo-700 transition-colors"
              >
                <p className="text-2xl mb-1">⚖️</p>
                <p className="text-sm font-semibold">修法速覽</p>
                <p className="text-xs text-indigo-200">新舊法白話對照</p>
              </Link>
              <Link
                to="/predictions"
                className="bg-orange-500 rounded-xl p-4 text-white text-center hover:bg-orange-600 transition-colors"
              >
                <p className="text-2xl mb-1">🎯</p>
                <p className="text-sm font-semibold">AI預測考題</p>
                <p className="text-xs text-orange-100">基於新法條預測</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
