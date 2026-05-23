import { useState, useEffect, useRef } from 'react'

const OPTION_COLORS = {
  correct: 'bg-green-50 border-green-500 text-green-800',
  wrong: 'bg-red-50 border-red-500 text-red-800',
  default: 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50',
  disabled: 'bg-slate-50 border-slate-200 text-slate-400',
}

export default function QuestionCard({ question, onAnswer, showResult = false, reviewMode = false }) {
  const [selected, setSelected] = useState(null)
  const [anim, setAnim] = useState('')
  const cardRef = useRef()

  useEffect(() => { setSelected(null); setAnim('') }, [question?.id])

  if (!question) return null

  const answered = selected !== null || reviewMode

  function handleSelect(opt) {
    if (answered) return
    const letter = opt.charAt(0)
    setSelected(letter)
    const correct = letter === question.answer
    if (correct) {
      setAnim('animate-glow-green')
      setTimeout(() => setAnim(''), 700)
    } else {
      setAnim('animate-shake')
      setTimeout(() => setAnim(''), 450)
    }
    onAnswer?.(correct, letter)
  }

  function getOptionStyle(opt) {
    const letter = opt.charAt(0)
    if (!answered) return OPTION_COLORS.default
    if (letter === question.answer) return OPTION_COLORS.correct
    if (letter === selected && selected !== question.answer) return OPTION_COLORS.wrong
    return OPTION_COLORS.disabled
  }

  const isAIPrediction = question.source === 'ai_prediction'

  return (
    <div ref={cardRef} className={`bg-white rounded-2xl shadow-md p-6 ${anim}`}>
      {/* Header badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
          {question.categoryName}
        </span>
        {question.year > 0 && (
          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
            {question.year}年 第{question.session}次
          </span>
        )}
        {isAIPrediction && (
          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700 font-semibold">
            ⚠️ AI預測題
          </span>
        )}
        {question.lawRef && (
          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
            📋 {question.lawRef}
          </span>
        )}
      </div>

      {/* Question */}
      <p className="text-base font-semibold text-slate-800 mb-5 leading-relaxed">
        {question.question}
      </p>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {question.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            disabled={answered}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium cursor-pointer disabled:cursor-default ${getOptionStyle(opt)}`}
          >
            {opt}
            {answered && opt.charAt(0) === question.answer && (
              <span className="ml-2 text-green-600">✓</span>
            )}
            {answered && opt.charAt(0) === selected && selected !== question.answer && (
              <span className="ml-2 text-red-600">✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {(answered || showResult) && question.explanation && (
        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
          <p className="text-xs font-bold text-amber-700 mb-1">📖 解析</p>
          <p className="text-sm text-amber-900 leading-relaxed">{question.explanation}</p>
          {isAIPrediction && question.lawQuote && (
            <div className="mt-2 pt-2 border-t border-amber-300">
              <p className="text-xs text-amber-600 italic">
                法條依據：「{question.lawQuote}」
              </p>
              <p className="text-xs text-orange-600 font-medium mt-1">
                ⚠️ 本題為AI依據法條生成，請自行核對：{question.lawSource}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
