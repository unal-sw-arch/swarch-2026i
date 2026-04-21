import SwiftUI
import Charts

struct PriceHistoryView: View {
    @Environment(\.gsTheme) private var theme
    @Environment(\.dismiss) private var dismiss

    let gameName: String
    let gameSlug: String
    let imageUrl: String?

    @State private var selectedRange: HistoryRange = .sixMonths
    @State private var priceHistory: [PricePoint] = []

    enum HistoryRange: String, CaseIterable {
        case oneMonth  = "1m"
        case threeMonths = "3m"
        case sixMonths = "6m"
        case oneYear   = "1y"
        case all       = "All"

        var monthsBack: Int {
            switch self {
            case .oneMonth:    return 1
            case .threeMonths: return 3
            case .sixMonths:   return 6
            case .oneYear:     return 12
            case .all:         return 12
            }
        }
    }

    private var filteredHistory: [PricePoint] {
        guard selectedRange != .all else { return priceHistory }
        let cutoff = Calendar.current.date(
            byAdding: .month,
            value: -selectedRange.monthsBack,
            to: Date()
        ) ?? Date()
        return priceHistory.filter { $0.date >= cutoff }
    }

    private var allTimeLow: PricePoint? {
        priceHistory.min(by: { $0.priceCents < $1.priceCents })
    }

    private var allTimeRegular: PricePoint? {
        priceHistory.max(by: { $0.priceCents < $1.priceCents })
    }

    private var avgCents: Int {
        guard !priceHistory.isEmpty else { return 0 }
        return priceHistory.reduce(0) { $0 + $1.priceCents } / priceHistory.count
    }

    private var currency: String { "USD" }

