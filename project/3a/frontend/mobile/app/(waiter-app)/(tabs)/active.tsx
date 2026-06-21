import React, { useMemo, useState } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import OrderCard from '@/presentation/waiter/components/OrderCard';
import ConnectionBadge from '@/presentation/waiter/components/ConnectionBadge';
import ReadyNotificationBanner from '@/presentation/waiter/components/ReadyNotificationBanner';
import { useOrdersRealtime, ORDERS_QUERY_KEY } from '@/presentation/waiter/hooks/useOrdersRealtime';
import { getWaiterRestaurantId } from '@/presentation/waiter/config';
import { updateOrderStatus } from '@/core/orders/actions/update-order-status.action';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';

const ACTIVE_STATUSES = new Set(['PENDING', 'IN_PREPARATION']);

const ActiveOrdersScreen = () => {
    const restaurantId = getWaiterRestaurantId();
    const queryClient = useQueryClient();
    const [busyId, setBusyId] = useState<number | null>(null);
    const primaryColor = useThemeColor({}, 'primary');

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

    const pendingCount = activeOrders.filter((o) => o.status === 'PENDING').length;
    const prepCount = activeOrders.filter((o) => o.status === 'IN_PREPARATION').length;

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

            {/* ── Header with stats ── */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name='time-outline' size={20} color={primaryColor} />
                    <ThemedText style={styles.headerTitle}>
                        {activeOrders.length}{' '}
                        {activeOrders.length === 1 ? 'orden activa' : 'órdenes activas'}
                    </ThemedText>
                </View>
                <ConnectionBadge connected={connected} />
            </View>

            {/* ── Status counters ── */}
            {activeOrders.length > 0 && (
                <View style={styles.statsRow}>
                    <View style={[styles.statBadge, { backgroundColor: '#FFFBEB' }]}>
                        <View style={[styles.statDot, { backgroundColor: '#F59E0B' }]} />
                        <ThemedText style={[styles.statText, { color: '#92400E' }]}>
                            {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
                        </ThemedText>
                    </View>
                    <View style={[styles.statBadge, { backgroundColor: '#EFF6FF' }]}>
                        <View style={[styles.statDot, { backgroundColor: '#3B82F6' }]} />
                        <ThemedText style={[styles.statText, { color: '#1E40AF' }]}>
                            {prepCount} en prep.
                        </ThemedText>
                    </View>
                </View>
            )}

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
                        <Ionicons name='checkmark-done-circle-outline' size={56} color='#D1D5DB' />
                        <ThemedText style={styles.emptyTitle}>
                            Todo al día
                        </ThemedText>
                        <ThemedText style={styles.emptyText}>
                            No hay órdenes activas. Las nuevas aparecerán automáticamente.
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
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 6,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#111827',
    },
    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 12,
        gap: 8,
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
        gap: 5,
    },
    statDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    statText: {
        fontSize: 12,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    empty: {
        paddingVertical: 72,
        alignItems: 'center',
        gap: 8,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#6B7280',
    },
    emptyText: {
        color: '#9CA3AF',
        textAlign: 'center',
        paddingHorizontal: 32,
        fontSize: 14,
    },
});
