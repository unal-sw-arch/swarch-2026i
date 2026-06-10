import { useEffect, useState } from "react";
import { Trash2, Plus, AlertCircle, RefreshCw, Save } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { hoursService } from "@/lib/services/hoursService";
import type { OperatingHours } from "@/lib/types";
import { Button } from "@/components/ui/button";

// Generamos las opciones del 00:00 al 23:00
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: `${i.toString().padStart(2, '0')}:00:00`,
  label: `${i.toString().padStart(2, '0')}:00`
}));

const DAYS = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

const START_GRID_HOUR = 8;
const TIME_SLOTS = Array.from({ length: 15 }, (_, i) => i + START_GRID_HOUR);

export const HoursPage = () => {
  const { restaurantId } = useAuth();
  const [hours, setHours] = useState<OperatingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState<string | null>(null);

  const loadHours = async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await hoursService.getByRestaurantId(restaurantId);
      setHours(data);
    } catch (error) {
      console.error("Error al cargar horarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) loadHours();
  }, [restaurantId]);

  const getDayHours = (dayValue: string) => hours.find(h => h.dayOfWeek === dayValue);

  const handleToggleDay = (dayValue: string) => {
    if (getDayHours(dayValue)) return;
    
    // CORRECCIÓN: Se incluye isOpen: true para cumplir con la interfaz OperatingHours
    const newEntry: OperatingHours = {
      dayOfWeek: dayValue as any,
      openTime: '09:00:00',
      closeTime: '17:00:00',
      isOpen: true, 
      id: Math.floor(Math.random() * -1000)
    };
    
    setHours(prev => [...prev, newEntry]);
  };

  const handleTimeChange = (dayValue: string, field: 'openTime' | 'closeTime', newValue: string) => {
    setHours(prev => prev.map(h => {
      if (h.dayOfWeek !== dayValue) return h;

      let updatedDay = { ...h, [field]: newValue };

      // Lógica de validación: Apertura siempre menor que cierre
      const openH = parseInt(updatedDay.openTime.split(':')[0]);
      const closeH = parseInt(updatedDay.closeTime.split(':')[0]);

      if (openH >= closeH) {
        const nextHour = (openH + 1) % 24;
        updatedDay.closeTime = `${nextHour.toString().padStart(2, '0')}:00:00`;
      }

      return updatedDay;
    }));
  };

  const handleSave = async (dayValue: string) => {
    const item = getDayHours(dayValue);
    if (!item || !restaurantId) return;
    setIsSubmitting(dayValue);
    
    try {
      const payload = { 
        ...item, 
        id: (item.id && item.id > 0) ? item.id : undefined 
      };
      await hoursService.saveHours(restaurantId, payload);
      await loadHours();
    } catch (error) {
      alert("Error al guardar el horario.");
    } finally {
      setIsSubmitting(null);
    }
  };
  const handleDelete = async (item: OperatingHours) => {
  // Si no tiene id real (ej: los temporales negativos), solo lo quitamos del estado
  if (!item.id || item.id < 0) {
    setHours(prev => prev.filter(h => h.dayOfWeek !== item.dayOfWeek));
    return;
  }

  try {
    await hoursService.delete(item.id);
    setHours(prev => prev.filter(h => h.id !== item.id));
  } catch (error) {
    console.error("Error eliminando horario:", error);
    alert("No se pudo eliminar el horario");
  }
};

  const getTimeStyle = (open: string, close: string) => {
    const startH = parseInt(open?.split(':')[0]) || START_GRID_HOUR;
    const endH = parseInt(close?.split(':')[0]) || (startH + 1);
    
    const rowStart = (startH - START_GRID_HOUR) + 2;
    const rowEnd = (endH - START_GRID_HOUR) + 2;
    
    return { 
      gridRowStart: Math.max(2, rowStart), 
      gridRowEnd: Math.max(rowStart + 1, rowEnd) 
    };
  };

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <RefreshCw className="animate-spin text-blue-500" size={32} />
      <p className="text-gray-500 font-medium">Cargando calendario semanal...</p>
    </div>
  );

  return (
    <div className="p-4 space-y-6 max-w-[1200px] mx-auto">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Panel de Horarios</h1>
        <p className="text-sm text-gray-500 italic">Formato 24 horas automático</p>
      </div>

      <div className="relative overflow-hidden border rounded-xl bg-white shadow-sm">
        <div className="grid grid-cols-8 grid-rows-[45px_repeat(15,60px)] min-w-[900px]">
          {/* Header de la Tabla */}
          <div className="bg-gray-50 border-r border-b flex items-center justify-center text-[10px] font-bold text-gray-400">HORA</div>
          {DAYS.map(day => (
            <div key={day.value} className="bg-gray-50 border-r border-b flex items-center justify-center font-bold text-xs text-gray-600 uppercase">
              {day.label}
            </div>
          ))}

          {/* Eje de Horas Lateral */}
          {TIME_SLOTS.map((hour, i) => (
            <div key={hour} style={{ gridRowStart: i + 2, gridColumnStart: 1 }} className="bg-white border-r border-b flex items-start justify-center pt-2 text-[11px] text-gray-400 font-medium">
              {`${hour}:00`}
            </div>
          ))}

          {/* Grilla de interacción de fondo */}
          {TIME_SLOTS.map((_, rowIndex) => DAYS.map((day, colIndex) => (
            <div 
              key={`${day.value}-${rowIndex}`} 
              style={{ gridRowStart: rowIndex + 2, gridColumnStart: colIndex + 2 }}
              className="border-r border-b bg-gray-50/10 hover:bg-blue-50/30 transition-colors cursor-pointer flex items-center justify-center group"
              onClick={() => handleToggleDay(day.value)}
            >
              {!getDayHours(day.value) && <Plus size={16} className="text-gray-200 group-hover:text-blue-300" />}
            </div>
          )))}

          {/* Bloques de Horarios Activos */}
          {hours.map((item) => {
            const dayIdx = DAYS.findIndex(d => d.value === item.dayOfWeek);
            if (dayIdx === -1) return null;

            return (
              <div 
                key={item.id || item.dayOfWeek} 
                style={{ ...getTimeStyle(item.openTime, item.closeTime), gridColumnStart: dayIdx + 2 }}
                className="mx-1 my-1 bg-blue-50 border-l-4 border-blue-600 rounded-md shadow-md z-10 p-3 flex flex-col justify-between animate-in fade-in zoom-in duration-200"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b border-blue-100 pb-1">
                    <span className="text-[10px] font-black text-blue-700 uppercase">Abierto</span>
                    <button 
                      onClick={() => handleDelete(item)} 
                      className="text-red-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-blue-400 uppercase">Apertura</label>
                      <select 
                        className="w-full text-xs border border-blue-200 rounded bg-white p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={item.openTime}
                        onChange={(e) => handleTimeChange(item.dayOfWeek, 'openTime', e.target.value)}
                      >
                        {HOUR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] font-bold text-blue-400 uppercase">Cierre</label>
                      <select 
                        className="w-full text-xs border border-blue-200 rounded bg-white p-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={item.closeTime}
                        onChange={(e) => handleTimeChange(item.dayOfWeek, 'closeTime', e.target.value)}
                      >
                        {HOUR_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <Button 
                  size="sm" 
                  className="h-8 text-[10px] w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm" 
                  onClick={() => handleSave(item.dayOfWeek)} 
                  disabled={isSubmitting === item.dayOfWeek}
                >
                  {isSubmitting === item.dayOfWeek ? <RefreshCw className="animate-spin w-3 h-3" /> : 'ACTUALIZAR'}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl items-start">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
        <div className="text-sm text-amber-800 leading-tight">
          <strong>Aviso de validación:</strong> Si seleccionas una hora de apertura mayor o igual al cierre, el sistema ajustará el cierre automáticamente a una hora después de la apertura.
        </div>
      </div>
    </div>
  );
};