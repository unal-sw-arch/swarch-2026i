'use client'
import { useEffect } from 'react'
import { useUserProfile } from '../../shared/hooks/useUserProfile'
import { useProductActivity } from '../../shared/hooks/useProductActivity'
import { useProfileForm } from '../../shared/hooks/useProfileForm'
import { useAddressForm } from '../../shared/hooks/useAddressForm'
import UserIdentityCard from './subcomponents/UserIdentityCard'
import ProfileEditForm from './subcomponents/ProfileEditForm'
import AddressList from './subcomponents/AddressList'
import AddAddressForm from './subcomponents/AddAddressForm'
import MyListings from './subcomponents/MyListings'
import SalesOnListings from './subcomponents/SalesOnListings'
import MyReviews from './subcomponents/MyReviews'
import ReviewsReceived from './subcomponents/ReviewsReceived'
import './UserProfilePage.css'

export default function UserProfilePage({ initialData = {} }) {
  const userProfile = useUserProfile(initialData)
  const productActivity = useProductActivity()
  const profileForm = useProfileForm(userProfile.profile)
  const addressForm = useAddressForm(userProfile.profile, userProfile.setAddresses)

  useEffect(() => {
    if (initialData?.hydrated && initialData?.userProfile) {
      void productActivity.load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = async () => {
    await userProfile.refresh()
    await productActivity.load()
  }

  const isAnyLoading = userProfile.loading || productActivity.loading
  const isSaving = profileForm.loading || addressForm.loading

  return (
    <section className="user-panel-section" aria-label="User profile">
      <div className="user-panel-header">
        <div>
          <h2>My profile</h2>
          <p className="user-panel-subtitle">
            View and edit your personal data in a dedicated profile section.
          </p>
        </div>
        <button
          className="user-refresh-button"
          type="button"
          onClick={handleRefresh}
          disabled={isAnyLoading || isSaving}
        >
          {isAnyLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {userProfile.loading && <p className="user-panel-state">Loading user profile...</p>}
      {!userProfile.loading && userProfile.error && <p className="user-panel-error">{userProfile.error}</p>}

      {!userProfile.loading && !userProfile.error && userProfile.profile && (
        <div className="user-panel-grid">
          <UserIdentityCard profile={userProfile.profile} />

          <ProfileEditForm
            values={profileForm.values}
            loading={profileForm.loading}
            error={profileForm.error}
            success={profileForm.success}
            onSubmit={profileForm.handleSubmit}
            onChange={profileForm.handleChange}
          />

          <div className="user-address-grid">
            <AddressList addresses={userProfile.addresses} />

            <AddAddressForm
              values={addressForm.values}
              loading={addressForm.loading}
              error={addressForm.error}
              success={addressForm.success}
              onSubmit={addressForm.handleSubmit}
              onChange={addressForm.handleChange}
            />
          </div>

          <div className="user-reviews-grid">
            {productActivity.loading && <p className="user-panel-state">Loading product activity...</p>}
            {productActivity.warning && <p className="user-panel-warning">{productActivity.warning}</p>}

            <MyListings listings={productActivity.myListings} />
            <SalesOnListings
              sales={productActivity.salesOnMyProducts}
              productLabels={productActivity.productLabels}
              buyerLabels={productActivity.buyerLabels}
            />
            <MyReviews
              reviews={productActivity.myReviews}
              productLabels={productActivity.productLabels}
            />
            <ReviewsReceived
              reviews={productActivity.reviewsReceived}
              productLabels={productActivity.productLabels}
              reviewerLabels={productActivity.reviewerLabels}
            />
          </div>
        </div>
      )}
    </section>
  )
}