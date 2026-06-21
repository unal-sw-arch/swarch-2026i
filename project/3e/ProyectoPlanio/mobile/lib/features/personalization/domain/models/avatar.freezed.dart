// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'avatar.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Avatar _$AvatarFromJson(Map<String, dynamic> json) {
  return _Avatar.fromJson(json);
}

/// @nodoc
mixin _$Avatar {
  String get id => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get imageUrl => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  int? get coinsCost => throw _privateConstructorUsedError;

  /// Serializes this Avatar to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Avatar
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AvatarCopyWith<Avatar> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AvatarCopyWith<$Res> {
  factory $AvatarCopyWith(Avatar value, $Res Function(Avatar) then) =
      _$AvatarCopyWithImpl<$Res, Avatar>;
  @useResult
  $Res call({
    String id,
    String userId,
    String name,
    String imageUrl,
    bool isActive,
    DateTime createdAt,
    int? coinsCost,
  });
}

/// @nodoc
class _$AvatarCopyWithImpl<$Res, $Val extends Avatar>
    implements $AvatarCopyWith<$Res> {
  _$AvatarCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Avatar
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? name = null,
    Object? imageUrl = null,
    Object? isActive = null,
    Object? createdAt = null,
    Object? coinsCost = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            imageUrl: null == imageUrl
                ? _value.imageUrl
                : imageUrl // ignore: cast_nullable_to_non_nullable
                      as String,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            coinsCost: freezed == coinsCost
                ? _value.coinsCost
                : coinsCost // ignore: cast_nullable_to_non_nullable
                      as int?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AvatarImplCopyWith<$Res> implements $AvatarCopyWith<$Res> {
  factory _$$AvatarImplCopyWith(
    _$AvatarImpl value,
    $Res Function(_$AvatarImpl) then,
  ) = __$$AvatarImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String userId,
    String name,
    String imageUrl,
    bool isActive,
    DateTime createdAt,
    int? coinsCost,
  });
}

/// @nodoc
class __$$AvatarImplCopyWithImpl<$Res>
    extends _$AvatarCopyWithImpl<$Res, _$AvatarImpl>
    implements _$$AvatarImplCopyWith<$Res> {
  __$$AvatarImplCopyWithImpl(
    _$AvatarImpl _value,
    $Res Function(_$AvatarImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Avatar
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? name = null,
    Object? imageUrl = null,
    Object? isActive = null,
    Object? createdAt = null,
    Object? coinsCost = freezed,
  }) {
    return _then(
      _$AvatarImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        imageUrl: null == imageUrl
            ? _value.imageUrl
            : imageUrl // ignore: cast_nullable_to_non_nullable
                  as String,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        coinsCost: freezed == coinsCost
            ? _value.coinsCost
            : coinsCost // ignore: cast_nullable_to_non_nullable
                  as int?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AvatarImpl implements _Avatar {
  const _$AvatarImpl({
    required this.id,
    required this.userId,
    required this.name,
    required this.imageUrl,
    required this.isActive,
    required this.createdAt,
    this.coinsCost,
  });

  factory _$AvatarImpl.fromJson(Map<String, dynamic> json) =>
      _$$AvatarImplFromJson(json);

  @override
  final String id;
  @override
  final String userId;
  @override
  final String name;
  @override
  final String imageUrl;
  @override
  final bool isActive;
  @override
  final DateTime createdAt;
  @override
  final int? coinsCost;

  @override
  String toString() {
    return 'Avatar(id: $id, userId: $userId, name: $name, imageUrl: $imageUrl, isActive: $isActive, createdAt: $createdAt, coinsCost: $coinsCost)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AvatarImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.coinsCost, coinsCost) ||
                other.coinsCost == coinsCost));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    userId,
    name,
    imageUrl,
    isActive,
    createdAt,
    coinsCost,
  );

  /// Create a copy of Avatar
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AvatarImplCopyWith<_$AvatarImpl> get copyWith =>
      __$$AvatarImplCopyWithImpl<_$AvatarImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$AvatarImplToJson(this);
  }
}

abstract class _Avatar implements Avatar {
  const factory _Avatar({
    required final String id,
    required final String userId,
    required final String name,
    required final String imageUrl,
    required final bool isActive,
    required final DateTime createdAt,
    final int? coinsCost,
  }) = _$AvatarImpl;

