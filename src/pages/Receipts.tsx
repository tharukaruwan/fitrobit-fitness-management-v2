import { useState } from "react";
import { ResponsiveTable, Column, RowAction } from "@/components/ui/responsive-table";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { useTableData } from "@/hooks/use-table-data";
import { StatusBadge } from "@/components/ui/status-badge";
import { Receipt, DollarSign, CreditCard, TrendingUp, Printer, FileDown, Eye } from "lucide-react";
import { AsyncSelectOption } from "@/components/ui/async-select";
import { useToast } from "@/hooks/use-toast";
import { generateReceipt, ReceiptSize } from "@/lib/pdf-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ReceiptRecord {
  id: number;
  receiptNo: string;
  memberName: string;
  memberId?: string;
  phone?: string;
  email?: string;
  description: string;
  amount: string;
  paymentMethod: string;
  date: string;
  time: string;
  status: "paid" | "pending" | "refunded";
  branch: string;
}

const sampleData: ReceiptRecord[] = [
  { id: 1, receiptNo: "RCP-2024-001", memberName: "John Smith", memberId: "MEM-001", phone: "+1 234 567 890", email: "john@email.com", description: "Premium Monthly - January", amount: "$79.99", paymentMethod: "Credit Card", date: "Dec 31, 2024", time: "09:15 AM", status: "paid", branch: "Downtown" },
  { id: 2, receiptNo: "RCP-2024-002", memberName: "Sarah Johnson", memberId: "MEM-002", phone: "+1 234 567 891", email: "sarah@email.com", description: "VIP Annual Renewal", amount: "$1,499.99", paymentMethod: "Bank Transfer", date: "Dec 31, 2024", time: "10:30 AM", status: "paid", branch: "Downtown" },
  { id: 3, receiptNo: "RCP-2024-003", memberName: "Mike Davis", memberId: "MEM-003", phone: "+1 234 567 892", email: "mike@email.com", description: "Personal Training (5 sessions)", amount: "$250.00", paymentMethod: "Cash", date: "Dec 31, 2024", time: "11:00 AM", status: "pending", branch: "Westside" },
  { id: 4, receiptNo: "RCP-2024-004", memberName: "Emily Chen", memberId: "MEM-004", phone: "+1 234 567 893", email: "emily@email.com", description: "Day Pass - Full Access", amount: "$25.00", paymentMethod: "Debit Card", date: "Dec 30, 2024", time: "02:15 PM", status: "paid", branch: "Downtown" },
  { id: 5, receiptNo: "RCP-2024-005", memberName: "David Wilson", memberId: "MEM-005", phone: "+1 234 567 894", email: "david@email.com", description: "Locker Rental (Monthly)", amount: "$15.00", paymentMethod: "Cash", date: "Dec 30, 2024", time: "03:45 PM", status: "refunded", branch: "Eastside" },
  { id: 6, receiptNo: "RCP-2024-006", memberName: "Lisa Brown", memberId: "MEM-006", phone: "+1 234 567 895", email: "lisa@email.com", description: "Standard Quarterly", amount: "$129.99", paymentMethod: "Credit Card", date: "Dec 29, 2024", time: "09:00 AM", status: "paid", branch: "Downtown" },
  { id: 7, receiptNo: "RCP-2024-007", memberName: "James Taylor", memberId: "MEM-007", phone: "+1 234 567 896", email: "james@email.com", description: "Premium Monthly - January", amount: "$79.99", paymentMethod: "Credit Card", date: "Dec 29, 2024", time: "10:30 AM", status: "paid", branch: "Westside" },
  { id: 8, receiptNo: "RCP-2024-008", memberName: "Anna Martinez", memberId: "MEM-008", phone: "+1 234 567 897", email: "anna@email.com", description: "Yoga Class Package", amount: "$99.00", paymentMethod: "Debit Card", date: "Dec 28, 2024", time: "11:45 AM", status: "paid", branch: "Downtown" },
  { id: 9, receiptNo: "RCP-2024-009", memberName: "Robert Lee", memberId: "MEM-009", phone: "+1 234 567 898", email: "robert@email.com", description: "VIP Monthly", amount: "$149.99", paymentMethod: "Credit Card", date: "Dec 28, 2024", time: "02:00 PM", status: "pending", branch: "Eastside" },
  { id: 10, receiptNo: "RCP-2024-010", memberName: "Jessica White", memberId: "MEM-010", phone: "+1 234 567 899", email: "jessica@email.com", description: "Swimming Pool Access", amount: "$20.00", paymentMethod: "Cash", date: "Dec 27, 2024", time: "08:30 AM", status: "paid", branch: "Downtown" },
];

// Simulated async member search
const allMembers = [
  { value: "John Smith", label: "John Smith", subtitle: "MEM-001" },
  { value: "Sarah Johnson", label: "Sarah Johnson", subtitle: "MEM-002" },
  { value: "Mike Davis", label: "Mike Davis", subtitle: "MEM-003" },
  { value: "Emily Chen", label: "Emily Chen", subtitle: "MEM-004" },
  { value: "David Wilson", label: "David Wilson", subtitle: "MEM-005" },
  { value: "Lisa Brown", label: "Lisa Brown", subtitle: "MEM-006" },
  { value: "James Taylor", label: "James Taylor", subtitle: "MEM-007" },
  { value: "Anna Martinez", label: "Anna Martinez", subtitle: "MEM-008" },
  { value: "Robert Lee", label: "Robert Lee", subtitle: "MEM-009" },
  { value: "Jessica White", label: "Jessica White", subtitle: "MEM-010" },
];

