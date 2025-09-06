import { AuthMenu } from "../auth/auth-menu";
import { ThemeModeToggle } from "../theme-mode-toggle";

export const Navbar = () => {
  return (
    <header className="w-full border-b flex justify-center">
      <div className="flex h-14 items-center px-4 max-w-7xl w-full">
        <div className="text-lg font-semibold">Le Pêle Coworking</div>
        <div className="ml-auto flex">
          <AuthMenu />
          <div className="ml-2">
            <ThemeModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};
