import 'package:intl/intl.dart';

/// String extensions
extension StringExtensions on String {
  bool get isEmpty => length == 0;
  bool get isNotEmpty => length > 0;
  
  String capitalize() {
    if (isEmpty) return this;
    return this[0].toUpperCase() + substring(1);
  }
}

/// DateTime extensions
extension DateTimeExtensions on DateTime {
  String toFormattedString({String format = 'dd/MM/yyyy HH:mm'}) {
    return DateFormat(format).format(this);
  }
  
  String toRelativeTime() {
    final now = DateTime.now();
    final difference = now.difference(this);
    
    if (difference.inSeconds < 60) {
      return 'hace unos segundos';
    } else if (difference.inMinutes < 60) {
      return 'hace ${difference.inMinutes}m';
    } else if (difference.inHours < 24) {
      return 'hace ${difference.inHours}h';
    } else if (difference.inDays < 7) {
      return 'hace ${difference.inDays}d';
    } else {
      return toFormattedString();
    }
  }
}

/// Integer extensions
extension IntExtensions on int {
  String toCoinFormat() {
    return toString();
  }
}
