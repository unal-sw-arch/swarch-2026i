import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

const STATUS_BG: Record<Order['status'], string> = {
    PENDING: '#FFFBEB',
    IN_PREPARATION: '#EFF6FF',
    READY: '#ECFDF5',
    DELIVERED: '#F9FAFB',
    CANCELLED: '#FEF2F2',
};

const STATUS_LABEL: Record<Order['status'], string> = {
    PENDING: 'Pendiente',
    IN_PREPARATION: 'En preparación',
    READY: 'Lista',
    DELIVERED: 'Entregada',
    CANCELLED: 'Cancelada',
};

const STATUS_ICON: Record<Order['status'], keyof typeof Ionicons.glyphMap> = {
    PENDING: 'time-outline',
    IN_PREPARATION: 'flame-outline',
    READY: 'checkmark-circle-outline',
    DELIVERED: 'checkmark-done-outline',
    CANCELLED: 'close-circle-outline',
};

function timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'ahora';
    if (mins < 60) return `hace ${mins} min`;
    const hrs = Math.floor(mins / 60);
    return `hace ${hrs}h ${mins % 60}m`;
}

const OrderCard = ({
    order,
    primaryLabel,
    onPrimary,
    secondaryLabel,
    onSecondary,
    busy,
}: Props) => {
    const grouped = useMemo(() => groupItems(order.items), [order.items]);
    const statusColor = STATUS_COLOR[order.status];
    const statusBg = STATUS_BG[order.status];

    return (
        <View style={[styles.card, { borderLeftColor: statusColor, backgroundColor: statusBg }]}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name='restaurant-outline' size={16} color='#374151' />
                    <ThemedText style={styles.tableText} darkColor='#111'>
                        Mesa {order.tableNumber}
                    </ThemedText>
                </View>
                <View style={[styles.badge, { backgroundColor: statusColor }]}>
                    <Ionicons
                        name={STATUS_ICON[order.status]}
                        size={12}
                        color='white'
                        style={{ marginRight: 4 }}
                    />
                    <ThemedText style={styles.badgeText}>
                        {STATUS_LABEL[order.status]}
                    </ThemedText>
                </View>
            </View>

            {/* ── Meta ── */}
            <View style={styles.metaRow}>
                <Ionicons name='time-outline' size={12} color='#9CA3AF' />
                <ThemedText style={styles.meta} darkColor='#6B7280'>
                    {timeAgo(order.createdAt)}
                </ThemedText>
                <ThemedText style={styles.metaSep} darkColor='#D1D5DB'>|</ThemedText>
                <ThemedText style={styles.meta} darkColor='#6B7280'>
                    #{order.id}
                </ThemedText>
            </View>

            {/* ── Items ── */}
            <View style={styles.items}>
                {grouped.map((group) => (
                    <View key={group.key} style={styles.itemRow}>
                        <View style={styles.itemDot} />
                        <View style={styles.itemContent}>
                            <ThemedText style={styles.itemName} darkColor='#1F2937'>
                                {group.count}x {group.itemName}
                            </ThemedText>
                            {group.notes ? (
                                <ThemedText style={styles.itemNotes} darkColor='#6B7280'>
                                    → {group.notes}
                                </ThemedText>
                            ) : null}
                        </View>
                    </View>
                ))}
            </View>

            {/* ── Order Notes ── */}
            {order.notes ? (
                <View style={styles.orderNotesBox}>
                    <Ionicons name='chatbubble-ellipses-outline' size={13} color='#6B7280' style={{ marginRight: 6 }} />
                    <ThemedText style={styles.orderNotes} darkColor='#4B5563'>
                        {order.notes}
                    </ThemedText>
                </View>
            ) : null}

            {/* ── Actions ── */}
            {(primaryLabel || secondaryLabel) && (
                <View style={styles.actions}>
                    {secondaryLabel && onSecondary && (
                        <View style={styles.actionSecondary}>
                            <ThemedButton onPress={onSecondary} disabled={busy} variant="outline">
                                {secondaryLabel}
                            </ThemedButton>
                        </View>
                    )}
                    {primaryLabel && onPrimary && (
                        <View style={styles.actionPrimary}>
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
        borderRadius: 12,
        padding: 0,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderLeftWidth: 4,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingTop: 14,
        paddingBottom: 4,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    tableText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingBottom: 10,
        gap: 4,
    },
    meta: {
        fontSize: 12,
        color: '#9CA3AF',
    },
    metaSep: {
        fontSize: 12,
        color: '#D1D5DB',
        marginHorizontal: 2,
    },
    items: {
        paddingHorizontal: 14,
        paddingBottom: 6,
        gap: 6,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    itemDot: {
        width: 5,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: '#9CA3AF',
        marginTop: 7,
        marginRight: 8,
    },
    itemContent: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
    },
    itemNotes: {
        fontSize: 12,
        fontStyle: 'italic',
        color: '#6B7280',
        marginLeft: 2,
    },
    orderNotesBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginHorizontal: 14,
        marginBottom: 8,
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 8,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(0,0,0,0.06)',
    },
    orderNotes: {
        flex: 1,
        fontSize: 12,
        fontStyle: 'italic',
        color: '#4B5563',
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 14,
        paddingBottom: 14,
        paddingTop: 6,
    },
    actionPrimary: {
        flex: 1,
    },
    actionSecondary: {
        flex: 1,
    },
});
