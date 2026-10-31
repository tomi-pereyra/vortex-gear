'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { ShoppingCart, Zap, Check, Shield, Sparkles } from 'lucide-react';

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
    setTimeout(() => setAddedId(null), 1500);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* HERO SECTION */}
      {!category && !search && (
        <section className="relative overflow-hidden border-b border-zinc-800 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))] px-4 py-20 text-center sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-400 mb-6 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Sparkles className="h-4 w-4" />
              <span>TECNOLOGIA COMPETITIVA PARA E-SPORTS</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              Velocidade e Precisão no <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Nível Máximo
              </span>
            </h1>
            <p className="mt-4 text-base text-zinc-400 sm:text-lg max-w-2xl mx-auto">
              Mouses de 8000Hz ultraleves, teclados magnéticos Hall Effect com Rapid Trigger e monitores OLED de 360Hz projetados para alta performance.
            </p>
          </div>
        </section>
      )}

      {/* VITRINE / PRODUTOS */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">
              {search
                ? `Resultados para "${search}"`
                : category
                ? `Periféricos: ${category.toUpperCase()}`
                : 'Catálogo de Alta Performance'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-2xl border border-zinc-900 bg-zinc-900/50"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <p className="text-zinc-400">Nenhum periférico encontrado para os filtros selecionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-zinc-850 bg-zinc-900/70 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
              >
                {/* IMAGEM E TAGS */}
                <div className="relative aspect-square w-full overflow-hidden bg-zinc-950">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.discountPrice && (
                    <span className="absolute top-3 left-3 rounded-md bg-emerald-500 px-2 py-0.5 text-[11px] font-bold text-zinc-950 shadow-md">
                      OFERTA GAMER
                    </span>
                  )}
                  {product.featured && (
                    <span className="absolute top-3 right-3 rounded-md bg-purple-500/20 border border-purple-500/50 px-2 py-0.5 text-[11px] font-bold text-purple-300 backdrop-blur-md">
                      DESTAQUE
                    </span>
                  )}
                </div>

                {/* CONTEÚDO */}
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-2 flex items-center justify-between text-xs text-zinc-400">
                    <span>{product.category?.name || 'Gamer'}</span>
                    <span className={product.stock <= 5 ? 'text-amber-400 font-semibold' : 'text-zinc-500'}>
                      {product.stock <= 5 ? `Apenas ${product.stock} restantes` : 'Em Estoque'}
                    </span>
                  </div>

                  <h3 className="line-clamp-2 text-sm font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors">
                    {product.name}
                  </h3>

                  {/* SPECS BADGES */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(product.specs || {})
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <span
                          key={key}
                          className="rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300 font-medium"
                          title={`${key}: ${value}`}
                        >
                          {value}
                        </span>
                      ))}
                  </div>

                  {/* PREÇOS E BOTÃO */}
                  <div className="mt-5 pt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <div>
                      {product.discountPrice ? (
                        <>
                          <div className="text-xs text-zinc-500 line-through">
                            {formatPrice(product.price)}
                          </div>
                          <div className="text-lg font-black text-emerald-400">
                            {formatPrice(product.discountPrice)}
                          </div>
                        </>
                      ) : (
                        <div className="text-lg font-black text-white">
                          {formatPrice(product.price)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0}
                      className={`flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 text-xs font-bold transition-all ${
                        addedId === product.id
                          ? 'bg-emerald-500 text-zinc-950'
                          : product.stock <= 0
                          ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                          : 'bg-zinc-800 text-zinc-200 hover:bg-emerald-500 hover:text-zinc-950'
                      }`}
                    >
                      {addedId === product.id ? (
                        <>
                          <Check className="h-4 w-4" />
                          <span>Adicionado</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4" />
                          <span>Comprar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 p-8 text-center text-zinc-500">Carregando catálogo...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
