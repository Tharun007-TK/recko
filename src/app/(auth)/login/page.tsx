import { signIn } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `Sign In`,
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Brand mark */}
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Reconciliation platform for audit firms
        </p>
      </div>

      {/* Auth form */}
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <form action={signIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              placeholder="m@example.com"
              required
              type="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" required type="password" />
          </div>
          <Button className="w-full" type="submit">
            Sign In
          </Button>
          {searchParams?.message && (
            <p className="text-sm text-center text-muted-foreground">
              {searchParams.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
