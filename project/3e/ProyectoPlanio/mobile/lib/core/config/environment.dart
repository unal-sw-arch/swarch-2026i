/// Environment configuration for the Planio app
class Environment {
  // API Gateway configuration
  static const String apiGatewayUrl = 'http://localhost:3000'; // Change to your IP for mobile testing
  static const String apiGatewayTimeout = '30'; // seconds
  
  // WebSocket configuration
  static const String websocketUrl = 'ws://localhost:3001'; // Change to your IP for mobile testing
  
  // Google OAuth configuration
  static const String googleClientId = 'your-google-client-id-here';
  
  // App configuration
  static const String appName = 'Planio';
  static const String appVersion = '1.0.0';
  
  // Feature flags
  static const bool enableDebugLogging = true;
  static const bool enableDevTools = true;
  
  /// Get API Gateway URL based on platform
  static String getApiGatewayUrl() {
    // For local testing, use your machine's IP address instead of localhost
    // Example: http://192.168.1.100:3000
    return apiGatewayUrl;
  }
  
  /// Get WebSocket URL based on platform
  static String getWebsocketUrl() {
    // For local testing, use your machine's IP address instead of localhost
    // Example: ws://192.168.1.100:3001
    return websocketUrl;
  }
}
