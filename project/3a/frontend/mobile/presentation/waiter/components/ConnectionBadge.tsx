import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/presentation/theme/components/themed-text';

const ConnectionBadge = ({ connected }: { connected: boolean }) => {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (connected) {
            const animation = Animated.loop(
                Animated.sequence([
                    Animated.timing(pulse, {
                        toValue: 0.3,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulse, {
                        toValue: 1,
                        duration: 800,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]),
            );
            animation.start();
            return () => animation.stop();
        }
        pulse.setValue(1);
        return undefined;
    }, [connected, pulse]);

    return (
        <View
            style={[
                styles.pill,
                {
                    backgroundColor: connected ? '#ECFDF5' : '#F3F4F6',
                    borderColor: connected ? '#A7F3D0' : '#D1D5DB',
                },
            ]}
        >
            <Animated.View
                style={[
                    styles.dot,
                    {
                        backgroundColor: connected ? '#10b981' : '#9ca3af',
                        opacity: connected ? pulse : 1,
                    },
                ]}
            />
            <ThemedText
                style={[
                    styles.text,
                    { color: connected ? '#065F46' : '#6B7280' },
                ]}
            >
                {connected ? 'En vivo' : 'Offline'}
            </ThemedText>
        </View>
    );
};

export default ConnectionBadge;

const styles = StyleSheet.create({
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        borderWidth: 1,
    },
    dot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
        marginRight: 6,
    },
    text: {
        fontSize: 11,
        fontWeight: '600',
    },
});
