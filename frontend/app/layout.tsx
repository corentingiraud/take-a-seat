import "@/styles/globals.css";
import { Metadata } from "next";
import clsx from "clsx";
import { PublicEnvScript } from "next-runtime-env";

import moment from "@/lib/moment";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbars/navbar";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ConfirmDialogProvider } from "@/contexts/confirm-dialog-context";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="fr">
      <head>
        <PublicEnvScript />
      </head>
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <ThemeProvider enableSystem attribute="class" defaultTheme="dark">
          <AuthProvider>
            <ConfirmDialogProvider>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="container mx-auto max-w-7xl pt-8 md:pt-16 px-4 flex-grow">
                  {children}
                </main>
                <footer className="w-full flex items-center justify-center py-3">
                  <div className="flex items-center gap-1 text-current">
                    <span className="text-default-600">
                      © Le Pêle Coworking - {moment().format("YYYY")}
                    </span>
                  </div>
                </footer>
              </div>
              <Toaster closeButton richColors />
            </ConfirmDialogProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
