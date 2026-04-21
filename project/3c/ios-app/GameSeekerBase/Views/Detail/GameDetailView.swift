import SwiftUI
import SwiftData
import Charts
import UIKit

struct GameDetailView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.gsTheme) private var theme
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    // Init variants
    var game: StorePrice?
    var gameName: String?
    var rankedGame: RankedGame?

    @State private var compareData: CompareResponse?
    @State private var isLoading = true
    @State private var wishlisted = false
    @State private var showAlertSheet = false
    @State private var showFullHistory = false
    @State private var priceHistory: [PricePoint] = []

    private var displayName: String {
        compareData?.game
            ?? game?.name
            ?? rankedGame?.name
            ?? gameName
            ?? "Game"
    }

    private var heroImageUrl: String? {
        compareData?.cheapest?.imageUrl
            ?? game?.imageUrl
            ?? rankedGame?.imageUrl
    }

    private var allPrices: [StorePrice] {
        compareData?.prices ?? (game.map { [$0] } ?? [])
    }

    private var cheapest: StorePrice? {
        compareData?.cheapest
            ?? allPrices.min(by: { $0.price_cents < $1.price_cents })
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // Hero image
                heroSection

                VStack(alignment: .leading, spacing: 0) {
                    if isLoading {
                        VStack {
                            Spacer().frame(height: 50)
                            ProgressView()
                                .tint(theme.primary)
                            Text("Loading prices...")
                                .font(.gsBody(14))
                                .foregroundStyle(theme.onSurfaceVariant)
                                .padding(.top, 10)
                        }
                        .frame(maxWidth: .infinity)
                    } else {
                        // Game metadata
                        gameInfoSection
                            .padding(.top, 16)
                            .padding(.horizontal, 20)

                        // Best deal card
                        if let best = cheapest {
                            bestDealCard(best)
                                .padding(.horizontal, 20)
                                .padding(.top, 20)
                        }

                        // All store prices
                        if allPrices.count > 1 {
                            allStoresSection
                                .padding(.top, 20)
                        }

                        // Price alert row
                        priceAlertRow
                            .padding(.horizontal, 20)
                            .padding(.top, 16)

                        // Mini chart
                        miniChartSection
                            .padding(.top, 20)

                        // About
                        aboutSection
                            .padding(.top, 20)
                    }

                    Spacer().frame(height: 110)
                }
            }
        }
        .background(theme.bg.ignoresSafeArea())
        .ignoresSafeArea(edges: .top)
        .navigationBarHidden(true)
        .sheet(isPresented: $showAlertSheet) {
            PriceAlertSheetView(gameName: displayName, gameSlug: displayName.lowercased().replacingOccurrences(of: " ", with: "-"))
        }
        .navigationDestination(isPresented: $showFullHistory) {
            PriceHistoryView(
                gameName: displayName,
                gameSlug: displayName.lowercased().replacingOccurrences(of: " ", with: "-"),
                imageUrl: heroImageUrl
            )
        }
        .task {
            await loadDetail()
        }
    }

    // MARK: - Hero

    private var heroSection: some View {
        ZStack(alignment: .top) {
            // Background image
            AsyncImage(url: URL(string: heroImageUrl ?? "")) { phase in
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
            .frame(maxWidth: .infinity)
            .frame(height: 380)
            .clipped()

            // Gradient overlay
            LinearGradient(
                colors: [.black.opacity(0.4), .clear, theme.bg],
                startPoint: .top,
                endPoint: .bottom
            )
            .frame(height: 380)

            // Top bar
            HStack {
                Button { dismiss() } label: {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundStyle(.white)
                        .frame(width: 36, height: 36)
                        .background(.black.opacity(0.35), in: Circle())
                }
                .buttonStyle(.plain)

                Spacer()

                HStack(spacing: 10) {
                    // Share
                    Button {
                        shareGame()
                    } label: {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(width: 36, height: 36)
                            .background(.black.opacity(0.35), in: Circle())
                    }
                    .buttonStyle(.plain)

                    // Wishlist
                    Button {
                        toggleWishlist()
                    } label: {
                        Image(systemName: wishlisted ? "heart.fill" : "heart")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundStyle(wishlisted ? theme.error : .white)
                            .frame(width: 36, height: 36)
                            .background(.black.opacity(0.35), in: Circle())
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 56)
        }
    }

    // MARK: - Game Info

    private var gameInfoSection: some View {
        let mockGame = GS_MOCK_GAMES.first {
            $0.name.lowercased() == displayName.lowercased()
            || $0.slug == (rankedGame?.slug ?? "")
        }

        return VStack(alignment: .leading, spacing: 10) {
            // Genre tags
            if let genres = mockGame?.genres {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(genres, id: \.self) { genre in
                            Text(genre)
                                .font(.gsBody(11, weight: .medium))
                                .foregroundStyle(theme.secondary)
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(theme.secondary.opacity(0.15), in: Capsule())
                        }
                    }
                }
            }

            Text(displayName)
                .font(.gsHeadline(26, weight: .bold))
                .foregroundStyle(theme.onSurface)

            if let dev = mockGame?.developer {
                HStack(spacing: 6) {
                    Image(systemName: "person.2.fill")
                        .font(.system(size: 12))
                        .foregroundStyle(theme.onSurfaceDim)
                    Text(dev)
                        .font(.gsBody(13))
                        .foregroundStyle(theme.onSurfaceVariant)
                }
            }
        }
    }

    // MARK: - Best Deal Card

    private func bestDealCard(_ store: StorePrice) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: "tag.fill")
                    .font(.system(size: 12))
                    .foregroundStyle(Color(hex: "1C0800"))
                Text("Best deal today")
                    .font(.gsBody(12, weight: .semibold))
                    .foregroundStyle(Color(hex: "1C0800"))
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(theme.sunsetGradient, in: Capsule())

            HStack(alignment: .firstTextBaseline) {
                Text(formatPrice(store.price_cents, currency: store.currency))
                    .font(.gsHeadline(32, weight: .bold))
                    .foregroundStyle(theme.onSurface)

                Spacer()

                HStack(spacing: 6) {
                    // ATL badge (mock: if price is lowest in history)
                    Text("⬇ ATL")
                        .font(.gsBody(11, weight: .bold))
                        .foregroundStyle(theme.tertiary)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(theme.tertiary.opacity(0.15), in: Capsule())
                }
            }

            HStack(spacing: 8) {
                StoreBadgeView(store: store.store)
                Spacer()
                Button {
                    if let url = URL(string: store.url), !store.url.isEmpty {
                        UIApplication.shared.open(url)
                    }
                } label: {
                    HStack(spacing: 5) {
                        Text("Buy on \(store.store.capitalized)")
                            .font(.gsBody(13, weight: .semibold))
                        Image(systemName: "arrow.up.right")
                            .font(.system(size: 11, weight: .bold))
                    }
                    .foregroundStyle(Color(hex: "1C0800"))
                    .padding(.horizontal, 14)
                    .padding(.vertical, 9)
                    .background(theme.sunsetGradient, in: Capsule())
                }
                .buttonStyle(.plain)
            }
        }
        .padding(16)
        .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 16))
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(theme.primary.opacity(0.2), lineWidth: 1)
        )
    }

    // MARK: - All Stores

    private var allStoresSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("All Stores")
                .font(.gsHeadline(16, weight: .semibold))
                .foregroundStyle(theme.onSurface)
                .padding(.horizontal, 20)

            let sorted = allPrices.sorted { $0.price_cents < $1.price_cents }
            ForEach(sorted) { price in
                HStack(spacing: 12) {
                    StoreBadgeView(store: price.store)

                    Spacer()

                    Text(formatPrice(price.price_cents, currency: price.currency))
                        .font(.gsBody(15, weight: .bold))
                        .foregroundStyle(theme.onSurface)

                    Button {
                        if let url = URL(string: price.url), !price.url.isEmpty {
                            UIApplication.shared.open(url)
                        }
                    } label: {
                        Image(systemName: "arrow.up.right.circle.fill")
                            .font(.system(size: 22))
                            .foregroundStyle(theme.primary)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(theme.surface, in: RoundedRectangle(cornerRadius: 10))
                .padding(.horizontal, 20)
            }
        }
    }

    // MARK: - Price Alert Row

    private var priceAlertRow: some View {
        Button {
            showAlertSheet = true
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    Circle()
                        .fill(theme.secondary.opacity(0.15))
                        .frame(width: 42, height: 42)
                    Image(systemName: "bell.badge.fill")
                        .font(.system(size: 18))
                        .foregroundStyle(theme.secondary)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Set price alert")
                        .font(.gsBody(14, weight: .semibold))
                        .foregroundStyle(theme.onSurface)
                    Text("Get notified when the price drops")
                        .font(.gsBody(12))
                        .foregroundStyle(theme.onSurfaceVariant)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundStyle(theme.onSurfaceDim)
            }
            .padding(12)
            .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 14))
        }
        .buttonStyle(.plain)
    }

    // MARK: - Mini Chart

    private var miniChartSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Price History")
                    .font(.gsHeadline(16, weight: .semibold))
                    .foregroundStyle(theme.onSurface)

                Spacer()

                Button {
                    showFullHistory = true
                } label: {
                    Text("Full chart")
                        .font(.gsBody(13, weight: .medium))
                        .foregroundStyle(theme.primary)
                }
                .buttonStyle(.plain)
            }
            .padding(.horizontal, 20)

            // Mini sparkline
            Chart(priceHistory) { point in
                LineMark(
                    x: .value("Date", point.date),
                    y: .value("Price", Double(point.priceCents) / 100.0)
                )
                .foregroundStyle(theme.primary)
                .lineStyle(StrokeStyle(lineWidth: 2))

                AreaMark(
                    x: .value("Date", point.date),
                    y: .value("Price", Double(point.priceCents) / 100.0)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [theme.primary.opacity(0.25), .clear],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            }
            .chartXAxis(.hidden)
            .chartYAxis(.hidden)
            .frame(height: 80)
            .padding(.horizontal, 20)
        }
    }

    // MARK: - About

    private var aboutSection: some View {
        let mockGame = GS_MOCK_GAMES.first {
            $0.name.lowercased() == displayName.lowercased()
        }

        return VStack(alignment: .leading, spacing: 12) {
            Text("About")
                .font(.gsHeadline(16, weight: .semibold))
                .foregroundStyle(theme.onSurface)
                .padding(.horizontal, 20)

            if let desc = mockGame?.description {
                Text(desc)
                    .font(.gsBody(14))
                    .foregroundStyle(theme.onSurfaceVariant)
                    .lineSpacing(4)
                    .padding(.horizontal, 20)
            }

            // Metadata grid
            if let mock = mockGame {
                LazyVGrid(
                    columns: [GridItem(.flexible()), GridItem(.flexible())],
                    spacing: 10
                ) {
                    metaCell(label: "Developer", value: mock.developer)
                    metaCell(label: "Released", value: String(mock.releaseYear))
                    metaCell(label: "Genres", value: mock.genres.prefix(2).joined(separator: ", "))
                    metaCell(label: "Stores", value: "\(mock.stores.count) stores")
                }
                .padding(.horizontal, 20)
            }
        }
    }

    private func metaCell(label: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            Text(label)
                .font(.gsBody(11))
                .foregroundStyle(theme.onSurfaceDim)
            Text(value)
                .font(.gsBody(13, weight: .semibold))
                .foregroundStyle(theme.onSurface)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(10)
        .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 10))
    }

    // MARK: - Actions

    private func loadDetail() async {
        isLoading = true
        let name = game?.name ?? rankedGame?.name ?? gameName ?? ""
        guard !name.isEmpty else {
            isLoading = false
            return
        }

        priceHistory = mockPriceHistory(
            for: name.lowercased().replacingOccurrences(of: " ", with: "-")
        )

        do {
            let response = try await GatewayService.shared.compareGame(name: name)
            await MainActor.run {
                compareData = response
                isLoading = false
            }
        } catch {
            await MainActor.run {
                // Fallback: build from mock data
                if let mock = GS_MOCK_GAMES.first(where: {
                    $0.name.lowercased() == name.lowercased()
                }) {
                    let prices = mock.stores.map {
                        StorePrice(
                            store: $0.store,
                            name: mock.name,
                            price_cents: $0.priceCents,
                            imageUrl: mock.imageUrl,
                            currency: $0.currency,
                            url: $0.url
                        )
                    }
                    compareData = CompareResponse(
                        game: mock.name,
                        prices: prices,
                        cheapest: prices.min(by: { $0.price_cents < $1.price_cents })
                    )
                } else if let g = game {
                    compareData = CompareResponse(game: g.name, prices: [g], cheapest: g)
                }
                isLoading = false
            }
        }
    }

    private func toggleWishlist() {
        wishlisted.toggle()
        if wishlisted {
            let slug = displayName.lowercased().replacingOccurrences(of: " ", with: "-")
            let entry = WishlistEntry(
                gameSlug: slug,
                gameName: displayName,
                imageUrl: heroImageUrl ?? "",
                priceCents: cheapest?.price_cents ?? 0,
                currency: cheapest?.currency ?? "USD"
            )
            modelContext.insert(entry)
            try? modelContext.save()
            Task {
                _ = try? await GatewayService.shared.addToWishlist(name: displayName, slug: slug)
            }
        }
    }

    private func shareGame() {
        let text = "Check out \(displayName) on GameSeeker!"
        let av = UIActivityViewController(activityItems: [text], applicationActivities: nil)
        if let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
           let window = scene.windows.first {
            window.rootViewController?.present(av, animated: true)
        }
    }
}

