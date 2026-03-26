import { View, KeyboardAvoidingView, ScrollView, useWindowDimensions, Alert } from 'react-native'
import React, { useState } from 'react'
import { ThemedText } from '@/presentation/theme/components/themed-text'
import ThemedTextInput from '@/presentation/theme/components/themed-text-input';
import ThemedButton from '@/presentation/theme/components/themed-button';
import ThemedLink from '@/presentation/theme/components/themed-link';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { router } from 'expo-router';

const LoginScreen = () => {

  const { login } = useAuthStore();
  
  const { height } = useWindowDimensions();

  const [isPosting, setisPosting] = useState(false)
  const [form, setForm] = useState({
    username: '',
    password: '',
  })

  const onLogin = async() => {

      const { username, password } = form;

      console.log({username, password});

      if (username.length === 0 || password.length === 0)
        return;

      setisPosting(true);

      const wasSuccessful = await login(username, password);

      setisPosting(false);

      if (wasSuccessful) {
        router.replace('/')
        return;
      }

      Alert.alert("Error", "Usuario o contraseña no son correctos");
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
          <ThemedText type='title'>Ingresar</ThemedText>
          <ThemedText style={{ color: 'grey', paddingTop: 10, paddingBottom: 20 }}>Por favor ingrese para continuar</ThemedText>
        </View>

        <View>
          <ThemedTextInput
            placeholder='Nombre de usuario'
            autoCapitalize='none'
            icon='person-outline'

            value={ form.username }
            onChangeText={(value) => setForm({...form, username: value})}
          />

          <ThemedTextInput
            placeholder='Contraseña'
            secureTextEntry
            autoCapitalize='none'
            icon='lock-closed-outline'

            value={ form.password }
            onChangeText={(value) => setForm({...form, password: value})}
          />
        </View>

        <View style={{ marginTop: 10 }} />

        <ThemedButton
          onPress={onLogin}
          disabled={isPosting}
        >
          Ingresar
        </ThemedButton>

        <View style={{ marginTop: 50 }} />

        <View style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
            <ThemedText style={{marginHorizontal: 10}}>No tienes cuenta?</ThemedText>
            <ThemedLink href='/auth/register' >
              Crear cuenta
            </ThemedLink>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  )
}

export default LoginScreen