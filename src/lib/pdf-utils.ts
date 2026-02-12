import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Gym branding configuration - Professional muted colors
export const gymConfig = {
  name: "FitZone Gym",
  tagline: "Transform Your Body, Transform Your Life",
  address: "123 Fitness Avenue, Downtown, New York, NY 10001",
  phone: "+1 (555) 123-4567",
  email: "info@fitzonegym.com",
  website: "www.fitzonegym.com",
  primaryColor: [55, 65, 81] as [number, number, number], // Professional gray
  secondaryColor: [17, 24, 39] as [number, number, number], // Dark charcoal
  accentColor: [75, 85, 99] as [number, number, number], // Medium gray
};

interface LetterheadOptions {
  doc: jsPDF;
  title: string;
  subtitle?: string;
}

export function addLetterhead({ doc, title, subtitle }: LetterheadOptions): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Clean white header with subtle border
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 42, "F");
  
  // Bottom border line
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(0, 42, pageWidth, 42);
  
  // Gym name - dark professional
  doc.setTextColor(...gymConfig.secondaryColor);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(gymConfig.name, 20, 18);
  
  // Tagline - muted gray
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(gymConfig.tagline, 20, 26);
  
  // Contact info (right side) - subtle gray
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(gymConfig.phone, pageWidth - 20, 14, { align: "right" });
  doc.text(gymConfig.email, pageWidth - 20, 20, { align: "right" });
  doc.text(gymConfig.website, pageWidth - 20, 26, { align: "right" });
  
  // Address - smaller, muted
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(gymConfig.address, 20, 36);
  
  // Document title
  doc.setTextColor(...gymConfig.secondaryColor);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(title, pageWidth / 2, 56, { align: "center" });
  
  let yPosition = 61;
  
  // Subtitle if provided
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    doc.text(subtitle, pageWidth / 2, yPosition + 3, { align: "center" });
    yPosition += 10;
  }
  
  return yPosition + 10;
}

interface ClientDetails {
  name: string;
  memberId?: string;
  phone?: string;
  email?: string;
  membership?: string;
  branch?: string;
}

export function addClientSection(doc: jsPDF, client: ClientDetails, yPosition: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Client section box - subtle border only
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, yPosition, pageWidth - 40, 35, 2, 2, "FD");
  
  // Client label - muted
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(107, 114, 128);
  doc.text("CLIENT DETAILS", 25, yPosition + 8);
  
  // Client info
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gymConfig.secondaryColor);
  doc.text(client.name, 25, yPosition + 16);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  
  const leftColumn = 25;
  const rightColumn = pageWidth / 2 + 10;
  
  if (client.memberId) {
    doc.text(`Member ID: ${client.memberId}`, leftColumn, yPosition + 23);
  }
  if (client.phone) {
    doc.text(`Phone: ${client.phone}`, leftColumn, yPosition + 29);
  }
  if (client.membership) {
    doc.text(`Plan: ${client.membership}`, rightColumn, yPosition + 23);
  }
  if (client.branch) {
    doc.text(`Branch: ${client.branch}`, rightColumn, yPosition + 29);
  }
  
  return yPosition + 42;
}

