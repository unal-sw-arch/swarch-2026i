import React, { useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import OrderCard from '@/presentation/waiter/components/OrderCard';
import ConnectionBadge from '@/presentation/waiter/components/ConnectionBadge';
import ReadyNotificationBanner from '@/presentation/waiter/components/ReadyNotificationBanner';
import { useOrdersRealtime, ORDERS_QUERY_KEY } from '@/presentation/waiter/hooks/useOrdersRealtime';
import { getWaiterRestaurantId } from '@/presentation/waiter/config';
import { updateOrderStatus } from '@/core/orders/actions/update-order-status.action';

const ACTIVE_STATUSES = new Set(['PENDING', 'IN_PREPARATION']);

const ActiveOrdersScreen = () => {
    const restaurantId = getWaiterRestaurantId();
    const queryClient = useQueryClient();
    const [busyId, setBusyId] = useState<number | null>(null);

    const {
        orders,
        isLoading,
        refetch,
        connected,
        readyQueue,
        dismissReady,
    } = useOrdersRealtime({ restaurantId });

    const activeOrders = useMemo(
        () => orders.filter((o) => ACTIVE_STATUSES.has(o.status)),
        [orders],
    );

    const onCancel = (orderId: number) => {
        Alert.alert(
            'Cancelar orden',
            '¿Seguro que quieres cancelar esta orden? Esta acción es definitiva.',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Sí, cancelar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setBusyId(orderId);
                            await updateOrderStatus(orderId, 'CANCELLED');
                            await queryClient.invalidateQueries({
                                queryKey: [...ORDERS_QUERY_KEY, restaurantId],
                            });
                        } catch (err) {
                            Alert.alert('Error', 'No se pudo cancelar la orden');
                        } finally {
                            setBusyId(null);
                        }
                    },
                },
            ],
        );
    };

    const banner = readyQueue[0] ?? null;

    return (
        <View style={styles.container}>
            <ReadyNotificationBanner
                order={banner}
                onDismiss={() => banner && dismissReady(banner.id)}
            />

            <View style={styles.header}>
                <ThemedText type='defaultSemiBold'>
                    {activeOrders.length}{' '}
                    {activeOrders.length === 1 ? 'orden activa' : 'órdenes activas'}
                </ThemedText>
                <ConnectionBadge connected={connected} />
            </View>

            <FlatList
                data={activeOrders}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        secondaryLabel='Cancelar'
                        onSecondary={() => onCancel(item.id)}
                        busy={busyId === item.id}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <ThemedText style={styles.emptyText}>
                            No hay órdenes activas todavía.
                        </ThemedText>
                    </View>
                }
            />
        </View>
    );
};

export default ActiveOrdersScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    list: {
        paddingBottom: 24,
    },
    empty: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6b7280',
    },
});
