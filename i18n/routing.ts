import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'  // en 无前缀，zh 有 /zh 前缀
});

export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);

