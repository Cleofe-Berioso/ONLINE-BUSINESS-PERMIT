"use client";

import { useState } from "react";
import { Search, FileText, CheckCircle, AlertCircle, X, Eye } from "lucide-react";

interface Document {
  id: string;
  applicationId: string;
  originalName: string;
  documentType: string;
  status: string;
  createdAt: Date | string;
  size?: number;
}

interface Application {
  id: string;
  applicationNumber: string;
  businessName: string;
  status: string;
  documents?: Document[];
  submittedAt?: Date | string;
}

interface DocumentReviewClientProps {
  initialApplications: any[];
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export function DocumentReviewClient({
  initialApplications,
  stats,
}: DocumentReviewClientProps) {
  const applications = (initialApplications as Application[]) || [];
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  // Filter applications by search
  const filteredApps = applications.filter(
    (app) =>
      app.applicationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.businessName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get documents for selected app
  const selectedAppDocs = selectedApp?.documents || [];

  // Update selected doc preview
  const handleSelectDoc = (doc: Document) => {
    setSelectedDoc(doc);
    setReviewNotes("");
  };

  const handleSelectApp = (app: Application) => {
    setSelectedApp(app);
    setSelectedDoc(null);
    setReviewNotes("");
  };

  return (
    <div className="h-full flex bg-white">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-gray-200 bg-gray-50 p-6 overflow-y-auto">
        <div className="space-y-8">
          {/* Folders */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Folders</h3>
            <div className="space-y-2">
              <FolderItem label="All Applications" count={stats.total} />
              <FolderItem label="Pending Review" count={stats.pending} />
              <FolderItem label="Approved" count={stats.approved} />
              <FolderItem label="Rejected" count={stats.rejected} />
            </div>
          </div>

          {/* Document Types */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Document Types
            </h3>
            <div className="space-y-2">
              <FolderItem label="DTI/SEC Registration" count={48} />
              <FolderItem label="Barangay Clearance" count={48} />
              <FolderItem label="Fire Safety Certificate" count={45} />
              <FolderItem label="Sanitary Permit" count={42} />
            </div>
          </div>
        </div>
      </div>

      {/* Center Panel */}
      <div className="flex-1 flex flex-col border-r border-gray-200 bg-white">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Review</h1>
            <p className="mt-1 text-sm text-gray-600">
              Review and verify submitted documents
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 pl-9 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Applications Grid */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Applications</h3>
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
                  <FileText className="h-8 w-8 text-blue-600 mb-3" />
                  <p className="font-medium text-gray-900 text-sm">
                    {app.applicationNumber}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{app.businessName}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {app.documents?.length || 0} files
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Uploaded Documents */}
          {selectedApp && (
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900">
                Uploaded Documents
              </h3>
              {selectedAppDocs.length === 0 ? (
                <p className="text-sm text-gray-500">No documents found</p>
              ) : (
                <div className="space-y-3">
                  {selectedAppDocs.map((doc) => (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectDoc(doc)}
                      className={`w-full rounded-lg border p-4 text-left transition-all ${
                        selectedDoc?.id === doc.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900">
                            {doc.originalName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {doc.documentType} • 2.4 MB •{" "}
                            {new Date(doc.createdAt).toLocaleDateString()}
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
        </div>
      </div>

      {/* Right Panel - Document Preview */}
      {selectedDoc ? (
        <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
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
                <p className="text-sm text-gray-900 mt-1">{selectedDoc.originalName}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  File Size
                </p>
                <p className="text-sm text-gray-900 mt-1">2.4 MB</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase">
                  Document Type
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedDoc.documentType}
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
                    {selectedDoc.status === "VERIFIED"
                      ? "Verified"
                      : selectedDoc.status === "REJECTED"
                      ? "Rejected"
                      : "Pending Review"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 flex items-center justify-center gap-2 transition-colors">
                <CheckCircle className="h-4 w-4" />
                Approve Document
              </button>
              <button className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 flex items-center justify-center gap-2 transition-colors">
                <X className="h-4 w-4" />
                Flag as Invalid
              </button>
              <button className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors">
                <Eye className="h-4 w-4" />
                Request Re-upload
              </button>
            </div>

            {/* Reviewer Notes */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Reviewer Notes</h4>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this document..."
                className="w-full h-32 rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              />
              <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                Save Notes
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-96 border-l border-gray-200 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-900">No document selected</p>
            <p className="text-xs text-gray-600 mt-1">
              Select a document to view details
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function FolderItem({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
      <span className="text-sm text-gray-700">{label}</span>
      <span className="text-xs font-medium text-gray-600">{count}</span>
    </div>
  );
}
