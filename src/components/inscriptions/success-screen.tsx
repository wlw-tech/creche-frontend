import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function SuccessScreen() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-20 min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md p-8 text-center border-2 border-border/50">
        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-secondary" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">Inscription réussie !</h1>
        <p className="text-muted-foreground mb-8">
          Votre demande d'inscription a été soumise avec succès. Nous vous contacterons bientôt.
        </p>

        <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/">Retour à l'accueil</Link>
        </Button>
      </Card>
    </div>
  )
}
