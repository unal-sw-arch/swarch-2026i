import { useEffect, useState } from 'react';
import { Star, MessageSquare, Store, Info } from 'lucide-react';
import { ratingService, type IndividualRating, type RatingSummary, type Restaurant } from '@/lib/services/ratingService';

export const AdminRatingsPage = () => {
  const [ratings, setRatings] = useState<IndividualRating[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  // Supongamos que obtienes este ID del contexto o la URL
  const restaurantId = 1001; 

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [summaryData, ratingsData, restaurantData] = await Promise.all([
          ratingService.getSummary(restaurantId),
          ratingService.getRestaurantRatings(restaurantId),
          ratingService.getRestaurantDetail(restaurantId)
        ]);

        setSummary(summaryData);
        setRatings(ratingsData);
        setRestaurant(restaurantData);
      } catch (error) {
        console.error("Error cargando panel de control:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [restaurantId]);

  if (loading) return <div className="p-20 text-center animate-pulse text-slate-400">Cargando panel de feedback...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header Dinámico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {restaurant?.name || "Cargando..."}
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <Info className="w-4 h-4" /> {restaurant?.description || "Panel de administración de reseñas"}
          </p>
        </div>
        <div className="text-right">
          <span className="bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            {restaurant?.placeType || "Local"}
          </span>
        </div>
      </div>

      {/* Grid de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          label="Puntaje Promedio" 
          value={`${summary?.averageScore.toFixed(2) ?? "0.00"}`} 
          subValue="/ 5.0"
          icon={<Star className="w-5 h-5 text-orange-500 fill-orange-500" />}
        />
        <SummaryCard 
          label="Total de Reseñas" 
          value={summary?.totalRatings.toString() ?? "0"} 
          subValue="comentarios"
          icon={<MessageSquare className="w-5 h-5 text-blue-500" />}
        />
        <SummaryCard 
          label="Establecimiento" 
          value={restaurant?.name ?? "---"} 
          subValue={`ID: ${restaurant?.id}`}
          icon={<Store className="w-5 h-5 text-slate-400" />} 
        />
      </div>

      {/* Lista de Feedback */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-800 uppercase tracking-tighter">Opiniones de clientes</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {ratings.map((r) => (
            <div key={r.id} className="p-6 hover:bg-slate-50/30 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-slate-900 leading-none mb-1">{r.customerName}</p>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-tight">Orden #{r.orderId}</p>
                </div>
                <div className="flex items-center gap-1 text-orange-600 font-black">
                  {r.score.toFixed(1)} <Star className="w-4 h-4 fill-current" />
                </div>
              </div>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed border-l-4 border-slate-100 pl-4 italic">
                "{r.review}"
              </p>
              <p className="mt-3 text-[10px] text-slate-400 font-bold uppercase">
                {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Componente de Tarjeta
const SummaryCard = ({ label, value, subValue, icon }: { label: string, value: string, subValue: string, icon: any }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
    <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
    <div>
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-slate-900">{value}</span>
        <span className="text-xs font-bold text-slate-300">{subValue}</span>
      </div>
    </div>
  </div>
);