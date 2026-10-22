"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Activity, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useLoginMutation } from "@/lib/api";
import { ErrorMessage } from "../../components/ui/ErrorMessage";

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      await login({ email, password }).unwrap();
      router.replace("/");
    } catch (err) {
      const result = err as {
        data?: { message?: string; error?: string };
      };
      setError(
        result.data?.message ||
          result.data?.error ||
          "Login failed. Please check your credentials.",
      );
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section
        className="hidden flex-col justify-between p-12 text-white lg:flex xl:p-16"
        style={{ background: "#111d32" }}
      >
        <div className="flex items-center gap-3">
          <Activity size={27} className="text-blue-400" />
          <span className="text-lg font-bold">Doctor Tracker</span>
        </div>

        <div className="max-w-lg">
          <p className="mb-4 text-xs font-bold uppercase tracking-widest text-blue-300">
            Healthcare, organized
          </p>
          <h1 className="text-5xl font-bold leading-tight">
            Manage doctors and patients in one place.
          </h1>
          <p className="mt-6 text-base leading-7 text-slate-300">
            A secure administrative workspace for clearer healthcare operations
            and meaningful insights.
          </p>
        </div>

        <p className="text-xs text-slate-500">
          © Doctor Tracker
        </p>
      </section>

      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div
              className="mb-5 inline-flex rounded-xl p-3"
              style={{
                background: "var(--primary-soft)",
                color: "var(--primary)",
              }}
            >
              <LockKeyhole size={24} />
            </div>
            <h2 className="text-3xl font-bold">Admin sign in</h2>
            <p className="mt-2 muted">
              Enter your administrator credentials to continue.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block font-semibold">
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="muted absolute left-3 top-1/2 -translate-y-1/2"
                />
                <input
                  id="email"
                  className="field"
                  style={{ paddingLeft: "3rem" }}
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block font-semibold">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  className="field pr-12"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="muted absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <button
              className="btn-primary w-full py-3"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-7 text-center text-xs muted">
            Authorized administrators only
          </p>
        </div>
      </section>
    </main>
  );
}
