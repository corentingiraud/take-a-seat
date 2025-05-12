import { LoginForm } from "@/components/auth/forms/login";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-xs md:max-w-xl">
        <LoginForm />
      </div>
    </div>
  );
}
