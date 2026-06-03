import jsPDF from "jspdf";

interface CartItem {
  name: string;
  icon: any;
  price: number | null;
  unit: string;
  qty: number;
  note?: string;
}

export function generateOrderPdf(items: CartItem[], totalFixed: number, hasMarketPrice: boolean) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Luchiz Farm", pageWidth / 2, y, { align: "center" });
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Fresh from Chisamba, Delivered to Kabwe & Beyond", pageWidth / 2, y, { align: "center" });
  y += 6;
  doc.text("WhatsApp: +260 979 654 602", pageWidth / 2, y, { align: "center" });
  y += 10;

  // Line
  doc.setDrawColor(100, 160, 80);
  doc.setLineWidth(0.5);
  doc.line(20, y, pageWidth - 20, y);
  y += 10;

  // Order title
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Order Summary", 20, y);
  y += 4;

  // Date
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleDateString("en-ZM", { dateStyle: "long" })}`, 20, y + 4);
  y += 12;

  // Table header
  doc.setFillColor(240, 240, 235);
  doc.rect(20, y, pageWidth - 40, 8, "F");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Item", 24, y + 6);
  doc.text("Qty", 110, y + 6);
  doc.text("Unit Price", 130, y + 6);
  doc.text("Subtotal", 165, y + 6, { align: "right" });
  y += 12;

  // Items
  doc.setFont("helvetica", "normal");
  for (const item of items) {
    const priceStr = item.price ? `K${item.price}/${item.unit}` : "Market price";
    const subtotalStr = item.price ? `K${item.price * item.qty}` : "TBD";

    doc.text(item.name, 24, y);
    doc.text(String(item.qty), 114, y);
    doc.text(priceStr, 130, y);
    doc.text(subtotalStr, 165, y, { align: "right" });
    y += 8;

    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }

  // Total line
  y += 4;
  doc.setDrawColor(100, 160, 80);
  doc.line(20, y, pageWidth - 20, y);
  y += 8;

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 24, y);
  doc.text(`K${totalFixed}`, 165, y, { align: "right" });
  y += 6;

  if (hasMarketPrice) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.text("+ market price items (to be confirmed)", 24, y);
    y += 8;
  }

  // Footer
  y += 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text("If you ate today, thank a farmer.", pageWidth / 2, y, { align: "center" });

  doc.save("Luchiz_Farm_Order.pdf");
}
