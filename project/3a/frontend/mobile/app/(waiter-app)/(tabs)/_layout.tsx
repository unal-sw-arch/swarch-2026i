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
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    borderTopColor: '#F3F4F6',
                    backgroundColor: '#FFFFFF',
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
                headerShown: true,
                headerStyle: {
                    backgroundColor: '#FFFFFF',
                },
                headerTitleStyle: {
                    fontWeight: '700',
                    fontSize: 18,
                    color: '#111827',
                },
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
