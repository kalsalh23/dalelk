import { useQuery } from '@tanstack/react-query'
import { fetchArticles, fetchArticleBySlug, fetchRelatedArticles, fetchArticleCategories } from '@/services/articles'
import type { Article, Category } from '@/types'

export const articleKeys = {
  all: ['articles'] as const,
  list: (key: string) => [...articleKeys.all, 'list', key] as const,
  detail: (slug: string) => [...articleKeys.all, 'detail', slug] as const,
  categories: ['article-categories'] as const,
}

export function useArticles(params: { categoryId?: string | null; search?: string; limit?: number; offset?: number } = {}) {
  const key = JSON.stringify(params)
  return useQuery<{ data: Article[]; count: number }, Error>({
    queryKey: articleKeys.list(key),
    queryFn: () => fetchArticles(params),
  })
}

export function useArticle(slug: string | undefined) {
  return useQuery<Article | null, Error>({
    queryKey: articleKeys.detail(slug ?? ''),
    queryFn: () => fetchArticleBySlug(slug!),
    enabled: !!slug,
  })
}

export function useRelatedArticles(categoryId: string | null, excludeId: string) {
  return useQuery<Article[], Error>({
    queryKey: [...articleKeys.all, 'related', categoryId, excludeId],
    queryFn: () => fetchRelatedArticles(categoryId, excludeId),
  })
}

export function useArticleCategories() {
  return useQuery<Category[], Error>({
    queryKey: articleKeys.categories,
    queryFn: fetchArticleCategories,
  })
}