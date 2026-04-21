import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { ThemedView } from '@/presentation/theme/components/themed-view';
import ThemedButton from '@/presentation/theme/components/themed-button';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';
import { useCartStore, type CartItem } from '@/presentation/cart/store/useCartStore';

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <View style={styles.itemRow}>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold">{item.menuItem.name}</ThemedText>
        <ThemedText style={{ color: '#666', fontSize: 14 }}>
          ${item.menuItem.price.toFixed(2)} c/u
        </ThemedText>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity
          onPress={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
          style={[styles.qtyBtn, { borderColor: primaryColor }]}
        >
          <Ionicons name="remove" size={18} color={primaryColor} />
        </TouchableOpacity>
        <ThemedText style={styles.qtyText}>{item.quantity}</ThemedText>
        <TouchableOpacity
          onPress={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
          style={[styles.qtyBtn, { borderColor: primaryColor }]}
        >
          <Ionicons name="add" size={18} color={primaryColor} />
        </TouchableOpacity>
      </View>
      <ThemedText type="defaultSemiBold" style={{ width: 70, textAlign: 'right' }}>
        ${(item.menuItem.price * item.quantity).toFixed(2)}
      </ThemedText>
      <TouchableOpacity
        onPress={() => removeItem(item.menuItem.id)}
        style={{ marginLeft: 8 }}
      >
        <Ionicons name="trash-outline" size={20} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );
}

export default function CartScreen() {
  const { items, restaurantName, getTotal, clearCart, getItemCount } = useCartStore();

  const handleCheckout = () => {
    if (items.length === 0) return;
    router.push('/(products-app)/checkout');
  };

  const handleClear = () => {
    Alert.alert('Vaciar carrito', '¿Estás seguro de vaciar el carrito?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Vaciar', style: 'destructive', onPress: clearCart },
    ]);
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Mi Carrito' }} />

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <ThemedText style={{ marginTop: 16, fontSize: 18, color: '#999' }}>
            Tu carrito está vacío
          </ThemedText>
          <ThemedText style={{ marginTop: 8, color: '#bbb', textAlign: 'center' }}>
            Explora restaurantes y agrega platillos
          </ThemedText>
        </View>
      ) : (
        <>
          <View style={styles.restaurantHeader}>
            <Ionicons name="restaurant-outline" size={20} color="#666" />
            <ThemedText type="defaultSemiBold" style={{ marginLeft: 8 }}>
              {restaurantName}
            </ThemedText>
            <TouchableOpacity onPress={handleClear} style={{ marginLeft: 'auto' }}>
              <ThemedText style={{ color: '#e74c3c', fontSize: 14 }}>Vaciar</ThemedText>
            </TouchableOpacity>
          </View>

          <FlatList
            data={items}
            keyExtractor={(item) => item.menuItem.id}
            renderItem={({ item }) => <CartItemRow item={item} />}
            contentContainerStyle={{ padding: 16 }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <ThemedText style={{ fontSize: 16 }}>
                {getItemCount()} artículo{getItemCount() !== 1 ? 's' : ''}
              </ThemedText>
              <ThemedText type="title" style={{ fontSize: 22 }}>
                ${getTotal().toFixed(2)}
              </ThemedText>
            </View>
            <ThemedButton onPress={handleCheckout} icon="arrow-forward-outline">
              Ir a pagar
            </ThemedButton>
          </View>
        </>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  restaurantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
});
