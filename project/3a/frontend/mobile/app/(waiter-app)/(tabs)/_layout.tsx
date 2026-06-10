import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';

const WaiterTabsLayout = () => {
    const primaryColor = useThemeColor({}, 'primary');
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: primaryColor,
                headerShown: true,
            }}
        >
            <Tabs.Screen
                name='active'
                options={{
                    title: 'Activas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name='time-outline' size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='ready'
                options={{
                    title: 'Listas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name='notifications-outline' size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='new-order'
                options={{
                    title: 'Nueva orden',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name='add-circle-outline' size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
};

export default WaiterTabsLayout;
