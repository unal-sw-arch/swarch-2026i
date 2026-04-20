import 'package:freezed_annotation/freezed_annotation.dart';

part 'room.freezed.dart';
part 'room.g.dart';

/// Room (Sala compartida) model
@freezed
class Room with _$Room {
  const factory Room({
    required String id,
    required String name,
    required String description,
    required String ownerId,
    required List<String> memberIds,
    required DateTime createdAt,
    required DateTime updatedAt,
    String? avatar,
  }) = _Room;

  factory Room.fromJson(Map<String, dynamic> json) => _$RoomFromJson(json);
}

/// Room member info
@freezed
class RoomMember with _$RoomMember {
  const factory RoomMember({
    required String userId,
    required String userName,
    required String role, // 'owner', 'member'
    required DateTime joinedAt,
    String? avatar,
  }) = _RoomMember;

  factory RoomMember.fromJson(Map<String, dynamic> json) =>
      _$RoomMemberFromJson(json);
}
