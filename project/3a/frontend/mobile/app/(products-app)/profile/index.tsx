import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView, TextInput } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { ThemedView } from '@/presentation/theme/components/themed-view';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { changePassword, linkTelegram, updateUserProfile } from '@/core/auth/actions/auth-actions';

function MenuItem({
  icon,
  label,
  onPress,
  color,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <Ionicons name={icon} size={22} color={color || '#666'} />
      <ThemedText style={[styles.menuLabel, color ? { color } : {}]}>{label}</ThemedText>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { user, logout, setUser } = useAuthStore();
  const primaryColor = useThemeColor({}, 'primary');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [bio, setBio] = useState('');
  const [governmentId, setGovernmentId] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingTelegram, setSavingTelegram] = useState(false);

  useEffect(() => {
    setPhone(user?.phone ?? '');
    setAddress(user?.address ?? '');
    setBio(user?.bio ?? '');
    setGovernmentId(user?.governmentId ?? '');
    setTelegramChatId(user?.telegramChatId ?? '');
  }, [user?.id]);

  const handleSaveProfile = async () => {
    if (!user?.id) {
      Alert.alert('Perfil', 'No se encontró el usuario autenticado');
      return;
    }
    setSavingProfile(true);
    const updated = await updateUserProfile(user.id, {
      phone: phone.trim() || null,
      address: address.trim() || null,
      bio: bio.trim() || null,
      governmentId: governmentId.trim() || null,
      profileImageUrl: user.profileImageUrl ?? null,
    });
    setSavingProfile(false);
    if (!updated) {
      Alert.alert('Perfil', 'No se pudo guardar el perfil');
      return;
    }
    setUser({ ...user, ...updated });
    Alert.alert('Perfil', 'Perfil actualizado');
  };

  const handleChangePassword = async () => {
    if (!user?.id || !currentPassword || !newPassword) {
      Alert.alert('Contraseña', 'Completa la contraseña actual y la nueva');
      return;
    }
    setSavingPassword(true);
    const result = await changePassword(user.id, currentPassword, newPassword);
    setSavingPassword(false);
    Alert.alert('Contraseña', result.message);
    if (result.ok) {
      setCurrentPassword('');
      setNewPassword('');
    }
  };

  const handleLinkTelegram = async () => {
    if (!user?.id) return;
    setSavingTelegram(true);
    const result = await linkTelegram(user.id, telegramChatId.trim() || null);
    setSavingTelegram(false);
    if (result.ok) {
      setUser({ ...user, telegramChatId: telegramChatId.trim() || null });
    }
    Alert.alert('Telegram', result.message);
  };

  const handleUnlinkTelegram = () => {
    Alert.alert('Desvincular Telegram', '¿Dejarás de recibir notificaciones en Telegram?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desvincular',
        style: 'destructive',
        onPress: async () => {
          if (!user?.id) return;
          setSavingTelegram(true);
          const result = await linkTelegram(user.id, null);
          setSavingTelegram(false);
          if (result.ok) {
            setTelegramChatId('');
            setUser({ ...user, telegramChatId: null });
          }
          Alert.alert('Telegram', result.message);
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Mi Perfil' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>

      {/* User Info */}
      <View style={styles.userSection}>
        <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
          <Ionicons name="person" size={40} color="#fff" />
        </View>
        <ThemedText type="subtitle" style={{ marginTop: 12 }}>
          {user?.name || user?.username || 'Usuario'}
        </ThemedText>
        <ThemedText style={{ color: '#999', marginTop: 4 }}>
          {user?.email || ''}
        </ThemedText>
        <View style={[styles.roleBadge, { backgroundColor: primaryColor + '15' }]}>
          <ThemedText style={{ color: primaryColor, fontSize: 12, fontWeight: '600' }}>
            {user?.role || 'CUSTOMER'}
          </ThemedText>
        </View>
      </View>

      <View style={styles.formSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Datos personales</ThemedText>
        <ProfileInput placeholder="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <ProfileInput placeholder="Dirección" value={address} onChangeText={setAddress} />
        <ProfileInput placeholder="Documento" value={governmentId} onChangeText={setGovernmentId} />
        <ProfileInput placeholder="Bio" value={bio} onChangeText={setBio} multiline />
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: primaryColor }]}
          onPress={handleSaveProfile}
          disabled={savingProfile}
        >
          <ThemedText style={styles.primaryButtonText}>{savingProfile ? 'Guardando...' : 'Guardar perfil'}</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Contraseña</ThemedText>
        <ProfileInput placeholder="Contraseña actual" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
        <ProfileInput placeholder="Nueva contraseña" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: primaryColor }]}
          onPress={handleChangePassword}
          disabled={savingPassword}
        >
          <ThemedText style={styles.primaryButtonText}>{savingPassword ? 'Actualizando...' : 'Cambiar contraseña'}</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Telegram */}
      <View style={styles.formSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons name="paper-plane-outline" size={18} color="#229ED9" style={{ marginRight: 8 }} />
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>Notificaciones Telegram</ThemedText>
        </View>
        <ThemedText style={{ color: '#999', fontSize: 13, marginBottom: 12 }}>
          Vincula tu cuenta para recibir notificaciones de pedidos y reservaciones directamente en Telegram.
        </ThemedText>
        {user?.telegramChatId ? (
          <>
            <View style={styles.telegramLinked}>
              <Ionicons name="checkmark-circle" size={18} color="#27ae60" />
              <ThemedText style={{ color: '#27ae60', marginLeft: 6, fontSize: 14 }}>
                Cuenta vinculada (ID: {user.telegramChatId})
              </ThemedText>
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#e74c3c', marginTop: 10 }]}
              onPress={handleUnlinkTelegram}
              disabled={savingTelegram}
            >
              <ThemedText style={styles.primaryButtonText}>
                {savingTelegram ? 'Desvinculando...' : 'Desvincular Telegram'}
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <ThemedText style={{ color: '#666', fontSize: 13, marginBottom: 8 }}>
              1. Abre Telegram y escríbele a tu bot{'\n'}
              2. Obtén tu Chat ID en: api.telegram.org/bot&lt;token&gt;/getUpdates{'\n'}
              3. Pégalo aquí y guarda
            </ThemedText>
            <ProfileInput
              placeholder="Tu Chat ID de Telegram (ej: 7184207241)"
              value={telegramChatId}
              onChangeText={setTelegramChatId}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#229ED9' }]}
              onPress={handleLinkTelegram}
              disabled={savingTelegram || !telegramChatId.trim()}
            >
              <ThemedText style={styles.primaryButtonText}>
                {savingTelegram ? 'Vinculando...' : 'Vincular Telegram'}
              </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <MenuItem
          icon="receipt-outline"
          label="Mis Pedidos"
          onPress={() => router.push('/(products-app)/orders')}
        />
        <MenuItem
          icon="calendar-outline"
          label="Mis Reservaciones"
          onPress={() => router.push('/(products-app)/orders')}
        />
        <MenuItem
          icon="heart-outline"
          label="Favoritos"
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
        />
        <MenuItem
          icon="notifications-outline"
          label="Notificaciones"
          onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
        />
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon="help-circle-outline"
          label="Ayuda"
          onPress={() => Alert.alert('Ayuda', 'Contacta a soporte@clickmunch.com')}
        />
        <MenuItem
          icon="information-circle-outline"
          label="Acerca de"
          onPress={() => Alert.alert('Click & Munch', 'Versión 1.0.0\nHecho con ❤️')}
        />
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon="log-out-outline"
          label="Cerrar sesión"
          onPress={handleLogout}
          color="#e74c3c"
        />
      </View>
      </ScrollView>
    </ThemedView>
  );
}

function ProfileInput(props: React.ComponentProps<typeof TextInput>) {
  return (
    <TextInput
      {...props}
      placeholderTextColor="#999"
      style={[styles.input, props.multiline && styles.inputMultiline, props.style]}
    />
  );
}

const styles = StyleSheet.create({
  userSection: {
    alignItems: 'center',
    paddingVertical: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleBadge: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  formSection: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fafafa',
  },
  inputMultiline: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  menuSection: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  telegramLinked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0faf4',
    borderRadius: 8,
    padding: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },
});
