import 'package:planio_app/core/constants/api_endpoints.dart';
import 'package:planio_app/core/services/api_service.dart';
import 'package:planio_app/features/activity/domain/models/habit.dart';
import 'package:planio_app/features/activity/domain/repositories/activity_repository.dart';

/// Implementación de HabitRepository
class HabitRepositoryImpl implements HabitRepository {
  final ApiService apiService;

  HabitRepositoryImpl({required this.apiService});

  @override
  Future<List<Habit>> getHabitsByRoom(String roomId) async {
    try {
      final response = await apiService.get(
        ApiEndpoints.habits,
        queryParameters: {'roomId': roomId},
      );
      
      if (response is List) {
        return response
            .map((item) => Habit.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<Habit>> getHabitsByUser(String roomId, String userId) async {
    try {
      final response = await apiService.get(
        ApiEndpoints.habits,
        queryParameters: {
          'roomId': roomId,
          'userId': userId,
        },
      );
      
      if (response is List) {
        return response
            .map((item) => Habit.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Habit> getHabitById(String habitId) async {
    try {
      final response = await apiService.get<Habit>(
        ApiEndpoints.habitById(habitId),
        fromJson: (data) => Habit.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Habit> createHabit({
    required String roomId,
    required String name,
    required String description,
    required String frequency,
    int? coinsReward,
  }) async {
    try {
      final response = await apiService.post<Habit>(
        ApiEndpoints.habits,
        data: {
          'roomId': roomId,
          'name': name,
          'description': description,
          'frequency': frequency,
          'coinsReward': coinsReward,
        },
        fromJson: (data) => Habit.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Habit> updateHabit(Habit habit) async {
    try {
      final response = await apiService.put<Habit>(
        ApiEndpoints.habitById(habit.id),
        data: habit.toJson(),
        fromJson: (data) => Habit.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteHabit(String habitId) async {
    try {
      await apiService.delete<void>(ApiEndpoints.habitById(habitId));
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<HabitCompletion> completeHabit(String habitId) async {
    try {
      final response = await apiService.post<HabitCompletion>(
        '${ApiEndpoints.habitById(habitId)}/complete',
        fromJson: (data) =>
            HabitCompletion.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<HabitCompletion>> getHabitCompletions(
    String habitId, {
    int limit = 30,
  }) async {
    try {
      final response = await apiService.get(
        '${ApiEndpoints.habitById(habitId)}/completions',
        queryParameters: {'limit': limit},
      );
      
      if (response is List) {
        return response
            .map((item) =>
                HabitCompletion.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }
}
