'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, clearCart, getSubtotal } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950 p-8 text-center text-zinc-500">Carregando carrinho...</div>;
  }

  const subtotal = getSubtotal();

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
          <h1 className="text-2xl font-black text-white">Seu Carrinho</h1>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              Esvaziar Carrinho
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-zinc-600 mb-3" />
            <h2 className="text-lg font-bold text-zinc-300">Seu carrinho está vazio</h2>
            <p className="mt-1 text-xs text-zinc-500">
              Explore nossos periféricos gamer competitivos e adicione itens ao carrinho.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* LISTA DE ITENS */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => {
                const price = product.discountPrice ?? product.price;
                return (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-850 bg-zinc-900/60 p-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-20 w-20 rounded-xl object-cover border border-zinc-800 bg-zinc-950"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-zinc-100 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {formatPrice(price)} cada
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                      <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-zinc-400 hover:text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-zinc-200">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <div className="text-sm font-bold text-emerald-400">
                          {formatPrice(price * quantity)}
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-zinc-500 hover:text-red-400 transition-colors"
                        title="Remover item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RESUMO DO PEDIDO */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 h-fit space-y-4">
              <h2 className="text-base font-bold text-white">Resumo da Compra</h2>

              <div className="space-y-2 text-xs border-b border-zinc-800 pb-4">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="font-semibold text-zinc-200">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Frete Express Gamer</span>
                  <span className="font-semibold text-emerald-400">GRÁTIS</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold text-white">
                <span>Total Estimado</span>
                <span className="text-lg text-emerald-400">{formatPrice(subtotal)}</span>
              </div>

              <Link
                href="/checkout"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                <span>Avançar para o Pagamento</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

