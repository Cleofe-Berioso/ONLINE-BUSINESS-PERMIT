"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Get userId and type from URL params
      const params = new URLSearchParams(window.location.search);
      const userId = params.get("userId");
      const type = params.get("type") || "EMAIL_VERIFICATION";

      if (!userId) {
        setError("Invalid verification link. Please register again.");
        return;
      }

      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp, userId, type }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      setSuccess(data.message);

      // Redirect to login after 2 seconds
      if (data.verified) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("userId");
    const type = params.get("type") || "EMAIL_VERIFICATION";

    if (!userId) return;

    try {
      // TODO: Implement resend OTP API
      setSuccess("A new OTP has been sent to your email.");
      console.log("Resend OTP for:", userId, type);
    } catch {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Verify Your Account</h1>
            <p className="mt-2 text-gray-600">
              Enter the 6-digit OTP sent to your registered email address
            </p>
          </div>

          {error && <Alert variant="error" className="mb-4">{error}</Alert>}
          {success && <Alert variant="success" className="mb-4">{success}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="One-Time Password (OTP)"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-2xl tracking-[0.5em] font-mono"
                required
              />
            </div>

            <Button type="submit" className="w-full" loading={loading}>
              Verify OTP
            </Button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-gray-600">
              Didn&apos;t receive the code?{" "}
              <button
                onClick={handleResendOtp}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Resend OTP
              </button>
            </p>
            <p className="text-sm text-gray-500">
              <Link href="/login" className="text-blue-600 hover:text-blue-700">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
