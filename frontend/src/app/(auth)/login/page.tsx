import { signIn, signUp } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: `Sign In | ${APP_NAME}`,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; tab?: string }>;
}) {
  const params = await searchParams;
  const activeTab = params?.tab === "signup" ? "signup" : "signin";
  const message = params?.message ? decodeURIComponent(params.message) : null;
  const isSuccess =
    message?.toLowerCase().includes("created") ||
    message?.toLowerCase().includes("check your email");

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Brand mark */}
      <div className="space-y-1 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-lg mb-2">
          R
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Reconciliation platform for audit firms
        </p>
      </div>

      {/* Tab switcher */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        {/* Tab headers */}
        <div className="grid grid-cols-2 border-b">
          <Link
            href="/login"
            className={`px-4 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === "signin"
                ? "bg-background text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Sign In
          </Link>
          <Link
            href="/login?tab=signup"
            className={`px-4 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === "signup"
                ? "bg-background text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            Create Account
          </Link>
        </div>

        {/* Message banner */}
        {message && (
          <div
            className={`flex items-start gap-2 px-5 pt-4 pb-0 text-sm ${
              isSuccess ? "text-green-700" : "text-destructive"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <span>{message}</span>
          </div>
        )}

        {/* Sign In Form */}
        {activeTab === "signin" && (
          <form action={signIn} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@yourfirm.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <Button className="w-full" type="submit">
              Sign In
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                href="/login?tab=signup"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Create one
              </Link>
            </p>
          </form>
        )}

        {/* Create Account Form */}
        {activeTab === "signup" && (
          <form action={signUp} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Ravi Kumar"
                autoComplete="name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-email">Work Email</Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                placeholder="you@yourfirm.com"
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                placeholder="Min. 8 characters"
                required
              />
            </div>
            <Button className="w-full" type="submit">
              Create Account
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/login"
                className="underline underline-offset-2 hover:text-foreground"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-center text-muted-foreground">
        Internal use only &middot; {APP_NAME} &copy; 2026
      </p>
    </div>
  );
}
