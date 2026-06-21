export default function AddAddressForm({ values, loading, error, success, onSubmit, onChange }) {
  return (
    <article className="user-address-card">
      <h3>Add address</h3>

      {error && <p className="user-panel-error">{error}</p>}
      {success && <p className="user-panel-success">{success}</p>}

      <form className="address-form" onSubmit={onSubmit}>
        <input
          name="address_line"
          placeholder="Address line"
          value={values.address_line}
          onChange={onChange}
          required
        />
        <input
          name="city"
          placeholder="City"
          value={values.city}
          onChange={onChange}
          required
        />
        <input
          name="state"
          placeholder="State"
          value={values.state}
          onChange={onChange}
          required
        />
        <input
          name="country"
          placeholder="Country"
          value={values.country}
          onChange={onChange}
          required
        />
        <input
          name="postal_code"
          placeholder="Postal code"
          value={values.postal_code}
          onChange={onChange}
          required
          minLength={3}
          maxLength={20}
        />

        <label className="checkbox-line">
          <input
            type="checkbox"
            name="is_default"
            checked={values.is_default}
            onChange={onChange}
          />
          Set as default address
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Saving address...' : 'Save address'}
        </button>
      </form>
    </article>
  )
}
