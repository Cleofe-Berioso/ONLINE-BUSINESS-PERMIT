"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, FileText, CheckCircle, AlertCircle, DownloadIcon, X } from "lucide-react";

// Supabase Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Types
interface Document {
  id: string;
  application_id: string;
  file_name: string;
  document_type: string;
  file_size_mb: number;
  uploaded_at: string;
  status: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "REQUIRES_REUPLOAD";
  reviewer_notes: string | null;
}

interface Application {
  id: string;
  bp_number: string;
  business_name: string;
  created_at: string;
  status: "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
  documents?: Document[];
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface DocumentReviewDashboardProps {
  filterStatus?: string;
}

// Toast notification system
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return { toasts, addToast };
}

// Supabase API Helper
async function supabaseQuery(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    Prefer: "return=representation",
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return await response.json();
  }
  return null;
}

export function DocumentReviewDashboard({
  filterStatus,
}: DocumentReviewDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const { toasts, addToast } = useToast();

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      let query = "/applications?select=*,documents(id)&order=created_at.desc";

      // Add status filter if provided
      if (filterStatus && filterStatus !== "all") {
        query += `&status=eq.${filterStatus}`;
      }

      const data = await supabaseQuery(query);
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      addToast("Failed to load applications", "error");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, addToast]);

  // Fetch documents for selected application
  const fetchDocuments = useCallback(async (appId: string) => {
    try {
      setDocLoading(true);
      const data = await supabaseQuery(
        `/documents?application_id=eq.${appId}&select=*&order=created_at.asc`
      );
      const docs = Array.isArray(data) ? data : [];

      setApplications((prev) =>
        prev.map((app) =>
          app.id === appId ? { ...app, documents: docs } : app
        )
      );

      // Set first document as selected
      if (docs.length > 0) {
        setSelectedDoc(docs[0]);
        setReviewerNotes(docs[0].reviewer_notes || "");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      addToast("Failed to load documents", "error");
    } finally {
      setDocLoading(false);
    }
  }, [addToast]);

  // Handle application select
  const handleSelectApp = useCallback(
    (app: Application) => {
      setSelectedApp(app);
      setSelectedDoc(null);
      fetchDocuments(app.id);
    },
    [fetchDocuments]
  );

  // Update document status
  const updateDocumentStatus = useCallback(
    async (
      docId: string,
      newStatus: "PENDING_VERIFICATION" | "VERIFIED" | "REJECTED" | "REQUIRES_REUPLOAD"
    ) => {
      try {
        if (!selectedDoc) return;

        const updated = await supabaseQuery(
          `/documents?id=eq.${docId}`,
          {
            method: "PATCH",
            body: JSON.stringify({ status: newStatus }),
          }
        );

        if (Array.isArray(updated) && updated[0]) {
          setSelectedDoc(updated[0]);
          addToast(`Document ${newStatus.toLowerCase()}`, "success");

          // Refresh documents for the app
          if (selectedApp) {
            await fetchDocuments(selectedApp.id);
          }

          // Check if all documents approved - update app status
          if (newStatus === "VERIFIED" && selectedApp) {
            const appDocs = selectedApp.documents || [];
            const allApproved = appDocs.every((d) => d.status === "VERIFIED");
            if (allApproved) {
              await updateApplicationStatus(selectedApp.id, "APPROVED");
            }
          }
        }
      } catch (error) {
        console.error("Error updating document:", error);
        addToast("Failed to update document", "error");
      }
    },
    [selectedDoc, selectedApp, addToast, fetchDocuments]
  );

  // Update application status
  const updateApplicationStatus = useCallback(
    async (appId: string, newStatus: string) => {
      try {
        await supabaseQuery(`/applications?id=eq.${appId}`, {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        });

        addToast("Application status updated", "success");
        fetchApplications();
      } catch (error) {
        console.error("Error updating application:", error);
      }
    },
    [addToast, fetchApplications]
  );

  // Save reviewer notes
  const saveReviewerNotes = useCallback(async () => {
    if (!selectedDoc) return;

    try {
      setSavingNotes(true);
      const updated = await supabaseQuery(
        `/documents?id=eq.${selectedDoc.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({ reviewer_notes: reviewerNotes }),
        }
      );

      if (Array.isArray(updated) && updated[0]) {
        setSelectedDoc(updated[0]);
        addToast("Notes saved", "success");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
      addToast("Failed to save notes", "error");
    } finally {
      setSavingNotes(false);
    }
  }, [selectedDoc, reviewerNotes, addToast]);

  // Initial load
  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Filter applications by search
  const filteredApps = applications.filter(
    (app) =>
      app.bp_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.business_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg ${
              toast.type === "success"
                ? "bg-green-600"
                : toast.type === "error"
                ? "bg-red-600"
                : "bg-blue-600"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Center Panel */}
        <div className="flex-1 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
          <div className="p-6 border-b border-gray-200 space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Document Review
              </h2>
              <p className="text-sm text-gray-600">
                Select an application to review its documents
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by BP number or business name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Applications Grid */}
              {loading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : filteredApps.length === 0 ? (
                <div className="text-center text-gray-500">
                  No applications found
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="mb-4 text-sm font-semibold text-gray-900">
                      Applications
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {filteredApps.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => handleSelectApp(app)}
                          className={`rounded-lg border-2 p-4 text-left transition-all ${
                            selectedApp?.id === app.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <FileText className="h-6 w-6 text-blue-600" />
                            <span
                              className={`inline-block rounded px-2 py-1 text-xs font-medium ${
                                app.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <p className="mt-3 font-medium text-gray-900 text-sm">
                            {app.bp_number}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {app.business_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {app.documents?.length || 0} files
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Documents List */}
                  {selectedApp && (
                    <div>
                      <h3 className="mb-4 text-sm font-semibold text-gray-900">
                        Uploaded Documents
                      </h3>
                      {docLoading ? (
                        <div className="text-center text-gray-500 py-4">
                          Loading documents...
                        </div>
                      ) : selectedApp.documents?.length === 0 ? (
                        <div className="text-center text-gray-500 py-4">
                          No documents found
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedApp.documents?.map((doc) => (
                            <button
                              key={doc.id}
                              onClick={() => {
                                setSelectedDoc(doc);
                                setReviewerNotes(doc.reviewer_notes || "");
                              }}
                              className={`w-full rounded-lg border p-4 text-left transition-all ${
                                selectedDoc?.id === doc.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 bg-white hover:border-gray-300"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <FileText className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-gray-900">
                                    {doc.file_name}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {doc.document_type} • {doc.file_size_mb} MB •{" "}
                                    {new Date(doc.uploaded_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex-shrink-0">
                                  {doc.status === "VERIFIED" ? (
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                  ) : doc.status === "REJECTED" ? (
                                    <X className="h-5 w-5 text-red-600" />
                                  ) : (
                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Preview Panel */}
        {selectedDoc && (
          <div className="w-80 border-l border-gray-200 bg-white flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Preview */}
              <div>
                <h3 className="mb-4 text-sm font-semibold text-gray-900">
                  Document Preview
                </h3>
                <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                  <FileText className="h-16 w-16 text-gray-400" />
                </div>
              </div>

              {/* File Metadata */}
              <div className="space-y-4 pb-6 border-b border-gray-200">
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    File Name
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedDoc.file_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    File Size
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedDoc.file_size_mb} MB
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Document Type
                  </p>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedDoc.document_type}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </p>
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        selectedDoc.status === "VERIFIED"
                          ? "bg-green-100 text-green-800"
                          : selectedDoc.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {selectedDoc.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => updateDocumentStatus(selectedDoc.id, "VERIFIED")}
                  className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Document
                </button>
                <button
                  onClick={() => updateDocumentStatus(selectedDoc.id, "REJECTED")}
                  className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Flag as Invalid
                </button>
                <button
                  onClick={() =>
                    updateDocumentStatus(selectedDoc.id, "REQUIRES_REUPLOAD")
                  }
                  className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
                >
                  <DownloadIcon className="h-4 w-4" />
                  Request Re-upload
                </button>
              </div>

              {/* Reviewer Notes */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Reviewer Notes
                </h4>
                <textarea
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Add notes about this document..."
                  className="w-full h-32 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                />
                <button
                  onClick={saveReviewerNotes}
                  disabled={savingNotes}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty preview panel state */}
        {!selectedDoc && (
          <div className="w-80 border-l border-gray-200 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-900">
                No document selected
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Select a document to view details
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
