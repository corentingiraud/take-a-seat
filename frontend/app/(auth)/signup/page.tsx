import { Metadata } from "next";

import { SignupForm } from "@/components/auth/forms/signup";

export const metadata: Metadata = {
  title: "Créez un compte",
};

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs md:max-w-xl">
        <SignupForm />
      </div>
    </div>
  );
}
