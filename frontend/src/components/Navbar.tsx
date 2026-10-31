'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ShoppingCart, User as UserIcon, Search, ShieldCheck, LogOut, Flame } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';

export function Navbar() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const { user, logout, isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/?search=${encodeURIComponent(search.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        {/* LOGO */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
            <Flame className="h-5 w-5 animate-pulse" />
          </div>
          <span className="text-xl font-black tracking-wider text-white">
            VORTEX<span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.7)]">GEAR</span>
          </span>
        </Link>

        {/* BUSCA */}
        <form onSubmit={handleSearch} className="relative hidden md:flex flex-1 max-w-md">
          <input
            type="text"
            placeholder="Buscar mouses 8K, teclados HE, monitores..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border border-zinc-800 bg-zinc-900/90 py-1.5 pl-10 pr-4 text-sm text-zinc-200 placeholder-zinc-500 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
        </form>

        {/* NAVEGAÇÃO E AÇÕES */}
        <div className="flex items-center gap-3">
          {mounted && isAdmin() && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-semibold text-purple-300 hover:bg-purple-500/20 hover:border-purple-400 transition-colors"
            >
              <ShieldCheck className="h-4 w-4 text-purple-400" />
              <span className="hidden sm:inline">Painel Admin</span>
            </Link>
          )}

          {/* CARRINHO */}
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-300 transition-colors hover:border-emerald-500/50 hover:text-emerald-400"
            title="Carrinho de Compras"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-zinc-950 shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                {totalItems}
              </span>
            )}
          </Link>

          {/* AUTENTICAÇÃO */}
          {mounted && isAuthenticated() ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/80 px-2.5 py-1 text-sm text-zinc-300">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-6 w-6 rounded-full object-cover border border-emerald-500/40"
                  />
                ) : (
                  <UserIcon className="h-4 w-4 text-emerald-400" />
                )}
                <span className="max-w-[100px] truncate text-xs font-medium sm:max-w-[140px]">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={() => logout()}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:border-red-500/50 hover:text-red-400"
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500 hover:text-zinc-950 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <UserIcon className="h-4 w-4" />
              <span>Entrar</span>
            </Link>
          )}
        </div>
      </div>

      {/* CATEGORIAS SUB-NAV */}
      <div className="border-t border-zinc-900/80 bg-zinc-950/60 px-4 py-2">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto text-xs font-medium text-zinc-400">
          <Link href="/" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
            Todos os Produtos
          </Link>
          <Link href="/?category=mouses" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
            Mouses
          </Link>
          <Link href="/?category=teclados" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
            Teclados
          </Link>
          <Link href="/?category=monitores" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
            Monitores
          </Link>
          <Link href="/?category=audio" className="hover:text-emerald-400 transition-colors whitespace-nowrap">
            Áudio
          </Link>
        </div>
      </div>
    </header>
  );
}

