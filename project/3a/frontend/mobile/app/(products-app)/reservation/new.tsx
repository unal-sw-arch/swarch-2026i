import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/presentation/theme/components/themed-text';
import { ThemedView } from '@/presentation/theme/components/themed-view';
import ThemedButton from '@/presentation/theme/components/themed-button';
import { useThemeColor } from '@/presentation/theme/hooks/use-theme-color';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { createReservation } from '@/core/reservations/actions/create-reservation.action';
import { useQueryClient } from '@tanstack/react-query';

export default function NewReservationScreen() {
  const params = useLocalSearchParams<{ restaurantId?: string; restaurantName?: string }>();
  const { user } = useAuthStore();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const queryClient = useQueryClient();

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!date || !time || !partySize || !params.restaurantId) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);

    const reservation = await createReservation({
      customerId: user?.id ?? 0,
      restaurantId: Number(params.restaurantId),
      reservationDate: date,
      reservationTime: time,
      partySize: Number(partySize),
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (reservation) {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      Alert.alert(
        '¡Reservación creada!',
        `Tu reservación para ${partySize} personas el ${date} a las ${time} ha sido enviada.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } else {
      Alert.alert('Error', 'No se pudo crear la reservación');
    }
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Nueva Reservación', headerShown: true }} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {params.restaurantName && (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="restaurant-outline" size={20} color={primaryColor} />
              <ThemedText type="subtitle" style={{ marginLeft: 8 }}>
                {params.restaurantName}
              </ThemedText>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText type="subtitle" style={{ marginBottom: 12 }}>
            Detalles de la reservación
          </ThemedText>

          <ThemedText style={styles.label}>Fecha (YYYY-MM-DD)</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="2026-04-15"
            placeholderTextColor="#999"
            value={date}
            onChangeText={setDate}
          />

          <ThemedText style={styles.label}>Hora (HH:MM)</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="19:00"
            placeholderTextColor="#999"
            value={time}
            onChangeText={setTime}
          />

          <ThemedText style={styles.label}>Número de personas</ThemedText>
          <View style={styles.partySizeContainer}>
            {['1', '2', '3', '4', '5', '6', '8', '10'].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.partySizeBtn,
                  partySize === size && { backgroundColor: primaryColor },
                ]}
                onPress={() => setPartySize(size)}
              >
                <ThemedText
                  style={[
                    styles.partySizeText,
                    partySize === size && { color: '#fff' },
                  ]}
                >
                  {size}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={styles.label}>Notas (opcional)</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, minHeight: 60 }]}
            placeholder="Cumpleaños, silla de bebé, etc."
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {isSubmitting ? (
          <ActivityIndicator size="large" color={primaryColor} />
        ) : (
          <ThemedButton onPress={handleSubmit} icon="calendar-outline">
            Confirmar reservación
          </ThemedButton>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  partySizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  partySizeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partySizeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
