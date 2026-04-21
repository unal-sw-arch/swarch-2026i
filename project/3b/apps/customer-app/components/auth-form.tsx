"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { useToast } from "@/components/toast-provider";
import type { ApiError } from "@/lib/types";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);

  const endpoint =
    mode === "login" ? "/api/session/login" : "/api/session/register";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        mode === "login" ? { email, password } : { name, email, password },
      ),
    });

    if (!response.ok) {
      const error = (await response.json()) as ApiError;
      pushToast(error.code, error.message);
      setIsPending(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <form className="stack" onSubmit={handleSubmit}>
      {mode === "register" ? (
        <label className="field">
          <span>Name</span>
          <input
            onChange={(event) => setName(event.target.value)}
            placeholder="Laura"
            required
            value={name}
          />
        </label>
      ) : null}

      <label className="field">
        <span>Email</span>
        <input
          onChange={(event) => setEmail(event.target.value)}
          placeholder="laura@test.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="123456"
          required
          type="password"
          value={password}
        />
      </label>

      <button className="button" disabled={isPending} type="submit">
        {isPending
          ? "Working..."
          : mode === "login"
            ? "Sign in"
            : "Create account"}
      </button>
    </form>
  );
}
