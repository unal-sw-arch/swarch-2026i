import 'package:planio_app/core/models/base_models.dart';

abstract class AuthRepository {
  Future<User> login(String email, String password);
  Future<User> loginWithGoogle();
  Future<User> signup(String name, String email, String password);
  Future<void> logout();
  Future<User?> getCurrentUser();
  Future<bool> isAuthenticated();
}
