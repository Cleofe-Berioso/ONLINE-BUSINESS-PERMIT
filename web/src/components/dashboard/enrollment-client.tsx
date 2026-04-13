"use client";

import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  enrollmentStep1Schema,
  enrollmentStep2Schema,
  enrollmentStep3Schema,
  enrollmentStep5Schema,
  type EnrollmentStep1Input,
  type EnrollmentStep2Input,
  type EnrollmentStep3Input,
  type EnrollmentStep5Input,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5;

interface EnrollmentData {
  step1?: EnrollmentStep1Input;
  step2?: EnrollmentStep2Input;
  step3?: EnrollmentStep3Input;
  documents?: File[];
  step5?: EnrollmentStep5Input;
}

const STEPS = [
  { id: 1, label: "Business Info", icon: "🏢" },
  { id: 2, label: "Owner Info", icon: "👤" },
  { id: 3, label: "Location", icon: "📍" },
  { id: 4, label: "Documents", icon: "📄" },
  { id: 5, label: "Confirmation", icon: "✓" },
] as const;

const BUSINESS_TYPES = [
  "Retail",
  "Service",
  "Manufacturing",
  "Trading",
  "Professional",
  "Others",
];

const BUSINESS_CATEGORIES = [
  "Sari-Sari Store",
  "Grocery",
  "Pharmacy",
  "Restaurant",
  "Salon",
  "Gym",
  "Clinic",
  "Others",
];

