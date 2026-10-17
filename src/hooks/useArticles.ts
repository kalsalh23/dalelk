import { useQuery } from '@tanstack/react-query'
import { fetchArticles, fetchArticleBySlug, fetchRelatedArticles, fetchArticleCategories } from '@/services/articles'

export const articleKeys = {
  all: ['articles'] as const,
  list: (key: string) => [...articleKeys.all, 'list', key] as const,
  detail: (slug: string) => [...articleKeys.all, 'detail', slug] as const,
  categories: ['article-categories'] as const,
}

export function useArticles(params: { categoryId?: string | null; search?: string; limit?: number; offset?: number } = {}) {
  const key = JSON.stringify(params)
  return useQuery({
    queryKey: articleKeys.list(key),
    queryFn: () => fetchArticles(params),
  })
}

export function useArticle(slug: string | undefined) {
  return useQuery({
    queryKey: articleKeys.detail(slug ?? ''),
    queryFn: () => fetchArticleBySlug(slug!),
    enabled: !!slug,
  })
}

export function useRelatedArticles(categoryId: string | null, excludeId: string) {
  return useQuery({
    queryKey: [...articleKeys.all, 'related', categoryId, excludeId],
    queryFn: () => fetchRelatedArticles(categoryId, excludeId),
  })
}

export function useArticleCategories() {
  return useQuery({
    queryKey: articleKeys.categories,
    queryFn: fetchArticleCategories,
  })
}