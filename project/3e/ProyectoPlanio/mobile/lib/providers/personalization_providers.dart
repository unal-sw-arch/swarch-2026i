import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Personalization state providers

/// User's avatars
final avatarsProvider = StateProvider<List<dynamic>>((ref) {
  return [];
});

/// User's items/collectibles
final itemsProvider = StateProvider<List<dynamic>>((ref) {
  return [];
});

/// Virtual rooms
final virtualRoomsProvider = StateProvider<List<dynamic>>((ref) {
  return [];
});

/// User coins balance
final coinsProvider = StateProvider<int>((ref) {
  return 0;
});

/// Loading state for personalization operations
final personalizationLoadingProvider = StateProvider<bool>((ref) {
  return false;
});

/// Error message for personalization operations
final personalizationErrorProvider = StateProvider<String?>((ref) {
  return null;
});
