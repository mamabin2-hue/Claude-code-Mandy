import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import { useProgress } from '../hooks/useProgress'
import { shuffle, shuffleOptions } from '../utils/questionBank'

export default function WrongQuestions() {
  const [allQ, setAllQ] = useState([])
  const [session, setSession] = useState(null)
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState([])
  const { wrongIds, masteredIds, markMastered, recordAnswer } = useProgress()

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/questions.json').then(r => r.json()).then(setAllQ)
  }, [])

  const wrongQ = allQ.filter(q => wrongIds.includes(q.id))

  function buildSession(baseQ) {
    return shuffle(baseQ).map(shuffleOptions)
  }

  useEffect(() => {
    if (wrongQ.length > 0 && !session) setSession(buildSession(wrongQ))
  }, [wrongQ.length])

  function handleAnswer(correct, letter) {
    const q = session[idx]
    recordAnswer(q.id, correct)
    setResults(prev => [...prev, { question: q, correct, selected: letter }])
  }

  function retry() {
    setSession(buildSession(wrongQ))
    setIdx(0)
    setResults([])
  }

  if (wrongQ.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="text-slate-400 hover:text-slate-600">←</Link>
            <h2 className="text-xl font-bold">錯題本</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-lg font-bold text-green-700 mb-2">目前沒有錯題！</p>
            <p className="text-slate-500 text-sm mb-6">先去練習或模擬考，答錯的題目會出現在這裡</p>
            <Link to="/practice" className="inline-block px-6 py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors">
              去練習
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!session) return null

  if (idx >= session.length) {
    const correct = results.filter(r => r.correct).length
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-2xl font-bold text-slate-800 mb-1">{correct}/{results.length} 答對</p>
            <p className="text-slate-500 text-sm mb-6">
              {correct === results.length ? '全部答對！考慮標記為已掌握' : `還有 ${results.length - correct} 題需要繼續練習`}
            </p>
            <div className="flex gap-3">
              <button onClick={retry} className="flex-1 py-3 border-2 border-slate-200 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer">
                重練一次
              </button>
              <Link to="/" className="flex-1 py-3 bg-blue-700 text-white rounded-xl font-bold text-center hover:bg-blue-800">
                回首頁
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const q = session[idx]
  const answered = results.length > idx
  const isMastered = masteredIds.includes(q.id)

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-slate-400 hover:text-slate-600">←</Link>
            <h2 className="text-xl font-bold">錯題本</h2>
          </div>
          <span className="text-sm text-slate-500">{idx + 1}/{session.length}</span>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(idx / session.length) * 100}%` }} />
          </div>
        </div>

        <QuestionCard question={q} onAnswer={handleAnswer} />

        {answered && (
          <div className="mt-4 space-y-3">
            <button
              onClick={() => markMastered(q.id)}
              disabled={isMastered}
              className={`w-full py-3 rounded-xl font-semibold transition-colors cursor-pointer ${
                isMastered
                  ? 'bg-green-100 text-green-700 border-2 border-green-300'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isMastered ? '✓ 已標記為掌握，將從錯題本移除' : '✅ 標記為已掌握（從錯題本移除）'}
            </button>
            <button
              onClick={() => setIdx(i => i + 1)}
              className="w-full py-3 bg-blue-700 text-white rounded-xl font-bold hover:bg-blue-800 transition-colors cursor-pointer"
            >
              {idx + 1 < session.length ? '下一題 →' : '查看結果'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
