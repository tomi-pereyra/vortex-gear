'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { LogIn, Lock, Mail, AlertCircle, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '8551631558-37lnhcok16ad0k19a38hhfncu49jdphh.apps.googleusercontent.com';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTraditionalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      setAuth(response.data.user, response.data.token);
      router.push('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Falha na autenticação. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/google', {
        credential: credentialResponse.credential,
      });

      setAuth(response.data.user, response.data.token);
      router.push('/');
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          'Erro ao autenticar com o Google. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 bg-zinc-950">
        <div className="w-full max-w-md rounded-3xl border border-zinc-800/80 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar à Loja</span>
            </Link>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/20 text-violet-400 border border-violet-500/30 mb-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Zap className="h-6 w-6 fill-violet-400" />
            </div>
            <h1 className="text-2xl font-black text-white">Entrar na Vortex Gear</h1>
            <p className="mt-1.5 text-xs text-zinc-400">
              Acesse sua conta para acompanhar pedidos ou acessar o painel
            </p>
          </div>

          {error && (
            <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* BOTÃO GOOGLE */}
          <div className="mt-6 flex flex-col items-center justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Não foi possível conectar com o Google.')}
              theme="filled_black"
              shape="pill"
              size="large"
              text="signin_with"
            />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
              ou com e-mail
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          {/* FORMULÁRIO TRADICIONAL */}
          <form onSubmit={handleTraditionalLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                E-mail
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  required
                  placeholder="admin@vortexgear.com ou cliente@vortexgear.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 pl-10 text-xs text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                Senha
              </label>
              <div className="relative mt-1.5">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 pl-10 text-xs text-zinc-100 placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 text-xs font-bold text-white hover:bg-violet-500 transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? 'Autenticando...' : 'Entrar na Conta'}</span>
            </button>
          </form>

          {/* DICA DE CREDENCIAIS PRÉ-CONFIGURADAS */}
          <div className="mt-6 rounded-2xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-[11px] text-zinc-400">
            <span className="font-bold text-zinc-200">Credenciais pré-configuradas:</span>
            <div className="mt-1.5 flex flex-col gap-1 font-mono text-[10px]">
              <div>👑 Admin: <span className="text-zinc-300">admin@vortexgear.com</span> / <span className="text-zinc-300">admin123</span></div>
              <div>🎮 Cliente: <span className="text-zinc-300">cliente@vortexgear.com</span> / <span className="text-zinc-300">cliente123</span></div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
