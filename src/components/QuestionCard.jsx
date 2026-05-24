import { useState, useEffect, useRef } from 'react'

const OPTION_COLORS = {
  correct: 'bg-green-50 border-green-500 text-green-800',
  wrong: 'bg-red-50 border-red-500 text-red-800',
  default: 'bg-white border-slate-200 hover:border-blue-400 hover:bg-blue-50',
  selected: 'bg-blue-50 border-blue-500 text-blue-800',
  disabled: 'bg-slate-50 border-slate-200 text-slate-400',
}

export default function QuestionCard({ question, onAnswer, showResult = false, reviewMode = false }) {
  const [selected, setSelected] = useState(null)       // single: letter string
  const [multiSel, setMultiSel] = useState([])          // multiple: array of letters
  const [submitted, setSubmitted] = useState(false)
  const [anim, setAnim] = useState('')
  const cardRef = useRef()

  const isMultiple = question?.type === 'multiple'
  const correctLetters = isMultiple ? (question?.answer || '').split('') : null

  useEffect(() => {
    setSelected(null)
    setMultiSel([])
    setSubmitted(false)
    setAnim('')
  }, [question?.id])

  if (!question) return null

  const answered = isMultiple ? submitted : (selected !== null || reviewMode)

  function handleSingleSelect(opt) {
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

  function handleMultiToggle(opt) {
    if (submitted) return
    const letter = opt.charAt(0)
    setMultiSel(prev =>
      prev.includes(letter) ? prev.filter(l => l !== letter) : [...prev, letter]
    )
  }

  function handleMultiSubmit() {
    if (submitted || multiSel.length === 0) return
    const sortedSel = [...multiSel].sort().join('')
    const sortedCorrect = [...correctLetters].sort().join('')
    const correct = sortedSel === sortedCorrect
    setSubmitted(true)
    if (correct) {
      setAnim('animate-glow-green')
      setTimeout(() => setAnim(''), 700)
    } else {
      setAnim('animate-shake')
      setTimeout(() => setAnim(''), 450)
    }
    onAnswer?.(correct, sortedSel)
  }

  function getOptionStyle(opt) {
    const letter = opt.charAt(0)
    if (isMultiple) {
      if (!submitted && !reviewMode) {
        return multiSel.includes(letter) ? OPTION_COLORS.selected : OPTION_COLORS.default
      }
      if (correctLetters.includes(letter)) return OPTION_COLORS.correct
      if (multiSel.includes(letter) && !correctLetters.includes(letter)) return OPTION_COLORS.wrong
      return OPTION_COLORS.disabled
    }
    // single
    if (!answered) return OPTION_COLORS.default
    if (letter === question.answer) return OPTION_COLORS.correct
    if (letter === selected && selected !== question.answer) return OPTION_COLORS.wrong
    return OPTION_COLORS.disabled
  }

  function isCorrectMark(opt) {
    const letter = opt.charAt(0)
    if (isMultiple) return (submitted || reviewMode) && correctLetters.includes(letter)
    return answered && letter === question.answer
  }

  function isWrongMark(opt) {
    const letter = opt.charAt(0)
    if (isMultiple) return submitted && multiSel.includes(letter) && !correctLetters.includes(letter)
    return answered && letter === selected && selected !== question.answer
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
        {isMultiple && (
          <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
            複選題（可多選）
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
            onClick={() => isMultiple ? handleMultiToggle(opt) : handleSingleSelect(opt)}
            disabled={answered && !isMultiple}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium cursor-pointer disabled:cursor-default ${getOptionStyle(opt)}`}
          >
            {opt}
            {isCorrectMark(opt) && <span className="ml-2 text-green-600">✓</span>}
            {isWrongMark(opt) && <span className="ml-2 text-red-600">✗</span>}
          </button>
        ))}
      </div>

      {/* Multi-choice submit button */}
      {isMultiple && !submitted && !reviewMode && (
        <button
          onClick={handleMultiSubmit}
          disabled={multiSel.length === 0}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          確認答案（已選 {multiSel.length} 項）
        </button>
      )}

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
