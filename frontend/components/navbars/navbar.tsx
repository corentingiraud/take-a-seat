import Link from "next/link";

import { AuthMenu } from "../auth/auth-menu";
import { ThemeModeToggle } from "../theme-mode-toggle";

import { siteConfig } from "@/config/site";

export const Navbar = () => {
  return (
    <header className="w-full border-b flex justify-center">
      <div className="flex h-14 items-center px-4 max-w-7xl w-full">
        <Link
          className="text-lg font-semibold cursor-pointer"
          href={siteConfig.path.dashboard.href}
        >
          Le Pêle Coworking
        </Link>
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
