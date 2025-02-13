"use client";

import { useState } from "react";
import { Menu as MenuIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const NavbarMobile = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="icon" variant="ghost">
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle />
            <SheetDescription />
          </SheetHeader>
          <div className="flex flex-col items-start">
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
                  onClick={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
