import SwiftUI
import SwiftData
import UIKit

struct DiscoverView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.gsTheme) private var theme
    @Environment(\.modelContext) private var modelContext

    @State private var games: [MockGame] = GS_MOCK_GAMES
    @State private var currentIndex: Int = 0
    @State private var dragOffset: CGSize = .zero
    @State private var isAnimatingOut: Bool = false
    @State private var showDetail: Bool = false
    @State private var detailGame: StorePrice?

    private var currentGame: MockGame? {
        guard currentIndex < games.count else { return nil }
        return games[currentIndex]
    }

    private var nextGame: MockGame? {
        let idx = currentIndex + 1
        guard idx < games.count else { return nil }
        return games[idx]
    }

    private var thirdGame: MockGame? {
        let idx = currentIndex + 2
        guard idx < games.count else { return nil }
        return games[idx]
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Swipe Deals")
                            .font(.gsHeadline(26, weight: .bold))
                            .foregroundStyle(theme.onSurface)
                        Text("Swipe right to wishlist, left to pass")
                            .font(.gsBody(13))
                            .foregroundStyle(theme.onSurfaceVariant)
                    }
                    Spacer()
                    // Deck counter
                    Text("\(currentIndex + 1) / \(games.count)")
                        .font(.gsBody(13, weight: .medium))
                        .foregroundStyle(theme.onSurfaceDim)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(theme.surfaceHigh, in: Capsule())
                }
                .padding(.horizontal, 20)
            }
            .padding(.top, 16)
            .padding(.bottom, 20)

            // Card stack
            if currentGame != nil {
                ZStack {
                    // Third card (back)
                    if let third = thirdGame {
                        swipeCard(third, zIndex: 1)
                            .scaleEffect(0.88)
                            .offset(y: 18)
                            .opacity(0.5)
                    }

                    // Second card (middle)
                    if let next = nextGame {
                        swipeCard(next, zIndex: 2)
                            .scaleEffect(0.94)
                            .offset(y: 9)
                            .opacity(0.75)
                    }

                    // Top card (interactive)
                    if let current = currentGame {
                        topCard(current)
                            .zIndex(3)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 460)
                .padding(.horizontal, 20)
            } else {
                emptyState
            }

            Spacer()

            // Action buttons
            if currentGame != nil {
                actionButtons
                    .padding(.horizontal, 48)
                    .padding(.bottom, 28)
            }
        }
        .background(theme.bg.ignoresSafeArea())
        .sheet(isPresented: $showDetail) {
            if let game = detailGame {
                GameDetailView(game: game)
            }
        }
    }

    // MARK: - Top Card (with gesture)

    private func topCard(_ game: MockGame) -> some View {
        let rotation = Double(dragOffset.width / 20)
        let wishStampOpacity = max(0, Double(dragOffset.width) / 80)
        let passStampOpacity = max(0, Double(-dragOffset.width) / 80)

        return ZStack {
            swipeCard(game, zIndex: 3)

            // WISH stamp
            if wishStampOpacity > 0.05 {
                Text("WISH")
                    .font(.gsHeadline(36, weight: .bold))
                    .foregroundStyle(theme.tertiary)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(theme.tertiary, lineWidth: 3)
                    )
                    .rotationEffect(.degrees(-12))
                    .opacity(wishStampOpacity)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
                    .padding(.leading, 20)
                    .padding(.top, 30)
            }

            // PASS stamp
            if passStampOpacity > 0.05 {
                Text("PASS")
                    .font(.gsHeadline(36, weight: .bold))
                    .foregroundStyle(theme.error)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 8)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(theme.error, lineWidth: 3)
                    )
                    .rotationEffect(.degrees(12))
                    .opacity(passStampOpacity)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
                    .padding(.trailing, 20)
                    .padding(.top, 30)
            }
        }
        .offset(dragOffset)
        .rotationEffect(.degrees(rotation), anchor: .bottom)
        .gesture(
            DragGesture()
                .onChanged { value in
                    dragOffset = value.translation
                }
                .onEnded { value in
                    handleSwipeEnd(value.translation.width)
                }
        )
        .animation(isAnimatingOut ? .easeOut(duration: 0.25) : .interactiveSpring(), value: dragOffset)
    }

    // MARK: - Card Content

    private func swipeCard(_ game: MockGame, zIndex: Double) -> some View {
        ZStack(alignment: .bottom) {
            // Cover image
            AsyncImage(url: URL(string: game.imageUrl)) { phase in
                switch phase {
                case .success(let img):
                    img.resizable().aspectRatio(contentMode: .fill)
                default:
                    Rectangle().fill(theme.surfaceHigh)
                        .overlay(
                            Image(systemName: "gamecontroller.fill")
                                .font(.system(size: 50))
                                .foregroundStyle(theme.onSurfaceDim)
                        )
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .clipped()

            // Gradient overlay
            LinearGradient(
                colors: [.clear, .black.opacity(0.9)],
                startPoint: .center,
                endPoint: .bottom
            )

            // Info
            VStack(alignment: .leading, spacing: 10) {
                // Genre tags
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(game.genres, id: \.self) { genre in
                            Text(genre)
                                .font(.gsBody(11, weight: .medium))
                                .foregroundStyle(theme.onSurface.opacity(0.85))
                                .padding(.horizontal, 8)
                                .padding(.vertical, 4)
                                .background(theme.surfaceHighest.opacity(0.8), in: Capsule())
                        }
                    }
                }

                Text(game.name)
                    .font(.gsHeadline(24, weight: .bold))
                    .foregroundStyle(.white)

                Text(game.description)
                    .font(.gsBody(13))
                    .foregroundStyle(.white.opacity(0.8))
                    .lineLimit(2)

                HStack {
                    if let cheapest = game.cheapestStore {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Best price")
                                .font(.gsBody(11))
                                .foregroundStyle(.white.opacity(0.65))
                            Text(formatPrice(cheapest.priceCents, currency: cheapest.currency))
                                .font(.gsHeadline(20, weight: .bold))
                                .foregroundStyle(Color(hex: "FF9A5D"))
                        }
                    }

                    Spacer()

                    if let disc = game.bestDiscount, disc > 0 {
                        DiscountChipView(pct: disc)
                    }

                    StoreBadgeView(store: game.cheapestStore?.store ?? "steam")
                }
            }
            .padding(18)
        }
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .overlay(
            RoundedRectangle(cornerRadius: 24)
                .stroke(theme.surfaceBright.opacity(0.3), lineWidth: 0.5)
        )
        .shadow(color: .black.opacity(0.3), radius: 20, y: 10)
    }

    // MARK: - Action Buttons

    private var actionButtons: some View {
        HStack(spacing: 20) {
            // Pass
            Button {
                commitSwipe(direction: -1)
            } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(theme.error)
                    .frame(width: 58, height: 58)
                    .background(theme.surfaceHigh, in: Circle())
                    .overlay(Circle().stroke(theme.error.opacity(0.3), lineWidth: 1.5))
            }
            .buttonStyle(.plain)

            Spacer()

            // View detail
            Button {
                if let game = currentGame {
                    detailGame = game.toTrendingGame().asStorePrice
                    showDetail = true
                }
            } label: {
                Image(systemName: "eye.fill")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(theme.secondary)
                    .frame(width: 46, height: 46)
                    .background(theme.surfaceHigh, in: Circle())
                    .overlay(Circle().stroke(theme.secondary.opacity(0.3), lineWidth: 1.5))
            }
            .buttonStyle(.plain)

            Spacer()

            // Wishlist
            Button {
                commitSwipe(direction: 1)
            } label: {
                Image(systemName: "heart.fill")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(theme.tertiary)
                    .frame(width: 58, height: 58)
                    .background(theme.surfaceHigh, in: Circle())
                    .overlay(Circle().stroke(theme.tertiary.opacity(0.3), lineWidth: 1.5))
            }
            .buttonStyle(.plain)
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 20) {
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 64))
                .foregroundStyle(theme.tertiary)

            Text("You've seen them all!")
                .font(.gsHeadline(22, weight: .bold))
                .foregroundStyle(theme.onSurface)

            Text("New deals are loaded daily.\nCome back tomorrow for fresh picks.")
                .font(.gsBody(14))
                .foregroundStyle(theme.onSurfaceVariant)
                .multilineTextAlignment(.center)

            SunsetButton(title: "Start Over") {
                withAnimation(.spring()) {
                    currentIndex = 0
                    dragOffset = .zero
                }
            }
            .padding(.horizontal, 48)
        }
        .padding(.horizontal, 32)
        .frame(maxWidth: .infinity)
        .frame(height: 460)
    }

    // MARK: - Swipe Logic

    private func handleSwipeEnd(_ translationX: CGFloat) {
        if translationX > 90 {
            commitSwipe(direction: 1)
        } else if translationX < -90 {
            commitSwipe(direction: -1)
        } else {
            withAnimation(.spring(response: 0.4, dampingFraction: 0.7)) {
                dragOffset = .zero
            }
        }
    }

    private func commitSwipe(direction: CGFloat) {
        let haptic = UIImpactFeedbackGenerator(style: .medium)
        haptic.impactOccurred()

        if direction > 0, let game = currentGame {
            // Add to wishlist
            let slug = game.slug
            let entry = WishlistEntry(
                gameSlug: slug,
                gameName: game.name,
                imageUrl: game.imageUrl,
                priceCents: game.cheapestStore?.priceCents ?? 0,
                currency: game.cheapestStore?.currency ?? "USD"
            )
            modelContext.insert(entry)
            try? modelContext.save()
            Task {
                _ = try? await GatewayService.shared.addToWishlist(name: game.name, slug: slug)
            }
        }

        isAnimatingOut = true
        withAnimation(.easeOut(duration: 0.25)) {
            dragOffset = CGSize(
                width: direction * 500,
                height: 60
            )
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 0.28) {
            isAnimatingOut = false
            dragOffset = .zero
            if currentIndex < games.count - 1 {
                currentIndex += 1
            } else {
                // Loop back
                currentIndex = 0
            }
        }
    }
}

// MARK: - TrendingGame conversion (reuse from HomeView scope)

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
