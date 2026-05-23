import { useState, useEffect, useRef } from 'react'

export default function Timer({ totalSeconds, onTimeUp, paused = false }) {
  const [remaining, setRemaining] = useState(totalSeconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    setRemaining(totalSeconds)
  }, [totalSeconds])

  useEffect(() => {
    if (paused) { clearInterval(intervalRef.current); return }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) { clearInterval(intervalRef.current); onTimeUp?.(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, onTimeUp])

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  const s = remaining % 60
  const pct = (remaining / totalSeconds) * 100
  const isLow = remaining < 300

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-xl font-mono ${isLow ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-800'}`}>
      <span className="text-lg font-bold">
        {String(h).padStart(2,'0')}:{String(m).padStart(2,'0')}:{String(s).padStart(2,'0')}
      </span>
      <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