    // Notable drops: months where price decreased significantly
    private var notableDrops: [(date: Date, store: String, savedPct: Int)] {
        var drops: [(date: Date, store: String, savedPct: Int)] = []
        let sorted = priceHistory.sorted { $0.date < $1.date }
        for idx in 1..<sorted.count {
            let prev = sorted[idx - 1].priceCents
            let curr = sorted[idx].priceCents
            if prev > 0 && curr < prev {
                let pct = Int(Double(prev - curr) / Double(prev) * 100)
                if pct >= 15 {
                    drops.append((
                        date: sorted[idx].date,
                        store: sorted[idx].store,
                        savedPct: pct
                    ))
                }
            }
        }
        return Array(drops.suffix(3))
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                // Header
                header
                    .padding(.bottom, 20)

                // Range selector
                rangeSelector
                    .padding(.horizontal, 20)
                    .padding(.bottom, 20)

                // Main chart
                mainChart
                    .padding(.horizontal, 20)
                    .padding(.bottom, 28)

                // Stats grid
                statsGrid
                    .padding(.horizontal, 20)
                    .padding(.bottom, 28)

                // Notable drops
                if !notableDrops.isEmpty {
                    notableDropsSection
                        .padding(.horizontal, 20)
                }

                Spacer().frame(height: 80)
            }
        }
        .background(theme.bg.ignoresSafeArea())
        .navigationBarHidden(true)
        .task {
            priceHistory = mockPriceHistory(for: gameSlug)
        }
    }

    // MARK: - Header

    private var header: some View {
        HStack(spacing: 12) {
            Button { dismiss() } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(theme.onSurface)
                    .frame(width: 36, height: 36)
                    .background(theme.surfaceHigh, in: Circle())
            }
            .buttonStyle(.plain)

            AsyncImage(url: URL(string: imageUrl ?? "")) { phase in
                switch phase {
                case .success(let img):
                    img.resizable().aspectRatio(contentMode: .fill)
                default:
                    Rectangle().fill(theme.surfaceHigh)
                }
            }
            .frame(width: 40, height: 52)
            .clipShape(RoundedRectangle(cornerRadius: 7))

            VStack(alignment: .leading, spacing: 2) {
                Text(gameName)
                    .font(.gsBody(15, weight: .semibold))
                    .foregroundStyle(theme.onSurface)
                    .lineLimit(1)
                Text("Price history")
                    .font(.gsBody(12))
                    .foregroundStyle(theme.onSurfaceVariant)
            }

            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.top, 56)
    }

    // MARK: - Range Selector

    private var rangeSelector: some View {
        HStack(spacing: 0) {
            ForEach(HistoryRange.allCases, id: \.self) { range in
                let isSelected = selectedRange == range
                Button {
                    withAnimation(.easeInOut(duration: 0.15)) {
                        selectedRange = range
                    }
                } label: {
                    Text(range.rawValue)
                        .font(.gsBody(13, weight: isSelected ? .semibold : .regular))
                        .foregroundStyle(isSelected ? Color(hex: "1C0800") : theme.onSurfaceVariant)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 8)
                        .background(
                            isSelected ? theme.primary : .clear,
                            in: RoundedRectangle(cornerRadius: 8)
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(4)
        .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Main Chart

    private var mainChart: some View {
        let history = filteredHistory
        let atl = allTimeLow

        return Chart {
            // Area fill
            ForEach(history) { point in
                AreaMark(
                    x: .value("Date", point.date),
                    y: .value("Price", Double(point.priceCents) / 100.0)
                )
                .foregroundStyle(
                    LinearGradient(
                        colors: [theme.primary.opacity(0.3), theme.primary.opacity(0.02)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )
                .interpolationMethod(.catmullRom)
            }

            // Line
            ForEach(history) { point in
                LineMark(
                    x: .value("Date", point.date),
                    y: .value("Price", Double(point.priceCents) / 100.0)
                )
                .foregroundStyle(theme.primary)
                .lineStyle(StrokeStyle(lineWidth: 2.5))
                .interpolationMethod(.catmullRom)
            }

            // Points
            ForEach(history) { point in
                PointMark(
                    x: .value("Date", point.date),
                    y: .value("Price", Double(point.priceCents) / 100.0)
                )
                .foregroundStyle(theme.primary)
                .symbolSize(30)
            }

            // ATL rule
            if let atl {
                RuleMark(y: .value("ATL", Double(atl.priceCents) / 100.0))
                    .foregroundStyle(theme.tertiary.opacity(0.8))
                    .lineStyle(StrokeStyle(lineWidth: 1.5, dash: [5, 4]))
                    .annotation(position: .trailing) {
                        Text("ATL")
                            .font(.gsBody(10, weight: .bold))
                            .foregroundStyle(theme.tertiary)
                    }
            }
        }
        .chartXAxis {
            AxisMarks(values: .stride(by: .month, count: 2)) { value in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                    .foregroundStyle(theme.surfaceBright.opacity(0.4))
                AxisValueLabel(format: .dateTime.month(.abbreviated))
                    .foregroundStyle(theme.onSurfaceDim)
                    .font(.gsBody(10))
            }
        }
        .chartYAxis {
            AxisMarks { value in
                AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                    .foregroundStyle(theme.surfaceBright.opacity(0.4))
                AxisValueLabel {
                    if let d = value.as(Double.self) {
                        Text(String(format: "$%.0f", d))
                            .font(.gsBody(10))
                            .foregroundStyle(theme.onSurfaceDim)
                    }
                }
            }
        }
        .frame(height: 220)
    }

    // MARK: - Stats Grid

    private var statsGrid: some View {
        LazyVGrid(
            columns: [GridItem(.flexible()), GridItem(.flexible())],
            spacing: 10
        ) {
            statCell(
                label: "All-time low",
                value: atl(allTimeLow),
                accent: theme.tertiary
            )
            statCell(
                label: "Regular price",
                value: atl(allTimeRegular),
                accent: theme.onSurface
            )
            statCell(
                label: "Avg. 12 months",
                value: formatPrice(avgCents, currency: currency),
                accent: theme.secondary
            )
            statCell(
                label: "Price drops",
                value: "\(notableDrops.count) drops",
                accent: theme.primary
            )
        }
    }

    private func atl(_ point: PricePoint?) -> String {
        guard let p = point else { return "—" }
        return formatPrice(p.priceCents, currency: currency)
    }

    private func statCell(label: String, value: String, accent: Color) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(label)
                .font(.gsBody(11))
                .foregroundStyle(theme.onSurfaceDim)
            Text(value)
                .font(.gsHeadline(17, weight: .bold))
                .foregroundStyle(accent)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: - Notable Drops

    private var notableDropsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Notable Drops")
                .font(.gsHeadline(16, weight: .semibold))
                .foregroundStyle(theme.onSurface)

            ForEach(notableDrops.indices, id: \.self) { idx in
                let drop = notableDrops[idx]
                HStack(spacing: 12) {
                    ZStack {
                        Circle()
                            .fill(theme.tertiary.opacity(0.15))
                            .frame(width: 36, height: 36)
                        Image(systemName: "arrow.down")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(theme.tertiary)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(drop.store.capitalized)
                            .font(.gsBody(13, weight: .semibold))
                            .foregroundStyle(theme.onSurface)
                        Text(drop.date.formatted(date: .abbreviated, time: .omitted))
                            .font(.gsBody(11))
                            .foregroundStyle(theme.onSurfaceDim)
                    }

                    Spacer()

                    Text("−\(drop.savedPct)% off")
                        .font(.gsBody(13, weight: .bold))
                        .foregroundStyle(theme.tertiary)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(theme.tertiary.opacity(0.12), in: Capsule())
                }
                .padding(10)
                .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 12))
            }
        }
    }
}
