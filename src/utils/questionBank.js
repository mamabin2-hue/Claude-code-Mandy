export function filterQuestions(questions, { category, year, source, limit }) {
  let filtered = [...questions]
  if (category && category !== 'ALL') filtered = filtered.filter(q => q.category === category)
  if (year && year !== 'ALL') filtered = filtered.filter(q => q.year === Number(year))
  if (source === 'official') filtered = filtered.filter(q => q.source === 'official')
  if (source === 'ai') filtered = filtered.filter(q => q.source === 'ai_prediction')
  if (limit) filtered = shuffle(filtered).slice(0, limit)
  return filtered
}

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function getCategories(questions) {
  const cats = {}
  questions.forEach(q => { cats[q.category] = q.categoryName })
  return Object.entries(cats).map(([id, name]) => ({ id, name }))
}

export function getYears(questions) {
  return [...new Set(questions.map(q => q.year))].sort((a, b) => b - a)
}
