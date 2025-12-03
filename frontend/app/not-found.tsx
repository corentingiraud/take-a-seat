import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center px-4">
      <Card className="max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl">404 - Not found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Hey, cette page n&apos;existe pas 🛸
          </p>
          <Button asChild>
            <Link href={siteConfig.path.dashboard.href}>Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
