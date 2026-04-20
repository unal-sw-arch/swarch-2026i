import 'package:shared_preferences/shared_preferences.dart';

/// Service for managing local storage
class StorageService {
  late SharedPreferences _prefs;
  bool _initialized = false;

  /// Initialize the storage service
  Future<void> init() async {
    if (_initialized) return;
    _prefs = await SharedPreferences.getInstance();
    _initialized = true;
  }

  /// Save a string value
  Future<bool> saveString(String key, String value) async {
    await _ensureInitialized();
    return _prefs.setString(key, value);
  }

  /// Get a string value
  String? getString(String key) {
    _ensureInitializedSync();
    return _prefs.getString(key);
  }

  /// Save an integer value
  Future<bool> saveInt(String key, int value) async {
    await _ensureInitialized();
    return _prefs.setInt(key, value);
  }

  /// Get an integer value
  int? getInt(String key) {
    _ensureInitializedSync();
    return _prefs.getInt(key);
  }

  /// Save a boolean value
  Future<bool> saveBool(String key, bool value) async {
    await _ensureInitialized();
    return _prefs.setBool(key, value);
  }

  /// Get a boolean value
  bool? getBool(String key) {
    _ensureInitializedSync();
    return _prefs.getBool(key);
  }

  /// Save a list of strings
  Future<bool> saveStringList(String key, List<String> value) async {
    await _ensureInitialized();
    return _prefs.setStringList(key, value);
  }

  /// Get a list of strings
  List<String>? getStringList(String key) {
    _ensureInitializedSync();
    return _prefs.getStringList(key);
  }

  /// Remove a value by key
  Future<bool> remove(String key) async {
    await _ensureInitialized();
    return _prefs.remove(key);
  }

  /// Clear all values
  Future<bool> clear() async {
    await _ensureInitialized();
    return _prefs.clear();
  }

  /// Check if a key exists
  bool containsKey(String key) {
    _ensureInitializedSync();
    return _prefs.containsKey(key);
  }

  /// Ensure storage is initialized (async)
  Future<void> _ensureInitialized() async {
    if (!_initialized) {
      await init();
    }
  }

  /// Ensure storage is initialized (sync - will throw if not initialized)
  void _ensureInitializedSync() {
    if (!_initialized) {
      throw Exception('StorageService not initialized. Call init() first.');
    }
  }
}
