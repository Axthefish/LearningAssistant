import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: false  // 禁用自动检测，避免浏览器语言影响
});

export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);

