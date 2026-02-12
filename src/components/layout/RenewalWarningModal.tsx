import { useState, useEffect } from "react";
import { AlertTriangle, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAppSelector } from "@/store/hooks";

// Mock renewal date — in production this comes from the API/user object
const MOCK_RENEWAL_DATE = "2026-02-15";
const WARNING_DAYS = 7;

export function RenewalWarningModal() {
  const [open, setOpen] = useState(false);
  const authUser = useAppSelector((state) => state.auth.user);

  // Only show for root admin accounts
  const isRootAdmin = authUser?.role === "gym";

  useEffect(() => {
    if (!isRootAdmin) return;

    const renewalDate = new Date(MOCK_RENEWAL_DATE);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    renewalDate.setHours(0, 0, 0, 0);

    const diffMs = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Show if within 7 days before OR after (expired)
    if (diffDays <= WARNING_DAYS) {
      // Check if dismissed in this session
      const dismissed = sessionStorage.getItem("renewal_warning_dismissed");
      if (!dismissed) {
        setOpen(true);
      }
    }
  }, [isRootAdmin]);

  const handleDismiss = () => {
    setOpen(false);
    sessionStorage.setItem("renewal_warning_dismissed", "true");
  };

  if (!isRootAdmin) return null;

  const renewalDate = new Date(MOCK_RENEWAL_DATE);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  renewalDate.setHours(0, 0, 0, 0);
  const diffMs = renewalDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const isExpired = diffDays <= 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              isExpired ? "bg-destructive/10" : "bg-warning/20"
            }`}>
              <AlertTriangle className={`w-5 h-5 ${isExpired ? "text-destructive" : "text-warning"}`} />
            </div>
            <div>
              <p className="text-base font-semibold">
                {isExpired ? "Subscription Expired!" : "Subscription Renewal Soon"}
              </p>
              <p className="text-sm font-normal text-muted-foreground">
                {isExpired
                  ? "Your subscription has expired. Please renew to continue using all features."
                  : `Your subscription will renew in ${diffDays} day${diffDays !== 1 ? "s" : ""}.`}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className={`p-4 rounded-xl border ${
            isExpired ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"
          }`}>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-card-foreground">Renewal Date</p>
                <p className="text-lg font-bold text-card-foreground">
                  {renewalDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {isExpired && (
            <p className="mt-3 text-sm text-destructive font-medium text-center">
              ⚠️ Some features may be restricted until you renew your subscription.
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleDismiss} className="w-full sm:w-auto">
            Remind Later
          </Button>
          <Button
            onClick={handleDismiss}
            className={`w-full sm:w-auto ${isExpired ? "bg-destructive hover:bg-destructive/90" : ""}`}
          >
            {isExpired ? "Renew Now" : "Got It"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}