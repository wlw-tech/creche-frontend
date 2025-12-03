'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Baby, FileText, Users, Calendar } from 'lucide-react';

export default function InscriptionsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      // Simuler une soumission de candidature
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Candidature soumise avec succès!');
      // Rediriger vers une page de confirmation
      router.push('/confirmation');
    } catch (error) {
      toast.error('Erreur lors de la soumission de la candidature');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-primary/20 to-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Candidature d'Inscription
            </h1>
            <p className="text-lg text-muted-foreground">
              Remplissez le formulaire ci-dessous pour inscrire votre enfant à notre crèche
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center">
                <FileText className="mr-2 h-6 w-6 text-primary" />
                Formulaire de Candidature
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom de l'enfant
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Entrez le nom de l'enfant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Date de naissance
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nom du parent/tuteur
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Entrez votre nom complet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="votre@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="+212 6XX XXX XXX"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSubmitting ? 'Soumission en cours...' : 'Soumettre la candidature'}
                </Button>
              </form>
            </Card>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Baby className="mr-2 h-5 w-5 text-primary" />
                  Notre Crèche
                </h3>
                <p className="text-muted-foreground mb-4">
                  Nous offrons un environnement sûr et stimulant pour le développement de votre enfant.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Personnel qualifié et expérimenté
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Activités éducatives variées
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Repas équilibrés et sains
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                    Sécurité et bien-être prioritaires
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-primary" />
                  Processus d'Inscription
                </h3>
                <ol className="space-y-2 text-sm">
                  <li>1. Remplir le formulaire de candidature</li>
                  <li>2. Soumission des documents requis</li>
                  <li>3. Entretien avec les parents</li>
                  <li>4. Confirmation d'inscription</li>
                </ol>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Contact
                </h3>
                <p className="text-sm text-muted-foreground">
                  Pour toute question concernant les inscriptions, n'hésitez pas à nous contacter :
                </p>
                <div className="mt-4 space-y-2 text-sm">
                  <p><strong>Téléphone:</strong> +212 5XX XXX XXX</p>
                  <p><strong>Email:</strong> info@creche-saas.com</p>
                  <p><strong>Horaires:</strong> Lun-Ven 8h-18h</p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
