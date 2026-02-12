import { useState } from "react";
import { format } from "date-fns";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useTableData } from "@/hooks/use-table-data";
import { cn } from "@/lib/utils";
import {
  FileText,
  Upload,
  Plus,
  Eye,
  Download,
  Trash2,
  File,
  FileImage,
  FileCheck,
  FileClock,
  AlertCircle,
  Calendar,
  User,
  Shield,
  Heart,
  Stethoscope,
} from "lucide-react";

// Types
interface MemberDocument {
  id: string;
  name: string;
  type: "id_proof" | "medical" | "insurance" | "contract" | "photo" | "other";
  fileName: string;
  fileSize: string;
  uploadedAt: Date;
  uploadedBy: string;
  expiryDate?: Date;
  status: "valid" | "expiring" | "expired";
  notes?: string;
}

// Sample data
const sampleDocuments: MemberDocument[] = [
  {
    id: "doc-1",
    name: "Government ID",
    type: "id_proof",
    fileName: "john_smith_id.pdf",
    fileSize: "1.2 MB",
    uploadedAt: new Date(2024, 0, 15),
    uploadedBy: "Admin",
    expiryDate: new Date(2027, 5, 15),
    status: "valid",
  },
  {
    id: "doc-2",
    name: "Medical Clearance",
    type: "medical",
    fileName: "medical_certificate.pdf",
    fileSize: "856 KB",
    uploadedAt: new Date(2024, 0, 10),
    uploadedBy: "Admin",
    expiryDate: new Date(2025, 0, 10),
    status: "valid",
    notes: "Annual checkup clearance",
  },
  {
    id: "doc-3",
    name: "Health Insurance Card",
    type: "insurance",
    fileName: "insurance_card.jpg",
    fileSize: "420 KB",
    uploadedAt: new Date(2024, 0, 15),
    uploadedBy: "John Smith",
    expiryDate: new Date(2025, 1, 28),
    status: "expiring",
  },
  {
    id: "doc-4",
    name: "Membership Agreement",
    type: "contract",
    fileName: "membership_contract.pdf",
    fileSize: "2.1 MB",
    uploadedAt: new Date(2024, 0, 15),
    uploadedBy: "Admin",
    status: "valid",
  },
  {
    id: "doc-5",
    name: "Profile Photo",
    type: "photo",
    fileName: "profile_photo.jpg",
    fileSize: "1.8 MB",
    uploadedAt: new Date(2024, 0, 15),
    uploadedBy: "John Smith",
    status: "valid",
  },
  {
    id: "doc-6",
    name: "Previous Gym Certificate",
    type: "other",
    fileName: "old_gym_cert.pdf",
    fileSize: "654 KB",
    uploadedAt: new Date(2023, 11, 20),
    uploadedBy: "Admin",
    expiryDate: new Date(2024, 11, 31),
    status: "expired",
  },
];

const documentTypeOptions = [
  { value: "id_proof", label: "ID Proof", icon: Shield },
  { value: "medical", label: "Medical", icon: Stethoscope },
  { value: "insurance", label: "Insurance", icon: Heart },
  { value: "contract", label: "Contract", icon: FileCheck },
  { value: "photo", label: "Photo", icon: FileImage },
  { value: "other", label: "Other", icon: File },
];

const getDocumentIcon = (type: string) => {
  const docType = documentTypeOptions.find(d => d.value === type);
  const IconComponent = docType?.icon || File;
  return <IconComponent className="w-5 h-5" />;
};

const getDocumentColor = (type: string) => {
  switch (type) {
    case "id_proof": return "bg-blue-500/10 text-blue-500";
    case "medical": return "bg-red-500/10 text-red-500";
    case "insurance": return "bg-green-500/10 text-green-500";
    case "contract": return "bg-purple-500/10 text-purple-500";
    case "photo": return "bg-orange-500/10 text-orange-500";
    default: return "bg-muted text-muted-foreground";
  }
};

interface MemberDocumentsTabProps {
  memberId: string;
  memberName: string;
}

