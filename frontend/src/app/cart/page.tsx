'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, ArrowLeft } from 'lucide-react';

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
    return <div className="min-h-screen bg-zinc-950 p-12 text-center text-zinc-500">Carregando carrinho...</div>;
  }

  const subtotal = getSubtotal();

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* CABEÇALHO DA PÁGINA */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-850 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Continuar Comprando</span>
              </Link>
            </div>
            <h1 className="text-2xl font-black text-white mt-2">Carrinho de Compras</h1>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-zinc-400 hover:text-red-400 transition-colors self-start sm:self-auto"
            >
              Limpar todos os itens
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 p-16 text-center bg-zinc-900/30">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 mb-4">
              <ShoppingBag className="h-8 w-8 text-zinc-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Seu carrinho está vazio</h2>
            <p className="mt-1 text-xs text-zinc-400 max-w-sm mx-auto">
              Adicione mouses, teclados ou monitores de alta performance para equipar seu setup gamer.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-500 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
            {/* COLUNA ESQUERDA: LISTA DE ITENS */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(({ product, quantity }) => {
                const unitPrice = product.discountPrice ?? product.price;
                return (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-4 transition-colors hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-950 border border-zinc-850 p-1 flex items-center justify-center">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="h-full w-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider">
                          {product.category?.name || 'Gamer'}
                        </span>
                        <h3 className="text-sm font-bold text-white truncate max-w-sm">
                          {product.name}
                        </h3>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {formatPrice(unitPrice)} por unidade
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800/60">
                      {/* CONTROLE DE QUANTIDADE */}
                      <div className="flex items-center rounded-xl border border-zinc-800 bg-zinc-950 px-2.5 py-1">
                        <button
                          onClick={() => updateQuantity(product.id, quantity - 1)}
                          className="p-1 text-zinc-400 hover:text-white transition-colors"
                          title="Diminuir quantidade"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-zinc-100">
                          {quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, quantity + 1)}
                          disabled={quantity >= product.stock}
                          className="p-1 text-zinc-400 hover:text-white transition-colors disabled:opacity-30"
                          title="Aumentar quantidade"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* TOTAL DO ITEM */}
                      <div className="text-right min-w-[95px]">
                        <div className="text-sm font-extrabold text-white">
                          {formatPrice(unitPrice * quantity)}
                        </div>
                      </div>

                      {/* REMOVER */}
                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 transition-colors rounded-lg hover:bg-zinc-850"
                        title="Remover do carrinho"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center gap-2 rounded-xl border border-zinc-850 bg-zinc-900/40 p-3.5 text-xs text-zinc-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Compra 100% protegida com envio direto e código de rastreamento imediato.</span>
              </div>
            </div>

            {/* COLUNA DIREITA: RESUMO FINANCEIRO FIXO */}
            <div className="sticky top-28 rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-6 space-y-5 backdrop-blur-md">
              <h2 className="text-base font-bold text-white">Resumo do Pedido</h2>

              <div className="space-y-3 text-xs border-b border-zinc-800/80 pb-4">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} itens)</span>
                  <span className="font-semibold text-zinc-100">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Frete Express Gamer</span>
                  <span className="font-semibold text-emerald-400">GRÁTIS</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Desconto no PIX</span>
                  <span className="font-semibold text-violet-400">-5% no checkout</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase font-bold text-zinc-400">Total</span>
                <span className="text-2xl font-black text-white">{formatPrice(subtotal)}</span>
              </div>

              <Link
                href="/checkout"
                className="flex w-full h-12 items-center justify-center gap-2 rounded-xl bg-violet-600 text-xs font-bold text-white transition-all hover:bg-violet-500 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] active:scale-98"
              >
                <span>Finalizar Compra</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
