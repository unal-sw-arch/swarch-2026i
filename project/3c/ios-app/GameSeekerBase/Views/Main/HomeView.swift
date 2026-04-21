import SwiftUI

struct HomeView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.gsTheme) private var theme
    @Binding var navigationPath: NavigationPath

    @State private var trendingGames: [TrendingGame] = []
    @State private var isLoading = true

    // Greet based on time of day
    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12:  return "Good morning"
        case 12..<17: return "Good afternoon"
        case 17..<22: return "Good evening"
        default:      return "Good night"
        }
    }

    private var userName: String {
        appState.currentUser?.name.components(separatedBy: " ").first ?? "Wayfarer"
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                // Top bar
                topBar
                    .padding(.bottom, 20)

                // Featured hero card
                if isLoading {
                    heroPlaceholder
                } else {
                    heroSection
                }

                // Trending Deals
                VStack(alignment: .leading, spacing: 12) {
                    sectionHeader("Trending Deals", subtitle: "Hottest prices right now")

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            let games = trendingGames.isEmpty
                                ? GS_MOCK_GAMES.map { $0.toTrendingGame() }
                                : trendingGames
                            ForEach(games) { game in
                                let sp = game.asStorePrice
                                GameCardView(game: sp) {
                                    navigationPath.append(GameDestination.storePrice(sp))
                                }
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }
                .padding(.top, 28)

                // Discover promo banner
                discoverBanner
                    .padding(.horizontal, 20)
                    .padding(.top, 24)

                // Rankings banner
                rankingBanner
                    .padding(.horizontal, 20)
                    .padding(.top, 12)

                // New & Notable
                VStack(alignment: .leading, spacing: 12) {
                    sectionHeader("New & Notable", subtitle: "Recent additions worth watching")

                    let notable = Array(GS_MOCK_GAMES.suffix(3))
                    ForEach(notable) { game in
                        let sp = game.toTrendingGame().asStorePrice
                        GameRowView(
                            game: sp,
                            wishlisted: false,
                            onTap: {
                                navigationPath.append(GameDestination.storePrice(sp))
                            },
                            onWishlistToggle: {}
                        )
                        .padding(.horizontal, 20)
                    }
                }
                .padding(.top, 24)

                Spacer().frame(height: 110)
            }
        }
        .background(theme.bg.ignoresSafeArea())
        .task {
            await loadTrending()
        }
    }

    // MARK: - Top Bar

    private var topBar: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text("\(greeting),")
                    .font(.gsBody(14))
                    .foregroundStyle(theme.onSurfaceVariant)

                Text(userName)
                    .font(.gsHeadline(22, weight: .bold))
                    .foregroundStyle(theme.onSurface)
            }

            Spacer()

            // Live prices pill
            HStack(spacing: 5) {
                Circle()
                    .fill(theme.tertiary)
                    .frame(width: 7, height: 7)
                    .overlay(
                        Circle()
                            .fill(theme.tertiary.opacity(0.3))
                            .frame(width: 13, height: 13)
                    )
                Text("Live prices · 4 stores")
                    .font(.gsBody(11, weight: .medium))
                    .foregroundStyle(theme.tertiary)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(theme.tertiary.opacity(0.12), in: Capsule())

            // Avatar
            Button {
                appState.activeTab = .profile
            } label: {
                Text(appState.currentUser?.initials ?? "?")
                    .font(.gsBody(13, weight: .bold))
                    .foregroundStyle(Color(hex: "1C0800"))
                    .frame(width: 36, height: 36)
                    .background(
                        LinearGradient(
                            colors: [Color(hex: "FF9A5D"), Color(hex: "F9873E")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        in: Circle()
                    )
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 20)
        .padding(.top, 16)
    }

    // MARK: - Hero Section

    private var heroPlaceholder: some View {
        RoundedRectangle(cornerRadius: 20)
            .fill(theme.surfaceHigh)
            .frame(height: 260)
            .overlay(ProgressView().tint(theme.primary))
            .padding(.horizontal, 20)
    }

    private var heroSection: some View {
        let games = trendingGames.isEmpty ? GS_MOCK_GAMES.map { $0.toTrendingGame() } : trendingGames
        let featured = games.first

        return Group {
            if let featured {
                Button {
                    navigationPath.append(GameDestination.storePrice(featured.asStorePrice))
                } label: {
                    heroCard(featured)
                }
                .buttonStyle(.plain)
                .padding(.horizontal, 20)
            }
        }
    }

    private func heroCard(_ game: TrendingGame) -> some View {
        ZStack(alignment: .bottomLeading) {
            // Background image
            AsyncImage(url: URL(string: game.imageUrl ?? "")) { phase in
                switch phase {
                case .success(let img):
                    img.resizable().aspectRatio(contentMode: .fill)
                default:
                    Rectangle().fill(theme.surfaceHigh)
                        .overlay(
                            Image(systemName: "gamecontroller.fill")
                                .font(.system(size: 40))
                                .foregroundStyle(theme.onSurfaceDim)
                        )
                }
            }
            .frame(maxWidth: .infinity)
            .frame(height: 260)
            .clipped()

            // Gradient overlay
            LinearGradient(
                colors: [.clear, .black.opacity(0.85)],
                startPoint: .top,
                endPoint: .bottom
            )

            // Text overlay
            VStack(alignment: .leading, spacing: 8) {
                if let disc = game.discountPct, disc > 0 {
                    DiscountChipView(pct: disc)
                }

                Text(game.name)
                    .font(.gsHeadline(22, weight: .bold))
                    .foregroundStyle(.white)
                    .lineLimit(2)

                HStack {
                    if let cents = game.price_cents, let curr = game.currency {
                        Text(formatPrice(cents, currency: curr))
                            .font(.gsBody(16, weight: .bold))
                            .foregroundStyle(Color(hex: "FF9A5D"))
                    }

                    Spacer()

                    HStack(spacing: 5) {
                        Text("View deal")
                            .font(.gsBody(13, weight: .semibold))
                        Image(systemName: "arrow.right")
                            .font(.system(size: 11, weight: .bold))
                    }
                    .foregroundStyle(Color(hex: "1C0800"))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 7)
                    .background(
                        LinearGradient(
                            colors: [Color(hex: "FF9A5D"), Color(hex: "F9873E")],
                            startPoint: .leading,
                            endPoint: .trailing
                        ),
                        in: Capsule()
                    )
                }
            }
            .padding(16)
        }
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(theme.surfaceBright.opacity(0.3), lineWidth: 0.5)
        )
    }

    // MARK: - Discover Banner

    private var discoverBanner: some View {
        Button {
            appState.activeTab = .discover
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(
                            LinearGradient(
                                colors: [Color(hex: "FF9A5D"), Color(hex: "F9873E")],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(width: 46, height: 46)
                    Image(systemName: "flame.fill")
                        .font(.system(size: 22))
                        .foregroundStyle(Color(hex: "1C0800"))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Swipe for Deals")
                        .font(.gsBody(15, weight: .semibold))
                        .foregroundStyle(theme.onSurface)
                    Text("Discover hidden gems with a swipe")
                        .font(.gsBody(12))
                        .foregroundStyle(theme.onSurfaceVariant)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(theme.onSurfaceDim)
            }
            .padding(14)
            .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(theme.primary.opacity(0.25), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Rankings Banner

    private var rankingBanner: some View {
        Button {
            navigationPath.append(GameDestination.ranking)
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(theme.secondary.opacity(0.2))
                        .frame(width: 46, height: 46)
                    Image(systemName: "chart.bar.fill")
                        .font(.system(size: 20))
                        .foregroundStyle(theme.secondary)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Top Rankings")
                        .font(.gsBody(15, weight: .semibold))
                        .foregroundStyle(theme.onSurface)
                    Text("Best discounts ranked by savings")
                        .font(.gsBody(12))
                        .foregroundStyle(theme.onSurfaceVariant)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(theme.onSurfaceDim)
            }
            .padding(14)
            .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 16))
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(theme.secondary.opacity(0.2), lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Helpers

    private func sectionHeader(_ title: String, subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(title)
                .font(.gsHeadline(18, weight: .bold))
                .foregroundStyle(theme.onSurface)
            Text(subtitle)
                .font(.gsBody(12))
                .foregroundStyle(theme.onSurfaceVariant)
        }
        .padding(.horizontal, 20)
    }

    private func loadTrending() async {
        isLoading = true
        do {
            let response = try await GatewayService.shared.getTrending(store: "steam")
            await MainActor.run {
                trendingGames = response.games
                isLoading = false
            }
        } catch {
            await MainActor.run {
                trendingGames = GS_MOCK_GAMES.map { $0.toTrendingGame() }
                isLoading = false
            }
        }
    }
}

// MARK: - TrendingGame convenience

private extension TrendingGame {
    var asStorePrice: StorePrice {
        StorePrice(
            store: "steam",
            name: name,
            price_cents: price_cents ?? 0,
            imageUrl: imageUrl,
            currency: currency ?? "USD",
            url: url ?? ""
        )
    }
}
