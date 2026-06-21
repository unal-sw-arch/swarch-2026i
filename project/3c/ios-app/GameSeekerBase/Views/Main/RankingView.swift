import SwiftUI
import SwiftData

struct RankingView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.gsTheme) private var theme
    @Environment(\.modelContext) private var modelContext
    @Binding var navigationPath: NavigationPath

    @State private var rankings: [RankedGame] = []
    @State private var isLoading = true
    @State private var wishlistedSlugs: Set<String> = []

    private var podiumGames: [RankedGame] { Array(rankings.prefix(3)) }
    private var listGames: [RankedGame] { rankings.count > 3 ? Array(rankings.dropFirst(3)) : [] }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("Ranking")
                        .font(.gsHeadline(28, weight: .bold))
                        .foregroundStyle(theme.onSurface)
                    Text("The best discounts, right now")
                        .font(.gsBody(14))
                        .foregroundStyle(theme.onSurfaceVariant)
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)
                .padding(.bottom, 24)

                if isLoading {
                    loadingState
                } else {
                    // Podium
                    if podiumGames.count >= 3 {
                        podiumSection
                            .padding(.bottom, 28)
                    }

                    // Ranked list from #4
                    if !listGames.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Full Rankings")
                                .font(.gsHeadline(16, weight: .semibold))
                                .foregroundStyle(theme.onSurface)
                                .padding(.horizontal, 20)

                            ForEach(listGames) { game in
                                rankedRow(game)
                                    .padding(.horizontal, 20)
                            }
                        }
                    }

                    // CTA card
                    ctaCard
                        .padding(.horizontal, 20)
                        .padding(.top, 24)
                }

                Spacer().frame(height: 110)
            }
        }
        .background(theme.bg.ignoresSafeArea())
        .task {
            await loadRankings()
        }
    }

    // MARK: - Loading

    private var loadingState: some View {
        VStack {
            Spacer().frame(height: 60)
            ProgressView()
                .tint(theme.primary)
            Text("Loading rankings...")
                .font(.gsBody(14))
                .foregroundStyle(theme.onSurfaceVariant)
                .padding(.top, 10)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Podium

    private var podiumSection: some View {
        HStack(alignment: .bottom, spacing: 10) {
            // 2nd place (left)
            podiumCard(podiumGames[1], height: 150, medalColor: Color(hex: "B0BEC5"))

            // 1st place (center, tallest)
            podiumCard(podiumGames[0], height: 170, medalColor: Color(hex: "FFD700"))

            // 3rd place (right)
            podiumCard(podiumGames[2], height: 135, medalColor: Color(hex: "CD7F32"))
        }
        .padding(.horizontal, 20)
    }

    private func podiumCard(_ game: RankedGame, height: CGFloat, medalColor: Color) -> some View {
        Button {
            navigationPath.append(GameDestination.rankedGame(game))
        } label: {
            ZStack(alignment: .bottom) {
                AsyncImage(url: URL(string: game.imageUrl ?? "")) { phase in
                    switch phase {
                    case .success(let img):
                        img.resizable().aspectRatio(contentMode: .fill)
                    default:
                        Rectangle().fill(theme.surfaceHigh)
                            .overlay(
                                Image(systemName: "gamecontroller.fill")
                                    .font(.system(size: 22))
                                    .foregroundStyle(theme.onSurfaceDim)
                            )
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: height)
                .clipped()

                LinearGradient(
                    colors: [.clear, .black.opacity(0.85)],
                    startPoint: .center,
                    endPoint: .bottom
                )

                VStack(alignment: .leading, spacing: 3) {
                    // Rank badge
                    Text("#\(game.rank)")
                        .font(.gsHeadline(14, weight: .bold))
                        .foregroundStyle(medalColor)

                    Text(game.name)
                        .font(.gsBody(11, weight: .semibold))
                        .foregroundStyle(.white)
                        .lineLimit(2)

                    if let disc = game.discountPct, disc > 0 {
                        DiscountChipView(pct: disc)
                            .scaleEffect(0.85)
                            .frame(height: 18)
                    }

                    Text(formatPrice(Int(game.priceCents), currency: game.currency))
                        .font(.gsBody(12, weight: .bold))
                        .foregroundStyle(Color(hex: "FF9A5D"))
                }
                .padding(8)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(medalColor.opacity(0.4), lineWidth: 1.5)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Ranked Row

    private func rankedRow(_ game: RankedGame) -> some View {
        let sp = StorePrice(
            store: game.store,
            name: game.name,
            price_cents: Int(game.priceCents),
            imageUrl: game.imageUrl,
            currency: game.currency,
            url: game.url ?? ""
        )
        let wishlisted = wishlistedSlugs.contains(game.slug)

        return GameRowView(
            game: sp,
            rank: game.rank,
            wishlisted: wishlisted,
            onTap: {
                navigationPath.append(GameDestination.rankedGame(game))
            },
            onWishlistToggle: {
                toggleWishlist(game)
            }
        )
    }

    // MARK: - CTA Card

    private var ctaCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12)
                        .fill(theme.sunsetGradient)
                        .frame(width: 48, height: 48)
                    Image(systemName: "bell.badge.fill")
                        .font(.system(size: 20))
                        .foregroundStyle(Color(hex: "1C0800"))
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Never miss the next drop")
                        .font(.gsBody(15, weight: .semibold))
                        .foregroundStyle(theme.onSurface)
                    Text("Enable price alerts and get notified")
                        .font(.gsBody(12))
                        .foregroundStyle(theme.onSurfaceVariant)
                }

                Spacer()
            }

            SunsetButton(title: "Enable Alerts", icon: "bell.fill") {
                appState.activeTab = .profile
            }
        }
        .padding(16)
        .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(theme.primary.opacity(0.2), lineWidth: 1)
        )
    }

    // MARK: - Data Loading

    private func loadRankings() async {
        isLoading = true
        do {
            let response = try await GatewayService.shared.getRanking(store: nil, limit: 10)
            await MainActor.run {
                rankings = response.rankings
                isLoading = false
            }
        } catch {
            await MainActor.run {
                rankings = GS_MOCK_GAMES.enumerated().map { idx, game in
                    game.toRankedGame(rank: idx + 1)
                }
                isLoading = false
            }
        }
    }

    private func toggleWishlist(_ game: RankedGame) {
        if wishlistedSlugs.contains(game.slug) {
            wishlistedSlugs.remove(game.slug)
        } else {
            wishlistedSlugs.insert(game.slug)
            let entry = WishlistEntry(
                gameSlug: game.slug,
                gameName: game.name,
                imageUrl: game.imageUrl ?? "",
                priceCents: Int(game.priceCents),
                currency: game.currency
            )
            modelContext.insert(entry)
            try? modelContext.save()
            Task {
                _ = try? await GatewayService.shared.addToWishlist(name: game.name, slug: game.slug)
            }
        }
    }
}
