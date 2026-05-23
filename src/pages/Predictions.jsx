import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import QuestionCard from '../components/QuestionCard'
import { useProgress } from '../hooks/useProgress'

export default function Predictions() {
  const [questions, setQuestions] = useState([])
  const [idx, setIdx] = useState(0)
  const [results, setResults] = useState([])
  const { recordAnswer } = useProgress()

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/ai_predictions.json').then(r => r.json()).then(setQuestions)
  }, [])

  function handleAnswer(correct) {
    recordAnswer(questions[idx].id, correct)
    setResults(prev => [...prev, { question: questions[idx], correct }])
  }

  const answered = results.length > idx

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600">←</Link>
          <div>
            <h2 className="text-xl font-bold">AI預測考題</h2>
            <p className="text-xs text-slate-500">基於最新修法原文生成，含法條出處</p>
          </div>
        </div>

        <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-3 mb-4">
          <p className="text-orange-700 text-sm font-bold">⚠️ 重要提醒</p>
          <p className="text-orange-600 text-xs mt-1">
            以下題目由 AI 根據官方法條原文生成，每題均標注法條來源。
            <strong>請以官方公告為最終依據</strong>，本系統不對考題準確性負責。
          </p>
          <Link to="/laws" className="text-xs text-orange-500 underline mt-1 inline-block">→ 查看官方法條原文</Link>
        </div>

        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <p className="text-slate-400">載入中…</p>
          </div>
        ) : idx >= questions.length ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <p className="text-4xl font-bold text-orange-600 mb-2">{results.filter(r=>r.correct).length}/{questions.length}</p>
            <p className="text-slate-600 mb-6">預測題練習完成</p>
            <button onClick={() => { setIdx(0); setResults([]) }} className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold cursor-pointer hover:bg-orange-600">
              重新練習
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-500">{idx + 1} / {questions.length}</span>
              <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-semibold">🎯 預測考題</span>
            </div>
            <QuestionCard
              question={questions[idx]}
              onAnswer={handleAnswer}
            />
            {answered && (
              <button
                onClick={() => setIdx(i => i + 1)}
                className="w-full mt-4 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors cursor-pointer"
              >
                {idx + 1 < questions.length ? '下一題 →' : '查看結果'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
