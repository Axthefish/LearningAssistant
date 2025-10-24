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
  if (pathname.startsWith('/zh/')) {
    return pathname.slice(3); // 移除 '/zh'
  }
  if (pathname === '/zh') {
    return '/';
  }
  return pathname;
}

// 根据 locale 和路径生成完整 URL
export function getPathWithLocale(pathname: string, locale: Locale): string {
  // 确保 pathname 是干净的（不包含 locale）
  const cleanPath = getPathnameWithoutLocale(pathname);
  
  if (locale === 'zh') {
    return `/zh${cleanPath}`;
  }
  return cleanPath;
}
