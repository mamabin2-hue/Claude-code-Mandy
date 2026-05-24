import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCategoryInfo } from '../utils/categories'

const TOPIC_ORDER = ['HEALTH','PHYS','MONITOR','CONTROL','CHEM','PSY','ASSESS','CONFINED','ERGO','MATERNAL','LAW','FIRSTAID','PPE','SYSTEM']

const TOPIC_STUDY_TIPS = {
  HEALTH:   '每次必考！重點：健康分級管理（4級）、職業病診斷5大原則、異常工作負荷促發疾病預防指引。',
  PHYS:     '噪音計算幾乎每次都有。必會：劑量公式D=Σ(Ti/Ti_allow)、WBGT計算、點音源距離衰減6dB/倍距。',
  MONITOR:  '常考採樣方法選擇、監測數據計算（ppm換算mg/m³）。混合有機溶劑加成計算必備。',
  CONTROL:  '通風換氣計算（換氣量、捕捉速度）。近年考外裝式氣罩設計計算。',
  CHEM:     '重點：GHS混合物分類原則、CCB工具4步驟、SDS 16項欄位。',
  PSY:      '近3年考3次！職安衛設施規則§324-3的8大預防措施要背熟。2026年職場霸凌新法。',
  ASSESS:   '風險評估4步驟（辨識→劑量效應→暴露→風險描述），CCB分級管理。',
  CONFINED: '3認定條件、危害防止計畫9大項，進入許可程序，O₂/H₂S濃度標準。',
  ERGO:     '人因危害評估工具（RULA/REBA）、肌肉骨骼危險因子、預防計畫內容。',
  MATERNAL: '3個保護期間、雇主義務、危害評估內容（化學/物理/人因/輪班）。',
  LAW:      '配合當年修法出題。2024性騷擾修法、2026職場霸凌、承攬管理義務必讀。',
  FIRSTAID: '燒燙傷5步驟（沖脫泡蓋送）、CPR 5步驟，常考10分+10分格式。',
  PPE:      '呼吸防護具選用：O₂<18%需供氣式、IDLH環境需SCBA。',
  SYSTEM:   'CNS 45001 PDCA架構、緊急準備與應變要素。近年開始考，預計頻率上升。',
}

const PREDICT_HOT = ['PSY', 'HEALTH', 'MONITOR', 'PHYS', 'CONFINED', 'SYSTEM']

