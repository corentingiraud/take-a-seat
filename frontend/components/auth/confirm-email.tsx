"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

type Props = React.ComponentProps<"div">;

export function ConfirmEmail({ className, ...props }: Props) {
  const router = useRouter();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <div className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center gap-4">
              <h1 className="text-2xl font-bold">E-mail confirmé</h1>
              <p className="text-balance text-green-600">
                Ton adresse e-mail est vérifiée. Tu peux maintenant te
                connecter.
              </p>
              <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                <Button
                  className="w-full sm:w-auto"
                  onClick={() => router.push(siteConfig.path.login.href)}
                >
                  Se connecter
                </Button>
                <Link
                  className="text-sm underline underline-offset-4 self-center"
                  href="/"
                >
                  Retour à l’accueil
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
