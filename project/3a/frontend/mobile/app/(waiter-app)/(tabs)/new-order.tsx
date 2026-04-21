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

const NewOrderScreen = () => {
    const restaurantId = getWaiterRestaurantId();
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
                <ThemedText type='defaultSemiBold'>Mesa</ThemedText>
                <ThemedTextInput
                    placeholder='Número de mesa'
                    keyboardType='number-pad'
                    icon='restaurant-outline'
                    value={tableNumber !== null ? String(tableNumber) : ''}
                    onChangeText={onTableChange}
                />

                <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                    Menú
                </ThemedText>
                <ThemedTextInput
                    placeholder='Buscar producto'
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
                    <View>
                        {filteredMenu.map((item) => (
                            <Pressable
                                key={item.id}
                                onPress={() => addUnit(item.name)}
                                style={styles.menuRow}
                            >
                                <View style={{ flex: 1 }}>
                                    <ThemedText darkColor='black'>{item.name}</ThemedText>
                                    {item.price != null && (
                                        <ThemedText style={styles.price} darkColor='#555'>
                                            ${item.price}
                                        </ThemedText>
                                    )}
                                </View>
                                <Ionicons name='add-circle' size={28} color='#10b981' />
                            </Pressable>
                        ))}
                    </View>
                )}

                <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                    Ítems ({items.length})
                </ThemedText>

                {items.length === 0 ? (
                    <ThemedText style={styles.hint}>
                        Añade un ítem tocándolo en el menú. Cada toque agrega una unidad con
                        su propia nota.
                    </ThemedText>
                ) : (
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.uid}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <View style={styles.draftRow}>
                                <View style={{ flex: 1 }}>
                                    <ThemedText darkColor='black'>{item.itemName}</ThemedText>
                                    <ThemedTextInput
                                        placeholder='Nota (ej: sin lechuga)'
                                        value={item.notes}
                                        onChangeText={(text) => updateUnitNotes(item.uid, text)}
                                    />
                                </View>
                                <Pressable
                                    onPress={() => removeUnit(item.uid)}
                                    style={styles.removeBtn}
                                >
                                    <Ionicons name='trash-outline' size={22} color='#ef4444' />
                                </Pressable>
                            </View>
                        )}
                    />
                )}

                <ThemedText type='defaultSemiBold' style={styles.sectionTitle}>
                    Nota de la orden
                </ThemedText>
                <ThemedTextInput
                    placeholder='Nota general (opcional)'
                    value={notes}
                    onChangeText={setNotes}
                />

                <View style={styles.actions}>
                    <ThemedButton onPress={onSubmit} disabled={submitting}>
                        {submitting ? 'Enviando…' : 'Enviar a cocina'}
                    </ThemedButton>
                    <View style={{ height: 8 }} />
                    <ThemedButton onPress={reset} disabled={submitting}>
                        Limpiar borrador
                    </ThemedButton>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default NewOrderScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 12,
        paddingBottom: 40,
    },
    sectionTitle: {
        marginTop: 16,
        marginBottom: 6,
    },
    hint: {
        color: '#6b7280',
        fontStyle: 'italic',
    },
    menuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    price: {
        fontSize: 12,
    },
    draftRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        gap: 8,
    },
    removeBtn: {
        paddingTop: 6,
        paddingLeft: 6,
    },
    actions: {
        marginTop: 24,
    },
});
