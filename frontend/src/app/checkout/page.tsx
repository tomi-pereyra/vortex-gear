'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { CreditCard, QrCode, Tag, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';

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
    return <div className="min-h-screen bg-zinc-950 p-8 text-center text-zinc-500">Carregando checkout...</div>;
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
      setCouponError(err.response?.data?.message || 'Cupom inválido.');
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
        <div className="mx-auto max-w-lg rounded-2xl border border-emerald-500/30 bg-zinc-900/90 p-8 text-center shadow-2xl backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-4">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-white">Pedido Confirmado!</h1>
          <p className="mt-2 text-xs text-zinc-400">
            Parabéns! Sua compra foi aprovada e já está sendo preparada pela equipe da Vortex Gear.
          </p>

          <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-zinc-500">ID do Pedido:</span>
              <span className="font-mono text-zinc-300">{orderSuccess.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Cliente:</span>
              <span className="text-zinc-300">{orderSuccess.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Pagamento:</span>
              <span className="text-emerald-400 font-bold">{orderSuccess.paymentMethod}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-800 pt-2 font-bold">
              <span className="text-white">Valor Pago:</span>
              <span className="text-emerald-400 text-sm">{formatPrice(orderSuccess.totalAmount)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors"
          >
            Voltar à Loja
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 p-16 text-center text-zinc-400">
        <p>Você não possui itens no carrinho para finalizar a compra.</p>
        <button
          onClick={() => router.push('/')}
          className="mt-4 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400"
        >
          Ir às compras
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-black text-white">Checkout Seguro</h1>

        {checkoutError && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{checkoutError}</span>
          </div>
        )}

        <form onSubmit={handleFinishOrder} className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* DADOS DO CLIENTE E PAGAMENTO */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                1. Informações de Contato
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300">E-mail</label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 text-xs text-zinc-100 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* FORMAS DE PAGAMENTO */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
                2. Forma de Pagamento
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    paymentMethod === 'PIX'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
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
                    <QrCode className="h-5 w-5 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-white">PIX Instantâneo</div>
                      <div className="text-[11px] text-emerald-400 font-semibold">+ 5% de desconto extra</div>
                    </div>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
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
                    <CreditCard className="h-5 w-5 text-zinc-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Cartão de Crédito</div>
                      <div className="text-[11px] text-zinc-500">Em até 12x sem juros</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* RESUMO E CUPOM */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 space-y-4">
              <h2 className="text-base font-bold text-white">Resumo do Pedido</h2>

              {/* APLICAR CUPOM */}
              <div className="border-b border-zinc-800 pb-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Cupom (ex: VORTEX10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs uppercase text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                    />
                    <Tag className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="rounded-xl border border-zinc-800 bg-zinc-800 px-3 py-2 text-xs font-bold text-zinc-200 hover:bg-zinc-700"
                  >
                    Aplicar
                  </button>
                </div>

                {appliedCoupon && (
                  <div className="mt-2 text-[11px] text-emerald-400 font-semibold">
                    ✅ Cupom {appliedCoupon.code} aplicado ({appliedCoupon.discountPercent}% OFF)
                  </div>
                )}
                {couponError && (
                  <div className="mt-2 text-[11px] text-red-400">
                    ❌ {couponError}
                  </div>
                )}
              </div>

              {/* DETALHES DE VALORES */}
              <div className="space-y-2 text-xs border-b border-zinc-800 pb-4">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal ({items.length} itens)</span>
                  <span className="font-semibold text-zinc-200">{formatPrice(subtotal)}</span>
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
                  <span>Frete</span>
                  <span className="font-semibold text-emerald-400">GRÁTIS</span>
                </div>
              </div>

              <div className="flex justify-between text-sm font-bold text-white">
                <span>Total a Pagar</span>
                <span className="text-xl text-emerald-400">{formatPrice(totalFinal)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 py-3 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors disabled:opacity-50 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              >
                {loading ? 'Processando Pedido...' : 'Confirmar e Finalizar Compra'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

