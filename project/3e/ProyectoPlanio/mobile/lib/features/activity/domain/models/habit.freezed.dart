// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'habit.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Habit _$HabitFromJson(Map<String, dynamic> json) {
  return _Habit.fromJson(json);
}

/// @nodoc
mixin _$Habit {
  String get id => throw _privateConstructorUsedError;
  String get roomId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  String get frequency =>
      throw _privateConstructorUsedError; // 'daily', 'weekly', 'monthly'
  int get completionStreak => throw _privateConstructorUsedError;
  int get totalCompletions => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;
  DateTime? get lastCompletedAt => throw _privateConstructorUsedError;
  String? get icon => throw _privateConstructorUsedError;
  int? get coinsReward => throw _privateConstructorUsedError;

  /// Serializes this Habit to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Habit
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $HabitCopyWith<Habit> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $HabitCopyWith<$Res> {
  factory $HabitCopyWith(Habit value, $Res Function(Habit) then) =
      _$HabitCopyWithImpl<$Res, Habit>;
  @useResult
  $Res call({
    String id,
    String roomId,
    String name,
    String description,
    String userId,
    String frequency,
    int completionStreak,
    int totalCompletions,
    DateTime createdAt,
    DateTime updatedAt,
    DateTime? lastCompletedAt,
    String? icon,
    int? coinsReward,
  });
}

/// @nodoc
class _$HabitCopyWithImpl<$Res, $Val extends Habit>
    implements $HabitCopyWith<$Res> {
  _$HabitCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Habit
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? roomId = null,
    Object? name = null,
    Object? description = null,
    Object? userId = null,
    Object? frequency = null,
    Object? completionStreak = null,
    Object? totalCompletions = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? lastCompletedAt = freezed,
    Object? icon = freezed,
    Object? coinsReward = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            roomId: null == roomId
                ? _value.roomId
                : roomId // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            description: null == description
                ? _value.description
                : description // ignore: cast_nullable_to_non_nullable
                      as String,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as String,
            frequency: null == frequency
                ? _value.frequency
                : frequency // ignore: cast_nullable_to_non_nullable
                      as String,
            completionStreak: null == completionStreak
                ? _value.completionStreak
                : completionStreak // ignore: cast_nullable_to_non_nullable
                      as int,
            totalCompletions: null == totalCompletions
                ? _value.totalCompletions
                : totalCompletions // ignore: cast_nullable_to_non_nullable
                      as int,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            updatedAt: null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            lastCompletedAt: freezed == lastCompletedAt
                ? _value.lastCompletedAt
                : lastCompletedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            icon: freezed == icon
                ? _value.icon
                : icon // ignore: cast_nullable_to_non_nullable
                      as String?,
            coinsReward: freezed == coinsReward
                ? _value.coinsReward
                : coinsReward // ignore: cast_nullable_to_non_nullable
                      as int?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$HabitImplCopyWith<$Res> implements $HabitCopyWith<$Res> {
  factory _$$HabitImplCopyWith(
    _$HabitImpl value,
    $Res Function(_$HabitImpl) then,
  ) = __$$HabitImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String roomId,
    String name,
    String description,
    String userId,
    String frequency,
    int completionStreak,
    int totalCompletions,
    DateTime createdAt,
    DateTime updatedAt,
    DateTime? lastCompletedAt,
    String? icon,
    int? coinsReward,
  });
}

