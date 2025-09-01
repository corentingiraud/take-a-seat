"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { PasswordInput } from "@/components/ui/password-input";
import {
  compose,
  required,
  validateAll,
  validateField,
} from "@/lib/validators/validators";
import {
  frMobileRule,
  emailRule,
  passwordRule,
  confirmPasswordRule,
} from "@/lib/validators/auth";

type Fields = "password" | "confirm";
type Values = Record<Fields, string>;

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user, loading, resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const code = useMemo(() => searchParams.get("code") ?? "", [searchParams]);

  const [values, setValues] = useState<Values>({ password: "", confirm: "" });
  const [touched, setTouched] = useState<Record<Fields, boolean>>({
    password: false,
    confirm: false,
  });
  const [errors, setErrors] = useState<Record<Fields | "general", string>>({
    password: "",
    confirm: "",
    general: "",
  });

  useEffect(() => {
    if (user) router.push(siteConfig.path.dashboard.href);
  }, [user, router]);

  const rules = useMemo(
    () => ({
      firstName: compose(required<Values>("Le prénom est requis.")),
      lastName: compose(required<Values>("Le nom est requis.")),
      phone: frMobileRule<Values>(),
      email: emailRule<Values>(),
      password: passwordRule<Values>(),
      confirmPassword: confirmPasswordRule<Values>("password"),
    }),
    [],
  );

  const onChange =
    (name: Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...values, [name]: e.target.value };

      setValues(next);
      const msg = validateField<Values>(name, next, rules);

      setErrors((prev) => ({ ...prev, [name]: msg }));

      // si password bouge, on revalide confirm si déjà touché
      if (name === "password" && touched.confirm) {
        const cm = validateField<Values>("confirm", next, rules);

        setErrors((prev) => ({ ...prev, confirm: cm }));
      }
    };

  const onBlur = (name: Fields) => () => {
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField<Values>(name, values, rules);

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const isFormValid = useMemo(() => {
    const { isValid } = validateAll<Values>(values, rules);
    const allFilled = Object.values(values).every((v) => v.trim());

    return isValid && allFilled && Boolean(code);
  }, [values, rules, code]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // final validation + marquer touché
    const result = validateAll<Values>(values, rules);

    setErrors((prev) => ({ ...prev, ...(result.errors as any) }));
    setTouched({ password: true, confirm: true });

    if (!code) {
      setErrors((prev) => ({
        ...prev,
        general: "Lien invalide ou expiré : aucun code trouvé dans l’URL.",
      }));

      return;
    }

    if (!result.isValid) return;

    await resetPassword(code, values.password, values.confirm);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <form noValidate className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  Réinitialiser le mot de passe
                </h1>
                <p className="text-balance text-muted-foreground">
                  Choisis un nouveau mot de passe pour ton compte.
                </p>
                {(!code || errors.general) && (
                  <p className="mt-3 text-sm text-red-600">
                    {errors.general ||
                      "Lien invalide ou expiré : aucun code trouvé dans l’URL."}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <PasswordInput
                  required
                  aria-describedby="password-error"
                  aria-invalid={!!errors.password || undefined}
                  autoComplete="new-password"
                  id="password"
                  value={values.password}
                  onBlur={onBlur("password")}
                  onChange={onChange("password")}
                />
                {touched.password && errors.password && (
                  <p className="text-sm text-red-600" id="password-error">
                    {errors.password}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Minimum 8 caractères, avec au moins 1 lettre min, 1 lettre maj
                  et 1 chiffre.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <PasswordInput
                  required
                  aria-describedby="confirm-error"
                  aria-invalid={!!errors.confirm || undefined}
                  autoComplete="new-password"
                  id="confirm"
                  value={values.confirm}
                  onBlur={onBlur("confirm")}
                  onChange={onChange("confirm")}
                />
                {touched.confirm && errors.confirm && (
                  <p className="text-sm text-red-600" id="confirm-error">
                    {errors.confirm}
                  </p>
                )}
              </div>

              <Button
                className="w-full"
                disabled={loading || !isFormValid}
                type="submit"
              >
                {loading
                  ? "Réinitialisation..."
                  : "Mettre à jour le mot de passe"}
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
