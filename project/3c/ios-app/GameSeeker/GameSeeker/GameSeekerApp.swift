import SwiftUI
import SwiftData

@main
struct GameSeekerApp: App {

    @State private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(appState)
                .environment(\.gsTheme, appState.theme)
                .preferredColorScheme(appState.isDarkMode ? .dark : .light)
                .task {
                    await appState.checkSession()
                }
        }
        .modelContainer(for: [
            WishlistEntry.self,
            PriceAlert.self,
            RecentSearch.self,
            CachedGame.self
        ])
    }
}
