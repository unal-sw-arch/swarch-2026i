import SwiftUI

// MARK: - AppState

@Observable
final class AppState {

    // MARK: - State

    var currentUser: AuthUser?
    var isDarkMode: Bool = true
    var activeTab: Tab = .home
    var isLoading: Bool = false
    var authError: String?

    // MARK: - Derived

    var isAuthenticated: Bool { currentUser != nil }
    var theme: GSTheme { isDarkMode ? .dark : .light }

    // MARK: - Tabs

    enum Tab: Hashable, CaseIterable {
        case home, search, discover, wishlist, profile

        var label: String {
            switch self {
            case .home:     return "Home"
            case .search:   return "Search"
            case .discover: return "Discover"
            case .wishlist: return "Wishlist"
            case .profile:  return "Profile"
            }
        }

        var icon: String {
            switch self {
            case .home:     return "house.fill"
            case .search:   return "magnifyingglass"
            case .discover: return "flame.fill"
            case .wishlist: return "heart.fill"
            case .profile:  return "person.fill"
            }
        }
    }

    // MARK: - Session

    func checkSession() async {
        do {
            let user = try await GatewayService.shared.getSession()
            await MainActor.run {
                self.currentUser = user
            }
        } catch {
            await MainActor.run {
                self.currentUser = nil
            }
        }
    }

    // MARK: - Auth actions

    func signIn(email: String, password: String) async {
        await MainActor.run {
            isLoading = true
            authError = nil
        }
        do {
            let user = try await GatewayService.shared.signIn(email: email, password: password)
            await MainActor.run {
                self.currentUser = user
                self.isLoading = false
            }
        } catch GatewayError.unauthorized {
            await MainActor.run {
                self.authError = "Invalid email or password."
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.authError = "Unable to connect. Please check your network."
                self.isLoading = false
            }
        }
    }

    func signUp(email: String, password: String, name: String) async {
        await MainActor.run {
            isLoading = true
            authError = nil
        }
        do {
            let user = try await GatewayService.shared.signUp(email: email, password: password, name: name)
            await MainActor.run {
                self.currentUser = user
                self.isLoading = false
            }
        } catch {
            await MainActor.run {
                self.authError = "Registration failed. Please try again."
                self.isLoading = false
            }
        }
    }

    func signOut() async {
        try? await GatewayService.shared.signOut()
        await MainActor.run {
            self.currentUser = nil
            self.activeTab = .home
        }
    }
}
