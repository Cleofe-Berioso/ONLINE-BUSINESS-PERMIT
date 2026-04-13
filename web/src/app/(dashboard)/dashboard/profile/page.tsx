"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading";
import { Upload, User } from "lucide-react";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  businessName: string;
  businessType: string;
  businessAddress: string;
  dtiSecNumber: string;
  accountType: string;
  verified: boolean;
  memberSince: string;
  avatar?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>({
    firstName: "Juan",
    lastName: "Dela Cruz",
    email: "juan.delacruzsmail.com",
    phone: "+63 932-882-6985",
    address: "123 Sample Street, Poblacion | EB Magandang, Negros Occidental",
    dateOfBirth: "01/10/1990",
    businessName: "Juan's Sari-Sari Store",
    businessType: "Retail",
    businessAddress: "123 Sample Street, Poblacion | EB Magandang, Negros Occidental",
    dtiSecNumber: "DTI-2024-00123",
    accountType: "INDIVIDUAL",
    verified: true,
    memberSince: "Jan 2024",
    avatar: "JD",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleProfileChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: keyof typeof passwordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          address: profile.address,
          dateOfBirth: profile.dateOfBirth,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update profile");
        return;
      }

      setSuccess("Profile updated successfully!");
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to change password");
        return;
      }

      setSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your account information
        </p>
      </div>

      {error && (
        <Alert variant="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Picture & Account Status */}
        <div className="space-y-6">
          {/* Profile Picture */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
                  {profile.avatar}
                </div>
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 hover:bg-gray-50 transition-colors">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-medium text-gray-700">Change Photo</span>
              </button>
              <p className="text-center text-xs text-gray-500">
                JPG, PNG or GIF (Max 3cm x 3cm)
              </p>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Account Type</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{profile.accountType}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Verified</p>
                  <p className="mt-1 text-sm font-medium text-green-600">
                    {profile.verified ? "YES" : "NO"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Member Since</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{profile.memberSince}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Forms */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => handleProfileChange("firstName", e.target.value)}
                />
                <Input
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => handleProfileChange("lastName", e.target.value)}
                />
              </div>

              <Input
                label="Email Address"
                value={profile.email}
                disabled
              />

              <Input
                label="Phone Number"
                value={profile.phone}
                onChange={(e) => handleProfileChange("phone", e.target.value)}
              />

              <Input
                label="Address"
                value={profile.address}
                onChange={(e) => handleProfileChange("address", e.target.value)}
              />

              <Input
                label="Date of Birth"
                type="date"
                value={profile.dateOfBirth}
                onChange={(e) => handleProfileChange("dateOfBirth", e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Your registered business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Business Name"
                value={profile.businessName}
                onChange={(e) => handleProfileChange("businessName", e.target.value)}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Business Type"
                  value={profile.businessType}
                  onChange={(e) => handleProfileChange("businessType", e.target.value)}
                />
                <Input
                  label="DTI/SEC Number"
                  value={profile.dtiSecNumber}
                  onChange={(e) => handleProfileChange("dtiSecNumber", e.target.value)}
                />
              </div>

              <Input
                label="Business Address"
                value={profile.businessAddress}
                onChange={(e) => handleProfileChange("businessAddress", e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Change your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange("currentPassword", e.target.value)}
              />

              <Input
                label="New Password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
              />

              <Input
                label="Confirm Password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSaveProfile} loading={saving}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
