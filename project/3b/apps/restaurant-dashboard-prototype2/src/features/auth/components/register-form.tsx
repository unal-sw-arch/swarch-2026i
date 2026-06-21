import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ROUTES } from "@/app/config/routes";
import { registerSchema, type RegisterSchema } from "@/features/auth/schemas/register.schema";
import { useRegister } from "@/features/auth/hooks/use-register";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";

export function RegisterForm() {
  const navigate = useNavigate();
  const { registerRestaurant, isRegistering, registerError, resetRegisterError } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      restaurantId: 1,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    resetRegisterError();

    try {
      await registerRestaurant(values);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch {
      return;
    }
  });

  return (
    <Card className="w-full max-w-md space-y-5 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Restaurant Access</p>
        <h1 className="text-2xl font-semibold text-slate-900">Crear cuenta restaurante</h1>
        <p className="text-sm text-slate-600">Registra tu usuario y vincuralo a un restaurante existente.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="name">
            Nombre
          </label>
          <Input id="name" type="text" placeholder="Restaurante Demo" {...register("name")} />
          {errors.name ? <p className="mt-1 text-xs text-red-600">{errors.name.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <Input id="email" type="email" placeholder="admin@restaurante.com" {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" placeholder="123456" {...register("password")} />
          {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="restaurantId">
            ID restaurante
          </label>
          <Input id="restaurantId" min={1} step={1} type="number" {...register("restaurantId")} />
          {errors.restaurantId ? <p className="mt-1 text-xs text-red-600">{errors.restaurantId.message}</p> : null}
        </div>

        <div aria-live="polite" className="min-h-5 text-sm text-red-600">
          {registerError instanceof Error ? registerError.message : ""}
        </div>

        <Button type="submit" disabled={isSubmitting || isRegistering} className="w-full">
          {isSubmitting || isRegistering ? "Creando cuenta..." : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-600">
        Ya tienes cuenta?{" "}
        <Link className="font-medium text-slate-900 underline-offset-4 hover:underline" to={ROUTES.LOGIN}>
          Iniciar sesion
        </Link>
      </p>
    </Card>
  );
}
