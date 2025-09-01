// src/lib/validators/auth.ts
import {
  compose,
  required,
  isEmail,
  minLength,
  passwordStrength,
  equalsField,
  type Validator,
} from "@/lib/validators/validators";

export const emailRule = <T extends Record<string, any>>(msgs?: {
  required?: string;
  invalid?: string;
}): Validator<T> =>
  compose<T>(
    required<T>(msgs?.required ?? "L'email est requis."),
    isEmail<T>(msgs?.invalid ?? "Adresse email invalide."),
  );

export const passwordRule = <T extends Record<string, any>>(msgs?: {
  required?: string;
  tooShort?: string;
  weak?: string;
}): Validator<T> =>
  compose<T>(
    required<T>(msgs?.required ?? "Le mot de passe est requis."),
    minLength<T>(8, msgs?.tooShort ?? "Au moins 8 caractères."),
    passwordStrength<T>({
      requireLower: true,
      requireUpper: true,
      requireDigit: true,
      requireSpecial: false,
      message:
        msgs?.weak ??
        "Doit contenir au moins 1 lettre min, 1 lettre maj et 1 chiffre.",
    }),
  );

export const confirmPasswordRule = <T extends Record<string, any>>(
  passwordKey: keyof T = "password" as keyof T,
  msg = "Les mots de passe ne correspondent pas.",
): Validator<T> =>
  compose<T>(
    required<T>("La confirmation est requise."),
    equalsField<T>(passwordKey, msg),
  );

export const frMobileRule = <T extends Record<string, any>>(msgs?: {
  required?: string;
  invalid?: string;
}): Validator<T> =>
  compose<T>(
    required<T>(msgs?.required ?? "Le numéro de téléphone est requis."),
    ((v) =>
      /^(\+33\s?|0)(6|7)(?:[\s.-]?\d{2}){4}$/.test(String(v).trim())
        ? ""
        : (msgs?.invalid ??
          "Numéro de mobile français invalide.")) as Validator<T>,
  );
