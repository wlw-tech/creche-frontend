'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { AxiosError } from 'axios';
import { Baby, ShieldCheck } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

export default function UserLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const { data } = await apiClient.loginUser(email.trim(), password);

      // On suppose que l'API renvoie { accessToken, userId, role, email }
      const { accessToken, role } = data;

      Cookies.set('token', accessToken, { expires: 7 });
      Cookies.set('auth_token', accessToken, { expires: 7 });

      toast.success('Connexion réussie.');

      // Redirection selon le rôle
      if (role === 'PARENT') {
        router.push('/parent');
      } else if (role === 'ENSEIGNANT') {
        // TODO: changer si tu ajoutes un dashboard enseignant dédié
        router.push('/teacher');
      } else {
        // Fallback : on renvoie sur la page d'accueil publique
        router.push('/');
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
            <Baby className="h-7 w-7 text-primary" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Connexion
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px bg-white/70 backdrop-blur border border-gray-100 p-6 rounded-xl space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="vous@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                placeholder="Mot de passe temporaire reçu par email"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <p className="text-xs text-gray-500">Identifiants fournis par l'administration.</p>
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center justify-center rounded-full bg-primary/20 p-1">
                <ShieldCheck className="h-4 w-4 text-primary/100" />
              </span>
              {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </button>

            <p className="text-center text-xs text-gray-500">
              Besoin d'aide ? Contactez l'administration de la crèche.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
