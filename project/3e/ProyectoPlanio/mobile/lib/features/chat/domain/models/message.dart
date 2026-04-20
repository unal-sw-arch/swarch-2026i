import 'package:freezed_annotation/freezed_annotation.dart';

part 'message.freezed.dart';
part 'message.g.dart';

/// Chat message model
@freezed
class Message with _$Message {
  const factory Message({
    required String id,
    required String roomId,
    required String userId,
    required String userName,
    required String content,
    required DateTime createdAt,
    DateTime? editedAt,
    String? userAvatar,
    List<String>? reactions, // emoji reactions
  }) = _Message;

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);
}
