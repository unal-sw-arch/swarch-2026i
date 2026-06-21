export default function UserIdentityCard({ profile }) {
  if (!profile) {
    return null
  }

  return (
    <article className="user-profile-card identity-card">
      <div className="identity-top">
        <div className="avatar-pill">{(profile.name || profile.email).slice(0, 1).toUpperCase()}</div>
        <div>
          <h3>{profile.name}</h3>
          <p>{profile.email}</p>
        </div>
      </div>

      <div className="user-profile-item">
        <span className="item-label">Role</span>
        <span className="user-role-chip">{profile.role || 'customer'}</span>
      </div>

      <div className="user-profile-item">
        <span className="item-label">Phone</span>
        <span className="item-value">{profile.phone || 'Not configured yet'}</span>
      </div>
    </article>
  )
}
