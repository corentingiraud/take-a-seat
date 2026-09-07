"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { validateAll, validateField } from "@/lib/validators/validators";
import { emailRule } from "@/lib/validators/auth";
import HCaptchaWidget from "@/components/security/hcaptcha-widget";

type Fields = "email";
type Values = Record<Fields, string>;

export function ResendConfirmationForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { resendConfirmation, loading } = useAuth();
  const searchParams = useSearchParams();

  const [values, setValues] = useState<Values>({
    email: searchParams.get("email") ?? "",
  });
  const [touched, setTouched] = useState<Record<Fields, boolean>>({
    email: false,
  });
  const [errors, setErrors] = useState<Record<Fields, string>>({
    email: "",
  });
  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null);

  const rules = useMemo(
    () => ({
      email: emailRule<Values>(),
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const result = validateAll<Values>(values, rules);

    setErrors(result.errors);
    setTouched({ email: true });
    if (!result.isValid) return;

    if (!hCaptchaToken) return;

    await resendConfirmation(values.email.trim(), hCaptchaToken);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <form noValidate className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">
                  E-mail de confirmation non reçu
                </h1>
                <p className="text-balance text-muted-foreground">
                  Entrez votre email pour recevoir un nouveau lien de
                  confirmation
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

              <HCaptchaWidget
                className="self-center"
                onChange={setHCaptchaToken}
              />

              <Button
                className="w-full"
                disabled={loading || !isFormValid}
                type="submit"
              >
                {loading ? "Envoi en cours..." : "Renvoyer l'e-mail"}
              </Button>

              <div className="text-center text-sm">
                Adresse déjà confirmée ?{" "}
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
