import { useState } from 'react';
import { Button } from './ui/button';
import { ShoppingCart, Sparkles, Sofa, Lamp, Image, TvMinimal } from 'lucide-react';

interface FurnitureItem {
  id: string;
  name: string;
  emoji: string;
  price: number;
  category: 'furniture' | 'decoration' | 'electronics';
}

const shopItems: FurnitureItem[] = [
  { id: 'sofa-blue', name: 'Blue Sofa', emoji: '🛋️', price: 100, category: 'furniture' },
  { id: 'sofa-red', name: 'Red Sofa', emoji: '🪑', price: 100, category: 'furniture' },
  { id: 'table', name: 'Coffee Table', emoji: '🪵', price: 80, category: 'furniture' },
  { id: 'lamp', name: 'Floor Lamp', emoji: '💡', price: 60, category: 'decoration' },
  { id: 'plant', name: 'Plant', emoji: '🪴', price: 40, category: 'decoration' },
  { id: 'tv', name: 'TV', emoji: '📺', price: 200, category: 'electronics' },
  { id: 'bookshelf', name: 'Bookshelf', emoji: '📚', price: 120, category: 'furniture' },
  { id: 'rug', name: 'Rug', emoji: '🟫', price: 70, category: 'decoration' },
  { id: 'picture', name: 'Picture Frame', emoji: '🖼️', price: 50, category: 'decoration' },
  { id: 'clock', name: 'Wall Clock', emoji: '🕐', price: 45, category: 'decoration' },
  { id: 'speaker', name: 'Speaker', emoji: '🔊', price: 90, category: 'electronics' },
  { id: 'guitar', name: 'Guitar', emoji: '🎸', price: 150, category: 'decoration' },
];

const wallColors = [
  { id: 'white', name: 'White', class: 'bg-white', price: 0 },
  { id: 'beige', name: 'Beige', class: 'bg-amber-50', price: 30 },
  { id: 'blue', name: 'Sky Blue', class: 'bg-blue-100', price: 30 },
  { id: 'green', name: 'Mint Green', class: 'bg-green-100', price: 30 },
  { id: 'pink', name: 'Rose Pink', class: 'bg-pink-100', price: 40 },
  { id: 'purple', name: 'Lavender', class: 'bg-purple-100', price: 40 },
];

const floorColors = [
  { id: 'wood', name: 'Wood', class: 'bg-amber-200', price: 0 },
  { id: 'dark-wood', name: 'Dark Wood', class: 'bg-amber-700', price: 50 },
  { id: 'tile', name: 'White Tile', class: 'bg-gray-100', price: 50 },
  { id: 'carpet', name: 'Carpet', class: 'bg-red-900', price: 60 },
];

interface LivingRoomProps {
  currency: number;
  onPurchase: (amount: number, item: string) => void;
}

