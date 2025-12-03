'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { apiClient } from '@/lib/api';
import { AxiosError } from 'axios';
import { Baby, ShieldCheck } from 'lucide-react';

const fallbackEmail = process.env.NEXT_PUBLIC_DEMO_ADMIN_EMAIL ?? '';
const fallbackPassword = process.env.NEXT_PUBLIC_DEMO_ADMIN_PASSWORD ?? '';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState(fallbackEmail);
  const [password, setPassword] = useState(fallbackPassword);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtitle = useMemo(
    () => 'Espace privé du personnel administratif',
    [],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await apiClient.loginAdmin(email.trim(), password);

      Cookies.set('token', data.accessToken, { expires: 7 });
      Cookies.set('auth_token', data.accessToken, { expires: 7 });

      toast.success('Connexion réussie.');
      // Redirect to dashboard which will handle role-based routing
      router.push('/admin');
    } catch (error) {
      const message =
        error instanceof AxiosError
          ? (error.response?.data as { message?: string })?.message ||
            'Identifiants invalides'
          : 'Impossible de se connecter.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] px-4 py-12">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 rounded-[32px] bg-white/95 p-6 shadow-xl ring-1 ring-black/5 lg:flex-row lg:p-10">
        <section className="flex flex-1 flex-col justify-between rounded-[24px] bg-gradient-to-br from-[#AEDFF7] via-[#B8E986] to-[#FF6F61] p-8 text-[#1C1C1C]">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/60 px-4 py-2 text-sm font-medium text-[#1C1C1C]">
              <ShieldCheck className="h-4 w-4" />
              Portail sécurisé
            </div>
            <h1
              className="text-3xl font-semibold"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Administration de la crèche
            </h1>
            <p className="text-base" style={{ fontFamily: 'var(--font-sans)' }}>
              {subtitle}
            </p>
          </div>

          <div className="mt-10 flex items-center gap-4 rounded-3xl bg-white/70 p-4 text-[#1C1C1C]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#AEDFF7] text-[#1C1C1C]">
              <Baby className="h-7 w-7" />
            </div>
            <div style={{ fontFamily: 'var(--font-sans)' }}>
              <p className="text-sm text-[#4A4A4A]">Support interne</p>
              <p className="text-lg font-semibold">support@wlw.ma</p>
            </div>
          </div>
        </section>

        <section className="flex flex-1 flex-col justify-center rounded-[24px] border border-[#E5E5E5] bg-white p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-[#1C1C1C]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Email administratif
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-[#E0E0E0] bg-[#F5F5F5] px-4 py-3 text-base text-[#1C1C1C] outline-none transition-all focus:border-[#AEDFF7] focus:ring-2 focus:ring-[#AEDFF7]/50"
                style={{ fontFamily: 'var(--font-sans)' }}
                placeholder="exemple@creche.ma"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#1C1C1C]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[#E0E0E0] bg-[#F5F5F5] px-4 py-3 text-base text-[#1C1C1C] outline-none transition-all focus:border-[#FF6F61] focus:ring-2 focus:ring-[#FF6F61]/30"
                style={{ fontFamily: 'var(--font-sans)' }}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-[#FF6F61] py-3 text-lg font-semibold text-white shadow-lg shadow-[#FF6F61]/30 transition-all hover:translate-y-0.5 disabled:opacity-60"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
