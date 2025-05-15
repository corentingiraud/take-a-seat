import Link from "next/link";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bienvenue 👋</h1>
                <p className="text-balance text-muted-foreground">
                  Crée ton compte pour accéder à l’espace de réservation
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="first-name">Prénom</Label>
                <Input
                  required
                  id="first-name"
                  placeholder="Jean"
                  type="text"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Nom</Label>
                <Input
                  required
                  id="last-name"
                  placeholder="Dupont"
                  type="text"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  required
                  id="phone"
                  placeholder="+33 6 12 34 56 78"
                  type="tel"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  required
                  id="email"
                  placeholder="m@example.com"
                  type="email"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input required id="password" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">
                  Confirmer le mot de passe
                </Label>
                <Input required id="confirm-password" type="password" />
              </div>
              <Button className="w-full" type="submit">
                S&apos;inscrire
              </Button>
              <div className="text-center text-sm">
                Déjà un compte ?{" "}
                <Link
                  className="underline underline-offset-4"
                  href={siteConfig.path.login}
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
