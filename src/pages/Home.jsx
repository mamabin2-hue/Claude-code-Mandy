import { Link } from 'react-router-dom'
import { useProgress } from '../hooks/useProgress'

const FEATURES = [
  { to: '/practice', icon: '📝', label: '練習模式', desc: '依年份或類別選題練習', color: 'bg-blue-600 hover:bg-blue-700' },
  { to: '/mock', icon: '⏱️', label: '模擬考試', desc: '計時作答，模擬正式考試', color: 'bg-purple-600 hover:bg-purple-700' },
  { to: '/wrong', icon: '🔁', label: '錯題本', desc: '複習答錯的題目', color: 'bg-red-500 hover:bg-red-600' },
  { to: '/flashcard', icon: '🃏', label: '翻牌練習', desc: '快速翻牌複習，適合通勤', color: 'bg-teal-600 hover:bg-teal-700' },
  { to: '/knowledge', icon: '📚', label: '知識卡片', desc: '核心概念摘要與法規整理', color: 'bg-amber-500 hover:bg-amber-600' },
  { to: '/laws', icon: '⚖️', label: '修法速覽', desc: '新舊法對照，白話易懂', color: 'bg-indigo-600 hover:bg-indigo-700' },
  { to: '/predictions', icon: '🎯', label: 'AI預測考題', desc: '基於最新修法的預測題', color: 'bg-orange-500 hover:bg-orange-600' },
]

export default function Home() {
  const { scores, wrongIds } = useProgress()
  const lastScore = scores[0]
  const avgScore = scores.length
    ? Math.round(scores.slice(0, 5).reduce((s, r) => s + (r.score || 0), 0) / Math.min(scores.length, 5))
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">職業衛生管理甲級</h1>
          <p className="text-blue-200">技術士技能檢定考試輔助系統</p>
          <div className="mt-3 flex justify-center gap-2">
            <span className="text-xs px-3 py-1 bg-blue-600/50 text-blue-200 rounded-full">近10年題庫</span>
            <span className="text-xs px-3 py-1 bg-orange-500/70 text-white rounded-full">⚖️ 含2024-2026新法</span>
          </div>
        </div>

        {/* Stats bar */}
        {(lastScore || wrongIds.length > 0) && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-6 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{lastScore ? `${lastScore.score}分` : '--'}</p>
              <p className="text-blue-200 text-xs">最近一次成績</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{avgScore !== null ? `${avgScore}分` : '--'}</p>
              <p className="text-blue-200 text-xs">近5次平均</p>
            </div>
            <div>
              <p className={`text-2xl font-bold ${wrongIds.length > 0 ? 'text-red-300' : 'text-green-300'}`}>
                {wrongIds.length}
              </p>
              <p className="text-blue-200 text-xs">待複習錯題</p>
            </div>
          </div>
        )}

        {/* New law alert */}
        <div className="bg-orange-500/20 border border-orange-400/50 rounded-2xl p-4 mb-6">
          <p className="text-orange-200 font-semibold text-sm mb-1">🔥 近期修法重點（高機率考點）</p>
          <ul className="text-orange-100 text-xs space-y-1">
            <li>• 職安法§22-1 職場霸凌防治專章（2026年新法）</li>
            <li>• 性別平等工作法修正：性騷擾防治（2024/03/08）</li>
            <li>• 不法侵害預防指引第四版（2025/02）</li>
          </ul>
          <Link to="/laws" className="inline-block mt-2 text-xs text-orange-300 underline hover:text-orange-200">
            → 查看修法速覽
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map(f => (
            <Link
              key={f.to}
              to={f.to}
              className={`${f.color} rounded-2xl p-5 text-white transition-all hover:scale-[1.02] shadow-md`}
            >
              <div className="text-3xl mb-2">{f.icon}</div>
              <p className="font-bold text-base">{f.label}</p>
              <p className="text-white/80 text-xs mt-1">{f.desc}</p>
            </Link>
          ))}
        </div>

        <p className="text-center text-blue-300 text-xs mt-8">
          資料來源：考選部歷年試題 | AI預測題均附原文法條來源
        </p>
      </div>
    </div>
  )
}
