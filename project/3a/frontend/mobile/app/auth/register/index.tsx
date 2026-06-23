import { View, KeyboardAvoidingView, ScrollView, useWindowDimensions, Alert, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useState } from 'react'
import { ThemedText } from '@/presentation/theme/components/themed-text'
import ThemedTextInput from '@/presentation/theme/components/themed-text-input';
import ThemedButton from '@/presentation/theme/components/themed-button';
import ThemedLink from '@/presentation/theme/components/themed-link';
import { authRegister } from '@/core/auth/actions/auth-actions';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';

const RegisterScreen = () => {

  const { height } = useWindowDimensions();
  const primaryColor = useThemeColor({}, 'primary');
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'CUSTOMER' | 'RESTAURANT_MANAGER'>('CUSTOMER');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!name || !email || !username || !password) {
      Alert.alert('Error', 'Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    const res = await authRegister(name, email, username, password, accountType);
    setLoading(false);

    if ('success' in res && res.success === false) {
      Alert.alert('Registro', res.message || 'Registration failed');
      return;
    }

    // res contains { user, message }
    Alert.alert('Registro', res.message || 'Usuario creado');

    if (accountType === 'RESTAURANT_MANAGER') {
      router.push('/auth/login');
      return;
    }

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
              paddingTop: height * 0.08,
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <ThemedText style={{ fontSize: 36, fontFamily: 'KanitBold', color: primaryColor }}>Click & Munch</ThemedText>
            <ThemedText style={{ color: 'grey', paddingTop: 6, fontSize: 16 }}>Por favor crea una cuenta para continuar</ThemedText>
          </View>

          
          <View>
            <View style={styles.accountTypeGroup}>
              <TouchableOpacity
                style={[styles.accountTypeButton, accountType === 'CUSTOMER' && styles.accountTypeButtonActive]}
                onPress={() => setAccountType('CUSTOMER')}
              >
                <ThemedText style={[styles.accountTypeText, accountType === 'CUSTOMER' && styles.accountTypeTextActive]}>
                  Usuario
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.accountTypeButton, accountType === 'RESTAURANT_MANAGER' && styles.accountTypeButtonActive]}
                onPress={() => setAccountType('RESTAURANT_MANAGER')}
              >
                <ThemedText style={[styles.accountTypeText, accountType === 'RESTAURANT_MANAGER' && styles.accountTypeTextActive]}>
                  Restaurante
                </ThemedText>
              </TouchableOpacity>
            </View>

            <ThemedTextInput
              placeholder={accountType === 'CUSTOMER' ? 'Nombre completo' : 'Nombre del representante'}
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

          <ThemedButton onPress={onSubmit}>
            {loading ? 'Creando...' : accountType === 'CUSTOMER' ? 'Crear cuenta' : 'Enviar solicitud'}
          </ThemedButton>

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

const styles = StyleSheet.create({
  accountTypeGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  accountTypeButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  accountTypeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  accountTypeText: {
    fontWeight: '600',
    color: '#52525b',
  },
  accountTypeTextActive: {
    color: '#2563eb',
  },
});