"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { siteConfig } from "@/config/site";
import { PasswordInput } from "@/components/ui/password-input";
import { emailRule, passwordRule } from "@/lib/validators/auth";
import { validateAll, validateField } from "@/lib/validators/validators";

type Fields = "email" | "password";
type Values = Record<Fields, string>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  const [values, setValues] = useState<Values>({ email: "", password: "" });
  const [touched, setTouched] = useState<Record<Fields, boolean>>({
    email: false,
    password: false,
  });
  const [errors, setErrors] = useState<Record<Fields, string>>({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (user) router.push(siteConfig.path.dashboard.href);
  }, [user, router]);

  const rules = useMemo(
    () => ({
      email: emailRule<Values>(),
      password: passwordRule<Values>(),
    }),
    [],
  );

  const onChange =
    (name: Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...values, [name]: e.target.value };

      setValues(next);
      const msg = validateField<Values>(name, next, rules);

      setErrors((prev) => ({ ...prev, [name]: msg }));
    };

  const onBlur = (name: Fields) => () => {
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField<Values>(name, values, rules);

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const isFormValid = useMemo(() => {
    const { isValid } = validateAll<Values>(values, rules);
    const allFilled = Object.values(values).every((v) => v.trim());

    return isValid && allFilled;
  }, [values, rules]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // final validation + marquer touché
    const result = validateAll<Values>(values, rules);

    setErrors((prev) => ({ ...prev, ...(result.errors as any) }));
    setTouched({ email: true, password: true });
    if (!result.isValid) return;

    await login(values.email.trim(), values.password);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <form noValidate className="p-6 md:p-8" onSubmit={handleSubmit}>
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
                  aria-describedby="email-error"
                  aria-invalid={!!errors.email || undefined}
                  id="email"
                  placeholder="m@example.com"
                  type="email"
                  value={values.email}
                  onBlur={onBlur("email")}
                  onChange={onChange("email")}
                />
                {touched.email && errors.email && (
                  <p className="text-xs text-destructive" id="email-error">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Link
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                    href={siteConfig.path.forgotPassword.href}
                  >
                    Mot de passe oublié ?
                  </Link>
                </div>
                <PasswordInput
                  required
                  aria-describedby="password-error"
                  aria-invalid={!!errors.password || undefined}
                  id="password"
                  value={values.password}
                  onBlur={onBlur("password")}
                  onChange={onChange("password")}
                />
                {touched.password && errors.password && (
                  <p className="text-xs text-destructive" id="password-error">
                    {errors.password}
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                disabled={loading || !isFormValid}
                type="submit"
              >
                {loading ? "Chargement..." : "Login"}
              </Button>

              <div className="text-center text-sm">
                Pas encore de compte ?{" "}
                <Link
                  className="underline underline-offset-4"
                  href={siteConfig.path.signup.href}
                >
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
