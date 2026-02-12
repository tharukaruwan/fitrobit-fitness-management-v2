import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useCurrency } from "@/hooks/useCurrency";
import { QuickAddSheet } from "@/components/ui/quick-add-sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FilterBar } from "@/components/ui/filter-bar";
import { ImagePreview } from "@/components/ui/image-preview";
import { 
  Plus, Pencil, Trash2, ShoppingCart, Package, X, 
  Minus, CreditCard, Wallet, User, Check, Grid3X3, 
  List, ImagePlus, AlertCircle, UserPlus, Phone, ScanBarcode, Camera,
  Printer, Download, FileText, Receipt
} from "lucide-react";
import { generateReceipt, ReceiptSize } from "@/lib/pdf-utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTableData } from "@/hooks/use-table-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Html5QrcodeScanner } from "html5-qrcode";

// Types
interface ProductVariation {
  id: string;
  name: string; // e.g., "Size", "Color", "Flavor"
  options: VariationOption[];
}

interface VariationOption {
  id: string;
  value: string; // e.g., "Large", "Red", "Chocolate"
  priceAdjustment: number; // +/- from base price
  stock: number;
  sku: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  image?: string;
  description?: string;
  minStock: number;
  sku: string;
  createdAt: string;
  hasVariations: boolean;
  variations?: ProductVariation[];
  // For products without variations
  stock?: number;
}

interface CartItem {
  product: Product;
  selectedVariation?: {
    variationId: string;
    optionId: string;
    optionValue: string;
  };
  quantity: number;
  unitPrice: number;
}

// Mock data with variations
const mockProducts: Product[] = [
  { 
    id: "1", 
    name: "Protein Shake", 
    category: "Supplements", 
    basePrice: 5.99, 
    minStock: 10, 
    sku: "SUP001", 
    createdAt: "2024-01-15",
    hasVariations: true,
    image: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=400",
    description: "Premium whey protein shake for muscle recovery",
    variations: [
      {
        id: "v1",
        name: "Flavor",
        options: [
          { id: "o1", value: "Chocolate", priceAdjustment: 0, stock: 25, sku: "SUP001-CHO" },
          { id: "o2", value: "Vanilla", priceAdjustment: 0, stock: 20, sku: "SUP001-VAN" },
          { id: "o3", value: "Strawberry", priceAdjustment: 0.50, stock: 15, sku: "SUP001-STR" },
        ]
      }
    ]
  },
  { 
    id: "2", 
    name: "Energy Bar", 
    category: "Snacks", 
    basePrice: 2.50, 
    stock: 100, 
    minStock: 20, 
    sku: "SNK001", 
    createdAt: "2024-01-10",
    hasVariations: false,
    image: "https://images.unsplash.com/photo-1622484211148-36a2e1e98d79?w=400",
    description: "High-protein energy bar"
  },
  { 
    id: "3", 
    name: "Gym T-Shirt", 
    category: "Apparel", 
    basePrice: 25.00, 
    minStock: 5, 
    sku: "APP001", 
    createdAt: "2024-01-08",
    hasVariations: true,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400",
    description: "Breathable workout t-shirt",
    variations: [
      {
        id: "v1",
        name: "Size",
        options: [
          { id: "o1", value: "S", priceAdjustment: 0, stock: 10, sku: "APP001-S" },
          { id: "o2", value: "M", priceAdjustment: 0, stock: 15, sku: "APP001-M" },
          { id: "o3", value: "L", priceAdjustment: 0, stock: 12, sku: "APP001-L" },
          { id: "o4", value: "XL", priceAdjustment: 2, stock: 8, sku: "APP001-XL" },
        ]
      }
    ]
  },
  { 
    id: "4", 
    name: "Water Bottle", 
    category: "Accessories", 
    basePrice: 12.00, 
    minStock: 5, 
    sku: "ACC001", 
    createdAt: "2024-01-08",
    hasVariations: true,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400",
    description: "Insulated stainless steel bottle",
    variations: [
      {
        id: "v1",
        name: "Color",
        options: [
          { id: "o1", value: "Black", priceAdjustment: 0, stock: 15, sku: "ACC001-BLK" },
          { id: "o2", value: "Blue", priceAdjustment: 0, stock: 10, sku: "ACC001-BLU" },
          { id: "o3", value: "Red", priceAdjustment: 0, stock: 8, sku: "ACC001-RED" },
        ]
      }
    ]
  },
  { 
    id: "5", 
    name: "Gym Towel", 
    category: "Accessories", 
    basePrice: 8.00, 
    stock: 40, 
    minStock: 10, 
    sku: "ACC002", 
    createdAt: "2024-01-05",
    hasVariations: false,
    image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400",
    description: "Quick-dry microfiber towel"
  },
  { 
    id: "6", 
    name: "Pre-Workout", 
    category: "Supplements", 
    basePrice: 35.00, 
    stock: 15, 
    minStock: 5, 
    sku: "SUP002", 
    createdAt: "2024-01-02",
    hasVariations: false,
    image: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400",
    description: "Energy boost formula"
  },
  { 
    id: "7", 
    name: "BCAA Powder", 
    category: "Supplements", 
    basePrice: 28.00, 
    minStock: 10, 
    sku: "SUP003", 
    createdAt: "2024-01-01",
    hasVariations: true,
    image: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400",
    description: "Branch chain amino acids",
    variations: [
      {
        id: "v1",
        name: "Size",
        options: [
          { id: "o1", value: "250g", priceAdjustment: 0, stock: 12, sku: "SUP003-250" },
          { id: "o2", value: "500g", priceAdjustment: 15, stock: 8, sku: "SUP003-500" },
        ]
      }
    ]
  },
  { 
    id: "8", 
    name: "Resistance Band Set", 
    category: "Equipment", 
    basePrice: 15.00, 
    stock: 30, 
    minStock: 8, 
    sku: "EQP001", 
    createdAt: "2024-01-12",
    hasVariations: false,
    image: "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400",
    description: "Set of 5 resistance levels"
  },
];

