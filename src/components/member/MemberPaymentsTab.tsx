import * as React from "react";
import { Plus, Printer, FileText, CreditCard, DollarSign, Calendar as CalendarIcon, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { ResponsiveTable, Column } from "@/components/ui/responsive-table";
import { FilterBar, FilterConfig } from "@/components/ui/filter-bar";
import { StatusBadge } from "@/components/ui/status-badge";
import { useToast } from "@/hooks/use-toast";
import { generateReceipt, ReceiptSize } from "@/lib/pdf-utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Payment {
  id: number;
  receiptNo: string;
  date: string;
  description: string;
  amount: string;
  method: string;
  status: "paid" | "pending" | "failed";
}

interface MemberPaymentsTabProps {
  id: string;
}

// Sample Data
const paymentData: Payment[] = [
  { id: 1, receiptNo: "REC-2024-001", date: "Jan 15, 2024", description: "Premium Membership - Annual", amount: "$599.00", method: "Credit Card", status: "paid" },
  { id: 2, receiptNo: "REC-2023-045", date: "Dec 15, 2023", description: "Personal Training (5 sessions)", amount: "$150.00", method: "Cash", status: "paid" },
  { id: 3, receiptNo: "REC-2023-044", date: "Nov 20, 2023", description: "Locker Rental - Monthly", amount: "$25.00", method: "Credit Card", status: "paid" },
  { id: 4, receiptNo: "REC-2023-043", date: "Nov 15, 2023", description: "Premium Membership - Monthly", amount: "$59.00", method: "Credit Card", status: "paid" },
  { id: 5, receiptNo: "REC-2023-042", date: "Oct 15, 2023", description: "Premium Membership - Monthly", amount: "$59.00", method: "Bank Transfer", status: "paid" },
];

export function MemberPaymentsTab({ id }: MemberPaymentsTabProps) {
  const { toast } = useToast();
  const [paymentPage, setPaymentPage] = React.useState(1);
  const [paymentSearch, setPaymentSearch] = React.useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = React.useState("all");
  const paymentsPerPage = 5;

  // --- Filtering Logic ---
  const filteredPayments = paymentData.filter((payment) => {
    const matchesSearch = paymentSearch === "" ||
      payment.receiptNo.toLowerCase().includes(paymentSearch.toLowerCase()) ||
      payment.description.toLowerCase().includes(paymentSearch.toLowerCase());
    const matchesStatus = paymentStatusFilter === "all" || payment.status === paymentStatusFilter;
    const matchesMethod = paymentMethodFilter === "all" || payment.method === paymentMethodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const paginatedPayments = filteredPayments.slice(
    (paymentPage - 1) * paymentsPerPage,
    paymentPage * paymentsPerPage
  );

  // --- Handlers ---
  const handlePrintReceipt = (payment: Payment, size: ReceiptSize) => {
    const doc = generateReceipt({
      receiptNo: payment.receiptNo,
      date: payment.date,
      memberName: "Unknown Member",
      memberId: "memberDetails?.memberId",
      email: "memberDetails?.email",
      description: payment.description,
      amount: payment.amount,
      paymentMethod: payment.method,
      status: payment.status,
      branch: "memberDetails?.branch",
    }, size);

    if (size === "pos") {
      const pdfBlob = doc.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      const printWindow = window.open(url);
      if (printWindow) printWindow.onload = () => printWindow.print();
    } else {
      doc.save(`receipt-${payment.receiptNo}.pdf`);
    }
  };

  // --- Table Configuration ---
  const paymentColumns: Column<Payment>[] = [
    { key: "receiptNo", label: "Receipt #", priority: "md" },
    { key: "date", label: "Date", priority: "always" },
    { key: "description", label: "Description", priority: "md" },
    { key: "amount", label: "Amount", priority: "always", render: (val) => <span className="font-bold text-foreground">{val}</span> },
    { key: "method", label: "Method", priority: "lg" }, // Restored Method Column
    {
      key: "status",
      label: "Status",
      priority: "always",
      render: (val: any) => (
        <StatusBadge 
            status={val === "paid" ? "success" : val === "pending" ? "warning" : "error"} 
            label={val.charAt(0).toUpperCase() + val.slice(1)} 
        />
      )
    },
  ];

  const paymentFilters: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      value: paymentStatusFilter,
      onChange: (v) => { setPaymentStatusFilter(v); setPaymentPage(1); },
      options: [
        { value: "paid", label: "Paid" },
        { value: "pending", label: "Pending" },
        { value: "failed", label: "Failed" },
      ],
    },
    {
      key: "method",
      label: "Method",
      value: paymentMethodFilter,
      onChange: (v) => { setPaymentMethodFilter(v); setPaymentPage(1); },
      options: [
        { value: "Credit Card", label: "Credit Card" },
        { value: "Cash", label: "Cash" },
        { value: "Bank Transfer", label: "Bank Transfer" },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Payment History"
        action={
          <Button size="sm" onClick={() => toast({ title: "Opening payment form..." })}>
            <Plus className="w-4 h-4 mr-1" /> Add Payment
          </Button>
        }
      />

      {/* --- Restored Summary Cards --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CardSummary label="Total Paid" value="$892.00" icon={<DollarSign className="w-4 h-4 text-emerald-500" />} />
        <CardSummary label="Pending" value="$0.00" icon={<Activity className="w-4 h-4 text-orange-500" />} color="text-orange-500" />
        <CardSummary label="This Month" value="$599.00" icon={<CalendarIcon className="w-4 h-4 text-primary" />} color="text-primary" />
        <CardSummary label="Transactions" value={filteredPayments.length.toString()} icon={<CreditCard className="w-4 h-4 text-muted-foreground" />} />
      </div>

      <FilterBar
        searchPlaceholder="Search receipts..."
        searchValue={paymentSearch}
        onSearchChange={(v) => { setPaymentSearch(v); setPaymentPage(1); }}
        filters={paymentFilters}
      />

      <ResponsiveTable
        data={paginatedPayments}
        columns={paymentColumns}
        keyExtractor={(item) => item.id}
        customActions={(item) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Printer className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={() => handlePrintReceipt(item, "pos")}>
                <Printer className="h-4 h-4 mr-2" /> POS (80mm)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrintReceipt(item, "a4")}>
                <FileText className="h-4 h-4 mr-2" /> A4 Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePrintReceipt(item, "letter")}>
                <FileText className="h-4 h-4 mr-2" /> US Letter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        pagination={{
          currentPage: paymentPage,
          totalPages: Math.ceil(filteredPayments.length / paymentsPerPage),
          totalItems: filteredPayments.length,
          itemsPerPage: paymentsPerPage,
          onPageChange: setPaymentPage,
        }}
      />
    </div>
  );
}

// Helper component for summary cards
function CardSummary({ label, value, icon, color = "text-foreground" }: { label: string, value: string, icon: React.ReactNode, color?: string }) {
  return (
    <div className="bg-muted/30 rounded-2xl p-4 border border-border/50 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className={cn("text-xl font-black", color)}>{value}</p>
    </div>
  );
}

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");