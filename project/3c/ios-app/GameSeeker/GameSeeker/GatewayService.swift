import Foundation

// MARK: - Gateway Errors

enum GatewayError: Error, LocalizedError {
    case unauthorized
    case forbidden
    case badRequest(String?)
    case notFound
    case serverError(Int, String?)
    case decodingFailed(Error)
    case invalidURL

    var errorDescription: String? {
        switch self {
        case .unauthorized: return "You must be signed in to perform this action."
        case .forbidden: return "You do not have access to this resource."
        case .badRequest(let message): return message ?? "The request could not be completed."
        case .notFound: return "The requested resource was not found."
        case .serverError(let code, let message):
            return message ?? "Server error (\(code)). Please try again later."
        case .decodingFailed(let err): return "Failed to decode response: \(err.localizedDescription)"
        case .invalidURL: return "Invalid URL."
        }
    }
}

// MARK: - GatewayService

actor GatewayService {
    static let shared = GatewayService()

    private let baseURL: URL
    private let session: URLSession
    private let decoder = JSONDecoder()

    private init() {
        self.baseURL = Self.configuredBaseURL()

        let config = URLSessionConfiguration.default
        config.httpCookieStorage = HTTPCookieStorage.shared
        config.httpCookieAcceptPolicy = .always
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        self.session = URLSession(configuration: config)
    }

    // MARK: - Helpers

    private static func configuredBaseURL() -> URL {
        let candidates = [
            ProcessInfo.processInfo.environment["GAMESEEKER_GATEWAY_URL"],
            Bundle.main.object(forInfoDictionaryKey: "GSGatewayBaseURL") as? String,
            "http://127.0.0.1:8080",
        ]

        for candidate in candidates {
            guard
                let raw = candidate?.trimmingCharacters(in: .whitespacesAndNewlines),
                !raw.isEmpty,
                let url = URL(string: raw),
                url.scheme != nil,
                url.host != nil
            else { continue }

            return url
        }

        return URL(string: "http://127.0.0.1:8080")!
    }

    private func url(_ path: String) throws -> URL {
        guard let url = URL(string: path, relativeTo: baseURL)?.absoluteURL else {
            throw GatewayError.invalidURL
        }
        return url
    }

    private func request(_ url: URL, method: String = "GET", body: Encodable? = nil) throws -> URLRequest {
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.setValue("application/json", forHTTPHeaderField: "Accept")
        if let body = body {
            req.httpBody = try JSONEncoder().encode(body)
        }
        return req
    }

    private func components(path: String) throws -> URLComponents {
        guard let comps = URLComponents(url: try url(path), resolvingAgainstBaseURL: false) else {
            throw GatewayError.invalidURL
        }
        return comps
    }

    private func perform<T: Decodable>(_ req: URLRequest, type: T.Type = T.self) async throws -> T {
        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        switch http.statusCode {
        case 200...299:
            do {
                return try decoder.decode(T.self, from: data)
            } catch {
                throw GatewayError.decodingFailed(error)
            }
        case 400:
            throw GatewayError.badRequest(Self.errorMessage(from: data))
        case 401:
            throw GatewayError.unauthorized
        case 403:
            throw GatewayError.forbidden
        case 404:
            throw GatewayError.notFound
        default:
            throw GatewayError.serverError(http.statusCode, Self.errorMessage(from: data))
        }
    }

    private func performVoid(_ req: URLRequest) async throws {
        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        switch http.statusCode {
        case 200...299: return
        case 400: throw GatewayError.badRequest(Self.errorMessage(from: data))
        case 401: throw GatewayError.unauthorized
        case 403: throw GatewayError.forbidden
        case 404: throw GatewayError.notFound
        default: throw GatewayError.serverError(http.statusCode, Self.errorMessage(from: data))
        }
    }

    private static func errorMessage(from data: Data) -> String? {
        guard !data.isEmpty else { return nil }

        if let apiError = try? JSONDecoder().decode(APIErrorEnvelope.self, from: data) {
            return apiError.message ?? apiError.error
        }

        return String(data: data, encoding: .utf8)
    }

    func health() async throws -> GatewayHealth {
        let req = try request(try url("/health"))
        return try await perform(req, type: GatewayHealth.self)
    }

    // MARK: - Auth

    func signIn(email: String, password: String) async throws -> AuthUser {
        struct Body: Encodable {
            let email: String
            let password: String
        }
        let req = try request(
            try url("/api/auth/sign-in/email"),
            method: "POST",
            body: Body(email: email, password: password)
        )
        let resp = try await perform(req, type: AuthResponse.self)
        guard let user = resp.user else {
            throw GatewayError.unauthorized
        }
        return user
    }

    func signUp(email: String, password: String, name: String) async throws -> AuthUser {
        struct Body: Encodable {
            let email: String
            let password: String
            let name: String
        }
        let req = try request(
            try url("/api/auth/sign-up/email"),
            method: "POST",
            body: Body(email: email, password: password, name: name)
        )
        try await performVoid(req)
        return try await signIn(email: email, password: password)
    }

    func signOut() async throws {
        let req = try request(try url("/api/auth/sign-out"), method: "POST")
        try await performVoid(req)
    }

    func getSession() async throws -> AuthUser? {
        let req = try request(try url("/api/auth/get-session"))
        do {
            let resp = try await perform(req, type: SessionResponse.self)
            return resp.user
        } catch GatewayError.unauthorized {
            return nil
        } catch GatewayError.forbidden {
            return nil
        } catch GatewayError.serverError(_, _) {
            return nil
        }
    }

    // MARK: - Games

    func searchGames(name: String) async throws -> SearchResponse {
        var comps = try components(path: "/api/games/search")
        comps.queryItems = [URLQueryItem(name: "name", value: name)]
        guard let url = comps.url else { throw GatewayError.invalidURL }
        let req = try request(url)
        return try await perform(req, type: SearchResponse.self)
    }

    func compareGame(name: String) async throws -> CompareResponse {
        var comps = try components(path: "/api/games/compare")
        comps.queryItems = [URLQueryItem(name: "name", value: name)]
        guard let url = comps.url else { throw GatewayError.invalidURL }
        let req = try request(url)
        return try await perform(req, type: CompareResponse.self)
    }

    func getTrending(store: String) async throws -> TrendingResponse {
        let req = try request(try url("/api/games/trending/\(store)"))
        return try await perform(req, type: TrendingResponse.self)
    }

    // MARK: - Ranking

    func getRanking(store: String? = nil, limit: Int? = nil) async throws -> RankingResponse {
        var comps = try components(path: "/api/ranking/top")
        var items: [URLQueryItem] = []
        if let store = store { items.append(URLQueryItem(name: "store", value: store)) }
        if let limit = limit { items.append(URLQueryItem(name: "limit", value: String(limit))) }
        comps.queryItems = items.isEmpty ? nil : items
        guard let url = comps.url else { throw GatewayError.invalidURL }
        let req = try request(url)
        return try await perform(req, type: RankingResponse.self)
    }

    // MARK: - Wishlist

    func getWishlist() async throws -> [WishlistItemDTO] {
        let req = try request(try url("/api/wishlist"))
        let resp = try await perform(req, type: WishlistListResponse.self)
        return resp.games
    }

    func addToWishlist(name: String, slug: String) async throws -> WishlistItemDTO {
        struct Body: Encodable {
            let name: String
            let slug: String
        }
        let req = try request(
            try url("/api/wishlist/games"),
            method: "POST",
            body: Body(name: name, slug: slug)
        )
        let resp = try await perform(req, type: WishlistItemResponse.self)
        return resp.item
    }

    func removeFromWishlist(id: String) async throws {
        let req = try request(try url("/api/wishlist/games/\(id)"), method: "DELETE")
        try await performVoid(req)
    }
}

