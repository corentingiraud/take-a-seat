export type Validator<TValues> = (value: string, all: TValues) => string;

export const compose =
  <TValues>(...fns: Validator<TValues>[]): Validator<TValues> =>
  (value, all) => {
    for (const fn of fns) {
      const msg = fn(value, all);

      if (msg) return msg;
    }

    return "";
  };

export const required =
  <TValues>(msg = "Ce champ est requis."): Validator<TValues> =>
  (v) =>
    v?.toString().trim() ? "" : msg;

export const isEmail =
  <TValues>(msg = "Adresse email invalide."): Validator<TValues> =>
  (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : msg;

export const isFRMobile =
  <TValues>(msg = "Numéro de mobile français invalide."): Validator<TValues> =>
  (v) =>
    /^(\+33\s?|0)(6|7)(?:[\s.-]?\d{2}){4}$/.test(v.trim()) ? "" : msg;

export const minLength =
  <TValues>(n: number, msg = `Au moins ${n} caractères.`): Validator<TValues> =>
  (v) =>
    (v ?? "").length >= n ? "" : msg;

export const passwordStrength =
  <TValues>({
    requireLower = true,
    requireUpper = true,
    requireDigit = true,
    requireSpecial = false,
    message = "Mot de passe trop faible.",
  }: {
    requireLower?: boolean;
    requireUpper?: boolean;
    requireDigit?: boolean;
    requireSpecial?: boolean;
    message?: string;
  } = {}): Validator<TValues> =>
  (v) => {
    if (requireLower && !/[a-z]/.test(v)) return message;
    if (requireUpper && !/[A-Z]/.test(v)) return message;
    if (requireDigit && !/\d/.test(v)) return message;
    if (requireSpecial && !/[^\w\s]/.test(v)) return message;

    return "";
  };

export const equalsField =
  <TValues extends Record<string, any>>(
    otherKey: keyof TValues,
    msg = "Les valeurs ne correspondent pas.",
  ): Validator<TValues> =>
  (v, all) =>
    v === (all?.[otherKey] ?? "") ? "" : msg;

export function validateField<TValues extends Record<string, unknown>>(
  name: keyof TValues,
  values: TValues,
  rules: Partial<Record<keyof TValues, Validator<TValues>>>,
): string {
  const rule = rules[name];

  if (!rule) return "";

  return rule(String(values[name] ?? ""), values);
}

export function validateAll<TValues extends Record<string, unknown>>(
  values: TValues,
  rules: Partial<Record<keyof TValues, Validator<TValues>>>,
): { errors: Record<keyof TValues, string>; isValid: boolean } {
  const out = {} as Record<keyof TValues, string>;
  let ok = true;

  (Object.keys(values) as (keyof TValues)[]).forEach((key) => {
    const msg = validateField<TValues>(key, values, rules);

    out[key] = msg || "";
    if (msg) ok = false;
  });

  return { errors: out, isValid: ok };
}
