import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';
import type { MenuItem } from '@/core/menu/interface/menu';

interface Props {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export default function MenuItemCard({ item, onAddToCart }: Props) {
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <ThemedText type="defaultSemiBold" numberOfLines={1}>
          {item.name}
        </ThemedText>
        {item.description ? (
          <ThemedText style={styles.description} numberOfLines={2}>
            {item.description}
          </ThemedText>
        ) : null}
        <ThemedText style={[styles.price, { color: primaryColor }]}>
          ${item.price.toFixed(2)}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: primaryColor }]}
        onPress={() => onAddToCart(item)}
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  description: {
    color: '#999',
    fontSize: 13,
    marginTop: 2,
  },
  price: {
    fontWeight: '700',
    fontSize: 16,
    marginTop: 4,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});
