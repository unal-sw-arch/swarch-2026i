import 'dart:convert';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:planio_app/core/models/base_models.dart';
import 'package:planio_app/core/services/storage_service.dart';

/// AuthService para Planio - Integrado con ProyectoPlanio Gateway
///
/// **Desarrollo (Actual):**
/// - Usa autenticación local simulada
/// - No requiere conexión al gateway
/// - Perfecto para testing y desarrollo
///
/// **Producción:**
/// Para integrar con Firebase (usado por el gateway de ProyectoPlanio):
/// 1. Instala: `flutter pub add firebase_core firebase_auth`
/// 2. Configura Firebase en main.dart
/// 3. Descomentar código Firebase en este archivo
/// 4. Los tokens se enviarán al Gateway automáticamente
class AuthService {
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final StorageService _storageService;
  static const String _userKey = 'user_data';
  static const String _tokenKey = 'auth_token';
  
  // Configuración del Gateway de ProyectoPlanio
  static const String _gatewayUrl = 'http://localhost:8000';

  AuthService(this._storageService);

  /// Simula un login con API
  Future<User> login(String email, String password) async {
    try {
      // Validaciones básicas
      if (email.isEmpty || password.isEmpty) {
        throw Exception('Email y contraseña son requeridos');
      }

      if (!email.contains('@')) {
        throw Exception('Email inválido');
      }

      // Simular delay de API
      await Future.delayed(const Duration(seconds: 1));

      // Simular respuesta exitosa
      final user = User(
        id: 'user_${DateTime.now().millisecondsSinceEpoch}',
        email: email,
        name: email.split('@').first,
        coins: 0,
        createdAt: DateTime.now(),
      );

      // Guardar en storage local
      await _storageService.saveString(_tokenKey, 'token_${DateTime.now().millisecondsSinceEpoch}');
      await _storageService.saveString(_userKey, jsonEncode(user.toJson()));

      return user;
    } catch (e) {
      throw Exception('Error en login: ${e.toString()}');
    }
  }

  /// Simula un signup con API
  Future<User> signup(String name, String email, String password) async {
    try {
      // Validaciones básicas
      if (name.isEmpty || email.isEmpty || password.isEmpty) {
        throw Exception('Todos los campos son requeridos');
      }

      if (!email.contains('@')) {
        throw Exception('Email inválido');
      }

      if (password.length < 6) {
        throw Exception('La contraseña debe tener al menos 6 caracteres');
      }

      // Simular delay de API
      await Future.delayed(const Duration(seconds: 1));

      // Simular respuesta exitosa
      final user = User(
        id: 'user_${DateTime.now().millisecondsSinceEpoch}',
        email: email,
        name: name,
        coins: 0,
        createdAt: DateTime.now(),
      );

      // Guardar en storage local
      await _storageService.saveString(_tokenKey, 'token_${DateTime.now().millisecondsSinceEpoch}');
      await _storageService.saveString(_userKey, jsonEncode(user.toJson()));

      return user;
    } catch (e) {
      throw Exception('Error en signup: ${e.toString()}');
    }
  }

  /// Obtiene el usuario actual
  Future<User?> getCurrentUser() async {
    try {
      final userJson = _storageService.getString(_userKey);
      if (userJson == null) return null;

      final jsonMap = jsonDecode(userJson) as Map<String, dynamic>;
      return User.fromJson(jsonMap);
    } catch (e) {
      return null;
    }
  }

  /// Verifica si el usuario está autenticado
  Future<bool> isAuthenticated() async {
    try {
      final token = _storageService.getString(_tokenKey);
      return token != null && token.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  /// Login con Google
  Future<User> loginWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      
      if (googleUser == null) {
        throw Exception('Google sign-in cancelled by user');
      }

      // Obtener información del usuario
      final email = googleUser.email;
      final displayName = googleUser.displayName ?? email.split('@').first;
      final photoUrl = googleUser.photoUrl;

      // Simular delay de API
      await Future.delayed(const Duration(milliseconds: 500));

      // Crear usuario con datos de Google
      final user = User(
        id: googleUser.id,
        email: email,
        name: displayName,
        coins: 0,
        createdAt: DateTime.now(),
      );

      // Guardar en storage local
      await _storageService.saveString(_tokenKey, 'google_token_${googleUser.id}');
      await _storageService.saveString(_userKey, jsonEncode(user.toJson()));

      return user;
    } catch (e) {
      throw Exception('Error en Google login: ${e.toString()}');
    }
  }

  /// Cierra la sesión
  Future<void> logout() async {
    try {
      await _googleSignIn.signOut();
      await _storageService.remove(_tokenKey);
      await _storageService.remove(_userKey);
    } catch (e) {
      throw Exception('Error en logout: ${e.toString()}');
    }
  }
}
