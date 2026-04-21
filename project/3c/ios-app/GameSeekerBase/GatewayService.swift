import Foundation

// MARK: - Gateway Errors

enum GatewayError: Error, LocalizedError {
    case unauthorized
    case notFound
    case serverError(Int)
    case decodingFailed(Error)
    case invalidURL

    var errorDescription: String? {
        switch self {
        case .unauthorized: return "You must be signed in to perform this action."
        case .notFound: return "The requested resource was not found."
        case .serverError(let code): return "Server error (\(code)). Please try again later."
        case .decodingFailed(let err): return "Failed to decode response: \(err.localizedDescription)"
        case .invalidURL: return "Invalid URL."
        }
    }
}

// MARK: - GatewayService

actor GatewayService {
    static let shared = GatewayService()

    private let baseURL = "http://localhost:8080"
    private let session: URLSession

    private init() {
        let config = URLSessionConfiguration.default
        config.httpCookieStorage = HTTPCookieStorage.shared
        config.httpCookieAcceptPolicy = .always
        config.requestCachePolicy = .reloadIgnoringLocalCacheData
        self.session = URLSession(configuration: config)
    }

    // MARK: - Helpers

    private func url(_ path: String) throws -> URL {
        guard let url = URL(string: baseURL + path) else {
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

    private func perform<T: Decodable>(_ req: URLRequest, type: T.Type = T.self) async throws -> T {
        let (data, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        switch http.statusCode {
        case 200...299:
            do {
                return try JSONDecoder().decode(T.self, from: data)
            } catch {
                throw GatewayError.decodingFailed(error)
            }
        case 401:
            throw GatewayError.unauthorized
        case 404:
            throw GatewayError.notFound
        default:
            throw GatewayError.serverError(http.statusCode)
        }
    }

    private func performVoid(_ req: URLRequest) async throws {
        let (_, response) = try await session.data(for: req)
        guard let http = response as? HTTPURLResponse else {
            throw URLError(.badServerResponse)
        }
        switch http.statusCode {
        case 200...299: return
        case 401: throw GatewayError.unauthorized
        case 404: throw GatewayError.notFound
        default: throw GatewayError.serverError(http.statusCode)
        }
    }

    // MARK: - Auth

    func signIn(email: String, password: String) async throws -> AuthUser {
        struct Body: Encodable {
            let email: String
            let password: String
            let rememberMe: Bool
        }
        let req = try request(
            try url("/api/auth/sign-in/email"),
            method: "POST",
            body: Body(email: email, password: password, rememberMe: true)
        )
        let resp = try await perform(req, type: SessionResponse.self)
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
        let resp = try await perform(req, type: SessionResponse.self)
        guard let user = resp.user else {
            throw GatewayError.unauthorized
        }
        return user
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
        } catch GatewayError.serverError {
            return nil
        }
    }

    // MARK: - Games

    func searchGames(name: String) async throws -> SearchResponse {
        var comps = URLComponents(string: baseURL + "/api/games/search")!
        comps.queryItems = [URLQueryItem(name: "name", value: name)]
        guard let url = comps.url else { throw GatewayError.invalidURL }
        let req = try request(url)
        return try await perform(req, type: SearchResponse.self)
    }

    func compareGame(name: String) async throws -> CompareResponse {
        var comps = URLComponents(string: baseURL + "/api/games/compare")!
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
        var comps = URLComponents(string: baseURL + "/api/ranking/top")!
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
        return try await perform(req, type: [WishlistItemDTO].self)
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
        return try await perform(req, type: WishlistItemDTO.self)
    }

    func removeFromWishlist(id: String) async throws {
        let req = try request(try url("/api/wishlist/games/\(id)"), method: "DELETE")
        try await performVoid(req)
    }
}
