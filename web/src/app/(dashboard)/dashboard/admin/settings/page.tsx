import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Server, Database, Globe } from "lucide-react";

export const metadata = { title: "System Settings" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMINISTRATOR") redirect("/dashboard");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Configure system-wide settings and preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
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
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">System Name</dt>
                <dd className="font-medium text-gray-900">
                  Online Business Permit System
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">LGU Name</dt>
                <dd className="font-medium text-gray-900">
                  Local Government Unit
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium text-gray-900">
                  permits@lgu.gov.ph
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Office Hours</dt>
                <dd className="font-medium text-gray-900">
                  Mon-Fri 8:00 AM – 5:00 PM
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

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
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">2FA Enforcement</dt>
                <dd className="font-medium text-gray-900">Optional</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Session Timeout</dt>
                <dd className="font-medium text-gray-900">30 minutes</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Password Policy</dt>
                <dd className="font-medium text-gray-900">
                  8+ chars, mixed case, number, special
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">OTP Expiry</dt>
                <dd className="font-medium text-gray-900">15 minutes</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Server className="h-5 w-5 text-purple-600" />
              <div>
                <CardTitle>System Info</CardTitle>
                <CardDescription>Technical information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Version</dt>
                <dd className="font-medium text-gray-900">1.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Framework</dt>
                <dd className="font-medium text-gray-900">Next.js 16</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Database</dt>
                <dd className="font-medium text-gray-900">PostgreSQL</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Node.js</dt>
                <dd className="font-medium text-gray-900">
                  {process.version || "v25.x"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-orange-600" />
              <div>
                <CardTitle>Data Privacy</CardTitle>
                <CardDescription>RA 10173 compliance settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Data Retention</dt>
                <dd className="font-medium text-gray-900">5 years</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Audit Logging</dt>
                <dd className="font-medium text-green-600">Enabled</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Encryption at Rest</dt>
                <dd className="font-medium text-green-600">Enabled</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">DPA Compliance</dt>
                <dd className="font-medium text-green-600">Active</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