export function EnrollmentClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Step 1: Business Info
  const form1 = useForm<EnrollmentStep1Input>({
    resolver: zodResolver(enrollmentStep1Schema),
    defaultValues: enrollmentData.step1 || {},
  });

  // Step 2: Owner Info
  const form2 = useForm<EnrollmentStep2Input>({
    resolver: zodResolver(enrollmentStep2Schema),
    defaultValues: enrollmentData.step2 || {},
  });

  // Step 3: Location
  const form3 = useForm<EnrollmentStep3Input>({
    resolver: zodResolver(enrollmentStep3Schema),
    defaultValues: enrollmentData.step3 || {},
  });

  // Step 5: Confirmation
  const form5 = useForm<EnrollmentStep5Input>({
    resolver: zodResolver(enrollmentStep5Schema),
    defaultValues: enrollmentData.step5 || {},
  });

  const handleStep1Submit = form1.handleSubmit(async (data) => {
    setEnrollmentData((prev) => ({ ...prev, step1: data }));
    setCurrentStep(2);
  });

  const handleStep2Submit = form2.handleSubmit(async (data) => {
    setEnrollmentData((prev) => ({ ...prev, step2: data }));
    setCurrentStep(3);
  });

  const handleStep3Submit = form3.handleSubmit(async (data) => {
    setEnrollmentData((prev) => ({ ...prev, step3: data }));
    setCurrentStep(4);
  });

  const handleStep4Next = () => {
    setCurrentStep(5);
  };

  const handleStep5Submit = form5.handleSubmit(async (data) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const finalData = {
        ...enrollmentData.step1,
        ...enrollmentData.step2,
        ...enrollmentData.step3,
        ...data,
      };

      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit enrollment");
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setEnrollmentData((prev) => ({
        ...prev,
        documents: [...(prev.documents || []), ...newFiles],
      }));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setEnrollmentData((prev) => ({
      ...prev,
      documents: prev.documents?.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Business Enrollment</h1>
        <p className="mt-1 text-sm text-gray-600">
          Register your business with EB Magalona BPLO
        </p>
      </div>

      {/* Step Indicator */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-2">
            {STEPS.map((step) => (
              <div key={step.id} className="flex flex-1 flex-col items-center">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-semibold transition-all ${
                    currentStep === step.id
                      ? "bg-blue-600 text-white"
                      : currentStep > step.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.id ? <CheckCircle2 /> : step.icon}
                </div>
                <p className="mt-2 text-xs font-medium text-center text-gray-700">
                  {step.label}
                </p>
                {step.id < STEPS.length && (
                  <div
                    className={`mt-2 h-1 flex-1 ${
                      currentStep > step.id ? "bg-green-600" : "bg-gray-200"
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
            {currentStep === 2 && "Step 2: Owner Information"}
            {currentStep === 3 && "Step 3: Business Location"}
            {currentStep === 4 && "Step 4: Required Documents"}
            {currentStep === 5 && "Step 5: Confirmation"}
          </CardTitle>
          <p className="mt-2 text-sm text-gray-600">
            {currentStep === 1 && "Provide your basic business details"}
            {currentStep === 2 && "Tell us about the business owner"}
            {currentStep === 3 && "Where is your business located"}
            {currentStep === 4 && "Upload required documents"}
            {currentStep === 5 && "Review and confirm your enrollment"}
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
                    placeholder="Enter your business name"
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
                    <option value="">Select business type</option>
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
                    Business Category *
                  </label>
                  <select
                    {...form1.register("businessCategory")}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                  >
                    <option value="">Select business category</option>
                    {BUSINESS_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {form1.formState.errors.businessCategory && (
                    <p className="mt-1 text-sm text-red-600">
                      {form1.formState.errors.businessCategory.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    DTI/SEC/CDA Registration Number
                  </label>
                  <Input
                    {...form1.register("dtiSecRegistration")}
                    placeholder="Enter registration number"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    TIN Number
                  </label>
                  <Input
                    {...form1.register("tinNumber")}
                    placeholder="xxx-xxx-xxx-xxx"
                    className="mt-1"
                  />
                  {form1.formState.errors.tinNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {form1.formState.errors.tinNumber.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number *
                  </label>
                  <Input
                    {...form1.register("businessPhone")}
                    placeholder="09XX XXX XXXX"
                    className="mt-1"
                  />
                  {form1.formState.errors.businessPhone && (
                    <p className="mt-1 text-sm text-red-600">
                      {form1.formState.errors.businessPhone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  {...form1.register("businessEmail")}
                  type="email"
                  placeholder="business@example.com"
                  className="mt-1"
                />
                {form1.formState.errors.businessEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {form1.formState.errors.businessEmail.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button disabled variant="outline">
                  Previous
                </Button>
                <Button
                  type="submit"
                  loading={form1.formState.isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                </Button>
              </div>
            </form>
          )}

          {/* Step 2: Owner Info */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <Input
                    {...form2.register("ownerFirstName")}
                    placeholder="First name"
                    className="mt-1"
                  />
                  {form2.formState.errors.ownerFirstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {form2.formState.errors.ownerFirstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <Input
                    {...form2.register("ownerLastName")}
                    placeholder="Last name"
                    className="mt-1"
                  />
                  {form2.formState.errors.ownerLastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {form2.formState.errors.ownerLastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Middle Name
                </label>
                <Input
                  {...form2.register("ownerMiddleName")}
                  placeholder="Middle name (optional)"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position/Title *
                  </label>
                  <Input
                    {...form2.register("ownerPosition")}
                    placeholder="e.g., Owner, Manager"
                    className="mt-1"
                  />
                  {form2.formState.errors.ownerPosition && (
                    <p className="mt-1 text-sm text-red-600">
                      {form2.formState.errors.ownerPosition.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Number *
                  </label>
                  <Input
                    {...form2.register("ownerPhone")}
                    placeholder="09XX XXX XXXX"
                    className="mt-1"
                  />
                  {form2.formState.errors.ownerPhone && (
                    <p className="mt-1 text-sm text-red-600">
                      {form2.formState.errors.ownerPhone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address *
                </label>
                <Input
                  {...form2.register("ownerEmail")}
                  type="email"
                  placeholder="owner@example.com"
                  className="mt-1"
                />
                {form2.formState.errors.ownerEmail && (
                  <p className="mt-1 text-sm text-red-600">
                    {form2.formState.errors.ownerEmail.message}
                  </p>
                )}
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button onClick={handlePrevious} variant="outline">
                  Previous
                </Button>
                <Button
                  type="submit"
                  loading={form2.formState.isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street Address *
                </label>
                <Input
                  {...form3.register("businessAddress")}
                  placeholder="e.g., 123 Main Street"
                  className="mt-1"
                />
                {form3.formState.errors.businessAddress && (
                  <p className="mt-1 text-sm text-red-600">
                    {form3.formState.errors.businessAddress.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Barangay *
                  </label>
                  <Input
                    {...form3.register("businessBarangay")}
                    placeholder="Select or enter barangay"
                    className="mt-1"
                  />
                  {form3.formState.errors.businessBarangay && (
                    <p className="mt-1 text-sm text-red-600">
                      {form3.formState.errors.businessBarangay.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    City/Municipality *
                  </label>
                  <Input
                    {...form3.register("businessCity")}
                    placeholder="City or Municipality"
                    className="mt-1"
                  />
                  {form3.formState.errors.businessCity && (
                    <p className="mt-1 text-sm text-red-600">
                      {form3.formState.errors.businessCity.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Province *
                  </label>
                  <Input
                    {...form3.register("businessProvince")}
                    placeholder="Province"
                    className="mt-1"
                  />
                  {form3.formState.errors.businessProvince && (
                    <p className="mt-1 text-sm text-red-600">
                      {form3.formState.errors.businessProvince.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ZIP Code *
                  </label>
                  <Input
                    {...form3.register("businessZipCode")}
                    placeholder="e.g., 6100"
                    maxLength={4}
                    className="mt-1"
                  />
                  {form3.formState.errors.businessZipCode && (
                    <p className="mt-1 text-sm text-red-600">
                      {form3.formState.errors.businessZipCode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-4">
                <Button onClick={handlePrevious} variant="outline">
                  Previous
                </Button>
                <Button
                  type="submit"
                  loading={form3.formState.isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                </Button>
              </div>
            </form>
          )}

          {/* Step 4: Documents */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Documents (Optional)
                </label>
                <div className="mt-2 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="text-4xl mb-2">📄</div>
                    <p className="text-sm text-gray-600">
                      Drag and drop files here or click to browse
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Accepted: PDF, DOC, DOCX, JPG, PNG (Max 5MB each)
                    </p>
                  </label>
                </div>
              </div>

              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <ul className="space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                      >
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-between gap-3 pt-4">
                <Button onClick={handlePrevious} variant="outline">
                  Previous
                </Button>
                <Button
                  onClick={handleStep4Next}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {currentStep === 5 && (
            <form onSubmit={handleStep5Submit} className="space-y-6">
              <div className="rounded-lg bg-blue-50 p-4">
                <h4 className="font-medium text-blue-900 mb-3">
                  Enrollment Summary
                </h4>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Business Name:</dt>
                    <dd className="font-medium">{enrollmentData.step1?.businessName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Business Type:</dt>
                    <dd className="font-medium">{enrollmentData.step1?.businessType}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Owner:</dt>
                    <dd className="font-medium">
                      {enrollmentData.step2?.ownerFirstName}{" "}
                      {enrollmentData.step2?.ownerLastName}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">City:</dt>
                    <dd className="font-medium">
                      {enrollmentData.step3?.businessCity},{" "}
                      {enrollmentData.step3?.businessProvince}
                    </dd>
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
                    I agree to the terms and conditions and confirm that all
                    information provided is accurate and complete.
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
                  Complete Enrollment
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
