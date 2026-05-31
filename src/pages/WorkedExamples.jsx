import { useState } from 'react'
import { Link } from 'react-router-dom'
import { EXAM_PROBLEMS, WBGT_PROBLEMS, GENERAL_PROBLEMS, TOPICS } from '../data/examProblems'

const FORMULA_REF = [
  { topic: 'Lw（音功率級）', formula: 'Lw = 10×log₁₀(W/W₀)，W₀=10⁻¹² W', note: '✅' },
  { topic: 'Lp（半自由音場）', formula: 'Lp = Lw − 8 − 20×log₁₀(r)，r=距離(m)', note: '✅ 距離加倍→降6dB' },
  { topic: 'OSHA容許時間', formula: 'T = 8 ÷ 2^((L−90)/5)  (hr)', note: '✅ 87dB→12.13hr驗算' },
  { topic: 'TWA₈', formula: 'TWA₈ = 16.61×log₁₀(D/100)+90  (D=劑量%)', note: '✅' },
  { topic: 'LAVG（工作時數≠8hr）', formula: 'LAVG = 16.61×log₁₀(D/100×8/T_work)+90', note: '✅' },
  { topic: '加值表（噪音合成）', formula: 'ΔL差 0~1→+3；2~4→+2；5~9→+1；≥10→+0', note: '✅' },
  { topic: '背景音扣除', formula: 'ΔL差 3→扣3；4~5→扣2；6~9→扣1；≥10→扣0', note: '✅ 精確：10×log(10^(L全/10)−10^(L背/10))' },
  { topic: 'WBGT（室內/無日曬）', formula: 'WBGT = 0.7×Tnwb + 0.3×Tg', note: '✅ §3' },
  { topic: 'WBGT（戶外有日曬）', formula: 'WBGT = 0.7×Tnwb + 0.2×Tg + 0.1×Ta', note: '✅ §3' },
  { topic: 'WBGT時量平均', formula: 'WBGT_TWA = Σ(WBGTᵢ×tᵢ) / Σtᵢ', note: '✅' },
  { topic: '代謝率', formula: '休息100、輕150、中300、重400 kcal/hr', note: '✅ 試題驗算' },
  { topic: '平均照度', formula: 'Ē = (E₁+E₂+⋯+Eₙ)/n  (lux)', note: '✅ §313' },
]

const TOPIC_TABS = [
  { key: 'noise', label: '噪音 Q1–Q24 + 照度 Q25', color: 'blue' },
  { key: 'wbgt', label: '高溫WBGT Q1–Q11', color: 'orange' },
  { key: 'general', label: '術科綜合 G1–G3', color: 'purple' },
]

const TOPIC_COLOR = {
  '噪音': 'bg-blue-100 text-blue-700',
  '照度': 'bg-yellow-100 text-yellow-700',
  '高溫WBGT': 'bg-orange-100 text-orange-700',
  '通風計算': 'bg-sky-100 text-sky-700',
  '化學監測': 'bg-purple-100 text-purple-700',
  '法規應用': 'bg-rose-100 text-rose-700',
}

