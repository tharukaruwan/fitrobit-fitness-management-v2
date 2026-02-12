import { useState } from "react";
import { ResponsiveTable, Column, PaginationProps } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useCurrency } from "@/hooks/useCurrency";
import { Download, Receipt } from "lucide-react";

interface Payment {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed";
  type: "Subscription" | "SMS Top-up";
}

const allPayments: Payment[] = [
  { id: "INV-001", date: "2026-02-01", description: "Monthly Subscription - Pro Plan", amount: 49.99, status: "Paid", type: "Subscription" },
  { id: "INV-002", date: "2026-01-15", description: "SMS Top-up (1000 SMS)", amount: 25.00, status: "Paid", type: "SMS Top-up" },
  { id: "INV-003", date: "2026-01-01", description: "Monthly Subscription - Pro Plan", amount: 49.99, status: "Paid", type: "Subscription" },
  { id: "INV-004", date: "2025-12-20", description: "SMS Top-up (5000 SMS)", amount: 100.00, status: "Paid", type: "SMS Top-up" },
  { id: "INV-005", date: "2025-12-01", description: "Monthly Subscription - Pro Plan", amount: 49.99, status: "Paid", type: "Subscription" },
  { id: "INV-006", date: "2025-11-15", description: "SMS Top-up (500 SMS)", amount: 15.00, status: "Paid", type: "SMS Top-up" },
  { id: "INV-007", date: "2025-11-01", description: "Monthly Subscription - Pro Plan", amount: 49.99, status: "Paid", type: "Subscription" },
  { id: "INV-008", date: "2025-10-01", description: "Monthly Subscription - Pro Plan", amount: 49.99, status: "Paid", type: "Subscription" },
  { id: "INV-009", date: "2025-09-10", description: "SMS Top-up (10000 SMS)", amount: 180.00, status: "Paid", type: "SMS Top-up" },
  { id: "INV-010", date: "2025-09-01", description: "Monthly Subscription - Pro Plan", amount: 49.99, status: "Paid", type: "Subscription" },
  { id: "INV-011", date: "2025-08-01", description: "Monthly Subscription - Pro Plan", amount: 49.99, status: "Paid", type: "Subscription" },
  { id: "INV-012", date: "2025-07-01", description: "Monthly Subscription - Pro Plan", amount: 49.99, status: "Paid", type: "Subscription" },
];

const ITEMS_PER_PAGE = 8;

export function PaymentsTab() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(allPayments.length / ITEMS_PER_PAGE);
  const paginatedData = allPayments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDownload = (payment: Payment) => {
    const label = payment.status === "Paid" ? "Receipt" : "Invoice";
    toast({
      title: `Downloading ${label}...`,
      description: `${label} ${payment.id} is being downloaded.`,
    });
  };

  const columns: Column<Payment>[] = [
    {
      key: "id",
      label: "Invoice #",
      priority: "always",
      render: (value: string) => (
        <span className="font-mono text-xs font-medium text-card-foreground">{value}</span>
      ),
    },
    {
      key: "date",
      label: "Date",
      priority: "always",
      render: (value: string) => (
        <span className="text-card-foreground">
          {new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      priority: "md",
      render: (value: string) => (
        <span className="text-card-foreground truncate max-w-[200px] block">{value}</span>
      ),
    },
    {
      key: "type",
      label: "Type",
      priority: "lg",
      render: (value: string) => (
        <Badge variant="secondary" className="text-xs border-0 bg-muted">
          {value}
        </Badge>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      priority: "always",
      render: (value: number) => (
        <span className="font-semibold text-card-foreground">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      priority: "always",
      render: (value: string) => {
        const styles: Record<string, string> = {
          Paid: "bg-primary/10 text-primary",
          Pending: "bg-warning/20 text-warning",
          Failed: "bg-destructive/10 text-destructive",
        };
        return (
          <Badge variant="secondary" className={`text-xs border-0 ${styles[value] || ""}`}>
            {value}
          </Badge>
        );
      },
    },
  ];

  const pagination: PaginationProps = {
    currentPage,
    totalPages,
    totalItems: allPayments.length,
    itemsPerPage: ITEMS_PER_PAGE,
    onPageChange: setCurrentPage,
  };

  return (
    <div className="space-y-4">
      <ResponsiveTable<Payment>
        data={paginatedData}
        columns={columns}
        keyExtractor={(item) => item.id}
        pagination={pagination}
        customActions={(item) => (
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(item);
            }}
          >
            {item.status === "Paid" ? (
              <Receipt className="w-4 h-4" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </Button>
        )}
      />
    </div>
  );
}