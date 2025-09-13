import { Metadata } from "next";

import { ConfirmEmail } from "@/components/auth/confirm-email";

export const metadata: Metadata = {
  title: "Confirmation d'email",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full md:max-w-xl">
        <ConfirmEmail />
      </div>
    </div>
  );
}