function ProblemCard({ prob, revealed, onToggle }) {
  const [openSub, setOpenSub] = useState(null)
  const [imgError, setImgError] = useState(false)
  const isWBGT = prob.topic === '高溫WBGT'
  const isGeneral = ['通風計算', '化學監測', '法規應用'].includes(prob.topic)
  const accentColor = isWBGT ? 'orange' : isGeneral ? 'purple' : 'blue'

  return (
    <div className={`bg-white rounded-2xl shadow-sm border overflow-hidden ${
      isWBGT ? 'border-orange-100' : isGeneral ? 'border-purple-100' : 'border-gray-100'
    }`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b ${isWBGT ? 'border-orange-50 bg-orange-50/30' : isGeneral ? 'border-purple-50 bg-purple-50/30' : 'border-gray-50'}`}>
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${TOPIC_COLOR[prob.topic]}`}>
            {prob.topic}
          </span>
          <span className="text-xs font-mono text-white bg-gray-600 px-2 py-0.5 rounded-full">
            Q{prob.id}
          </span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {prob.year} 年度
          </span>
          {prob.lawRef && (
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              ⚖️ {prob.lawRef.split('；')[0]}
            </span>
          )}
        </div>
        <h3 className="font-semibold text-gray-800 leading-snug">{prob.title}</h3>
      </div>

      {/* Question image (original scan) */}
      {prob.imageRef && !imgError && (
        <div className="px-4 pt-3">
          <img
            src={prob.imageRef}
            alt={`Q${prob.id} 原始試題`}
            className="w-full rounded-xl border border-gray-200 object-contain max-h-64"
            onError={() => setImgError(true)}
          />
          <p className="text-xs text-gray-400 mt-1 text-center">📷 原始試題掃描檔</p>
        </div>
      )}

      {/* Question */}
      <div className="px-4 py-3 bg-gray-50">
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{prob.question}</p>
      </div>

      {/* Knowledge cards */}
      {prob.knowledgeCards?.length > 0 && (
        <div className="px-4 py-1.5 bg-blue-50 flex flex-wrap gap-1 items-center">
          <span className="text-xs text-blue-400">📚 相關知識卡：</span>
          {prob.knowledgeCards.map(c => (
            <span key={c} className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono">{c}</span>
          ))}
        </div>
      )}

      {/* Toggle button */}
      <div className="px-4 py-3">
        <button
          onClick={() => { onToggle(); setOpenSub(null) }}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-colors ${
            revealed
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : `${isWBGT ? 'bg-orange-600 hover:bg-orange-700' : isGeneral ? 'bg-purple-700 hover:bg-purple-800' : 'bg-blue-700 hover:bg-blue-800'} text-white`
          }`}
        >
          {revealed ? '✓ 收起解析' : '▶ 查看職業衛生師解析'}
        </button>
      </div>

      {/* Solution */}
      {revealed && (
        <div className="px-4 pb-4 space-y-2">
          {/* Answer badge */}
          <div className={`rounded-xl p-3 border-l-4 ${isWBGT ? 'bg-orange-50 border-orange-500' : isGeneral ? 'bg-purple-50 border-purple-500' : 'bg-green-50 border-green-500'}`}>
            <p className="text-xs font-bold text-gray-500 mb-0.5">最終答案</p>
            <p className={`text-sm font-semibold ${isWBGT ? 'text-orange-900' : isGeneral ? 'text-purple-900' : 'text-green-900'}`}>{prob.answer}</p>
          </div>

          {/* Sub-answers */}
          {prob.subAnswers.map((sub, i) => (
            <div key={i} className="border border-gray-100 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpenSub(openSub === i ? null : i)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <span className="text-sm font-medium text-gray-700">{sub.label}</span>
                <span className="text-gray-400 text-xs">{openSub === i ? '▲' : '▼'}</span>
              </button>
              {openSub === i && (
                <div className="px-3 py-3 bg-white">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">{sub.content}</pre>
                  {sub.steps.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-1">關鍵步驟</p>
                      <div className="flex flex-wrap gap-1">
                        {sub.steps.map((s, j) => (
                          <span key={j} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Law reference */}
          {prob.lawRef && (
            <div className="bg-indigo-50 rounded-xl p-2.5">
              <p className="text-xs text-indigo-700">⚖️ 法規依據：{prob.lawRef}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WorkedExamples() {
  const [activeSection, setActiveSection] = useState('noise')
  const [revealedIds, setRevealedIds] = useState({})
  const [showFormulas, setShowFormulas] = useState(false)
  const [searchText, setSearchText] = useState('')

  const toggleReveal = (id) =>
    setRevealedIds(prev => ({ ...prev, [id]: !prev[id] }))

  const allProblems = activeSection === 'noise' ? EXAM_PROBLEMS
    : activeSection === 'wbgt' ? WBGT_PROBLEMS
    : GENERAL_PROBLEMS

  const filtered = searchText.trim()
    ? allProblems.filter(p =>
        p.title.includes(searchText) ||
        p.question.includes(searchText) ||
        String(p.id).includes(searchText)
      )
    : allProblems

  const revealAll = () => {
    const updates = {}
    filtered.forEach(p => { updates[`${activeSection}-${p.id}`] = true })
    setRevealedIds(prev => ({ ...prev, ...updates }))
  }

  const collapseAll = () => {
    const updates = {}
    filtered.forEach(p => { updates[`${activeSection}-${p.id}`] = false })
    setRevealedIds(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white px-4 pt-8 pb-5">
        <div className="max-w-2xl mx-auto">
          <Link to="/" className="text-blue-200 text-sm hover:text-white mb-3 inline-block">← 返回首頁</Link>
          <h1 className="text-2xl font-bold">解題練習區</h1>
          <p className="text-blue-200 text-sm mt-1">
            整理自 81～115 年歷年考古題 × 依法令出題 × 職業衛生師解題格式
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <span className="text-xs px-2.5 py-0.5 bg-blue-600/60 rounded-full">噪音 Q1–Q24</span>
            <span className="text-xs px-2.5 py-0.5 bg-orange-500/70 rounded-full">高溫WBGT Q1–Q11</span>
            <span className="text-xs px-2.5 py-0.5 bg-yellow-500/70 rounded-full">照度 Q25</span>
            <span className="text-xs px-2.5 py-0.5 bg-purple-500/70 rounded-full">術科綜合 G1–G3</span>
          </div>
          <p className="text-blue-300 text-xs mt-2">
            ✅ = 依法令原文/官方答案驗算　⚠️ = 依公式推算，請核對老師版本
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Formula panel */}
        <div className="mb-4">
          <button
            onClick={() => setShowFormulas(!showFormulas)}
            className="w-full bg-indigo-700 text-white rounded-xl px-4 py-3 font-semibold flex items-center justify-between text-sm"
          >
            <span>📐 計算公式速查（點擊展開）</span>
            <span>{showFormulas ? '▲' : '▼'}</span>
          </button>
          {showFormulas && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-b-xl p-3 space-y-2">
              {FORMULA_REF.map((f, i) => (
                <div key={i} className="pb-2 border-b border-indigo-100 last:border-0">
                  <p className="text-xs font-semibold text-indigo-900">{f.topic}</p>
                  <p className="font-mono text-xs text-indigo-800 bg-white rounded px-2 py-1 mt-0.5">{f.formula}</p>
                  <p className="text-xs text-indigo-400 mt-0.5">{f.note}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section tabs */}
        <div className="flex gap-2 mb-4">
          {TOPIC_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => { setActiveSection(t.key); setSearchText('') }}
              className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                activeSection === t.key
                  ? t.color === 'orange' ? 'bg-orange-600 text-white'
                    : t.color === 'purple' ? 'bg-purple-700 text-white'
                    : 'bg-blue-700 text-white'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search + controls */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            placeholder="搜尋題號或關鍵字…"
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button onClick={revealAll} className="text-xs px-3 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700">全開</button>
          <button onClick={collapseAll} className="text-xs px-3 py-2 bg-gray-400 text-white rounded-xl hover:bg-gray-500">全收</button>
        </div>

        {/* Stats row */}
        <div className="flex gap-2 mb-3">
          <div className={`flex-1 rounded-xl px-3 py-2 text-center ${activeSection === 'noise' ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <p className="text-xs text-gray-500">題目數</p>
            <p className={`font-bold text-lg ${activeSection === 'noise' ? 'text-blue-700' : 'text-orange-700'}`}>{filtered.length}</p>
          </div>
          <div className="flex-1 bg-green-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xs text-gray-500">已解析</p>
            <p className="font-bold text-lg text-green-700">
              {filtered.filter(p => revealedIds[`${activeSection}-${p.id}`]).length}
            </p>
          </div>
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-center">
            <p className="text-xs text-gray-500">待練習</p>
            <p className="font-bold text-lg text-gray-600">
              {filtered.filter(p => !revealedIds[`${activeSection}-${p.id}`]).length}
            </p>
          </div>
        </div>

        {/* Problem list */}
        <div className="space-y-4">
          {filtered.map(prob => (
            <ProblemCard
              key={`${activeSection}-${prob.id}`}
              prob={prob}
              revealed={!!revealedIds[`${activeSection}-${prob.id}`]}
              onToggle={() => toggleReveal(`${activeSection}-${prob.id}`)}
            />
          ))}
        </div>

        {/* Professional OSH exam tips */}
        <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
          <p className="text-emerald-800 font-semibold text-sm mb-2">🎓 子安技師解題格式提醒</p>
          <ul className="text-emerald-700 text-xs space-y-1">
            <li>• <strong>引用法條</strong>：計算答案前先寫「依職安衛設施規則§300」或「依OSHA 5dB換算表」</li>
            <li>• <strong>驗算步驟</strong>：計算過程要完整列出，帶入數字後逐步化簡</li>
            <li>• <strong>單位標明</strong>：dB、hr、%、°C、Lux 均須標示</li>
            <li>• <strong>法規判斷</strong>：最後一步需對照法規上限，明確寫出「超過/未超過法規規定」</li>
            <li>• <strong>保護措施</strong>：若超標，需列出工程控制→行政管理→個人防護具依序措施</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="mt-4 text-center space-y-2">
          <Link to="/knowledge" className="block text-blue-600 text-sm hover:underline">
            → 前往知識卡片複習相關概念
          </Link>
          <Link to="/law-ref" className="block text-indigo-600 text-sm hover:underline">
            → 查閱完整法規條文
          </Link>
        </div>
      </div>
    </div>
  )
}