function FullQuestionModal({ question, onClose }) {
  if (!question) return null
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-0" onClick={onClose}>
      <div
        className="bg-white w-full max-w-xl rounded-t-3xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">{question.exam} 術科 第{question.q}題</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{question.topic}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer">×</button>
        </div>
        <div className="px-5 py-4">
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{question.fullText}</p>
          </div>
          {question.keyLaws && question.keyLaws.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-500 mb-2">📋 相關法規</p>
              <div className="flex flex-wrap gap-2">
                {question.keyLaws.map((law, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">{law}</span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
            <p className="text-xs text-amber-800">💡 術科答題提醒：每題20分，請按(一)(二)(三)分點作答，引用法規要寫條次</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function PredictionModal({ pred, onClose }) {
  if (!pred) return null
  const info = getCategoryInfo(pred.code)
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center p-0" onClick={onClose}>
      <div
        className="bg-white w-full max-w-xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white px-5 pt-5 pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${info.color}`}>{info.icon} {info.name.split('（')[0].trim()}</span>
              <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold">🎯 {pred.year_pred}猜題</span>
              {pred.calcRequired && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">🔢 含計算</span>}
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl leading-none cursor-pointer">×</button>
          </div>
          <p className="font-bold text-slate-800 text-sm mt-2">{pred.topic}</p>
          <p className="text-xs text-slate-400 mt-0.5">{pred.basis}</p>
        </div>
        <div className="px-5 py-4 space-y-4">
          {/* Question */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">📝 預測題目</p>
            <div className="bg-slate-50 rounded-2xl p-4">
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{pred.question}</p>
            </div>
          </div>
          {/* Plain text summary */}
          {pred.plainText && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-green-700 mb-1">💬 白話重點</p>
              <p className="text-sm text-green-800 leading-relaxed">{pred.plainText}</p>
            </div>
          )}
          {/* Answer framework */}
          <div>
            <p className="text-xs font-bold text-slate-500 mb-2">✅ 參考答案架構</p>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{pred.answer_framework}</p>
            </div>
          </div>
          {/* Laws */}
          {pred.keyLaws && pred.keyLaws.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 mb-2">📋 相關法規</p>
              <div className="flex flex-wrap gap-2">
                {pred.keyLaws.map((law, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full">{law}</span>
                ))}
              </div>
            </div>
          )}
          <div className="p-3 bg-orange-50 rounded-xl border border-orange-200">
            <p className="text-xs text-orange-700 font-semibold">⚠️ 預測題目提醒</p>
            <p className="text-xs text-orange-600 mt-0.5">本題為AI根據歷年出題趨勢及最新修法預測，答案架構供參考，請以官方法規原文為準。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShukeyiGuide() {
  const [data, setData] = useState(null)
  const [fullQuestions, setFullQuestions] = useState([])
  const [predictions, setPredictions] = useState([])
  const [selected, setSelected] = useState(null)
  const [modalQ, setModalQ] = useState(null)
  const [modalPred, setModalPred] = useState(null)
  const [tab, setTab] = useState('history') // 'history' | 'predict'

  useEffect(() => {
    Promise.all([
      fetch(import.meta.env.BASE_URL + 'data/shukeyi_analysis.json').then(r => r.json()),
      fetch(import.meta.env.BASE_URL + 'data/shukeyi_questions.json').then(r => r.json()),
      fetch(import.meta.env.BASE_URL + 'data/shukeyi_predictions.json').then(r => r.json()),
    ]).then(([analysis, qs, preds]) => {
      setData(analysis)
      setFullQuestions(qs)
      setPredictions(preds)
    })
  }, [])

  if (!data) return null

  const topicMap = {}
  data.analysis.forEach(t => { topicMap[t.code] = t })

  function getFullQuestion(exam, q) {
    const [year, session] = exam.split('-').map(Number)
    return fullQuestions.find(x => x.year === year && x.session === session && x.questionNum === q) || null
  }

  const selectedTopics = data.allTopics.filter(t => t.code === selected)

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6">
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link to="/" className="text-slate-400 hover:text-slate-600">←</Link>
          <h2 className="text-xl font-bold">術科輔導</h2>
          <span className="ml-auto text-xs text-slate-500">106~115年 共{data.allTopics.length}題分析</span>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-5 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100">
          <button
            onClick={() => setTab('history')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === 'history' ? 'bg-slate-800 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            📊 歷年題型分析
          </button>
          <button
            onClick={() => setTab('predict')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${tab === 'predict' ? 'bg-orange-500 text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
          >
            🎯 AI術科猜題 ({predictions.length})
          </button>
        </div>

        {/* ===== PREDICTION TAB ===== */}
        {tab === 'predict' && (
          <div className="space-y-3">
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
              <p className="text-xs font-bold text-orange-700 mb-1">🎯 術科猜題說明</p>
              <p className="text-xs text-orange-600">
                依歷年出題頻率及最新修法（2024-2026年），預測高機率術科考題。
                每題含完整題目、答題架構及法條依據。
                <strong>計算題請自行練習運算過程。</strong>
              </p>
            </div>
            {predictions.map(pred => {
              const info = getCategoryInfo(pred.code)
              return (
                <button
                  key={pred.id}
                  onClick={() => setModalPred(pred)}
                  className="w-full text-left bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${info.color}`}>
                          {info.icon} {info.name.split('（')[0].trim()}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold">🎯 {pred.year_pred}</span>
                        {pred.hot && <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full font-bold">🔥熱門</span>}
                        {pred.calcRequired && <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded-full">🔢計算</span>}
                      </div>
                      <p className="font-bold text-slate-800 text-sm">{pred.topic}</p>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{pred.basis}</p>
                    </div>
                    <span className="text-orange-400 text-sm flex-shrink-0 mt-1">查看 →</span>
                  </div>
                </button>
              )
            })}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-4">
              <p className="text-xs font-bold text-blue-700 mb-2">💡 術科答題策略</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 甲級術科共5題×20分=100分，答對3題（60分）即及格</li>
                <li>• 優先選擇：你最熟悉的2-3題先作答，難題留到最後</li>
                <li>• 計算題：寫清楚公式→代入數值→計算過程→結論，過程分有分</li>
                <li>• 法規題：要寫「法規名稱＋條次」，例如「職安衛設施規則§29-1」</li>
                <li>• 列舉題：按(一)(二)(三)順序，每項簡潔一行，數量要符合題目要求</li>
              </ul>
            </div>
          </div>
        )}

        {/* ===== HISTORY TAB ===== */}
        {tab === 'history' && (
          <>
            {/* Hot topics banner */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-5">
              <p className="text-xs font-bold text-orange-700 mb-2">🔥 近3年高頻考點（優先複習）</p>
              <div className="flex flex-wrap gap-2">
                {PREDICT_HOT.map(code => {
                  const info = getCategoryInfo(code)
                  return (
                    <button
                      key={code}
                      onClick={() => setSelected(selected === code ? null : code)}
                      className={`text-xs px-2.5 py-1.5 rounded-xl border font-semibold cursor-pointer transition-colors ${
                        selected === code ? info.color + ' ring-2 ring-offset-1 ring-orange-400' : info.color
                      }`}
                    >
                      {info.icon} {info.name.split('（')[0].trim()}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Topic grid */}
            <div className="space-y-2 mb-5">
              {TOPIC_ORDER.map(code => {
                const topic = topicMap[code]
                if (!topic) return null
                const info = getCategoryInfo(code)
                const isHot = PREDICT_HOT.includes(code)
                const isSelected = selected === code
                const relatedPred = predictions.find(p => p.code === code)
                return (
                  <button
                    key={code}
                    onClick={() => setSelected(isSelected ? null : code)}
                    className={`w-full text-left p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? `${info.color} border-current shadow-md`
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${info.color}`}>
                            {info.icon} {info.name.split('（')[0].trim()}
                          </span>
                          {isHot && <span className="text-xs px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full font-bold">熱門</span>}
                          {relatedPred && <span className="text-xs px-1.5 py-0.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full">🎯有猜題</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-2xl font-bold text-slate-700">{topic.totalCount}</span>
                          <span className="text-xs text-slate-500">次（出現年份：{topic.exams.map(e=>e.split('-')[0]).filter((v,i,a)=>a.indexOf(v)===i).sort().join('、')}年）</span>
                        </div>
                        {!isSelected && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{TOPIC_STUDY_TIPS[code]}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`text-xs font-bold ${topic.recentCount >= 2 ? 'text-red-600' : topic.recentCount === 1 ? 'text-orange-600' : 'text-slate-400'}`}>
                          近3年 {topic.recentCount}次
                        </span>
                        <span className="text-slate-400 text-sm">{isSelected ? '▲' : '▼'}</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-current/20">
                        <p className="text-sm font-semibold text-slate-700 mb-3">{TOPIC_STUDY_TIPS[code]}</p>

                        {/* Related prediction */}
                        {relatedPred && (
                          <button
                            onClick={e => { e.stopPropagation(); setModalPred(relatedPred) }}
                            className="w-full mb-3 p-3 bg-orange-50 border border-orange-300 rounded-xl text-left hover:bg-orange-100 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs font-bold text-orange-700">🎯 AI猜題 — {relatedPred.year_pred}高機率考題</p>
                                <p className="text-xs text-orange-600 mt-0.5 line-clamp-1">{relatedPred.topic}</p>
                              </div>
                              <span className="text-orange-400 text-sm flex-shrink-0">查看 →</span>
                            </div>
                          </button>
                        )}

                        <p className="text-xs font-bold text-slate-500 mb-2">歷年術科考題（點擊查看題目內容）：</p>
                        <div className="space-y-1.5">
                          {selectedTopics.map((t, i) => {
                            const fullQ = getFullQuestion(t.exam, t.q)
                            return (
                              <button
                                key={i}
                                onClick={e => {
                                  e.stopPropagation()
                                  if (fullQ) setModalQ({ ...t, fullText: fullQ.fullText, keyLaws: fullQ.keyLaws, topic: fullQ.topic || t.topic })
                                }}
                                className={`w-full text-left bg-white/60 rounded-xl px-3 py-2.5 border border-white transition-all ${
                                  fullQ ? 'hover:bg-white hover:shadow-sm hover:border-slate-200 cursor-pointer' : 'opacity-60 cursor-default'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-xs font-bold text-slate-600 flex-shrink-0">{t.exam} 第{t.q}題</span>
                                    <span className="text-xs text-slate-600 truncate">{t.brief}</span>
                                  </div>
                                  {fullQ && <span className="text-xs text-blue-500 flex-shrink-0">查看 →</span>}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                        <Link
                          to="/knowledge"
                          state={{ category: code }}
                          className="block mt-3 text-center text-xs py-2 bg-white/80 rounded-xl border border-current/30 font-semibold hover:bg-white transition-colors"
                          onClick={e => e.stopPropagation()}
                        >
                          查看「{info.name.split('（')[0].trim()}」知識卡片 →
                        </Link>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Exam tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-blue-700 mb-2">💡 術科答題技巧</p>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• 每題20分，通常分3~5小題，按(一)(二)(三)順序答</li>
                <li>• 引用法規時要寫出「法規名稱＋條次」（如：職安法§22-1）</li>
                <li>• 數字計算題要寫清楚公式和代入過程，算對才給滿分</li>
                <li>• 列舉式問題要按要求列舉數量（「請列3項」只需3項）</li>
                <li>• 時間分配：每題約25分鐘，先答有把握的題目</li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <FullQuestionModal question={modalQ} onClose={() => setModalQ(null)} />
      <PredictionModal pred={modalPred} onClose={() => setModalPred(null)} />
    </div>
  )
}