/// @nodoc
class __$$HabitImplCopyWithImpl<$Res>
    extends _$HabitCopyWithImpl<$Res, _$HabitImpl>
    implements _$$HabitImplCopyWith<$Res> {
  __$$HabitImplCopyWithImpl(
    _$HabitImpl _value,
    $Res Function(_$HabitImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Habit
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? roomId = null,
    Object? name = null,
    Object? description = null,
    Object? userId = null,
    Object? frequency = null,
    Object? completionStreak = null,
    Object? totalCompletions = null,
    Object? createdAt = null,
    Object? updatedAt = null,
    Object? lastCompletedAt = freezed,
    Object? icon = freezed,
    Object? coinsReward = freezed,
  }) {
    return _then(
      _$HabitImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        roomId: null == roomId
            ? _value.roomId
            : roomId // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        description: null == description
            ? _value.description
            : description // ignore: cast_nullable_to_non_nullable
                  as String,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String,
        frequency: null == frequency
            ? _value.frequency
            : frequency // ignore: cast_nullable_to_non_nullable
                  as String,
        completionStreak: null == completionStreak
            ? _value.completionStreak
            : completionStreak // ignore: cast_nullable_to_non_nullable
                  as int,
        totalCompletions: null == totalCompletions
            ? _value.totalCompletions
            : totalCompletions // ignore: cast_nullable_to_non_nullable
                  as int,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        updatedAt: null == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        lastCompletedAt: freezed == lastCompletedAt
            ? _value.lastCompletedAt
            : lastCompletedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        icon: freezed == icon
            ? _value.icon
            : icon // ignore: cast_nullable_to_non_nullable
                  as String?,
        coinsReward: freezed == coinsReward
            ? _value.coinsReward
            : coinsReward // ignore: cast_nullable_to_non_nullable
                  as int?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$HabitImpl implements _Habit {
  const _$HabitImpl({
    required this.id,
    required this.roomId,
    required this.name,
    required this.description,
    required this.userId,
    required this.frequency,
    required this.completionStreak,
    required this.totalCompletions,
    required this.createdAt,
    required this.updatedAt,
    this.lastCompletedAt,
    this.icon,
    this.coinsReward,
  });

  factory _$HabitImpl.fromJson(Map<String, dynamic> json) =>
      _$$HabitImplFromJson(json);

  @override
  final String id;
  @override
  final String roomId;
  @override
  final String name;
  @override
  final String description;
  @override
  final String userId;
  @override
  final String frequency;
  // 'daily', 'weekly', 'monthly'
  @override
  final int completionStreak;
  @override
  final int totalCompletions;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final DateTime? lastCompletedAt;
  @override
  final String? icon;
  @override
  final int? coinsReward;

  @override
  String toString() {
    return 'Habit(id: $id, roomId: $roomId, name: $name, description: $description, userId: $userId, frequency: $frequency, completionStreak: $completionStreak, totalCompletions: $totalCompletions, createdAt: $createdAt, updatedAt: $updatedAt, lastCompletedAt: $lastCompletedAt, icon: $icon, coinsReward: $coinsReward)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$HabitImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.roomId, roomId) || other.roomId == roomId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.frequency, frequency) ||
                other.frequency == frequency) &&
            (identical(other.completionStreak, completionStreak) ||
                other.completionStreak == completionStreak) &&
            (identical(other.totalCompletions, totalCompletions) ||
                other.totalCompletions == totalCompletions) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt) &&
            (identical(other.lastCompletedAt, lastCompletedAt) ||
                other.lastCompletedAt == lastCompletedAt) &&
            (identical(other.icon, icon) || other.icon == icon) &&
            (identical(other.coinsReward, coinsReward) ||
                other.coinsReward == coinsReward));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    roomId,
    name,
    description,
    userId,
    frequency,
    completionStreak,
    totalCompletions,
    createdAt,
    updatedAt,
    lastCompletedAt,
    icon,
    coinsReward,
  );

  /// Create a copy of Habit
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$HabitImplCopyWith<_$HabitImpl> get copyWith =>
      __$$HabitImplCopyWithImpl<_$HabitImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$HabitImplToJson(this);
  }
}

abstract class _Habit implements Habit {
  const factory _Habit({
    required final String id,
    required final String roomId,
    required final String name,
    required final String description,
    required final String userId,
    required final String frequency,
    required final int completionStreak,
    required final int totalCompletions,
    required final DateTime createdAt,
    required final DateTime updatedAt,
    final DateTime? lastCompletedAt,
    final String? icon,
    final int? coinsReward,
  }) = _$HabitImpl;

  factory _Habit.fromJson(Map<String, dynamic> json) = _$HabitImpl.fromJson;

  @override
  String get id;
  @override
  String get roomId;
  @override
  String get name;
  @override
  String get description;
  @override
  String get userId;
  @override
  String get frequency; // 'daily', 'weekly', 'monthly'
  @override
  int get completionStreak;
  @override
  int get totalCompletions;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;
  @override
  DateTime? get lastCompletedAt;
  @override
  String? get icon;
  @override
  int? get coinsReward;

