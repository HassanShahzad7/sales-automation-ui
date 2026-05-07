"use client";

import { useState, useId } from "react";
import { useRouter } from "next/navigation";
import * as api from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const uid = useId();
  const usernameId = `${uid}-username`;
  const emailId = `${uid}-email`;
  const passwordId = `${uid}-password`;
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { access_token: userToken } = await api.login(email, password);
      const session = await api.createSession(userToken);
      saveAuth({
        userToken,
        sessionId: session.session_id,
        sessionToken: session.token.access_token,
      });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const { token } = await api.register(
        email,
        password,
        username || undefined,
      );
      const session = await api.createSession(token.access_token);
      saveAuth({
        userToken: token.access_token,
        sessionId: session.session_id,
        sessionToken: session.token.access_token,
      });
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-xl border bg-card p-8 shadow-sm">
        <div className="mb-8 text-center">
          <h1 className="font-bold text-2xl">Sales Assistant</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            AI-powered sales automation
          </p>
        </div>

        <div className="mb-6 flex rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setError("");
            }}
            className={`flex-1 rounded-md py-2 font-medium text-sm transition-colors ${
              tab === "login"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setError("");
            }}
            className={`flex-1 rounded-md py-2 font-medium text-sm transition-colors ${
              tab === "register"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Register
          </button>
        </div>

        <form
          onSubmit={tab === "login" ? handleLogin : handleRegister}
          className="space-y-4"
        >
          {tab === "register" && (
            <div>
              <label
                htmlFor={usernameId}
                className="mb-1.5 block font-medium text-sm"
              >
                Name <span className="text-muted-foreground">(optional)</span>
              </label>
              <input
                id={usernameId}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}

          <div>
            <label
              htmlFor={emailId}
              className="mb-1.5 block font-medium text-sm"
            >
              Email
            </label>
            <input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label
              htmlFor={passwordId}
              className="mb-1.5 block font-medium text-sm"
            >
              Password
            </label>
            <input
              id={passwordId}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder={
                tab === "register"
                  ? "Min 8 chars, uppercase, number, special"
                  : "Your password"
              }
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-destructive text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary py-2.5 font-medium text-primary-foreground text-sm transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Please wait…"
              : tab === "login"
                ? "Sign In"
                : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
