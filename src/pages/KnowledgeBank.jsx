import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES, getCategoryInfo } from '../utils/categories'

const TOPIC_GROUPS = [
  { label: '危害辨識', codes: ['CHEM', 'PHYS', 'BIO', 'ERGO', 'PSY'] },
  { label: '評估監測', codes: ['ASSESS', 'MONITOR'] },
  { label: '控制措施', codes: ['CONTROL', 'PPE', 'CONFINED'] },
  { label: '健康管理', codes: ['HEALTH', 'MATERNAL', 'FIRSTAID'] },
  { label: '管理系統', codes: ['SYSTEM', 'LAW', 'COMMON'] },
]

function renderText(text) {
  if (!text) return null
  return text.split('\n').map((line, i) => {
    if (!line) return <div key={i} className="h-1.5" />
    if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-slate-800 mt-2">{line.slice(2,-2)}</p>
    if (line.startsWith('| ')) return <p key={i} className="text-xs font-mono bg-slate-50 px-1 rounded">{line}</p>
    return <p key={i} className="text-sm leading-relaxed">{line}</p>
  })
}

export default function KnowledgeBank() {
  const [cards, setCards] = useState([])
  const [allQ, setAllQ] = useState([])
  const [category, setCategory] = useState('ALL')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'group'

  useEffect(() => {
    Promise.all([
      fetch(import.meta.env.BASE_URL + 'data/knowledge_cards.json').then(r => r.json()),
      fetch(import.meta.env.BASE_URL + 'data/questions.json').then(r => r.json()),
    ]).then(([c, q]) => { setCards(c); setAllQ(q) })
  }, [])

  const availableCats = [...new Set(cards.map(c => c.category))]

  const filtered = cards.filter(c => {
    if (category !== 'ALL' && c.category !== category) return false
    if (search) {
      const s = search.toLowerCase()
      return c.topic.toLowerCase().includes(s) ||
             c.front.toLowerCase().includes(s) ||
             (c.back || '').toLowerCase().includes(s)
    }
    return true
  })

  function getRelatedQ(ids) {
    return (ids || []).map(id => allQ.find(q => q.id === id)).filter(Boolean)
  }

  const catInfo = (code) => getCategoryInfo(code)

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600">←</Link>
          <h2 className="text-xl font-bold">知識卡片</h2>
          <span className="ml-auto text-xs text-slate-500">{cards.length} 張卡片</span>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="搜尋關鍵字（如：局限空間、霸凌、CPR…）"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-400 outline-none text-sm"
        />

        {/* Topic group filter */}
        <div className="mb-4">
          <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
            <button
              onClick={() => setCategory('ALL')}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
                category === 'ALL' ? 'bg-slate-700 text-white border-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              全部
            </button>
            {TOPIC_GROUPS.map(group => (
              <div key={group.label} className="flex-shrink-0 flex items-center gap-1">
                <span className="text-xs text-slate-400">{group.label}:</span>
                {group.codes.filter(c => availableCats.includes(c)).map(code => {
                  const info = catInfo(code)
                  const active = category === code
                  return (
                    <button
                      key={code}
                      onClick={() => setCategory(active ? 'ALL' : code)}
                      className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                        active ? info.color + ' font-bold' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {info.icon} {info.name.split('（')[0].split('（')[0].replace('職安衛', '').trim()}
                    </button>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Stats for selected category */}
        {category !== 'ALL' && (
          <div className={`mb-4 p-3 rounded-xl border ${catInfo(category).color}`}>
            <p className="text-sm font-bold">{catInfo(category).icon} {catInfo(category).name}</p>
            <p className="text-xs mt-1 opacity-75">{filtered.length} 張知識卡片</p>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-3">
          {filtered.map(card => {
            const isOpen = expanded === card.id
            const relatedQ = getRelatedQ(card.relatedQuestionIds)
            const info = catInfo(card.category)
            return (
              <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : card.id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${info.color}`}>
                        {info.icon} {info.name.split('（')[0].trim()}
                      </span>
                      {card.type === 'summary' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">摘要</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">問答</span>
                      )}
                      {card.lawRef && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200">📋 法規</span>
                      )}
                    </div>
                    <p className="font-bold text-slate-800 text-sm">{card.topic}</p>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{card.front}</p>
                  </div>
                  <span className="text-slate-400 mt-1 flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 border-t border-slate-100">
                    {card.lawRef && (
                      <div className="mt-3 mb-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">📋 {card.lawRef}</span>
                      </div>
                    )}
                    <div className="mt-3 text-slate-700 space-y-1">
                      {renderText(card.back)}
                    </div>
                    {card.note && (
                      <div className="mt-3 p-2.5 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-xs text-yellow-800">⭐ {card.note}</p>
                      </div>
                    )}
                    {relatedQ.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-slate-500 mb-2">📌 相關歷年考題</p>
                        <div className="space-y-2">
                          {relatedQ.map(q => (
                            <div key={q.id} className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                              <p className="text-xs text-blue-600 mb-1">{q.year > 0 ? `${q.year}年 第${q.session}次` : '練習題'}</p>
                              <p className="text-xs text-slate-700">{q.question}</p>
                              <p className="text-xs text-green-700 mt-1 font-semibold">答：{q.answer}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-slate-500">找不到符合「{search || category}」的卡片</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
