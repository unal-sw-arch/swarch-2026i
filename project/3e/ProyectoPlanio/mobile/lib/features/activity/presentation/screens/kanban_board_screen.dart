import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:planio_app/features/activity/domain/models/task.dart';
import 'package:planio_app/features/activity/presentation/providers/room_state_provider.dart';
import 'package:planio_app/features/activity/presentation/widgets/task_card.dart';
import 'package:planio_app/providers/activity_repository_providers.dart';

/// Pantalla principal del tablero Kanban
class KanbanBoardScreen extends ConsumerWidget {
  final dynamic room;

  const KanbanBoardScreen({
    Key? key,
    required this.room,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tasksAsync = ref.watch(roomTasksProvider(room.id ?? ''));

    return Scaffold(
      appBar: AppBar(
        title: Text(room.name ?? 'Tablero'),
        elevation: 0,
        backgroundColor: Colors.blue.shade800,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.go('/home/activity'),
        ),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              if (value == 'details') {
                _showRoomDetails(context, room);
              } else if (value == 'members') {
                _showRoomMembers(context, ref, room);
              }
            },
            itemBuilder: (BuildContext context) => [
              const PopupMenuItem(
                value: 'details',
                child: Row(
                  children: [
                    Icon(Icons.info_outline),
                    SizedBox(width: 8),
                    Text('Detalles'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'members',
                child: Row(
                  children: [
                    Icon(Icons.people),
                    SizedBox(width: 8),
                    Text('Miembros'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: tasksAsync.when(
        data: (tasks) {
          if (tasks.isEmpty) {
            return _buildEmptyState(context);
          }

          // Separar tareas por estado
          final todoTasks =
              tasks.whereType<Task>().where((t) => t.status == 'TODO').toList();
          final doneTasks =
              tasks.whereType<Task>().where((t) => t.status == 'DONE').toList();

          return SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildKanbanColumn(
                  context,
                  ref,
                  'TODO',
                  Colors.orange.shade100,
                  Colors.orange.shade800,
                  todoTasks,
                  room.id ?? '',
                ),
                _buildKanbanColumn(
                  context,
                  ref,
                  'HECHO',
                  Colors.green.shade100,
                  Colors.green.shade800,
                  doneTasks,
                  room.id ?? '',
                ),
              ],
            ),
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: Colors.red.shade300,
              ),
              const SizedBox(height: 16),
              Text(
                'Error cargando tareas',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  ref.refresh(roomTasksProvider(room.id ?? ''));
                },
                icon: const Icon(Icons.refresh),
                label: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          context.push(
            '/home/activity/kanban/task-form',
            extra: {'room': room, 'task': null},
          );
        },
        icon: const Icon(Icons.add),
        label: const Text('Nueva Tarea'),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.checklist,
            size: 80,
            color: Colors.grey.shade300,
          ),
          const SizedBox(height: 16),
          Text(
            'No hay tareas',
            style: Theme.of(context).textTheme.titleLarge,
          ),
          const SizedBox(height: 8),
          Text(
            'Crea una nueva tarea para comenzar',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey,
                ),
          ),
        ],
      ),
    );
  }

  Widget _buildKanbanColumn(
    BuildContext context,
    WidgetRef ref,
    String status,
    Color backgroundColor,
    Color headerColor,
    List<Task> tasks,
    String roomId,
  ) {
    return Container(
      width: 350,
      height: MediaQuery.of(context).size.height - 180,
      margin: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: headerColor,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(12),
                topRight: Radius.circular(12),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  status,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${tasks.length}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: tasks.length,
              itemBuilder: (context, index) {
                final task = tasks[index];
                return TaskCard(
                  task: task,
                  roomId: roomId,
                  onTap: () {
                    ref.read(editingTaskProvider.notifier).state = task;
                  },
                  onStatusChanged: (newStatus) {
                    // TODO: Update task status
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _showRoomDetails(BuildContext context, dynamic room) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(room.name ?? 'Sala'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Descripción:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(room.description ?? 'Sin descripción'),
            const SizedBox(height: 16),
            const Text(
              'Propietario:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 4),
            Text(room.ownerId ?? 'Desconocido'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }

  void _showRoomMembers(BuildContext context, WidgetRef ref, dynamic room) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Miembros de la sala'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Total de miembros: ${room.memberIds?.length ?? 0}'),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                shrinkWrap: true,
                itemCount: room.memberIds?.length ?? 0,
                itemBuilder: (context, index) {
                  return ListTile(
                    leading: CircleAvatar(
                      child: Text('${index + 1}'),
                    ),
                    title: Text('Usuario ${index + 1}'),
                    subtitle: const Text('Miembro'),
                  );
                },
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cerrar'),
          ),
        ],
      ),
    );
  }
}
