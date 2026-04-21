import SwiftUI

// MARK: - Color extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: .init(charactersIn: "#"))
        let scanner = Scanner(string: hex)
        var value: UInt64 = 0
        scanner.scanHexInt64(&value)
        let r = Double((value >> 16) & 0xFF) / 255
        let g = Double((value >> 8) & 0xFF) / 255
        let b = Double(value & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}

// MARK: - Theme
struct GSTheme {
    let name: String

    // Surface hierarchy
    let bg: Color
    let surface: Color
    let surfaceLow: Color
    let surfaceHigh: Color
    let surfaceHighest: Color
    let surfaceBright: Color

    // Text
    let onSurface: Color
    let onSurfaceVariant: Color
    let onSurfaceDim: Color

    // Accents
    let primary: Color
    let primaryDim: Color
    let secondary: Color
    let tertiary: Color
    let error: Color

    // Derived
    let ghost: Color
    let isDark: Bool

    var tabBarBg: Color { isDark ? Color(hex: "221816").opacity(0.72) : Color(hex: "FFF4F0").opacity(0.72) }
    var sunsetGradient: LinearGradient {
        isDark
            ? LinearGradient(colors: [Color(hex: "FF9A5D"), Color(hex: "F9873E")], startPoint: .topLeading, endPoint: .bottomTrailing)
            : LinearGradient(colors: [Color(hex: "FF9A5D"), Color(hex: "E3641E")], startPoint: .topLeading, endPoint: .bottomTrailing)
    }
    var sunsetColors: [Color] { isDark ? [Color(hex: "FF9A5D"), Color(hex: "F9873E")] : [Color(hex: "FF9A5D"), Color(hex: "E3641E")] }
    var sunsetStart: Color { isDark ? Color(hex: "FF9A5D") : Color(hex: "FF9A5D") }

    static let dark = GSTheme(
        name: "dark",
        bg:              Color(hex: "0E0807"),
        surface:         Color(hex: "1C1312"),
        surfaceLow:      Color(hex: "140C0C"),
        surfaceHigh:     Color(hex: "221816"),
        surfaceHighest:  Color(hex: "2E2220"),
        surfaceBright:   Color(hex: "3D2E2C"),
        onSurface:       Color(hex: "F0DBD9"),
        onSurfaceVariant:Color(hex: "C4A8A5"),
        onSurfaceDim:    Color(hex: "F0DBD9").opacity(0.55),
        primary:         Color(hex: "FF9A5D"),
        primaryDim:      Color(hex: "F9873E"),
        secondary:       Color(hex: "9B7EC8"),
        tertiary:        Color(hex: "7ECFB1"),
        error:           Color(hex: "FE7453"),
        ghost:           Color(hex: "7A5E5C").opacity(0.18),
        isDark:          true
    )

    static let light = GSTheme(
        name: "light",
        bg:              Color(hex: "FBF4EF"),
        surface:         Color(hex: "FFFFFF"),
        surfaceLow:      Color(hex: "F7EDE5"),
        surfaceHigh:     Color(hex: "FFFFFF"),
        surfaceHighest:  Color(hex: "FFFFFF"),
        surfaceBright:   Color(hex: "FFFFFF"),
        onSurface:       Color(hex: "2A1B18"),
        onSurfaceVariant:Color(hex: "6B4E4A"),
        onSurfaceDim:    Color(hex: "2A1B18").opacity(0.55),
        primary:         Color(hex: "E3641E"),
        primaryDim:      Color(hex: "C94F0F"),
        secondary:       Color(hex: "7B5EA7"),
        tertiary:        Color(hex: "2F9773"),
        error:           Color(hex: "D23D2A"),
        ghost:           Color(hex: "7A5E5C").opacity(0.14),
        isDark:          false
    )
}

// MARK: - Typography helpers
extension Font {
    static func gsHeadline(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .serif)
    }
    static func gsBody(_ size: CGFloat, weight: Font.Weight = .regular) -> Font {
        .system(size: size, weight: weight, design: .default)
    }
}

// MARK: - ThemeEnvironment key
private struct ThemeKey: EnvironmentKey {
    static let defaultValue = GSTheme.dark
}

extension EnvironmentValues {
    var gsTheme: GSTheme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}