  factory _Avatar.fromJson(Map<String, dynamic> json) = _$AvatarImpl.fromJson;

  @override
  String get id;
  @override
  String get userId;
  @override
  String get name;
  @override
  String get imageUrl;
  @override
  bool get isActive;
  @override
  DateTime get createdAt;
  @override
  int? get coinsCost;

  /// Create a copy of Avatar
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AvatarImplCopyWith<_$AvatarImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CollectibleItem _$CollectibleItemFromJson(Map<String, dynamic> json) {
  return _CollectibleItem.fromJson(json);
}

/// @nodoc
mixin _$CollectibleItem {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  String get description => throw _privateConstructorUsedError;
  String get imageUrl => throw _privateConstructorUsedError;
  int get coinsCost => throw _privateConstructorUsedError;
  bool get isOwned => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  String? get category => throw _privateConstructorUsedError;

  /// Serializes this CollectibleItem to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CollectibleItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CollectibleItemCopyWith<CollectibleItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CollectibleItemCopyWith<$Res> {
  factory $CollectibleItemCopyWith(
    CollectibleItem value,
    $Res Function(CollectibleItem) then,
  ) = _$CollectibleItemCopyWithImpl<$Res, CollectibleItem>;
  @useResult
  $Res call({
    String id,
    String name,
    String description,
    String imageUrl,
    int coinsCost,
    bool isOwned,
    DateTime createdAt,
    String? category,
  });
}

/// @nodoc
class _$CollectibleItemCopyWithImpl<$Res, $Val extends CollectibleItem>
    implements $CollectibleItemCopyWith<$Res> {
  _$CollectibleItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CollectibleItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? imageUrl = null,
    Object? coinsCost = null,
    Object? isOwned = null,
    Object? createdAt = null,
    Object? category = freezed,
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
            imageUrl: null == imageUrl
                ? _value.imageUrl
                : imageUrl // ignore: cast_nullable_to_non_nullable
                      as String,
            coinsCost: null == coinsCost
                ? _value.coinsCost
                : coinsCost // ignore: cast_nullable_to_non_nullable
                      as int,
            isOwned: null == isOwned
                ? _value.isOwned
                : isOwned // ignore: cast_nullable_to_non_nullable
                      as bool,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            category: freezed == category
                ? _value.category
                : category // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CollectibleItemImplCopyWith<$Res>
    implements $CollectibleItemCopyWith<$Res> {
  factory _$$CollectibleItemImplCopyWith(
    _$CollectibleItemImpl value,
    $Res Function(_$CollectibleItemImpl) then,
  ) = __$$CollectibleItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String name,
    String description,
    String imageUrl,
    int coinsCost,
    bool isOwned,
    DateTime createdAt,
    String? category,
  });
}

/// @nodoc
class __$$CollectibleItemImplCopyWithImpl<$Res>
    extends _$CollectibleItemCopyWithImpl<$Res, _$CollectibleItemImpl>
    implements _$$CollectibleItemImplCopyWith<$Res> {
  __$$CollectibleItemImplCopyWithImpl(
    _$CollectibleItemImpl _value,
    $Res Function(_$CollectibleItemImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CollectibleItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? description = null,
    Object? imageUrl = null,
    Object? coinsCost = null,
    Object? isOwned = null,
    Object? createdAt = null,
    Object? category = freezed,
  }) {
    return _then(
      _$CollectibleItemImpl(
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
        imageUrl: null == imageUrl
            ? _value.imageUrl
            : imageUrl // ignore: cast_nullable_to_non_nullable
                  as String,
        coinsCost: null == coinsCost
            ? _value.coinsCost
            : coinsCost // ignore: cast_nullable_to_non_nullable
                  as int,
        isOwned: null == isOwned
            ? _value.isOwned
            : isOwned // ignore: cast_nullable_to_non_nullable
                  as bool,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        category: freezed == category
            ? _value.category
            : category // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CollectibleItemImpl implements _CollectibleItem {
  const _$CollectibleItemImpl({
    required this.id,
    required this.name,
    required this.description,
    required this.imageUrl,
    required this.coinsCost,
    required this.isOwned,
    required this.createdAt,
    this.category,
  });

  factory _$CollectibleItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$CollectibleItemImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final String description;
  @override
  final String imageUrl;
  @override
  final int coinsCost;
  @override
  final bool isOwned;
  @override
  final DateTime createdAt;
  @override
  final String? category;

  @override
  String toString() {
    return 'CollectibleItem(id: $id, name: $name, description: $description, imageUrl: $imageUrl, coinsCost: $coinsCost, isOwned: $isOwned, createdAt: $createdAt, category: $category)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CollectibleItemImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.description, description) ||
                other.description == description) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.coinsCost, coinsCost) ||
                other.coinsCost == coinsCost) &&
            (identical(other.isOwned, isOwned) || other.isOwned == isOwned) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.category, category) ||
                other.category == category));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    description,
    imageUrl,
    coinsCost,
    isOwned,
    createdAt,
    category,
  );

  /// Create a copy of CollectibleItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CollectibleItemImplCopyWith<_$CollectibleItemImpl> get copyWith =>
      __$$CollectibleItemImplCopyWithImpl<_$CollectibleItemImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CollectibleItemImplToJson(this);
  }
}

