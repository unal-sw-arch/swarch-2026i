// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'room.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Room _$RoomFromJson(Map<String, dynamic> json) {
  return _Room.fromJson(json);
}

/// @nodoc
mixin _$Room {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get ownerId => throw _privateConstructorUsedError;
  List<String> get memberIds => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  String? get avatar => throw _privateConstructorUsedError;

  /// Serializes this Room to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Room
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RoomCopyWith<Room> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RoomCopyWith<$Res> {
  factory $RoomCopyWith(Room value, $Res Function(Room) then) =
      _$RoomCopyWithImpl<$Res, Room>;
  @useResult
  $Res call({
    String id,
    String name,
    String description,
    String ownerId,
    List<String> memberIds,
    DateTime createdAt,
    DateTime updatedAt,
    String? avatar,
  });
}

/// @nodoc
class _$RoomCopyWithImpl<$Res, $Val extends Room>
    implements $RoomCopyWith<$Res> {
  _$RoomCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Room
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? ownerId = null,
    Object? memberIds = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? avatar = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            ownerId: null == ownerId
                ? _value.ownerId
                : ownerId // ignore: cast_nullable_to_non_nullable
                      as String,
            memberIds: null == memberIds
                ? _value.memberIds
                : memberIds // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            updatedAt: null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            avatar: freezed == avatar
                ? _value.avatar
                : avatar // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RoomImplCopyWith<$Res> implements $RoomCopyWith<$Res> {
  factory _$$RoomImplCopyWith(
    _$RoomImpl value,
    $Res Function(_$RoomImpl) then,
  ) = __$$RoomImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String name,
    String description,
    String ownerId,
    List<String> memberIds,
    DateTime createdAt,
    DateTime updatedAt,
    String? avatar,
  });
}

/// @nodoc
class __$$RoomImplCopyWithImpl<$Res>
    extends _$RoomCopyWithImpl<$Res, _$RoomImpl>
    implements _$$RoomImplCopyWith<$Res> {
  __$$RoomImplCopyWithImpl(_$RoomImpl _value, $Res Function(_$RoomImpl) _then)
    : super(_value, _then);

  /// Create a copy of Room
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? ownerId = null,
    Object? memberIds = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? avatar = freezed,
  }) {
    return _then(
      _$RoomImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        ownerId: null == ownerId
            ? _value.ownerId
            : ownerId // ignore: cast_nullable_to_non_nullable
                  as String,
        memberIds: null == memberIds
            ? _value._memberIds
            : memberIds // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        updatedAt: null == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        avatar: freezed == avatar
            ? _value.avatar
            : avatar // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$RoomImpl implements _Room {
  const _$RoomImpl({
    required this.id,
    required this.name,
    required this.description,
    required this.ownerId,
    required final List<String> memberIds,
    required this.createdAt,
    required this.updatedAt,
    this.avatar,
  }) : _memberIds = memberIds;

  factory _$RoomImpl.fromJson(Map<String, dynamic> json) =>
      _$$RoomImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String description;
  @override
  final String ownerId;
  final List<String> _memberIds;
  @override
  List<String> get memberIds {
    if (_memberIds is EqualUnmodifiableListView) return _memberIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_memberIds);
  }

  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final String? avatar;

  @override
  String toString() {
    return 'Room(id: $id, name: $name, description: $description, ownerId: $ownerId, memberIds: $memberIds, createdAt: $createdAt, updatedAt: $updatedAt, avatar: $avatar)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RoomImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.ownerId, ownerId) || other.ownerId == ownerId) &&
            const DeepCollectionEquality().equals(
              other._memberIds,
              _memberIds,
            ) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    description,
    ownerId,
    const DeepCollectionEquality().hash(_memberIds),
    createdAt,
    updatedAt,
    avatar,
  );

  /// Create a copy of Room
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RoomImplCopyWith<_$RoomImpl> get copyWith =>
      __$$RoomImplCopyWithImpl<_$RoomImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RoomImplToJson(this);
  }
}

abstract class _Room implements Room {
  const factory _Room({
    required final String id,
    required final String name,
    required final String description,
    required final String ownerId,
    required final List<String> memberIds,
    required final DateTime createdAt,
    required final DateTime updatedAt,
    final String? avatar,
  }) = _$RoomImpl;

  factory _Room.fromJson(Map<String, dynamic> json) = _$RoomImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get description;
  @override
  String get ownerId;
  @override
  List<String> get memberIds;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  String? get avatar;

