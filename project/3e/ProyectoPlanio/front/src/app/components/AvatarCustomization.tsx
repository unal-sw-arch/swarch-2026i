import { useState } from 'react';
import { Button } from './ui/button';
import { Check, Sparkles } from 'lucide-react';

const faceColors = [
  { id: 'purple', name: 'Purple', class: 'bg-purple-500', price: 0 },
  { id: 'blue', name: 'Blue', class: 'bg-blue-500', price: 0 },
  { id: 'green', name: 'Green', class: 'bg-green-500', price: 0 },
  { id: 'pink', name: 'Pink', class: 'bg-pink-500', price: 20 },
  { id: 'orange', name: 'Orange', class: 'bg-orange-500', price: 20 },
  { id: 'red', name: 'Red', class: 'bg-red-500', price: 20 },
  { id: 'yellow', name: 'Yellow', class: 'bg-yellow-500', price: 30 },
  { id: 'teal', name: 'Teal', class: 'bg-teal-500', price: 30 },
  { id: 'indigo', name: 'Indigo', class: 'bg-indigo-500', price: 30 },
];

const hats = [
  { id: 'none', name: 'None', emoji: '', price: 0 },
  { id: 'cap', name: 'Cap', emoji: '🧢', price: 50 },
  { id: 'tophat', name: 'Top Hat', emoji: '🎩', price: 80 },
  { id: 'crown', name: 'Crown', emoji: '👑', price: 150 },
  { id: 'party', name: 'Party Hat', emoji: '🎉', price: 60 },
  { id: 'wizard', name: 'Wizard Hat', emoji: '🧙', price: 100 },
];

const glasses = [
  { id: 'none', name: 'None', emoji: '', price: 0 },
  { id: 'regular', name: 'Glasses', emoji: '👓', price: 40 },
  { id: 'sunglasses', name: 'Sunglasses', emoji: '🕶️', price: 60 },
  { id: 'monocle', name: 'Monocle', emoji: '🧐', price: 80 },
];

const expressions = [
  { id: 'happy', name: 'Happy', emoji: '😊', price: 0 },
  { id: 'cool', name: 'Cool', emoji: '😎', price: 30 },
  { id: 'love', name: 'Love', emoji: '😍', price: 40 },
  { id: 'star', name: 'Star Eyes', emoji: '🤩', price: 50 },
  { id: 'laugh', name: 'Laughing', emoji: '😂', price: 40 },
  { id: 'wink', name: 'Wink', emoji: '😉', price: 35 },
];

interface AvatarCustomizationProps {
  currency: number;
  onPurchase: (amount: number, item: string) => void;
}

