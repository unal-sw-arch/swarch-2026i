import SwiftUI
import SwiftData

// MARK: - Navigation Destinations

enum GameDestination: Hashable {
    case storePrice(StorePrice)
    case gameName(String)
    case rankedGame(RankedGame)
    case ranking

    func hash(into hasher: inout Hasher) {
        switch self {
        case .storePrice(let g):
            hasher.combine("store")
            hasher.combine(g.store)
            hasher.combine(g.name)
        case .gameName(let n):
            hasher.combine("name")
            hasher.combine(n)
        case .rankedGame(let r):
            hasher.combine("ranked")
            hasher.combine(r.slug)
            hasher.combine(r.store)
        case .ranking:
            hasher.combine("ranking")
        }
    }

    static func == (lhs: GameDestination, rhs: GameDestination) -> Bool {
        switch (lhs, rhs) {
        case (.storePrice(let a), .storePrice(let b)):
            return a.store == b.store && a.name == b.name
        case (.gameName(let a), .gameName(let b)):
            return a == b
        case (.rankedGame(let a), .rankedGame(let b)):
            return a.slug == b.slug && a.store == b.store
        case (.ranking, .ranking):
            return true
        default:
            return false
        }
    }
}

// MARK: - ContentView

struct ContentView: View {

    @Environment(AppState.self) private var appState
    @Environment(\.gsTheme) private var theme

    var body: some View {
        if appState.isAuthenticated {
            MainView()
        } else {
            AuthViews.LoginView()
        }
    }
}

// MARK: - MainView

struct MainView: View {

    @Environment(AppState.self) private var appState
    @Environment(\.gsTheme) private var theme
    @State private var navigationPath = NavigationPath()

    var body: some View {
        @Bindable var appStateBinding = appState

        NavigationStack(path: $navigationPath) {
            tabContent
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(theme.bg.ignoresSafeArea())
                .safeAreaInset(edge: .bottom, spacing: 0) {
                    TabBarView(activeTab: $appStateBinding.activeTab)
                }
                .navigationDestination(for: GameDestination.self) { destination in
                    switch destination {
                    case .storePrice(let game):
                        GameDetailView(game: game)
                    case .gameName(let name):
                        GameDetailView(gameName: name)
                    case .rankedGame(let ranked):
                        GameDetailView(rankedGame: ranked)
                    case .ranking:
                        RankingView(navigationPath: $navigationPath)
                    }
                }
        }
    }

    @ViewBuilder
    private var tabContent: some View {
        switch appState.activeTab {
        case .home:
            HomeView(navigationPath: $navigationPath)
        case .search:
            SearchView(navigationPath: $navigationPath)
        case .discover:
            DiscoverView()
        case .wishlist:
            WishlistView(navigationPath: $navigationPath)
        case .profile:
            ProfileView()
        }
    }
}
