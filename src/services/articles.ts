import { supabase } from '@/lib/supabase'
import type { Article, MedicalQuestion, MedicalKeyword } from '@/types'

export async function fetchArticles(params: {
  categoryId?: string | null
  search?: string
  limit?: number
  offset?: number
  featured?: boolean
}): Promise<{ data: Article[]; count: number }> {
  let q = supabase.from('articles').select('*', { count: 'exact' }).eq('is_published', true)
  if (params.categoryId) q = q.eq('category_id', params.categoryId)
  if (params.featured) q = q.eq('is_featured', true)
  if (params.search?.trim()) q = q.ilike('title', `%${params.search.trim()}%`)
  q = q.order('published_at', { ascending: false })
  if (params.limit != null) q = q.range(params.offset ?? 0, (params.offset ?? 0) + params.limit - 1)
  const { data, error, count } = await q
  if (error) throw error
  return { data: (data ?? []) as Article[], count: count ?? 0 }
}

export async function fetchArticleBySlug(slug: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  if (error) return null
  return data as Article
}

export async function fetchRelatedArticles(categoryId: string | null, excludeId: string, limit = 4): Promise<Article[]> {
  let q = supabase
    .from('articles')
    .select('*')
    .eq('is_published', true)
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .limit(limit)
  if (categoryId) q = q.eq('category_id', categoryId)
  const { data, error } = await q
  if (error) return []
  return (data ?? []) as Article[]
}

export async function fetchArticleCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('type', 'article')
    .eq('is_active', true)
    .order('sort_order')
  if (error) return []
  return data ?? []
}

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