import { useState } from "react";
import { SectionHeader } from "@/components/ui/detail-page-template";
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
import { cn } from "@/lib/utils";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Heart,
  Plus,
  Pencil,
  Trash2,
  Star,
  AlertCircle,
  UserCheck,
} from "lucide-react";

// Types
interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
}

// Sample data
const sampleContacts: EmergencyContact[] = [
  {
    id: "ec-1",
    name: "Sarah Smith",
    relationship: "Spouse",
    phone: "+1 234 567 8901",
    email: "sarah.smith@email.com",
    address: "123 Main Street, New York, NY 10001",
    isPrimary: true,
  },
  {
    id: "ec-2",
    name: "Michael Smith",
    relationship: "Brother",
    phone: "+1 234 567 8902",
    email: "michael.smith@email.com",
    isPrimary: false,
  },
  {
    id: "ec-3",
    name: "Dr. Emily Johnson",
    relationship: "Doctor",
    phone: "+1 234 567 8903",
    email: "dr.johnson@hospital.com",
    address: "456 Medical Center, Suite 200",
    isPrimary: false,
  },
];

const relationshipOptions = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Doctor",
  "Other",
];

interface MemberEmergencyTabProps {
  memberId: string;
  memberName: string;
}

export function MemberEmergencyTab({ memberId, memberName }: MemberEmergencyTabProps) {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>(sampleContacts);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    address: "",
    isPrimary: false,
  });

  const resetForm = () => {
    setFormData({
      name: "",
      relationship: "",
      phone: "",
      email: "",
      address: "",
      isPrimary: false,
    });
    setEditingContact(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddSheet(true);
  };

  const handleOpenEdit = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      phone: contact.phone,
      email: contact.email || "",
      address: contact.address || "",
      isPrimary: contact.isPrimary,
    });
    setEditingContact(contact);
    setShowAddSheet(true);
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.phone.trim() || !formData.relationship) {
      toast({ title: "Error", description: "Name, phone, and relationship are required", variant: "destructive" });
      return;
    }

    if (editingContact) {
      // Update existing
      setContacts(prev => prev.map(c => 
        c.id === editingContact.id 
          ? { ...c, ...formData, isPrimary: formData.isPrimary ? true : c.isPrimary }
          : formData.isPrimary ? { ...c, isPrimary: false } : c
      ));
      toast({ title: "Contact Updated", description: `${formData.name} has been updated` });
    } else {
      // Add new
      const newContact: EmergencyContact = {
        id: `ec-${Date.now()}`,
        name: formData.name,
        relationship: formData.relationship,
        phone: formData.phone,
        email: formData.email || undefined,
        address: formData.address || undefined,
        isPrimary: formData.isPrimary || contacts.length === 0,
      };
      
      if (newContact.isPrimary) {
        setContacts(prev => [...prev.map(c => ({ ...c, isPrimary: false })), newContact]);
      } else {
        setContacts(prev => [...prev, newContact]);
      }
      toast({ title: "Contact Added", description: `${formData.name} has been added` });
    }

    setShowAddSheet(false);
    resetForm();
  };

  const handleDelete = (contact: EmergencyContact) => {
    setContacts(prev => prev.filter(c => c.id !== contact.id));
    toast({ title: "Contact Deleted", description: `${contact.name} has been removed` });
  };

  const handleSetPrimary = (contact: EmergencyContact) => {
    setContacts(prev => prev.map(c => ({
      ...c,
      isPrimary: c.id === contact.id,
    })));
    toast({ title: "Primary Contact Updated", description: `${contact.name} is now the primary contact` });
  };

  const primaryContact = contacts.find(c => c.isPrimary);
  const otherContacts = contacts.filter(c => !c.isPrimary);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Emergency Contacts"
        action={
          <Button size="sm" onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Add Contact
          </Button>
        }
      />

      {contacts.length === 0 ? (
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-3">No emergency contacts added</p>
          <Button onClick={handleOpenAdd}>
            <Plus className="w-4 h-4 mr-1" />
            Add First Contact
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Primary Contact */}
          {primaryContact && (
            <Card className="overflow-hidden border-primary/50">
              <div className="h-1.5 bg-primary" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="w-5 h-5 text-primary fill-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{primaryContact.name}</h3>
                      <p className="text-sm text-primary font-medium">Primary Contact • {primaryContact.relationship}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleOpenEdit(primaryContact)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(primaryContact)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{primaryContact.phone}</span>
                  </div>
                  {primaryContact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{primaryContact.email}</span>
                    </div>
                  )}
                  {primaryContact.address && (
                    <div className="flex items-center gap-2 text-sm md:col-span-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{primaryContact.address}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Other Contacts */}
          {otherContacts.length > 0 && (
            <div className="grid gap-3">
              {otherContacts.map((contact) => (
                <Card key={contact.id} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h4 className="font-medium text-card-foreground">{contact.name}</h4>
                          <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 px-2 text-xs"
                          onClick={() => handleSetPrimary(contact)}
                        >
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Set Primary
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleOpenEdit(contact)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(contact)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {contact.phone}
                      </span>
                      {contact.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          {contact.email}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Sheet */}
      <QuickAddSheet
        open={showAddSheet}
        onOpenChange={(open) => {
          setShowAddSheet(open);
          if (!open) resetForm();
        }}
        title={editingContact ? "Edit Contact" : "Add Emergency Contact"}
        description={editingContact ? `Editing ${editingContact.name}` : "Add a new emergency contact"}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship *</Label>
            <Select
              value={formData.relationship}
              onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                {relationshipOptions.map((rel) => (
                  <SelectItem key={rel} value={rel}>{rel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 234 567 8900"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="email@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address (Optional)</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter address"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
            <input
              type="checkbox"
              id="isPrimary"
              checked={formData.isPrimary}
              onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
              className="rounded border-border"
            />
            <Label htmlFor="isPrimary" className="text-sm cursor-pointer">
              Set as primary emergency contact
            </Label>
          </div>

          <Button onClick={handleSave} className="w-full">
            {editingContact ? "Update Contact" : "Add Contact"}
          </Button>
        </div>
      </QuickAddSheet>
    </div>
  );
}
