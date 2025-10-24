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
  
  // 如果已经有 locale 前缀，直接继续
  if (pathname.startsWith('/en') || pathname.startsWith('/zh')) {
    return NextResponse.next();
  }
  
  // 如果是中文路径（/zh 开头），继续处理
  if (pathname.startsWith('/zh')) {
    return NextResponse.next();
  }
  
  // 其他所有路径（英文），重写到 /en 但不改变 URL
  // 这样用户看到的是 / 但内部处理为 /en
  return NextResponse.rewrite(new URL(`/en${pathname}`, request.url));
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
