import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/app/config/routes";
import { useLogin } from "@/features/auth/hooks/use-login";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";

export function LoginForm() {
  const navigate = useNavigate();
  const { loginRestaurant, isLoggingIn, loginError, resetLoginError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "rest@test.com",
      password: "123456",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    resetLoginError();

    try {
      await loginRestaurant(values);
      navigate(ROUTES.DASHBOARD, { replace: true });
    } catch {
      return;
    }
  });

  return (
    <Card className="w-full max-w-md space-y-5 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Restaurant Access</p>
        <h1 className="text-2xl font-semibold text-slate-900">Login Restaurante</h1>
        <p className="text-sm text-slate-600">Accede para ver pedidos, cocina y productos.</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="email">
            Email
          </label>
          <Input id="email" type="email" placeholder="email" {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-red-600">{errors.email.message}</p> : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="password">
            Password
          </label>
          <Input id="password" type="password" placeholder="password" {...register("password")} />
          {errors.password ? <p className="mt-1 text-xs text-red-600">{errors.password.message}</p> : null}
        </div>

        <div aria-live="polite" className="min-h-5 text-sm text-red-600">
          {loginError instanceof Error ? loginError.message : ""}
        </div>

        <Button type="submit" disabled={isSubmitting || isLoggingIn} className="w-full">
          {isSubmitting || isLoggingIn ? "Ingresando..." : "Ingresar"}
        </Button>
      </form>
    </Card>
  );
}
