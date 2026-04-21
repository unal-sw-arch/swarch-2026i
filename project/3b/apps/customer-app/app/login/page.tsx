import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getOptionalSession } from "@/lib/session";

export default async function LoginPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="page-shell">
      <div className="panel section-card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="stack">
          <div>
            <h1 style={{ marginTop: 0 }}>Sign in as customer</h1>
            <p className="muted">
              JWT is stored as an httpOnly cookie from the Next server.
            </p>
          </div>
          <AuthForm mode="login" />
          <p className="muted" style={{ marginBottom: 0 }}>
            No account yet? <Link href="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
