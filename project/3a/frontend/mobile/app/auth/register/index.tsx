import { View, Text, KeyboardAvoidingView, ScrollView, useWindowDimensions, Alert } from 'react-native'
import React, { useState } from 'react'
import { ThemedText } from '@/presentation/theme/components/themed-text'
import ThemedTextInput from '@/presentation/theme/components/themed-text-input';
import ThemedButton from '@/presentation/theme/components/themed-button';
import ThemedLink from '@/presentation/theme/components/themed-link';
import { authRegister } from '@/core/auth/actions/auth-actions';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useRouter } from 'expo-router';

const RegisterScreen = () => {

  const { height } = useWindowDimensions();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !username || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    const res = await authRegister(name, email, username, password, 'CUSTOMER');
    setLoading(false);

    if ('success' in res && res.success === false) {
      Alert.alert('Registro', res.message || 'Registration failed');
      return;
    }

    // res contains { user, message }
    Alert.alert('Registro', res.message || 'Usuario creado');

    // Try to auto-login the user after successful registration
    try {
      const { login } = useAuthStore.getState();
      const wasLogged = await login(username, password);
      if (wasLogged) {
        // replace stack to home
        router.replace('/');
        return;
      }
    } catch (err) {
      console.log('Auto-login after register failed:', err);
    }

    // fallback: navigate to login screen
    router.push('/auth/login');
  }

    return (

      <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
        <ScrollView
          style={{
            paddingHorizontal: 40,
          }}
        >
          <View
            style={{
              paddingTop: height * 0.12,
            }}
          >
            <ThemedText type='title'>Crear cuenta</ThemedText>
            <ThemedText style={{ color: 'grey', paddingTop: 10, paddingBottom: 20 }}>Por favor crea una cuenta para continuar</ThemedText>
          </View>

          
          <View>
            <ThemedTextInput
              placeholder='Nombre completo'
              autoCapitalize='words'
              icon='person-outline'
              value={name}
              onChangeText={setName}
            />

            <ThemedTextInput
              placeholder='Correo electronico'
              keyboardType='email-address'
              autoCapitalize='none'
              icon='mail-outline'
              value={email}
              onChangeText={setEmail}
            />
            
            <ThemedTextInput
              placeholder='Nombre de usuario'
              autoCapitalize='none'
              icon='person-outline'
              value={username}
              onChangeText={setUsername}
            />

            <ThemedTextInput
              placeholder='Contraseña'
              secureTextEntry
              autoCapitalize='none'
              icon='lock-closed-outline'
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={{ marginTop: 10 }} />

          <ThemedButton onPress={onSubmit}>{loading ? 'Creando...' : 'Crear cuenta'}</ThemedButton>

          <View style={{ marginTop: 50 }} />

          <View style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
              <ThemedText style={{marginHorizontal: 20}}> Ya tienes cuenta? </ThemedText>
              <ThemedLink href='/auth/login' >
                Ingresar
              </ThemedLink>

          </View>

        </ScrollView>

      </KeyboardAvoidingView>
    )
}

export default RegisterScreen;