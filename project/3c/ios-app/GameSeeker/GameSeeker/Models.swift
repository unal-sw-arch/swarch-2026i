import SwiftUI
import SwiftData
import Foundation

// MARK: - API DTOs

nonisolated struct StorePrice: Codable, Identifiable {
    var id: String { store + name }
    let store: String
    let name: String
    let price_cents: Int
    let imageUrl: String?
    let currency: String
    let url: String

    var priceFormatted: String {
        let amount = Double(price_cents) / 100.0
        let formatter = NumberFormatter()
        if currency.uppercased() == "COP" {
            formatter.numberStyle = .currency
            formatter.currencyCode = "COP"
            formatter.maximumFractionDigits = 0
        } else {
            formatter.numberStyle = .currency
            formatter.currencyCode = currency.isEmpty ? "USD" : currency
            formatter.maximumFractionDigits = 2
        }
        return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
    }
}

nonisolated struct SearchResponse: Codable {
    let game: String
    let results: [StorePrice]
}

nonisolated struct CompareResponse: Codable {
    let game: String
    let prices: [StorePrice]
    let cheapest: StorePrice?
}

nonisolated struct TrendingResponse: Codable {
    let store: String
    let count: Int
    let games: [TrendingGame]
}

nonisolated struct TrendingGame: Codable, Identifiable {
    var id: String { slug ?? name }
    let name: String
    let slug: String?
    let imageUrl: String?
    let url: String?
    let price_cents: Int?
    let currency: String?
    let discountPct: Int?

    var priceFormatted: String {
        guard let cents = price_cents else { return "Free" }
        let amount = Double(cents) / 100.0
        let formatter = NumberFormatter()
        let curr = currency ?? "USD"
        if curr.uppercased() == "COP" {
            formatter.numberStyle = .currency
            formatter.currencyCode = "COP"
            formatter.maximumFractionDigits = 0
        } else {
            formatter.numberStyle = .currency
            formatter.currencyCode = curr
            formatter.maximumFractionDigits = 2
        }
        return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
    }
}

nonisolated struct RankedGame: Codable, Identifiable {
    var id: String { slug }
    let rank: Int
    let name: String
    let slug: String
    let store: String
    let priceCents: Int64
    let originalPriceCents: Int64?
    let currency: String
    let discountPct: Int?
    let url: String?
    let imageUrl: String?

    var priceFormatted: String {
        let amount = Double(priceCents) / 100.0
        let formatter = NumberFormatter()
        if currency.uppercased() == "COP" {
            formatter.numberStyle = .currency
            formatter.currencyCode = "COP"
            formatter.maximumFractionDigits = 0
        } else {
            formatter.numberStyle = .currency
            formatter.currencyCode = currency
            formatter.maximumFractionDigits = 2
        }
        return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
    }

    var originalPriceFormatted: String? {
        guard let orig = originalPriceCents else { return nil }
        let amount = Double(orig) / 100.0
        let formatter = NumberFormatter()
        if currency.uppercased() == "COP" {
            formatter.numberStyle = .currency
            formatter.currencyCode = "COP"
            formatter.maximumFractionDigits = 0
        } else {
            formatter.numberStyle = .currency
            formatter.currencyCode = currency
            formatter.maximumFractionDigits = 2
        }
        return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
    }
}

nonisolated struct RankingResponse: Codable {
    let generatedAt: String?
    let store: String
    let count: Int
    let rankings: [RankedGame]
}

nonisolated struct WishlistItemDTO: Codable, Identifiable {
    let id: String
    let gameId: String?
    let gameName: String
}

nonisolated struct AuthUser: Codable {
    let id: String
    let name: String
    let email: String

    var initials: String {
        let parts = name.split(separator: " ")
        if parts.count >= 2 {
            return String(parts[0].prefix(1) + parts[1].prefix(1)).uppercased()
        }
        return String(name.prefix(2)).uppercased()
    }
}

