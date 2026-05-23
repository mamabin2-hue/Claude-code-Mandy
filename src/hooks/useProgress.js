import { useState, useCallback } from 'react'

const KEY_WRONG = 'oeh_wrong_questions'
const KEY_MASTERED = 'oeh_mastered'
const KEY_SCORES = 'oeh_exam_scores'
const KEY_STATS = 'oeh_practice_stats'

function getLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback }
}
function setLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

export function useProgress() {
  const [wrongIds, setWrongIds] = useState(() => getLS(KEY_WRONG, []))
  const [masteredIds, setMasteredIds] = useState(() => getLS(KEY_MASTERED, []))
  const [scores, setScores] = useState(() => getLS(KEY_SCORES, []))

  const markWrong = useCallback((id) => {
    setWrongIds(prev => {
      const next = prev.includes(id) ? prev : [...prev, id]
      setLS(KEY_WRONG, next)
      return next
    })
  }, [])

  const markCorrect = useCallback((id) => {
    setWrongIds(prev => {
      const next = prev.filter(x => x !== id)
      setLS(KEY_WRONG, next)
      return next
    })
  }, [])

  const markMastered = useCallback((id) => {
    setMasteredIds(prev => {
      const next = prev.includes(id) ? prev : [...prev, id]
      setLS(KEY_MASTERED, next)
      return next
    })
    setWrongIds(prev => {
      const next = prev.filter(x => x !== id)
      setLS(KEY_WRONG, next)
      return next
    })
  }, [])

  const unmarkMastered = useCallback((id) => {
    setMasteredIds(prev => {
      const next = prev.filter(x => x !== id)
      setLS(KEY_MASTERED, next)
      return next
    })
  }, [])

  const saveScore = useCallback((score) => {
    setScores(prev => {
      const next = [{ ...score, date: new Date().toISOString() }, ...prev].slice(0, 20)
      setLS(KEY_SCORES, next)
      return next
    })
  }, [])

  const recordAnswer = useCallback((id, correct) => {
    const stats = getLS(KEY_STATS, {})
    const s = stats[id] || { correct: 0, wrong: 0 }
    stats[id] = correct ? { ...s, correct: s.correct + 1 } : { ...s, wrong: s.wrong + 1 }
    setLS(KEY_STATS, stats)
    if (correct) markCorrect(id)
    else markWrong(id)
  }, [markCorrect, markWrong])

  const getStats = useCallback(() => getLS(KEY_STATS, {}), [])

  return {
    wrongIds,
    masteredIds,
    scores,
    markWrong,
    markCorrect,
    markMastered,
    unmarkMastered,
    saveScore,
    recordAnswer,
    getStats,
  }
}
