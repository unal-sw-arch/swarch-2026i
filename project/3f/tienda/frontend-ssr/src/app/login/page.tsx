"use client";
import { useState } from "react";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { showToast } from "../../components/Toast";
import FormInput from "../../components/FormInput";
import Button from "../../components/Button";

type Step = "credentials" | "verify";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm_password: "" });
  const [step, setStep] = useState<Step>("credentials");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const resetToCredentials = () => {
    setStep("credentials");
    setPendingUserId(null);
    setCode("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    const endpoint = isRegister ? "/api/register" : "/api/login";

    try {
      const res = await fetch(`http://localhost:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Error en la operación", "error");
        return;
      }

      if (isRegister) {
        showToast("Usuario creado. Ahora puedes iniciar sesión.", "success");
        setIsRegister(false);
        setForm({ username: "", email: "", password: "", confirm_password: "" });
        return;
      }

      // Login con flujo 2-step: el gateway devuelve userId y envia codigo por correo
      if (data.userId) {
        setPendingUserId(String(data.userId));
        setStep("verify");
        showToast("Código enviado a tu correo. Revisa tu bandeja.", "success");
        return;
      }

      // Compatibilidad con flujo antiguo: si el backend aun devolviera token directo
      if (data.token) {
        setCookie("token", data.token);
        router.push("/");
        router.refresh();
        return;
      }

      showToast("Respuesta inesperada del servidor", "error");
    } catch (err) {
      showToast("No se pudo conectar con el servidor", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!pendingUserId) {
      resetToCredentials();
      return;
    }
    setSubmitting(true);

    try {
      const res = await fetch(`http://localhost:3000/api/login/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: pendingUserId, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Código incorrecto", "error");
        return;
      }

      if (!data.token) {
        showToast("El servidor no devolvió un token", "error");
        return;
      }

      setCookie("token", data.token);
      showToast("¡Bienvenido!", "success");
      router.push("/");
      router.refresh();
    } catch (err) {
      showToast("No se pudo verificar el código", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const titleText = step === "verify"
    ? "Verifica tu identidad"
    : isRegister
      ? "Crear Cuenta"
      : "Iniciar Sesión";

  const subtitleText = step === "verify"
    ? `Te enviamos un código de 6 dígitos a ${form.email}`
    : isRegister
      ? "Únete a nuestra comunidad"
      : "Accede a tu cuenta";

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-white to-yellow-50">
      <div className="w-full max-w-md bg-white shadow-elevation-3 rounded-2xl p-8 sm:p-10 border-2 border-gray-100">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {titleText}
          </h2>
          <p className="text-center text-gray-500 text-sm">
            {subtitleText}
          </p>
        </div>

        {step === "credentials" && (
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Usuario</label>
                <FormInput
                  placeholder="tu_usuario"
                  value={form.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, username: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Correo</label>
              <FormInput
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Contraseña</label>
              <FormInput
                type="password"
                placeholder="contrasena"
                value={form.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {isRegister && (
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Confirmar Contraseña</label>
                <FormInput
                  type="password"
                  placeholder="contrasena"
                  value={form.confirm_password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, confirm_password: e.target.value })}
                  required
                />
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 rounded-lg bg-yellow-400 text-white hover:bg-yellow-500 font-bold text-lg mt-6"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? "Enviando..." : isRegister ? "Registrarme" : "Ingresar"}
            </Button>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Código de verificación</label>
              <FormInput
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="123456"
                value={code}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ""))}
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-2">
                El código caduca en 5 minutos. Revisa también la carpeta de Spam.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full py-3 rounded-lg bg-yellow-400 text-white hover:bg-yellow-500 font-bold text-lg mt-2"
              variant="primary"
              disabled={submitting || code.length !== 6}
            >
              {submitting ? "Verificando..." : "Verificar código"}
            </Button>

            <button
              type="button"
              onClick={resetToCredentials}
              className="w-full text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
              disabled={submitting}
            >
              Usar otro correo
            </button>
          </form>
        )}

        {step === "credentials" && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setForm({ username: "", email: "", password: "", confirm_password: "" });
              }}
              className="w-full text-sm font-medium text-yellow-600 hover:text-yellow-700 transition-colors"
            >
              {isRegister ? "¿Ya tienes cuenta? Ingresa aquí" : "¿No tienes cuenta? Regístrate aquí"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}