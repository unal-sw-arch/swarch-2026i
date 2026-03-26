import { ActivityIndicator, View } from 'react-native'
import React from 'react'
import { useRestaurants } from '@/presentation/restaurants/hooks/useRestaurants'
import RestaurantsList from '@/presentation/restaurants/components/RestaurantsList';


const HomeScreen = () => {

  const { restaurantsQuery , loadNextPage } = useRestaurants();

  if ( restaurantsQuery.isLoading ) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size={30}/>
      </View>
    )
  }

  return (
    <View style={{ paddingHorizontal: 10 }}>
      
      <RestaurantsList restaurants={restaurantsQuery.data?.pages.flatMap(page => page) ?? []} loadNextPage={loadNextPage}/>

    </View>
  )
}

export default HomeScreen