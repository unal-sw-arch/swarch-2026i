const ratings = [
  {
    id: "RT-5001",
    restaurant: "Urban Bistro",
    customer: "Ana Ríos",
    score: 4.8,
    comment: "Excelente servicio y la orden llegó a tiempo.",
    date: "2025-10-20",
  },
  {
    id: "RT-5002",
    restaurant: "Café Andino",
    customer: "Carlos Mendez",
    score: 4.2,
    comment: "Buen café, la reserva fue rápida.",
    date: "2025-10-18",
  },
  {
    id: "RT-5003",
    restaurant: "Urban Bistro",
    customer: "John Doe",
    score: 3.9,
    comment: "Demora en cocina pero buena atención.",
    date: "2025-10-15",
  },
];

export const AdminRatingsPage = () => {
  const avg = (ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length).toFixed(2);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-gray-900">Ratings y Feedback</h1>
        <p className="text-gray-600">
          Opiniones de clientes posteriores a la visita (FR-06, US-23, US-24).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard label="Promedio general" value={`${avg} / 5`} />
        <SummaryCard label="Total reseñas" value={ratings.length.toString()} />
        <SummaryCard label="Última reseña" value={ratings[0]?.date ?? "-"} />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        {ratings.map((r) => (
          <div key={r.id} className="py-3 border-b last:border-b-0 border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">{r.restaurant}</p>
                <p className="text-sm text-gray-600">Cliente: {r.customer}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-yellow-600">{r.score.toFixed(1)} ★</p>
                <p className="text-xs text-gray-500">{r.date}</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface SummaryCardProps {
  label: string;
  value: string;
}

const SummaryCard = ({ label, value }: SummaryCardProps) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-600">{label}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
  </div>
);

