import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:planio_app/features/activity/domain/models/task.dart';
import 'package:planio_app/features/activity/presentation/providers/room_state_provider.dart';

/// Pantalla para crear/editar una tarea
class TaskFormScreen extends ConsumerStatefulWidget {
  final dynamic room;
  final Task? task;

  const TaskFormScreen({
    Key? key,
    required this.room,
    this.task,
  }) : super(key: key);

  @override
  ConsumerState<TaskFormScreen> createState() => _TaskFormScreenState();
}

class _TaskFormScreenState extends ConsumerState<TaskFormScreen> {
  late TextEditingController titleController;
  late TextEditingController descriptionController;
  late TextEditingController assignedToController;
  late TextEditingController tagsController;
  
  String selectedPriority = '1'; // medium by default
  DateTime? selectedDueDate;
  late String selectedStatus;

  @override
  void initState() {
    super.initState();
    titleController = TextEditingController(text: widget.task?.title ?? '');
    descriptionController =
        TextEditingController(text: widget.task?.description ?? '');
    assignedToController =
        TextEditingController(text: widget.task?.assignedTo ?? '');
    tagsController = TextEditingController(
      text: (widget.task?.tags ?? []).join(', '),
    );
    selectedDueDate = widget.task?.dueDate;
    selectedPriority = widget.task?.priority.toString() ?? '1';
    selectedStatus = widget.task?.status ?? 'TODO';
  }

  @override
  void dispose() {
    titleController.dispose();
    descriptionController.dispose();
    assignedToController.dispose();
    tagsController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = ref.watch(taskFormLoadingProvider);
    final error = ref.watch(taskFormErrorProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.task == null ? 'Nueva Tarea' : 'Editar Tarea'),
        backgroundColor: Colors.blue.shade800,
        foregroundColor: Colors.white,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Error message if exists
            if (error != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.red.shade100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red.shade300),
                ),
                child: Row(
                  children: [
                    Icon(Icons.error, color: Colors.red.shade800),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        error,
                        style: TextStyle(color: Colors.red.shade800),
                      ),
                    ),
                  ],
                ),
              ),
            
            if (error != null) const SizedBox(height: 16),
            
            // Title
            Text(
              'Título *',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: titleController,
              decoration: InputDecoration(
                hintText: 'Nombre de la tarea',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
              enabled: !isLoading,
            ),
            const SizedBox(height: 16),
            
            // Description
            Text(
              'Descripción',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: descriptionController,
              decoration: InputDecoration(
                hintText: 'Detalles de la tarea',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
              maxLines: 4,
              enabled: !isLoading,
            ),
            const SizedBox(height: 16),
            
            // Priority
            Text(
              'Prioridad',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: selectedPriority,
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
              items: [
                const DropdownMenuItem(value: '0', child: Text('Baja')),
                const DropdownMenuItem(value: '1', child: Text('Media')),
                const DropdownMenuItem(value: '2', child: Text('Alta')),
                const DropdownMenuItem(value: '3', child: Text('Crítica')),
              ],
              onChanged: isLoading
                  ? null
                  : (value) {
                      setState(() => selectedPriority = value ?? '1');
                    },
            ),
            const SizedBox(height: 16),
            
            // Assigned to
            Text(
              'Asignado a',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: assignedToController,
              decoration: InputDecoration(
                hintText: 'Nombre del responsable',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
              enabled: !isLoading,
            ),
            const SizedBox(height: 16),
            
            // Due Date
            Text(
              'Fecha de vencimiento',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            GestureDetector(
              onTap: isLoading ? null : _selectDueDate,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8),
                  color: Colors.grey.shade50,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      selectedDueDate == null
                          ? 'Selecciona una fecha'
                          : '${selectedDueDate!.day}/${selectedDueDate!.month}/${selectedDueDate!.year}',
                    ),
                    Icon(
                      Icons.calendar_today,
                      color: Colors.grey.shade600,
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            // Tags
            Text(
              'Etiquetas (separadas por comas)',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: tagsController,
              decoration: InputDecoration(
                hintText: 'ej: urgente, backend, testing',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
              enabled: !isLoading,
            ),
            const SizedBox(height: 16),
            
            // Status
            Text(
              'Estado',
              style: Theme.of(context).textTheme.titleSmall,
            ),
            const SizedBox(height: 8),
            DropdownButtonFormField<String>(
              value: selectedStatus,
              decoration: InputDecoration(
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
              ),
              items: const [
                DropdownMenuItem(value: 'TODO', child: Text('Por Hacer')),
                DropdownMenuItem(value: 'DONE', child: Text('Hecho')),
              ],
              onChanged: isLoading
                  ? null
                  : (value) {
                      setState(() => selectedStatus = value ?? 'TODO');
                    },
            ),
            const SizedBox(height: 32),
            
            // Action buttons
            SizedBox(
              width: double.infinity,
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: isLoading ? null : () => context.pop(),
                      child: const Text('Cancelar'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: isLoading ? null : _handleSubmit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue.shade800,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                              ),
                            )
                          : Text(
                              widget.task == null ? 'Crear' : 'Guardar',
                              style: const TextStyle(color: Colors.white),
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _selectDueDate() async {
    final pickedDate = await showDatePicker(
      context: context,
      initialDate: selectedDueDate ?? DateTime.now(),
      firstDate: DateTime.now(),
      lastDate: DateTime(2030),
    );

    if (pickedDate != null) {
      setState(() => selectedDueDate = pickedDate);
    }
  }

  void _handleSubmit() {
    if (titleController.text.isEmpty) {
      ref.read(taskFormErrorProvider.notifier).state =
          'El título es requerido';
      return;
    }

    ref.read(taskFormErrorProvider.notifier).state = null;
    ref.read(taskFormLoadingProvider.notifier).state = true;

    // Simulate API call
    Future.delayed(const Duration(seconds: 1), () {
      ref.read(taskFormLoadingProvider.notifier).state = false;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            widget.task == null
                ? 'Tarea creada (en desarrollo)'
                : 'Tarea actualizada (en desarrollo)',
          ),
        ),
      );
      
      context.pop();
    });

    // TODO: Implementar llamada a repositorio
    // final taskRepository = ref.read(taskRepositoryProvider);
    // try {
    //   if (widget.task == null) {
    //     await taskRepository.createTask(...)
    //   } else {
    //     await taskRepository.updateTask(...)
    //   }
    //   if (mounted) {
    //     context.pop();
    //   }
    // } catch (e) {
    //   ref.read(taskFormErrorProvider.notifier).state = e.toString();
    // }
  }
}
