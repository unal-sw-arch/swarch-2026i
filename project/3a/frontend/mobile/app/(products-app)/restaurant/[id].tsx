import React, { useCallback } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { ThemedView } from '@/presentation/theme/components/themed-view';
import ThemedButton from '@/presentation/theme/components/themed-button';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';
import { useRestaurant } from '@/presentation/restaurants/hooks/useRestaurant';
import { useMenu } from '@/presentation/menu/hooks/useMenu';
import { useRatings } from '@/presentation/ratings/hooks/useRatings';
import { useCartStore } from '@/presentation/cart/store/useCartStore';
import MenuCategorySection from '@/presentation/menu/components/MenuCategorySection';
import type { MenuItem } from '@/core/menu/interface/menu';

export default function RestaurantScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurantId = Number(id);
  const primaryColor = useThemeColor({}, 'primary');

  const { data: restaurant, isLoading: loadingRestaurant } = useRestaurant(restaurantId);
  const { data: menu, isLoading: loadingMenu } = useMenu(restaurantId);
  const { data: ratings } = useRatings(restaurantId);
  const { addItem, getItemCount, restaurantId: cartRestaurantId } = useCartStore();

  const avgRating =
    ratings && ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
      : null;

  const handleAddToCart = useCallback(
    (item: MenuItem) => {
      if (!restaurant) return;

      if (cartRestaurantId && cartRestaurantId !== restaurantId) {
        Alert.alert(
          'Carrito diferente',
          'Tu carrito tiene artículos de otro restaurante. ¿Deseas vaciarlo y agregar este?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Vaciar y agregar',
              onPress: () => addItem(item, restaurantId, restaurant.name),
            },
          ]
        );
        return;
      }

      addItem(item, restaurantId, restaurant.name);
    },
    [restaurant, restaurantId, cartRestaurantId, addItem]
  );

  if (loadingRestaurant) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: '', headerShown: true }} />
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!restaurant) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: 'Error', headerShown: true }} />
        <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
        <ThemedText style={{ marginTop: 12, color: '#999' }}>
          Restaurante no encontrado
        </ThemedText>
      </ThemedView>
    );
  }

  const cartCount = getItemCount();

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: restaurant.name,
          headerShown: true,
          headerRight: () =>
            cartCount > 0 ? (
              <TouchableOpacity
                onPress={() => router.push('/(products-app)/cart')}
                style={{ marginRight: 8 }}
              >
                <View>
                  <Ionicons name="cart" size={24} color={primaryColor} />
                  <View style={[styles.badge, { backgroundColor: primaryColor }]}>
                    <ThemedText style={styles.badgeText}>{cartCount}</ThemedText>
                  </View>
                </View>
              </TouchableOpacity>
            ) : null,
        }}
      />
      <ScrollView>
        {/* Hero Image */}
        <Image
          source={require('../../../assets/images/no-restaurant-image.png')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Restaurant Info */}
        <View style={styles.infoSection}>
          <ThemedText type="title" style={{ fontSize: 24 }}>
            {restaurant.name}
          </ThemedText>

          {restaurant.description ? (
            <ThemedText style={styles.description}>
              {restaurant.description}
            </ThemedText>
          ) : null}

          <View style={styles.metaRow}>
            {avgRating && (
              <View style={styles.metaItem}>
                <Ionicons name="star" size={16} color="#f1c40f" />
                <ThemedText style={styles.metaText}>
                  {avgRating} ({ratings?.length})
                </ThemedText>
              </View>
            )}
            {restaurant.phone && (
              <View style={styles.metaItem}>
                <Ionicons name="call-outline" size={16} color="#999" />
                <ThemedText style={styles.metaText}>{restaurant.phone}</ThemedText>
              </View>
            )}
            {restaurant.email && (
              <View style={styles.metaItem}>
                <Ionicons name="mail-outline" size={16} color="#999" />
                <ThemedText style={styles.metaText}>{restaurant.email}</ThemedText>
              </View>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { borderColor: primaryColor }]}
              onPress={() =>
                router.push({
                  pathname: '/(products-app)/reservation/new',
                  params: {
                    restaurantId: String(restaurantId),
                    restaurantName: restaurant.name,
                  },
                })
              }
            >
              <Ionicons name="calendar-outline" size={18} color={primaryColor} />
              <ThemedText style={[styles.actionText, { color: primaryColor }]}>
                Reservar
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <ThemedText type="subtitle" style={{ marginBottom: 12, paddingHorizontal: 16 }}>
            Menú
          </ThemedText>

          {loadingMenu ? (
            <ActivityIndicator style={{ marginVertical: 20 }} />
          ) : !menu || menu.length === 0 ? (
            <View style={styles.emptyMenu}>
              <Ionicons name="restaurant-outline" size={40} color="#ccc" />
              <ThemedText style={{ color: '#999', marginTop: 8 }}>
                Menú no disponible
              </ThemedText>
            </View>
          ) : (
            menu.map((category) => (
              <MenuCategorySection
                key={category.id}
                category={category}
                onAddToCart={handleAddToCart}
              />
            ))
          )}
        </View>

        {/* Ratings Preview */}
        {ratings && ratings.length > 0 && (
          <View style={styles.ratingsSection}>
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
              Reseñas ({ratings.length})
            </ThemedText>
            {ratings.slice(0, 3).map((rating) => (
              <View key={rating.id} style={styles.ratingCard}>
                <View style={styles.stars}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Ionicons
                      key={i}
                      name={i < rating.score ? 'star' : 'star-outline'}
                      size={14}
                      color="#f1c40f"
                    />
                  ))}
                </View>
                {rating.review && (
                  <ThemedText style={styles.reviewText} numberOfLines={3}>
                    {rating.review}
                  </ThemedText>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <View style={styles.floatingCart}>
          <ThemedButton
            onPress={() => router.push('/(products-app)/cart')}
            icon="cart-outline"
          >
            Ver carrito ({cartCount}) — ${useCartStore.getState().getTotal().toFixed(2)}
          </ThemedButton>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  heroImage: {
    width: '100%',
    height: 200,
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  description: {
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#666',
    marginLeft: 4,
    fontSize: 14,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  actionText: {
    marginLeft: 6,
    fontWeight: '600',
  },
  menuSection: {
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  emptyMenu: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  ratingsSection: {
    padding: 16,
  },
  ratingCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  stars: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewText: {
    color: '#666',
    fontSize: 14,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  floatingCart: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
});