export function addFooter(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Footer line
  doc.setDrawColor(226, 232, 240);
  doc.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
  
  // Footer text
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("Thank you for choosing " + gymConfig.name, pageWidth / 2, pageHeight - 18, { align: "center" });
  doc.text(`Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, pageHeight - 12, { align: "center" });
  
  // Page number
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, pageHeight - 8, { align: "right" });
  }
}

// Receipt generation types
export type ReceiptSize = "pos" | "a4" | "a5" | "letter";

interface ReceiptData {
  receiptNo: string;
  date: string;
  time?: string;
  memberName: string;
  memberId?: string;
  phone?: string;
  email?: string;
  description: string;
  amount: string;
  paymentMethod: string;
  status: string;
  branch?: string;
  items?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: string;
    total: string;
  }>;
  subtotal?: string;
  tax?: string;
  discount?: string;
  cashier?: string;
}

export function generateReceipt(data: ReceiptData, size: ReceiptSize = "a4"): jsPDF {
  // Page dimensions based on size
  const dimensions: Record<ReceiptSize, { width: number; height: number; unit: "mm" | "in" }> = {
    pos: { width: 80, height: 200, unit: "mm" }, // 80mm thermal receipt
    a4: { width: 210, height: 297, unit: "mm" },
    a5: { width: 148, height: 210, unit: "mm" },
    letter: { width: 8.5, height: 11, unit: "in" },
  };
  
  const { width, height, unit } = dimensions[size];
  const doc = new jsPDF({
    orientation: size === "pos" ? "portrait" : "portrait",
    unit,
    format: size === "pos" ? [width, height] : size === "letter" ? "letter" : [width, height],
  });
  
  const pageWidth = doc.internal.pageSize.getWidth();
  
  if (size === "pos") {
    return generatePOSReceipt(doc, data, pageWidth);
  }
  
  return generateFullReceipt(doc, data, size);
}

function generatePOSReceipt(doc: jsPDF, data: ReceiptData, pageWidth: number): jsPDF {
  let y = 5;
  const centerX = pageWidth / 2;
  const leftMargin = 3;
  const rightMargin = pageWidth - 3;
  
  // Gym name
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(gymConfig.name, centerX, y, { align: "center" });
  y += 5;
  
  // Address (smaller)
  doc.setFontSize(6);
  doc.setFont("helvetica", "normal");
  const addressLines = doc.splitTextToSize(gymConfig.address, pageWidth - 10);
  doc.text(addressLines, centerX, y, { align: "center" });
  y += addressLines.length * 3 + 2;
  
  // Contact
  doc.text(`Tel: ${gymConfig.phone}`, centerX, y, { align: "center" });
  y += 5;
  
  // Dashed separator
  doc.setLineDashPattern([1, 1], 0);
  doc.line(leftMargin, y, rightMargin, y);
  y += 5;
  
  // Receipt title
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT RECEIPT", centerX, y, { align: "center" });
  y += 5;
  
  // Receipt number & date
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`No: ${data.receiptNo}`, leftMargin, y);
  doc.text(data.date, rightMargin, y, { align: "right" });
  y += 4;
  if (data.time) {
    doc.text(`Time: ${data.time}`, leftMargin, y);
  }
  y += 5;
  
  // Separator
  doc.line(leftMargin, y, rightMargin, y);
  y += 4;
  
  // Customer
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Customer:", leftMargin, y);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.text(data.memberName, leftMargin, y);
  y += 4;
  if (data.memberId) {
    doc.text(`ID: ${data.memberId}`, leftMargin, y);
    y += 4;
  }
  y += 2;
  
  // Separator
  doc.line(leftMargin, y, rightMargin, y);
  y += 5;
  
  // Items or single description
  doc.setFontSize(7);
  if (data.items && data.items.length > 0) {
    data.items.forEach((item) => {
      doc.text(item.description, leftMargin, y);
      doc.text(item.total, rightMargin, y, { align: "right" });
      y += 4;
    });
  } else {
    const descLines = doc.splitTextToSize(data.description, pageWidth - 25);
    doc.text(descLines, leftMargin, y);
    y += descLines.length * 3;
    doc.text(data.amount, rightMargin, y, { align: "right" });
    y += 5;
  }
  
  // Separator
  y += 2;
  doc.line(leftMargin, y, rightMargin, y);
  y += 5;
  
  // Total
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", leftMargin, y);
  doc.text(data.amount, rightMargin, y, { align: "right" });
  y += 6;
  
  // Payment method
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text(`Payment: ${data.paymentMethod}`, leftMargin, y);
  y += 4;
  doc.text(`Status: ${data.status.toUpperCase()}`, leftMargin, y);
  y += 6;
  
  // Separator
  doc.setLineDashPattern([1, 1], 0);
  doc.line(leftMargin, y, rightMargin, y);
  y += 5;
  
  // Thank you message
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.text("Thank you for your payment!", centerX, y, { align: "center" });
  y += 4;
  doc.setFontSize(6);
  doc.text("Keep this receipt for your records", centerX, y, { align: "center" });
  
  return doc;
}

function generateFullReceipt(doc: jsPDF, data: ReceiptData, size: ReceiptSize): jsPDF {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add letterhead
  let y = addLetterhead({ doc, title: "PAYMENT RECEIPT", subtitle: `Receipt No: ${data.receiptNo}` });
  
  // Add client section
  y = addClientSection(doc, {
    name: data.memberName,
    memberId: data.memberId,
    phone: data.phone,
    email: data.email,
    branch: data.branch,
  }, y);
  
  // Receipt details
  y += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  
  const col1 = 25;
  const col2 = pageWidth / 2 + 10;
  
  doc.text(`Date: ${data.date}`, col1, y);
  if (data.time) doc.text(`Time: ${data.time}`, col2, y);
  y += 8;
  
  // Items table or single item
  if (data.items && data.items.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [["Description", "Qty", "Unit Price", "Total"]],
      body: data.items.map((item) => [
        item.description,
        item.quantity?.toString() || "1",
        item.unitPrice || "-",
        item.total,
      ]),
      theme: "striped",
      headStyles: { fillColor: gymConfig.primaryColor, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  } else {
    autoTable(doc, {
      startY: y,
      head: [["Description", "Amount"]],
      body: [[data.description, data.amount]],
      theme: "striped",
      headStyles: { fillColor: gymConfig.primaryColor, fontSize: 10 },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: "auto" },
        1: { cellWidth: 40, halign: "right" },
      },
      margin: { left: 20, right: 20 },
    });
    y = (doc as any).lastAutoTable.finalY + 5;
  }
  
  // Totals section
  const totalsX = pageWidth - 80;
  
  if (data.subtotal) {
    doc.setFontSize(9);
    doc.text("Subtotal:", totalsX, y);
    doc.text(data.subtotal, pageWidth - 25, y, { align: "right" });
    y += 5;
  }
  if (data.tax) {
    doc.text("Tax:", totalsX, y);
    doc.text(data.tax, pageWidth - 25, y, { align: "right" });
    y += 5;
  }
  if (data.discount) {
    doc.text("Discount:", totalsX, y);
    doc.text(`-${data.discount}`, pageWidth - 25, y, { align: "right" });
    y += 5;
  }
  
  // Total
  y += 2;
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(totalsX - 5, y - 5, pageWidth - totalsX - 15, 15, 2, 2, "FD");
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gymConfig.secondaryColor);
  doc.text("TOTAL:", totalsX, y + 5);
  doc.text(data.amount, pageWidth - 25, y + 5, { align: "right" });
  
  y += 20;
  
  // Payment info box - subtle professional style
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, y, pageWidth - 40, 20, 2, 2, "FD");
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gymConfig.primaryColor);
  doc.text(`Payment Method: ${data.paymentMethod}`, 30, y + 8);
  doc.text(`Status: ${data.status.toUpperCase()}`, 30, y + 15);
  
  if (data.cashier) {
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text(`Cashier: ${data.cashier}`, pageWidth - 30, y + 12, { align: "right" });
  }
  
  // Footer
  addFooter(doc);
  
  return doc;
}

// Workout PDF generation
interface WorkoutDay {
  name: string;
  exercises: Array<{
    exercise: string;
    sets: string;
    repetitions: string;
    rest: string;
    note: string;
  }>;
}

interface WorkoutPDFData {
  name: string;
  category: string;
  difficulty: string;
  duration: string;
  description?: string;
  targetMuscles?: string;
  days: WorkoutDay[];
  client?: ClientDetails;
  trainerName?: string;
  startDate?: string;
  endDate?: string;
}

export function generateWorkoutPDF(data: WorkoutPDFData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add letterhead
  let y = addLetterhead({
    doc,
    title: data.name,
    subtitle: `${data.category} • ${data.difficulty} • ${data.duration}`,
  });
  
  // Add client section if provided
  if (data.client) {
    y = addClientSection(doc, data.client, y);
  }
  
  // Program info
  if (data.description) {
    y += 3;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(data.description, pageWidth - 40);
    doc.text(descLines, 20, y);
    y += descLines.length * 4 + 5;
  }
  
  // Program dates if provided
  if (data.startDate || data.endDate || data.trainerName) {
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, y, pageWidth - 40, 12, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    
    let infoText = [];
    if (data.startDate) infoText.push(`Start: ${data.startDate}`);
    if (data.endDate) infoText.push(`End: ${data.endDate}`);
    if (data.trainerName) infoText.push(`Trainer: ${data.trainerName}`);
    
    doc.text(infoText.join("   |   "), pageWidth / 2, y + 7, { align: "center" });
    y += 18;
  }
  
  // Each day
  data.days.forEach((day, dayIndex) => {
    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    
    // Day header - clean professional style
    doc.setFillColor(...gymConfig.primaryColor);
    doc.roundedRect(20, y, pageWidth - 40, 10, 2, 2, "F");
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`${day.name}`, 25, y + 7);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${day.exercises.length} exercises`, pageWidth - 25, y + 7, { align: "right" });
    
    y += 14;
    
    if (day.exercises.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["#", "Exercise", "Sets", "Reps", "Rest", "Notes"]],
        body: day.exercises.map((ex, idx) => [
          (idx + 1).toString(),
          ex.exercise,
          ex.sets,
          ex.repetitions,
          ex.rest,
          ex.note || "-",
        ]),
        theme: "plain",
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: gymConfig.secondaryColor,
          fontSize: 8,
          fontStyle: "bold",
        },
        bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 45 },
          2: { cellWidth: 15, halign: "center" },
          3: { cellWidth: 20, halign: "center" },
          4: { cellWidth: 20, halign: "center" },
          5: { cellWidth: "auto" },
        },
        margin: { left: 20, right: 20 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      });
      
      y = (doc as any).lastAutoTable.finalY + 8;
    } else {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(156, 163, 175);
      doc.text("No exercises added", 25, y + 5);
      y += 12;
    }
  });
  
  // Add footer
  addFooter(doc);
  
  return doc;
}

