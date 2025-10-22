import createMiddleware from 'next-intl/middleware';
 
export default createMiddleware({
  locales: ['en', 'zh'],
  defaultLocale: 'en', // 默认英文
  localeDetection: false // 不自动检测浏览器语言，由用户主动选择
});
 
export const config = {
  // 匹配所有路径，除了api、_next和静态文件
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

