/// API Client para conectar con el Gateway de ProyectoPlanio
class ApiClient {
  static const String gatewayUrl = 'http://localhost:8000';
  
  /// Endpoints del Gateway
  static const String activityEndpoint = '$gatewayUrl/activity';
  static const String chatEndpoint = '$gatewayUrl/chat';
  static const String personalizationEndpoint = '$gatewayUrl/personalization';
  static const String analyticsEndpoint = '$gatewayUrl/analytics';
  static const String notificationEndpoint = '$gatewayUrl/notifications';
  
  /// Headers para todas las peticiones
  static Map<String, String> getHeaders(String? token) {
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  /// Construir URL del gateway
  static String buildUrl(String endpoint, {Map<String, dynamic>? queryParams}) {
    String url = endpoint;
    if (queryParams != null && queryParams.isNotEmpty) {
      final query = queryParams.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value.toString())}')
          .join('&');
      url = '$url?$query';
    }
    return url;
  }
}