  /// Create a copy of Room
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RoomImplCopyWith<_$RoomImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

RoomMember _$RoomMemberFromJson(Map<String, dynamic> json) {
  return _RoomMember.fromJson(json);
}

/// @nodoc
mixin _$RoomMember {
  String get userId => throw _privateConstructorUsedError;
  String get userName => throw _privateConstructorUsedError;
  String get role => throw _privateConstructorUsedError; // 'owner', 'member'
  DateTime get joinedAt => throw _privateConstructorUsedError;
  String? get avatar => throw _privateConstructorUsedError;

  /// Serializes this RoomMember to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RoomMember
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RoomMemberCopyWith<RoomMember> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RoomMemberCopyWith<$Res> {
  factory $RoomMemberCopyWith(
    RoomMember value,
    $Res Function(RoomMember) then,
  ) = _$RoomMemberCopyWithImpl<$Res, RoomMember>;
  @useResult
  $Res call({
    String userId,
    String userName,
    String role,
    DateTime joinedAt,
    String? avatar,
  });
}

/// @nodoc
class _$RoomMemberCopyWithImpl<$Res, $Val extends RoomMember>
    implements $RoomMemberCopyWith<$Res> {
  _$RoomMemberCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RoomMember
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? userId = null,
    Object? userName = null,
    Object? role = null,
    Object? joinedAt = null,
    Object? avatar = freezed,
  }) {
    return _then(
      _value.copyWith(
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as String,
            userName: null == userName
                ? _value.userName
                : userName // ignore: cast_nullable_to_non_nullable
                      as String,
            role: null == role
                ? _value.role
                : role // ignore: cast_nullable_to_non_nullable
                      as String,
            joinedAt: null == joinedAt
                ? _value.joinedAt
                : joinedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            avatar: freezed == avatar
                ? _value.avatar
                : avatar // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RoomMemberImplCopyWith<$Res>
    implements $RoomMemberCopyWith<$Res> {
  factory _$$RoomMemberImplCopyWith(
    _$RoomMemberImpl value,
    $Res Function(_$RoomMemberImpl) then,
  ) = __$$RoomMemberImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String userId,
    String userName,
    String role,
    DateTime joinedAt,
    String? avatar,
  });
}

/// @nodoc
class __$$RoomMemberImplCopyWithImpl<$Res>
    extends _$RoomMemberCopyWithImpl<$Res, _$RoomMemberImpl>
    implements _$$RoomMemberImplCopyWith<$Res> {
  __$$RoomMemberImplCopyWithImpl(
    _$RoomMemberImpl _value,
    $Res Function(_$RoomMemberImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RoomMember
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? userId = null,
    Object? userName = null,
    Object? role = null,
    Object? joinedAt = null,
    Object? avatar = freezed,
  }) {
    return _then(
      _$RoomMemberImpl(
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String,
        userName: null == userName
            ? _value.userName
            : userName // ignore: cast_nullable_to_non_nullable
                  as String,
        role: null == role
            ? _value.role
            : role // ignore: cast_nullable_to_non_nullable
                  as String,
        joinedAt: null == joinedAt
            ? _value.joinedAt
            : joinedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        avatar: freezed == avatar
            ? _value.avatar
            : avatar // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$RoomMemberImpl implements _RoomMember {
  const _$RoomMemberImpl({
    required this.userId,
    required this.userName,
    required this.role,
    required this.joinedAt,
    this.avatar,
  });

  factory _$RoomMemberImpl.fromJson(Map<String, dynamic> json) =>
      _$$RoomMemberImplFromJson(json);

  @override
  final String userId;
  @override
  final String userName;
  @override
  final String role;
  // 'owner', 'member'
  @override
  final DateTime joinedAt;
  @override
  final String? avatar;

  @override
  String toString() {
    return 'RoomMember(userId: $userId, userName: $userName, role: $role, joinedAt: $joinedAt, avatar: $avatar)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RoomMemberImpl &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.userName, userName) ||
                other.userName == userName) &&
            (identical(other.role, role) || other.role == role) &&
            (identical(other.joinedAt, joinedAt) ||
                other.joinedAt == joinedAt) &&
            (identical(other.avatar, avatar) || other.avatar == avatar));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, userId, userName, role, joinedAt, avatar);

  /// Create a copy of RoomMember
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RoomMemberImplCopyWith<_$RoomMemberImpl> get copyWith =>
      __$$RoomMemberImplCopyWithImpl<_$RoomMemberImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$RoomMemberImplToJson(this);
  }
}

abstract class _RoomMember implements RoomMember {
  const factory _RoomMember({
    required final String userId,
    required final String userName,
    required final String role,
    required final DateTime joinedAt,
    final String? avatar,
  }) = _$RoomMemberImpl;

  factory _RoomMember.fromJson(Map<String, dynamic> json) =
      _$RoomMemberImpl.fromJson;

  @override
  String get userId;
  @override
  String get userName;
  @override
  String get role; // 'owner', 'member'
  @override
  DateTime get joinedAt;
  @override
  String? get avatar;

  /// Create a copy of RoomMember
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RoomMemberImplCopyWith<_$RoomMemberImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
