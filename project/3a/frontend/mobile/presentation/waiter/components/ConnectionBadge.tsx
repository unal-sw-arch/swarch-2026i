import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/presentation/theme/components/themed-text';

const ConnectionBadge = ({ connected }: { connected: boolean }) => {
    return (
        <View
            style={[
                styles.pill,
                { backgroundColor: connected ? '#10b981' : '#9ca3af' },
            ]}
        >
            <View style={styles.dot} />
            <ThemedText style={styles.text}>
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
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'white',
        marginRight: 5,
    },
    text: {
        color: 'white',
        fontSize: 11,
    },
});
