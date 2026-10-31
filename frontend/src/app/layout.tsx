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
    <html lang="pt-BR" className="dark">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500 selection:text-zinc-950`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