// Nutrition/Diet PDF generation
interface NutritionDay {
  name: string;
  meals: Array<{
    food: string;
    portion: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    note: string;
  }>;
}

interface NutritionPDFData {
  name: string;
  targetCalories: string;
  description?: string;
  days: NutritionDay[];
  client?: ClientDetails;
  trainerName?: string;
  startDate?: string;
  endDate?: string;
}

export function generateNutritionPDF(data: NutritionPDFData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add letterhead
  let y = addLetterhead({
    doc,
    title: data.name,
    subtitle: `Target: ${data.targetCalories} kcal/day`,
  });
  
  // Add client section if provided
  if (data.client) {
    y = addClientSection(doc, data.client, y);
  }
  
  // Program description
  if (data.description) {
    y += 3;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const descLines = doc.splitTextToSize(data.description, pageWidth - 40);
    doc.text(descLines, 20, y);
    y += descLines.length * 4 + 5;
  }
  
  // Program dates if provided
  if (data.startDate || data.endDate || data.trainerName) {
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, y, pageWidth - 40, 12, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(107, 114, 128);
    
    let infoText = [];
    if (data.startDate) infoText.push(`Start: ${data.startDate}`);
    if (data.endDate) infoText.push(`End: ${data.endDate}`);
    if (data.trainerName) infoText.push(`Assigned By: ${data.trainerName}`);
    
    doc.text(infoText.join("   |   "), pageWidth / 2, y + 7, { align: "center" });
    y += 18;
  }
  
  // Each day
  data.days.forEach((day, dayIndex) => {
    // Check if we need a new page
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    
    // Calculate day totals
    const dayCalories = day.meals.reduce((sum, m) => sum + (parseInt(m.calories) || 0), 0);
    const dayProtein = day.meals.reduce((sum, m) => sum + (parseInt(m.protein) || 0), 0);
    const dayCarbs = day.meals.reduce((sum, m) => sum + (parseInt(m.carbs) || 0), 0);
    const dayFat = day.meals.reduce((sum, m) => sum + (parseInt(m.fat) || 0), 0);
    
    // Day header - clean professional style with green for nutrition
    doc.setFillColor(34, 139, 34); // Forest green for nutrition
    doc.roundedRect(20, y, pageWidth - 40, 10, 2, 2, "F");
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(`${day.name}`, 25, y + 7);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`${day.meals.length} meals • ${dayCalories} kcal`, pageWidth - 25, y + 7, { align: "right" });
    
    y += 14;
    
    if (day.meals.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["#", "Food", "Portion", "Kcal", "P(g)", "C(g)", "F(g)", "Note"]],
        body: day.meals.map((meal, idx) => [
          (idx + 1).toString(),
          meal.food,
          meal.portion,
          meal.calories,
          meal.protein || "-",
          meal.carbs || "-",
          meal.fat || "-",
          meal.note || "-",
        ]),
        foot: [[
          "",
          "Day Total",
          "",
          dayCalories.toString(),
          dayProtein.toString(),
          dayCarbs.toString(),
          dayFat.toString(),
          "",
        ]],
        theme: "plain",
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: gymConfig.secondaryColor,
          fontSize: 8,
          fontStyle: "bold",
        },
        bodyStyles: { fontSize: 8, textColor: [55, 65, 81] },
        footStyles: {
          fillColor: [243, 244, 246],
          textColor: gymConfig.secondaryColor,
          fontSize: 8,
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 8, halign: "center" },
          1: { cellWidth: 40 },
          2: { cellWidth: 22 },
          3: { cellWidth: 15, halign: "center" },
          4: { cellWidth: 12, halign: "center" },
          5: { cellWidth: 12, halign: "center" },
          6: { cellWidth: 12, halign: "center" },
          7: { cellWidth: "auto" },
        },
        margin: { left: 20, right: 20 },
        alternateRowStyles: { fillColor: [250, 250, 250] },
      });
      
      y = (doc as any).lastAutoTable.finalY + 8;
    } else {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(156, 163, 175);
      doc.text("No meals added", 25, y + 5);
      y += 12;
    }
  });
  
  // Add footer
  addFooter(doc);
  
  return doc;
}

