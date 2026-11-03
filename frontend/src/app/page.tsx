'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, Check, Zap, Sparkles, ShieldCheck, Flame } from 'lucide-react';
import Link from 'next/link';

function CatalogContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (category) params.category = category;
        if (search) params.search = search;

        const response = await api.get('/products', { params });
        setProducts(response.data);
      } catch (err) {
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, [category, search]);

  const handleAddToCart = (product: Product) => {
    addItem(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200">
      {/* HERO SECTION GAMER CLEAN */}
      {!category && !search && (
        <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.14),rgba(248,250,252,0))] dark:border-zinc-800/80 dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.18),rgba(24,24,27,0))] px-4 py-16 sm:px-6 lg:py-20 lg:px-8 transition-colors duration-200">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] mb-6">
              <Sparkles className="h-4 w-4 text-violet-500 dark:text-violet-400" />
              <span>LINHA COMPETITIVA DE ALTA PERFORMANCE</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white">
              Precisão Extrema &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-500 dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400">
                Latência Quase Zero
              </span>
            </h1>
            <p className="mt-4 text-base text-slate-600 dark:text-zinc-400 sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Equipamentos testados e ajustados para torneios profissionais: polling rate de 8000Hz, atuação magnética Rapid Trigger e painéis OLED ultrarrápidos.
            </p>
          </div>
        </section>
      )}

      {/* CATÁLOGO E GRID DE PRODUTOS */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {search
                ? `Resultados para "${search}"`
                : category
                ? `Catálogo: ${category.charAt(0).toUpperCase() + category.slice(1)}`
                : 'Destaques do Catálogo'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {products.length} {products.length === 1 ? 'periférico disponível' : 'periféricos disponíveis'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-zinc-400 bg-white dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 w-fit shadow-sm">
            <ShieldCheck className="h-4 w-4 text-violet-500 dark:text-violet-400" />
            <span>Garantia de 2 anos com envio express</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[460px] animate-pulse rounded-2xl border border-slate-200 dark:border-zinc-850 bg-slate-200/50 dark:bg-zinc-900/50"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-zinc-800 p-16 text-center bg-white/50 dark:bg-zinc-900/30">
            <p className="text-base text-slate-700 dark:text-zinc-300 font-semibold">Nenhum periférico encontrado</p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1">Tente buscar por outro termo ou selecione outra categoria.</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition-colors shadow-sm"
            >
              Ver todos os produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => {
              const currentPrice = product.discountPrice ?? product.price;
              const hasDiscount = !!product.discountPrice;

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-zinc-800/80 dark:bg-zinc-900/80 backdrop-blur-sm p-4 transition-all duration-300 hover:border-violet-500/50 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)] hover:-translate-y-1 shadow-sm"
                >
                  {/* IMAGEM DO PRODUTO */}
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100/70 dark:bg-zinc-950/60 p-3 flex items-center justify-center border border-slate-200/80 dark:border-zinc-850/80">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover object-center rounded-lg transition-transform duration-500 group-hover:scale-105"
                      />
                      {hasDiscount && (
                        <span className="absolute top-2.5 left-2.5 rounded-lg bg-emerald-500 text-white dark:text-zinc-950 font-black text-[10px] px-2.5 py-0.5 shadow-md">
                          PROMOÇÃO
                        </span>
                      )}
                      {product.featured && (
                        <span className="absolute top-2.5 right-2.5 rounded-lg bg-violet-600 border border-violet-400/40 text-white font-bold text-[10px] px-2.5 py-0.5 shadow-md">
                          PRO PICKS
                        </span>
                      )}
                    </div>

                    {/* CATEGORIA E ESTOQUE */}
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="font-semibold text-violet-600 dark:text-violet-400">
                        {product.category?.name || 'Gamer'}
                      </span>
                      <span className={product.stock <= 5 ? 'text-amber-500 dark:text-amber-400 font-semibold' : 'text-slate-400 dark:text-zinc-500'}>
                        {product.stock <= 5 ? `Apenas ${product.stock} restantes` : 'Em Estoque'}
                      </span>
                    </div>

                    {/* TÍTULO DO PRODUTO */}
                    <h3 className="mt-1.5 text-sm font-bold text-slate-800 dark:text-zinc-100 line-clamp-2 leading-snug group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                      {product.name}
                    </h3>

                    {/* TAGS DE ESPECIFICAÇÕES TÉCNICAS */}
                    <div className="mt-3 flex flex-wrap gap-1.5 min-h-[50px] content-start">
                      {Object.entries(product.specs || {})
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:border-zinc-800 dark:bg-zinc-950/70 dark:text-zinc-300"
                            title={`${key}: ${value}`}
                          >
                            {value}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* BLOCO DE PREÇO E BOTÃO DE COMPRA LARGO */}
                  <div className="mt-5 pt-4 border-t border-slate-200 dark:border-zinc-800/80">
                    <div className="mb-3">
                      {hasDiscount ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {formatPrice(product.discountPrice!)}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-zinc-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                          {formatPrice(product.price)}
                        </span>
                      )}
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                        Em até 12x ou com desconto no PIX
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`flex w-full h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98 ${
                        addedId === product.id
                          ? 'bg-emerald-500 text-white dark:text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                          : product.stock <= 0
                          ? 'bg-slate-200 text-slate-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed'
                          : 'bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                      }`}
                    >
                      {addedId === product.id ? (
                        <>
                          <Check className="h-4 w-4 stroke-[3]" />
                          <span>Adicionado ao Carrinho!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>Adicionar ao Carrinho</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-12 text-center text-slate-400 dark:text-zinc-500">
          Carregando catálogo...
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
