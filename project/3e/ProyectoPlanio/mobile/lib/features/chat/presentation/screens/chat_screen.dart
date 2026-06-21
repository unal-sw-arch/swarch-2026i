import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/features/activity/domain/models/room.dart';
import 'package:planio_app/features/activity/presentation/providers/room_state_provider.dart';
import 'package:planio_app/features/chat/presentation/widgets/message_input.dart';
import 'package:planio_app/features/chat/presentation/widgets/message_list.dart';
import 'package:planio_app/providers/activity_repository_providers.dart';
import 'package:planio_app/providers/chat_providers.dart';
import 'package:planio_app/providers/auth_providers.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final Room? room;

  const ChatScreen({this.room, Key? key}) : super(key: key);

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  @override
  Widget build(BuildContext context) {
    final selectedRoom = ref.watch(selectedRoomProvider);
    final activeRoom = widget.room ?? selectedRoom;
    final roomId = activeRoom?.id ?? '';

    if (roomId.isEmpty) {
      final roomsAsync = ref.watch(allRoomsProvider);
      return Scaffold(
        appBar: AppBar(title: const Text('Chat')),
        body: roomsAsync.when(
          data: (rooms) {
            if (rooms.isEmpty) {
              return const Center(
                child: Text('No tienes salas. Crea o unete a una para chatear.'),
              );
            }

            return ListView.builder(
              itemCount: rooms.length,
              itemBuilder: (context, index) {
                final room = rooms[index] as Room;
                return ListTile(
                  title: Text(room.name),
                  subtitle: Text(room.description),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    ref.read(selectedRoomProvider.notifier).state = room;
                    setState(() {});
                  },
                );
              },
            );
          },
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => Center(child: Text('Error cargando salas: $error')),
        ),
      );
    }

    final messagesAsync = ref.watch(chatMessagesProvider(roomId));
    final currentUser = ref.watch(currentUserProvider);
    final chatLoading = ref.watch(chatLoadingProvider);

    return Scaffold(
      appBar: AppBar(
        title: Text(activeRoom?.name ?? 'Chat'),
        centerTitle: true,
        elevation: 0,
      ),
      body: Column(
        children: [
          Expanded(
            child: messagesAsync.when(
              data: (messages) {
                return MessageList(
                  messages: messages,
                  currentUserId: currentUser?.id ?? '',
                );
              },
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
              error: (error, stackTrace) => Center(
                child: Text('Error: $error'),
              ),
            ),
          ),
          MessageInput(
            isLoading: chatLoading,
            onSend: (message) {
              ref.read(chatInputProvider.notifier).state = message;
              ref.read(sendMessageProvider((
                roomId: roomId,
                content: message,
              )));
              ref.read(chatInputProvider.notifier).state = '';
            },
          ),
        ],
      ),
    );
  }
}
