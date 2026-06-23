export default function ProfileEditForm({ values, loading, error, success, onSubmit, onChange }) {
  return (
    <article className="user-profile-card edit-card">
      <h3>Edit profile</h3>

      {error && <p className="user-panel-error">{error}</p>}
      {success && <p className="user-panel-success">{success}</p>}

      <form className="profile-form" onSubmit={onSubmit}>
        <label>
          Full name
          <input
            name="name"
            value={values.name}
            onChange={onChange}
            minLength={2}
            maxLength={120}
            required
          />
        </label>

        <label>
          Phone
          <input
            name="phone"
            value={values.phone}
            onChange={onChange}
            placeholder="Optional"
            maxLength={40}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving profile...' : 'Save profile'}
        </button>
      </form>
    </article>
  )
}
