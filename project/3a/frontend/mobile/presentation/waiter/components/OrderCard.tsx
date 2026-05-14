import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import ThemedButton from '@/presentation/theme/components/themed-button';
import type { Order, OrderItem } from '@/core/orders/interface/order';

interface Props {
    order: Order;
    // Visible primary action (e.g. "Entregada" for READY orders).
    primaryLabel?: string;
    onPrimary?: () => void;
    // Secondary action (e.g. "Cancelar").
    secondaryLabel?: string;
    onSecondary?: () => void;
    busy?: boolean;
}

interface Grouped {
    key: string;
    itemName: string;
    notes: string | null;
    count: number;
}

// Group items visually by (itemName, notes). Two units with identical notes
// render as "2x Hamburguesa (sin lechuga)"; units with different notes render
// on separate lines so per-unit instructions stay visible.
const groupItems = (items: OrderItem[]): Grouped[] => {
    const map = new Map<string, Grouped>();
    for (const item of items) {
        const key = `${item.itemName}|${item.notes ?? ''}`;
        const existing = map.get(key);
        if (existing) {
            existing.count += 1;
        } else {
            map.set(key, {
                key,
                itemName: item.itemName,
                notes: item.notes,
                count: 1,
            });
        }
    }
    return Array.from(map.values());
};

const STATUS_COLOR: Record<Order['status'], string> = {
    PENDING: '#f59e0b',
    IN_PREPARATION: '#3b82f6',
    READY: '#10b981',
    DELIVERED: '#6b7280',
    CANCELLED: '#ef4444',
};

const STATUS_LABEL: Record<Order['status'], string> = {
    PENDING: 'Pendiente',
    IN_PREPARATION: 'En preparación',
    READY: 'Lista',
    DELIVERED: 'Entregada',
    CANCELLED: 'Cancelada',
};

const OrderCard = ({
    order,
    primaryLabel,
    onPrimary,
    secondaryLabel,
    onSecondary,
    busy,
}: Props) => {
    const grouped = useMemo(() => groupItems(order.items), [order.items]);
    const createdAt = new Date(order.createdAt);
    const timeLabel = Number.isFinite(createdAt.getTime())
        ? createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <ThemedText type='defaultSemiBold' darkColor='black'>
                    Mesa {order.tableNumber}
                </ThemedText>
                <View
                    style={[
                        styles.badge,
                        { backgroundColor: STATUS_COLOR[order.status] },
                    ]}
                >
                    <ThemedText style={styles.badgeText}>
                        {STATUS_LABEL[order.status]}
                    </ThemedText>
                </View>
            </View>

            <ThemedText style={styles.meta} darkColor='#555'>
                Orden #{order.id} · {timeLabel}
            </ThemedText>

            <View style={styles.items}>
                {grouped.map((group) => (
                    <View key={group.key} style={styles.itemRow}>
                        <ThemedText darkColor='black'>
                            {group.count}x {group.itemName}
                        </ThemedText>
                        {group.notes ? (
                            <ThemedText style={styles.notes} darkColor='#666'>
                                · {group.notes}
                            </ThemedText>
                        ) : null}
                    </View>
                ))}
            </View>

            {order.notes ? (
                <ThemedText style={styles.orderNotes} darkColor='#444'>
                    Nota: {order.notes}
                </ThemedText>
            ) : null}

            {(primaryLabel || secondaryLabel) && (
                <View style={styles.actions}>
                    {secondaryLabel && onSecondary && (
                        <View style={styles.action}>
                            <ThemedButton onPress={onSecondary} disabled={busy}>
                                {secondaryLabel}
                            </ThemedButton>
                        </View>
                    )}
                    {primaryLabel && onPrimary && (
                        <View style={styles.action}>
                            <ThemedButton onPress={onPrimary} disabled={busy}>
                                {primaryLabel}
                            </ThemedButton>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

export default OrderCard;

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#F9F9F9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    badgeText: {
        color: 'white',
        fontSize: 12,
    },
    meta: {
        marginTop: 4,
        marginBottom: 8,
        fontSize: 12,
    },
    items: {
        gap: 2,
    },
    itemRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    notes: {
        fontStyle: 'italic',
        marginLeft: 6,
    },
    orderNotes: {
        marginTop: 6,
        fontStyle: 'italic',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    action: {
        flex: 1,
    },
});
