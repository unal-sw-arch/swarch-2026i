import SwiftUI

// MARK: - Price Formatting

func formatPrice(_ cents: Int, currency: String) -> String {
    if cents == 0 { return "Free" }
    let value = Double(cents) / 100.0
    if currency.uppercased() == "COP" {
        return "COP $\(Int(value).formatted())"
    }
    return String(format: "$%.2f", value)
}

// MARK: - Store Colors

private func storeColor(for store: String) -> Color {
    switch store.lowercased() {
    case "steam":     return Color(hex: "4A8DCA")
    case "epic":      return Color(hex: "C8C8C8")
    case "gog":       return Color(hex: "B95FE1")
    case "microsoft", "xbox": return Color(hex: "5FBA5F")
    default:          return Color(hex: "7A6A68")
    }
}

private func storeLabel(for store: String) -> String {
    switch store.lowercased() {
    case "steam":     return "Steam"
    case "epic":      return "Epic"
    case "gog":       return "GOG"
    case "microsoft", "xbox": return "Xbox"
    default:          return store.capitalized
    }
}

// MARK: - StoreBadgeView

struct StoreBadgeView: View {
    let store: String
    @Environment(\.gsTheme) private var theme

    var body: some View {
        Text(storeLabel(for: store))
            .font(.gsBody(11, weight: .semibold))
            .foregroundStyle(store.lowercased() == "epic" ? Color(hex: "2A1B18") : .white)
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(storeColor(for: store), in: Capsule())
    }
}

// MARK: - DiscountChipView

struct DiscountChipView: View {
    let pct: Int
    @Environment(\.gsTheme) private var theme

    var body: some View {
        Text("−\(pct)%")
            .font(.gsBody(11, weight: .bold))
            .foregroundStyle(Color(hex: "0E2D23"))
            .padding(.horizontal, 7)
            .padding(.vertical, 3)
            .background(theme.tertiary, in: Capsule())
    }
}

// MARK: - SunsetButton

struct SunsetButton: View {
    let title: String
    var icon: String?
    let action: () -> Void
    @Environment(\.gsTheme) private var theme

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if let icon {
                    Image(systemName: icon)
                        .font(.gsBody(15, weight: .semibold))
                }
                Text(title)
                    .font(.gsBody(16, weight: .semibold))
            }
            .foregroundStyle(Color(hex: "1C0800"))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(theme.sunsetGradient, in: Capsule())
            .shadow(color: theme.primary.opacity(0.35), radius: 12, y: 5)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - GlassButton

struct GlassButton: View {
    let title: String
    let action: () -> Void
    @Environment(\.gsTheme) private var theme

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.gsBody(15, weight: .medium))
                .foregroundStyle(theme.onSurface)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 13)
                .background(.ultraThinMaterial, in: Capsule())
                .overlay(Capsule().stroke(theme.onSurface.opacity(0.12), lineWidth: 1))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - PriceLabelView

struct PriceLabelView: View {
    let priceCents: Int
    let currency: String
    var originalCents: Int?
    @Environment(\.gsTheme) private var theme

    var body: some View {
        HStack(spacing: 5) {
            Text(formatPrice(priceCents, currency: currency))
                .font(.gsBody(15, weight: .bold))
                .foregroundStyle(theme.primary)

            if let original = originalCents, original > priceCents {
                Text(formatPrice(original, currency: currency))
                    .font(.gsBody(12, weight: .regular))
                    .foregroundStyle(theme.onSurfaceDim)
                    .strikethrough(true, color: theme.onSurfaceDim)
            }
        }
    }
}

// MARK: - GameCardView

struct GameCardView: View {
    let game: StorePrice
    let onTap: () -> Void
    @Environment(\.gsTheme) private var theme

