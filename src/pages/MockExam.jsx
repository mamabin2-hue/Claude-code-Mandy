import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Timer from '../components/Timer'
import ScoreReport from '../components/ScoreReport'
import { useProgress } from '../hooks/useProgress'
import { shuffle } from '../utils/questionBank'

const EXAM_SECONDS = 150 * 60
const EXAM_COUNT = 80

export default function MockExam() {
  const [allQ, setAllQ] = useState([])
  const [phase, setPhase] = useState('intro')
  const [session, setSession] = useState([])
  const [idx, setIdx] = useState(0)
  const [answers, setAnswers] = useState({})
  const [startTime, setStartTime] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [timeUp, setTimeUp] = useState(false)
  const { recordAnswer, saveScore } = useProgress()
  const navigate = useNavigate()

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/questions.json').then(r => r.json()).then(setAllQ)
  }, [])

  function startExam() {
    const picked = shuffle(allQ).slice(0, Math.min(EXAM_COUNT, allQ.length))
    setSession(picked)
    setIdx(0)
    setAnswers({})
    setStartTime(Date.now())
    setElapsed(0)
    setTimeUp(false)
    setPhase('exam')
  }

  const handleTimeUp = useCallback(() => {
    setTimeUp(true)
    finishExam()
  }, [])

  function selectAnswer(letter) {
    if (answers[session[idx]?.id]) return
    setAnswers(prev => ({ ...prev, [session[idx].id]: letter }))
  }

  function nextQ() {
    if (idx + 1 < session.length) setIdx(i => i + 1)
    else finishExam()
  }

  function prevQ() { if (idx > 0) setIdx(i => i - 1) }

  function finishExam() {
    const used = Math.round((Date.now() - startTime) / 1000)
    setElapsed(used)
    const results = session.map(q => {
      const selected = answers[q.id]
      const correct = selected === q.answer
      recordAnswer(q.id, correct)
      return { question: q, correct, selected }
    })
    const score = Math.round(results.filter(r => r.correct).length / session.length * 100)
    saveScore({ score, total: session.length, correct: results.filter(r=>r.correct).length, time: used })
    setPhase('result')
    setSession(results)
  }

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="text-slate-400 hover:text-slate-600">←</Link>
            <h2 className="text-xl font-bold">模擬考試</h2>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="text-center py-4">
              <div className="text-5xl mb-4">⏱️</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">正式模擬考試</h3>
              <div className="space-y-2 text-sm text-slate-600 text-left bg-slate-50 rounded-xl p-4 mt-4">
                <p>📋 題數：{Math.min(EXAM_COUNT, allQ.length)} 題（隨機）</p>
                <p>⏰ 時間：150 分鐘</p>
                <p>✅ 合格標準：60 分（答對 60%）</p>
                <p>📌 答完後才顯示解析與成績</p>
              </div>
            </div>
            <button
              onClick={startExam}
              disabled={allQ.length === 0}
              className="w-full mt-4 py-3 bg-purple-700 text-white rounded-xl font-bold text-base hover:bg-purple-800 transition-colors disabled:opacity-40 cursor-pointer"
            >
              開始模擬考
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'result') {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-6">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold mb-4">考試結果</h2>
          <ScoreReport
            results={session}
            totalTime={elapsed}
            onRetry={startExam}
            onHome={() => navigate('/')}
          />
        </div>
      </div>
    )
  }

  const q = session[idx]
  const answered = !!answers[q?.id]

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4">
      <div className="max-w-xl mx-auto">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-700">{idx + 1}/{session.length}</span>
          <Timer totalSeconds={EXAM_SECONDS} onTimeUp={handleTimeUp} />
        </div>

        {/* Progress dots (compact) */}
        <div className="flex flex-wrap gap-1 mb-4">
          {session.map((sq, i) => (
            <button
              key={sq.id}
              onClick={() => setIdx(i)}
              className={`w-6 h-6 rounded text-xs font-bold cursor-pointer transition-colors ${
                i === idx ? 'bg-blue-700 text-white'
                : answers[sq.id]
                  ? answers[sq.id] === sq.answer ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <div className="flex gap-2 mb-3">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{q.categoryName}</span>
          </div>
          <p className="font-semibold text-slate-800 mb-4 leading-relaxed">{q.question}</p>
          <div className="space-y-2">
            {q.options.map(opt => {
              const letter = opt.charAt(0)
              const sel = answers[q.id]
              let style = 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50'
              if (sel === letter) style = 'bg-blue-700 border-blue-700 text-white'
              return (
                <button
                  key={opt}
                  onClick={() => selectAnswer(letter)}
                  disabled={!!sel}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium cursor-pointer disabled:cursor-default ${style}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        </div>

        {/* Nav */}
        <div className="flex gap-3">
          <button onClick={prevQ} disabled={idx === 0} className="px-4 py-3 border-2 border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer">
            ← 上一題
          </button>
          <button onClick={nextQ} className="flex-1 py-3 bg-purple-700 text-white rounded-xl font-bold hover:bg-purple-800 cursor-pointer">
            {idx + 1 < session.length ? '下一題 →' : '📊 交卷'}
          </button>
          {idx + 1 < session.length && (
            <button onClick={finishExam} className="px-4 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 cursor-pointer text-sm">
              交卷
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