export function MemberDocumentsTab({ memberId, memberName }: MemberDocumentsTabProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<MemberDocument[]>(sampleDocuments);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showViewSheet, setShowViewSheet] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<MemberDocument | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    notes: "",
    hasExpiry: false,
    expiryDate: "",
  });

  const filteredDocuments = filterType === "all" 
    ? documents 
    : documents.filter(d => d.type === filterType);

  const { paginatedData, paginationProps } = useTableData({
    data: filteredDocuments,
    itemsPerPage: 5,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      type: "",
      notes: "",
      hasExpiry: false,
      expiryDate: "",
    });
  };

  const handleViewDocument = (doc: MemberDocument) => {
    setSelectedDocument(doc);
    setShowViewSheet(true);
  };

  const handleUpload = () => {
    if (!formData.name.trim() || !formData.type) {
      toast({ title: "Error", description: "Name and document type are required", variant: "destructive" });
      return;
    }

    const newDoc: MemberDocument = {
      id: `doc-${Date.now()}`,
      name: formData.name,
      type: formData.type as MemberDocument["type"],
      fileName: `${formData.name.toLowerCase().replace(/\s+/g, "_")}.pdf`,
      fileSize: "1.0 MB",
      uploadedAt: new Date(),
      uploadedBy: "Admin",
      expiryDate: formData.hasExpiry && formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      status: "valid",
      notes: formData.notes || undefined,
    };

    setDocuments(prev => [newDoc, ...prev]);
    setShowUploadSheet(false);
    resetForm();
    toast({ title: "Document Uploaded", description: `${formData.name} has been uploaded` });
  };

  const handleDelete = (doc: MemberDocument) => {
    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    toast({ title: "Document Deleted", description: `${doc.name} has been removed` });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid": return "success";
      case "expiring": return "warning";
      case "expired": return "error";
      default: return "neutral";
    }
  };

  // Stats
  const validCount = documents.filter(d => d.status === "valid").length;
  const expiringCount = documents.filter(d => d.status === "expiring").length;
  const expiredCount = documents.filter(d => d.status === "expired").length;

  const columns: Column<MemberDocument>[] = [
    {
      key: "name",
      label: "Document",
      priority: "always",
      render: (val: string, item: MemberDocument) => (
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getDocumentColor(item.type))}>
            {getDocumentIcon(item.type)}
          </div>
          <div>
            <p className="font-medium">{val}</p>
            <p className="text-xs text-muted-foreground">{item.fileName}</p>
          </div>
        </div>
      ),
    },
    {
      key: "type",
      label: "Type",
      priority: "md",
      render: (val: string) => {
        const docType = documentTypeOptions.find(d => d.value === val);
        return <span className="capitalize">{docType?.label || val}</span>;
      },
    },
    {
      key: "uploadedAt",
      label: "Uploaded",
      priority: "lg",
      render: (val: Date) => format(val, "MMM d, yyyy"),
    },
    {
      key: "expiryDate",
      label: "Expires",
      priority: "lg",
      render: (val: Date | undefined) => val ? format(val, "MMM d, yyyy") : "—",
    },
    {
      key: "status",
      label: "Status",
      priority: "always",
      render: (val: string) => (
        <StatusBadge
          status={getStatusColor(val) as "success" | "warning" | "error"}
          label={val.charAt(0).toUpperCase() + val.slice(1)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-success/5 border-success/20">
          <CardContent className="p-3 text-center">
            <FileCheck className="w-5 h-5 mx-auto text-success mb-1" />
            <p className="text-2xl font-bold text-success">{validCount}</p>
            <p className="text-xs text-muted-foreground">Valid</p>
          </CardContent>
        </Card>
        <Card className="bg-warning/5 border-warning/20">
          <CardContent className="p-3 text-center">
            <FileClock className="w-5 h-5 mx-auto text-warning mb-1" />
            <p className="text-2xl font-bold text-warning">{expiringCount}</p>
            <p className="text-xs text-muted-foreground">Expiring</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-3 text-center">
            <AlertCircle className="w-5 h-5 mx-auto text-destructive mb-1" />
            <p className="text-2xl font-bold text-destructive">{expiredCount}</p>
            <p className="text-xs text-muted-foreground">Expired</p>
          </CardContent>
        </Card>
      </div>

      <SectionHeader
        title="Documents"
        action={
          <div className="flex items-center gap-2">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {documentTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setShowUploadSheet(true)}>
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
          </div>
        }
      />

      {documents.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-3">No documents uploaded</p>
          <Button onClick={() => setShowUploadSheet(true)}>
            <Upload className="w-4 h-4 mr-1" />
            Upload First Document
          </Button>
        </Card>
      ) : (
        <ResponsiveTable
          data={paginatedData}
          columns={columns}
          keyExtractor={(item) => item.id}
          onRowClick={handleViewDocument}
          pagination={paginationProps}
          rowActions={[
            { icon: Eye, label: "View", onClick: handleViewDocument },
            { icon: Download, label: "Download", onClick: () => toast({ title: "Downloading..." }) },
            { icon: Trash2, label: "Delete", onClick: handleDelete, variant: "danger" },
          ]}
        />
      )}

      {/* Upload Sheet */}
      <QuickAddSheet
        open={showUploadSheet}
        onOpenChange={(open) => {
          setShowUploadSheet(open);
          if (!open) resetForm();
        }}
        title="Upload Document"
        description="Add a new document to the member's file"
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
            <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground">PDF, JPG, PNG up to 10MB</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="docName">Document Name *</Label>
            <Input
              id="docName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter document name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="docType">Document Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <opt.icon className="w-4 h-4" />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <input
              type="checkbox"
              id="hasExpiry"
              checked={formData.hasExpiry}
              onChange={(e) => setFormData(prev => ({ ...prev, hasExpiry: e.target.checked }))}
              className="rounded border-border"
            />
            <Label htmlFor="hasExpiry" className="text-sm cursor-pointer">
              This document has an expiry date
            </Label>
          </div>

          {formData.hasExpiry && (
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any notes..."
            />
          </div>

          <Button onClick={handleUpload} className="w-full">
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </QuickAddSheet>

      {/* View Sheet */}
      <QuickAddSheet
        open={showViewSheet}
        onOpenChange={setShowViewSheet}
        title={selectedDocument?.name || "Document Details"}
        description={selectedDocument?.fileName || ""}
      >
        {selectedDocument && (
          <div className="space-y-4">
            <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center mx-auto", getDocumentColor(selectedDocument.type))}>
              {getDocumentIcon(selectedDocument.type)}
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Status</span>
              <StatusBadge
                status={getStatusColor(selectedDocument.status) as "success" | "warning" | "error"}
                label={selectedDocument.status.charAt(0).toUpperCase() + selectedDocument.status.slice(1)}
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">Type</span>
              <span className="font-medium capitalize">
                {documentTypeOptions.find(d => d.value === selectedDocument.type)?.label || selectedDocument.type}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground">File Size</span>
              <span className="font-medium">{selectedDocument.fileSize}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                Uploaded
              </span>
              <span className="font-medium">{format(selectedDocument.uploadedAt, "MMM d, yyyy")}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Uploaded By
              </span>
              <span className="font-medium">{selectedDocument.uploadedBy}</span>
            </div>

            {selectedDocument.expiryDate && (
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground">Expires</span>
                <span className={cn(
                  "font-medium",
                  selectedDocument.status === "expired" ? "text-destructive" :
                  selectedDocument.status === "expiring" ? "text-warning" : ""
                )}>
                  {format(selectedDocument.expiryDate, "MMM d, yyyy")}
                </span>
              </div>
            )}

            {selectedDocument.notes && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <span className="text-sm text-muted-foreground block mb-1">Notes</span>
                <span className="text-sm">{selectedDocument.notes}</span>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => toast({ title: "Downloading..." })}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="destructive" className="flex-1" onClick={() => {
                handleDelete(selectedDocument);
                setShowViewSheet(false);
              }}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </QuickAddSheet>
    </div>
  );
}
