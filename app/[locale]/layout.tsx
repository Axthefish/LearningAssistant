import {NextIntlClientProvider} from 'next-intl';
import {getMessages, unstable_setRequestLocale} from 'next-intl/server';
import { StoreInitializer } from "@/components/StoreInitializer";
import { GlobalNav } from "@/components/GlobalNav";
import { ThemeProvider } from "@/components/ThemeProvider";
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
  
  // 设置 locale
  unstable_setRequestLocale(locale);
  
  // 获取消息
  const messages = await getMessages({locale});
 
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ErrorBoundary>
        <ThemeProvider
          attribute="class"
          defaultLocale={locale}
          enableSystem
          disableTransitionOnChange
        >
          <StoreInitializer>
            <GlobalNav />
            <main className="pt-16">{children}</main>
            <Toaster />
          </StoreInitializer>
        </ThemeProvider>
      </ErrorBoundary>
    </NextIntlClientProvider>
  );
}
