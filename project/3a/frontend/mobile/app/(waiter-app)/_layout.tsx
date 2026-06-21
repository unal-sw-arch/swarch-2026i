import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import LogOutButton from '@/presentation/auth/components/LogOutButton';

// Protect the whole waiter section: require an authenticated user AND a role
// that can legitimately place/serve orders. Anything else is redirected
// (CUSTOMERS go to the products-app home; unauthenticated users to login).
const WaiterLayout = () => {
    const { status, user, checkStatus } = useAuthStore();

    useEffect(() => {
        checkStatus();
    }, []);

    if (status === 'checking') {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    if (status === 'unauthenticated') {
        return <Redirect href='/auth/login' />;
    }

    const role = user?.role;
    const canUseWaiterApp =
        role === 'WAITER' || role === 'RESTAURANT_MANAGER' || role === 'ADMIN';

    if (!canUseWaiterApp) {
        return <Redirect href='/' />;
    }

    return (
        <Stack>
            <Stack.Screen
                name='(tabs)'
                options={{
                    title: 'Mesero',
                    headerLeft: () => <LogOutButton />,
                }}
            />
        </Stack>
    );
};

export default WaiterLayout;
