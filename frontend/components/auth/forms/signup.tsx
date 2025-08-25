"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/auth-context";
import { User } from "@/models/user";

type Fields =
  | "firstName"
  | "lastName"
  | "phone"
  | "email"
  | "password"
  | "confirmPassword";

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { user, signup, loading } = useAuth();
  const router = useRouter();

  const [values, setValues] = useState<Record<Fields, string>>({
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

  useEffect(() => {
    if (user) {
      router.push(siteConfig.path.dashboard.href);
    }
  }, [user, router]);

  // --- validation rules (defaults; tweak as you like) ---
  const validators: Record<Fields, (v: string, all: typeof values) => string> =
    {
      firstName: (v) => (v.trim() ? "" : "Le prénom est requis."),
      lastName: (v) => (v.trim() ? "" : "Le nom est requis."),
      phone: (v) => {
        if (!v.trim()) return "Le numéro de téléphone est requis.";
        // FR mobile: +33 6/7 xx xx xx xx or 06/07 xx xx xx xx
        const frMobile = /^(\+33\s?|0)(6|7)(?:[\s.-]?\d{2}){4}$/;

        return frMobile.test(v.trim())
          ? ""
          : "Numéro de mobile français invalide.";
      },
      email: (v) => {
        if (!v.trim()) return "L'email est requis.";
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

        return ok ? "" : "Adresse email invalide.";
      },
      password: (v) => {
        if (v.length < 8) return "Au moins 8 caractères.";
        const mix = /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v);

        return mix
          ? ""
          : "Doit contenir des minuscules, majuscules et chiffres.";
      },
      confirmPassword: (v, all) =>
        v === all.password ? "" : "Les mots de passe ne correspondent pas.",
    };

  const validateField = useCallback(
    (name: Fields, value: string, nextValues?: typeof values) => {
      const all = nextValues ?? values;
      const msg = validators[name](value, all);

      setErrors((prev) => ({ ...prev, [name]: msg }));

      // also re-validate confirmPassword when password changes
      if (name === "password" && touched.confirmPassword) {
        const cpMsg = validators.confirmPassword(all.confirmPassword, {
          ...all,
          password: value,
        });

        setErrors((prev) => ({ ...prev, confirmPassword: cpMsg }));
      }

      return msg;
    },
    [validators, values, touched.confirmPassword],
  );

  const handleChange =
    (name: Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const next = { ...values, [name]: value };

      setValues(next);
      // live validation
      validateField(name, value, next);
    };

  const handleBlur = (name: Fields) => () => {
    setTouched((t) => ({ ...t, [name]: true }));
    validateField(name, values[name]);
  };

  const formHasErrors =
    Object.values(errors).some(Boolean) ||
    Object.values(values).some((v) => !v.trim());

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // touch all & final validate
    const allTouched: Partial<Record<Fields, boolean>> = {};

    (Object.keys(values) as Fields[]).forEach((k) => (allTouched[k] = true));
    setTouched((t) => ({ ...t, ...(allTouched as Record<Fields, boolean>) }));

    let anyError = false;
    const nextErrors: Partial<Record<Fields, string>> = {};

    (Object.keys(values) as Fields[]).forEach((k) => {
      const msg = validators[k](values[k], values);

      nextErrors[k] = msg;
      if (msg) anyError = true;
    });
    setErrors((prev) => ({
      ...prev,
      ...(nextErrors as Record<Fields, string>),
    }));
    if (anyError) return;

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
      phone: phone.trim(),
    });

    await signup(newUser, password);
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
                  onBlur={handleBlur("firstName")}
                  onChange={handleChange("firstName")}
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
                  onBlur={handleBlur("lastName")}
                  onChange={handleChange("lastName")}
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
                  placeholder="+33 6 12 34 56 78"
                  type="tel"
                  value={values.phone}
                  onBlur={handleBlur("phone")}
                  onChange={handleChange("phone")}
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
                  onBlur={handleBlur("email")}
                  onChange={handleChange("email")}
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
                <Input
                  required
                  aria-describedby="password-error"
                  aria-invalid={!!errors.password || undefined}
                  id="password"
                  name="password"
                  type="password"
                  value={values.password}
                  onBlur={handleBlur("password")}
                  onChange={handleChange("password")}
                />
                {touched.password && errors.password && (
                  <p className="text-xs text-destructive" id="password-error">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">
                  Confirmer le mot de passe
                </Label>
                <Input
                  required
                  aria-describedby="confirm-password-error"
                  aria-invalid={!!errors.confirmPassword || undefined}
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  value={values.confirmPassword}
                  onBlur={handleBlur("confirmPassword")}
                  onChange={handleChange("confirmPassword")}
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

              <Button
                className="w-full"
                disabled={loading || formHasErrors}
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
