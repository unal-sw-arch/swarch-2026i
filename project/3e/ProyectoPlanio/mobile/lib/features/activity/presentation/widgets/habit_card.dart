import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/features/activity/domain/models/habit.dart';
import 'package:planio_app/providers/habit_providers.dart';

class HabitCard extends ConsumerWidget {
  final Habit habit;
  final String roomId;

  const HabitCard({
    required this.habit,
    required this.roomId,
    Key? key,
  }) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final completedToday = habit.lastCompletedAt != null &&
        _isSameDay(habit.lastCompletedAt!, DateTime.now());

    return Card(
      child: ListTile(
        leading: CircleAvatar(
          child: Text(
            habit.icon ?? '✓',
            style: TextStyle(fontSize: 20),
          ),
        ),
        title: Text(habit.name),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (habit.description != null) Text(habit.description!),
            SizedBox(height: 4),
            Text('Racha: ${habit.completionStreak} dias'),
          ],
        ),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            if (completedToday)
              Chip(
                label: Text('✓ Hoy'),
                backgroundColor: Colors.green,
                labelStyle: TextStyle(color: Colors.white),
              )
            else
              ElevatedButton(
                onPressed: () {
                  ref.read(completeHabitProvider(habit.id));
                },
                child: Text('Completar'),
              ),
          ],
        ),
      ),
    );
  }

  bool _isSameDay(DateTime a, DateTime b) {
    return a.year == b.year && a.month == b.month && a.day == b.day;
  }
}
