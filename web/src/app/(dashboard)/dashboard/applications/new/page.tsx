"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

export default function NewApplicationPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "NEW",
    businessName: "",
    businessType: "",
    businessAddress: "",
    businessBarangay: "",
    businessCity: "",
    businessProvince: "",
    businessZipCode: "",
    tinNumber: "",
    dtiSecRegistration: "",
    capitalInvestment: "",
    numberOfEmployees: "",
    businessDescription: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          capitalInvestment: formData.capitalInvestment ? parseFloat(formData.capitalInvestment) : null,
          numberOfEmployees: formData.numberOfEmployees ? parseInt(formData.numberOfEmployees) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create application");
        return;
      }

      router.push("/dashboard/applications");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Business Permit Application</h1>
        <p className="text-gray-600">Fill out the form below to apply for a business permit</p>
      </div>

      {error && (
        <Alert variant="error" className="mb-6" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Application Type</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              options={[
                { value: "NEW", label: "New Application" },
                { value: "RENEWAL", label: "Renewal" },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Business Name"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
            <Input
              label="Business Type"
              name="businessType"
              value={formData.businessType}
              onChange={handleChange}
              required
              placeholder="e.g., Retail, Food Service, Manufacturing"
            />
            <Textarea
              label="Business Description"
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleChange}
              placeholder="Describe your business activities..."
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Business Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Street Address"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Barangay"
                name="businessBarangay"
                value={formData.businessBarangay}
                onChange={handleChange}
              />
              <Input
                label="City/Municipality"
                name="businessCity"
                value={formData.businessCity}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Province"
                name="businessProvince"
                value={formData.businessProvince}
                onChange={handleChange}
              />
              <Input
                label="Zip Code"
                name="businessZipCode"
                value={formData.businessZipCode}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="TIN Number"
                name="tinNumber"
                value={formData.tinNumber}
                onChange={handleChange}
              />
              <Input
                label="DTI/SEC Registration"
                name="dtiSecRegistration"
                value={formData.dtiSecRegistration}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Capital Investment (PHP)"
                name="capitalInvestment"
                type="number"
                value={formData.capitalInvestment}
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
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Submit Application
          </Button>
        </div>
      </form>
    </div>
  );
}