abstract class _CollectibleItem implements CollectibleItem {
  const factory _CollectibleItem({
    required final String id,
    required final String name,
    required final String description,
    required final String imageUrl,
    required final int coinsCost,
    required final bool isOwned,
    required final DateTime createdAt,
    final String? category,
  }) = _$CollectibleItemImpl;

  factory _CollectibleItem.fromJson(Map<String, dynamic> json) =
      _$CollectibleItemImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  String get description;
  @override
  String get imageUrl;
  @override
  int get coinsCost;
  @override
  bool get isOwned;
  @override
  DateTime get createdAt;
  @override
  String? get category;

  /// Create a copy of CollectibleItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CollectibleItemImplCopyWith<_$CollectibleItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

UserCollection _$UserCollectionFromJson(Map<String, dynamic> json) {
  return _UserCollection.fromJson(json);
}

/// @nodoc
mixin _$UserCollection {
  String get userId => throw _privateConstructorUsedError;
  int get totalCoins => throw _privateConstructorUsedError;
  String get activeAvatarId => throw _privateConstructorUsedError;
  List<String> get ownedAvatarIds => throw _privateConstructorUsedError;
  List<String> get ownedItemIds => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this UserCollection to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UserCollection
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UserCollectionCopyWith<UserCollection> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UserCollectionCopyWith<$Res> {
  factory $UserCollectionCopyWith(
    UserCollection value,
    $Res Function(UserCollection) then,
  ) = _$UserCollectionCopyWithImpl<$Res, UserCollection>;
  @useResult
  $Res call({
    String userId,
    int totalCoins,
    String activeAvatarId,
    List<String> ownedAvatarIds,
    List<String> ownedItemIds,
    DateTime updatedAt,
  });
}

/// @nodoc
class _$UserCollectionCopyWithImpl<$Res, $Val extends UserCollection>
    implements $UserCollectionCopyWith<$Res> {
  _$UserCollectionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UserCollection
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? userId = null,
    Object? totalCoins = null,
    Object? activeAvatarId = null,
    Object? ownedAvatarIds = null,
    Object? ownedItemIds = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _value.copyWith(
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as String,
            totalCoins: null == totalCoins
                ? _value.totalCoins
                : totalCoins // ignore: cast_nullable_to_non_nullable
                      as int,
            activeAvatarId: null == activeAvatarId
                ? _value.activeAvatarId
                : activeAvatarId // ignore: cast_nullable_to_non_nullable
                      as String,
            ownedAvatarIds: null == ownedAvatarIds
                ? _value.ownedAvatarIds
                : ownedAvatarIds // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            ownedItemIds: null == ownedItemIds
                ? _value.ownedItemIds
                : ownedItemIds // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            updatedAt: null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$UserCollectionImplCopyWith<$Res>
    implements $UserCollectionCopyWith<$Res> {
  factory _$$UserCollectionImplCopyWith(
    _$UserCollectionImpl value,
    $Res Function(_$UserCollectionImpl) then,
  ) = __$$UserCollectionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String userId,
    int totalCoins,
    String activeAvatarId,
    List<String> ownedAvatarIds,
    List<String> ownedItemIds,
    DateTime updatedAt,
  });
}

/// @nodoc
class __$$UserCollectionImplCopyWithImpl<$Res>
    extends _$UserCollectionCopyWithImpl<$Res, _$UserCollectionImpl>
    implements _$$UserCollectionImplCopyWith<$Res> {
  __$$UserCollectionImplCopyWithImpl(
    _$UserCollectionImpl _value,
    $Res Function(_$UserCollectionImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UserCollection
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? userId = null,
    Object? totalCoins = null,
    Object? activeAvatarId = null,
    Object? ownedAvatarIds = null,
    Object? ownedItemIds = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _$UserCollectionImpl(
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String,
        totalCoins: null == totalCoins
            ? _value.totalCoins
            : totalCoins // ignore: cast_nullable_to_non_nullable
                  as int,
        activeAvatarId: null == activeAvatarId
            ? _value.activeAvatarId
            : activeAvatarId // ignore: cast_nullable_to_non_nullable
                  as String,
        ownedAvatarIds: null == ownedAvatarIds
            ? _value._ownedAvatarIds
            : ownedAvatarIds // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        ownedItemIds: null == ownedItemIds
            ? _value._ownedItemIds
            : ownedItemIds // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        updatedAt: null == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UserCollectionImpl implements _UserCollection {
  const _$UserCollectionImpl({
    required this.userId,
    required this.totalCoins,
    required this.activeAvatarId,
    required final List<String> ownedAvatarIds,
    required final List<String> ownedItemIds,
    required this.updatedAt,
  }) : _ownedAvatarIds = ownedAvatarIds,
       _ownedItemIds = ownedItemIds;

  factory _$UserCollectionImpl.fromJson(Map<String, dynamic> json) =>
      _$$UserCollectionImplFromJson(json);

  @override
  final String userId;
  @override
  final int totalCoins;
  @override
  final String activeAvatarId;
  final List<String> _ownedAvatarIds;
  @override
  List<String> get ownedAvatarIds {
    if (_ownedAvatarIds is EqualUnmodifiableListView) return _ownedAvatarIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_ownedAvatarIds);
  }

  final List<String> _ownedItemIds;
  @override
  List<String> get ownedItemIds {
    if (_ownedItemIds is EqualUnmodifiableListView) return _ownedItemIds;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_ownedItemIds);
  }

  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'UserCollection(userId: $userId, totalCoins: $totalCoins, activeAvatarId: $activeAvatarId, ownedAvatarIds: $ownedAvatarIds, ownedItemIds: $ownedItemIds, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UserCollectionImpl &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.totalCoins, totalCoins) ||
                other.totalCoins == totalCoins) &&
            (identical(other.activeAvatarId, activeAvatarId) ||
                other.activeAvatarId == activeAvatarId) &&
            const DeepCollectionEquality().equals(
              other._ownedAvatarIds,
              _ownedAvatarIds,
            ) &&
            const DeepCollectionEquality().equals(
              other._ownedItemIds,
              _ownedItemIds,
            ) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    userId,
    totalCoins,
    activeAvatarId,
    const DeepCollectionEquality().hash(_ownedAvatarIds),
    const DeepCollectionEquality().hash(_ownedItemIds),
    updatedAt,
  );

  /// Create a copy of UserCollection
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UserCollectionImplCopyWith<_$UserCollectionImpl> get copyWith =>
      __$$UserCollectionImplCopyWithImpl<_$UserCollectionImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$UserCollectionImplToJson(this);
  }
}

abstract class _UserCollection implements UserCollection {
  const factory _UserCollection({
    required final String userId,
    required final int totalCoins,
    required final String activeAvatarId,
    required final List<String> ownedAvatarIds,
    required final List<String> ownedItemIds,
    required final DateTime updatedAt,
  }) = _$UserCollectionImpl;

  factory _UserCollection.fromJson(Map<String, dynamic> json) =
      _$UserCollectionImpl.fromJson;

  @override
  String get userId;
  @override
  int get totalCoins;
  @override
  String get activeAvatarId;
  @override
  List<String> get ownedAvatarIds;
  @override
  List<String> get ownedItemIds;
  @override
  DateTime get updatedAt;

  /// Create a copy of UserCollection
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UserCollectionImplCopyWith<_$UserCollectionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