  /// Create a copy of Habit
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$HabitImplCopyWith<_$HabitImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

HabitCompletion _$HabitCompletionFromJson(Map<String, dynamic> json) {
  return _HabitCompletion.fromJson(json);
}

/// @nodoc
mixin _$HabitCompletion {
  String get id => throw _privateConstructorUsedError;
  String get habitId => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  DateTime get completedAt => throw _privateConstructorUsedError;
  int? get coinsEarned => throw _privateConstructorUsedError;

  /// Serializes this HabitCompletion to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of HabitCompletion
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $HabitCompletionCopyWith<HabitCompletion> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $HabitCompletionCopyWith<$Res> {
  factory $HabitCompletionCopyWith(
    HabitCompletion value,
    $Res Function(HabitCompletion) then,
  ) = _$HabitCompletionCopyWithImpl<$Res, HabitCompletion>;
  @useResult
  $Res call({
    String id,
    String habitId,
    String userId,
    DateTime completedAt,
    int? coinsEarned,
  });
}

/// @nodoc
class _$HabitCompletionCopyWithImpl<$Res, $Val extends HabitCompletion>
    implements $HabitCompletionCopyWith<$Res> {
  _$HabitCompletionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of HabitCompletion
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? habitId = null,
    Object? userId = null,
    Object? completedAt = null,
    Object? coinsEarned = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            habitId: null == habitId
                ? _value.habitId
                : habitId // ignore: cast_nullable_to_non_nullable
                      as String,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as String,
            completedAt: null == completedAt
                ? _value.completedAt
                : completedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            coinsEarned: freezed == coinsEarned
                ? _value.coinsEarned
                : coinsEarned // ignore: cast_nullable_to_non_nullable
                      as int?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$HabitCompletionImplCopyWith<$Res>
    implements $HabitCompletionCopyWith<$Res> {
  factory _$$HabitCompletionImplCopyWith(
    _$HabitCompletionImpl value,
    $Res Function(_$HabitCompletionImpl) then,
  ) = __$$HabitCompletionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String habitId,
    String userId,
    DateTime completedAt,
    int? coinsEarned,
  });
}

/// @nodoc
class __$$HabitCompletionImplCopyWithImpl<$Res>
    extends _$HabitCompletionCopyWithImpl<$Res, _$HabitCompletionImpl>
    implements _$$HabitCompletionImplCopyWith<$Res> {
  __$$HabitCompletionImplCopyWithImpl(
    _$HabitCompletionImpl _value,
    $Res Function(_$HabitCompletionImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of HabitCompletion
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? habitId = null,
    Object? userId = null,
    Object? completedAt = null,
    Object? coinsEarned = freezed,
  }) {
    return _then(
      _$HabitCompletionImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        habitId: null == habitId
            ? _value.habitId
            : habitId // ignore: cast_nullable_to_non_nullable
                  as String,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String,
        completedAt: null == completedAt
            ? _value.completedAt
            : completedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        coinsEarned: freezed == coinsEarned
            ? _value.coinsEarned
            : coinsEarned // ignore: cast_nullable_to_non_nullable
                  as int?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$HabitCompletionImpl implements _HabitCompletion {
  const _$HabitCompletionImpl({
    required this.id,
    required this.habitId,
    required this.userId,
    required this.completedAt,
    this.coinsEarned,
  });

  factory _$HabitCompletionImpl.fromJson(Map<String, dynamic> json) =>
      _$$HabitCompletionImplFromJson(json);

  @override
  final String id;
  @override
  final String habitId;
  @override
  final String userId;
  @override
  final DateTime completedAt;
  @override
  final int? coinsEarned;

  @override
  String toString() {
    return 'HabitCompletion(id: $id, habitId: $habitId, userId: $userId, completedAt: $completedAt, coinsEarned: $coinsEarned)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$HabitCompletionImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.habitId, habitId) || other.habitId == habitId) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.completedAt, completedAt) ||
                other.completedAt == completedAt) &&
            (identical(other.coinsEarned, coinsEarned) ||
                other.coinsEarned == coinsEarned));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, id, habitId, userId, completedAt, coinsEarned);

  /// Create a copy of HabitCompletion
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$HabitCompletionImplCopyWith<_$HabitCompletionImpl> get copyWith =>
      __$$HabitCompletionImplCopyWithImpl<_$HabitCompletionImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$HabitCompletionImplToJson(this);
  }
}

abstract class _HabitCompletion implements HabitCompletion {
  const factory _HabitCompletion({
    required final String id,
    required final String habitId,
    required final String userId,
    required final DateTime completedAt,
    final int? coinsEarned,
  }) = _$HabitCompletionImpl;

  factory _HabitCompletion.fromJson(Map<String, dynamic> json) =
      _$HabitCompletionImpl.fromJson;

  @override
  String get id;
  @override
  String get habitId;
  @override
  String get userId;
  @override
  DateTime get completedAt;
  @override
  int? get coinsEarned;

  /// Create a copy of HabitCompletion
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$HabitCompletionImplCopyWith<_$HabitCompletionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
