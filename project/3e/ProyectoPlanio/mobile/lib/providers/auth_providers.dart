import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/core/models/base_models.dart';
import 'package:planio_app/core/services/storage_service.dart';
import 'package:planio_app/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:planio_app/features/auth/data/services/auth_service.dart';
import 'package:planio_app/features/auth/domain/repositories/auth_repository.dart';

// Storage Service Provider
final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

// Auth Service Provider
final authServiceProvider = Provider<AuthService>((ref) {
  final storageService = ref.watch(storageServiceProvider);
  return AuthService(storageService);
});

// Auth Repository Provider
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthRepositoryImpl(authService);
});

// Currently logged in user
final currentUserProvider = StateProvider<User?>((ref) {
  return null;
});

// Loading state for auth operations
final authLoadingProvider = StateProvider<bool>((ref) {
  return false;
});

// Error message for auth operations
final authErrorProvider = StateProvider<String?>((ref) {
  return null;
});

// Authentication state check
final isAuthenticatedProvider = FutureProvider<bool>((ref) async {
  final currentUser = ref.watch(currentUserProvider);
  if (currentUser != null) {
    return true; // User is logged in if currentUserProvider has a user
  }
  
  // If no user in state, check storage
  final authRepository = ref.watch(authRepositoryProvider);
  return authRepository.isAuthenticated();
});

// Login Form State Provider
final loginEmailProvider = StateProvider<String>((ref) => '');
final loginPasswordProvider = StateProvider<String>((ref) => '');
final loginErrorProvider = StateProvider<String?>((ref) => null);
final loginLoadingProvider = StateProvider<bool>((ref) => false);

// Signup Form State Provider
final signupNameProvider = StateProvider<String>((ref) => '');
final signupEmailProvider = StateProvider<String>((ref) => '');
final signupPasswordProvider = StateProvider<String>((ref) => '');
final signupConfirmPasswordProvider = StateProvider<String>((ref) => '');
final signupErrorProvider = StateProvider<String?>((ref) => null);
final signupLoadingProvider = StateProvider<bool>((ref) => false);
