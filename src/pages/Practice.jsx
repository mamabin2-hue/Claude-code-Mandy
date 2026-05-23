import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import { useProgress } from '../hooks/useProgress'
import { filterQuestions, getCategories, getYears, shuffle, shuffleOptions } from '../utils/questionBank'

const LIMITS = [5, 10, 20, 40]

export default function Practice() {
  const [questions, setQuestions] = useState([])
  const [allQ, setAllQ] = useState([])
  const [category, setCategory] = useState('ALL')
  const [year, setYear] = useState('ALL')
  const [limit, setLimit] = useState(10)
  const [session, setSession] = useState(null)
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState([])
  const { recordAnswer } = useProgress()

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/questions.json').then(r => r.json()).then(setAllQ)
  }, [])

  const categories = getCategories(allQ)
  const years = getYears(allQ)
  const filtered = filterQuestions(allQ, { category, year })

  function startSession() {
    const selected = shuffle(filtered).slice(0, limit).map(shuffleOptions)
    setSession(selected)
    setIdx(0)
    setResults([])
  }

  function handleAnswer(correct, letter) {
    const q = session[idx]
    recordAnswer(q.id, correct)
    setResults(prev => [...prev, { question: q, correct, selected: letter }])
  }

  function next() { setIdx(i => i + 1) }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="text-slate-400 hover:text-slate-600">←</Link>
            <h2 className="text-xl font-bold text-slate-800">練習模式</h2>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-5 space-y-4">
            {/* Category */}
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-2">類別</label>
              <div className="flex flex-wrap gap-2">
                {[{ id: 'ALL', name: '全部' }, ...categories].map(c => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      category === c.id ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Year */}
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-2">年份</label>
              <div className="flex flex-wrap gap-2">
                {['ALL', ...years].map(y => (
                  <button
                    key={y}
                    onClick={() => setYear(y === 'ALL' ? 'ALL' : String(y))}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      year === String(y) ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {y === 'ALL' ? '全部' : `${y}年`}
                  </button>
                ))}
              </div>
            </div>

            {/* Limit */}
            <div>
              <label className="text-sm font-semibold text-slate-600 block mb-2">題數</label>
              <div className="flex gap-2">
                {LIMITS.map(n => (
                  <button
                    key={n}
                    onClick={() => setLimit(n)}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                      limit === n ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {n}題
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-slate-500 mb-3">符合條件：共 {filtered.length} 題，將隨機抽取 {Math.min(limit, filtered.length)} 題</p>
              <button
                onClick={startSession}
                disabled={filtered.length === 0}
                className="w-full py-3 bg-blue-700 text-white rounded-xl font-bold text-base hover:bg-blue-800 transition-colors disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                開始練習
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const q = session[idx]
  const answered = results.length > idx

  if (idx >= session.length) {
    const correct = results.filter(r => r.correct).length
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <p className="text-5xl font-bold text-blue-700 mb-2">{correct}/{session.length}</p>
            <p className="text-lg text-slate-600 mb-6">
              {Math.round(correct/session.length*100)}% 正確率
            </p>
            <div className="flex gap-3">
              <button onClick={() => setSession(null)} className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer">
                重新設定
              </button>
              <button onClick={startSession} className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-semibold hover:bg-blue-800 cursor-pointer">
                再練一輪
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setSession(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">← 返回</button>
          <span className="text-sm text-slate-500 font-medium">{idx + 1} / {session.length}</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full mb-5 overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full transition-all" style={{ width: `${((idx) / session.length) * 100}%` }} />
        </div>
        <QuestionCard question={q} onAnswer={handleAnswer} />
        {answered && (
          <button
            onClick={next}
            className="w-full mt-4 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors cursor-pointer"
          >
            {idx + 1 < session.length ? '下一題 →' : '查看結果'}
          </button>
        )}
      </div>
    </div>
  )
}
