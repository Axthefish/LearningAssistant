import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 跳过 API、静态文件等
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  // 如果路径已经以 /en 或 /zh 开头，直接继续
  if (pathname.startsWith('/en') || pathname.startsWith('/zh')) {
    return NextResponse.next();
  }
  
  // 其他所有路径重定向到 /en（显式 URL，利于 SEO）
  // 例如：用户访问 / 重定向到 /en，访问 /initial 重定向到 /en/initial
  return NextResponse.redirect(new URL(`/en${pathname}`, request.url));
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