export default function LivingRoom({ currency, onPurchase }: LivingRoomProps) {
  const [ownedItems, setOwnedItems] = useState<string[]>(['white', 'wood']);
  const [placedItems, setPlacedItems] = useState<string[]>([]);
  const [wallColor, setWallColor] = useState('white');
  const [floorColor, setFloorColor] = useState('wood');
  const [selectedTab, setSelectedTab] = useState<'shop' | 'customize'>('shop');

  const handlePurchase = (item: FurnitureItem) => {
    if (currency >= item.price && !ownedItems.includes(item.id)) {
      setOwnedItems([...ownedItems, item.id]);
      onPurchase(item.price, item.name);
    }
  };

  const handlePlaceItem = (itemId: string) => {
    if (ownedItems.includes(itemId) && !placedItems.includes(itemId)) {
      setPlacedItems([...placedItems, itemId]);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    setPlacedItems(placedItems.filter((id) => id !== itemId));
  };

  const isOwned = (itemId: string) => ownedItems.includes(itemId);
  const isPlaced = (itemId: string) => placedItems.includes(itemId);

  const currentWallClass = wallColors.find((c) => c.id === wallColor)?.class || 'bg-white';
  const currentFloorClass = floorColors.find((c) => c.id === floorColor)?.class || 'bg-amber-200';

  return (
    <div className="space-y-6">
      {/* Living Room Preview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Living Room</h2>
        
        {/* 3D-ish Room View */}
        <div className="relative">
          <div className={`${currentWallClass} rounded-xl overflow-hidden border-4 border-gray-300`} style={{ minHeight: '400px' }}>
            {/* Wall */}
            <div className="h-48 border-b-4 border-gray-400 flex items-start justify-center pt-8 gap-4 flex-wrap px-4">
              {/* Wall items */}
              {placedItems
                .filter((id) => ['picture', 'clock', 'tv'].includes(id))
                .map((id) => {
                  const item = shopItems.find((i) => i.id === id);
                  return (
                    <button
                      key={id}
                      onClick={() => handleRemoveItem(id)}
                      className="text-5xl hover:scale-110 transition-transform cursor-pointer bg-white/50 rounded-lg p-2"
                      title="Click to remove"
                    >
                      {item?.emoji}
                    </button>
                  );
                })}
            </div>

            {/* Floor */}
            <div className={`${currentFloorClass} h-52 p-6 flex items-end justify-around flex-wrap gap-4`}>
              {/* Floor items */}
              {placedItems
                .filter((id) => !['picture', 'clock', 'tv'].includes(id))
                .map((id) => {
                  const item = shopItems.find((i) => i.id === id);
                  return (
                    <button
                      key={id}
                      onClick={() => handleRemoveItem(id)}
                      className="text-6xl hover:scale-110 transition-transform cursor-pointer"
                      title="Click to remove"
                    >
                      {item?.emoji}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 text-center mt-4">
          Click on items in your room to remove them • Earn coins to unlock more items!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setSelectedTab('shop')}
          className={`px-4 py-2 font-medium transition-all ${
            selectedTab === 'shop'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4 inline mr-2" />
          Shop
        </button>
        <button
          onClick={() => setSelectedTab('customize')}
          className={`px-4 py-2 font-medium transition-all ${
            selectedTab === 'customize'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Sparkles className="w-4 h-4 inline mr-2" />
          Customize
        </button>
      </div>

      {/* Shop Tab */}
      {selectedTab === 'shop' && (
        <div className="space-y-6">
          {/* Furniture */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Sofa className="w-5 h-5" />
              Furniture
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {shopItems
                .filter((item) => item.category === 'furniture')
                .map((item) => (
                  <div
                    key={item.id}
                    className={`relative bg-gray-50 rounded-lg p-4 border-2 transition-all ${
                      isOwned(item.id) ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-5xl text-center mb-2">{item.emoji}</div>
                    <p className="text-sm font-medium text-gray-900 text-center mb-2">
                      {item.name}
                    </p>
                    {isOwned(item.id) ? (
                      <Button
                        onClick={() => handlePlaceItem(item.id)}
                        disabled={isPlaced(item.id)}
                        size="sm"
                        className="w-full"
                        variant={isPlaced(item.id) ? 'secondary' : 'default'}
                      >
                        {isPlaced(item.id) ? 'Placed' : 'Place'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePurchase(item)}
                        disabled={currency < item.price}
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      >
                        {item.price} 🪙
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Decorations */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Image className="w-5 h-5" />
              Decorations
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {shopItems
                .filter((item) => item.category === 'decoration')
                .map((item) => (
                  <div
                    key={item.id}
                    className={`relative bg-gray-50 rounded-lg p-4 border-2 transition-all ${
                      isOwned(item.id) ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-5xl text-center mb-2">{item.emoji}</div>
                    <p className="text-sm font-medium text-gray-900 text-center mb-2">
                      {item.name}
                    </p>
                    {isOwned(item.id) ? (
                      <Button
                        onClick={() => handlePlaceItem(item.id)}
                        disabled={isPlaced(item.id)}
                        size="sm"
                        className="w-full"
                        variant={isPlaced(item.id) ? 'secondary' : 'default'}
                      >
                        {isPlaced(item.id) ? 'Placed' : 'Place'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePurchase(item)}
                        disabled={currency < item.price}
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      >
                        {item.price} 🪙
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Electronics */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TvMinimal className="w-5 h-5" />
              Electronics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {shopItems
                .filter((item) => item.category === 'electronics')
                .map((item) => (
                  <div
                    key={item.id}
                    className={`relative bg-gray-50 rounded-lg p-4 border-2 transition-all ${
                      isOwned(item.id) ? 'border-green-300 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-5xl text-center mb-2">{item.emoji}</div>
                    <p className="text-sm font-medium text-gray-900 text-center mb-2">
                      {item.name}
                    </p>
                    {isOwned(item.id) ? (
                      <Button
                        onClick={() => handlePlaceItem(item.id)}
                        disabled={isPlaced(item.id)}
                        size="sm"
                        className="w-full"
                        variant={isPlaced(item.id) ? 'secondary' : 'default'}
                      >
                        {isPlaced(item.id) ? 'Placed' : 'Place'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handlePurchase(item)}
                        disabled={currency < item.price}
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      >
                        {item.price} 🪙
                      </Button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Customize Tab */}
      {selectedTab === 'customize' && (
        <div className="space-y-6">
          {/* Wall Colors */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Wall Color</h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {wallColors.map((color) => (
                <div key={color.id} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => {
                      if (isOwned(color.id)) {
                        setWallColor(color.id);
                      } else if (currency >= color.price) {
                        setOwnedItems([...ownedItems, color.id]);
                        setWallColor(color.id);
                        onPurchase(color.price, `${color.name} Wall`);
                      }
                    }}
                    disabled={!isOwned(color.id) && currency < color.price}
                    className={`w-full aspect-square rounded-lg ${color.class} border-4 transition-all ${
                      wallColor === color.id
                        ? 'border-gray-900 scale-105 shadow-lg'
                        : 'border-gray-300 hover:scale-105'
                    } ${!isOwned(color.id) ? 'opacity-60' : ''}`}
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700">{color.name}</p>
                    {!isOwned(color.id) && color.price > 0 && (
                      <p className="text-xs text-yellow-600 font-bold">{color.price} 🪙</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floor Colors */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-4">Floor Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {floorColors.map((color) => (
                <div key={color.id} className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => {
                      if (isOwned(color.id)) {
                        setFloorColor(color.id);
                      } else if (currency >= color.price) {
                        setOwnedItems([...ownedItems, color.id]);
                        setFloorColor(color.id);
                        onPurchase(color.price, `${color.name} Floor`);
                      }
                    }}
                    disabled={!isOwned(color.id) && currency < color.price}
                    className={`w-full aspect-square rounded-lg ${color.class} border-4 transition-all ${
                      floorColor === color.id
                        ? 'border-gray-900 scale-105 shadow-lg'
                        : 'border-gray-300 hover:scale-105'
                    } ${!isOwned(color.id) ? 'opacity-60' : ''}`}
                  />
                  <div className="text-center">
                    <p className="text-xs font-medium text-gray-700">{color.name}</p>
                    {!isOwned(color.id) && color.price > 0 && (
                      <p className="text-xs text-yellow-600 font-bold">{color.price} 🪙</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
