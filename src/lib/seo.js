import { APP_FULL_NAME } from '@/constants';
const SITE_URL = import.meta.env.VITE_SITE_URL?.replace(/\/$/, '') ?? '';
export function applySeo({ title, description, image, path, type = 'website', jsonLd }) {
    const docTitle = title ? `${title} | ${APP_FULL_NAME}` : APP_FULL_NAME;
    const description_ = description ??
        'كل ما تحتاجه من خدمات صحية في مدينة طيبة الإمام في مكان واحد: أطباء، عيادات، صيدليات، مشافي، مخابر، نصائح طبية وأجوبة على أسئلتك الصحية.';
    document.title = docTitle;
    setMeta('description', description_);
    setMeta('og:title', docTitle);
    setMeta('og:description', description_);
    setMeta('og:type', type);
    setMeta('og:site_name', APP_FULL_NAME);
    if (image)
        setMeta('og:image', image.startsWith('http') ? image : `${SITE_URL}${image}`);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', docTitle);
    setMeta('twitter:description', description_);
    const canonical = path ? `${SITE_URL}${path}` : `${SITE_URL}/`;
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
    }
    link.href = canonical;
    // Schema.org JSON-LD
    const keep = document.querySelector('#schema-seo');
    const scripts = jsonLd ?? [];
    if (type === 'website' && !jsonLd) {
        scripts.push({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: APP_FULL_NAME,
            url: SITE_URL,
        });
    }
    if (scripts.length) {
        const script = document.createElement('script');
        script.id = 'schema-seo';
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(scripts);
        keep?.replaceWith(script);
        if (!keep)
            document.head.appendChild(script);
    }
    else {
        keep?.remove();
    }
}
function setMeta(prop, content) {
    let el = document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
    if (!el) {
        const m = document.createElement('meta');
        m.setAttribute(prop.startsWith('og:') ? 'property' : 'name', prop);
        document.head.appendChild(m);
        el = m;
    }
    el.setAttribute(prop.startsWith('og:') ? 'property' : 'name', prop);
    el.setAttribute('content', content);
}
export function breadcrumbSchema(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: item.label,
            ...(item.url ? { item: item.url } : {}),
        })),
    };
}
export function absoluteUrl(path) {
    if (path.startsWith('http'))
        return path;
    return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
