const CATEGORY_COLORS = {
  A: 'bg-purple-100 text-purple-700',
  B: 'bg-blue-100 text-blue-700',
  C: 'bg-cyan-100 text-cyan-700',
  D: 'bg-teal-100 text-teal-700',
  E: 'bg-orange-100 text-orange-700',
  F: 'bg-red-100 text-red-700',
  LAW: 'bg-indigo-100 text-indigo-700',
}

export default function ScoreReport({ results, totalTime, onRetry, onHome }) {
  const total = results.length
  const correct = results.filter(r => r.correct).length
  const score = Math.round((correct / total) * 100)
  const passed = score >= 60

  const byCategory = {}
  results.forEach(r => {
    const cat = r.question.category
    if (!byCategory[cat]) byCategory[cat] = { name: r.question.categoryName, correct: 0, total: 0 }
    byCategory[cat].total++
    if (r.correct) byCategory[cat].correct++
  })

  const timeStr = totalTime
    ? `${Math.floor(totalTime / 60)}分${totalTime % 60}秒`
    : null

  return (
    <div className="space-y-5">
      {/* Main score card */}
      <div className={`rounded-2xl p-8 text-center shadow-md ${passed ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-400'}`}>
        <div className={`text-6xl font-bold mb-2 ${passed ? 'text-green-700' : 'text-red-700'}`}>
          {score}分
        </div>
        <div className={`text-xl font-semibold mb-1 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed ? '🎉 合格！' : '⚠️ 未達合格標準（60分）'}
        </div>
        <p className="text-slate-600 text-sm">{correct} / {total} 題答對{timeStr ? `，用時 ${timeStr}` : ''}</p>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <h3 className="font-bold text-slate-700 mb-3">各類別成績</h3>
        <div className="space-y-3">
          {Object.entries(byCategory).map(([cat, data]) => {
            const pct = Math.round((data.correct / data.total) * 100)
            return (
              <div key={cat}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat] || 'bg-slate-100 text-slate-700'}`}>
                    {data.name}
                  </span>
                  <span className={`text-sm font-bold ${pct >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.correct}/{data.total} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${pct >= 60 ? 'bg-green-500' : 'bg-red-400'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Weak areas */}
      {Object.entries(byCategory).some(([,d]) => d.correct / d.total < 0.6) && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <p className="font-bold text-amber-700 mb-2">📌 建議加強：</p>
          <ul className="space-y-1">
            {Object.entries(byCategory)
              .filter(([,d]) => d.correct / d.total < 0.6)
              .map(([cat, d]) => (
                <li key={cat} className="text-sm text-amber-800">
                  • {d.name}（{Math.round(d.correct/d.total*100)}%）
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
        >
          再考一次
        </button>
        <button
          onClick={onHome}
          className="flex-1 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
        >
          回首頁
        </button>
      </div>
    </div>
  )
}
