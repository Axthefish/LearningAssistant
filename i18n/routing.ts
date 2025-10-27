// 简化的路由配置 - 不使用 next-intl 的导航功能
export const locales = ['en', 'zh'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en';

// 从路径中提取 locale
export function getLocaleFromPathname(pathname: string): Locale {
  if (pathname.startsWith('/zh')) {
    return 'zh';
  }
  return 'en';
}

// 获取不带 locale 的干净路径
export function getPathnameWithoutLocale(pathname: string): string {
  // 统一保证以 '/'
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;

  // 只移除第一个语言段（若存在）。支持 en / zh
  const cleaned = normalized.replace(/^\/(en|zh)(?=\/|$)/, '');

  // 结果为空时回退为 '/'
  return cleaned === '' ? '/' : cleaned;
}

// 根据 locale 和路径生成完整 URL
export function getPathWithLocale(pathname: string, locale: Locale): string {
  // 确保 pathname 是干净的（不包含 locale）
  const cleanPath = getPathnameWithoutLocale(pathname);
  
  if (locale === 'zh') {
    return cleanPath === '/' ? '/zh' : `/zh${cleanPath}`;
  }
  // en 为默认语言，直接返回干净路径
  return cleanPath;
}
