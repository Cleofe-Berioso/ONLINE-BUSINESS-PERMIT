"use client";

import { useState } from "react";
import { Globe, Shield, Server, Database, Save, Loader2, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Setting {
  key: string;
  value: string;
  description: string | null;
}

interface Props {
  initialSettings: Setting[];
  nodeVersion: string;
}

function getVal(settings: Setting[], key: string, fallback = "") {
  return settings.find((s) => s.key === key)?.value ?? fallback;
}

export function AdminSettingsClient({ initialSettings, nodeVersion }: Props) {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Editable fields map: key → current value in form
  const [form, setForm] = useState({
    system_name: getVal(initialSettings, "system_name", "Online Business Permit System"),
    lgu_name: getVal(initialSettings, "lgu_name", "Local Government Unit"),
    lgu_email: getVal(initialSettings, "lgu_email", "permits@lgu.gov.ph"),
    lgu_phone: getVal(initialSettings, "lgu_phone", ""),
    office_hours: getVal(initialSettings, "office_hours", "Mon-Fri 8:00 AM – 5:00 PM"),
    permit_validity_days: getVal(initialSettings, "permit_validity_days", "365"),
    max_applications_per_user: getVal(initialSettings, "max_applications_per_user", "5"),
    otp_expiry_minutes: getVal(initialSettings, "otp_expiry_minutes", "15"),
    session_timeout_minutes: getVal(initialSettings, "session_timeout_minutes", "30"),
    require_2fa: getVal(initialSettings, "require_2fa", "false"),
    maintenance_mode: getVal(initialSettings, "maintenance_mode", "false"),
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to save"); return; }
      setSettings(data.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelCls = "block text-xs font-medium text-gray-500 mb-1";

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-600">Configure system-wide settings and preferences</p>
        </div>        <button
          onClick={handleSave}
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>System name, LGU info, contact details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelCls}>System Name</label>
              <input className={inputCls} value={form.system_name} onChange={e => set("system_name", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>LGU Name</label>
              <input className={inputCls} value={form.lgu_name} onChange={e => set("lgu_name", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>LGU Email</label>
              <input type="email" className={inputCls} value={form.lgu_email} onChange={e => set("lgu_email", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>LGU Phone</label>
              <input className={inputCls} value={form.lgu_phone} onChange={e => set("lgu_phone", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Office Hours</label>
              <input className={inputCls} value={form.office_hours} onChange={e => set("office_hours", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <div>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Authentication and access policies</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelCls}>Session Timeout (minutes)</label>
              <input type="number" min="5" max="480" className={inputCls} value={form.session_timeout_minutes} onChange={e => set("session_timeout_minutes", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>OTP Expiry (minutes)</label>
              <input type="number" min="1" max="60" className={inputCls} value={form.otp_expiry_minutes} onChange={e => set("otp_expiry_minutes", e.target.value)} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Require 2FA for all users</p>
                <p className="text-xs text-gray-500">Force all accounts to enable two-factor auth</p>
              </div>
              <button
                type="button"
                onClick={() => set("require_2fa", form.require_2fa === "true" ? "false" : "true")}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.require_2fa === "true" ? "bg-blue-600" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.require_2fa === "true" ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Disable access for non-admin users</p>
              </div>
              <button
                type="button"
                onClick={() => set("maintenance_mode", form.maintenance_mode === "true" ? "false" : "true")}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${form.maintenance_mode === "true" ? "bg-orange-500" : "bg-gray-200"}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${form.maintenance_mode === "true" ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Application Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-orange-600" />
              <div>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Permit and application configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className={labelCls}>Permit Validity (days)</label>
              <input type="number" min="1" max="1825" className={inputCls} value={form.permit_validity_days} onChange={e => set("permit_validity_days", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Max Applications per User</label>
              <input type="number" min="1" max="50" className={inputCls} value={form.max_applications_per_user} onChange={e => set("max_applications_per_user", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* System Info (read-only) */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>System Info</CardTitle>
                <CardDescription>Technical information (read-only)</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              {[
                ["Version", "1.0.0"],
                ["Framework", "Next.js 16"],
                ["Database", "PostgreSQL 16"],
                ["Node.js", nodeVersion],
                ["Total Settings", String(settings.length)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
