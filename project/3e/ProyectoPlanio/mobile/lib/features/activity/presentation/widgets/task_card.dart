import 'package:flutter/material.dart';
import 'package:planio_app/features/activity/domain/models/task.dart';

/// Widget que muestra una tarjeta de tarea en el Kanban
class TaskCard extends StatelessWidget {
  final Task task;
  final String roomId;
  final VoidCallback onTap;
  final Function(String) onStatusChanged;

  const TaskCard({
    Key? key,
    required this.task,
    required this.roomId,
    required this.onTap,
    required this.onStatusChanged,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final priority = _getPriorityInfo();

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
      ),
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Título
              Text(
                task.title,
                style: const TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 8),
              
              // Descripción
              if (task.description.isNotEmpty)
                Text(
                  task.description,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              
              const SizedBox(height: 8),
              
              // Priority badge
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: priority['color'] as Color,
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  priority['label'] as String,
                  style: const TextStyle(
                    fontSize: 11,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              
              const SizedBox(height: 8),
              
              // Due date if exists
              if (task.dueDate != null)
                Row(
                  children: [
                    const Icon(
                      Icons.calendar_today,
                      size: 12,
                      color: Colors.grey,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      _formatDate(task.dueDate!),
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              
              // Tags
              if ((task.tags ?? []).isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Wrap(
                    spacing: 4,
                    children: (task.tags ?? []).map((tag) {
                      return Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 2,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.blue.shade100,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          tag,
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.blue.shade800,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              
              const SizedBox(height: 8),
              
              // Assigned to
              Row(
                children: [
                  CircleAvatar(
                    radius: 12,
                    backgroundColor: Colors.blue.shade200,
                    child: Text(
                      task.assignedTo.isNotEmpty
                          ? task.assignedTo[0].toUpperCase()
                          : '?',
                      style: const TextStyle(
                        fontSize: 10,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      task.assignedTo.isNotEmpty
                          ? task.assignedTo
                          : 'Sin asignar',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.grey.shade600,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Map<String, dynamic> _getPriorityInfo() {
    switch (task.priority) {
      case 0:
        return {'label': 'Baja', 'color': Colors.green};
      case 1:
        return {'label': 'Media', 'color': Colors.orange};
      case 2:
        return {'label': 'Alta', 'color': Colors.red};
      case 3:
        return {'label': 'Crítica', 'color': Colors.purple};
      default:
        return {'label': 'Normal', 'color': Colors.blue};
    }
  }

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final taskDate = DateTime(date.year, date.month, date.day);

    if (taskDate == today) {
      return 'Hoy';
    } else if (taskDate == yesterday) {
      return 'Ayer';
    } else {
      return '${taskDate.day}/${taskDate.month}/${taskDate.year}';
    }
  }
}
