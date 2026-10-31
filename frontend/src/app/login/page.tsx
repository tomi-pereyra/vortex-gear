'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/useAuthStore';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

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
      <div className="flex min-h-[calc(100vh-120px)] items-center justify-center px-4 py-12 bg-zinc-950">
        <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center">
            <h1 className="text-2xl font-black text-white">Acessar Conta</h1>
            <p className="mt-1 text-xs text-zinc-400">
              Faça login para acompanhar seus pedidos e finalizar compras
            </p>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN GOOGLE */}
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

          {/* FORMULÁRIO LOCAL */}
          <form onSubmit={handleTraditionalLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                E-mail
              </label>
              <div className="relative mt-1">
                <input
                  type="email"
                  required
                  placeholder="admin@vortexgear.com ou cliente@vortexgear.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 pl-10 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                />
                <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300">
                Senha
              </label>
              <div className="relative mt-1">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2 pl-10 text-sm text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
                />
                <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-500" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-zinc-950 hover:bg-emerald-400 transition-colors disabled:opacity-50"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? 'Entrando...' : 'Entrar na Vortex Gear'}</span>
            </button>
          </form>

          {/* CREDENCIAIS DE TESTE */}
          <div className="mt-6 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 text-[11px] text-zinc-400">
            <span className="font-bold text-zinc-300">Contas de teste padrão:</span>
            <div className="mt-1 flex flex-col gap-0.5">
              <span>👑 Admin: <code>admin@vortexgear.com</code> / <code>admin123</code></span>
              <span>🎮 Cliente: <code>cliente@vortexgear.com</code> / <code>cliente123</code></span>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