const searchMembers = async (query: string): Promise<AsyncSelectOption[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (!query) return allMembers.slice(0, 5);
  return allMembers.filter(
    (m) => m.label.toLowerCase().includes(query.toLowerCase()) || m.subtitle?.toLowerCase().includes(query.toLowerCase())
  );
};

export default function Receipts() {
  const { toast } = useToast();
  const { paginatedData, searchQuery, handleSearch, filters, handleFilter, paginationProps } = useTableData({
    data: sampleData,
    itemsPerPage: 8,
    searchFields: ["receiptNo", "memberName", "description"],
  });

  const handlePrintReceipt = (record: ReceiptRecord, size: ReceiptSize) => {
    const doc = generateReceipt({
      receiptNo: record.receiptNo,
      date: record.date,
      time: record.time,
      memberName: record.memberName,
      memberId: record.memberId,
      phone: record.phone,
      email: record.email,
      description: record.description,
      amount: record.amount,
      paymentMethod: record.paymentMethod,
      status: record.status,
      branch: record.branch,
    }, size);
    
    if (size === "pos") {
      // For POS, open print dialog directly
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    } else {
      doc.save(`${record.receiptNo}_receipt.pdf`);
    }
    
    const sizeLabels: Record<ReceiptSize, string> = {
      pos: "POS (80mm)",
      a4: "A4",
      a5: "A5",
      letter: "Letter",
    };
    toast({ title: "Receipt Generated", description: `${sizeLabels[size]} format downloaded` });
  };

  // Custom action column with print dropdown
  const PrintActionCell = ({ record }: { record: ReceiptRecord }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-1">
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Print</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Select Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handlePrintReceipt(record, "pos")}>
          <Printer className="w-4 h-4 mr-2" />
          POS Receipt (80mm)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePrintReceipt(record, "a4")}>
          <FileDown className="w-4 h-4 mr-2" />
          A4 Full Page
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePrintReceipt(record, "a5")}>
          <FileDown className="w-4 h-4 mr-2" />
          A5 Half Page
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePrintReceipt(record, "letter")}>
          <FileDown className="w-4 h-4 mr-2" />
          US Letter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const columnsWithActions: Column<ReceiptRecord>[] = [
    { key: "receiptNo", label: "Receipt #", priority: "always", render: (value: string) => <span className="font-mono text-xs">{value}</span> },
    {
      key: "memberName",
      label: "Member",
      priority: "always",
      render: (value: string, item: ReceiptRecord) => (
        <div>
          <p className="font-medium">{value}</p>
          <p className="text-xs text-muted-foreground md:hidden">{item.amount}</p>
        </div>
      ),
    },
    { key: "description", label: "Description", priority: "lg", render: (value: string) => <span className="text-sm truncate max-w-[200px] block">{value}</span> },
    { key: "amount", label: "Amount", priority: "md", render: (value: string) => <span className="font-semibold text-primary">{value}</span> },
    { key: "paymentMethod", label: "Method", priority: "lg" },
    { key: "date", label: "Date", priority: "md" },
    { key: "time", label: "Time", priority: "xl" },
    { key: "branch", label: "Branch", priority: "xl" },
    {
      key: "status",
      label: "Status",
      priority: "always",
      render: (value: "paid" | "pending" | "refunded") => {
        const statusMap = { paid: { status: "success" as const, label: "Paid" }, pending: { status: "warning" as const, label: "Pending" }, refunded: { status: "error" as const, label: "Refunded" } };
        return <StatusBadge {...statusMap[value]} />;
      },
    },
    {
      key: "id",
      label: "Actions",
      priority: "always",
      render: (_: number, item: ReceiptRecord) => <PrintActionCell record={item} />,
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">156</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">$48.5K</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">78%</p>
              <p className="text-xs text-muted-foreground">Card Payments</p>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 shadow-soft border border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold text-card-foreground">+8.3%</p>
              <p className="text-xs text-muted-foreground">vs Last Month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <FilterBar
        searchPlaceholder="Search receipts..."
        searchValue={searchQuery}
        onSearchChange={handleSearch}
        filters={[
          {
            key: "memberName",
            label: "Member",
            type: "async",
            value: filters.memberName || "",
            onChange: (v) => handleFilter("memberName", v),
            onSearch: searchMembers,
          } as FilterConfig,
          {
            key: "status",
            label: "Status",
            value: filters.status || "all",
            onChange: (v) => handleFilter("status", v),
            options: [
              { value: "paid", label: "Paid" },
              { value: "pending", label: "Pending" },
              { value: "refunded", label: "Refunded" },
            ],
          },
          {
            key: "paymentMethod",
            label: "Method",
            value: filters.paymentMethod || "all",
            onChange: (v) => handleFilter("paymentMethod", v),
            options: [
              { value: "Credit Card", label: "Credit Card" },
              { value: "Debit Card", label: "Debit Card" },
              { value: "Cash", label: "Cash" },
              { value: "Bank Transfer", label: "Bank Transfer" },
            ],
          },
          {
            key: "branch",
            label: "Branch",
            value: filters.branch || "all",
            onChange: (v) => handleFilter("branch", v),
            options: [
              { value: "Downtown", label: "Downtown" },
              { value: "Westside", label: "Westside" },
              { value: "Eastside", label: "Eastside" },
            ],
          },
        ]}
      />

      {/* Table */}
      <ResponsiveTable data={paginatedData} columns={columnsWithActions} keyExtractor={(item) => item.id} pagination={paginationProps} />
    </div>
  );
}
