import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Maximo 100 caracteres"),
  email: z
    .string()
    .trim()
    .min(1, "El email es obligatorio")
    .email("Email invalido"),
  password: z
    .string()
    .min(1, "La contrasena es obligatoria")
    .min(6, "Minimo 6 caracteres"),
  restaurantId: z.coerce
    .number({
      invalid_type_error: "El ID del restaurante es obligatorio",
    })
    .int("Debe ser un numero entero")
    .positive("Debe ser mayor que cero"),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
