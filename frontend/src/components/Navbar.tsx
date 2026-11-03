'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import {
  ShoppingCart,
  User as UserIcon,
  Search,
  ShieldCheck,
  LogOut,
  Zap,
  X,
  Sun,
  Moon,
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';

const CATEGORIES = [
  { label: 'Todos', slug: '' },
  { label: 'Mouses', slug: 'mouses' },
  { label: 'Teclados', slug: 'teclados' },
  { label: 'Monitores', slug: 'monitores' },
  { label: 'Áudio', slug: 'audio' },
];

function NavbarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || '';

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { user, logout, isAuthenticated, isAdmin } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/');
    }
  };

  const handleClearSearch = () => {
    setSearch('');
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/85 dark:border-zinc-800/80 dark:bg-zinc-950/85 backdrop-blur-xl transition-colors duration-200">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-2.5 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all group-hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] group-hover:scale-105">
            <Zap className="h-5 w-5 fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
              VORTEX<span className="text-violet-500 dark:text-violet-400">GEAR</span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-zinc-400 font-semibold mt-0.5">
              High Performance
            </span>
          </div>
        </Link>

        {/* BARRA DE PESQUISA */}
        <form onSubmit={handleSearch} className="relative hidden md:flex flex-1 max-w-lg mx-4">
          <input
            type="text"
            placeholder="Buscar mouses 8000Hz, teclados HE, monitores OLED..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-100/80 py-2.5 pl-11 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:bg-zinc-900"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-400" />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        {/* AÇÕES DE USUÁRIO, TEMA E CARRINHO */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* BOTÃO TOGGLE TEMA (CLARO / ESCURO) */}
          {mounted && (
            <button
              type="button"
              onClick={() => toggleTheme()}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 transition-all hover:border-violet-500/60 hover:bg-slate-200/80 hover:text-violet-600 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:bg-zinc-850 dark:hover:text-amber-400 hover:scale-105"
              title={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
              aria-label={theme === 'dark' ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400 transition-transform rotate-0 scale-100" />
              ) : (
                <Moon className="h-5 w-5 text-violet-600 transition-transform rotate-0 scale-100" />
              )}
            </button>
          )}

          {mounted && isAdmin() && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3.5 py-2 text-xs font-semibold text-violet-600 dark:text-violet-300 transition-all hover:bg-violet-500/20 hover:border-violet-400"
            >
              <ShieldCheck className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              <span className="hidden sm:inline">Painel Admin</span>
            </Link>
          )}

          {/* BOTÃO DO CARRINHO */}
          <Link
            href="/cart"
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 text-slate-700 transition-all hover:border-violet-500/60 hover:bg-slate-200/80 hover:text-violet-600 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200 dark:hover:border-violet-500/60 dark:hover:bg-zinc-850 dark:hover:text-violet-300 hover:shadow-md"
            title="Ver Carrinho de Compras"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-[11px] font-black text-white shadow-[0_0_12px_rgba(139,92,246,0.8)] border-2 border-white dark:border-zinc-950 animate-in zoom-in-50">
                {totalItems}
              </span>
            )}
          </Link>

          {/* PERFIL / LOGIN */}
          {mounted && isAuthenticated() ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-100/80 px-3 py-1.5 text-xs text-slate-800 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-200">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover border border-violet-500/50"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/30 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[110px] truncate font-medium text-slate-800 dark:text-zinc-200 hidden sm:inline">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-100/80 text-slate-500 transition-all hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500 dark:border-zinc-800 dark:bg-zinc-900/90 dark:text-zinc-400 dark:hover:text-red-400"
                title="Sair da Conta"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]"
            >
              <UserIcon className="h-4 w-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>

      {/* ABAS DE CATEGORIAS */}
      <div className="border-t border-slate-200/80 bg-slate-50/60 dark:border-zinc-850/80 dark:bg-zinc-950/40 px-4 py-2.5 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = currentCategory === cat.slug;
            const href = cat.slug ? `/?category=${cat.slug}` : '/';
            return (
              <Link
                key={cat.label}
                href={href}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                    : 'bg-white/80 border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100 dark:bg-zinc-900/80 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:border-zinc-700 dark:hover:bg-zinc-850'
                }`}
              >
                {cat.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense
      fallback={
        <div className="h-24 w-full bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-zinc-800" />
      }
    >
      <NavbarContent />
    </Suspense>
  );
}
