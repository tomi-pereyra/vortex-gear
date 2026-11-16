'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { LogIn, Lock, Mail, AlertCircle, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '8551631558-37lnhcok16ad0k19a38hhfncu49jdphh.apps.googleusercontent.com';

function GoogleSignInButton({
  onSuccess,
  onError,
}: {
  onSuccess: (accessToken: string) => void;
  onError: (msg: string) => void;
}) {
  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      onSuccess(tokenResponse.access_token);
    },
    onError: () => {
      onError('Não foi possível conectar com o Google.');
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className="flex w-full h-11 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-850 dark:hover:border-zinc-700 dark:hover:text-white transition-all shadow-sm active:scale-[0.99]"
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.26 21.36 7.33 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.42l4.02-3.13z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
        />
      </svg>
      <span>Continuar com o Google</span>
    </button>
  );
}

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

  const handleGoogleSuccess = async (accessToken: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await api.post('/auth/google', {
        accessToken,
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
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center px-4 py-12 bg-slate-50 dark:bg-zinc-950 transition-colors duration-200">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/90 bg-white/95 dark:border-zinc-800/80 dark:bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl transition-colors duration-200">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Voltar à Loja</span>
            </Link>
          </div>

          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-600/15 text-violet-600 dark:bg-violet-600/20 dark:text-violet-400 border border-violet-500/30 mb-3 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Zap className="h-6 w-6 fill-violet-600 dark:fill-violet-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Entrar na Vortex Gear
            </h1>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-zinc-400">
              Acesse sua conta para acompanhar pedidos ou acessar o painel
            </p>
          </div>

          {error && (
            <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-600 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* BOTÃO GOOGLE SEM BORDA BRANCA INDESEJADA */}
          <div className="mt-6 flex flex-col items-center justify-center">
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={(msg) => setError(msg)}
            />
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
            <span className="text-[11px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              ou com e-mail
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-zinc-800" />
          </div>

          {/* FORMULÁRIO TRADICIONAL */}
          <form onSubmit={handleTraditionalLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                E-mail
              </label>
              <div className="relative mt-1.5">
                <input
                  type="email"
                  required
                  placeholder="admin@vortexgear.com ou cliente@vortexgear.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/70 dark:border-zinc-800 dark:bg-zinc-950 px-3.5 py-2.5 pl-10 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Senha
              </label>
              <div className="relative mt-1.5">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100/70 dark:border-zinc-800 dark:bg-zinc-950 px-3.5 py-2.5 pl-10 text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 dark:text-zinc-500" />
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
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-zinc-800/80 dark:bg-zinc-950/60 p-4 text-[11px] text-slate-600 dark:text-zinc-400 transition-colors">
            <span className="font-bold text-slate-800 dark:text-zinc-200">
              Credenciais pré-configuradas:
            </span>
            <div className="mt-1.5 flex flex-col gap-1 font-mono text-[10px]">
              <div>
                👑 Admin: <span className="text-slate-800 dark:text-zinc-300">admin@vortexgear.com</span> /{' '}
                <span className="text-slate-800 dark:text-zinc-300">admin123</span>
              </div>
              <div>
                🎮 Cliente: <span className="text-slate-800 dark:text-zinc-300">cliente@vortexgear.com</span> /{' '}
                <span className="text-slate-800 dark:text-zinc-300">cliente123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
