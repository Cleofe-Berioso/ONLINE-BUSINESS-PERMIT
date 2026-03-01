"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Send, Save } from "lucide-react";

const BUSINESS_TYPES = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "corporation", label: "Corporation" },
  { value: "cooperative", label: "Cooperative" },
  { value: "one_person_corp", label: "One Person Corporation" },
];

const DOCUMENT_TYPES = [
  "DTI/SEC/CDA Registration",
  "Barangay Business Clearance",
  "Zoning Clearance",
  "Locational Clearance",
  "Fire Safety Inspection Certificate",
  "Sanitary Permit",
  "Environmental Compliance Certificate",
  "Contract of Lease / Land Title",
  "Community Tax Certificate (Cedula)",
  "Valid Government ID",
];

export default function NewApplicationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    type: "NEW" as "NEW" | "RENEWAL",
    businessName: "",
    businessType: "",
    businessAddress: "",
    businessBarangay: "",
    businessCity: "",
    businessProvince: "",
    businessZipCode: "",
    businessPhone: "",
    businessEmail: "",
    dtiSecRegistration: "",
    tinNumber: "",
    sssNumber: "",
    businessArea: "",
    numberOfEmployees: "",
    capitalInvestment: "",
    grossSales: "",
    previousPermitId: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (asDraft: boolean) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Create application
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, submitAsDraft: asDraft }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create application");
        setLoading(false);
        return;
      }

      // Upload documents if any
      if (files.length > 0) {
        const uploadForm = new FormData();
        files.forEach((file) => uploadForm.append("files", file));
        uploadForm.append("applicationId", data.application.id);

        await fetch("/api/documents/upload", {
          method: "POST",
          body: uploadForm,
        });
      }

      setSuccess(
        asDraft
          ? "Application saved as draft."
          : "Application submitted successfully!"
      );

      setTimeout(() => {
        router.push(`/dashboard/applications/${data.application.id}`);
      }, 1500);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          New Business Permit Application
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Fill in the required information to apply for a business permit.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {["Application Type", "Business Info", "Documents", "Review"].map(
            (label, index) => (
              <div key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                      step > index + 1
                        ? "bg-green-600 text-white"
                        : step === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {step > index + 1 ? "✓" : index + 1}
                  </div>
                  <span className="mt-1 text-xs text-gray-500">{label}</span>
                </div>
                {index < 3 && (
                  <div
                    className={`mx-2 h-0.5 flex-1 ${
                      step > index + 1 ? "bg-green-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" className="mb-6">
          {success}
        </Alert>
      )}

      {/* Step 1: Application Type */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Application Type</CardTitle>
            <CardDescription>
              Select the type of permit application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {(["NEW", "RENEWAL"] as const).map((type) => (
                  <label
                    key={type}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                      formData.type === type
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {type === "NEW" ? "New Application" : "Renewal"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {type === "NEW"
                          ? "Apply for a new business permit"
                          : "Renew your existing business permit"}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {formData.type === "RENEWAL" && (
                <Input
                  label="Previous Permit Number"
                  name="previousPermitId"
                  value={formData.previousPermitId}
                  onChange={handleChange}
                  placeholder="PERMIT-2025-000001"
                  hint="Enter the permit number from your previous permit"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Business Information */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>
              Provide details about your business
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="Juan's Sari-Sari Store"
                required
              />

              <Select
                label="Business Type"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                placeholder="Select business type"
                options={BUSINESS_TYPES}
                required
              />

              <Input
                label="Business Address"
                name="businessAddress"
                value={formData.businessAddress}
                onChange={handleChange}
                placeholder="123 Main Street"
                required
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Barangay"
                  name="businessBarangay"
                  value={formData.businessBarangay}
                  onChange={handleChange}
                  placeholder="Brgy. San Isidro"
                />
                <Input
                  label="City/Municipality"
                  name="businessCity"
                  value={formData.businessCity}
                  onChange={handleChange}
                  placeholder="Makati City"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Province"
                  name="businessProvince"
                  value={formData.businessProvince}
                  onChange={handleChange}
                  placeholder="Metro Manila"
                />
                <Input
                  label="ZIP Code"
                  name="businessZipCode"
                  value={formData.businessZipCode}
                  onChange={handleChange}
                  placeholder="1200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Business Phone"
                  name="businessPhone"
                  type="tel"
                  value={formData.businessPhone}
                  onChange={handleChange}
                  placeholder="09171234567"
                />
                <Input
                  label="Business Email"
                  name="businessEmail"
                  type="email"
                  value={formData.businessEmail}
                  onChange={handleChange}
                  placeholder="business@email.com"
                />
              </div>

              <hr className="my-4" />
              <h4 className="font-semibold text-gray-800">Registration & Tax Info</h4>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="DTI/SEC Registration No."
                  name="dtiSecRegistration"
                  value={formData.dtiSecRegistration}
                  onChange={handleChange}
                />
                <Input
                  label="TIN Number"
                  name="tinNumber"
                  value={formData.tinNumber}
                  onChange={handleChange}
                  placeholder="xxx-xxx-xxx-xxx"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Business Area (sq.m.)"
                  name="businessArea"
                  type="number"
                  value={formData.businessArea}
                  onChange={handleChange}
                />
                <Input
                  label="Number of Employees"
                  name="numberOfEmployees"
                  type="number"
                  value={formData.numberOfEmployees}
                  onChange={handleChange}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Capital Investment (₱)"
                  name="capitalInvestment"
                  type="number"
                  value={formData.capitalInvestment}
                  onChange={handleChange}
                />
                <Input
                  label="Gross Sales (₱)"
                  name="grossSales"
                  type="number"
                  value={formData.grossSales}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Documents */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Required Documents</CardTitle>
            <CardDescription>
              Upload the required documents for your application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 rounded-lg bg-blue-50 p-4">
              <h4 className="font-semibold text-blue-800">Required Documents:</h4>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-blue-700">
                {DOCUMENT_TYPES.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>

            <FileUpload
              label="Upload Documents"
              maxFiles={15}
              onFilesSelected={setFiles}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Review Your Application</CardTitle>
            <CardDescription>
              Please review all details before submitting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h4 className="mb-2 font-semibold text-gray-700">
                  Application Type
                </h4>
                <p className="text-gray-900">
                  {formData.type === "NEW" ? "New Application" : "Renewal"}
                </p>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-gray-700">
                  Business Details
                </h4>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-gray-500">Business Name</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.businessName || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">Type</dt>
                    <dd className="font-medium text-gray-900">
                      {BUSINESS_TYPES.find((t) => t.value === formData.businessType)
                        ?.label || "—"}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-gray-500">Address</dt>
                    <dd className="font-medium text-gray-900">
                      {[
                        formData.businessAddress,
                        formData.businessBarangay,
                        formData.businessCity,
                        formData.businessProvince,
                        formData.businessZipCode,
                      ]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">TIN</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.tinNumber || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-gray-500">DTI/SEC Reg.</dt>
                    <dd className="font-medium text-gray-900">
                      {formData.dtiSecRegistration || "—"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="mb-2 font-semibold text-gray-700">Documents</h4>
                <p className="text-sm text-gray-600">
                  {files.length} file(s) selected for upload
                </p>
                {files.length > 0 && (
                  <ul className="mt-1 list-inside list-disc text-sm text-gray-600">
                    {files.map((f, i) => (
                      <li key={i}>{f.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </Button>

        <div className="flex gap-3">
          {step === totalSteps ? (
            <>
              <Button
                variant="outline"
                onClick={() => handleSubmit(true)}
                loading={loading}
              >
                <Save className="h-4 w-4" /> Save as Draft
              </Button>
              <Button onClick={() => handleSubmit(false)} loading={loading}>
                <Send className="h-4 w-4" /> Submit Application
              </Button>
            </>
          ) : (
            <Button onClick={() => setStep(step + 1)}>
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