const categories = ["Supplements", "Snacks", "Accessories", "Equipment", "Apparel"];

const Products = () => {
  const { t } = useTranslation();
  const { formatCurrency } = useCurrency();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isVariationSelectOpen, setIsVariationSelectOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bill">("cash");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCart, setShowCart] = useState(false);
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [showReceiptDialog, setShowReceiptDialog] = useState(false);
  const [cashReceived, setCashReceived] = useState<string>("");
  const [completedSaleData, setCompletedSaleData] = useState<{
    cart: CartItem[];
    total: number;
    member: Customer | null;
    paymentMethod: string;
    receiptNo: string;
    cashReceived?: number;
    changeDue?: number;
  } | null>(null);
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    basePrice: "",
    stock: "",
    minStock: "",
    sku: "",
    description: "",
    image: "",
    hasVariations: false,
  });

  const { searchQuery, handleSearch, filters, handleFilter } = useTableData({
    data: products,
    itemsPerPage: 100,
    searchFields: ["name", "category", "sku"],
  });

  // Helper function to get total stock - defined before useMemo that uses it
  const getTotalStock = (product: Product): number => {
    if (!product.hasVariations) return product.stock || 0;
    if (!product.variations) return 0;
    return product.variations.reduce((total, variation) => 
      total + variation.options.reduce((sum, opt) => sum + opt.stock, 0), 0
    );
  };

  // Get stock for specific variation
  const getVariationStock = (product: Product, variationId: string, optionId: string): number => {
    const variation = product.variations?.find(v => v.id === variationId);
    const option = variation?.options.find(o => o.id === optionId);
    return option?.stock || 0;
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!product.name.toLowerCase().includes(query) && 
            !product.category.toLowerCase().includes(query) &&
            !product.sku.toLowerCase().includes(query)) {
          return false;
        }
      }
      // Category filter
      const categoryFilter = filters.category || "all";
      if (categoryFilter !== "all" && product.category !== categoryFilter) return false;
      
      // Stock filter
      const stockFilter = filters.stock || "all";
      const totalStock = getTotalStock(product);
      if (stockFilter === "low" && totalStock > product.minStock) return false;
      if (stockFilter === "out" && totalStock > 0) return false;
      if (stockFilter === "in" && totalStock <= 0) return false;
      
      return true;
    });
  }, [products, searchQuery, filters, getTotalStock]);

  // Add to cart
  const handleAddToCart = (product: Product, variationId?: string, optionId?: string) => {
    let unitPrice = product.basePrice;
    let stock = product.stock || 0;
    let selectedVariation: CartItem['selectedVariation'] | undefined;

    if (product.hasVariations && variationId && optionId) {
      const variation = product.variations?.find(v => v.id === variationId);
      const option = variation?.options.find(o => o.id === optionId);
      if (option) {
        unitPrice = product.basePrice + option.priceAdjustment;
        stock = option.stock;
        selectedVariation = {
          variationId,
          optionId,
          optionValue: option.value,
        };
      }
    }

    if (stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    const existingIndex = cart.findIndex(item => 
      item.product.id === product.id && 
      item.selectedVariation?.optionId === optionId
    );

    if (existingIndex >= 0) {
      const existing = cart[existingIndex];
      if (existing.quantity >= stock) {
        toast.error("Not enough stock available");
        return;
      }
      setCart(cart.map((item, idx) => 
        idx === existingIndex ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { product, selectedVariation, quantity: 1, unitPrice }]);
    }
    
    toast.success(`${product.name}${selectedVariation ? ` (${selectedVariation.optionValue})` : ''} added to cart`);
    setIsVariationSelectOpen(false);
    setSelectedProduct(null);
  };

  // Handle product click - show variation selector if needed
  const handleProductClick = (product: Product) => {
    if (product.hasVariations && product.variations && product.variations.length > 0) {
      setSelectedProduct(product);
      setIsVariationSelectOpen(true);
    } else {
      handleAddToCart(product);
    }
  };

  // Barcode scanning - find product by SKU
  const handleBarcodeScanned = (barcode: string) => {
    const cleanBarcode = barcode.trim().toUpperCase();
    
    // Search for product by SKU (including variation SKUs)
    let foundProduct: Product | null = null;
    let foundVariation: { variationId: string; optionId: string } | null = null;

    for (const product of products) {
      // Check main product SKU
      if (product.sku.toUpperCase() === cleanBarcode) {
        foundProduct = product;
        break;
      }
      
      // Check variation SKUs
      if (product.hasVariations && product.variations) {
        for (const variation of product.variations) {
          for (const option of variation.options) {
            if (option.sku.toUpperCase() === cleanBarcode) {
              foundProduct = product;
              foundVariation = { variationId: variation.id, optionId: option.id };
              break;
            }
          }
          if (foundProduct) break;
        }
      }
      if (foundProduct) break;
    }

    if (foundProduct) {
      if (foundVariation) {
        handleAddToCart(foundProduct, foundVariation.variationId, foundVariation.optionId);
      } else if (foundProduct.hasVariations) {
        setSelectedProduct(foundProduct);
        setIsVariationSelectOpen(true);
      } else {
        handleAddToCart(foundProduct);
      }
      setBarcodeInput("");
      setShowBarcodeScanner(false);
    } else {
      toast.error(`Product not found: ${cleanBarcode}`);
    }
  };

  // Handle barcode input (for keyboard barcode scanners)
  const handleBarcodeInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      handleBarcodeScanned(barcodeInput);
    }
  };

  // Initialize camera scanner - with delay to ensure DOM is ready
  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    if (showBarcodeScanner) {
      // Wait for dialog to fully render
      timeoutId = setTimeout(() => {
        const element = document.getElementById("barcode-reader");
        if (element && !scannerRef.current) {
          try {
            scanner = new Html5QrcodeScanner(
              "barcode-reader",
              { 
                fps: 10, 
                qrbox: { width: 250, height: 100 },
                aspectRatio: 2.0,
                rememberLastUsedCamera: true,
                showTorchButtonIfSupported: true,
              },
              false
            );
            
            scanner.render(
              (decodedText) => {
                handleBarcodeScanned(decodedText);
                if (scanner) {
                  scanner.clear().catch(() => {});
                }
                scannerRef.current = null;
              },
              () => {
                // Ignore scan errors - they happen frequently during scanning
              }
            );
            
            scannerRef.current = scanner;
          } catch (err) {
            console.error("Failed to initialize scanner:", err);
          }
        }
      }, 300);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [showBarcodeScanner]);

  const handleRemoveFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const handleUpdateCartQuantity = (index: number, newQty: number) => {
    const item = cart[index];
    const stock = item.selectedVariation 
      ? getVariationStock(item.product, item.selectedVariation.variationId, item.selectedVariation.optionId)
      : item.product.stock || 0;

    if (newQty > stock) {
      toast.error("Not enough stock available");
      return;
    }
    if (newQty <= 0) {
      handleRemoveFromCart(index);
      return;
    }
    setCart(cart.map((c, i) => i === index ? { ...c, quantity: newQty } : c));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (!selectedMember) {
      toast.error("Please select a member");
      return;
    }

    // Generate receipt number
    const receiptNo = `RCP-${Date.now().toString().slice(-8)}`;
    const cashReceivedNum = parseFloat(cashReceived) || 0;
    const changeDue = paymentMethod === "cash" ? cashReceivedNum - cartTotal : 0;

    // Store sale data for receipt
    setCompletedSaleData({
      cart: [...cart],
      total: cartTotal,
      member: selectedMember,
      paymentMethod: paymentMethod === "cash" ? "Cash" : paymentMethod === "card" ? "Card" : "Added to Bill",
      receiptNo,
      cashReceived: paymentMethod === "cash" ? cashReceivedNum : undefined,
      changeDue: paymentMethod === "cash" ? changeDue : undefined,
    });

    // Update product stock
    const updatedProducts = products.map(product => {
      const cartItems = cart.filter(item => item.product.id === product.id);
      if (cartItems.length === 0) return product;

      if (product.hasVariations && product.variations) {
        const updatedVariations = product.variations.map(variation => ({
          ...variation,
          options: variation.options.map(option => {
            const cartItem = cartItems.find(
              ci => ci.selectedVariation?.variationId === variation.id && 
                    ci.selectedVariation?.optionId === option.id
            );
            if (cartItem) {
              return { ...option, stock: option.stock - cartItem.quantity };
            }
            return option;
          })
        }));
        return { ...product, variations: updatedVariations };
      } else {
        const totalQty = cartItems.reduce((sum, ci) => sum + ci.quantity, 0);
        return { ...product, stock: (product.stock || 0) - totalQty };
      }
    });

    setProducts(updatedProducts);
    
    // Show receipt dialog
    setShowReceiptDialog(true);
    
    setCart([]);
    setSelectedMember(null);
    setPaymentMethod("cash");
    setCashReceived("");
    setShowCart(false);
  };

  // Handle printing receipt
  const handlePrintReceipt = (size: ReceiptSize) => {
    if (!completedSaleData) return;

    const receiptData = {
      receiptNo: completedSaleData.receiptNo,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString(),
      memberName: completedSaleData.member?.name || "Guest",
      memberId: completedSaleData.member?.id,
      phone: completedSaleData.member?.phone,
      description: "Product Sale",
      amount: formatCurrency(completedSaleData.total),
      paymentMethod: completedSaleData.paymentMethod,
      status: "Paid",
      items: completedSaleData.cart.map(item => ({
        description: item.product.name + (item.selectedVariation ? ` (${item.selectedVariation.optionValue})` : ""),
        quantity: item.quantity,
        unitPrice: formatCurrency(item.unitPrice),
        total: formatCurrency(item.unitPrice * item.quantity),
      })),
    };

    const doc = generateReceipt(receiptData, size);
    
    if (size === "pos") {
      // For thermal printers, open print dialog directly
      doc.autoPrint();
      window.open(doc.output("bloburl"), "_blank");
    } else {
      // For other sizes, download PDF
      doc.save(`Receipt-${completedSaleData.receiptNo}.pdf`);
    }

    toast.success(size === "pos" ? "Sending to printer..." : "Receipt downloaded!");
  };

  const handleCloseReceiptDialog = () => {
    setShowReceiptDialog(false);
    setCompletedSaleData(null);
    toast.success("Sale completed successfully!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData({ ...formData, image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      basePrice: parseFloat(formData.basePrice),
      stock: formData.hasVariations ? undefined : parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      sku: formData.sku,
      description: formData.description,
      image: formData.image,
      createdAt: new Date().toISOString().split('T')[0],
      hasVariations: formData.hasVariations,
    };
    setProducts([...products, newProduct]);
    toast.success("Product added successfully");
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditProduct = () => {
    if (!selectedProduct) return;
    setProducts(products.map(p => 
      p.id === selectedProduct.id 
        ? {
            ...p,
            name: formData.name,
            category: formData.category,
            basePrice: parseFloat(formData.basePrice),
            stock: formData.hasVariations ? undefined : parseInt(formData.stock),
            minStock: parseInt(formData.minStock),
            sku: formData.sku,
            description: formData.description,
            image: formData.image,
          }
        : p
    ));
    toast.success("Product updated successfully");
    setIsEditOpen(false);
    resetForm();
  };

  const handleDeleteProduct = () => {
    if (!selectedProduct) return;
    setProducts(products.filter(p => p.id !== selectedProduct.id));
    toast.success("Product deleted successfully");
    setIsDeleteOpen(false);
    setSelectedProduct(null);
  };

  const resetForm = () => {
    setFormData({ name: "", category: "", basePrice: "", stock: "", minStock: "", sku: "", description: "", image: "", hasVariations: false });
    setSelectedProduct(null);
  };

  const openEditForm = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      basePrice: product.basePrice.toString(),
      stock: (product.stock || 0).toString(),
      minStock: product.minStock.toString(),
      sku: product.sku,
      description: product.description || "",
      image: product.image || "",
      hasVariations: product.hasVariations,
    });
    setIsEditOpen(true);
  };

  // Mock members for checkout
  const mockMembers: Customer[] = [
    { id: "1", name: "John Doe", phone: "555-0101" },
    { id: "2", name: "Jane Smith", phone: "555-0102" },
    { id: "3", name: "Mike Johnson", phone: "555-0103" },
    { id: "4", name: "Sarah Wilson", phone: "555-0104" },
    { id: "5", name: "Guest Customer", phone: "555-0105" },
  ];

  const filteredMembers = mockMembers.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    (m.phone && m.phone.includes(memberSearch))
  );

  const ProductForm = () => (
    <div className="space-y-4">
      {/* Image Upload */}
      <div>
        <Label>Product Image</Label>
        <div className="mt-2 flex items-center gap-4">
          {formData.image ? (
            <div className="relative w-20 h-20 rounded-lg overflow-hidden ring-2 ring-border">
              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, image: "" })}
                className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <ImagePlus className="h-6 w-6 text-muted-foreground" />
            </label>
          )}
        </div>
      </div>
      <div>
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter product name"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief product description"
        />
      </div>
      <div>
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          placeholder="Enter SKU"
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="basePrice">Price</Label>
          <Input
            id="basePrice"
            type="number"
            step="0.01"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
            placeholder="0.00"
          />
        </div>
        {!formData.hasVariations && (
          <div>
            <Label htmlFor="stock">Stock</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="0"
            />
          </div>
        )}
      </div>
      <div>
        <Label htmlFor="minStock">Min Stock Alert</Label>
        <Input
          id="minStock"
          type="number"
          value={formData.minStock}
          onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
          placeholder="Minimum stock before alert"
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
              <p className="text-sm text-muted-foreground">Select products to add to cart</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-lg border bg-card p-1">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowBarcodeScanner(true)}
                className="gap-2"
              >
                <ScanBarcode className="h-4 w-4" />
                <span className="hidden sm:inline">Scan</span>
              </Button>
              <Button variant="outline" size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
              {/* Mobile Cart Button */}
              <Button 
                className="lg:hidden relative" 
                onClick={() => setShowCart(true)}
              >
                <ShoppingCart className="h-4 w-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Barcode Quick Input */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={barcodeInputRef}
                placeholder="Scan barcode or enter SKU..."
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                onKeyDown={handleBarcodeInputKeyDown}
                className="pl-9"
              />
            </div>
            <Button 
              variant="secondary"
              onClick={() => barcodeInput.trim() && handleBarcodeScanned(barcodeInput)}
              disabled={!barcodeInput.trim()}
            >
              Add
            </Button>
          </div>

          {/* Filters */}
          <FilterBar
            searchPlaceholder="Search products..."
            searchValue={searchQuery}
            onSearchChange={handleSearch}
            filters={[
              {
                key: "category",
                label: "Category",
                value: filters.category || "all",
                onChange: (v) => handleFilter("category", v),
                options: categories.map(cat => ({ value: cat, label: cat })),
              },
              {
                key: "stock",
                label: "Stock",
                value: filters.stock || "all",
                onChange: (v) => handleFilter("stock", v),
                options: [
                  { value: "in", label: "In Stock" },
                  { value: "low", label: "Low Stock" },
                  { value: "out", label: "Out of Stock" },
                ],
              },
            ]}
          />
        </div>

        {/* Products Grid/List */}
        <ScrollArea className="flex-1 p-4 sm:p-6">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredProducts.map(product => {
                const totalStock = getTotalStock(product);
                const isLowStock = totalStock <= product.minStock && totalStock > 0;
                const isOutOfStock = totalStock === 0;

                return (
                  <Card 
                    key={product.id}
                    className={cn(
                      "group cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] overflow-hidden",
                      isOutOfStock && "opacity-60"
                    )}
                    onClick={() => !isOutOfStock && handleProductClick(product)}
                  >
                    <div className="relative aspect-square bg-muted">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      {/* Stock badges */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                      {isLowStock && !isOutOfStock && (
                        <Badge variant="secondary" className="absolute top-2 right-2 bg-orange-500/90 text-white">
                          Low Stock
                        </Badge>
                      )}
                      {product.hasVariations && (
                        <Badge variant="outline" className="absolute top-2 left-2 bg-background/90">
                          Variations
                        </Badge>
                      )}
                      {/* Quick actions */}
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); openEditForm(product); }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="destructive" 
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setIsDeleteOpen(true); }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm truncate">{product.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{product.category}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-primary">
                          {formatCurrency(product.basePrice)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {totalStock} in stock
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredProducts.map(product => {
                const totalStock = getTotalStock(product);
                const isLowStock = totalStock <= product.minStock && totalStock > 0;
                const isOutOfStock = totalStock === 0;

                return (
                  <Card 
                    key={product.id}
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      isOutOfStock && "opacity-60"
                    )}
                    onClick={() => !isOutOfStock && handleProductClick(product)}
                  >
                    <CardContent className="p-3 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium truncate">{product.name}</h3>
                          {product.hasVariations && (
                            <Badge variant="outline" className="shrink-0 text-xs">Variations</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{product.category} • {product.sku}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-primary">{formatCurrency(product.basePrice)}</p>
                        <div className="flex items-center gap-1 justify-end">
                          {isLowStock && <AlertCircle className="h-3 w-3 text-orange-500" />}
                          {isOutOfStock && <AlertCircle className="h-3 w-3 text-destructive" />}
                          <span className={cn(
                            "text-xs",
                            isOutOfStock ? "text-destructive" : isLowStock ? "text-orange-500" : "text-muted-foreground"
                          )}>
                            {totalStock} in stock
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); openEditForm(product); }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="h-8 w-8 text-destructive"
                          onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); setIsDeleteOpen(true); }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Cart Sidebar - Desktop */}
      <div className="hidden lg:flex w-96 border-l bg-card flex-col">
        <CartPanel
          cart={cart}
          cartTotal={cartTotal}
          formatCurrency={formatCurrency}
          memberSearch={memberSearch}
          setMemberSearch={setMemberSearch}
          filteredMembers={filteredMembers}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          handleUpdateCartQuantity={handleUpdateCartQuantity}
          handleRemoveFromCart={handleRemoveFromCart}
          handleCheckout={handleCheckout}
          cashReceived={cashReceived}
          setCashReceived={setCashReceived}
        />
      </div>

      {/* Cart Sidebar - Mobile (Slide-in) */}
      {showCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCart(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card shadow-xl flex flex-col animate-in slide-in-from-right">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Cart</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowCart(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <CartPanel
              cart={cart}
              cartTotal={cartTotal}
              formatCurrency={formatCurrency}
              memberSearch={memberSearch}
              setMemberSearch={setMemberSearch}
              filteredMembers={filteredMembers}
              selectedMember={selectedMember}
              setSelectedMember={setSelectedMember}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              handleUpdateCartQuantity={handleUpdateCartQuantity}
              handleRemoveFromCart={handleRemoveFromCart}
              handleCheckout={handleCheckout}
              cashReceived={cashReceived}
              setCashReceived={setCashReceived}
            />
          </div>
        </div>
      )}

      {/* Variation Selection Dialog */}
      <Dialog open={isVariationSelectOpen} onOpenChange={setIsVariationSelectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Option</DialogTitle>
            <DialogDescription>
              Choose a {selectedProduct?.variations?.[0]?.name.toLowerCase()} for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedProduct?.variations?.map(variation => (
            <div key={variation.id} className="space-y-3">
              <Label className="text-base">{variation.name}</Label>
              <div className="grid grid-cols-2 gap-2">
                {variation.options.map(option => {
                  const finalPrice = (selectedProduct?.basePrice || 0) + option.priceAdjustment;
                  const isOutOfStock = option.stock === 0;
                  
                  return (
                    <Button
                      key={option.id}
                      variant="outline"
                      disabled={isOutOfStock}
                      className={cn(
                        "h-auto py-3 flex-col items-start",
                        isOutOfStock && "opacity-50"
                      )}
                      onClick={() => handleAddToCart(selectedProduct, variation.id, option.id)}
                    >
                      <span className="font-medium">{option.value}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(finalPrice)} • {option.stock} left
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </DialogContent>
      </Dialog>

      {/* Add Product Sheet */}
      <QuickAddSheet
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        title="Add New Product"
        description="Add a new product to your inventory"
        onSubmit={handleAddProduct}
        submitLabel="Add Product"
      >
        <ProductForm />
      </QuickAddSheet>

      {/* Edit Product Sheet */}
      <QuickAddSheet
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        title="Edit Product"
        description="Update product details"
        onSubmit={handleEditProduct}
        submitLabel="Save Changes"
      >
        <ProductForm />
      </QuickAddSheet>

      {/* Delete Confirmation */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Barcode Scanner Dialog */}
      <Dialog open={showBarcodeScanner} onOpenChange={(open) => {
        if (!open && scannerRef.current) {
          scannerRef.current.clear().catch(() => {});
          scannerRef.current = null;
        }
        setShowBarcodeScanner(open);
        if (!open) {
          setBarcodeInput("");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Scan Barcode / QR Code
            </DialogTitle>
            <DialogDescription>
              Position the barcode within the camera frame or enter SKU manually
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Camera Scanner Container */}
            <div className="relative rounded-xl overflow-hidden bg-muted/50 min-h-[200px]">
              <div id="barcode-reader" className="w-full" />
              {/* Loading indicator while scanner initializes */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" id="scanner-loading">
                <div className="text-center text-muted-foreground">
                  <Camera className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm">Initializing camera...</p>
                </div>
              </div>
            </div>
            
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or enter manually</span>
              </div>
            </div>
            
            {/* Manual Input */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ScanBarcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter SKU or barcode..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && barcodeInput.trim()) {
                      handleBarcodeScanned(barcodeInput);
                    }
                  }}
                  className="pl-9 font-mono"
                  autoFocus
                />
              </div>
              <Button 
                onClick={() => barcodeInput.trim() && handleBarcodeScanned(barcodeInput)}
                disabled={!barcodeInput.trim()}
              >
                Add
              </Button>
            </div>

            {/* Quick SKU Examples */}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground">Quick test:</span>
              {["SUP001", "SNK001", "APP001-M"].map((sku) => (
                <button
                  key={sku}
                  onClick={() => handleBarcodeScanned(sku)}
                  className="text-xs px-2 py-1 rounded-md bg-muted hover:bg-muted/80 font-mono transition-colors"
                >
                  {sku}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setShowBarcodeScanner(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Print Dialog */}
      <Dialog open={showReceiptDialog} onOpenChange={setShowReceiptDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-primary" />
              Sale Complete!
            </DialogTitle>
            <DialogDescription>
              Would you like to print or download a receipt?
            </DialogDescription>
          </DialogHeader>
          
          {completedSaleData && (
            <div className="space-y-4">
              {/* Sale Summary */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Receipt No:</span>
                  <span className="font-mono">{completedSaleData.receiptNo}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer:</span>
                  <span>{completedSaleData.member?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment:</span>
                  <span>{completedSaleData.paymentMethod}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(completedSaleData.total)}</span>
                </div>
                {completedSaleData.cashReceived !== undefined && (
                  <>
                    <Separator />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cash Received:</span>
                      <span>{formatCurrency(completedSaleData.cashReceived)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium text-green-600 dark:text-green-400">
                      <span>Change Given:</span>
                      <span>{formatCurrency(completedSaleData.changeDue || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Print Options */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handlePrintReceipt("pos")}
                >
                  <Printer className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium text-sm">Thermal Print</div>
                    <div className="text-xs text-muted-foreground">80mm Receipt</div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-4"
                  onClick={() => handlePrintReceipt("a4")}
                >
                  <Download className="h-6 w-6" />
                  <div className="text-center">
                    <div className="font-medium text-sm">Download PDF</div>
                    <div className="text-xs text-muted-foreground">A4 Format</div>
                  </div>
                </Button>
              </div>

              {/* More Size Options */}
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handlePrintReceipt("a5")}
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  A5 PDF
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => handlePrintReceipt("letter")}
                >
                  <FileText className="h-3.5 w-3.5 mr-1" />
                  Letter PDF
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="secondary" 
              onClick={handleCloseReceiptDialog}
              className="w-full"
            >
              No Thanks, Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Customer type
interface Customer {
  id: string;
  name: string;
  phone?: string;
  isWalkIn?: boolean;
}

// Cart Panel Component
interface CartPanelProps {
  cart: CartItem[];
  cartTotal: number;
  formatCurrency: (amount: number) => string;
  memberSearch: string;
  setMemberSearch: (value: string) => void;
  filteredMembers: Customer[];
  selectedMember: Customer | null;
  setSelectedMember: (member: Customer | null) => void;
  paymentMethod: "cash" | "card" | "bill";
  setPaymentMethod: (method: "cash" | "card" | "bill") => void;
  handleUpdateCartQuantity: (index: number, qty: number) => void;
  handleRemoveFromCart: (index: number) => void;
  handleCheckout: () => void;
  cashReceived: string;
  setCashReceived: (value: string) => void;
}

const CartPanel = ({
  cart,
  cartTotal,
  formatCurrency,
  memberSearch,
  setMemberSearch,
  filteredMembers,
  selectedMember,
  setSelectedMember,
  paymentMethod,
  setPaymentMethod,
  handleUpdateCartQuantity,
  handleRemoveFromCart,
  handleCheckout,
  cashReceived,
  setCashReceived,
}: CartPanelProps) => {
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeDue = cashReceivedNum - cartTotal;
  const canCheckout = cart.length > 0 && selectedMember && (paymentMethod !== "cash" || cashReceivedNum >= cartTotal);

  // Quick cash buttons
  const getQuickCashAmounts = () => {
    const amounts: number[] = [];
    const roundTo = cartTotal < 10 ? 5 : cartTotal < 50 ? 10 : cartTotal < 100 ? 20 : 50;
    let nextRound = Math.ceil(cartTotal / roundTo) * roundTo;
    for (let i = 0; i < 4; i++) {
      if (nextRound > cartTotal) {
        amounts.push(nextRound);
      }
      nextRound += roundTo;
    }
    return amounts.slice(0, 4);
  };
  return (
    <>
      <div className="px-3 py-2.5 border-b">
        <h2 className="font-semibold text-sm flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Current Sale
        </h2>
      </div>

      <Tabs defaultValue="cart" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-3 mt-2 mb-0 grid grid-cols-2">
          <TabsTrigger value="cart">Cart ({cart.length})</TabsTrigger>
          <TabsTrigger value="customer">Customer</TabsTrigger>
        </TabsList>

        <TabsContent value="cart" className="flex-1 overflow-hidden flex flex-col m-0">
          <ScrollArea className="flex-1 px-3 py-2">
            {cart.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Cart is empty</p>
                <p className="text-xs">Click products to add them</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.product.name}</p>
                      {item.selectedVariation && (
                        <p className="text-xs text-muted-foreground">{item.selectedVariation.optionValue}</p>
                      )}
                      <p className="text-sm text-primary font-medium">{formatCurrency(item.unitPrice)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => handleUpdateCartQuantity(index, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => handleUpdateCartQuantity(index, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 shrink-0"
                      onClick={() => handleRemoveFromCart(index)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="customer" className="flex-1 overflow-hidden flex flex-col m-0">
          <ScrollArea className="flex-1 px-3 py-2">
            <CustomerTab
              memberSearch={memberSearch}
              setMemberSearch={setMemberSearch}
              filteredMembers={filteredMembers}
              selectedMember={selectedMember}
              setSelectedMember={setSelectedMember}
            />
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Checkout Section */}
      <div className="border-t px-3 py-3 space-y-3 bg-background">
        {/* Selected Customer */}
        {selectedMember && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10">
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-4 w-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{selectedMember.name}</span>
                  {selectedMember.isWalkIn && (
                    <Badge variant="outline" className="text-xs shrink-0">Walk-in</Badge>
                  )}
                </div>
                {selectedMember.phone && (
                  <span className="text-xs text-muted-foreground">{selectedMember.phone}</span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => setSelectedMember(null)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Payment Method */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={paymentMethod === "cash" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPaymentMethod("cash")}
            className="flex-col h-auto py-2"
          >
            <Wallet className="h-4 w-4 mb-1" />
            <span className="text-xs">Cash</span>
          </Button>
          <Button
            variant={paymentMethod === "card" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPaymentMethod("card")}
            className="flex-col h-auto py-2"
          >
            <CreditCard className="h-4 w-4 mb-1" />
            <span className="text-xs">Card</span>
          </Button>
          <Button
            variant={paymentMethod === "bill" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setPaymentMethod("bill")}
            className="flex-col h-auto py-2"
          >
            <User className="h-4 w-4 mb-1" />
            <span className="text-xs">To Bill</span>
          </Button>
        </div>

        {/* Cash Payment Section */}
        {paymentMethod === "cash" && cart.length > 0 && (
          <div className="space-y-3 p-3 rounded-lg bg-muted/50">
            <div>
              <Label className="text-xs text-muted-foreground">Cash Received</Label>
              <div className="relative mt-1">
                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  className="pl-9 text-lg font-semibold h-11"
                />
              </div>
            </div>
            
            {/* Quick Cash Buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setCashReceived(cartTotal.toFixed(2))}
              >
                Exact
              </Button>
              {getQuickCashAmounts().slice(0, 3).map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => setCashReceived(amount.toFixed(2))}
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>

            {/* Change Due */}
            {cashReceivedNum > 0 && (
              <div className={cn(
                "flex items-center justify-between p-2.5 rounded-lg",
                changeDue >= 0 ? "bg-green-500/10" : "bg-destructive/10"
              )}>
                <span className="text-sm font-medium">
                  {changeDue >= 0 ? "Change Due" : "Amount Short"}
                </span>
                <span className={cn(
                  "text-lg font-bold",
                  changeDue >= 0 ? "text-green-600 dark:text-green-400" : "text-destructive"
                )}>
                  {formatCurrency(Math.abs(changeDue))}
                </span>
              </div>
            )}
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold text-primary">{formatCurrency(cartTotal)}</span>
        </div>

        {/* Checkout Button */}
        <Button 
          className="w-full h-12 text-lg" 
          disabled={!canCheckout}
          onClick={handleCheckout}
        >
          {paymentMethod === "cash" && cashReceivedNum > 0 && changeDue >= 0 
            ? `Complete Sale • Change ${formatCurrency(changeDue)}`
            : "Complete Sale"
          }
        </Button>
      </div>
    </>
  );
};

// Customer Tab Component with Quick Add
interface CustomerTabProps {
  memberSearch: string;
  setMemberSearch: (value: string) => void;
  filteredMembers: Customer[];
  selectedMember: Customer | null;
  setSelectedMember: (member: Customer | null) => void;
}

const CustomerTab = ({
  memberSearch,
  setMemberSearch,
  filteredMembers,
  selectedMember,
  setSelectedMember,
}: CustomerTabProps) => {
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");

  const handleQuickAddCustomer = () => {
    if (!quickName.trim()) {
      toast.error("Please enter a name");
      return;
    }

    const newCustomer: Customer = {
      id: `walkin-${Date.now()}`,
      name: quickName.trim(),
      phone: quickPhone.trim() || undefined,
      isWalkIn: true,
    };

    setSelectedMember(newCustomer);
    setQuickName("");
    setQuickPhone("");
    setShowQuickAdd(false);
    toast.success("Walk-in customer added");
  };

  return (
    <div className="space-y-3">
      {!showQuickAdd ? (
        <>
          {/* Quick Actions - Compact row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setShowQuickAdd(true)}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center shrink-0">
                <UserPlus className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-left leading-tight">Walk-in Customer</span>
            </button>
            
            <button
              onClick={() => {
                const guestMember = filteredMembers.find(m => m.name.toLowerCase().includes('guest'));
                if (guestMember) setSelectedMember(guestMember);
              }}
              className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground text-left leading-tight">Guest Checkout</span>
            </button>
          </div>

          {/* Search with icon */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Member List */}
          <div className="space-y-0.5">
            {filteredMembers.slice(0, 6).map(member => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={cn(
                  "w-full flex items-center gap-2.5 p-2 rounded-lg transition-colors text-left",
                  selectedMember?.id === member.id 
                    ? "bg-primary/10 ring-1 ring-primary/30" 
                    : "hover:bg-muted"
                )}
              >
                <div className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                  selectedMember?.id === member.id 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                )}>
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate leading-tight">{member.name}</p>
                  {member.phone && (
                    <p className="text-xs text-muted-foreground leading-tight">{member.phone}</p>
                  )}
                </div>
                {selectedMember?.id === member.id && (
                  <Check className="h-4 w-4 text-primary shrink-0" />
                )}
              </button>
            ))}
            {filteredMembers.length === 0 && memberSearch && (
              <div className="text-center py-4">
                <User className="h-6 w-6 mx-auto text-muted-foreground/50 mb-1.5" />
                <p className="text-sm text-muted-foreground">No members found</p>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="mt-0.5 h-auto p-0"
                  onClick={() => setShowQuickAdd(true)}
                >
                  Add as walk-in customer
                </Button>
              </div>
            )}
            {filteredMembers.length > 6 && !memberSearch && (
              <p className="text-xs text-center text-muted-foreground pt-1.5">
                Search to find more members
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2.5 pb-2 border-b">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={() => setShowQuickAdd(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <div>
              <h3 className="text-sm font-semibold">New Walk-in Customer</h3>
              <p className="text-xs text-muted-foreground">Quick add for this sale</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <div>
              <Label htmlFor="quick-name" className="text-xs">Customer Name *</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quick-name"
                  placeholder="Enter name"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="pl-9"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quick-phone" className="text-xs">Phone Number</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="quick-phone"
                  placeholder="Optional"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value)}
                  className="pl-9"
                  type="tel"
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full"
            onClick={handleQuickAddCustomer}
          >
            <Check className="h-4 w-4 mr-2" />
            Add & Select Customer
          </Button>
        </div>
      )}
    </div>
  );
};

export default Products;
