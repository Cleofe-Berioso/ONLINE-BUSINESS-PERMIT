"use client";

import { useState } from "react";
import { CreditCard, Loader2, X, CheckCircle, Phone, Building2, Banknote } from "lucide-react";
import { toast } from "sonner";

interface PayNowButtonProps {
  applicationId: string;
  applicationNumber: string;
  businessName: string;
  businessType: string;
  applicationType: string;
}

const METHOD_LABELS: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
  GCASH:         { label: "GCash",         icon: <Phone className="h-5 w-5 text-blue-500" />,    desc: "Pay via GCash e-wallet" },
  MAYA:          { label: "Maya",          icon: <Phone className="h-5 w-5 text-green-500" />,   desc: "Pay via Maya (PayMaya)" },
  BANK_TRANSFER: { label: "Bank Transfer", icon: <Building2 className="h-5 w-5 text-purple-500" />, desc: "Online bank transfer / PESONet" },
  OTC:           { label: "Over the Counter", icon: <Banknote className="h-5 w-5 text-yellow-600" />, desc: "Pay at the BPLO office cashier" },
  CASH:          { label: "Cash",          icon: <Banknote className="h-5 w-5 text-gray-500" />,  desc: "Pay in person (cash)" },
};

export function PayNowButton({ applicationId, applicationNumber, businessName, businessType, applicationType }: PayNowButtonProps) {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<string>("GCASH");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; receipt?: unknown } | null>(null);
  const [error, setError] = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId, method }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Payment failed");
        return;
      }
      // If there's a checkout URL (online gateway), redirect
      if (data.payment?.checkoutUrl) {
        window.open(data.payment.checkoutUrl, "_blank");
      }
      setResult({ success: true, message: data.message || "Payment processed successfully!", receipt: data.receipt });
      toast.success("Payment processed! Your permit fee has been received.");
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Estimate fee
  const isNew = applicationType === "NEW";
  const isMicro = ["SARI-SARI_STORE", "MICRO"].includes(businessType);
  const baseFee = isNew ? (isMicro ? 300 : 800) : (isMicro ? 200 : 600);
  const processingFee = 50;
  const total = baseFee + processingFee;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
      >
        <CreditCard className="h-4 w-4" />
        Pay Permit Fee
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Pay Permit Fee</h2>
              <button onClick={() => { setOpen(false); setResult(null); setError(""); }} className="rounded p-1 hover:bg-gray-100">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="px-6 py-4">
              {result?.success ? (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <p className="text-lg font-semibold text-gray-900">Payment Submitted!</p>
                  <p className="text-sm text-gray-600">{result.message}</p>
                  <button
                    onClick={() => { setOpen(false); setResult(null); window.location.reload(); }}
                    className="mt-2 rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  {/* Fee Breakdown */}
                  <div className="mb-4 rounded-lg bg-gray-50 p-4 text-sm">
                    <p className="mb-2 font-semibold text-gray-700">Fee Breakdown</p>
                    <div className="flex justify-between text-gray-600">
                      <span>Application: {applicationNumber}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Business: {businessName}</span>
                    </div>
                    <div className="mt-3 border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Permit Fee</span>
                        <span>₱{baseFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Processing Fee</span>
                        <span>₱{processingFee.toLocaleString()}</span>
                      </div>
                      <div className="mt-2 flex justify-between font-bold text-gray-900">
                        <span>Total</span>
                        <span>₱{total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">Payment Method</p>
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(METHOD_LABELS).map(([key, val]) => (
                        <label key={key} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${method === key ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                          <input type="radio" name="method" value={key} checked={method === key} onChange={() => setMethod(key)} className="sr-only" />
                          {val.icon}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{val.label}</p>
                            <p className="text-xs text-gray-500">{val.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

                  <div className="flex gap-3">
                    <button onClick={() => setOpen(false)} className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                      Cancel
                    </button>
                    <button
                      onClick={handlePay}
                      disabled={loading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                      {loading ? "Processing…" : `Pay ₱${total.toLocaleString()}`}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
