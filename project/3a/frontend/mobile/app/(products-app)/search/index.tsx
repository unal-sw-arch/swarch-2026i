import React, { useState } from 'react';
import {
  View,
  TextInput,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { ThemedView } from '@/presentation/theme/components/themed-view';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';
import { useRestaurants } from '@/presentation/restaurants/hooks/useRestaurants';
import { RestaurantCard } from '@/presentation/restaurants/components/RestaurantCard';
import type Restaurant from '@/core/restaurants/interface/restaurant';
import { Stack } from 'expo-router';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const { restaurantsQuery } = useRestaurants();

  const allRestaurants: Restaurant[] =
    restaurantsQuery.data?.pages.flatMap((page) => page) ?? [];

  const filtered = query.trim()
    ? allRestaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(query.toLowerCase()) ||
          r.description?.toLowerCase().includes(query.toLowerCase())
      )
    : allRestaurants;

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Buscar Restaurantes' }} />
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color={textColor}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Buscar restaurantes..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {restaurantsQuery.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search" size={48} color="#ccc" />
          <ThemedText style={{ marginTop: 12, color: '#999' }}>
            {query ? 'No se encontraron restaurantes' : 'Escribe para buscar'}
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <RestaurantCard restaurant={item} />}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
