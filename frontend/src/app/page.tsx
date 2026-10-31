'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, Check, Sparkles, SlidersHorizontal, ShieldCheck, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function CatalogContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        const params: any = {};
        if (category) params.category = category;
        if (search) params.search = search;

        const response = await api.get('/products', { params });
        setProducts(response.data);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* HERO SECTION GAMER CLEAN */}
      {!category && !search && (
        <section className="relative overflow-hidden border-b border-zinc-800/80 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(139,92,246,0.18),rgba(24,24,27,0))] px-4 py-16 sm:px-6 lg:py-20 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.15)] mb-6">
              <Sparkles className="h-4 w-4 text-violet-400" />
              <span>LINHA COMPETITIVA DE ALTA PERFORMANCE</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              Precisão Extrema &amp; <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400">
                Latência Quase Zero
              </span>
            </h1>
            <p className="mt-4 text-base text-zinc-400 sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Equipamentos testados e ajustados para torneios profissionais: polling rate de 8000Hz, atuação magnética Rapid Trigger e painéis OLED ultrarrápidos.
            </p>
          </div>
        </section>
      )}

      {/* CATÁLOGO E GRID DE PRODUTOS */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {search
                ? `Resultados para "${search}"`
                : category
                ? `Catálogo: ${category.charAt(0).toUpperCase() + category.slice(1)}`
                : 'Destaques do Catálogo'}
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              {products.length} {products.length === 1 ? 'periférico disponível' : 'periféricos disponíveis'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 bg-zinc-900/80 border border-zinc-800 rounded-xl px-3.5 py-2 w-fit">
            <ShieldCheck className="h-4 w-4 text-violet-400" />
            <span>Garantia de 2 anos com envio express</span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[460px] animate-pulse rounded-2xl border border-zinc-850 bg-zinc-900/50"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center bg-zinc-900/30">
            <p className="text-base text-zinc-300 font-semibold">Nenhum periférico encontrado</p>
            <p className="text-xs text-zinc-500 mt-1">Tente buscar por outro termo ou selecione outra categoria.</p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-500 transition-colors"
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
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/80 backdrop-blur-sm p-4 transition-all duration-300 hover:border-violet-500/50 hover:bg-zinc-900 hover:shadow-[0_8px_30px_rgba(139,92,246,0.12)] hover:-translate-y-1"
                >
                  {/* IMAGEM DO PRODUTO */}
                  <div>
                    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-950/60 p-3 flex items-center justify-center border border-zinc-850/80">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-cover object-center rounded-lg transition-transform duration-500 group-hover:scale-105"
                      />
                      {hasDiscount && (
                        <span className="absolute top-2.5 left-2.5 rounded-lg bg-emerald-500/90 text-zinc-950 font-black text-[10px] px-2.5 py-0.5 shadow-md">
                          PROMOÇÃO
                        </span>
                      )}
                      {product.featured && (
                        <span className="absolute top-2.5 right-2.5 rounded-lg bg-violet-600/90 border border-violet-400/40 text-white font-bold text-[10px] px-2.5 py-0.5 shadow-md">
                          PRO PICKS
                        </span>
                      )}
                    </div>

                    {/* CATEGORIA E ESTOQUE */}
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="font-semibold text-violet-400">
                        {product.category?.name || 'Gamer'}
                      </span>
                      <span className={product.stock <= 5 ? 'text-amber-400 font-semibold' : 'text-zinc-500'}>
                        {product.stock <= 5 ? `Apenas ${product.stock} restantes` : 'Em Estoque'}
                      </span>
                    </div>

                    {/* TÍTULO DO PRODUTO */}
                    <h3 className="mt-1.5 text-sm font-bold text-zinc-100 line-clamp-2 leading-snug group-hover:text-violet-300 transition-colors">
                      {product.name}
                    </h3>

                    {/* TAGS DE ESPECIFICAÇÕES TÉCNICAS */}
                    <div className="mt-3 flex flex-wrap gap-1.5 min-h-[50px] content-start">
                      {Object.entries(product.specs || {})
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <span
                            key={key}
                            className="rounded-md border border-zinc-800 bg-zinc-950/70 px-2 py-0.5 text-[10px] font-medium text-zinc-300"
                            title={`${key}: ${value}`}
                          >
                            {value}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* BLOCO DE PREÇO E BOTÃO DE COMPRA LARGO */}
                  <div className="mt-5 pt-4 border-t border-zinc-800/80">
                    <div className="mb-3">
                      {hasDiscount ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-white">
                            {formatPrice(product.discountPrice!)}
                          </span>
                          <span className="text-xs text-zinc-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-2xl font-black text-white">
                          {formatPrice(product.price)}
                        </span>
                      )}
                      <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                        Em até 12x ou com desconto no PIX
                      </p>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`flex w-full h-11 items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98 ${
                        addedId === product.id
                          ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                          : product.stock <= 0
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
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
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 p-12 text-center text-zinc-500">Carregando catálogo...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