    var body: some View {
        Button(action: onTap) {
            ZStack(alignment: .bottom) {
                // Cover image
                AsyncImage(url: URL(string: game.imageUrl ?? "")) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    default:
                        Rectangle()
                            .fill(theme.surfaceHigh)
                            .overlay(
                                Image(systemName: "gamecontroller.fill")
                                    .font(.system(size: 28))
                                    .foregroundStyle(theme.onSurfaceDim)
                            )
                    }
                }
                .frame(width: 140, height: 185)
                .clipped()

                // Price overlay
                VStack(alignment: .leading, spacing: 2) {
                    Text(game.name)
                        .font(.gsBody(12, weight: .semibold))
                        .foregroundStyle(.white)
                        .lineLimit(1)

                    HStack(spacing: 4) {
                        Text(formatPrice(game.price_cents, currency: game.currency))
                            .font(.gsBody(11, weight: .bold))
                            .foregroundStyle(theme.primary)
                        Spacer()
                        StoreBadgeView(store: game.store)
                            .scaleEffect(0.82)
                            .frame(height: 18)
                    }
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 8)
                .background(
                    LinearGradient(
                        colors: [.clear, .black.opacity(0.75)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
            }
            .frame(width: 140, height: 185)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(theme.surfaceBright.opacity(0.4), lineWidth: 0.5)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - GameRowView

struct GameRowView: View {
    let game: StorePrice
    var rank: Int?
    let wishlisted: Bool
    let onTap: () -> Void
    let onWishlistToggle: () -> Void
    @Environment(\.gsTheme) private var theme

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 12) {
                // Rank number
                if let rank {
                    Text("\(rank)")
                        .font(.gsHeadline(16, weight: .bold))
                        .foregroundStyle(theme.onSurfaceDim)
                        .frame(width: 24, alignment: .center)
                }

                // Cover thumbnail
                AsyncImage(url: URL(string: game.imageUrl ?? "")) { phase in
                    switch phase {
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    default:
                        Rectangle()
                            .fill(theme.surfaceHigh)
                            .overlay(
                                Image(systemName: "gamecontroller.fill")
                                    .font(.system(size: 14))
                                    .foregroundStyle(theme.onSurfaceDim)
                            )
                    }
                }
                .frame(width: 50, height: 66)
                .clipShape(RoundedRectangle(cornerRadius: 7))

                // Info
                VStack(alignment: .leading, spacing: 4) {
                    Text(game.name)
                        .font(.gsBody(14, weight: .semibold))
                        .foregroundStyle(theme.onSurface)
                        .lineLimit(1)

                    StoreBadgeView(store: game.store)

                    PriceLabelView(priceCents: game.price_cents, currency: game.currency)
                }

                Spacer()

                // Wishlist toggle
                Button(action: onWishlistToggle) {
                    Image(systemName: wishlisted ? "heart.fill" : "heart")
                        .font(.system(size: 18))
                        .foregroundStyle(wishlisted ? theme.error : theme.onSurfaceDim)
                        .frame(width: 36, height: 36)
                        .background(theme.surfaceHigh, in: Circle())
                }
                .buttonStyle(.plain)
            }
            .padding(.vertical, 8)
            .padding(.horizontal, 14)
            .background(theme.surface, in: RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - TabBarView

struct TabBarView: View {
    @Binding var activeTab: AppState.Tab
    @Environment(\.gsTheme) private var theme

    var body: some View {
        HStack(spacing: 0) {
            ForEach(AppState.Tab.allCases, id: \.self) { tab in
                tabItem(tab)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(.ultraThinMaterial, in: Capsule())
        .overlay(Capsule().stroke(theme.onSurface.opacity(0.08), lineWidth: 0.5))
        .shadow(color: .black.opacity(0.35), radius: 20, y: 8)
        .padding(.horizontal, 24)
        .padding(.bottom, 8)
    }

    private func tabItem(_ tab: AppState.Tab) -> some View {
        let isActive = activeTab == tab

        return Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                activeTab = tab
            }
        } label: {
            VStack(spacing: 3) {
                Image(systemName: tab.icon)
                    .font(.system(size: isActive ? 20 : 18, weight: .semibold))
                    .foregroundStyle(isActive ? theme.primary : theme.onSurfaceVariant)
                    .scaleEffect(isActive ? 1.1 : 1.0)

                if isActive {
                    Circle()
                        .fill(theme.primary)
                        .frame(width: 4, height: 4)
                } else {
                    Circle()
                        .fill(.clear)
                        .frame(width: 4, height: 4)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 4)
        }
        .buttonStyle(.plain)
        .animation(.spring(response: 0.3, dampingFraction: 0.7), value: isActive)
    }
}

// MARK: - TopBarView

struct TopBarView: View {
    let title: String
    var onBack: (() -> Void)?
    var trailing: AnyView?
    @Environment(\.gsTheme) private var theme

    var body: some View {
        ZStack {
            // Blur background
            Rectangle()
                .fill(.ultraThinMaterial)
                .ignoresSafeArea(edges: .top)

            HStack(spacing: 12) {
                if let onBack {
                    Button(action: onBack) {
                        Image(systemName: "chevron.left")
                            .font(.system(size: 17, weight: .semibold))
                            .foregroundStyle(theme.onSurface)
                            .frame(width: 36, height: 36)
                            .background(theme.surfaceHigh, in: Circle())
                    }
                    .buttonStyle(.plain)
                }

                Text(title)
                    .font(.gsHeadline(17, weight: .semibold))
                    .foregroundStyle(theme.onSurface)

                Spacer()

                if let trailing {
                    trailing
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .frame(height: onBack != nil ? 56 : 52)
    }
}
