import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Chat state providers

/// List of messages for the current room
final messagesProvider = StateProvider<List<dynamic>>((ref) {
  return [];
});

/// Loading state for chat operations
final chatLoadingProvider = StateProvider<bool>((ref) {
  return false;
});

/// Error message for chat operations
final chatErrorProvider = StateProvider<String?>((ref) {
  return null;
});

/// WebSocket connection status
final wsConnectedProvider = StateProvider<bool>((ref) {
  return false;
});
