import 'package:planio_app/core/constants/api_endpoints.dart';
import 'package:planio_app/core/services/api_service.dart';
import 'package:planio_app/features/activity/domain/models/room.dart';
import 'package:planio_app/features/activity/domain/repositories/room_repository.dart';

/// Implementación de RoomRepository
class RoomRepositoryImpl implements RoomRepository {
  final ApiService apiService;
  static final List<Room> _demoRooms = [
    Room(
      id: '1',
      name: 'Sala Demo Producto',
      description: 'Codigo de invitacion: DEMO01',
      ownerId: '1',
      memberIds: const ['1', '2'],
      createdAt: DateTime.now().subtract(const Duration(days: 3)),
      updatedAt: DateTime.now().subtract(const Duration(days: 1)),
      avatar: 'DEMO01',
    ),
    Room(
      id: '2',
      name: 'Sala Demo Sprint',
      description: 'Codigo de invitacion: DEMO02',
      ownerId: '1',
      memberIds: const ['1', '3', '4'],
      createdAt: DateTime.now().subtract(const Duration(days: 2)),
      updatedAt: DateTime.now(),
      avatar: 'DEMO02',
    ),
  ];

  RoomRepositoryImpl({required this.apiService});

  @override
  Future<List<Room>> getAllRooms() async {
    try {
      final response = await apiService.get(ApiEndpoints.rooms);

      if (response is List) {
        return response
            .map((item) => _mapRoom(item as Map<String, dynamic>))
            .toList();
      }
    } catch (_) {
      return List<Room>.from(_demoRooms);
    }

    return List<Room>.from(_demoRooms);
  }

  @override
  Future<Room> getRoomById(String roomId) async {
    try {
      final response = await apiService.get(
        ApiEndpoints.roomById(roomId),
      );

      return _mapRoom(response as Map<String, dynamic>);
    } catch (_) {
      return _demoRooms.firstWhere(
        (room) => room.id == roomId,
        orElse: () => _demoRooms.first,
      );
    }
  }

  @override
  Future<Room> createRoom({
    required String name,
    required String description,
  }) async {
    try {
      final response = await apiService.post(
        ApiEndpoints.rooms,
        data: {
          'name': name,
        },
      );

      return _mapRoom(response as Map<String, dynamic>);
    } catch (_) {
      final id = (_demoRooms.length + 1).toString();
      final inviteCode = 'DEMO$id';
      final room = Room(
        id: id,
        name: name,
        description: 'Codigo de invitacion: $inviteCode',
        ownerId: '1',
        memberIds: const ['1'],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        avatar: inviteCode,
      );
      _demoRooms.insert(0, room);
      return room;
    }
  }

  @override
  Future<Room> joinRoom(String inviteCode) async {
    try {
      final response = await apiService.post(
        '${ApiEndpoints.rooms}/join',
        data: {
          'invite_code': inviteCode,
        },
      );

      return _mapRoom(response as Map<String, dynamic>);
    } catch (_) {
      final normalizedCode = inviteCode.trim().toUpperCase();
      final existingIndex = _demoRooms.indexWhere(
        (room) => (room.avatar ?? '').toUpperCase() == normalizedCode,
      );

      if (existingIndex != -1) {
        final existing = _demoRooms[existingIndex];
        final members = List<String>.from(existing.memberIds);
        if (!members.contains('1')) {
          members.add('1');
        }
        final updated = existing.copyWith(
          memberIds: members,
          updatedAt: DateTime.now(),
        );
        _demoRooms[existingIndex] = updated;
        return updated;
      }

      final id = (_demoRooms.length + 1).toString();
      final room = Room(
        id: id,
        name: 'Sala $normalizedCode',
        description: 'Codigo de invitacion: $normalizedCode',
        ownerId: '2',
        memberIds: const ['1', '2'],
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
        avatar: normalizedCode,
      );
      _demoRooms.insert(0, room);
      return room;
    }
  }

  @override
  Future<Room> updateRoom(Room room) async {
    throw UnimplementedError(
      'updateRoom is not available in activity_service yet',
    );
  }

  @override
  Future<void> deleteRoom(String roomId) async {
    throw UnimplementedError(
      'deleteRoom is not available in activity_service yet',
    );
  }

  @override
  Future<void> addMember(String roomId, String userId) async {
    throw UnimplementedError(
      'addMember is not available; use invite code flow',
    );
  }

  @override
  Future<void> removeMember(String roomId, String userId) async {
    throw UnimplementedError(
      'removeMember is not available in activity_service yet',
    );
  }

  @override
  Future<List<RoomMember>> getRoomMembers(String roomId) async {
    try {
      final response = await apiService.get(
        ApiEndpoints.roomById(roomId),
      );

      final data = response as Map<String, dynamic>;
      final members = data['members'];
      if (members is! List) {
        return [];
      }

      return members.map((item) {
        final member = item as Map<String, dynamic>;
        return RoomMember(
          userId: '${member['id']}',
          userName: '${member['name'] ?? 'Usuario'}',
          role: 'member',
          joinedAt: DateTime.tryParse('${member['joined_at']}') ?? DateTime.now(),
        );
      }).toList();
    } catch (_) {
      final room = _demoRooms.firstWhere(
        (item) => item.id == roomId,
        orElse: () => _demoRooms.first,
      );
      return room.memberIds.map((memberId) {
        return RoomMember(
          userId: memberId,
          userName: 'Miembro $memberId',
          role: memberId == room.ownerId ? 'owner' : 'member',
          joinedAt: room.createdAt,
        );
      }).toList();
    }
  }

  Room _mapRoom(Map<String, dynamic> item) {
    final members = item['members'];
    final memberIds = <String>[];

    if (members is List) {
      for (final member in members) {
        if (member is Map<String, dynamic>) {
          memberIds.add('${member['id']}');
        }
      }
    }

    final createdAtRaw = item['created_at'] ?? item['createdAt'];
    final createdAt = DateTime.tryParse('$createdAtRaw') ?? DateTime.now();
    final inviteCode = '${item['invite_code'] ?? ''}'.trim();
    final description = inviteCode.isNotEmpty
        ? 'Codigo de invitacion: $inviteCode'
        : 'Sala de trabajo colaborativo';

    return Room(
      id: '${item['id']}',
      name: '${item['name'] ?? 'Sala'}',
      description: description,
      ownerId: '${item['created_by'] ?? ''}',
      memberIds: memberIds,
      createdAt: createdAt,
      updatedAt: createdAt,
      avatar: inviteCode.isNotEmpty ? inviteCode : null,
    );
  }
}
