"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo, useRef } from "react";

import { cn, normalizePhone } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { User } from "@/models/user";
import { PasswordInput } from "@/components/ui/password-input";
import {
  compose,
  required,
  isMobile,
  isEmail,
  minLength,
  passwordStrength,
  equalsField,
  validateField,
  validateAll,
  Validator,
} from "@/lib/validators/validators";
import HCaptchaWidget from "@/components/security/hcaptcha-widget";

type Fields =
  | "firstName"
  | "lastName"
  | "phone"
  | "email"
  | "password"
  | "confirmPassword";

type Values = Record<Fields, string>;

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user, signup, loading } = useAuth();
  const router = useRouter();

  const [captchaKey, setCaptchaKey] = useState(0);
  const prevLoading = useRef<boolean>(loading);

  const [values, setValues] = useState<Values>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState<Record<Fields, boolean>>({
    firstName: false,
    lastName: false,
    phone: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const [errors, setErrors] = useState<Record<Fields, string>>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [hCaptchaToken, setHCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    if (user) router.push(siteConfig.path.dashboard.href);
  }, [user, router]);

  useEffect(() => {
    if (prevLoading.current && !loading) {
      setHCaptchaToken(null);
      setCaptchaKey((k) => k + 1);
    }
    prevLoading.current = loading;
  }, [loading]);

  const rules = useMemo<Partial<Record<Fields, Validator<Values>>>>(
    () => ({
      firstName: compose(required("Le prénom est requis.")),
      lastName: compose(required("Le nom est requis.")),
      phone: compose(
        required("Le numéro de téléphone est requis."),
        isMobile(),
      ),
      email: compose(required("L'email est requis."), isEmail()),
      password: compose(
        minLength<Values>(8),
        passwordStrength<Values>({
          requireLower: true,
          requireUpper: true,
          requireDigit: true,
          requireSpecial: false,
          message: "Doit contenir des minuscules, majuscules et chiffres.",
        }),
      ),
      confirmPassword: compose(
        required("La confirmation est requise."),
        equalsField<Values>(
          "password",
          "Les mots de passe ne correspondent pas.",
        ),
      ),
    }),
    [],
  );

  const onChange =
    (name: Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = { ...values, [name]: e.target.value };

      setValues(next);

      // live validation champ + cascade confirmPassword si password bouge
      const msg = validateField<Values>(name, next, rules);

      setErrors((prev) => ({ ...prev, [name]: msg }));

      if (name === "password" && touched.confirmPassword) {
        const cpMsg = validateField<Values>("confirmPassword", next, rules);

        setErrors((prev) => ({ ...prev, confirmPassword: cpMsg }));
      }
    };

  const onBlur = (name: Fields) => () => {
    setTouched((t) => ({ ...t, [name]: true }));
    const msg = validateField<Values>(name, values, rules);

    setErrors((prev) => ({ ...prev, [name]: msg }));
  };

  const isFormValid = useMemo(() => {
    const { isValid } = validateAll<Values>(values, rules);
    // en plus de la validation, on évite les champs vides
    const allFilled = Object.values(values).every((v) => v.trim());

    return isValid && allFilled;
  }, [values, rules]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // final validation
    const result = validateAll<Values>(values, rules);

    setErrors((prev) => ({ ...prev, ...(result.errors as any) }));

    // mark all as touched to afficher toutes les erreurs
    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!result.isValid) return;

    if (!hCaptchaToken) return;

    const { firstName, lastName, phone, email, password } = values;

    const newUser = new User({
      username: email,
      email,
      confirmed: false,
      blocked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: normalizePhone(phone),
    });

    await signup(newUser, password, hCaptchaToken);
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0">
          <form noValidate className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-8">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Bienvenue 👋</h1>
                <p className="text-balance text-muted-foreground">
                  Crée ton compte pour accéder à l’espace de réservation
                </p>
              </div>

              {/* First name */}
              <div className="grid gap-2">
                <Label htmlFor="first-name">Prénom</Label>
                <Input
                  required
                  aria-describedby="first-name-error"
                  aria-invalid={!!errors.firstName || undefined}
                  id="first-name"
                  name="firstName"
                  placeholder="Jean"
                  type="text"
                  value={values.firstName}
                  onBlur={onBlur("firstName")}
                  onChange={onChange("firstName")}
                />
                {touched.firstName && errors.firstName && (
                  <p className="text-xs text-destructive" id="first-name-error">
                    {errors.firstName}
                  </p>
                )}
              </div>

              {/* Last name */}
              <div className="grid gap-2">
                <Label htmlFor="last-name">Nom</Label>
                <Input
                  required
                  aria-describedby="last-name-error"
                  aria-invalid={!!errors.lastName || undefined}
                  id="last-name"
                  name="lastName"
                  placeholder="Dupont"
                  type="text"
                  value={values.lastName}
                  onBlur={onBlur("lastName")}
                  onChange={onChange("lastName")}
                />
                {touched.lastName && errors.lastName && (
                  <p className="text-xs text-destructive" id="last-name-error">
                    {errors.lastName}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="grid gap-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input
                  required
                  aria-describedby="phone-error"
                  aria-invalid={!!errors.phone || undefined}
                  id="phone"
                  name="phone"
                  placeholder="0612345678"
                  type="tel"
                  value={values.phone}
                  onBlur={onBlur("phone")}
                  onChange={onChange("phone")}
                />
                {touched.phone && errors.phone && (
                  <p className="text-xs text-destructive" id="phone-error">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  required
                  aria-describedby="email-error"
                  aria-invalid={!!errors.email || undefined}
                  id="email"
                  name="email"
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

              {/* Password */}
              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <PasswordInput
                  required
                  aria-describedby="password-error"
                  aria-invalid={!!errors.password || undefined}
                  id="password"
                  name="password"
                  value={values.password}
                  onBlur={onBlur("password")}
                  onChange={onChange("password")}
                />
                {touched.password && errors.password && (
                  <p className="text-xs text-destructive" id="password-error">
                    {errors.password}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Minimum 8 caractères, avec minuscules, majuscules et chiffres.
                </p>
              </div>

              {/* Confirm password */}
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">
                  Confirmer le mot de passe
                </Label>
                <PasswordInput
                  required
                  aria-describedby="confirm-password-error"
                  aria-invalid={!!errors.confirmPassword || undefined}
                  id="confirm-password"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onBlur={onBlur("confirmPassword")}
                  onChange={onChange("confirmPassword")}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p
                    className="text-xs text-destructive"
                    id="confirm-password-error"
                  >
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <HCaptchaWidget
                key={captchaKey}
                className="self-center"
                onChange={setHCaptchaToken}
              />

              <Button
                className="w-full"
                disabled={loading || !isFormValid}
                type="submit"
              >
                {loading ? "Chargement..." : "S'inscrire"}
              </Button>

              <div className="text-center text-sm">
                Déjà un compte ?{" "}
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
