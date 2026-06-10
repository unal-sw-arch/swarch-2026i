import Restaurant from "@/core/restaurants/interface/restaurant";
import { ThemedText } from "@/presentation/theme/components/themed-text";
import { ThemedView } from "@/presentation/theme/components/themed-view";
import { router } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
import { Image } from "react-native";

interface Props {
  restaurant: Restaurant;
}

export const RestaurantCard = ({ restaurant }: Props) => {
  return (
    <ThemedView
      style={{
        flex: 1,
        backgroundColor: '#F9F9F9',
        margin: 3,
        borderRadius: 5,
        overflow: 'hidden',
        padding: 5,
      }}
    >
      <TouchableOpacity onPress={() => router.push(`/restaurant/${restaurant.id}` as any)}>
        
         <Image
            source={require('../../../assets/images/no-restaurant-image.png')}
            style={{ width: '100%', height: 200 }}
          />

        <ThemedText
          numberOfLines={2}
          style={{ textAlign: 'center' }}
          darkColor={'black'}
        >
          {restaurant.name}

        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
};