export default function AvatarCustomization({ currency, onPurchase }: AvatarCustomizationProps) {
  const [ownedItems, setOwnedItems] = useState<string[]>(['purple', 'blue', 'green', 'none', 'happy']);
  const [selectedColor, setSelectedColor] = useState('purple');
  const [selectedHat, setSelectedHat] = useState('none');
  const [selectedGlasses, setSelectedGlasses] = useState('none');
  const [selectedExpression, setSelectedExpression] = useState('happy');

  const handlePurchase = (item: { id: string; name: string; price: number }) => {
    if (currency >= item.price && !ownedItems.includes(item.id)) {
      setOwnedItems([...ownedItems, item.id]);
      onPurchase(item.price, item.name);
    }
  };

  const isOwned = (itemId: string) => ownedItems.includes(itemId);

  const currentColorClass = faceColors.find((c) => c.id === selectedColor)?.class || 'bg-purple-500';
  const currentExpression = expressions.find((e) => e.id === selectedExpression)?.emoji || '😊';
  const currentHat = hats.find((h) => h.id === selectedHat)?.emoji || '';
  const currentGlasses = glasses.find((g) => g.id === selectedGlasses)?.emoji || '';

  return (
    <div className="space-y-6">
      {/* Preview */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your Avatar</h2>
          <p className="text-sm text-gray-600">Customize how others see you in the group</p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="relative">
            {/* Main Avatar Circle */}
            <div className={`w-40 h-40 ${currentColorClass} rounded-full flex items-center justify-center shadow-xl border-4 border-white ring-4 ring-gray-100 relative overflow-visible`}>
              <span className="text-6xl">{currentExpression}</span>
              
              {/* Hat positioned above */}
              {currentHat && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-5xl">
                  {currentHat}
                </div>
              )}
              
              {/* Glasses positioned on face */}
              {currentGlasses && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-4xl">
                  {currentGlasses}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-700">
            This is how your teammates will see you! ✨
          </p>
        </div>
      </div>

      {/* Face Color */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Face Color</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {faceColors.map((color) => (
            <button
              key={color.id}
              onClick={() => isOwned(color.id) && setSelectedColor(color.id)}
              disabled={!isOwned(color.id)}
              className={`relative aspect-square rounded-xl ${color.class} border-4 transition-all ${
                selectedColor === color.id
                  ? 'border-gray-900 scale-105 shadow-lg'
                  : 'border-white hover:scale-105'
              } ${!isOwned(color.id) ? 'opacity-40' : ''}`}
            >
              {selectedColor === color.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white drop-shadow-lg" />
                </div>
              )}
              {!isOwned(color.id) && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold text-gray-900 px-2 py-1 rounded-full border-2 border-white">
                  {color.price}
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {faceColors.filter((c) => !isOwned(c.id) && c.price > 0).map((color) => (
            <Button
              key={color.id}
              onClick={() => handlePurchase(color)}
              disabled={currency < color.price}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              Buy {color.name} ({color.price} 🪙)
            </Button>
          ))}
        </div>
      </div>

      {/* Expression */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Expression</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {expressions.map((expr) => (
            <button
              key={expr.id}
              onClick={() => isOwned(expr.id) && setSelectedExpression(expr.id)}
              disabled={!isOwned(expr.id)}
              className={`relative aspect-square rounded-xl bg-gray-50 border-4 transition-all flex items-center justify-center text-4xl ${
                selectedExpression === expr.id
                  ? 'border-purple-500 scale-105 shadow-lg bg-purple-50'
                  : 'border-gray-200 hover:scale-105 hover:border-gray-300'
              } ${!isOwned(expr.id) ? 'opacity-40' : ''}`}
            >
              {expr.emoji}
              {!isOwned(expr.id) && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold text-gray-900 px-2 py-1 rounded-full border-2 border-white">
                  {expr.price}
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {expressions.filter((e) => !isOwned(e.id)).map((expr) => (
            <Button
              key={expr.id}
              onClick={() => handlePurchase(expr)}
              disabled={currency < expr.price}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              Buy {expr.name} ({expr.price} 🪙)
            </Button>
          ))}
        </div>
      </div>

      {/* Hats */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          Hats <Sparkles className="w-4 h-4 text-yellow-500" />
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {hats.map((hat) => (
            <button
              key={hat.id}
              onClick={() => isOwned(hat.id) && setSelectedHat(hat.id)}
              disabled={!isOwned(hat.id)}
              className={`relative aspect-square rounded-xl bg-gray-50 border-4 transition-all flex items-center justify-center text-4xl ${
                selectedHat === hat.id
                  ? 'border-purple-500 scale-105 shadow-lg bg-purple-50'
                  : 'border-gray-200 hover:scale-105 hover:border-gray-300'
              } ${!isOwned(hat.id) ? 'opacity-40' : ''}`}
            >
              {hat.emoji || '—'}
              {!isOwned(hat.id) && hat.price > 0 && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold text-gray-900 px-2 py-1 rounded-full border-2 border-white">
                  {hat.price}
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {hats.filter((h) => !isOwned(h.id) && h.price > 0).map((hat) => (
            <Button
              key={hat.id}
              onClick={() => handlePurchase(hat)}
              disabled={currency < hat.price}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              Buy {hat.name} ({hat.price} 🪙)
            </Button>
          ))}
        </div>
      </div>

      {/* Glasses */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          Eyewear <Sparkles className="w-4 h-4 text-yellow-500" />
        </h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {glasses.map((glass) => (
            <button
              key={glass.id}
              onClick={() => isOwned(glass.id) && setSelectedGlasses(glass.id)}
              disabled={!isOwned(glass.id)}
              className={`relative aspect-square rounded-xl bg-gray-50 border-4 transition-all flex items-center justify-center text-4xl ${
                selectedGlasses === glass.id
                  ? 'border-purple-500 scale-105 shadow-lg bg-purple-50'
                  : 'border-gray-200 hover:scale-105 hover:border-gray-300'
              } ${!isOwned(glass.id) ? 'opacity-40' : ''}`}
            >
              {glass.emoji || '—'}
              {!isOwned(glass.id) && glass.price > 0 && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-bold text-gray-900 px-2 py-1 rounded-full border-2 border-white">
                  {glass.price}
                </div>
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {glasses.filter((g) => !isOwned(g.id) && g.price > 0).map((glass) => (
            <Button
              key={glass.id}
              onClick={() => handlePurchase(glass)}
              disabled={currency < glass.price}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              Buy {glass.name} ({glass.price} 🪙)
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
