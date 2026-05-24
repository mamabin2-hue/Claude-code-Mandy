import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import FlashCard from '../components/FlashCard'
import { useProgress } from '../hooks/useProgress'
import { getCategoryInfo } from '../utils/categories'

export default function FlashcardPage() {
  const [allCards, setAllCards] = useState([])
  const [allQ, setAllQ] = useState([])
  const [category, setCategory] = useState('ALL')
  const [mode, setMode] = useState('config')
  const [deck, setDeck] = useState([])
  const [idx, setIdx] = useState(0)
  const { masteredIds, markMastered, unmarkMastered } = useProgress()

  useEffect(() => {
    Promise.all([
      fetch(import.meta.env.BASE_URL + 'data/knowledge_cards.json').then(r => r.json()),
      fetch(import.meta.env.BASE_URL + 'data/questions.json').then(r => r.json()),
    ]).then(([cards, questions]) => {
      setAllCards(cards)
      const qCards = questions.map(q => ({
        id: `q-${q.id}`,
        type: 'qa',
        category: q.category,
        categoryName: q.categoryName,
        topic: `${q.year}年 第${q.session}次考試`,
        front: q.question,
        back: `【正確答案】${q.answer}\n\n${q.options.find(o => o.startsWith(q.answer + '.')) || ''}\n\n📖 解析：${q.explanation || '（無解析）'}`,
        note: `📋 出處：${q.year}年 第${q.session}次考試 題號${q.id}`,
        lawRef: q.lawRef,
      }))
      setAllQ(qCards)
    })
  }, [])

  const categories = [...new Set([...allCards, ...allQ].map(c => c.category))]
  const filtered = [...allCards, ...allQ].filter(c => category === 'ALL' || c.category === category)
  const nonMastered = filtered.filter(c => !masteredIds.includes(c.id))

  function startDeck() {
    setDeck(nonMastered)
    setIdx(0)
    setMode('study')
  }

  function handleMastered(id) {
    if (masteredIds.includes(id)) {
      unmarkMastered(id)
    } else {
      markMastered(id)
    }
  }

  if (mode === 'config') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="text-slate-400 hover:text-slate-600">←</Link>
            <h2 className="text-xl font-bold">翻牌練習</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 space-y-4">
            <p className="text-sm text-slate-600">
              包含知識摘要卡片 + 歷年試題翻牌，共 {filtered.length} 張（已掌握 {masteredIds.filter(id => filtered.find(c=>c.id===id)).length} 張）
            </p>

            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-2">類別</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setCategory('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    category === 'ALL' ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  全部
                </button>
                {categories.map(cat => {
                  const info = getCategoryInfo(cat)
                  const shortName = info.name.split('（')[0].replace('職安衛', '').trim()
                  const isActive = category === cat
                  return (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors cursor-pointer ${
                        isActive ? info.color + ' font-bold' : 'bg-slate-100 text-slate-600 border-transparent hover:bg-slate-200'
                      }`}
                    >
                      {info.icon} {shortName}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={startDeck}
              disabled={nonMastered.length === 0}
              className="w-full py-3 bg-teal-700 text-white rounded-xl font-bold hover:bg-teal-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              開始翻牌（{nonMastered.length} 張）
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (idx >= deck.length) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="text-5xl mb-4">🎊</div>
            <p className="text-xl font-bold text-teal-700 mb-2">全部翻完了！</p>
            <p className="text-slate-500 text-sm mb-6">已標記為掌握的卡片下次不會出現</p>
            <div className="flex gap-3">
              <button onClick={() => { setDeck(nonMastered); setIdx(0) }} className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer">
                再翻一次
              </button>
              <button onClick={() => setMode('config')} className="flex-1 py-3 bg-teal-700 text-white rounded-xl font-bold hover:bg-teal-800 cursor-pointer">
                重新設定
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const card = deck[idx]

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setMode('config')} className="text-slate-400 hover:text-slate-600 cursor-pointer">← 返回</button>
          <span className="text-sm text-slate-500">{idx + 1}/{deck.length}</span>
        </div>

        <div className="w-full h-1.5 bg-slate-200 rounded-full mb-4 overflow-hidden">
          <div className="h-full bg-teal-600 rounded-full transition-all" style={{ width: `${(idx / deck.length) * 100}%` }} />
        </div>

        <FlashCard key={card.id} card={card} onMastered={handleMastered} isMastered={masteredIds.includes(card.id)} />

        <div className="flex gap-3 mt-4">
          <button onClick={() => setIdx(i => Math.max(0, i - 1))} disabled={idx === 0} className="px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-600 disabled:opacity-40 cursor-pointer hover:bg-slate-50">
            ←
          </button>
          <button onClick={() => setIdx(i => i + 1)} className="flex-1 py-3 bg-teal-700 text-white rounded-xl font-bold hover:bg-teal-800 cursor-pointer">
            {idx + 1 < deck.length ? '下一張 →' : '完成'}
          </button>
        </div>
      </div>
    </div>
  )
}
