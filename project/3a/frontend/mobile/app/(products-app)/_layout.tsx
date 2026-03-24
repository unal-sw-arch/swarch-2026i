import { View, Text, ActivityIndicator } from 'react-native'
import React from 'react'
import { useAuthStore } from '@/presentation/auth/store/useAuthStore'
import { useEffect } from 'react';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { Redirect, Stack } from 'expo-router';
import LogOutButton from '@/presentation/auth/components/LogOutButton';

const CheckAuthenticationLayout = () => {

    const { status, checkStatus } = useAuthStore();

    useEffect(() => {
        checkStatus();
    }, [])

    if (status === 'checking') {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 5,
                }}
            >
                <ActivityIndicator/>
            </View>
        )
    }

    if ( status === 'unauthenticated' ) {
        return <Redirect href='/auth/login'/>
    }

    return (
        <Stack>
            <Stack.Screen 
                name='(home)/index'
                options={{
                    title: 'Productos',
                    headerLeft: () => <LogOutButton/>
                }}
            />    
        </Stack>
    )
    
}

export default CheckAuthenticationLayout