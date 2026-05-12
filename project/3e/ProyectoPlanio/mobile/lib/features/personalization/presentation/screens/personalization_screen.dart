import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:planio_app/features/activity/domain/models/room.dart';
import 'package:planio_app/features/activity/presentation/providers/room_state_provider.dart';
import 'package:planio_app/features/personalization/data/models/shop_models.dart';
import 'package:planio_app/providers/activity_repository_providers.dart';
import 'package:planio_app/providers/personalization_providers.dart';

class PersonalizationScreen extends ConsumerWidget {
  const PersonalizationScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedRoom = ref.watch(selectedRoomProvider);

    if (selectedRoom == null) {
      final roomsAsync = ref.watch(allRoomsProvider);
      return Scaffold(
        appBar: AppBar(
          title: const Text('Personalización'),
          centerTitle: true,
        ),
        body: roomsAsync.when(
          data: (rooms) {
            if (rooms.isEmpty) {
              return const Center(
                child: Text('No tienes salas para personalizar.'),
              );
            }

            return ListView.builder(
              itemCount: rooms.length,
              itemBuilder: (context, index) {
                final room = rooms[index] as Room;
                return ListTile(
                  title: Text(room.name),
                  subtitle: const Text('Selecciona una sala para personalizar'),
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () {
                    ref.read(selectedRoomProvider.notifier).state = room;
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

    final roomId = selectedRoom.id;
    final avatarAsync = ref.watch(userAvatarProvider(roomId));
    final roomDecorationsAsync = ref.watch(roomDecorationsProvider(roomId));
    final avatarShopAsync = ref.watch(
      avatarShopProvider(ref.watch(avatarCategoryFilterProvider)),
    );
    final roomShopAsync = ref.watch(
      roomShopProvider(ref.watch(roomCategoryFilterProvider)),
    );

    return Scaffold(
      appBar: AppBar(
        title: Text('Personalización · ${selectedRoom.name}'),
        centerTitle: true,
        elevation: 0,
      ),
      body: DefaultTabController(
        length: 2,
        child: Column(
          children: [
            const TabBar(
              tabs: [
                Tab(text: 'Avatar', icon: Icon(Icons.face_outlined)),
                Tab(text: 'Sala', icon: Icon(Icons.weekend_outlined)),
              ],
            ),
            Expanded(
              child: TabBarView(
                children: [
                  Column(
                    children: [
                      _AvatarSummaryCard(avatarAsync: avatarAsync),
                      Expanded(
                        child: _ShopList(
                          title: 'Tienda de avatar',
                          shopAsync: avatarShopAsync,
                          isOwned: (itemId) => avatarAsync.maybeWhen(
                            data: (avatar) => avatar.ownedItems.contains(itemId),
                            orElse: () => false,
                          ),
                          onBuy: (item) => _buyItem(
                            context,
                            ref,
                            roomId: roomId,
                            item: item,
                            isRoomItem: false,
                          ),
                        ),
                      ),
                    ],
                  ),
                  Column(
                    children: [
                      _RoomSummaryCard(roomDecorationsAsync: roomDecorationsAsync),
                      Expanded(
                        child: _ShopList(
                          title: 'Tienda de sala',
                          shopAsync: roomShopAsync,
                          isOwned: (itemId) => roomDecorationsAsync.maybeWhen(
                            data: (room) => room.ownedItems.contains(itemId),
                            orElse: () => false,
                          ),
                          onBuy: (item) => _buyItem(
                            context,
                            ref,
                            roomId: roomId,
                            item: item,
                            isRoomItem: true,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _buyItem(
    BuildContext context,
    WidgetRef ref, {
    required String roomId,
    required ShopItem item,
    required bool isRoomItem,
  }) async {
    try {
      await ref.read(
        buyItemProvider((
          roomId: roomId,
          itemId: item.id,
          isRoomItem: isRoomItem,
        )).future,
      );

      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${item.name} comprado correctamente')),
      );
    } catch (e) {
      if (!context.mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('No se pudo comprar ${item.name}: $e')),
      );
    }
  }
}

class _AvatarSummaryCard extends StatelessWidget {
  const _AvatarSummaryCard({required this.avatarAsync});

  final AsyncValue<UserAvatar> avatarAsync;

  @override
  Widget build(BuildContext context) {
    return avatarAsync.when(
      data: (avatar) => Card(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
        child: ListTile(
          leading: const CircleAvatar(child: Icon(Icons.face_2_outlined)),
          title: const Text('Tu avatar'),
          subtitle: Text('Items de avatar desbloqueados: ${avatar.ownedItems.length}'),
        ),
      ),
      loading: () => const Padding(
        padding: EdgeInsets.all(16),
        child: LinearProgressIndicator(),
      ),
      error: (error, _) => Padding(
        padding: const EdgeInsets.all(16),
        child: Text('Error cargando avatar: $error'),
      ),
    );
  }
}

class _RoomSummaryCard extends StatelessWidget {
  const _RoomSummaryCard({required this.roomDecorationsAsync});

  final AsyncValue<RoomDecoration> roomDecorationsAsync;

  @override
  Widget build(BuildContext context) {
    return roomDecorationsAsync.when(
      data: (roomDecoration) => Card(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 8),
        child: ListTile(
          leading: const CircleAvatar(child: Icon(Icons.weekend_outlined)),
          title: const Text('Tu sala virtual'),
          subtitle: Text(
            'Items comprados: ${roomDecoration.ownedItems.length} · Colocados: ${roomDecoration.placedItems.length}',
          ),
        ),
      ),
      loading: () => const Padding(
        padding: EdgeInsets.all(16),
        child: LinearProgressIndicator(),
      ),
      error: (error, _) => Padding(
        padding: const EdgeInsets.all(16),
        child: Text('Error cargando sala virtual: $error'),
      ),
    );
  }
}

class _ShopList extends StatelessWidget {
  const _ShopList({
    required this.title,
    required this.shopAsync,
    required this.isOwned,
    required this.onBuy,
  });

  final String title;
  final AsyncValue<List<ShopItem>> shopAsync;
  final bool Function(String itemId) isOwned;
  final Future<void> Function(ShopItem item) onBuy;

  @override
  Widget build(BuildContext context) {
    return shopAsync.when(
      data: (items) {
        if (items.isEmpty) {
          return Center(child: Text('$title sin items por ahora'));
        }

        return ListView.builder(
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = items[index];
            final owned = isOwned(item.id);

            return Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: ListTile(
                leading: CircleAvatar(
                  child: Text(
                    item.imageUrl ?? (item.name.isNotEmpty ? item.name[0] : '?'),
                  ),
                ),
                title: Text(item.name),
                subtitle: Text('${item.category} · ${item.price} coins'),
                trailing: owned
                    ? const Chip(label: Text('Comprado'))
                    : FilledButton(
                        onPressed: () => onBuy(item),
                        child: const Text('Comprar'),
                      ),
              ),
            );
          },
        );
      },
      loading: () => const Center(child: CircularProgressIndicator()),
      error: (error, _) => Center(child: Text('Error en tienda: $error')),
    );
  }
}
