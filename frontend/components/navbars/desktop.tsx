"use client";

import { usePathname, useRouter } from "next/navigation";

import { Button } from "../ui/button";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const NavbarDesktop = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="mr-4 hidden gap-2 md:flex items-center w-full">
      <div className="flex gap-2">
        {siteConfig.navItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <Button
              key={index}
              className={cn(
                "text-muted-foreground hover:text-primary",
                isActive && "text-primary font-bold",
              )}
              variant="link"
              onClick={() => router.push(item.href)}
            >
              {item.label}
            </Button>
          );
        })}
      </div>

      <Button
        className="ml-auto"
        variant="default"
        onClick={() => router.push("/login")}
      >
        Se connecter
      </Button>
    </div>
  );
};
