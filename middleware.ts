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
  
  // 其他所有路径（英文）重写到 /en，但 URL 保持不变
  // 例如：用户访问 / 实际处理为 /en，访问 /initial 实际处理为 /en/initial
  return NextResponse.rewrite(new URL(`/en${pathname}`, request.url));
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
