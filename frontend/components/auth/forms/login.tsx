"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useLogin } from "@/hooks/use-login";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login: authLogin } = useAuth();
  const { login, isLoading } = useLogin();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = await login(email, password);

      if (!token) {
        throw new Error();
      }
      authLogin(token);
      toast.success("Connexion réussie");
      router.push("/my-bookings");
    } catch {
      toast.error("Echec de la connexion. Veuillez essayer de nouveau.");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Salut 👋</h1>
                <p className="text-balance text-muted-foreground">
                  Connecte toi à ton espace de reservation
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  required
                  id="email"
                  placeholder="m@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    href="/forgot-password"
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <Input
                  required
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" disabled={isLoading} type="submit">
                {isLoading ? "Chargement..." : "Login"}
              </Button>
              <div className="text-center text-sm">
                Pas encore de compte ?{" "}
                <Link className="underline underline-offset-4" href="/signup">
                  Créer un compte
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
