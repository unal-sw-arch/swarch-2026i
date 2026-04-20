import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/core/services/api_service.dart';
import 'package:planio_app/core/services/storage_service.dart';
import 'package:planio_app/core/services/websocket_service.dart';

/// Providers for core services

/// API Service provider (singleton)
final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

/// Storage Service provider (singleton)
final storageServiceProvider = Provider<StorageService>((ref) {
  return StorageService();
});

/// WebSocket Service provider (singleton)
final webSocketServiceProvider = Provider<WebSocketService>((ref) {
  return WebSocketService();
});

/// Authentication token provider
final authTokenProvider = StateProvider<String?>((ref) {
  return null;
});

/// User authentication state provider
final isAuthenticatedProvider = StateProvider<bool>((ref) {
  return ref.watch(authTokenProvider) != null;
});
