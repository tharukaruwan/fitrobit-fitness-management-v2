import { useState } from "react";
import { SectionHeader } from "@/components/ui/detail-page-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/hooks/useCurrency";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Pencil,
  Trash2,
  MessageSquare,
  ShoppingCart,
  Plus,
  Mail,
  Phone,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const smsPacks = [
  { id: "1", count: 500, price: 15 },
  { id: "2", count: 1000, price: 25 },
  { id: "3", count: 5000, price: 100 },
  { id: "4", count: 10000, price: 180 },
];

const emailPacks = [
  { id: "1", count: 1000, price: 10 },
  { id: "2", count: 5000, price: 40 },
  { id: "3", count: 10000, price: 70 },
  { id: "4", count: 50000, price: 300 },
];

const whatsappCategories = [
  {
    key: "marketing",
    label: "Marketing",
    description: "Promotions, offers & campaigns",
    packs: [
      { id: "wm1", count: 500, price: 25 },
      { id: "wm2", count: 1000, price: 45 },
      { id: "wm3", count: 5000, price: 200 },
    ],
  },
  {
    key: "utility",
    label: "Utility",
    description: "Reminders, confirmations & alerts",
    packs: [
      { id: "wu1", count: 500, price: 15 },
      { id: "wu2", count: 1000, price: 25 },
      { id: "wu3", count: 5000, price: 100 },
    ],
  },
  {
    key: "authentication",
    label: "Authentication",
    description: "OTPs & verification codes",
    packs: [
      { id: "wa1", count: 500, price: 20 },
      { id: "wa2", count: 1000, price: 35 },
      { id: "wa3", count: 5000, price: 150 },
    ],
  },
];

const mockSubscription = {
  plan: "Pro Plan",
  nextRenewal: "2026-03-01",
  amount: 49.99,
};

