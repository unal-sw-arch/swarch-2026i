import SwiftUI
import UIKit

// MARK: - AuthViews namespace

enum AuthViews {

    // MARK: - LoginView

    struct LoginView: View {
        @Environment(AppState.self) private var appState
        @Environment(\.gsTheme) private var theme

        @State private var email = ""
        @State private var password = ""
        @State private var showSignUp = false

        var body: some View {
            ZStack {
                ambientBackground

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        Spacer().frame(height: 70)

                        // Logo
                        logoView

                        Spacer().frame(height: 28)

                        // Headline
                        Text("Welcome back,\nwayfarer")
                            .font(.gsHeadline(32, weight: .bold))
                            .multilineTextAlignment(.center)
                            .foregroundStyle(theme.onSurface)

                        Spacer().frame(height: 8)

                        Text("Sign in to track your game deals")
                            .font(.gsBody(15))
                            .foregroundStyle(theme.onSurfaceVariant)

                        Spacer().frame(height: 40)

                        // Fields
                        VStack(spacing: 14) {
                            AuthTextField(
                                text: $email,
                                placeholder: "Email",
                                icon: "envelope",
                                keyboardType: .emailAddress,
                                isSecure: false
                            )
                            AuthTextField(
                                text: $password,
                                placeholder: "Password",
                                icon: "lock",
                                keyboardType: .default,
                                isSecure: true
                            )
                        }
                        .padding(.horizontal, 24)

                        // Error message
                        if let err = appState.authError {
                            Text(err)
                                .font(.gsBody(13))
                                .foregroundStyle(theme.error)
                                .padding(.top, 10)
                                .padding(.horizontal, 24)
                        }

                        Spacer().frame(height: 24)

                        // Sign in button
                        Group {
                            if appState.isLoading {
                                ProgressView()
                                    .tint(theme.primary)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 50)
                            } else {
                                SunsetButton(title: "Sign In", icon: "arrow.right") {
                                    Task { await appState.signIn(email: email, password: password) }
                                }
                            }
                        }
                        .padding(.horizontal, 24)

                        Spacer().frame(height: 28)

                        // Divider
                        HStack {
                            Rectangle().fill(theme.surfaceBright).frame(height: 1)
                            Text("or continue with")
                                .font(.gsBody(12))
                                .foregroundStyle(theme.onSurfaceDim)
                                .fixedSize()
                            Rectangle().fill(theme.surfaceBright).frame(height: 1)
                        }
                        .padding(.horizontal, 24)

                        Spacer().frame(height: 20)

                        // Social buttons
                        HStack(spacing: 12) {
                            socialButton(icon: "apple.logo", label: "Apple")
                            socialButton(icon: "g.circle.fill", label: "Google")
                        }
                        .padding(.horizontal, 24)

                        Spacer().frame(height: 36)

                        // Sign up link
                        Button {
                            showSignUp = true
                        } label: {
                            HStack(spacing: 4) {
                                Text("New to GameSeeker?")
                                    .foregroundStyle(theme.onSurfaceVariant)
                                Text("Create an account")
                                    .foregroundStyle(theme.primary)
                            }
                            .font(.gsBody(14))
                        }
                        .buttonStyle(.plain)

                        Spacer().frame(height: 40)
                    }
                }
            }
            .fullScreenCover(isPresented: $showSignUp) {
                AuthViews.SignUpView()
            }
        }

        // MARK: Subviews

        private var ambientBackground: some View {
            ZStack {
                theme.bg.ignoresSafeArea()

                // Orange glow
                RadialGradient(
                    colors: [theme.primary.opacity(0.28), .clear],
                    center: .init(x: 0.15, y: 0.1),
                    startRadius: 0,
                    endRadius: 280
                )
                .ignoresSafeArea()

                // Lavender glow
                RadialGradient(
                    colors: [theme.secondary.opacity(0.18), .clear],
                    center: .init(x: 0.85, y: 0.25),
                    startRadius: 0,
                    endRadius: 240
                )
                .ignoresSafeArea()
            }
        }

        private var logoView: some View {
            ZStack {
                RoundedRectangle(cornerRadius: 22)
                    .fill(
                        LinearGradient(
                            colors: [Color(hex: "FF9A5D"), Color(hex: "F9873E")],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 72, height: 72)
                    .shadow(color: theme.primary.opacity(0.5), radius: 16, y: 6)

                Image(systemName: "tag.fill")
                    .font(.system(size: 30, weight: .bold))
                    .foregroundStyle(Color(hex: "1C0800"))
                    .rotationEffect(.degrees(-45))
            }
        }

        private func socialButton(icon: String, label: String) -> some View {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .semibold))
                Text(label)
                    .font(.gsBody(14, weight: .medium))
            }
            .foregroundStyle(theme.onSurface)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(theme.surfaceHigh, in: Capsule())
            .overlay(Capsule().stroke(theme.surfaceBright, lineWidth: 1))
        }
    }

    // MARK: - SignUpView

    struct SignUpView: View {
        @Environment(AppState.self) private var appState
        @Environment(\.gsTheme) private var theme
        @Environment(\.dismiss) private var dismiss

        @State private var name = ""
        @State private var email = ""
        @State private var password = ""

        var body: some View {
            ZStack {
                ambientBackground

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        Spacer().frame(height: 60)

                        // Back
                        HStack {
                            Button { dismiss() } label: {
                                HStack(spacing: 6) {
                                    Image(systemName: "chevron.left")
                                    Text("Back")
                                }
                                .font(.gsBody(15, weight: .medium))
                                .foregroundStyle(theme.onSurfaceVariant)
                            }
                            .buttonStyle(.plain)
                            Spacer()
                        }
                        .padding(.horizontal, 24)

                        Spacer().frame(height: 36)

                        // Headline
                        VStack(spacing: 8) {
                            Image(systemName: "sparkles")
                                .font(.system(size: 32))
                                .foregroundStyle(theme.secondary)

                            Text("Create your\nsanctuary")
                                .font(.gsHeadline(32, weight: .bold))
                                .multilineTextAlignment(.center)
                                .foregroundStyle(theme.onSurface)

                            Text("Track deals, never miss a low price")
                                .font(.gsBody(15))
                                .foregroundStyle(theme.onSurfaceVariant)
                        }

                        Spacer().frame(height: 40)

                        // Fields
                        VStack(spacing: 14) {
                            AuthTextField(
                                text: $name,
                                placeholder: "Full name",
                                icon: "person",
                                keyboardType: .default,
                                isSecure: false
                            )
                            AuthTextField(
                                text: $email,
                                placeholder: "Email",
                                icon: "envelope",
                                keyboardType: .emailAddress,
                                isSecure: false
                            )
                            AuthTextField(
                                text: $password,
                                placeholder: "Password",
                                icon: "lock",
                                keyboardType: .default,
                                isSecure: true
                            )
                        }
                        .padding(.horizontal, 24)

                        // Error
                        if let err = appState.authError {
                            Text(err)
                                .font(.gsBody(13))
                                .foregroundStyle(theme.error)
                                .padding(.top, 10)
                                .padding(.horizontal, 24)
                        }

                        Spacer().frame(height: 28)

                        Group {
                            if appState.isLoading {
                                ProgressView()
                                    .tint(theme.primary)
                                    .frame(maxWidth: .infinity)
                                    .frame(height: 50)
                            } else {
                                SunsetButton(title: "Create Account", icon: "sparkles") {
                                    Task { await appState.signUp(email: email, password: password, name: name) }
                                }
                            }
                        }
                        .padding(.horizontal, 24)

                        Spacer().frame(height: 32)

                        Button { dismiss() } label: {
                            HStack(spacing: 4) {
                                Text("Already a wayfarer?")
                                    .foregroundStyle(theme.onSurfaceVariant)
                                Text("Sign in")
                                    .foregroundStyle(theme.primary)
                            }
                            .font(.gsBody(14))
                        }
                        .buttonStyle(.plain)

                        Spacer().frame(height: 40)
                    }
                }
            }
        }

        private var ambientBackground: some View {
            ZStack {
                theme.bg.ignoresSafeArea()
                RadialGradient(
                    colors: [theme.secondary.opacity(0.22), .clear],
                    center: .init(x: 0.8, y: 0.12),
                    startRadius: 0,
                    endRadius: 260
                )
                .ignoresSafeArea()
                RadialGradient(
                    colors: [theme.primary.opacity(0.18), .clear],
                    center: .init(x: 0.2, y: 0.35),
                    startRadius: 0,
                    endRadius: 200
                )
                .ignoresSafeArea()
            }
        }
    }
}

// MARK: - AuthTextField

private struct AuthTextField: View {
    @Binding var text: String
    let placeholder: String
    let icon: String
    let keyboardType: UIKeyboardType
    let isSecure: Bool
    @Environment(\.gsTheme) private var theme
    @FocusState private var focused: Bool

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(focused ? theme.primary : theme.onSurfaceVariant)
                .frame(width: 20)

            Group {
                if isSecure {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                        .keyboardType(keyboardType)
                        .autocapitalization(keyboardType == .emailAddress ? .none : .words)
                        .autocorrectionDisabled(keyboardType == .emailAddress)
                }
            }
            .font(.gsBody(15))
            .foregroundStyle(theme.onSurface)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(theme.surfaceHigh, in: RoundedRectangle(cornerRadius: 14))
        .overlay(
            RoundedRectangle(cornerRadius: 14)
                .stroke(
                    focused ? theme.primary.opacity(0.6) : theme.surfaceBright,
                    lineWidth: 1
                )
        )
        .focused($focused)
    }
}
