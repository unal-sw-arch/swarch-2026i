import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:planio_app/core/config/environment.dart';
import 'package:planio_app/core/constants/app_constants.dart';

/// Callback for WebSocket messages
typedef MessageCallback = void Function(Map<String, dynamic> message);

/// Service for managing WebSocket connections for real-time features
class WebSocketService {
  WebSocketChannel? _channel;
  late String _authToken;
  bool _isConnected = false;
  bool _isConnecting = false;
  Timer? _reconnectTimer;
  
  final List<MessageCallback> _listeners = [];

  /// Connect to WebSocket
  Future<bool> connect({required String authToken}) async {
    if (_isConnected || _isConnecting) return _isConnected;
    
    _isConnecting = true;
    _authToken = authToken;

    try {
      final url = Uri.parse(
        '${Environment.getWebsocketUrl()}?token=$authToken',
      );
      _channel = WebSocketChannel.connect(url);
      
      // Listen to messages
      _channel!.stream.listen(
        (message) {
          _handleMessage(message);
        },
        onError: (error) {
          print('WebSocket error: $error');
          _isConnected = false;
          _scheduleReconnect();
        },
        onDone: () {
          print('WebSocket connection closed');
          _isConnected = false;
          _scheduleReconnect();
        },
      );

      _isConnected = true;
      _isConnecting = false;
      return true;
    } catch (e) {
      print('Failed to connect to WebSocket: $e');
      _isConnecting = false;
      _scheduleReconnect();
      return false;
    }
  }

  /// Disconnect from WebSocket
  Future<void> disconnect() async {
    _reconnectTimer?.cancel();
    _isConnected = false;
    await _channel?.sink.close();
    _channel = null;
  }

  /// Send a message
  void send(String eventType, Map<String, dynamic> data) {
    if (!_isConnected) {
      print('WebSocket not connected');
      return;
    }

    final message = {
      'event': eventType,
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
    };

    _channel?.sink.add(jsonEncode(message));
  }

  /// Add a listener for messages
  void addListener(MessageCallback callback) {
    _listeners.add(callback);
  }

  /// Remove a listener
  void removeListener(MessageCallback callback) {
    _listeners.remove(callback);
  }

  /// Check if connected
  bool get isConnected => _isConnected;

  /// Handle incoming messages
  void _handleMessage(dynamic message) {
    try {
      final data = jsonDecode(message);
      
      // Notify all listeners
      for (final listener in _listeners) {
        listener(data);
      }
    } catch (e) {
      print('Failed to parse WebSocket message: $e');
    }
  }

  /// Schedule reconnection attempt
  void _scheduleReconnect() {
    _reconnectTimer?.cancel();
    _reconnectTimer = Timer(AppConstants.websocketReconnectDelay, () {
      connect(authToken: _authToken);
    });
  }
}
