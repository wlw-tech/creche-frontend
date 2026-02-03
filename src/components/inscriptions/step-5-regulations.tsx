"use client"

interface Step5Props {
  formData: any
  updateFormData: (data: any) => void
}

export default function Step5Regulations({ formData, updateFormData }: Step5Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-1">
          <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          Règlement intérieur
        </h2>
        <p className="text-sm text-muted-foreground">Veuillez lire et accepter le règlement intérieur</p>
      </div>

      {/* Regulations Content */}
      <div className="bg-muted/30 border border-border rounded-lg p-6 max-h-96 overflow-y-auto space-y-4 text-sm">
        <section>
          <h3 className="font-semibold text-foreground mb-2">Petitspas - Crèche Maternelle</h3>
          <p className="text-muted-foreground leading-relaxed">
            Petitspas est une crèche maternelle qui accueille les enfants de la Pouponnière à la Moyenne-section. Les
            petits y trouveront un accueil bienveillant et chaleureux, entourés par des adultes passionnés et dévoués.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-2">Les horaires de l'école</h3>
          <p className="text-muted-foreground leading-relaxed">
            Horaires des classes : 8h30 à 11h30 et de 14h à 16h15, du lundi au vendredi. Un service de garde gratuit est
            assuré à partir de 7h45 le matin et jusqu'à 16h45 le soir.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-2">La scolarité</h3>
          <p className="text-muted-foreground leading-relaxed">
            Les frais de scolarité sont à régler par trimestre. Toute absence (même prévisible) durant les périodes
            scolaires ne pourra faire l'objet de réduction sur les frais de scolarité mensuels.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-2">Vaccination & Maladie</h3>
          <p className="text-muted-foreground leading-relaxed">
            Chaque enfant doit être à jour de ses vaccinations. Un enfant fiévreux ou nauséeux ne peut être accepté à
            l'école.
          </p>
        </section>

        <section>
          <h3 className="font-semibold text-foreground mb-2">Sécurité</h3>
          <p className="text-muted-foreground leading-relaxed">
            Je reconnais avoir pris connaissance du règlement intérieur et m'engage à le respecter sans réserve.
          </p>
        </section>
      </div>

      {/* Acceptance Checkbox */}
      <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-border bg-background hover:border-primary/50 transition-colors cursor-pointer">
        <input
          type="checkbox"
          checked={formData.regulationsAccepted}
          onChange={(e) => updateFormData({ regulationsAccepted: e.target.checked })}
          className="w-5 h-5 rounded mt-0.5 accent-secondary flex-shrink-0"
        />
        <span className="text-sm font-medium text-foreground">
          Je reconnais avoir lu et accepté le règlement intérieur de Petitspas et m'engage à le respecter sans réserve.
        </span>
      </label>
    </div>
  )
}
