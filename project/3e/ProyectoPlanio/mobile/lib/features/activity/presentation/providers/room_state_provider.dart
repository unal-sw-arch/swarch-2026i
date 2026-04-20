import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/features/activity/domain/models/room.dart';

/// Provider que mantiene la sala seleccionada actualmente
final selectedRoomProvider = StateProvider<Room?>((ref) => null);

/// Provider que mantiene la lista de tareas filtradas por sala
final roomTasksUIProvider = StateProvider.family<List<dynamic>, String?>(
  (ref, roomId) {
    if (roomId == null) return [];
    // Observar el provider de datos y mantener el estado local
    return [];
  },
);

/// Provider para estado de carga de formulario de tarea
final taskFormLoadingProvider = StateProvider<bool>((ref) => false);

/// Provider para manejar errores de formulario
final taskFormErrorProvider = StateProvider<String?>((ref) => null);

/// Provider para modo edición de tarea
final editingTaskProvider = StateProvider<dynamic?>((ref) => null);
