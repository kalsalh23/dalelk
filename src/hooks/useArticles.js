import { useQuery } from '@tanstack/react-query';
import { fetchArticles, fetchArticleBySlug, fetchRelatedArticles, fetchArticleCategories } from '@/services/articles';
export const articleKeys = {
    all: ['articles'],
    list: (key) => [...articleKeys.all, 'list', key],
    detail: (slug) => [...articleKeys.all, 'detail', slug],
    categories: ['article-categories'],
};
export function useArticles(params = {}) {
    const key = JSON.stringify(params);
    return useQuery({
        queryKey: articleKeys.list(key),
        queryFn: () => fetchArticles(params),
    });
}
export function useArticle(slug) {
    return useQuery({
        queryKey: articleKeys.detail(slug ?? ''),
        queryFn: () => fetchArticleBySlug(slug),
        enabled: !!slug,
    });
}
export function useRelatedArticles(categoryId, excludeId) {
    return useQuery({
        queryKey: [...articleKeys.all, 'related', categoryId, excludeId],
        queryFn: () => fetchRelatedArticles(categoryId, excludeId),
    });
}
export function useArticleCategories() {
    return useQuery({
        queryKey: articleKeys.categories,
        queryFn: fetchArticleCategories,
    });
}
