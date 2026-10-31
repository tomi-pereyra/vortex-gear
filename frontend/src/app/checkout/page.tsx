'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { CreditCard, QrCode, Tag, CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { items, clearCart, getSubtotal } = useCartStore();
  const { user } = useAuthStore();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');

  // CUPOM
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setCustomerName(user.name);
      setCustomerEmail(user.email);
    }
  }, [user]);

  if (!mounted) {
    return <div className="min-h-screen bg-zinc-950 p-12 text-center text-zinc-500">Carregando checkout...</div>;
  }

  const subtotal = getSubtotal();

  // CÁLCULOS
  const couponDiscount = appliedCoupon
    ? (subtotal * appliedCoupon.discountPercent) / 100
    : 0;

  const afterCoupon = subtotal - couponDiscount;
  const pixDiscount = paymentMethod === 'PIX' ? (afterCoupon * 5) / 100 : 0;
  const totalDiscount = couponDiscount + pixDiscount;
  const totalFinal = Math.max(0, subtotal - totalDiscount);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponError(null);
    try {
      const response = await api.post('/coupons/validate', {
        code: couponInput.trim(),
      });
      setAppliedCoupon(response.data);
    } catch (err: any) {
      setCouponError(err.response?.data?.message || 'Cupom inválido ou expirado.');
      setAppliedCoupon(null);
    }
  };

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setCheckoutError(null);
    setLoading(true);

    try {
      const payload = {
        customerName,
        customerEmail,
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const response = await api.post('/orders', payload);
      setOrderSuccess(response.data);
      clearCart();
    } catch (err: any) {
      setCheckoutError(
        err.response?.data?.message || 'Ocorreu um erro ao finalizar o pedido.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-zinc-950 px-4 py-16 text-zinc-100 sm:px-6">
        <div className="mx-auto max-w-lg rounded-3xl border border-emerald-500/30 bg-zinc-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Pedido Confirmado!</h1>
          <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
            Seu pedido foi registrado e está aprovado no sistema da Vortex Gear.
          </p>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left text-xs space-y-2.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Código do Pedido:</span>
              <span className="font-mono text-zinc-300 font-semibold">{orderSuccess.id.slice(0, 8)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Destinatário:</span>
              <span className="text-zinc-200">{orderSuccess.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Método de Pagamento:</span>
              <span className="text-emerald-400 font-bold">{orderSuccess.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-850 pt-2 font-bold">
              <span className="text-white">Total Pago:</span>
              <span className="text-emerald-400 text-sm">{formatPrice(orderSuccess.totalAmount)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full rounded-xl bg-violet-600 py-3 text-xs font-bold text-white hover:bg-violet-500 transition-colors shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            Voltar para a Vitrine
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 p-16 text-center text-zinc-400">
        <p>Você não possui itens no carrinho para finalizar a compra.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-violet-500"
        >
          Voltar às compras
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <Link href="/cart" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors mb-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Voltar ao Carrinho</span>
          </Link>
          <h1 className="text-2xl font-black text-white">Finalização de Compra</h1>
        </div>

        {checkoutError && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{checkoutError}</span>
          </div>
        )}

        <form onSubmit={handleFinishOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">
          {/* COLUNA ESQUERDA: IDENTIFICAÇÃO E PAGAMENTO */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. DADOS DE CONTATO */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                1. Dados de Entrega e Contato
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Gabriel Toledo"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300">E-mail para Notificações</label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. FORMA DE PAGAMENTO */}
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/80 p-6 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                2. Selecione a Forma de Pagamento
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                    paymentMethod === 'PIX'
                      ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'PIX'}
                      onChange={() => setPaymentMethod('PIX')}
                      className="hidden"
                    />
                    <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">PIX Instantâneo</div>
                      <div className="text-[11px] text-emerald-400 font-semibold">+ 5% de desconto extra</div>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'border-violet-500 bg-violet-500/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                      : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'CREDIT_CARD'}
                      onChange={() => setPaymentMethod('CREDIT_CARD')}
                      className="hidden"
                    />
                    <div className="p-2 rounded-xl bg-zinc-800 text-zinc-300">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Cartão de Crédito</div>
                      <div className="text-[11px] text-zinc-400">Em até 12x sem juros</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: RESUMO E CUPOM */}
          <div className="sticky top-28 space-y-4">
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/90 p-6 space-y-5 backdrop-blur-md">
              <h2 className="text-base font-bold text-white">Resumo do Pedido</h2>

              {/* CAMPO DE CUPOM */}
              <div className="border-b border-zinc-800/80 pb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Cupom (ex: VORTEX10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs uppercase text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none"
                    />
                    <Tag className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-xl border border-zinc-800 bg-zinc-800 px-3.5 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Cupom {appliedCoupon.code} aplicado ({appliedCoupon.discountPercent}% OFF)</span>
                  </div>
                )}
                {couponError && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{couponError}</span>
                  </div>
                )}
              </div>

              {/* DETALHAMENTO DE VALORES */}
              <div className="space-y-2.5 text-xs border-b border-zinc-800/80 pb-4">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal ({items.length} itens)</span>
                  <span className="font-semibold text-zinc-100">{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto Cupom ({appliedCoupon.discountPercent}%)</span>
                    <span>- {formatPrice(couponDiscount)}</span>
                  </div>
                )}
                {paymentMethod === 'PIX' && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Desconto PIX (5%)</span>
                    <span>- {formatPrice(pixDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-400">
                  <span>Frete Express</span>
                  <span className="font-semibold text-emerald-400">GRÁTIS</span>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs uppercase font-bold text-zinc-400">Total a Pagar</span>
                <span className="text-2xl font-black text-white">{formatPrice(totalFinal)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center rounded-xl bg-violet-600 text-xs font-bold text-white hover:bg-violet-500 transition-all shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_25px_rgba(139,92,246,0.55)] active:scale-98 disabled:opacity-50"
              >
                {loading ? 'Processando Pedido...' : 'Confirmar e Finalizar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
