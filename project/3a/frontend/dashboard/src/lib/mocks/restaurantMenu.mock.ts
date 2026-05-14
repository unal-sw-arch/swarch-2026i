export interface RestaurantMenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  image: string;
}

export const restaurantMenuById: Record<string, RestaurantMenuItem[]> = {
  "1001": [
    {
      id: "1001-1",
      name: "Lomo Saltado",
      description: "Carne salteada con tomate, cebolla y papas crocantes.",
      price: "$ 29.900",
      image: "https://images.unsplash.com/photo-1604908176997-431f81918a93?w=900&h=600&fit=crop&auto=format",
    },
    {
      id: "1001-2",
      name: "Ceviche Clasico",
      description: "Pescado fresco marinado en limon con ají y cilantro.",
      price: "$ 27.500",
      image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=900&h=600&fit=crop&auto=format",
    },
  ],
  "1002": [
    {
      id: "1002-1",
      name: "Arroz Oriental de Pollo",
      description: "Arroz salteado al wok con vegetales y salsa de soya.",
      price: "$ 24.000",
      image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=900&h=600&fit=crop&auto=format",
    },
    {
      id: "1002-2",
      name: "Pollo Agridulce",
      description: "Trozos de pollo crujiente en salsa agridulce.",
      price: "$ 26.500",
      image: "https://images.unsplash.com/photo-1604908554167-6ed6a6c9f839?w=900&h=600&fit=crop&auto=format",
    },
  ],
  "1003": [
    {
      id: "1003-1",
      name: "Burrito Carnal",
      description: "Tortilla rellena de carne, frijol, guacamole y queso.",
      price: "$ 22.900",
      image: "https://images.unsplash.com/photo-1565299585323-38174c4a6c4a?w=900&h=600&fit=crop&auto=format",
    },
    {
      id: "1003-2",
      name: "Nachos Supreme",
      description: "Nachos con carne, pico de gallo, crema y queso.",
      price: "$ 21.500",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=900&h=600&fit=crop&auto=format",
    },
  ],
};

export const defaultRestaurantMenu: RestaurantMenuItem[] = [
  {
    id: "default-1",
    name: "Plato Especial de la Casa",
    description: "Preparacion destacada con ingredientes frescos del dia.",
    price: "$ 24.900",
    image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=900&h=600&fit=crop&auto=format",
  },
  {
    id: "default-2",
    name: "Entrada Recomendada",
    description: "Ideal para abrir el apetito antes del plato fuerte.",
    price: "$ 12.500",
    image: "https://images.unsplash.com/photo-1546039907-7fa05f864c02?w=900&h=600&fit=crop&auto=format",
  },
];

