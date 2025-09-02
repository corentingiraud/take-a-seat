import { Metadata } from "next";

import { ResetPasswordForm } from "@/components/auth/forms/reset-password";

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full md:max-w-xl">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
