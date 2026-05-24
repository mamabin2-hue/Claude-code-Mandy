// Specific knowledge-point based category system
// Replaces generic A/B/C/D/E/F codes

export const CATEGORIES = {
  // 危害辨識系列
  CHEM:     { name: '化學品危害與GHS標示', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚗️' },
  PHYS:     { name: '物理性危害（噪音・輻射・振動・溫熱）', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🔊' },
  BIO:      { name: '生物性危害', color: 'bg-green-100 text-green-800 border-green-200', icon: '🦠' },
  ERGO:     { name: '人因工程與肌肉骨骼疾病', color: 'bg-teal-100 text-teal-800 border-teal-200', icon: '🏋️' },
  PSY:      { name: '不法侵害預防（霸凌・暴力・性騷擾）', color: 'bg-pink-100 text-pink-800 border-pink-200', icon: '🛡️' },

  // 評估與監測系列
  ASSESS:   { name: '暴露評估與風險分析', color: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: '📊' },
  MONITOR:  { name: '作業環境監測技術', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🧪' },

  // 控制措施系列
  CONTROL:  { name: '工程控制與通風換氣', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: '🌬️' },
  PPE:      { name: '個人防護具選用管理', color: 'bg-slate-100 text-slate-800 border-slate-200', icon: '🦺' },
  CONFINED: { name: '局限空間與缺氧危害管理', color: 'bg-red-100 text-red-800 border-red-200', icon: '🚪' },

  // 健康管理系列
  HEALTH:   { name: '勞工健康管理與職業病', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🏥' },
  MATERNAL: { name: '母性健康保護', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: '👶' },
  FIRSTAID: { name: '急救技能', color: 'bg-red-100 text-red-900 border-red-300', icon: '🚑' },

  // 管理系統
  SYSTEM:   { name: '職安衛管理系統（CNS 45001）', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: '⚙️' },

  // 法規與共用
  LAW:      { name: '職安衛法規', color: 'bg-violet-100 text-violet-800 border-violet-200', icon: '⚖️' },
  COMMON:   { name: '共用工作項目（環保・節能・倫理）', color: 'bg-lime-100 text-lime-800 border-lime-200', icon: '♻️' },
}

// Map old category codes to new ones
export const LEGACY_MAP = {
  A: 'SYSTEM',
  B: 'CHEM',
  C: 'ASSESS',
  D: 'MONITOR',
  E: 'CONTROL',
  F: 'ASSESS',
  LAW: 'LAW',
  COMMON: 'COMMON',
}

export function getCategoryInfo(code) {
  return CATEGORIES[code] || CATEGORIES[LEGACY_MAP[code]] || {
    name: code,
    color: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: '📌'
  }
}
