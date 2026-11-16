import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vortex Gear — Periféricos Gamer de Alta Performance',
  description:
    'E-commerce focado em periféricos competitivos: mouses 8000Hz, teclados magnéticos Hall Effect e monitores OLED 360Hz.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var saved = localStorage.getItem('vortex-gear-theme');
                var theme = saved ? JSON.parse(saved).state?.theme : 'dark';
                if (theme === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                } else {
                  document.documentElement.classList.add('dark');
                  document.documentElement.classList.remove('light');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 antialiased selection:bg-violet-500 selection:text-white transition-colors duration-200`}
      >
        <Navbar />
        {children}
      </body>
    </html>
  );
}
