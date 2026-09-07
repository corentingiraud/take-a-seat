import { Metadata } from "next";

import { ResendConfirmationForm } from "@/components/auth/forms/resend-confirmation";

export const metadata: Metadata = {
  title: "Renvoyer l'e-mail de confirmation",
};

export default function ResendConfirmationPage() {
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full md:max-w-xl">
        <ResendConfirmationForm />
      </div>
    </div>
  );
}
