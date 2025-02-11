import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs md:max-w-xl">
        <LoginForm />
      </div>
    </div>
  );
}
