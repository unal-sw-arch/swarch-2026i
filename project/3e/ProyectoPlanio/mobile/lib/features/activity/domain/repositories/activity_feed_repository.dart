import 'package:planio_app/features/activity/domain/models/activity.dart';

/// Repository interface para el Activity feed
abstract class ActivityFeedRepository {
  /// Get activity feed for a room
  Future<List<Activity>> getActivityFeed(
    String roomId, {
    int limit = 50,
    int offset = 0,
  });

  /// Get activity feed for current user
  Future<List<Activity>> getUserActivityFeed({
    int limit = 50,
    int offset = 0,
  });

  /// Record a new activity
  Future<Activity> recordActivity({
    required String roomId,
    required String actionType,
    required String description,
    String? targetId,
    String? targetType,
  });
}
