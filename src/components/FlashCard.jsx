import { useState } from 'react'

export default function FlashCard({ card, onMastered, isMastered }) {
  const [flipped, setFlipped] = useState(false)

  if (!card) return null

  function renderBack(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-blue-800 mt-2">{line.slice(2, -2)}</p>
      }
      if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
        return <p key={i} className="ml-3 text-sm">{line}</p>
      }
      if (line.startsWith('- ') || line.startsWith('✅') || line.startsWith('❌') || line.startsWith('⭐') || line.startsWith('💡') || line.startsWith('🔑')) {
        return <p key={i} className="ml-2 text-sm">{line}</p>
      }
      if (line === '') return <div key={i} className="h-2" />
      return <p key={i} className="text-sm leading-relaxed">{line}</p>
    })
  }

  return (
    <div className="card-flip" style={{ height: '340px' }}>
      <div className={`card-flip-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front */}
        <div className="card-front bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl shadow-lg p-6 flex flex-col justify-between">
          <div>
            <div className="flex gap-2 mb-4">
              <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">{card.categoryName}</span>
              <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded-full">{card.topic}</span>
            </div>
            <p className="text-lg font-semibold text-white leading-relaxed">{card.front}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-blue-300 text-xs">點擊翻牌查看答案</p>
            <button
              onClick={() => setFlipped(true)}
              className="bg-white text-blue-800 px-5 py-2 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors cursor-pointer"
            >
              翻牌 →
            </button>
          </div>
        </div>

        {/* Back */}
        <div className="card-back bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between overflow-auto">
          <div>
            <div className="flex gap-2 mb-3">
              <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">✓ 解答</span>
              {card.lawRef && (
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">📋 {card.lawRef}</span>
              )}
            </div>
            <div className="text-slate-800 space-y-1">
              {renderBack(card.back)}
            </div>
            {card.note && (
              <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">{card.note}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFlipped(false)}
              className="flex-1 py-2 rounded-xl border-2 border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ← 返回
            </button>
            <button
              onClick={() => onMastered?.(card.id)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                isMastered
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMastered ? '✓ 已掌握' : '標記已掌握'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
