import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Astroverse Academy — Your Universe of Learning',
  description:
    'Learn the Universe. Understand Everything. A bilingual astronomy academy with progressive lessons, scientific imagery, interactive models, and evidence-led assessments.',
  applicationName: 'Astroverse Academy',
  robots: { index: false, follow: false },
  icons: { icon: '/icon.svg' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b0e18' };
const bootstrap = `(function(){try{var l=localStorage.getItem('astro-lang')||'en';document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';var t=localStorage.getItem('astro-theme')||'system';document.documentElement.dataset.theme=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;}catch(e){document.documentElement.dataset.theme='dark'}})();`;
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/fonts/inter.css" />
        <link rel="stylesheet" href="/fonts/cairo.css" />
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