nonisolated struct SessionResponse: Decodable {
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

// MARK: - SwiftData Models

@Model
final class WishlistEntry {
    var gameSlug: String
    var gameName: String
    var imageUrl: String
    var addedAt: Date
    var serverId: String?
    var priceCents: Int
    var currency: String

    init(
        gameSlug: String,
        gameName: String,
        imageUrl: String,
        addedAt: Date = .now,
        serverId: String? = nil,
        priceCents: Int = 0,
        currency: String = "USD"
    ) {
        self.gameSlug = gameSlug
        self.gameName = gameName
        self.imageUrl = imageUrl
        self.addedAt = addedAt
        self.serverId = serverId
        self.priceCents = priceCents
        self.currency = currency
    }

    var priceFormatted: String {
        let amount = Double(priceCents) / 100.0
        let formatter = NumberFormatter()
        if currency.uppercased() == "COP" {
            formatter.numberStyle = .currency
            formatter.currencyCode = "COP"
            formatter.maximumFractionDigits = 0
        } else {
            formatter.numberStyle = .currency
            formatter.currencyCode = currency.isEmpty ? "USD" : currency
            formatter.maximumFractionDigits = 2
        }
        return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
    }
}

@Model
final class PriceAlert {
    var gameSlug: String
    var gameName: String
    var targetPrice: Double
    var storeScope: String
    var pushEnabled: Bool
    var isActive: Bool
    var createdAt: Date

    init(
        gameSlug: String,
        gameName: String,
        targetPrice: Double,
        storeScope: String = "any",
        pushEnabled: Bool = false,
        isActive: Bool = true,
        createdAt: Date = .now
    ) {
        self.gameSlug = gameSlug
        self.gameName = gameName
        self.targetPrice = targetPrice
        self.storeScope = storeScope
        self.pushEnabled = pushEnabled
        self.isActive = isActive
        self.createdAt = createdAt
    }
}

@Model
final class RecentSearch {
    var query: String
    var searchedAt: Date

    init(query: String, searchedAt: Date = .now) {
        self.query = query
        self.searchedAt = searchedAt
    }
}

@Model
final class CachedGame {
    var slug: String
    var name: String
    var imageUrl: String
    var cachedAt: Date
    var pricesJSON: String

    init(
        slug: String,
        name: String,
        imageUrl: String,
        cachedAt: Date = .now,
        pricesJSON: String = ""
    ) {
        self.slug = slug
        self.name = name
        self.imageUrl = imageUrl
        self.cachedAt = cachedAt
        self.pricesJSON = pricesJSON
    }
}

// MARK: - Mock Data

struct MockStoreEntry {
    let store: String
    let priceCents: Int
    let originalPriceCents: Int?
    let currency: String
    let discountPct: Int?
    let url: String
}

struct MockGame: Identifiable {
    let id: String
    let name: String
    let slug: String
    let imageUrl: String
    let genres: [String]
    let developer: String
    let description: String
    let stores: [MockStoreEntry]
    let releaseYear: Int

    var cheapestStore: MockStoreEntry? {
        stores.min(by: { $0.priceCents < $1.priceCents })
    }

    var cheapestPriceFormatted: String {
        guard let cheapest = cheapestStore else { return "Free" }
        return formatPrice(cents: cheapest.priceCents, currency: cheapest.currency)
    }

    var bestDiscount: Int? {
        stores.compactMap(\.discountPct).max()
    }

    private func formatPrice(cents: Int, currency: String) -> String {
        let amount = Double(cents) / 100.0
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = currency
        if currency.uppercased() == "COP" {
            formatter.maximumFractionDigits = 0
        } else {
            formatter.maximumFractionDigits = 2
        }
        return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
    }

    func toRankedGame(rank: Int) -> RankedGame {
        let cheapest = cheapestStore ?? stores[0]
        return RankedGame(
            rank: rank,
            name: name,
            slug: slug,
            store: cheapest.store,
            priceCents: Int64(cheapest.priceCents),
            originalPriceCents: cheapest.originalPriceCents.map { Int64($0) },
            currency: cheapest.currency,
            discountPct: cheapest.discountPct,
            url: cheapest.url,
            imageUrl: imageUrl
        )
    }

    func toTrendingGame() -> TrendingGame {
        let cheapest = cheapestStore ?? stores[0]
        return TrendingGame(
            name: name,
            slug: slug,
            imageUrl: imageUrl,
            url: cheapest.url,
            price_cents: cheapest.priceCents,
            currency: cheapest.currency,
            discountPct: cheapest.discountPct
        )
    }

}

// swiftlint:disable line_length
let GS_MOCK_GAMES: [MockGame] = [
    MockGame(
        id: "elden-ring",
        name: "Elden Ring",
        slug: "elden-ring",
        imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_600x900.jpg",
        genres: ["Action", "RPG", "Open World"],
        developer: "FromSoftware",
        description: "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.",
        stores: [
            MockStoreEntry(store: "steam", priceCents: 3999, originalPriceCents: 5999, currency: "USD", discountPct: 33, url: "https://store.steampowered.com/app/1245620"),
            MockStoreEntry(store: "epic", priceCents: 4499, originalPriceCents: 5999, currency: "USD", discountPct: 25, url: "https://www.epicgames.com/store/p/elden-ring"),
            MockStoreEntry(store: "gog", priceCents: 5999, originalPriceCents: 5999, currency: "USD", discountPct: nil, url: "https://www.gog.com/game/elden_ring")
        ],
        releaseYear: 2022
    ),
    MockGame(
        id: "cyberpunk-2077",
        name: "Cyberpunk 2077",
        slug: "cyberpunk-2077",
        imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_600x900.jpg",
        genres: ["Action", "RPG", "Cyberpunk"],
        developer: "CD Projekt Red",
        description: "Cyberpunk 2077 is an open-world, action-adventure RPG set in the dark future of Night City — a dangerous megalopolis obsessed with power, glamour, and ceaseless body modification.",
        stores: [
            MockStoreEntry(store: "steam", priceCents: 2999, originalPriceCents: 5999, currency: "USD", discountPct: 50, url: "https://store.steampowered.com/app/1091500"),
            MockStoreEntry(store: "epic", priceCents: 3199, originalPriceCents: 5999, currency: "USD", discountPct: 47, url: "https://www.epicgames.com/store/p/cyberpunk-2077"),
            MockStoreEntry(store: "gog", priceCents: 2999, originalPriceCents: 5999, currency: "USD", discountPct: 50, url: "https://www.gog.com/game/cyberpunk_2077"),
            MockStoreEntry(store: "microsoft", priceCents: 3999, originalPriceCents: 5999, currency: "USD", discountPct: 33, url: "https://www.xbox.com/games/store/cyberpunk-2077")
        ],
        releaseYear: 2020
    ),
    MockGame(
        id: "baldurs-gate-3",
        name: "Baldur's Gate 3",
        slug: "baldurs-gate-3",
        imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/1086940/library_600x900.jpg",
        genres: ["RPG", "Strategy", "Fantasy"],
        developer: "Larian Studios",
        description: "Gather your party, and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.",
        stores: [
            MockStoreEntry(store: "steam", priceCents: 5999, originalPriceCents: 5999, currency: "USD", discountPct: nil, url: "https://store.steampowered.com/app/1086940"),
            MockStoreEntry(store: "gog", priceCents: 5999, originalPriceCents: 5999, currency: "USD", discountPct: nil, url: "https://www.gog.com/game/baldurs_gate_3")
        ],
        releaseYear: 2023
    ),
    MockGame(
        id: "halo-infinite",
        name: "Halo Infinite",
        slug: "halo-infinite",
        imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/1240440/library_600x900.jpg",
        genres: ["FPS", "Action", "Sci-Fi"],
        developer: "343 Industries",
        description: "When all hope is lost and humanity's fate hangs in the balance, the Master Chief is ready to confront the most ruthless foe he's ever faced.",
        stores: [
            MockStoreEntry(store: "steam", priceCents: 3999, originalPriceCents: 5999, currency: "USD", discountPct: 33, url: "https://store.steampowered.com/app/1240440"),
            MockStoreEntry(store: "microsoft", priceCents: 0, originalPriceCents: 5999, currency: "USD", discountPct: 100, url: "https://www.xbox.com/games/halo-infinite")
        ],
        releaseYear: 2021
    ),
    MockGame(
        id: "alan-wake-2",
        name: "Alan Wake 2",
        slug: "alan-wake-2",
        imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/2370650/library_600x900.jpg",
        genres: ["Survival Horror", "Thriller", "Action"],
        developer: "Remedy Entertainment",
        description: "Alan Wake 2 is a survival horror game where Alan Wake, a horror writer trapped in the Dark Place, and Saga Anderson, an FBI agent, face a deadly cult.",
        stores: [
            MockStoreEntry(store: "epic", priceCents: 2999, originalPriceCents: 4999, currency: "USD", discountPct: 40, url: "https://www.epicgames.com/store/p/alan-wake-2"),
            MockStoreEntry(store: "steam", priceCents: 3499, originalPriceCents: 4999, currency: "USD", discountPct: 30, url: "https://store.steampowered.com/app/2370650")
        ],
        releaseYear: 2023
    ),
    MockGame(
        id: "dead-space",
        name: "Dead Space",
        slug: "dead-space",
        imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/1693980/library_600x900.jpg",
        genres: ["Survival Horror", "Action", "Sci-Fi"],
        developer: "EA Motive",
        description: "The cult classic is back, completely rebuilt from the ground up. Experience the original sci-fi survival horror game with stunning visuals and chilling audio.",
        stores: [
            MockStoreEntry(store: "steam", priceCents: 1999, originalPriceCents: 3999, currency: "USD", discountPct: 50, url: "https://store.steampowered.com/app/1693980"),
            MockStoreEntry(store: "epic", priceCents: 1999, originalPriceCents: 3999, currency: "USD", discountPct: 50, url: "https://www.epicgames.com/store/p/dead-space"),
            MockStoreEntry(store: "microsoft", priceCents: 2499, originalPriceCents: 3999, currency: "USD", discountPct: 38, url: "https://www.xbox.com/games/dead-space")
        ],
        releaseYear: 2023
    ),
    MockGame(
        id: "hades-ii",
        name: "Hades II",
        slug: "hades-ii",
        imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/1145350/library_600x900.jpg",
        genres: ["Roguelike", "Action", "Mythology"],
        developer: "Supergiant Games",
        description: "Battle the Titan of Time in this bewitching sequel to the award-winning rogue-like dungeon crawler.",
        stores: [
            MockStoreEntry(store: "steam", priceCents: 2499, originalPriceCents: 2499, currency: "USD", discountPct: nil, url: "https://store.steampowered.com/app/1145350"),
            MockStoreEntry(store: "epic", priceCents: 2499, originalPriceCents: 2499, currency: "USD", discountPct: nil, url: "https://www.epicgames.com/store/p/hades-2")
        ],
        releaseYear: 2024
    ),
    MockGame(
        id: "stardew-valley",
        name: "Stardew Valley",
        slug: "stardew-valley",
        imageUrl: "https://cdn.akamai.steamstatic.com/steam/apps/413150/library_600x900.jpg",
        genres: ["Simulation", "RPG", "Farming"],
        developer: "ConcernedApe",
        description: "You've inherited your grandfather's old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life.",
        stores: [
            MockStoreEntry(store: "steam", priceCents: 1499, originalPriceCents: 1499, currency: "USD", discountPct: nil, url: "https://store.steampowered.com/app/413150"),
            MockStoreEntry(store: "epic", priceCents: 1499, originalPriceCents: 1499, currency: "USD", discountPct: nil, url: "https://www.epicgames.com/store/p/stardew-valley"),
            MockStoreEntry(store: "gog", priceCents: 1499, originalPriceCents: 1499, currency: "USD", discountPct: nil, url: "https://www.gog.com/game/stardew_valley"),
            MockStoreEntry(store: "microsoft", priceCents: 1499, originalPriceCents: 1499, currency: "USD", discountPct: nil, url: "https://www.xbox.com/games/stardew-valley")
        ],
        releaseYear: 2016
    )
]
// swiftlint:enable line_length

// MARK: - Mock Price History

struct PricePoint: Identifiable {
    let id = UUID()
    let date: Date
    let priceCents: Int
    let store: String
}

func mockPriceHistory(for slug: String) -> [PricePoint] {
    let calendar = Calendar.current
    let now = Date()
    let basePrices: [String: Int] = [
        "elden-ring": 5999,
        "cyberpunk-2077": 5999,
        "baldurs-gate-3": 5999,
        "halo-infinite": 5999,
        "alan-wake-2": 4999,
        "dead-space": 3999,
        "hades-ii": 2499,
        "stardew-valley": 1499
    ]
    let base = basePrices[slug] ?? 4999
    var points: [PricePoint] = []
    for monthsBack in stride(from: 11, through: 0, by: -1) {
        guard let date = calendar.date(byAdding: .month, value: -monthsBack, to: now) else { continue }
        let discount = [0, 0, 20, 0, 30, 0, 0, 50, 0, 20, 0, 33][11 - monthsBack]
        let price = Int(Double(base) * (1.0 - Double(discount) / 100.0))
        points.append(PricePoint(date: date, priceCents: price, store: "steam"))
    }
    return points
}