// MARK: - Gateway Response DTOs

nonisolated private struct APIErrorEnvelope: Decodable {
    let message: String?
    let error: String?
}

nonisolated struct GatewayHealth: Decodable {
    let status: String
    let service: String
}

nonisolated private struct AuthResponse: Decodable {
    let user: AuthUser?

    private enum CodingKeys: String, CodingKey {
        case user
        case data
    }

    private struct DataEnvelope: Decodable {
        let user: AuthUser?
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        if let directUser = try container.decodeIfPresent(AuthUser.self, forKey: .user) {
            user = directUser
            return
        }
        user = try container.decodeIfPresent(DataEnvelope.self, forKey: .data)?.user
    }
}

nonisolated private struct WishlistListResponse: Decodable {
    let games: [WishlistItemDTO]

    private enum CodingKeys: String, CodingKey {
        case data
    }

    private struct DataEnvelope: Decodable {
        let games: [WishlistItemDTO]
    }

    init(from decoder: Decoder) throws {
        if let items = try? [WishlistItemDTO](from: decoder) {
            games = items
            return
        }

        let container = try decoder.container(keyedBy: CodingKeys.self)
        games = try container.decodeIfPresent(DataEnvelope.self, forKey: .data)?.games ?? []
    }
}

nonisolated private struct WishlistItemResponse: Decodable {
    let item: WishlistItemDTO

    private enum CodingKeys: String, CodingKey {
        case data
    }

    init(from decoder: Decoder) throws {
        if let item = try? WishlistItemDTO(from: decoder) {
            self.item = item
            return
        }

        let container = try decoder.container(keyedBy: CodingKeys.self)
        item = try container.decode(WishlistItemDTO.self, forKey: .data)
    }
}
