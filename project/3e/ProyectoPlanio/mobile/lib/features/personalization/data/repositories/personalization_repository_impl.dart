import 'package:planio_app/core/constants/api_endpoints.dart';
import 'package:planio_app/core/services/api_service.dart';
import 'package:planio_app/features/personalization/domain/models/avatar.dart';
import 'package:planio_app/features/personalization/domain/repositories/personalization_repository.dart';

/// Implementación de PersonalizationRepository
class PersonalizationRepositoryImpl implements PersonalizationRepository {
  final ApiService apiService;

  PersonalizationRepositoryImpl({required this.apiService});

  @override
  Future<List<Avatar>> getUserAvatars() async {
    try {
      final response = await apiService.get(
        '${ApiEndpoints.avatars}/user',
      );
      
      if (response is List) {
        return response
            .map((item) => Avatar.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<Avatar>> getAvailableAvatars() async {
    try {
      final response = await apiService.get(
        ApiEndpoints.avatars,
      );
      
      if (response is List) {
        return response
            .map((item) => Avatar.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> setActiveAvatar(String avatarId) async {
    try {
      await apiService.put<void>(
        '${ApiEndpoints.avatars}/$avatarId/active',
      );
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<CollectibleItem>> getAvailableItems() async {
    try {
      final response = await apiService.get(
        ApiEndpoints.items,
      );
      
      if (response is List) {
        return response
            .map((item) =>
                CollectibleItem.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<CollectibleItem>> getUserOwnedItems() async {
    try {
      final response = await apiService.get(
        '${ApiEndpoints.items}/owned',
      );
      
      if (response is List) {
        return response
            .map((item) =>
                CollectibleItem.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> purchaseItem(String itemId) async {
    try {
      await apiService.post<void>(
        '${ApiEndpoints.items}/$itemId/purchase',
      );
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<int> getUserCoins() async {
    try {
      final response = await apiService.get<Map<String, dynamic>>(
        ApiEndpoints.coins,
        fromJson: (data) => data as Map<String, dynamic>,
      );
      return response['balance'] ?? 0;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> updateCoins(int amount) async {
    try {
      await apiService.post<void>(
        ApiEndpoints.coins,
        data: {'amount': amount},
      );
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<UserCollection> getUserCollection() async {
    try {
      final response = await apiService.get<UserCollection>(
        '${ApiEndpoints.avatars}/collection',
        fromJson: (data) =>
            UserCollection.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }
}
