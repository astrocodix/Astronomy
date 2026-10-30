import type { Metadata, Viewport } from 'next';
import { allLessons, lessonId } from '../../src/content';
import { curriculum } from '../../src/content/curriculum';
import { publicAsset } from '../../src/lib/public-asset';
import { PagesProvider } from '../components/provider';
import { SiteShell, type SearchEntry } from '../components/shell';
import '../../src/app/globals.css';
import './pages.css';

export const metadata: Metadata = {
  title: {
    default: 'Astroverse Academy — A universe of learning',
    template: '%s | Astroverse Academy',
  },
  description:
    'Explore a bilingual astronomy curriculum, pilot lessons, and interactive observatory.',
  applicationName: 'Astroverse Academy',
  // The pilot has not yet received independent editorial review.
  robots: { index: false, follow: true },
  icons: { icon: publicAsset('/icon.svg') },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#080d1b' };

const searchIndex: SearchEntry[] = [
  ...allLessons.map((lesson) => ({
    href: `/lesson/${lessonId(lesson)}`,
    title: lesson.title,
    description: lesson.summary,
    kind: 'lesson' as const,
  })),
  ...curriculum.map((stage, index) => ({
    href: `/stages/s-${index + 1}`,
    title: stage.title,
    description: stage.description,
    kind: 'stage' as const,
  })),
];
const bootstrap = `(function(){try{var l=localStorage.getItem('astro-lang');document.documentElement.lang=l==='ar'?'ar':'en';document.documentElement.dir=l==='ar'?'rtl':'ltr';var t=localStorage.getItem('astro-theme');document.documentElement.dataset.theme=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):(t==='light'?'light':'dark');}catch(e){document.documentElement.dataset.theme='dark'}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href={publicAsset('/fonts/inter.css')} />
        <link rel="stylesheet" href={publicAsset('/fonts/cairo.css')} />
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      </head>
      <body>
        <PagesProvider>
          <SiteShell searchIndex={searchIndex}>{children}</SiteShell>
        </PagesProvider>
      </body>
    </html>
  );
}
