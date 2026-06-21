import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/features/activity/domain/models/room.dart';
import 'package:planio_app/features/activity/presentation/widgets/habit_card.dart';
import 'package:planio_app/providers/habit_providers.dart';

class HabitsScreen extends ConsumerWidget {
  final Room? room;

  const HabitsScreen({this.room, Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final roomId = room?.id ?? '';
    final habitsAsync = ref.watch(habitsProvider(roomId));

    return Scaffold(
      appBar: AppBar(
        title: Text('${room?.name ?? 'Sala'} - Hábitos'),
        centerTitle: true,
      ),
      body: habitsAsync.when(
        data: (habits) {
          if (habits.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.check_circle_outline, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('No hay hábitos aún'),
                  SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => _showCreateHabitDialog(context, ref, roomId),
                    icon: Icon(Icons.add),
                    label: Text('Crear hábito'),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: habits.length + 1,
            itemBuilder: (context, index) {
              if (index == habits.length) {
                return Padding(
                  padding: EdgeInsets.all(16),
                  child: ElevatedButton.icon(
                    onPressed: () => _showCreateHabitDialog(context, ref, roomId),
                    icon: Icon(Icons.add),
                    label: Text('Agregar hábito'),
                  ),
                );
              }

              return Padding(
                padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                child: HabitCard(
                  habit: habits[index],
                  roomId: roomId,
                ),
              );
            },
          );
        },
        loading: () => const Center(
          child: CircularProgressIndicator(),
        ),
        error: (error, stackTrace) => Center(
          child: Text('Error: $error'),
        ),
      ),
    );
  }

  void _showCreateHabitDialog(
    BuildContext context,
    WidgetRef ref,
    String roomId,
  ) {
    final formKey = GlobalKey<FormState>();
    String name = '';
    String? description;
    String frequency = 'daily';

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Crear nuevo hábito'),
        content: SingleChildScrollView(
          child: Form(
            key: formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Nombre del hábito',
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'El nombre es requerido';
                    }
                    return null;
                  },
                  onSaved: (value) => name = value ?? '',
                ),
                SizedBox(height: 16),
                TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Descripción (opcional)',
                    border: OutlineInputBorder(),
                  ),
                  onSaved: (value) => description = value,
                  maxLines: null,
                ),
                SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: frequency,
                  decoration: InputDecoration(
                    labelText: 'Frecuencia',
                    border: OutlineInputBorder(),
                  ),
                  items: ['daily', 'weekly', 'monthly'].map((String value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Text(value),
                    );
                  }).toList(),
                  onChanged: (String? newValue) {
                    if (newValue != null) {
                      frequency = newValue;
                    }
                  },
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Cancelar'),
          ),
          ElevatedButton(
            onPressed: () {
              if (formKey.currentState!.validate()) {
                formKey.currentState!.save();
                ref.read(createHabitProvider(
                  (
                    roomId: roomId,
                    name: name,
                    description: description,
                    frequency: frequency,
                    coinsReward: null,
                  ),
                ));
                Navigator.pop(context);
              }
            },
            child: Text('Crear'),
          ),
        ],
      ),
    );
  }
}
