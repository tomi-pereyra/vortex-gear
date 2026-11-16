'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { ShieldAlert, DollarSign, Package, Users, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  const [stats, setStats] = useState<any | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (!isAdmin()) {
      router.push('/login');
      return;
    }

    async function loadAdminData() {
      try {
        setLoading(true);
        const [statsRes, ordersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/orders'),
        ]);

        setStats(statsRes.data);
        setOrders(ordersRes.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Falha ao carregar dados do painel.');
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [mounted, isAdmin, router]);

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val || 0);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 p-12 text-center text-zinc-500">
        Carregando painel de controle administrativo...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 p-12 text-center text-red-400">
        <ShieldAlert className="mx-auto h-12 w-12 mb-3" />
        <p>{error}</p>
        <Link href="/" className="mt-4 inline-block text-xs text-zinc-400 hover:text-white">
          Voltar para a Loja
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-purple-500/20 border border-purple-500/50 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                ADMIN CONSOLE
              </span>
              <h1 className="text-2xl font-black text-white">Painel Vortex Gear</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Gerencie métricas financeiras, inventário e pedidos em tempo real
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar à Vitrine</span>
          </Link>
        </div>

        {/* MÉTRICAS EM CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold">Faturamento Total</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-400">
              {formatPrice(stats?.totalRevenue)}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">
              Descontos concedidos: {formatPrice(stats?.totalDiscountsGiven)}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold">Total de Pedidos</span>
              <Package className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {stats?.totalOrders}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">Pedidos finalizados</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold">Clientes Cadastrados</span>
              <Users className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-white">
              {stats?.totalUsers}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">Usuários na plataforma</p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
            <div className="flex items-center justify-between text-zinc-400">
              <span className="text-xs font-semibold">Alerta de Estoque</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-400">
              {stats?.lowStockProducts?.length || 0}
            </div>
            <p className="mt-1 text-[11px] text-zinc-500">Produtos com ≤ 5 unidades</p>
          </div>
        </div>

        {/* LISTA DE PEDIDOS RECENTES */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <h2 className="text-base font-bold text-white mb-4">Pedidos Realizados</h2>

          {orders.length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">Nenhum pedido registrado ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400">
                    <th className="pb-3 font-semibold">ID / Data</th>
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Método</th>
                    <th className="pb-3 font-semibold">Itens</th>
                    <th className="pb-3 font-semibold">Total</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-zinc-800/30">
                      <td className="py-3 font-mono text-[11px] text-zinc-400">
                        <div>{order.id.slice(0, 8)}...</div>
                        <div className="text-[10px] text-zinc-500">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="py-3 font-medium text-zinc-200">
                        <div>{order.customerName}</div>
                        <div className="text-[10px] text-zinc-500">{order.customerEmail}</div>
                      </td>
                      <td className="py-3">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-300">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-400">
                        {order.items?.length || 0} produto(s)
                      </td>
                      <td className="py-3 font-bold text-emerald-400">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="py-3">
                        <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

