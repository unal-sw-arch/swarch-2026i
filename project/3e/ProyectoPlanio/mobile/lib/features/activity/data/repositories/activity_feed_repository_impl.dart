import 'package:planio_app/core/constants/api_endpoints.dart';
import 'package:planio_app/core/services/api_service.dart';
import 'package:planio_app/features/activity/domain/models/activity.dart';
import 'package:planio_app/features/activity/domain/repositories/activity_feed_repository.dart';

/// Implementación de ActivityFeedRepository
class ActivityFeedRepositoryImpl implements ActivityFeedRepository {
  final ApiService apiService;

  ActivityFeedRepositoryImpl({required this.apiService});

  @override
  Future<List<Activity>> getActivityFeed(
    String roomId, {
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await apiService.get(
        ApiEndpoints.activities,
        queryParameters: {
          'roomId': roomId,
          'limit': limit,
          'offset': offset,
        },
      );
      
      if (response is List) {
        return response
            .map((item) => Activity.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<Activity>> getUserActivityFeed({
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await apiService.get(
        '${ApiEndpoints.activities}/user',
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
      );
      
      if (response is List) {
        return response
            .map((item) => Activity.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Activity> recordActivity({
    required String roomId,
    required String actionType,
    required String description,
    String? targetId,
    String? targetType,
  }) async {
    try {
      final response = await apiService.post<Activity>(
        ApiEndpoints.activities,
        data: {
          'roomId': roomId,
          'actionType': actionType,
          'description': description,
          'targetId': targetId,
          'targetType': targetType,
        },
        fromJson: (data) => Activity.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }
}
