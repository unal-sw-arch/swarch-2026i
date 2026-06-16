import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { ThemedView } from '@/presentation/theme/components/themed-view';
import { useOrder } from '@/presentation/orders/hooks/useOrder';
import { getOrderEta } from '@/core/orders/actions/get-order-eta.action';
import { requestArrivalChange } from '@/core/orders/actions/request-arrival-change.action';
import type { EtaMode, OrderStatus } from '@/core/orders/interface/order';

const statusColors: Record<OrderStatus, string> = {
  PENDING: '#f39c12',
  IN_PREPARATION: '#f39c12',
  READY: '#3498db',
  DELIVERED: '#27ae60',
  CANCELLED: '#e74c3c',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  IN_PREPARATION: 'Preparando',
  READY: 'Listo',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, isLoading, refetch } = useOrder(Number(id));
  const [etaMode, setEtaMode] = useState<EtaMode>('DRIVING');
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [etaLoading, setEtaLoading] = useState(false);
  const [arrivalMinutes, setArrivalMinutes] = useState('15');
  const [arrivalMessage, setArrivalMessage] = useState('');
  const [savingArrival, setSavingArrival] = useState(false);

  const loadEta = async (mode: EtaMode = etaMode) => {
    if (!order) return;
    setEtaLoading(true);
    const coords = await getCurrentCoordinates();
    const eta = await getOrderEta(order.id, coords.latitude, coords.longitude, mode);
    setEtaMinutes(eta?.etaMinutes ?? null);
    setEtaLoading(false);
  };

  const handleModeChange = async (mode: EtaMode) => {
    setEtaMode(mode);
    await loadEta(mode);
  };

  const handleArrivalChange = async () => {
    if (!order) return;
    const minutes = Number(arrivalMinutes);
    if (!Number.isFinite(minutes) || minutes < 0 || !arrivalMessage.trim()) {
      Alert.alert('Llegada', 'Ingresa minutos y un mensaje para el restaurante');
      return;
    }
    const requestedArrivalTime = new Date(Date.now() + minutes * 60_000).toISOString().slice(0, 19);
    setSavingArrival(true);
    const updated = await requestArrivalChange(order.id, requestedArrivalTime, arrivalMessage.trim());
    setSavingArrival(false);
    if (!updated) {
      Alert.alert('Llegada', 'No se pudo enviar el cambio');
      return;
    }
    setArrivalMessage('');
    await refetch();
    Alert.alert('Llegada', 'Mensaje enviado al restaurante');
  };

  useEffect(() => {
    if (order) {
      loadEta('DRIVING');
    }
  }, [order?.id]);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: 'Pedido' }} />
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!order) {
    return (
      <ThemedView style={styles.center}>
        <Stack.Screen options={{ title: 'Pedido' }} />
        <Ionicons name="alert-circle-outline" size={48} color="#ccc" />
        <ThemedText style={{ marginTop: 12, color: '#999' }}>
          Pedido no encontrado
        </ThemedText>
      </ThemedView>
    );
  }

  const statusColor = statusColors[order.status] || '#999';

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: `Pedido #${order.id}` }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Status */}
        <View style={styles.statusContainer}>
          <View
            style={[styles.statusBadgeLarge, { backgroundColor: statusColor + '20' }]}
          >
            <Ionicons
              name={
                order.status === 'CANCELLED'
                  ? 'close-circle'
                  : order.status === 'DELIVERED'
                  ? 'checkmark-circle'
                  : 'time'
              }
              size={32}
              color={statusColor}
            />
            <ThemedText
              style={{ color: statusColor, fontSize: 20, fontWeight: '700', marginLeft: 8 }}
            >
              {statusLabels[order.status] || order.status}
            </ThemedText>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            Detalles
          </ThemedText>
          <InfoRow icon="calendar-outline" label="Fecha" value={
            order.createdAt
              ? new Date(order.createdAt).toLocaleDateString('es', {
                  day: 'numeric', month: 'long', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })
              : 'N/A'
          } />
          <InfoRow icon="restaurant-outline" label="Mesa" value={String(order.tableNumber)} />
          {order.notes && (
            <InfoRow icon="document-text-outline" label="Notas" value={order.notes} />
          )}
          <InfoRow icon="cash-outline" label="Total" value={`$${Number(order.totalAmount ?? 0).toFixed(2)}`} />
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            ETA al restaurante
          </ThemedText>
          <View style={styles.modeRow}>
            <ModeButton label="Conduciendo" active={etaMode === 'DRIVING'} onPress={() => handleModeChange('DRIVING')} />
            <ModeButton label="Caminando" active={etaMode === 'WALKING'} onPress={() => handleModeChange('WALKING')} />
          </View>
          <ThemedText style={{ marginTop: 10, color: '#666' }}>
            {etaLoading
              ? 'Calculando...'
              : etaMinutes == null
                ? 'ETA no disponible'
                : `${etaMinutes.toFixed(0)} min`}
          </ThemedText>
        </View>

        {order.status === 'PENDING' && (
          <View style={styles.section}>
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
              Cambiar llegada
            </ThemedText>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              placeholder="Minutos desde ahora"
              placeholderTextColor="#999"
              value={arrivalMinutes}
              onChangeText={setArrivalMinutes}
            />
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Mensaje para el restaurante"
              placeholderTextColor="#999"
              value={arrivalMessage}
              onChangeText={setArrivalMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleArrivalChange}
              disabled={savingArrival}
            >
              <ThemedText style={styles.actionButtonText}>{savingArrival ? 'Enviando...' : 'Enviar cambio'}</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Items */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            Artículos
          </ThemedText>
          {order.items?.map((item, index) => (
            <View key={item.id ?? index} style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="defaultSemiBold">{item.itemName}</ThemedText>
                {item.notes && (
                  <ThemedText style={{ color: '#999', fontSize: 13 }}>
                    {item.notes}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

async function getCurrentCoordinates(): Promise<{ latitude: number; longitude: number }> {
  const fallback = { latitude: 4.65, longitude: -74.1 };
  const geolocation = globalThis.navigator?.geolocation;
  if (!geolocation) return fallback;
  return new Promise((resolve) => {
    geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      }),
      () => resolve(fallback),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 30000 },
    );
  });
}

function ModeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.modeButton, active && styles.modeButtonActive]} onPress={onPress}>
      <ThemedText style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color="#999" />
      <ThemedText style={{ marginLeft: 8, color: '#999', width: 60 }}>{label}</ThemedText>
      <ThemedText style={{ flex: 1 }}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusContainer: { alignItems: 'center', marginBottom: 20 },
  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingVertical: 10,
  },
  modeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  modeButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  modeButtonTextActive: {
    color: '#2563eb',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    color: '#111827',
  },
  messageInput: {
    minHeight: 76,
    textAlignVertical: 'top',
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    backgroundColor: '#2563eb',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});
