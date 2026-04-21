import SwiftUI
import SwiftData

struct ProfileView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.gsTheme) private var theme
    @Environment(\.modelContext) private var modelContext

    @Query private var wishlistEntries: [WishlistEntry]
    @Query private var priceAlerts: [PriceAlert]

    @State private var showSignOutConfirm = false

    private var totalSaved: Double {
        // Mock: sum of (originalPrice - currentPrice) across wishlisted items
        wishlistEntries.reduce(0.0) { sum, entry in
            let mock = GS_MOCK_GAMES.first { $0.slug == entry.gameSlug }
            let origCents = mock?.cheapestStore?.originalPriceCents ?? entry.priceCents
            if origCents > entry.priceCents {
                return sum + Double(origCents - entry.priceCents) / 100.0
            }
            return sum
        }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // Sunset header
                headerSection

                // Avatar (overlapping header)
                avatarSection
                    .offset(y: -40)
                    .padding(.bottom, -40)

                VStack(spacing: 0) {
                    // Name & email
                    VStack(spacing: 4) {
                        Text(appState.currentUser?.name ?? "Wayfarer")
                            .font(.gsHeadline(22, weight: .bold))
                            .foregroundStyle(theme.onSurface)

                        Text(appState.currentUser?.email ?? "")
                            .font(.gsBody(14))
                            .foregroundStyle(theme.onSurfaceVariant)
                    }
                    .padding(.top, 16)

                    // Stats row
                    statsRow
                        .padding(.top, 20)
                        .padding(.horizontal, 20)

                    // Total saved card
                    totalSavedCard
                        .padding(.horizontal, 20)
                        .padding(.top, 20)

                    // Account settings
                    settingsSection
                        .padding(.top, 24)

                    // Appearance
                    appearanceSection
                        .padding(.top, 16)

                    // Sign out
                    signOutSection
                        .padding(.top, 16)
                        .padding(.horizontal, 20)

                    Spacer().frame(height: 110)
                }
            }
        }
        .background(theme.bg.ignoresSafeArea())
        .alert("Sign Out", isPresented: $showSignOutConfirm) {
            Button("Sign Out", role: .destructive) {
                Task { await appState.signOut() }
            }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("Are you sure you want to sign out?")
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        ZStack {
            theme.sunsetGradient
                .frame(height: 160)
                .overlay(
                    // Subtle texture circles
                    ZStack {
                        Circle()
                            .fill(.white.opacity(0.07))
                            .frame(width: 180, height: 180)
                            .offset(x: 100, y: -40)
                        Circle()
                            .fill(.white.opacity(0.05))
                            .frame(width: 120, height: 120)
                            .offset(x: -80, y: 30)
                    }
                )
                .clipShape(Rectangle())
        }
    }

    // MARK: - Avatar

    private var avatarSection: some View {
        VStack(spacing: 0) {
            ZStack {
                Circle()
                    .fill(theme.bg)
                    .frame(width: 90, height: 90)

                Circle()
                    .fill(theme.sunsetGradient)
                    .frame(width: 78, height: 78)

                Text(appState.currentUser?.initials ?? "?")
                    .font(.gsHeadline(28, weight: .bold))
                    .foregroundStyle(Color(hex: "1C0800"))
            }
        }
    }

    // MARK: - Stats Row

    private var statsRow: some View {
        HStack(spacing: 0) {
            statCell(value: "\(wishlistEntries.count)", label: "Wishlisted")
            Divider()
                .background(theme.surfaceBright)
                .frame(height: 30)
            statCell(value: "\(priceAlerts.count)", label: "Alerts")
            Divider()
                .background(theme.surfaceBright)
                .frame(height: 30)
            statCell(value: "14", label: "Tracked")
        }
        .padding(.vertical, 14)
        .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 14))
    }

    private func statCell(value: String, label: String) -> some View {
        VStack(spacing: 3) {
            Text(value)
                .font(.gsHeadline(20, weight: .bold))
                .foregroundStyle(theme.primary)
            Text(label)
                .font(.gsBody(12))
                .foregroundStyle(theme.onSurfaceVariant)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Total Saved

    private var totalSavedCard: some View {
        VStack(spacing: 6) {
            Text("Total saved")
                .font(.gsBody(13))
                .foregroundStyle(theme.onSurfaceVariant)

            Text(String(format: "$%.2f", totalSaved == 0 ? 247.53 : totalSaved))
                .font(.gsHeadline(36, weight: .bold))
                .foregroundStyle(theme.onSurface)

            Text("across all tracked games")
                .font(.gsBody(12))
                .foregroundStyle(theme.onSurfaceDim)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(
            ZStack {
                theme.surfaceHigh
                LinearGradient(
                    colors: [theme.tertiary.opacity(0.08), .clear],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            },
            in: RoundedRectangle(cornerRadius: 16)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(theme.tertiary.opacity(0.2), lineWidth: 1)
        )
    }

    // MARK: - Settings Sections

    private var settingsSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Account")
                .font(.gsBody(12, weight: .semibold))
                .foregroundStyle(theme.onSurfaceDim)
                .padding(.horizontal, 28)

            VStack(spacing: 0) {
                settingsRow(icon: "bell.fill", label: "Notifications", color: theme.secondary)
                Divider().padding(.leading, 56).background(theme.surfaceBright)
                settingsRow(icon: "gamecontroller.fill", label: "Connected Stores", color: theme.tertiary)
                Divider().padding(.leading, 56).background(theme.surfaceBright)
                settingsRow(icon: "dollarsign.circle.fill", label: "Currency", color: theme.primary)
                Divider().padding(.leading, 56).background(theme.surfaceBright)
                settingsRow(icon: "sparkles", label: "Sanctuary Plus", color: Color(hex: "FFD700"))
            }
            .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 14))
            .padding(.horizontal, 20)
        }
    }

    private var appearanceSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Appearance")
                .font(.gsBody(12, weight: .semibold))
                .foregroundStyle(theme.onSurfaceDim)
                .padding(.horizontal, 28)

            Button {
                withAnimation(.easeInOut(duration: 0.25)) {
                    appState.isDarkMode.toggle()
                }
            } label: {
                HStack(spacing: 14) {
                    ZStack {
                        Circle()
                            .fill((appState.isDarkMode ? theme.secondary : theme.primary).opacity(0.15))
                            .frame(width: 34, height: 34)
                        Image(systemName: appState.isDarkMode ? "moon.fill" : "sun.max.fill")
                            .font(.system(size: 15))
                            .foregroundStyle(appState.isDarkMode ? theme.secondary : theme.primary)
                    }

                    Text(appState.isDarkMode ? "Dark Mode" : "Light Mode")
                        .font(.gsBody(15))
                        .foregroundStyle(theme.onSurface)

                    Spacer()

                    ZStack {
                        Capsule()
                            .fill(appState.isDarkMode ? theme.secondary : theme.primary)
                            .frame(width: 44, height: 24)
                        Circle()
                            .fill(.white)
                            .frame(width: 18, height: 18)
                            .offset(x: appState.isDarkMode ? 10 : -10)
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
            }
            .buttonStyle(.plain)
            .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 14))
            .padding(.horizontal, 20)
        }
    }

    // MARK: - Sign Out

    private var signOutSection: some View {
        Button {
            showSignOutConfirm = true
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 15))
                Text("Sign Out")
                    .font(.gsBody(15, weight: .medium))
            }
            .foregroundStyle(theme.error)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 13)
            .background(theme.error.opacity(0.1), in: RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(theme.error.opacity(0.25), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private func settingsRow(icon: String, label: String, color: Color) -> some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(color.opacity(0.15))
                    .frame(width: 34, height: 34)
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundStyle(color)
            }

            Text(label)
                .font(.gsBody(15))
                .foregroundStyle(theme.onSurface)

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(theme.onSurfaceDim)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
    }
}
