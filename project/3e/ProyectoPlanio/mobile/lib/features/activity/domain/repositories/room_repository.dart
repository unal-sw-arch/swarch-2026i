import 'package:planio_app/features/activity/domain/models/room.dart';

/// Repository interface para operaciones con Rooms
abstract class RoomRepository {
  /// Get all rooms for current user
  Future<List<Room>> getAllRooms();

  /// Get a specific room by ID
  Future<Room> getRoomById(String roomId);

  /// Create a new room
  Future<Room> createRoom({
    required String name,
    required String description,
  });

  /// Join a room using invite code
  Future<Room> joinRoom(String inviteCode);

  /// Update a room
  Future<Room> updateRoom(Room room);

  /// Delete a room
  Future<void> deleteRoom(String roomId);

  /// Add member to room
  Future<void> addMember(String roomId, String userId);

  /// Remove member from room
  Future<void> removeMember(String roomId, String userId);

  /// Get room members
  Future<List<RoomMember>> getRoomMembers(String roomId);
}
