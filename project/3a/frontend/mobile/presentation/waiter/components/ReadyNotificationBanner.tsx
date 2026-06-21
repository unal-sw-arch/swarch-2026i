import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import type { Order } from '@/core/orders/interface/order';

interface Props {
    order: Order | null;
    onDismiss: () => void;
}

const ReadyNotificationBanner = ({ order, onDismiss }: Props) => {
    const translateY = useRef(new Animated.Value(-120)).current;

    useEffect(() => {
        if (order) {
            Animated.spring(translateY, {
                toValue: 0,
                useNativeDriver: true,
                bounciness: 4,
            }).start();

            // Auto-dismiss the banner after 8 seconds so it doesn't block the UI.
            const timer = setTimeout(() => {
                Animated.timing(translateY, {
                    toValue: -120,
                    duration: 250,
                    useNativeDriver: true,
                }).start(() => onDismiss());
            }, 8000);
            return () => clearTimeout(timer);
        }
        Animated.timing(translateY, {
            toValue: -120,
            duration: 250,
            useNativeDriver: true,
        }).start();
        return undefined;
    }, [order, translateY, onDismiss]);

    if (!order) return null;

    return (
        <Animated.View
            style={[styles.container, { transform: [{ translateY }] }]}
        >
            <Pressable style={styles.banner} onPress={onDismiss}>
                <Ionicons
                    name='notifications'
                    size={22}
                    color='white'
                    style={styles.icon}
                />
                <View style={styles.textWrap}>
                    <ThemedText style={styles.title}>
                        Pedido listo · Mesa {order.tableNumber}
                    </ThemedText>
                    <ThemedText style={styles.subtitle} numberOfLines={1}>
                        Orden #{order.id} · {order.items.length}{' '}
                        {order.items.length === 1 ? 'unidad' : 'unidades'}
                    </ThemedText>
                </View>
                <Ionicons name='close' size={22} color='white' />
            </Pressable>
        </Animated.View>
    );
};

export default ReadyNotificationBanner;

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        paddingTop: 48,
        paddingHorizontal: 12,
    },
    banner: {
        backgroundColor: '#10b981',
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 6,
    },
    icon: {
        marginRight: 10,
    },
    textWrap: {
        flex: 1,
    },
    title: {
        color: 'white',
        fontWeight: '600',
    },
    subtitle: {
        color: 'white',
        opacity: 0.9,
        fontSize: 12,
    },
});
