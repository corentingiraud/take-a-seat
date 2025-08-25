"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push(siteConfig.path.dashboard.href);
    }
  }, [user, router]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <form className="p-6 md:p-8">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Mot de passe oublié</h1>
                <p className="text-balance text-muted-foreground">
                  Entrez votre email pour recevoir un lien de réinitialisation
                  de mot de passe
                </p>
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
              <Button className="w-full" type="submit">
                Réinitialiser le mot de passe
              </Button>
              <div className="text-center text-sm">
                Tu te souviens de ton mot de passe ?{" "}
                <Link
                  className="underline underline-offset-4"
                  href={siteConfig.path.login.href}
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