// MARK: - Price Alert Sheet

struct PriceAlertSheetView: View {
    @Environment(\.gsTheme) private var theme
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss

    let gameName: String
    let gameSlug: String

    @State private var targetPriceText = ""
    @State private var pushEnabled = true
    @State private var selectedStore = "any"

    private let stores = ["any", "steam", "epic", "gog", "xbox"]

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 24) {
                Text("Price Alert")
                    .font(.gsHeadline(22, weight: .bold))
                    .foregroundStyle(theme.onSurface)
                    .padding(.horizontal, 20)
                    .padding(.top, 24)

                // Game name pill
                HStack(spacing: 8) {
                    Image(systemName: "gamecontroller.fill")
                        .font(.system(size: 14))
                        .foregroundStyle(theme.primary)
                    Text(gameName)
                        .font(.gsBody(14, weight: .medium))
                        .foregroundStyle(theme.onSurface)
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 10)
                .background(theme.surfaceHigh, in: Capsule())
                .padding(.horizontal, 20)

                // Target price
                VStack(alignment: .leading, spacing: 8) {
                    Text("Alert when price drops to")
                        .font(.gsBody(13, weight: .semibold))
                        .foregroundStyle(theme.onSurfaceVariant)

                    HStack(spacing: 10) {
                        Image(systemName: "dollarsign.circle")
                            .foregroundStyle(theme.primary)
                        TextField("e.g. 19.99", text: $targetPriceText)
                            .keyboardType(.decimalPad)
                            .font(.gsBody(16))
                            .foregroundStyle(theme.onSurface)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 12))
                }
                .padding(.horizontal, 20)

                // Store scope
                VStack(alignment: .leading, spacing: 8) {
                    Text("Store")
                        .font(.gsBody(13, weight: .semibold))
                        .foregroundStyle(theme.onSurfaceVariant)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(stores, id: \.self) { store in
                                let isSelected = selectedStore == store
                                Button {
                                    selectedStore = store
                                } label: {
                                    Text(store == "any" ? "Any store" : store.capitalized)
                                        .font(.gsBody(13, weight: isSelected ? .semibold : .regular))
                                        .foregroundStyle(isSelected ? Color(hex: "1C0800") : theme.onSurfaceVariant)
                                        .padding(.horizontal, 14)
                                        .padding(.vertical, 7)
                                        .background(
                                            isSelected ? theme.primary : theme.surfaceHigh,
                                            in: Capsule()
                                        )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }

                // Push toggle
                Toggle(isOn: $pushEnabled) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Push notifications")
                            .font(.gsBody(15, weight: .medium))
                            .foregroundStyle(theme.onSurface)
                        Text("Notify me when the price drops")
                            .font(.gsBody(12))
                            .foregroundStyle(theme.onSurfaceVariant)
                    }
                }
                .tint(theme.primary)
                .padding(.horizontal, 20)

                Spacer()

                SunsetButton(title: "Set Alert", icon: "bell.fill") {
                    saveAlert()
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 36)
            }
            .background(theme.bg.ignoresSafeArea())
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }

    private func saveAlert() {
        let price = Double(targetPriceText) ?? 0
        let alert = PriceAlert(
            gameSlug: gameSlug,
            gameName: gameName,
            targetPrice: price,
            storeScope: selectedStore,
            pushEnabled: pushEnabled
        )
        modelContext.insert(alert)
        try? modelContext.save()
        dismiss()
    }
}
