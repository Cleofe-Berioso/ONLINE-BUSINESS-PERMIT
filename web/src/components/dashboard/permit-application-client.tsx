"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  permitApplicationStep1Schema,
  permitApplicationStep4Schema,
  permitApplicationStep5Schema,
  type PermitApplicationStep1Input,
  type PermitApplicationStep4Input,
  type PermitApplicationStep5Input,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2, ChevronLeft, FileText } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

interface ApplicationData {
  step1?: PermitApplicationStep1Input;
  step2?: { documents?: string[] };
  step3?: { businessArea?: number; numberOfEmployees?: number; capitalInvestment?: number; assessmentNotes?: string };
  step4?: PermitApplicationStep4Input;
  step5?: PermitApplicationStep5Input;
}

const STEPS = [
  { id: 1, label: "Business Info", icon: "🏢" },
  { id: 2, label: "Documents", icon: "📄" },
  { id: 3, label: "Assessment", icon: "📋" },
  { id: 4, label: "Payment", icon: "💳" },
  { id: 5, label: "Confirm", icon: "✓" },
] as const;

const BUSINESS_TYPES = [
  "Retail",
  "Service",
  "Manufacturing",
  "Trading",
  "Professional",
  "Others",
];

const BARANGAYS = [
  "San Jose",
  "Magalona",
  "Buenavista",
  "San Fernando",
  "Tabang",
  "Abutin",
];

const MUNICIPALITIES = ["Quezon City", "Manila", "Caloocan", "Cebu", "Davao"];

const REQUIRED_DOCUMENTS = [
  "Barangay Clearance",
  "DTI Registration/Certificate of Ownership",
  "Tax Declaration of Real Property",
  "Zoning Certification",
  "Building Permit",
  "Fire Safety Inspection Certificate",
  "Health/Sanitation Permit",
  "Environmental Clearance",
];

