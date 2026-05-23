import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CAT_COLORS = {
  '職業安全衛生法': 'bg-blue-100 text-blue-800',
  '性別平等工作法': 'bg-pink-100 text-pink-800',
  '危害性化學品管理': 'bg-teal-100 text-teal-800',
}

export default function LawChanges() {
  const [laws, setLaws] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [activeTab, setActiveTab] = useState({})

  useEffect(() => {
    fetch('/data/law_changes.json').then(r => r.json()).then(data => {
      setLaws(data)
      if (data.length > 0) setExpanded(data[0].id)
    })
  }, [])

  function tab(id) { return activeTab[id] || 'compare' }
  function setTab(id, t) { setActiveTab(prev => ({ ...prev, [id]: t })) }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600">←</Link>
          <div>
            <h2 className="text-xl font-bold">修法速覽</h2>
            <p className="text-xs text-slate-500">新舊法對照 · 白話說明 · 考試重點</p>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 mb-4">
          <p className="text-orange-700 text-xs font-semibold">⚠️ 重要提醒</p>
          <p className="text-orange-600 text-xs mt-1">所有法條均引自官方原文。AI白話說明僅供輔助理解，考試請以官方公告為準。</p>
        </div>

        <div className="space-y-3">
          {laws.map(law => {
            const isOpen = expanded === law.id
            const currentTab = tab(law.id)
            return (
              <div key={law.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border ${law.isNew ? 'border-orange-200' : 'border-slate-100'}`}>
                {/* Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : law.id)}
                  className="w-full p-4 text-left flex items-start gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-1">
                      {law.isNew && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500 text-white font-bold">🆕 新法</span>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${CAT_COLORS[law.category] || 'bg-slate-100 text-slate-700'}`}>
                        {law.category}
                      </span>
                    </div>
                    <p className="font-bold text-slate-800">{law.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">📅 {law.effectiveDate}</p>
                  </div>
                  <span className="text-slate-400 mt-1 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100">
                    {/* Tab nav */}
                    <div className="flex border-b border-slate-100">
                      {[
                        { id: 'compare', label: '新舊對照' },
                        { id: 'plain', label: '白話說明' },
                        { id: 'points', label: '新法重點' },
                        { id: 'exam', label: '考題預測' },
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setTab(law.id, t.id)}
                          className={`flex-1 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                            currentTab === t.id
                              ? 'text-blue-700 border-b-2 border-blue-700 bg-blue-50'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="p-4">
                      {/* Compare tab */}
                      {currentTab === 'compare' && (
                        <div className="space-y-3">
                          <div className="rounded-xl overflow-hidden border border-slate-200">
                            <div className="bg-red-50 px-3 py-2 border-b border-slate-200">
                              <p className="text-xs font-bold text-red-700">⚠️ 舊法（修正前）</p>
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-slate-700 leading-relaxed">{law.oldLaw}</p>
                            </div>
                          </div>
                          <div className="text-center text-slate-400 text-lg">↓ 修正後 ↓</div>
                          <div className="rounded-xl overflow-hidden border border-green-200">
                            <div className="bg-green-50 px-3 py-2 border-b border-green-200">
                              <p className="text-xs font-bold text-green-700">✅ 新法（{law.effectiveDate}）</p>
                            </div>
                            <div className="p-3">
                              <p className="text-sm text-slate-700 leading-relaxed">{law.newLaw}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                            <p className="text-xs font-bold text-amber-700 mb-1">📊 差異摘要</p>
                            <p className="text-xs text-amber-900 leading-relaxed whitespace-pre-line">{law.diffSummary}</p>
                          </div>
                          <p className="text-xs text-slate-400 text-center">法條來源：{law.lawRef}</p>
                        </div>
                      )}

                      {/* Plain tab */}
                      {currentTab === 'plain' && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-xs font-bold text-blue-700 mb-2">🗣️ 白話說明（連國中生都看得懂）</p>
                          <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                            {law.plainText}
                          </div>
                        </div>
                      )}

                      {/* Key points tab */}
                      {currentTab === 'points' && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 mb-3">📌 新法重點整理（逐條）</p>
                          <ul className="space-y-2">
                            {law.keyPoints.map((pt, i) => (
                              <li key={i} className="flex gap-2 items-start">
                                <span className="text-blue-600 font-bold text-sm flex-shrink-0">{i + 1}.</span>
                                <p className="text-sm text-slate-700">{pt}</p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Exam tab */}
                      {currentTab === 'exam' && (
                        <div>
                          <p className="text-xs font-bold text-slate-600 mb-3">🎯 可能出現的考題方向</p>
                          <div className="space-y-2">
                            {law.possibleExamQuestions.map((q, i) => (
                              <div key={i} className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                                <p className="text-sm text-indigo-800">❓ {q}</p>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                            <p className="text-xs text-orange-700">⚠️ 以上為預測方向，非官方公告考題，請自行核對最新法規原文。</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
