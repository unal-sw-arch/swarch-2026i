import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/features/activity/domain/models/habit.dart';
import 'package:planio_app/features/activity/domain/repositories/activity_repository.dart';
import 'package:planio_app/features/activity/data/repositories/habit_repository_impl.dart';
import 'package:planio_app/providers/core_providers.dart';

// Habit Repository Provider
final habitRepositoryProvider = Provider<HabitRepository>((ref) {
  final apiService = ref.watch(apiServiceProvider);
  return HabitRepositoryImpl(apiService: apiService);
});

// Get habits for a specific room
final habitsProvider = FutureProvider.family<List<Habit>, String>(
  (ref, roomId) async {
    final repository = ref.watch(habitRepositoryProvider);
    return repository.getHabitsByRoom(roomId);
  },
);

// Get a specific habit
final habitProvider =
    FutureProvider.family<Habit, String>(
  (ref, habitId) async {
    final repository = ref.watch(habitRepositoryProvider);
    return repository.getHabitById(habitId);
  },
);

// Create habit provider
final createHabitProvider = FutureProvider.family<
    Habit,
    ({
      String roomId,
      String name,
      String? description,
      String frequency,
      int? coinsReward,
    })>(
  (ref, params) async {
    final repository = ref.watch(habitRepositoryProvider);
    final habit = await repository.createHabit(
      roomId: params.roomId,
      name: params.name,
      description: params.description ?? '',
      frequency: params.frequency,
      coinsReward: params.coinsReward,
    );
    ref.invalidate(habitsProvider(params.roomId));
    return habit;
  },
);

// Complete habit provider
final completeHabitProvider =
    FutureProvider.family<HabitCompletion, String>(
  (ref, habitId) async {
    final repository = ref.watch(habitRepositoryProvider);
    final completion = await repository.completeHabit(habitId);
    return completion;
  },
);

// Delete habit provider
final deleteHabitProvider =
    FutureProvider.family<void, String>(
  (ref, habitId) async {
    final repository = ref.watch(habitRepositoryProvider);
    await repository.deleteHabit(habitId);
  },
);

// Form state for creating a new habit
final habitFormProvider =
    StateNotifierProvider.family<HabitFormNotifier, HabitFormState, String>(
  (ref, roomId) => HabitFormNotifier(roomId, ref),
);

class HabitFormState {
  final String name;
  final String? description;
  final String frequency;
  final bool isLoading;
  final String? error;

  HabitFormState({
    this.name = '',
    this.description,
    this.frequency = 'daily',
    this.isLoading = false,
    this.error,
  });

  HabitFormState copyWith({
    String? name,
    String? description,
    String? frequency,
    bool? isLoading,
    String? error,
  }) {
    return HabitFormState(
      name: name ?? this.name,
      description: description ?? this.description,
      frequency: frequency ?? this.frequency,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

class HabitFormNotifier extends StateNotifier<HabitFormState> {
  final String roomId;
  final Ref ref;

  HabitFormNotifier(this.roomId, this.ref) : super(HabitFormState());

  void setName(String name) {
    state = state.copyWith(name: name);
  }

  void setDescription(String description) {
    state = state.copyWith(description: description);
  }

  void setFrequency(String frequency) {
    state = state.copyWith(frequency: frequency);
  }

  Future<void> submit() async {
    if (state.name.isEmpty) {
      state = state.copyWith(error: 'El nombre del hábito es requerido');
      return;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      await ref.read(createHabitProvider(
        (
          roomId: roomId,
          name: state.name,
          description: state.description,
          frequency: state.frequency,
          coinsReward: null
        ),
      ).future);

      state = HabitFormState(); // Reset form
    } catch (e) {
      state = state.copyWith(error: e.toString(), isLoading: false);
    }
  }
}
