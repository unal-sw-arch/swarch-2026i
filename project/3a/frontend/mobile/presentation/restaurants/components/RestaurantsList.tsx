
import React from 'react'
import Restaurant from '@/core/restaurants/interface/restaurant'
import { FlatList } from 'react-native';
import { RestaurantCard } from './RestaurantCard';

interface Props {
    restaurants: Restaurant[];
    loadNextPage: () => void;
}

const RestaurantsList = ({ restaurants, loadNextPage }: Props) => {
  return (
    <FlatList
        data={ restaurants }
        numColumns={2}
        keyExtractor={ (item) => item.id.toString() }
        renderItem={ ({item}) => <RestaurantCard restaurant={item} /> }
        onEndReached={ loadNextPage }
        onEndReachedThreshold={0.5}
    />
  )
}

export default RestaurantsList