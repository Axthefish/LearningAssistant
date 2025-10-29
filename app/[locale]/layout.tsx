import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import { StoreInitializer } from "@/components/StoreInitializer";
import { Sidebar } from "@/components/Sidebar";
import { StarryBackground } from "@/components/StarryBackground";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { locales } from '@/i18n/routing';

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export default async function LocaleLayout({
  children,
  params: {locale}
}: {
  children: React.ReactNode;
  params: {locale: string};
}) {
  // 验证 locale
  if (!locales.includes(locale as any)) {
    locale = 'en'; // 回退到默认语言
  }
  
  // 获取消息
  const messages = await getMessages({locale});
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ErrorBoundary>
        <StoreInitializer>
          <StarryBackground />
          <Sidebar />
          <main className="pl-64">{children}</main>
          <Toaster />
        </StoreInitializer>
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}
