import React, { useMemo, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import ThemedTextInput from '@/presentation/theme/components/themed-text-input';
import ThemedButton from '@/presentation/theme/components/themed-button';
import { getRestaurantMenuItems } from '@/core/menu/actions/get-restaurant-menu-items.action';
import { createOrder } from '@/core/orders/actions/create-order.action';
import { useWaiterStore } from '@/presentation/waiter/store/useWaiterStore';
import { getWaiterRestaurantId } from '@/presentation/waiter/config';
import { ORDERS_QUERY_KEY } from '@/presentation/waiter/hooks/useOrdersRealtime';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';

const NewOrderScreen = () => {
    const restaurantId = getWaiterRestaurantId();
    const primaryColor = useThemeColor({}, 'primary');
    const queryClient = useQueryClient();
    const {
        tableNumber,
        items,
        notes,
        setTable,
        setNotes,
        addUnit,
        removeUnit,
        updateUnitNotes,
        reset,
    } = useWaiterStore();

    const [submitting, setSubmitting] = useState(false);
    const [search, setSearch] = useState('');

    const menuQuery = useQuery({
        queryKey: ['waiter', 'menu', restaurantId],
        queryFn: () => getRestaurantMenuItems(restaurantId),
        staleTime: 5 * 60 * 1000,
    });

    const filteredMenu = useMemo(() => {
        const list = menuQuery.data ?? [];
        if (!search) return list;
        const q = search.toLowerCase();
        return list.filter((item) => item.name.toLowerCase().includes(q));
    }, [menuQuery.data, search]);

    const onTableChange = (value: string) => {
        if (!value) return setTable(null);
        const parsed = Number(value);
        setTable(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
    };

    const onSubmit = async () => {
        if (tableNumber === null) {
            Alert.alert('Mesa', 'Ingresa el número de mesa');
            return;
        }
        if (items.length === 0) {
            Alert.alert('Sin ítems', 'Añade al menos un producto a la orden');
            return;
        }

        try {
            setSubmitting(true);
            await createOrder({
                restaurantId,
                tableNumber,
                notes: notes || null,
                items: items.map((item) => ({
                    itemName: item.itemName,
                    notes: item.notes || null,
                })),
            });
            await queryClient.invalidateQueries({
                queryKey: [...ORDERS_QUERY_KEY, restaurantId],
            });
            reset();
            router.push('/(waiter-app)/(tabs)/active');
        } catch (err) {
            console.log('createOrder error', err);
            Alert.alert('Error', 'No se pudo crear la orden');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.content}>
                {/* ── Table Number ── */}
                <View style={styles.sectionHeader}>
                    <Ionicons name='restaurant-outline' size={18} color={primaryColor} />
                    <ThemedText style={styles.sectionTitle}>Mesa</ThemedText>
                </View>
                <ThemedTextInput
                    placeholder='Número de mesa'
                    keyboardType='number-pad'
                    icon='restaurant-outline'
                    value={tableNumber !== null ? String(tableNumber) : ''}
                    onChangeText={onTableChange}
                />

                {/* ── Menu ── */}
                <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                    <Ionicons name='book-outline' size={18} color={primaryColor} />
                    <ThemedText style={styles.sectionTitle}>Menú</ThemedText>
                    {menuQuery.data && (
                        <View style={[styles.countBadge, { backgroundColor: primaryColor }]}>
                            <ThemedText style={styles.countBadgeText}>
                                {menuQuery.data.length}
                            </ThemedText>
                        </View>
                    )}
                </View>
                <ThemedTextInput
                    placeholder='Buscar producto...'
                    icon='search-outline'
                    autoCapitalize='none'
                    value={search}
                    onChangeText={setSearch}
                />
                {menuQuery.isLoading ? (
                    <ThemedText style={styles.hint}>Cargando menú…</ThemedText>
                ) : filteredMenu.length === 0 ? (
                    <ThemedText style={styles.hint}>
                        Sin resultados. Revisa la conexión con el MenuService.
                    </ThemedText>
                ) : (
                    <View style={styles.menuList}>
                        {filteredMenu.map((item) => (
                            <Pressable
                                key={item.id}
                                onPress={() => addUnit(item.name)}
                                style={({ pressed }) => [
                                    styles.menuRow,
                                    pressed && styles.menuRowPressed,
                                ]}
                            >
                                <View style={styles.menuInfo}>
                                    <ThemedText style={styles.menuName} darkColor='#111'>
                                        {item.name}
                                    </ThemedText>
                                    {item.description ? (
                                        <ThemedText style={styles.menuDesc} numberOfLines={1}>
                                            {item.description}
                                        </ThemedText>
                                    ) : null}
                                    {item.price != null && (
                                        <ThemedText style={[styles.menuPrice, { color: primaryColor }]}>
                                            ${item.price.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
                                        </ThemedText>
                                    )}
                                </View>
                                <View style={styles.addBtn}>
                                    <Ionicons name='add' size={20} color='white' />
                                </View>
                            </Pressable>
                        ))}
                    </View>
                )}

                {/* ── Draft Items ── */}
                <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                    <Ionicons name='cart-outline' size={18} color={primaryColor} />
                    <ThemedText style={styles.sectionTitle}>
                        Pedido
                    </ThemedText>
                    <View style={[styles.countBadge, { backgroundColor: items.length > 0 ? primaryColor : '#9CA3AF' }]}>
                        <ThemedText style={styles.countBadgeText}>
                            {items.length}
                        </ThemedText>
                    </View>
                </View>

                {items.length === 0 ? (
                    <View style={styles.emptyDraft}>
                        <Ionicons name='basket-outline' size={32} color='#D1D5DB' />
                        <ThemedText style={styles.hint}>
                            Toca un producto del menú para agregarlo.
                        </ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.uid}
                        scrollEnabled={false}
                        renderItem={({ item, index }) => (
                            <View style={[styles.draftRow, index === 0 && { borderTopWidth: 0 }]}>
                                <View style={styles.draftNumber}>
                                    <ThemedText style={styles.draftNumberText}>
                                        {index + 1}
                                    </ThemedText>
                                </View>
                                <View style={styles.draftInfo}>
                                    <ThemedText style={styles.draftName} darkColor='#111'>
                                        {item.itemName}
                                    </ThemedText>
                                    <ThemedTextInput
                                        placeholder='Nota (ej: sin lechuga)'
                                        value={item.notes}
                                        onChangeText={(text) => updateUnitNotes(item.uid, text)}
                                    />
                                </View>
                                <Pressable
                                    onPress={() => removeUnit(item.uid)}
                                    style={styles.removeBtn}
                                    hitSlop={8}
                                >
                                    <Ionicons name='close-circle' size={24} color='#EF4444' />
                                </Pressable>
                            </View>
                        )}
                    />
                )}

                {/* ── Order Notes ── */}
                <View style={[styles.sectionHeader, { marginTop: 20 }]}>
                    <Ionicons name='chatbubble-outline' size={18} color={primaryColor} />
                    <ThemedText style={styles.sectionTitle}>
                        Nota de la orden
                    </ThemedText>
                </View>
                <ThemedTextInput
                    placeholder='Nota general (opcional)'
                    value={notes}
                    onChangeText={setNotes}
                />

                {/* ── Summary + Actions ── */}
                {items.length > 0 && (
                    <View style={styles.summaryBox}>
                        <View style={styles.summaryRow}>
                            <ThemedText style={styles.summaryLabel}>Mesa</ThemedText>
                            <ThemedText style={styles.summaryValue}>
                                {tableNumber ?? '—'}
                            </ThemedText>
                        </View>
                        <View style={styles.summaryRow}>
                            <ThemedText style={styles.summaryLabel}>Productos</ThemedText>
                            <ThemedText style={styles.summaryValue}>
                                {items.length} {items.length === 1 ? 'ítem' : 'ítems'}
                            </ThemedText>
                        </View>
                    </View>
                )}

                <View style={styles.actions}>
                    <ThemedButton onPress={onSubmit} disabled={submitting}>
                        {submitting ? 'Enviando…' : `Enviar a cocina (${items.length})`}
                    </ThemedButton>
                    {items.length > 0 && (
                        <>
                            <View style={{ height: 8 }} />
                            <Pressable
                                onPress={reset}
                                disabled={submitting}
                                style={({ pressed }) => [
                                    styles.ghostBtn,
                                    pressed && { opacity: 0.6 },
                                ]}
                            >
                                <Ionicons name='trash-outline' size={16} color='#EF4444' />
                                <ThemedText style={styles.ghostBtnText}>
                                    Limpiar borrador
                                </ThemedText>
                            </Pressable>
                        </>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default NewOrderScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        padding: 16,
        paddingBottom: 48,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111827',
    },
    countBadge: {
        borderRadius: 999,
        minWidth: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 6,
        marginLeft: 4,
    },
    countBadgeText: {
        color: 'white',
        fontSize: 11,
        fontWeight: '700',
    },
    hint: {
        color: '#9CA3AF',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 4,
    },
    // ── Menu list ──
    menuList: {
        marginTop: 8,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
        backgroundColor: '#FAFAFA',
    },
    menuRowPressed: {
        backgroundColor: '#F0FDF4',
    },
    menuInfo: {
        flex: 1,
    },
    menuName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
    },
    menuDesc: {
        fontSize: 12,
        color: '#9CA3AF',
        marginTop: 2,
    },
    menuPrice: {
        fontSize: 14,
        fontWeight: '700',
        marginTop: 3,
    },
    addBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#10b981',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 12,
    },
    // ── Draft items ──
    emptyDraft: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    draftRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#E5E7EB',
        gap: 10,
    },
    draftNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    draftNumberText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6B7280',
    },
    draftInfo: {
        flex: 1,
    },
    draftName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    removeBtn: {
        paddingTop: 2,
    },
    // ── Summary ──
    summaryBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        padding: 14,
        marginTop: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    summaryLabel: {
        fontSize: 13,
        color: '#6B7280',
    },
    summaryValue: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111827',
    },
    // ── Actions ──
    actions: {
        marginTop: 20,
    },
    ghostBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
    },
    ghostBtnText: {
        color: '#EF4444',
        fontSize: 14,
        fontWeight: '500',
    },
});
