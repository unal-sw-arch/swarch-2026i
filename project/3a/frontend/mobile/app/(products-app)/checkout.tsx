import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { ThemedView } from '@/presentation/theme/components/themed-view';
import ThemedButton from '@/presentation/theme/components/themed-button';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';
import { useCartStore } from '@/presentation/cart/store/useCartStore';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { createOrder } from '@/core/orders/actions/create-order.action';
import { useQueryClient } from '@tanstack/react-query';

export default function CheckoutScreen() {
  const { items, restaurantId, restaurantName, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const queryClient = useQueryClient();

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async () => {
    if (!user?.id || !restaurantId || items.length === 0) {
      Alert.alert('Error', 'Datos inválidos para crear el pedido');
      return;
    }

    setIsSubmitting(true);

    const order = await createOrder({
      customerId: user.id,
      restaurantId,
      channel: 'In-person',
      notes: notes.trim() || undefined,
      items: items.map((i) => ({
        menuItemId: i.menuItem.id,
        productName: i.menuItem.name,
        quantity: i.quantity,
        unitPrice: i.menuItem.price,
        subtotal: i.menuItem.price * i.quantity,
      })),
      total: getTotal(),
    });

    setIsSubmitting(false);

    if (order) {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      clearCart();
      Alert.alert('¡Pedido creado!', `Tu pedido #${order.id} ha sido enviado`, [
        {
          text: 'Ver pedido',
          onPress: () => router.replace(`/(products-app)/order/${order.id}`),
        },
        {
          text: 'Ir al inicio',
          onPress: () => router.replace('/(products-app)/(home)'),
        },
      ]);
    } else {
      Alert.alert('Error', 'No se pudo crear el pedido. Intenta de nuevo.');
    }
  };

  if (items.length === 0) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: 'Checkout', headerShown: true }} />
        <Ionicons name="cart-outline" size={60} color="#ccc" />
        <ThemedText style={{ marginTop: 12, color: '#999' }}>
          Tu carrito está vacío
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Confirmar Pedido', headerShown: true }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Restaurant */}
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <Ionicons name="restaurant-outline" size={20} color={primaryColor} />
            <ThemedText type="subtitle" style={{ marginLeft: 8 }}>
              {restaurantName}
            </ThemedText>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            Resumen del pedido
          </ThemedText>
          {items.map((item) => (
            <View key={item.menuItem.id} style={styles.itemRow}>
              <ThemedText style={{ flex: 1 }}>
                {item.quantity}× {item.menuItem.name}
              </ThemedText>
              <ThemedText type="defaultSemiBold">
                ${(item.menuItem.price * item.quantity).toFixed(2)}
              </ThemedText>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={[styles.itemRow, { marginTop: 4 }]}>
            <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
              Total
            </ThemedText>
            <ThemedText type="title" style={{ fontSize: 22 }}>
              ${getTotal().toFixed(2)}
            </ThemedText>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
            Notas (opcional)
          </ThemedText>
          <TextInput
            style={[styles.notesInput, { color: textColor }]}
            placeholder="Instrucciones especiales, alergias, etc."
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isSubmitting ? (
          <ActivityIndicator size="large" color={primaryColor} />
        ) : (
          <ThemedButton onPress={handleSubmitOrder} icon="checkmark-circle-outline">
            Confirmar pedido — ${getTotal().toFixed(2)}
          </ThemedButton>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
