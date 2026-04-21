import { requireCustomerSession } from "@/lib/session";

export default async function ProfilePage() {
  const session = await requireCustomerSession();

  return (
    <div className="page-shell">
      <section className="panel section-card">
        <div className="page-heading">
          <div>
            <h1>Profile</h1>
            <p className="muted">
              Basic profile comes from `GET /auth/me`. Advanced profile editing stays out of scope for this MVP.
            </p>
          </div>
        </div>

        <div className="meta-grid">
          <div className="meta-card">
            <span className="muted">Name</span>
            <h3>{session.name}</h3>
          </div>
          <div className="meta-card">
            <span className="muted">Email</span>
            <h3>{session.email}</h3>
          </div>
          <div className="meta-card">
            <span className="muted">Role</span>
            <h3>{session.role}</h3>
          </div>
        </div>
      </section>
    </div>
  );
}
