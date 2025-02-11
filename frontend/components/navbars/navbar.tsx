import { NavbarDesktop } from "./desktop";
import { NavbarMobile } from "./mobile";

export const Navbar = () => {
  return (
    <header className="w-full border-b flex justify-center">
      <div className="flex h-14 items-center px-4 max-w-7xl w-full">
        <NavbarDesktop />
        <NavbarMobile />
      </div>
    </header>
  );
};
