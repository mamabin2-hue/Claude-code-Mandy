import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'

const CAT_COLORS = {
  A: 'bg-purple-100 text-purple-700 border-purple-200',
  B: 'bg-blue-100 text-blue-700 border-blue-200',
  C: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  D: 'bg-teal-100 text-teal-700 border-teal-200',
  E: 'bg-orange-100 text-orange-700 border-orange-200',
  F: 'bg-red-100 text-red-700 border-red-200',
  LAW: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

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

  useEffect(() => {
    Promise.all([
      fetch(import.meta.env.BASE_URL + 'data/knowledge_cards.json').then(r => r.json()),
      fetch(import.meta.env.BASE_URL + 'data/questions.json').then(r => r.json()),
    ]).then(([cards, questions]) => {
      setCards(cards)
      setAllQ(questions)
    })
  }, [])

  const categories = [...new Set(cards.map(c => c.category))]
  const filtered = cards.filter(c => {
    if (category !== 'ALL' && c.category !== category) return false
    if (search && !c.topic.includes(search) && !c.front.includes(search) && !c.back.includes(search)) return false
    return true
  })

  function getRelatedQ(ids) {
    return (ids || []).map(id => allQ.find(q => q.id === id)).filter(Boolean)
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600">←</Link>
          <h2 className="text-xl font-bold">知識卡片</h2>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="搜尋關鍵字…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2.5 rounded-xl border-2 border-slate-200 focus:border-blue-400 outline-none text-sm"
        />

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['ALL', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer border ${
                category === cat
                  ? `${CAT_COLORS[cat] || 'bg-slate-700 text-white border-slate-700'}`
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? '全部' : cat}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="space-y-3">
          {filtered.map(card => {
            const isOpen = expanded === card.id
            const relatedQ = getRelatedQ(card.relatedQuestionIds)
            return (
              <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : card.id)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${CAT_COLORS[card.category] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {card.categoryName}
                      </span>
                      {card.type === 'summary' ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">摘要卡</span>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">問答卡</span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">{card.topic}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{card.front}</p>
                  </div>
                  <span className="text-slate-400 mt-1">{isOpen ? '▲' : '▼'}</span>
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
                        <p className="text-xs text-yellow-800">{card.note}</p>
                      </div>
                    )}
                    {relatedQ.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-bold text-slate-500 mb-2">📌 相關歷年考題</p>
                        <div className="space-y-2">
                          {relatedQ.map(q => (
                            <div key={q.id} className="p-2.5 bg-blue-50 rounded-xl border border-blue-100">
                              <p className="text-xs text-blue-600 mb-1">{q.year}年 第{q.session}次</p>
                              <p className="text-xs text-slate-700">{q.question}</p>
                              <p className="text-xs text-green-700 mt-1 font-semibold">答案：{q.answer}</p>
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
            <p className="text-center text-slate-400 py-8">沒有符合條件的卡片</p>
          )}
        </div>
      </div>
    </div>
  )
}