export function PermitApplicationClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [applicationData, setApplicationData] = useState<ApplicationData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  // Step 1: Business Info
  const form1 = useForm<PermitApplicationStep1Input>({
    resolver: zodResolver(permitApplicationStep1Schema),
    defaultValues: applicationData.step1 || {},
  });

  // Step 4: Payment
  const form4 = useForm<PermitApplicationStep4Input>({
    resolver: zodResolver(permitApplicationStep4Schema),
    defaultValues: applicationData.step4 || {},
  });

  // Step 5: Confirmation
  const form5 = useForm<PermitApplicationStep5Input>({
    resolver: zodResolver(permitApplicationStep5Schema),
    defaultValues: applicationData.step5 || {},
  });

  const handleStep1Submit = form1.handleSubmit(async (data) => {
    setApplicationData((prev) => ({ ...prev, step1: data }));
    setCurrentStep(2);
  });

  const handleStep2Next = () => {
    if (uploadedDocuments.length === 0) {
      setError("Please upload at least one required document");
      return;
    }
    setApplicationData((prev) => ({ ...prev, step2: { documents: uploadedDocuments } }));
    setCurrentStep(3);
  };

  const handleStep3Next = () => {
    setCurrentStep(4);
  };

  const handleStep4Submit = form4.handleSubmit(async (data) => {
    setApplicationData((prev) => ({ ...prev, step4: data }));
    setCurrentStep(5);
  });

  const handleStep5Submit = form5.handleSubmit(async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const finalData = {
        ...applicationData.step1,
        ...applicationData.step4,
        ...data,
      };

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit application");
      }

      const result = await response.json();
      router.push(`/dashboard/applications/${result.applicationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  });

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newDocs = Array.from(e.target.files).map((f) => f.name);
      setUploadedDocuments((prev) => [...prev, ...newDocs]);
    }
  };

  const removeDocument = (index: number) => {
    setUploadedDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    try {
      // Save current step data to localStorage (client-side)
      localStorage.setItem("permitApplicationDraft", JSON.stringify({
        currentStep,
        data: applicationData,
        uploadedDocuments,
      }));

      // Optional: Save to backend
      // await fetch("/api/applications/draft", { method: "POST", body: ... })

      alert("Draft saved successfully!");
    } catch (err) {
      alert("Failed to save draft");
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Navigation */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Dashboard
      </button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          New Business Permit Application
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Complete all steps to submit your application
        </p>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step, idx) => (
              <div key={step.id} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                    currentStep === step.id
                      ? "bg-blue-600 text-white"
                      : currentStep > step.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {currentStep > step.id ? "✓" : step.id}
                </div>
                <p className="mt-2 text-center text-xs font-medium text-gray-700 whitespace-nowrap">
                  {step.label}
                </p>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`mt-2 h-0.5 flex-1 ${
                      currentStep > step.id ? "bg-green-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alert */}
      {error && (
        <div className="flex gap-3 rounded-lg bg-red-50 p-4 text-red-900">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Forms */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Step 1: Business Information"}
            {currentStep === 2 && "Step 2: Required Documents"}
            {currentStep === 3 && "Step 3: Assessment Details"}
            {currentStep === 4 && "Step 4: Payment Method"}
            {currentStep === 5 && "Step 5: Confirmation"}
          </CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            {currentStep === 1 && "Provide your business details"}
            {currentStep === 2 && `Upload all ${REQUIRED_DOCUMENTS.length} required documents`}
            {currentStep === 3 && "Additional business information for assessment"}
            {currentStep === 4 && "Select your preferred payment method"}
            {currentStep === 5 && "Review and confirm your application"}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Business Info */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Name *
                  </label>
                  <Input
                    {...form1.register("businessName")}
                    placeholder="Enter business name"
                    className="mt-1"
                  />
                  {form1.formState.errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">
                      {form1.formState.errors.businessName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Type *
                  </label>
                  <select
                    {...form1.register("businessType")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Select type</option>
                    {BUSINESS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {form1.formState.errors.businessType && (
                    <p className="mt-1 text-sm text-red-600">
                      {form1.formState.errors.businessType.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Owner / Operator *
                  </label>
                  <Input
                    {...form1.register("ownerName")}
                    placeholder="Full name"
                    className="mt-1"
                  />
                  {form1.formState.errors.ownerName && (
                    <p className="mt-1 text-sm text-red-600">
                      {form1.formState.errors.ownerName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    TIN Number
                  </label>
                  <Input
                    {...form1.register("tinNumber")}
                    placeholder="000-000-000-000"
                    className="mt-1"
                  />
                  {form1.formState.errors.tinNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {form1.formState.errors.tinNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Barangay *
                  </label>
                  <select
                    {...form1.register("barangay")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Select barangay</option>
                    {BARANGAYS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  {form1.formState.errors.barangay && (
                    <p className="mt-1 text-sm text-red-600">
                      {form1.formState.errors.barangay.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Municipality *
                  </label>
                  <select
                    {...form1.register("municipality")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Select municipality</option>
                    {MUNICIPALITIES.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  {form1.formState.errors.municipality && (
                    <p className="mt-1 text-sm text-red-600">
                      {form1.formState.errors.municipality.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Address *
                </label>
                <textarea
                  {...form1.register("businessAddress")}
                  placeholder="Complete business address"
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
                {form1.formState.errors.businessAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {form1.formState.errors.businessAddress.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button disabled variant="outline">
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSaveDraft}
                    variant="outline"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    loading={form1.formState.isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Step 2: Documents */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {REQUIRED_DOCUMENTS.map((doc) => (
                  <div key={doc} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={doc}
                      checked={uploadedDocuments.includes(doc)}
                      readOnly
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor={doc} className="text-sm text-gray-700">
                      {doc}
                    </label>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Documents
                </label>
                <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="h-10 w-10 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      Drag and drop files here or click to browse
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Accepted: PDF, DOC, JPG, PNG (Max 5MB each)
                    </p>
                  </label>
                </div>
              </div>

              {uploadedDocuments.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded ({uploadedDocuments.length})
                  </h4>
                  <ul className="space-y-2">
                    {uploadedDocuments.map((doc, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <span className="text-sm text-gray-700">{doc}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(idx)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {error && error.includes("document") && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <div className="flex justify-between gap-3 pt-4">
                <Button onClick={handlePrevious} variant="outline">
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSaveDraft}
                    variant="outline"
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={handleStep2Next}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Assessment */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Business Area (sq.m.)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    className="mt-1"
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        step3: {
                          ...prev.step3,
                          businessArea: parseFloat(e.target.value) || undefined,
                        },
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Employees
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 5"
                    className="mt-1"
                    onChange={(e) =>
                      setApplicationData((prev) => ({
                        ...prev,
                        step3: {
                          ...prev.step3,
                          numberOfEmployees: parseInt(e.target.value) || undefined,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Capital Investment
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 50000"
                  className="mt-1"
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      step3: {
                        ...prev.step3,
                        capitalInvestment: parseFloat(e.target.value) || undefined,
                      },
                    }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  placeholder="Any additional business information"
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  onChange={(e) =>
                    setApplicationData((prev) => ({
                      ...prev,
                      step3: { ...prev.step3, assessmentNotes: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button onClick={handlePrevious} variant="outline">
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSaveDraft}
                    variant="outline"
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={handleStep3Next}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep === 4 && (
            <form onSubmit={handleStep4Submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Method *
                </label>
                <div className="mt-3 space-y-3">
                  {[
                    { value: "GCASH", label: "GCash" },
                    { value: "MAYA", label: "Maya" },
                    { value: "BANK_TRANSFER", label: "Bank Transfer" },
                    { value: "OTC", label: "Over-the-Counter (OTC)" },
                    { value: "CASH", label: "Cash Payment" },
                  ].map((method) => (
                    <label key={method.value} className="flex items-center gap-3">
                      <input
                        type="radio"
                        {...form4.register("paymentMethod")}
                        value={method.value}
                        className="h-4 w-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{method.label}</span>
                    </label>
                  ))}
                </div>
                {form4.formState.errors.paymentMethod && (
                  <p className="mt-2 text-sm text-red-600">
                    {form4.formState.errors.paymentMethod.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Payment Notes (Optional)
                </label>
                <textarea
                  {...form4.register("paymentNotes")}
                  placeholder="e.g., reference number, account holder name"
                  rows={3}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button onClick={handlePrevious} variant="outline">
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleSaveDraft}
                    variant="outline"
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="submit"
                    loading={form4.formState.isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </form>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <form onSubmit={handleStep5Submit} className="space-y-6">
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="font-medium text-blue-900 mb-3">
                  Application Summary
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Business Name:</dt>
                    <dd className="font-medium">{applicationData.step1?.businessName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Business Type:</dt>
                    <dd className="font-medium">{applicationData.step1?.businessType}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Owner/Operator:</dt>
                    <dd className="font-medium">{applicationData.step1?.ownerName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Location:</dt>
                    <dd className="font-medium">
                      {applicationData.step1?.barangay}, {applicationData.step1?.municipality}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Documents Submitted:</dt>
                    <dd className="font-medium">{uploadedDocuments.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Payment Method:</dt>
                    <dd className="font-medium">{applicationData.step4?.paymentMethod}</dd>
                  </div>
                </dl>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    {...form5.register("agreedToTerms")}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">
                    I certify that all information provided in this application is complete and accurate. I agree to submit this application for processing and will comply with all applicable laws and regulations.
                  </span>
                </label>
                {form5.formState.errors.agreedToTerms && (
                  <p className="text-sm text-red-600">
                    {form5.formState.errors.agreedToTerms.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button onClick={handlePrevious} variant="outline">
                  Previous
                </Button>
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Submit Application
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
