import SwiftUI
import SwiftData

struct SearchView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.gsTheme) private var theme
    @Environment(\.modelContext) private var modelContext
    @Binding var navigationPath: NavigationPath

    @Query(sort: \RecentSearch.searchedAt, order: .reverse)
    private var recentSearches: [RecentSearch]

    @State private var searchText = ""
    @State private var selectedStore: String = "All"
    @State private var onSaleOnly = false
    @State private var results: [StorePrice] = []
    @State private var isSearching = false
    @State private var showFilterSheet = false
    @State private var wishlistedSlugs: Set<String> = []

    private let stores = ["All", "Steam", "Epic", "GOG", "Xbox"]

    private var filteredResults: [StorePrice] {
        var list = results
        if selectedStore != "All" {
            list = list.filter { $0.store.lowercased() == selectedStore.lowercased() }
        }
        if onSaleOnly {
            list = list.filter { $0.price_cents > 0 }
        }
        return list
    }

    var body: some View {
        VStack(spacing: 0) {
            // Header
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Search")
                        .font(.gsHeadline(28, weight: .bold))
                        .foregroundStyle(theme.onSurface)

                    Spacer()

                    Button {
                        showFilterSheet = true
                    } label: {
                        Image(systemName: "slider.horizontal.3")
                            .font(.system(size: 17, weight: .medium))
                            .foregroundStyle(theme.onSurface)
                            .frame(width: 36, height: 36)
                            .background(theme.surfaceHigh, in: Circle())
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 20)

                // Search field
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(searchText.isEmpty ? theme.onSurfaceVariant : theme.primary)

                    TextField("Games, deals, studios...", text: $searchText)
                        .font(.gsBody(15))
                        .foregroundStyle(theme.onSurface)
                        .submitLabel(.search)
                        .onSubmit { Task { await performSearch() } }

                    if !searchText.isEmpty {
                        Button {
                            searchText = ""
                            results = []
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(theme.onSurfaceDim)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 14))
                .overlay(
                    RoundedRectangle(cornerRadius: 14)
                        .stroke(theme.surfaceBright, lineWidth: 1)
                )
                .padding(.horizontal, 20)

                // Store filter chips
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(stores, id: \.self) { store in
                            storeChip(store)
                        }
                    }
                    .padding(.horizontal, 20)
                }
            }
            .padding(.top, 16)
            .padding(.bottom, 12)
            .background(theme.bg)

            Divider().overlay(theme.surfaceBright)

            // Content
            ScrollView(showsIndicators: false) {
                if isSearching {
                    VStack {
                        Spacer().frame(height: 60)
                        ProgressView()
                            .tint(theme.primary)
                        Text("Searching stores...")
                            .font(.gsBody(14))
                            .foregroundStyle(theme.onSurfaceVariant)
                            .padding(.top, 10)
                    }
                } else if searchText.isEmpty {
                    emptyStateContent
                } else {
                    searchResultsContent
                }

                Spacer().frame(height: 110)
            }
        }
        .background(theme.bg.ignoresSafeArea())
        .sheet(isPresented: $showFilterSheet) {
            filterSheet
        }
    }

    // MARK: - Empty State

    private var emptyStateContent: some View {
        VStack(alignment: .leading, spacing: 24) {
            // Recent searches
            if !recentSearches.isEmpty {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Recent")
                            .font(.gsHeadline(16, weight: .semibold))
                            .foregroundStyle(theme.onSurface)
                        Spacer()
                        Button {
                            clearRecentSearches()
                        } label: {
                            Text("Clear")
                                .font(.gsBody(13))
                                .foregroundStyle(theme.primary)
                        }
                        .buttonStyle(.plain)
                    }

                    ForEach(recentSearches.prefix(6)) { recent in
                        Button {
                            searchText = recent.query
                            Task { await performSearch() }
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: "clock")
                                    .font(.system(size: 14))
                                    .foregroundStyle(theme.onSurfaceDim)

                                Text(recent.query)
                                    .font(.gsBody(14))
                                    .foregroundStyle(theme.onSurface)

                                Spacer()

                                Image(systemName: "arrow.up.left")
                                    .font(.system(size: 12))
                                    .foregroundStyle(theme.onSurfaceDim)
                            }
                            .padding(.vertical, 10)
                            .padding(.horizontal, 14)
                            .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 10))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 20)
            }

            // Popular right now
            VStack(alignment: .leading, spacing: 12) {
                Text("Popular right now")
                    .font(.gsHeadline(16, weight: .semibold))
                    .foregroundStyle(theme.onSurface)
                    .padding(.horizontal, 20)

                LazyVGrid(
                    columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())],
                    spacing: 10
                ) {
                    ForEach(GS_MOCK_GAMES.prefix(6)) { game in
                        popularGameTile(game)
                    }
                }
                .padding(.horizontal, 20)
            }
        }
        .padding(.top, 20)
    }

    private func popularGameTile(_ game: MockGame) -> some View {
        Button {
            navigationPath.append(GameDestination.gameName(game.name))
        } label: {
            ZStack(alignment: .bottomLeading) {
                AsyncImage(url: URL(string: game.imageUrl)) { phase in
                    switch phase {
                    case .success(let img):
                        img.resizable().aspectRatio(contentMode: .fill)
                    default:
                        Rectangle().fill(theme.surfaceHigh)
                    }
                }
                .frame(height: 110)
                .clipped()

                LinearGradient(
                    colors: [.clear, .black.opacity(0.7)],
                    startPoint: .top,
                    endPoint: .bottom
                )

                Text(game.name)
                    .font(.gsBody(11, weight: .semibold))
                    .foregroundStyle(.white)
                    .lineLimit(2)
                    .padding(6)
            }
            .clipShape(RoundedRectangle(cornerRadius: 10))
        }
        .buttonStyle(.plain)
    }

    // MARK: - Results

    private var searchResultsContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            if !filteredResults.isEmpty {
                HStack {
                    Text("\(filteredResults.count) results for \"\(searchText)\"")
                        .font(.gsBody(13))
                        .foregroundStyle(theme.onSurfaceVariant)
                    Spacer()
                }
                .padding(.horizontal, 20)
                .padding(.top, 16)

                ForEach(filteredResults) { game in
                    GameRowView(
                        game: game,
                        wishlisted: wishlistedSlugs.contains(game.name.lowercased()),
                        onTap: {
                            navigationPath.append(GameDestination.storePrice(game))
                        },
                        onWishlistToggle: {
                            toggleWishlist(game)
                        }
                    )
                    .padding(.horizontal, 20)
                }
            } else if !results.isEmpty {
                emptyFilterResult
            } else {
                noResultsView
            }
        }
    }

    private var emptyFilterResult: some View {
        VStack(spacing: 12) {
            Spacer().frame(height: 50)
            Image(systemName: "line.3.horizontal.decrease.circle")
                .font(.system(size: 40))
                .foregroundStyle(theme.onSurfaceDim)
            Text("No results match your filters")
                .font(.gsBody(15))
                .foregroundStyle(theme.onSurfaceVariant)
            Button("Clear filters") {
                selectedStore = "All"
                onSaleOnly = false
            }
            .font(.gsBody(13, weight: .medium))
            .foregroundStyle(theme.primary)
            .buttonStyle(.plain)
        }
        .frame(maxWidth: .infinity)
    }

    private var noResultsView: some View {
        VStack(spacing: 12) {
            Spacer().frame(height: 50)
            Image(systemName: "magnifyingglass.circle")
                .font(.system(size: 40))
                .foregroundStyle(theme.onSurfaceDim)
            Text("No games found for \"\(searchText)\"")
                .font(.gsBody(15))
                .foregroundStyle(theme.onSurfaceVariant)
            Text("Try a different title or search by developer")
                .font(.gsBody(12))
                .foregroundStyle(theme.onSurfaceDim)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.horizontal, 40)
    }

    // MARK: - Filter Sheet

    private var filterSheet: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 24) {
                Text("Filter Results")
                    .font(.gsHeadline(20, weight: .bold))
                    .foregroundStyle(theme.onSurface)
                    .padding(.horizontal, 20)
                    .padding(.top, 20)

                // Store picker
                VStack(alignment: .leading, spacing: 10) {
                    Text("Store")
                        .font(.gsBody(13, weight: .semibold))
                        .foregroundStyle(theme.onSurfaceVariant)
                        .padding(.horizontal, 20)

                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(stores, id: \.self) { store in
                                storeChip(store)
                            }
                        }
                        .padding(.horizontal, 20)
                    }
                }

                // On sale toggle
                Toggle(isOn: $onSaleOnly) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("On sale only")
                            .font(.gsBody(15, weight: .medium))
                            .foregroundStyle(theme.onSurface)
                        Text("Show only discounted games")
                            .font(.gsBody(12))
                            .foregroundStyle(theme.onSurfaceVariant)
                    }
                }
                .tint(theme.primary)
                .padding(.horizontal, 20)

                Spacer()

                SunsetButton(title: "Apply Filters") {
                    showFilterSheet = false
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
            }
            .background(theme.bg.ignoresSafeArea())
        }
        .presentationDetents([.medium])
        .presentationDragIndicator(.visible)
    }

    // MARK: - Store Chip

    private func storeChip(_ store: String) -> some View {
        let isSelected = selectedStore == store
        return Button {
            selectedStore = store
        } label: {
            Text(store)
                .font(.gsBody(13, weight: isSelected ? .semibold : .regular))
                .foregroundStyle(isSelected ? Color(hex: "1C0800") : theme.onSurfaceVariant)
                .padding(.horizontal, 14)
                .padding(.vertical, 7)
                .background(
                    isSelected ? theme.primary : theme.surfaceHigh,
                    in: Capsule()
                )
                .overlay(
                    Capsule().stroke(
                        isSelected ? .clear : theme.surfaceBright,
                        lineWidth: 1
                    )
                )
        }
        .buttonStyle(.plain)
        .animation(.easeInOut(duration: 0.15), value: isSelected)
    }

    // MARK: - Actions

    private func performSearch() async {
        guard !searchText.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        isSearching = true

        // Save to recent searches
        do {
            let query = searchText.trimmingCharacters(in: .whitespaces)
            let existing = recentSearches.first { $0.query == query }
            if existing == nil {
                let recent = RecentSearch(query: query)
                modelContext.insert(recent)
                try modelContext.save()
            }
        } catch {
            // Non-critical — continue
        }

        do {
            let response = try await GatewayService.shared.searchGames(name: searchText)
            await MainActor.run {
                results = response.results
                isSearching = false
            }
        } catch {
            await MainActor.run {
                // Fallback: mock matching
                let query = searchText.lowercased()
                results = GS_MOCK_GAMES
                    .filter { $0.name.lowercased().contains(query) }
                    .compactMap { game -> StorePrice? in
                        guard let store = game.cheapestStore else { return nil }
                        return StorePrice(
                            store: store.store,
                            name: game.name,
                            price_cents: store.priceCents,
                            imageUrl: game.imageUrl,
                            currency: store.currency,
                            url: store.url
                        )
                    }
                isSearching = false
            }
        }
    }

    private func toggleWishlist(_ game: StorePrice) {
        let slug = game.name.lowercased()
        if wishlistedSlugs.contains(slug) {
            wishlistedSlugs.remove(slug)
        } else {
            wishlistedSlugs.insert(slug)
            let entry = WishlistEntry(
                gameSlug: slug,
                gameName: game.name,
                imageUrl: game.imageUrl ?? "",
                priceCents: game.price_cents,
                currency: game.currency
            )
            modelContext.insert(entry)
            try? modelContext.save()
            Task {
                if let saved = try? await GatewayService.shared.addToWishlist(name: game.name, slug: slug) {
                    entry.serverId = saved.id
                    try? modelContext.save()
                }
            }
        }
    }

    private func clearRecentSearches() {
        for search in recentSearches {
            modelContext.delete(search)
        }
        try? modelContext.save()
    }
}

// MARK: - Preview

#Preview {
    let appState = AppState()
    appState.currentUser = AuthUser(id: "1", name: "Miguel", email: "miguel@example.com")
    return NavigationStack {
        SearchView(navigationPath: .constant(NavigationPath()))
    }
    .environment(appState)
    .environment(\.gsTheme, GSTheme.dark)
    .modelContainer(for: [WishlistEntry.self, PriceAlert.self, RecentSearch.self, CachedGame.self], inMemory: true)
}
