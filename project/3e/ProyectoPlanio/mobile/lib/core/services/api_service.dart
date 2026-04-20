import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:planio_app/core/config/environment.dart';
import 'package:planio_app/core/constants/app_constants.dart';
import 'package:planio_app/core/models/base_models.dart';

/// Service for making API requests to the backend
class ApiService {
  late Dio _dio;
  late String _authToken;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: Environment.getApiGatewayUrl(),
        connectTimeout: AppConstants.apiTimeout,
        receiveTimeout: AppConstants.apiTimeout,
        contentType: 'application/json',
      ),
    );

      // Add logging interceptor in debug mode
    if (Environment.enableDebugLogging) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          requestHeader: true,
          responseHeader: true,
        ),
      );
    }

    // Add auth token interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          if (_authToken.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $_authToken';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Handle token refresh here
          }
          return handler.next(error);
        },
      ),
    );
  }

  /// Set authentication token
  void setAuthToken(String token) {
    _authToken = token;
  }

  /// Clear authentication token
  void clearAuthToken() {
    _authToken = '';
    _dio.options.headers.remove('Authorization');
  }

  /// GET request
  Future<T> get<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.get(
        endpoint,
        queryParameters: queryParameters,
      );
      return _handleResponse(response, fromJson);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// POST request
  Future<T> post<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.post(
        endpoint,
        data: data,
        queryParameters: queryParameters,
      );
      return _handleResponse(response, fromJson);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// PUT request
  Future<T> put<T>(
    String endpoint, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.put(
        endpoint,
        data: data,
        queryParameters: queryParameters,
      );
      return _handleResponse(response, fromJson);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// DELETE request
  Future<T> delete<T>(
    String endpoint, {
    Map<String, dynamic>? queryParameters,
    T Function(dynamic)? fromJson,
  }) async {
    try {
      final response = await _dio.delete(
        endpoint,
        queryParameters: queryParameters,
      );
      return _handleResponse(response, fromJson);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Handle successful response
  T _handleResponse<T>(Response response, T Function(dynamic)? fromJson) {
    final data = response.data;

    if (fromJson != null) {
      return fromJson(data is String ? jsonDecode(data) : data);
    }

    return data as T;
  }

  /// Handle errors
  AppException _handleError(DioException error) {
    String message = 'Unknown error occurred';
    String? code;

    if (error.type == DioExceptionType.connectionTimeout) {
      message = 'Connection timeout';
      code = 'CONNECTION_TIMEOUT';
    } else if (error.type == DioExceptionType.receiveTimeout) {
      message = 'Receive timeout';
      code = 'RECEIVE_TIMEOUT';
    } else if (error.response != null) {
      message = error.response?.data['message'] ?? 'Server error';
      code = error.response?.statusCode.toString();
    } else {
      message = error.message ?? 'Unknown error';
    }

    return AppException(
      message: message,
      code: code,
      originalException: error,
    );
  }
}
