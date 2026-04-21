import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth-form";
import { getOptionalSession } from "@/lib/session";

export default async function RegisterPage() {
  const session = await getOptionalSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="page-shell">
      <div className="panel section-card" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="stack">
          <div>
            <h1 style={{ marginTop: 0 }}>Create customer account</h1>
            <p className="muted">
              Registration follows the exact contract frozen in the technical bible.
            </p>
          </div>
          <AuthForm mode="register" />
          <p className="muted" style={{ marginBottom: 0 }}>
            Already have an account? <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
