import { redirect } from "next/navigation";

/**
 * Root route — redirect to the dashboard.
 * Unauthenticated users will be caught by middleware (added in Prompt 2)
 * and redirected to /login before reaching this redirect.
 */
export default function RootPage() {
  redirect("/dashboard");
}
