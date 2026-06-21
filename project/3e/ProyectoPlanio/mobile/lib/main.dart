import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:planio_app/core/services/storage_service.dart';
import 'package:planio_app/features/activity/domain/models/room.dart';
import 'package:planio_app/features/activity/presentation/screens/room_selection_screen.dart';
import 'package:planio_app/features/activity/presentation/screens/kanban_board_screen.dart';
import 'package:planio_app/features/activity/presentation/screens/task_form_screen.dart';
import 'package:planio_app/features/activity/presentation/screens/habits_screen.dart';
import 'package:planio_app/features/auth/presentation/screens/login_screen.dart';
import 'package:planio_app/features/auth/presentation/screens/signup_screen.dart';
import 'package:planio_app/features/chat/presentation/screens/chat_screen.dart';
import 'package:planio_app/features/personalization/presentation/screens/personalization_screen.dart';
import 'package:planio_app/features/common/screens/home_screen.dart';
import 'package:planio_app/features/common/theme/app_theme.dart';
import 'package:planio_app/providers/auth_providers.dart';

void main() async {
  // Ensure Flutter bindings are initialized
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize storage service
  final storageService = StorageService();
  await storageService.init();
  
  // Run the app
  runApp(
    const ProviderScope(
      child: PlanioApp(),
    ),
  );
}

class PlanioApp extends ConsumerWidget {
  const PlanioApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch authentication state
    final isAuthenticatedAsync = ref.watch(isAuthenticatedProvider);

    final router = GoRouter(
      initialLocation: '/auth/login',
      redirect: (context, state) {
        // Check if user is authenticated
        final isAuthenticated = isAuthenticatedAsync.when(
          data: (value) => value,
          loading: () => false,
          error: (_, __) => false,
        );

        // If not authenticated and not on auth routes, redirect to login
        if (!isAuthenticated && !state.uri.path.startsWith('/auth')) {
          return '/auth/login';
        }

        // If authenticated and on auth routes, redirect to home
        if (isAuthenticated && state.uri.path.startsWith('/auth')) {
          return '/home';
        }

        return null;
      },
      routes: [
        // Auth routes
        GoRoute(
          path: '/auth',
          builder: (context, state) => const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          ),
          routes: [
            GoRoute(
              path: 'login',
              builder: (context, state) => const LoginScreen(),
            ),
            GoRoute(
              path: 'signup',
              builder: (context, state) => const SignupScreen(),
            ),
          ],
        ),

        // Main app routes
        GoRoute(
          path: '/home',
          builder: (context, state) => const HomeScreen(),
          routes: [
            GoRoute(
              path: 'activity',
              builder: (context, state) => const RoomSelectionScreen(),
              routes: [
                GoRoute(
                  path: 'kanban',
                  builder: (context, state) {
                    final room = state.extra;
                    return KanbanBoardScreen(room: room);
                  },
                  routes: [
                    GoRoute(
                      path: 'task-form',
                      builder: (context, state) {
                        final extra = state.extra as Map<String, dynamic>?;
                        return TaskFormScreen(
                          room: extra?['room'],
                          task: extra?['task'],
                        );
                      },
                    ),
                  ],
                ),
                GoRoute(
                  path: 'habits',
                  builder: (context, state) {
                    final room = state.extra as Room?;
                    return HabitsScreen(room: room);
                  },
                ),
              ],
            ),
            GoRoute(
              path: 'chat',
              builder: (context, state) {
                final room = state.extra as Room?;
                return ChatScreen(room: room);
              },
            ),
            GoRoute(
              path: 'personalization',
              builder: (context, state) => const PersonalizationScreen(),
            ),
          ],
        ),
      ],
    );

    return MaterialApp.router(
      title: 'Planio',
      theme: AppTheme.getLightTheme(),
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
