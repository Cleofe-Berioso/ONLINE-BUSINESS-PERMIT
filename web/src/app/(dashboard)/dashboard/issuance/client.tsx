"use client";

import { useState, useMemo } from "react";
import { formatDate } from "@/lib/utils";
import { Search, Printer, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import type { Prisma } from "@prisma/client";

type Permit = Prisma.PermitGetPayload<{
  select: {
    id: true;
    permitNumber: true;
    businessName: true;
    ownerName: true;
    issueDate: true;
    expiryDate: true;
    status: true;
    applicationId: true;
    application: {
      select: {
        applicationNumber: true;
        applicant: {
          select: {
            firstName: true;
            lastName: true;
          };
        };
      };
    };
    issuance: {
      select: {
        id: true;
        status: true;
        issuedAt: true;
      };
    };
  };
}>;

interface IssuanceClientProps {
  permits: Permit[];
}

export function IssuanceClient({ permits }: IssuanceClientProps) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter permits based on search term
  const filteredPermits = useMemo(() => {
    return permits.filter((permit) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        permit.permitNumber.toLowerCase().includes(searchLower) ||
        permit.businessName.toLowerCase().includes(searchLower) ||
        permit.ownerName.toLowerCase().includes(searchLower) ||
        permit.application.applicationNumber.toLowerCase().includes(searchLower)
      );
    });
  }, [permits, searchTerm]);

  const handlePrint = (permitId: string) => {
    // TODO: Implement print functionality
    console.log("Print permit:", permitId);
  };

  const handleDownload = (permitId: string) => {
    // TODO: Implement download functionality
    console.log("Download permit:", permitId);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Search Bar */}
      <div className="border-b border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by permit number, business name, or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      {filteredPermits.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-gray-500">
            {searchTerm
              ? "No permits found matching your search."
              : "No permits issued yet."}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="divide-y md:hidden">
            {filteredPermits.map((permit) => (
              <div key={permit.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-blue-600 text-sm">
                      {permit.permitNumber}
                    </p>
                    <p className="mt-1 font-medium text-gray-900">
                      {permit.businessName}
                    </p>
                    <p className="text-sm text-gray-500">{permit.ownerName}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Ref: {permit.application.applicationNumber}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(permit.issueDate)} – {formatDate(permit.expiryDate)}
                    </p>
                  </div>
                  <StatusBadge status={permit.status} />
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrint(permit.id)}
                    className="flex-1"
                  >
                    <Printer className="h-4 w-4" />
                    Print
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(permit.id)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-semibold">Permit Number</th>
                  <th className="px-6 py-4 font-semibold">Business Name</th>
                  <th className="px-6 py-4 font-semibold">Owner</th>
                  <th className="px-6 py-4 font-semibold">Application Ref</th>
                  <th className="px-6 py-4 font-semibold">Issue Date</th>
                  <th className="px-6 py-4 font-semibold">Expiry Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredPermits.map((permit) => (
                  <tr key={permit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-blue-600">
                      {permit.permitNumber}
                    </td>
                    <td className="px-6 py-4">{permit.businessName}</td>
                    <td className="px-6 py-4">{permit.ownerName}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {permit.application.applicationNumber}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(permit.issueDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {formatDate(permit.expiryDate)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={permit.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handlePrint(permit.id)}
                          title="Print permit"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownload(permit.id)}
                          title="Download permit"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer with count */}
      {filteredPermits.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <p className="text-sm text-gray-600">
            Showing {filteredPermits.length} of {permits.length} permits
          </p>
        </div>
      )}
    </div>
  );
}
