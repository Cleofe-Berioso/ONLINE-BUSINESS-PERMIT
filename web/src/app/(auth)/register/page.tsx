"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push(
        `/verify-otp?userId=${encodeURIComponent(data.userId)}&email=${encodeURIComponent(formData.email)}&type=EMAIL_VERIFICATION`
      );
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[var(--accent-light)] to-[var(--background)] px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Shield className="h-10 w-10 text-[var(--accent)]" />
            <span className="text-2xl font-bold text-[var(--text-primary)]">
              Business Permit System
            </span>
          </Link>
        </div>        {/* Form Card */}
        <div className="rounded-2xl bg-[var(--surface)] p-6 sm:p-8 shadow-xl">
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">
            Create your account
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Register to apply for a business permit online
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-[var(--danger-light)] p-3 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-2.5 text-[var(--text-primary)] placeholder-gray-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                  placeholder="Juan"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-[var(--text-primary)]"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-2.5 text-[var(--text-primary)] placeholder-gray-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                  placeholder="Dela Cruz"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="middleName"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Middle Name (Optional)
              </label>
              <input
                id="middleName"
                name="middleName"
                type="text"
                value={formData.middleName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-2.5 text-[var(--text-primary)] placeholder-gray-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                placeholder="Santos"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Email Address *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-2.5 text-[var(--text-primary)] placeholder-gray-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                placeholder="juan@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Phone Number (Optional)
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-2.5 text-[var(--text-primary)] placeholder-gray-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                placeholder="09171234567"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Password *
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-[var(--border)] px-4 py-2.5 pr-10 text-[var(--text-primary)] placeholder-gray-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                  placeholder="Min. 8 chars, upper, lower, number, special"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-[var(--background)]0">
                Must include uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-[var(--text-primary)]"
              >
                Confirm Password *
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-[var(--border)] px-4 py-2.5 text-[var(--text-primary)] placeholder-gray-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
              />
              <span className="text-sm text-[var(--text-secondary)]">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  Privacy Policy
                </Link>
                , in accordance with Republic Act 10173 (Data Privacy Act).
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