// Progress Report PDF generation
interface ProgressMeasurement {
  date: string;
  weight: number;
  bodyFat: number;
  muscleMass: number;
  chest: number;
  waist: number;
  hips: number;
  arms: number;
  thighs: number;
}

interface ProgressPDFData {
  memberName: string;
  memberId: string;
  startDate: string;
  endDate: string;
  measurements: ProgressMeasurement[];
  summary?: {
    weightChange: number;
    bodyFatChange: number;
    muscleMassChange: number;
    waistChange: number;
  };
  chartImage?: string;
  progressPhotos?: string[];
}

export function generateProgressPDF(data: ProgressPDFData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Add letterhead
  let y = addLetterhead({
    doc,
    title: "Member Progress Report",
    subtitle: `Tracking Period: ${data.startDate} - ${data.endDate}`,
  });
  
  // Add client section
  y = addClientSection(doc, {
    name: data.memberName,
    memberId: data.memberId,
  }, y);
  
  // Summary section with colored progress indicators
  if (data.summary && data.measurements.length >= 2) {
    y += 8;
    
    // Section title with accent bar
    doc.setFillColor(34, 197, 94); // Green accent
    doc.rect(20, y, 4, 12, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gymConfig.secondaryColor);
    doc.text("Progress Summary", 28, y + 8);
    y += 18;
    
    // Progress cards - 4 columns
    const cardWidth = (pageWidth - 50) / 4;
    const cardHeight = 32;
    const cardGap = 5;
    const startX = 20;
    
    const formatChange = (value: number, unit: string) => {
      const sign = value > 0 ? "+" : "";
      return `${sign}${value.toFixed(1)}${unit}`;
    };
    
    const progressItems = [
      { 
        label: "Weight", 
        value: formatChange(data.summary.weightChange, " kg"),
        isPositive: data.summary.weightChange <= 0, // Weight loss is typically positive
        icon: "↓"
      },
      { 
        label: "Body Fat", 
        value: formatChange(data.summary.bodyFatChange, "%"),
        isPositive: data.summary.bodyFatChange <= 0,
        icon: "%"
      },
      { 
        label: "Muscle Mass", 
        value: formatChange(data.summary.muscleMassChange, " kg"),
        isPositive: data.summary.muscleMassChange >= 0, // Muscle gain is positive
        icon: "+"
      },
      { 
        label: "Waist", 
        value: formatChange(data.summary.waistChange, " cm"),
        isPositive: data.summary.waistChange <= 0,
        icon: "○"
      },
    ];
    
    progressItems.forEach((item, index) => {
      const x = startX + (cardWidth + cardGap) * index;
      
      // Card background with subtle gradient effect
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(229, 231, 235);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, "FD");
      
      // Colored indicator bar at top
      const barColor: [number, number, number] = item.isPositive ? [34, 197, 94] : [239, 68, 68];
      doc.setFillColor(...barColor);
      doc.roundedRect(x, y, cardWidth, 3, 3, 3, "F");
      doc.setFillColor(250, 250, 250);
      doc.rect(x, y + 1.5, cardWidth, 1.5, "F"); // Cover bottom rounded corners
      
      // Label
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text(item.label, x + cardWidth / 2, y + 12, { align: "center" });
      
      // Value with color
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...barColor);
      doc.text(item.value, x + cardWidth / 2, y + 24, { align: "center" });
    });
    
    y += cardHeight + 12;
  }
  
  // Add chart image if provided
  if (data.chartImage) {
    // Section title with accent bar
    doc.setFillColor(59, 130, 246); // Blue accent
    doc.rect(20, y, 4, 12, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gymConfig.secondaryColor);
    doc.text("Progress Visualization", 28, y + 8);
    y += 16;
    
    // Chart container with border
    const chartWidth = pageWidth - 40;
    const chartHeight = 65;
    
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, y, chartWidth, chartHeight + 8, 3, 3, "FD");
    
    // Add chart image
    doc.addImage(data.chartImage, "PNG", 24, y + 4, chartWidth - 8, chartHeight);
    y += chartHeight + 18;
  }
  
  // Progress photos section
  if (data.progressPhotos && data.progressPhotos.length > 0) {
    if (y > 180) {
      doc.addPage();
      y = 20;
    }
    
    // Section title with accent bar
    doc.setFillColor(236, 72, 153); // Pink accent
    doc.rect(20, y, 4, 12, "F");
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...gymConfig.secondaryColor);
    doc.text("Progress Photos", 28, y + 8);
    y += 18;
    
    const photosPerRow = 3;
    const photoWidth = (pageWidth - 40 - (photosPerRow - 1) * 5) / photosPerRow;
    const photoHeight = photoWidth * 1.33;
    
    data.progressPhotos.forEach((photoData, index) => {
      const col = index % photosPerRow;
      const row = Math.floor(index / photosPerRow);
      
      if (row > 0 && col === 0 && y + photoHeight > doc.internal.pageSize.getHeight() - 30) {
        doc.addPage();
        y = 20;
      }
      
      const x = 20 + col * (photoWidth + 5);
      const photoY = y + row * (photoHeight + 8);
      
      try {
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.5);
        doc.roundedRect(x, photoY, photoWidth, photoHeight, 3, 3, "S");
        doc.addImage(photoData, "JPEG", x + 1, photoY + 1, photoWidth - 2, photoHeight - 2);
      } catch {
        // Skip photos that fail to render
      }
    });
    
    const totalRows = Math.ceil(data.progressPhotos.length / photosPerRow);
    y += totalRows * (photoHeight + 8) + 5;
  }
  
  // Check if we need a new page for the table
  if (y > 200) {
    doc.addPage();
    y = 20;
  }
  
  // Measurements table section
  // Section title with accent bar
  doc.setFillColor(168, 85, 247); // Purple accent
  doc.rect(20, y, 4, 12, "F");
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...gymConfig.secondaryColor);
  doc.text("Measurement History", 28, y + 8);
  y += 16;
  
  if (data.measurements.length > 0) {
    // Get first and last measurements for comparison
    const latestMeasurement = data.measurements[0];
    const oldestMeasurement = data.measurements[data.measurements.length - 1];
    
    autoTable(doc, {
      startY: y,
      head: [["Date", "Weight", "Body Fat", "Muscle", "Chest", "Waist", "Hips", "Arms", "Thighs"]],
      body: data.measurements.map((m, index) => [
        m.date,
        `${m.weight} kg`,
        `${m.bodyFat}%`,
        `${m.muscleMass} kg`,
        `${m.chest} cm`,
        `${m.waist} cm`,
        `${m.hips} cm`,
        `${m.arms} cm`,
        `${m.thighs} cm`,
      ]),
      theme: "plain",
      headStyles: {
        fillColor: [243, 244, 246],
        textColor: gymConfig.secondaryColor,
        fontSize: 8,
        fontStyle: "bold",
        halign: "center",
        cellPadding: 4,
      },
      bodyStyles: { 
        fontSize: 8, 
        halign: "center",
        cellPadding: 3,
        textColor: [55, 65, 81],
      },
      columnStyles: {
        0: { cellWidth: 24, fontStyle: "bold" },
        1: { cellWidth: 18 },
        2: { cellWidth: 18 },
        3: { cellWidth: 18 },
        4: { cellWidth: 16 },
        5: { cellWidth: 16 },
        6: { cellWidth: 16 },
        7: { cellWidth: 16 },
        8: { cellWidth: 16 },
      },
      margin: { left: 20, right: 20 },
      alternateRowStyles: { fillColor: [250, 251, 252] },
      didDrawCell: (cellData) => {
        // Highlight first row (latest measurement)
        if (cellData.row.index === 0 && cellData.section === 'body') {
          doc.setFillColor(220, 252, 231); // Light green
          doc.rect(cellData.cell.x, cellData.cell.y, cellData.cell.width, cellData.cell.height, "F");
          doc.setTextColor(22, 163, 74);
          doc.setFontSize(8);
          doc.setFont("helvetica", "bold");
          doc.text(
            String(cellData.cell.text), 
            cellData.cell.x + cellData.cell.width / 2, 
            cellData.cell.y + cellData.cell.height / 2 + 1,
            { align: "center" }
          );
        }
      },
    });
    
    y = (doc as any).lastAutoTable.finalY + 8;
    
    // Add legend
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(107, 114, 128);
    doc.setFillColor(220, 252, 231);
    doc.roundedRect(20, y, 8, 4, 1, 1, "F");
    doc.text("Latest measurement", 30, y + 3);
    
  } else {
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(20, y, pageWidth - 40, 25, 3, 3, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(156, 163, 175);
    doc.text("No measurements recorded in this period", pageWidth / 2, y + 14, { align: "center" });
  }
  
  // Add footer
  addFooter(doc);
  
  return doc;
}
