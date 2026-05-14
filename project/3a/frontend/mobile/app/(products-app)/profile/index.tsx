import React from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { ThemedView } from '@/presentation/theme/components/themed-view';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

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
  const { user, logout } = useAuthStore();
  const primaryColor = useThemeColor({}, 'primary');

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
    </ThemedView>
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
