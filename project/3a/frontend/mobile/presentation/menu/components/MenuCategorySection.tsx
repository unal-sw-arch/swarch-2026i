import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';
import type { MenuCategory, MenuItem } from '@/core/menu/interface/menu';
import MenuItemCard from './MenuItemCard';

const categoryLabels: Record<string, string> = {
  ENTRADA: '🥗 Entradas',
  PLATO: '🍽️ Platos Fuertes',
  POSTRE: '🍰 Postres',
  BEBIDA: '🥤 Bebidas',
  ENSALADA: '🥬 Ensaladas',
  ADICIONAL: '➕ Adicionales',
};

interface Props {
  category: MenuCategory;
  onAddToCart: (item: MenuItem) => void;
}

export default function MenuCategorySection({ category, onAddToCart }: Props) {
  const [expanded, setExpanded] = useState(true);
  const primaryColor = useThemeColor({}, 'primary');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <ThemedText type="subtitle">
          {categoryLabels[category.category] || category.category}
        </ThemedText>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <ThemedText style={styles.count}>
            {category.items?.length ?? 0}
          </ThemedText>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#999"
          />
        </View>
      </TouchableOpacity>
      {expanded &&
        category.items?.map((item) => (
          <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fafafa',
  },
  count: {
    color: '#999',
    marginRight: 4,
    fontSize: 14,
  },
});
