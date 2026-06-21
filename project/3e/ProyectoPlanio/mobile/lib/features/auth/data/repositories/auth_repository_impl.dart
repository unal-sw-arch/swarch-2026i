import 'package:planio_app/core/models/base_models.dart';
import 'package:planio_app/features/auth/data/services/auth_service.dart';
import 'package:planio_app/features/auth/domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthService _authService;

  AuthRepositoryImpl(this._authService);

  @override
  Future<User> login(String email, String password) =>
      _authService.login(email, password);

  @override
  Future<User> loginWithGoogle() => _authService.loginWithGoogle();

  @override
  Future<User> signup(String name, String email, String password) =>
      _authService.signup(name, email, password);

  @override
  Future<void> logout() => _authService.logout();

  @override
  Future<User?> getCurrentUser() => _authService.getCurrentUser();

  @override
  Future<bool> isAuthenticated() => _authService.isAuthenticated();
}
