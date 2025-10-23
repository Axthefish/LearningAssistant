import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'never', // 不在URL中添加locale前缀
  localeDetection: false
});
 
export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