export function AccountSettingsTab() {
  const { toast } = useToast();
  const { formatCurrency } = useCurrency();

  // Single card state
  const [card, setCard] = useState<{ last4: string; brand: string; expiry: string; name: string } | null>({
    last4: "4242",
    brand: "Visa",
    expiry: "12/26",
    name: "John Doe",
  });
  const [showCardDialog, setShowCardDialog] = useState(false);
  const [cardForm, setCardForm] = useState({ number: "", expiry: "", cvv: "", name: "" });

  // Topup dialogs
  const [showTopup, setShowTopup] = useState<"sms" | "email" | "whatsapp" | null>(null);
  const [selectedPack, setSelectedPack] = useState<string | null>(null);
  const [whatsappTab, setWhatsappTab] = useState("marketing");

  const handleSaveCard = () => {
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvv || !cardForm.name) {
      toast({ title: "Error", description: "Please fill all card details.", variant: "destructive" });
      return;
    }
    const last4 = cardForm.number.replace(/\s/g, "").slice(-4);
    setCard({ last4, brand: "Visa", expiry: cardForm.expiry, name: cardForm.name });
    setCardForm({ number: "", expiry: "", cvv: "", name: "" });
    setShowCardDialog(false);
    toast({ title: "Card Saved", description: `Card ending in ${last4} has been saved.` });
  };

  const handleRemoveCard = () => {
    setCard(null);
    toast({ title: "Card Removed", description: "Your payment card has been removed." });
  };

  const handleEditCard = () => {
    if (card) {
      setCardForm({ number: "", expiry: card.expiry, cvv: "", name: card.name });
    }
    setShowCardDialog(true);
  };

  const handleBuyCredits = () => {
    if (!selectedPack || !showTopup) return;
    const type = showTopup;
    let pack: { count: number } | undefined;

    if (type === "sms") {
      pack = smsPacks.find(p => p.id === selectedPack);
    } else if (type === "email") {
      pack = emailPacks.find(p => p.id === selectedPack);
    } else {
      const cat = whatsappCategories.find(c => c.key === whatsappTab);
      pack = cat?.packs.find(p => p.id === selectedPack);
    }

    const label = type === "sms" ? "SMS" : type === "email" ? "Email" : `WhatsApp (${whatsappTab})`;
    setShowTopup(null);
    setSelectedPack(null);
    toast({ title: "Credits Purchased!", description: `${pack?.count?.toLocaleString()} ${label} credits added.` });
  };

  const renderCreditCard = (
    icon: React.ReactNode,
    label: string,
    count: string,
    subtitle: string,
    onBuy: () => void
  ) => (
    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border border-border/30">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-card-foreground">{count}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Button size="sm" variant="outline" onClick={onBuy}>
        <ShoppingCart className="w-4 h-4 mr-1" />
        Buy
      </Button>
    </div>
  );

  const getCurrentPacks = () => {
    if (showTopup === "sms") return smsPacks;
    if (showTopup === "email") return emailPacks;
    if (showTopup === "whatsapp") {
      const cat = whatsappCategories.find(c => c.key === whatsappTab);
      return cat?.packs || [];
    }
    return [];
  };

  const getTopupTitle = () => {
    if (showTopup === "sms") return "Buy SMS Credits";
    if (showTopup === "email") return "Buy Email Credits";
    if (showTopup === "whatsapp") return "Buy WhatsApp Credits";
    return "";
  };

  const getTopupIcon = () => {
    if (showTopup === "sms") return <MessageSquare className="w-5 h-5" />;
    if (showTopup === "email") return <Mail className="w-5 h-5" />;
    if (showTopup === "whatsapp") return <Phone className="w-5 h-5" />;
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Payment Card Section */}
      <div className="space-y-4">
        <SectionHeader
          title="Payment Card"
          action={
            !card ? (
              <Button size="sm" onClick={() => { setCardForm({ number: "", expiry: "", cvv: "", name: "" }); setShowCardDialog(true); }}>
                <Plus className="w-4 h-4 mr-1" />
                Add Card
              </Button>
            ) : undefined
          }
        />
        {!card ? (
          <div className="text-center py-8 text-muted-foreground">
            <CreditCard className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No payment card added yet.</p>
          </div>
        ) : (
          <div className="max-w-sm p-5 rounded-xl bg-gradient-to-br from-primary/10 via-card to-muted/50 border border-primary/20 ring-1 ring-primary/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-semibold text-card-foreground">{card.brand}</span>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleEditCard}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleRemoveCard}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-xl font-mono text-card-foreground tracking-[0.2em] mb-2">
              •••• •••• •••• {card.last4}
            </p>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{card.name}</span>
              <span>Expires {card.expiry}</span>
            </div>
          </div>
        )}
      </div>

      {/* Messaging Credits Section */}
      <div className="space-y-4">
        <SectionHeader title="Messaging Credits" />
        <div className="space-y-3">
          {renderCreditCard(
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>,
            "SMS",
            "1,247",
            "Remaining SMS Credits",
            () => setShowTopup("sms")
          )}
          {renderCreditCard(
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <Mail className="w-6 h-6 text-success" />
            </div>,
            "Email",
            "3,580",
            "Remaining Email Credits",
            () => setShowTopup("email")
          )}
          {renderCreditCard(
            <div className="w-12 h-12 rounded-xl bg-[hsl(142,70%,45%)]/10 flex items-center justify-center">
              <Phone className="w-6 h-6 text-[hsl(142,70%,45%)]" />
            </div>,
            "WhatsApp",
            "892",
            "Remaining WhatsApp Credits",
            () => setShowTopup("whatsapp")
          )}
        </div>
      </div>

      {/* Subscription Info */}
      <div className="space-y-4">
        <SectionHeader title="Subscription" />
        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
          <div>
            <p className="font-semibold text-card-foreground">{mockSubscription.plan}</p>
            <p className="text-sm text-muted-foreground">
              Next renewal: {new Date(mockSubscription.nextRenewal).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <p className="text-xl font-bold text-primary">{formatCurrency(mockSubscription.amount)}/mo</p>
        </div>
      </div>

      {/* Add/Edit Card Dialog */}
      <Dialog open={showCardDialog} onOpenChange={setShowCardDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {card ? "Update Payment Card" : "Add Payment Card"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Cardholder Name</Label>
              <Input placeholder="John Doe" value={cardForm.name} onChange={e => setCardForm(prev => ({ ...prev, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Card Number</Label>
              <Input placeholder="1234 5678 9012 3456" value={cardForm.number} onChange={e => setCardForm(prev => ({ ...prev, number: e.target.value }))} maxLength={19} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Expiry</Label>
                <Input placeholder="MM/YY" value={cardForm.expiry} onChange={e => setCardForm(prev => ({ ...prev, expiry: e.target.value }))} maxLength={5} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">CVV</Label>
                <Input placeholder="123" type="password" value={cardForm.cvv} onChange={e => setCardForm(prev => ({ ...prev, cvv: e.target.value }))} maxLength={4} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCardDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveCard}>{card ? "Update" : "Add Card"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unified Credits Top-up Dialog */}
      <Dialog open={!!showTopup} onOpenChange={(open) => { if (!open) { setShowTopup(null); setSelectedPack(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getTopupIcon()}
              {getTopupTitle()}
            </DialogTitle>
          </DialogHeader>

          {/* WhatsApp category tabs */}
          {showTopup === "whatsapp" && (
            <Tabs value={whatsappTab} onValueChange={(v) => { setWhatsappTab(v); setSelectedPack(null); }} className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                {whatsappCategories.map(cat => (
                  <TabsTrigger key={cat.key} value={cat.key} className="text-xs">
                    {cat.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <p className="text-xs text-muted-foreground mt-2 px-1">
                {whatsappCategories.find(c => c.key === whatsappTab)?.description}
              </p>
            </Tabs>
          )}

          <div className="space-y-3 py-2">
            {getCurrentPacks().map(pack => (
              <button
                key={pack.id}
                onClick={() => setSelectedPack(pack.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                  selectedPack === pack.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border/50 hover:border-primary/30 hover:bg-accent/50"
                }`}
              >
                <div>
                  <p className="font-semibold text-card-foreground">{pack.count.toLocaleString()} credits</p>
                  <p className="text-xs text-muted-foreground">{(pack.price / pack.count * 100).toFixed(1)}¢ per credit</p>
                </div>
                <p className="text-lg font-bold text-primary">{formatCurrency(pack.price)}</p>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowTopup(null); setSelectedPack(null); }}>Cancel</Button>
            <Button onClick={handleBuyCredits} disabled={!selectedPack}>Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
