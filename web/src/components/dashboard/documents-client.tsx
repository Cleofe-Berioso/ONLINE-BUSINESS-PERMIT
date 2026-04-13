"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Upload } from "lucide-react";

interface DocumentsClientProps {
  userId: string;
}

export function DocumentsClient({ userId }: DocumentsClientProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setError("");
    setSuccess("");

    const formData = new FormData();
    let hasError = false;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError(`File "${file.name}" exceeds 5MB limit`);
        hasError = true;
        continue;
      }

      // Validate file type
      const validTypes = ["application/pdf", "image/jpeg", "image/png"];
      if (!validTypes.includes(file.type)) {
        setError(
          `File "${file.name}" is not a valid type (PDF, JPG, PNG only)`
        );
        hasError = true;
        continue;
      }

      formData.append("files", file);
    }

    if (formData.getAll("files").length === 0) {
      if (!hasError) {
        setError("No valid files to upload");
      }
      return;
    }

    setUploading(true);

    try {
      const res = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to upload documents");
      } else {
        setSuccess(
          `Successfully uploaded ${data.documents?.length || 1} document(s)`
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        // Optionally reload to show new documents
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch {
      setError("An error occurred during upload");
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  return (
    <>
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

      {/* Upload Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-blue-300 bg-blue-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-blue-600 mb-4" />

        <h3 className="text-lg font-semibold text-gray-900">
          Upload New Document
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          Drag and drop files here or click to browse
        </p>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="mt-4"
        >
          {uploading ? "Uploading..." : "Select Files"}
        </Button>

        <p className="mt-4 text-xs text-gray-500">
          Accepted formats: PDF, JPG, PNG (Max 5MB per file)
        </p>
      </div>
    </>
  );
}
