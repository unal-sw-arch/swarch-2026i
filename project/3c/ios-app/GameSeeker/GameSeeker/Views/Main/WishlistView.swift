import SwiftUI
import SwiftData

struct WishlistView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.gsTheme) private var theme
    @Environment(\.modelContext) private var modelContext
    @Binding var navigationPath: NavigationPath

    @Query(sort: \WishlistEntry.addedAt, order: .reverse)
    private var wishlistEntries: [WishlistEntry]

    @State private var syncedItems: [WishlistItemDTO] = []
    @State private var isLoading = false

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("Wishlist")
                        .font(.gsHeadline(28, weight: .bold))
                        .foregroundStyle(theme.onSurface)
                    Text("\(wishlistEntries.count) game\(wishlistEntries.count == 1 ? "" : "s") tracked")
                        .font(.gsBody(14))
                        .foregroundStyle(theme.onSurfaceVariant)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 20)

                // Live activity banner (mock)
                if !wishlistEntries.isEmpty {
                    liveActivityBanner
                        .padding(.horizontal, 20)
                        .padding(.bottom, 20)
                }

                if isLoading && wishlistEntries.isEmpty {
                    VStack {
                        Spacer().frame(height: 60)
                        ProgressView()
                            .tint(theme.primary)
                    }
                    .frame(maxWidth: .infinity)
                } else if wishlistEntries.isEmpty {
                    emptyState
                } else {
                    wishlistList
                }

                Spacer().frame(height: 110)
            }
        }
        .background(theme.bg.ignoresSafeArea())
        .task {
            await syncWishlist()
        }
    }

    // MARK: - Live Activity Banner

    private var liveActivityBanner: some View {
        let first = wishlistEntries.first

        return HStack(spacing: 12) {
            // Thumbnail
            if let urlStr = first?.imageUrl, !urlStr.isEmpty {
                AsyncImage(url: URL(string: urlStr)) { phase in
                    switch phase {
                    case .success(let img):
                        img.resizable().aspectRatio(contentMode: .fill)
                    default:
                        Rectangle().fill(theme.surfaceHigh)
                    }
                }
                .frame(width: 44, height: 58)
                .clipShape(RoundedRectangle(cornerRadius: 7))
            }

            VStack(alignment: .leading, spacing: 3) {
                HStack(spacing: 6) {
                    Circle()
                        .fill(theme.tertiary)
                        .frame(width: 7, height: 7)
                        .overlay(
                            Circle()
                                .fill(theme.tertiary.opacity(0.3))
                                .frame(width: 13, height: 13)
                        )
                    Text("Live Activity")
                        .font(.gsBody(11, weight: .semibold))
                        .foregroundStyle(theme.tertiary)
                }

                Text(first?.gameName ?? "Your game")
                    .font(.gsBody(13, weight: .semibold))
                    .foregroundStyle(theme.onSurface)
                    .lineLimit(1)

                Text("Tracking price changes across all stores")
                    .font(.gsBody(11))
                    .foregroundStyle(theme.onSurfaceVariant)
            }

            Spacer()

            Image(systemName: "bell.fill")
                .font(.system(size: 15))
                .foregroundStyle(theme.primary)
                .frame(width: 34, height: 34)
                .background(theme.primary.opacity(0.15), in: Circle())
        }
        .padding(12)
        .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(theme.tertiary.opacity(0.3), lineWidth: 1)
        )
    }

    // MARK: - Wishlist List

    private var wishlistList: some View {
        VStack(spacing: 10) {
            ForEach(wishlistEntries) { entry in
                wishlistCard(entry)
                    .padding(.horizontal, 20)
            }
        }
    }

    private func wishlistCard(_ entry: WishlistEntry) -> some View {
        let mockGame = GS_MOCK_GAMES.first { $0.slug == entry.gameSlug }
        let cheapest = mockGame?.cheapestStore
        let isAtl = cheapest.map { $0.priceCents == entry.priceCents } ?? false

        return Button {
            navigationPath.append(GameDestination.gameName(entry.gameName))
        } label: {
            HStack(spacing: 14) {
                // Cover image
                AsyncImage(url: URL(string: entry.imageUrl)) { phase in
                    switch phase {
                    case .success(let img):
                        img.resizable().aspectRatio(contentMode: .fill)
                    default:
                        Rectangle().fill(theme.surfaceHigh)
                            .overlay(
                                Image(systemName: "gamecontroller.fill")
                                    .font(.system(size: 18))
                                    .foregroundStyle(theme.onSurfaceDim)
                            )
                    }
                }
                .frame(width: 58, height: 76)
                .clipShape(RoundedRectangle(cornerRadius: 9))

                // Info
                VStack(alignment: .leading, spacing: 5) {
                    Text(entry.gameName)
                        .font(.gsBody(15, weight: .semibold))
                        .foregroundStyle(theme.onSurface)
                        .lineLimit(1)

                    if let cheapest {
                        HStack(spacing: 6) {
                            StoreBadgeView(store: cheapest.store)
                            if let disc = cheapest.discountPct, disc > 0 {
                                DiscountChipView(pct: disc)
                            }
                        }
                    }

                    HStack(spacing: 6) {
                        Text(formatPrice(entry.priceCents, currency: entry.currency))
                            .font(.gsBody(14, weight: .bold))
                            .foregroundStyle(theme.primary)

                        if isAtl {
                            HStack(spacing: 3) {
                                Image(systemName: "arrow.down")
                                    .font(.system(size: 10, weight: .bold))
                                Text("ATL")
                                    .font(.gsBody(10, weight: .bold))
                            }
                            .foregroundStyle(theme.tertiary)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 3)
                            .background(theme.tertiary.opacity(0.15), in: Capsule())
                        }
                    }
                }

                Spacer()

                // Remove button
                Button {
                    removeEntry(entry)
                } label: {
                    Image(systemName: "trash")
                        .font(.system(size: 14))
                        .foregroundStyle(theme.error)
                        .frame(width: 34, height: 34)
                        .background(theme.error.opacity(0.12), in: Circle())
                }
                .buttonStyle(.plain)
            }
            .padding(12)
            .background(theme.surface, in: RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(theme.surfaceBright.opacity(0.5), lineWidth: 0.5)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 20) {
            Spacer().frame(height: 50)

            Image(systemName: "heart.slash.fill")
                .font(.system(size: 56))
                .foregroundStyle(theme.onSurfaceDim)

            VStack(spacing: 6) {
                Text("No games yet")
                    .font(.gsHeadline(22, weight: .bold))
                    .foregroundStyle(theme.onSurface)
                Text("Add games to track their prices\nacross all stores.")
                    .font(.gsBody(14))
                    .foregroundStyle(theme.onSurfaceVariant)
                    .multilineTextAlignment(.center)
            }

            SunsetButton(title: "Discover Deals", icon: "flame.fill") {
                appState.activeTab = .discover
            }
            .padding(.horizontal, 60)
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 32)
    }

    // MARK: - Actions

    private func syncWishlist() async {
        isLoading = true
        do {
            let items = try await GatewayService.shared.getWishlist()
            await MainActor.run {
                syncedItems = items
                // Reconcile: add missing entries
                for item in items {
                    let alreadyStored = wishlistEntries.contains { $0.serverId == item.id }
                    if !alreadyStored {
                        let entry = WishlistEntry(
                            gameSlug: item.gameId ?? item.gameName.lowercased().replacingOccurrences(of: " ", with: "-"),
                            gameName: item.gameName,
                            imageUrl: "",
                            serverId: item.id,
                            priceCents: 0,
                            currency: "USD"
                        )
                        modelContext.insert(entry)
                    }
                }
                try? modelContext.save()
                isLoading = false
            }
        } catch {
            await MainActor.run { isLoading = false }
        }
    }

    private func removeEntry(_ entry: WishlistEntry) {
        let serverId = entry.serverId
        modelContext.delete(entry)
        try? modelContext.save()

        if let id = serverId {
            Task {
                try? await GatewayService.shared.removeFromWishlist(id: id)
            }
        }
    }
}

// MARK: - Preview

#Preview {
    let appState = AppState()
    appState.currentUser = AuthUser(id: "1", name: "Miguel", email: "miguel@example.com")
    return NavigationStack {
        WishlistView(navigationPath: .constant(NavigationPath()))
    }
    .environment(appState)
    .environment(\.gsTheme, GSTheme.dark)
    .modelContainer(for: [WishlistEntry.self, PriceAlert.self, RecentSearch.self, CachedGame.self], inMemory: true)
}

