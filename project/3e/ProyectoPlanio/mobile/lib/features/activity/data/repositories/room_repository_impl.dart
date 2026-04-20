import 'package:planio_app/core/constants/api_endpoints.dart';
import 'package:planio_app/core/services/api_service.dart';
import 'package:planio_app/features/activity/domain/models/room.dart';
import 'package:planio_app/features/activity/domain/repositories/room_repository.dart';

/// Implementación de RoomRepository
class RoomRepositoryImpl implements RoomRepository {
  final ApiService apiService;

  RoomRepositoryImpl({required this.apiService});

  @override
  Future<List<Room>> getAllRooms() async {
    try {
      final response = await apiService.get(
        ApiEndpoints.rooms,
      );
      
      if (response is List) {
        return response
            .map((item) => Room.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Room> getRoomById(String roomId) async {
    try {
      final response = await apiService.get<Room>(
        ApiEndpoints.roomById(roomId),
        fromJson: (data) => Room.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Room> createRoom({
    required String name,
    required String description,
  }) async {
    try {
      final response = await apiService.post<Room>(
        ApiEndpoints.rooms,
        data: {
          'name': name,
          'description': description,
        },
        fromJson: (data) => Room.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<Room> updateRoom(Room room) async {
    try {
      final response = await apiService.put<Room>(
        ApiEndpoints.roomById(room.id),
        data: room.toJson(),
        fromJson: (data) => Room.fromJson(data as Map<String, dynamic>),
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> deleteRoom(String roomId) async {
    try {
      await apiService.delete<void>(ApiEndpoints.roomById(roomId));
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> addMember(String roomId, String userId) async {
    try {
      await apiService.post<void>(
        '${ApiEndpoints.roomById(roomId)}/members',
        data: {'userId': userId},
      );
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> removeMember(String roomId, String userId) async {
    try {
      await apiService.delete<void>(
        '${ApiEndpoints.roomById(roomId)}/members/$userId',
      );
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<RoomMember>> getRoomMembers(String roomId) async {
    try {
      final response = await apiService.get(
        '${ApiEndpoints.roomById(roomId)}/members',
      );
      
      if (response is List) {
        return response
            .map((item) => RoomMember.fromJson(item as Map<String, dynamic>))
            .toList();
      }
      return [];
    } catch (e) {
      rethrow;
    }
  }
}
