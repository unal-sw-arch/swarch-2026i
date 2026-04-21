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

const ReadyOrdersScreen = () => {
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

    const readyOrders = useMemo(
        () => orders.filter((o) => o.status === 'READY'),
        [orders],
    );

    const onDeliver = async (orderId: number) => {
        try {
            setBusyId(orderId);
            await updateOrderStatus(orderId, 'DELIVERED');
            dismissReady(orderId);
            await queryClient.invalidateQueries({
                queryKey: [...ORDERS_QUERY_KEY, restaurantId],
            });
        } catch (err) {
            Alert.alert('Error', 'No se pudo marcar como entregada');
        } finally {
            setBusyId(null);
        }
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
                    {readyOrders.length}{' '}
                    {readyOrders.length === 1 ? 'orden lista' : 'órdenes listas'}
                </ThemedText>
                <ConnectionBadge connected={connected} />
            </View>

            <FlatList
                data={readyOrders}
                keyExtractor={(item) => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
                contentContainerStyle={styles.list}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        primaryLabel='Entregada'
                        onPrimary={() => onDeliver(item.id)}
                        busy={busyId === item.id}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <ThemedText style={styles.emptyText}>
                            Ninguna orden lista por ahora. Te avisamos cuando el chef termine.
                        </ThemedText>
                    </View>
                }
            />
        </View>
    );
};

export default ReadyOrdersScreen;

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
        paddingHorizontal: 24,
    },
    emptyText: {
        color: '#6b7280',
        textAlign: 'center',
    },
});
