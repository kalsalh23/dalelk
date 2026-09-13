import { supabase } from '@/lib/supabase'
import type { MedicalQuestion, MedicalKeyword } from '@/types'

export async function fetchAllQuestions(activeOnly = true): Promise<MedicalQuestion[]> {
  let q = supabase.from('medical_questions').select('*, medical_keywords(keyword)')
  if (activeOnly) q = q.eq('is_active', true)
  const { data, error } = await q
  if (error) return []
  return (data ?? []).map((d) => ({
    ...d,
    keywords: (d.medical_keywords ?? []).map((k: MedicalKeyword) => k.keyword),
  })) as MedicalQuestion[]
}

export async function searchQuestions(query: string): Promise<Array<MedicalQuestion & { _score: number }>> {
  const all = await fetchAllQuestions()
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  const scored = all.map((q) => {
    const qText = q.question.toLowerCase()
    const kWords = (q.keywords ?? []).map((k) => k.toLowerCase())
    let score = 0
    const matched = [] as string[]
    for (const t of tokens) {
      if (qText.includes(t)) {
        score += 3
        matched.push(t)
      }
      for (const k of kWords) {
        if (t.includes(k) || k.includes(t)) {
          score += 2
          matched.push(t)
        }
      }
    }
    return { q, score, matched: matched.length }
  })
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.matched - a.matched)
    .map((s) => ({ ...s.q, _score: s.score }) as MedicalQuestion & { _score: number })
}

export async function saveUnansweredQuestion(question: string): Promise<boolean> {
  const { error } = await supabase
    .from('unanswered_questions')
    .insert({ question })
  return !error
}
