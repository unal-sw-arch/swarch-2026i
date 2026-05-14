import React from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { ThemedView } from '@/presentation/theme/components/themed-view';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useOrders } from '@/presentation/orders/hooks/useOrders';
import type { Order, OrderStatus } from '@/core/orders/interface/order';

const statusColors: Record<OrderStatus, string> = {
  Preparing: '#f39c12',
  Ready: '#3498db',
  Served: '#2ecc71',
  Delivered: '#27ae60',
  Cancelled: '#e74c3c',
};

const statusLabels: Record<OrderStatus, string> = {
  Preparing: 'Preparando',
  Ready: 'Listo',
  Served: 'Servido',
  Delivered: 'Entregado',
  Cancelled: 'Cancelado',
};

function OrderCard({ order }: { order: Order }) {
  const primaryColor = useThemeColor({}, 'primary');
  const statusColor = statusColors[order.status] || '#999';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(products-app)/order/${order.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <ThemedText type="defaultSemiBold">Pedido #{order.id}</ThemedText>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[styles.statusText, { color: statusColor }]}>
            {statusLabels[order.status] || order.status}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color="#999" />
          <ThemedText style={styles.infoText}>
            {order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('es', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Sin fecha'}
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="fast-food-outline" size={16} color="#999" />
          <ThemedText style={styles.infoText}>
            {order.items?.length ?? 0} artículo{(order.items?.length ?? 0) !== 1 ? 's' : ''}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <ThemedText type="defaultSemiBold" style={{ fontSize: 18 }}>
          ${order.total?.toFixed(2)}
        </ThemedText>
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const { user } = useAuthStore();
  const { data: orders, isLoading, refetch, isRefetching } = useOrders(user?.id ?? 0);

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Mis Pedidos' }} />

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      ) : !orders || orders.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="receipt-outline" size={80} color="#ccc" />
          <ThemedText style={{ marginTop: 16, fontSize: 18, color: '#999' }}>
            No tienes pedidos aún
          </ThemedText>
          <ThemedText style={{ marginTop: 8, color: '#bbb', textAlign: 'center' }}>
            Tus pedidos aparecerán aquí
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
});
