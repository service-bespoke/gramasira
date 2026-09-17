import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

/**
 * Convert an image URL to a data URL.
 * Used when the API already provides a QR image.
 */
async function imageUrlToDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.warn("QR image could not be loaded:", response.status);
      return null;
    }

    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        resolve(reader.result as string);
      };

      reader.onerror = () => {
        resolve(null);
      };

      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("QR image loading error:", error);
    return null;
  }
}

/**
 * Generate QR image from a UPI URL / QR data.
 */
async function generateQrDataUrl(value: string): Promise<string | null> {
  try {
    if (!value) {
      return null;
    }

    return await QRCode.toDataURL(value, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 500,
      type: "image/png",
    });
  } catch (error) {
    console.error("QR generation error:", error);
    return null;
  }
}

/**
 * Find QR/payment information from the bill object.
 *
 * Supports several possible field names so the PDF will work
 * with the existing API without forcing a database change.
 */
function getQrValue(bill: any): string | null {
  const possibleValues = [
    bill.upi_url,
    bill.upi_link,
    bill.upi_uri,
    bill.upi_string,
    bill.qr_data,
    bill.qr_text,
    bill.payment_url,
    bill.payment_link,
  ];

  for (const value of possibleValues) {
    if (value && typeof value === "string") {
      return value.trim();
    }
  }

  return null;
}

/**
 * Find an existing QR image URL.
 */
function getQrImageUrl(bill: any): string | null {
  const possibleValues = [
    bill.qr_code,
    bill.qr_image,
    bill.qr_image_url,
    bill.qrcode,
    bill.qr_url,
  ];

  for (const value of possibleValues) {
    if (value && typeof value === "string") {
      const trimmed = value.trim();

      // Don't treat UPI strings as image URLs.
      if (
        trimmed.startsWith("upi://") ||
        trimmed.startsWith("upi%3A") ||
        (trimmed.startsWith("http://") === false &&
          trimmed.startsWith("https://") === false &&
          trimmed.startsWith("data:image/") === false)
      ) {
        continue;
      }

      return trimmed;
    }
  }

  return null;
}

export async function generateBillPdf(data: any) {
  const bill = data.bill;
  const details = data.details ?? [];
  const funds = data.funds ?? [];

  const doc = new jsPDF("p", "mm", "a4");

  const format = (value: any) =>
    Number(value ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ============================================================
  // HEADER
  // ============================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);

  doc.text("GRAMASIRA WATER SUPPLY", 105, 18, {
    align: "center",
  });

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  doc.text("Water Bill Receipt", 105, 26, {
    align: "center",
  });

  // ============================================================
  // CUSTOMER
  // ============================================================

  let y = 38;

  doc.setFont("helvetica", "bold");
  doc.text("Bill Information", 14, y);

  y += 8;

  doc.setFont("helvetica", "normal");

  doc.text(`Bill No : ${bill.bill_no ?? ""}`, 14, y);

  doc.text(`Consumer No : ${bill.consumer_no ?? ""}`, 120, y);

  y += 7;

  doc.text(`Customer : ${bill.customer_name ?? ""}`, 14, y);

  doc.text(`Mobile : ${bill.mobile ?? ""}`, 120, y);

  y += 7;

  doc.text("Address :", 14, y);

  y += 6;

  const addressLines = [bill.address1, bill.address2, bill.address3].filter(
    Boolean,
  );

  doc.text(addressLines.length > 0 ? addressLines.join("\n") : "-", 20, y);

  y += 22;

  // ============================================================
  // METER READING
  // ============================================================

  doc.setFont("helvetica", "bold");

  doc.text("Meter Reading", 14, y);

  y += 5;

  autoTable(doc, {
    startY: y,

    head: [["Previous", "Current", "Units"]],

    body: [
      [
        format(bill.previous_reading),
        format(bill.current_reading),
        format(bill.units),
      ],
    ],

    theme: "grid",
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ============================================================
  // SLAB DETAILS
  // ============================================================

  doc.setFont("helvetica", "bold");

  doc.text("Consumption Charges", 14, y);

  y += 5;

  autoTable(doc, {
    startY: y,

    head: [["Slab", "Units", "Rate", "Amount"]],

    body: details.map((d: any) => [
      `${d.slab_from ?? ""} - ${d.slab_to ?? ""}`,
      format(d.units),
      `Rs. ${format(d.rate)}`,
      `Rs. ${format(d.amount)}`,
    ]),

    theme: "striped",
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ============================================================
  // ADDITIONAL FUNDS
  // ============================================================

  if (funds.length > 0) {
    doc.setFont("helvetica", "bold");

    doc.text("Additional Funds", 14, y);

    y += 5;

    autoTable(doc, {
      startY: y,

      head: [["Fund", "Amount"]],

      body: funds.map((f: any) => [
        f.fund_name ?? "",
        `Rs. ${format(f.amount)}`,
      ]),

      theme: "striped",
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ============================================================
  // SUMMARY
  // ============================================================

  autoTable(doc, {
    startY: y,

    body: [
      ["Water Charge", `Rs. ${format(bill.water_charge)}`],

      ["Fixed Charge", `Rs. ${format(bill.fixed_charge)}`],

      ["Meter Charge", `Rs. ${format(bill.meter_charge)}`],

      ["Maintenance", `Rs. ${format(bill.maintenance_charge)}`],

      ["Penalty", `Rs. ${format(bill.penalty)}`],

      ["Discount", `Rs. ${format(bill.discount)}`],

      ["TOTAL", `Rs. ${format(bill.total_amount)}`],
    ],

    theme: "grid",

    styles: {
      fontSize: 11,
    },

    columnStyles: {
      1: {
        halign: "right",
      },
    },

    didParseCell: function (hook) {
      if (hook.row.index === 6) {
        hook.cell.styles.fontStyle = "bold";
        hook.cell.styles.fontSize = 13;
      }
    },
  });

  y = (doc as any).lastAutoTable.finalY + 12;

  // ============================================================
  // PAYMENT QR CODE
  // ============================================================

  let qrDataUrl: string | null = null;

  try {
    /*
     * First check whether the API already provides a QR IMAGE.
     */
    const qrImageUrl = getQrImageUrl(bill);

    if (qrImageUrl) {
      if (qrImageUrl.startsWith("data:image/")) {
        qrDataUrl = qrImageUrl;
      } else {
        qrDataUrl = await imageUrlToDataUrl(qrImageUrl);
      }
    }

    /*
     * If there is no QR image, generate one from the UPI/payment data.
     */
    if (!qrDataUrl) {
      const qrValue = getQrValue(bill);

      if (qrValue) {
        qrDataUrl = await generateQrDataUrl(qrValue);
      }
    }
  } catch (error) {
    console.error("QR processing failed:", error);
  }

  // ============================================================
  // QR DISPLAY
  // ============================================================

  if (qrDataUrl) {
    /*
     * Keep enough space for QR + payment information.
     */
    if (y > 235) {
      doc.addPage();
      y = 20;
    }

    const qrSize = 42;

    const qrX = 84;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);

    doc.text("SCAN TO PAY", 105, y, {
      align: "center",
    });

    y += 4;

    doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);

    y += qrSize + 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    const upiValue = bill.upi_id ?? bill.upi ?? bill.upi_vpa ?? "";

    if (upiValue) {
      doc.text(`UPI: ${upiValue}`, 105, y, {
        align: "center",
      });

      y += 5;
    }

    doc.text(`Amount: Rs. ${format(bill.total_amount)}`, 105, y, {
      align: "center",
    });

    y += 10;
  }

  // ============================================================
  // DUE DATE
  // ============================================================

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);

  doc.text(`Due Date : ${bill.due_date ?? ""}`, 14, y);

  y += 12;

  // ============================================================
  // FOOTER
  // ============================================================

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  doc.text("Thank you for using Gramasira Water Supply", 105, y, {
    align: "center",
  });

  doc.text("Computer Generated Bill", 105, y + 6, {
    align: "center",
  });

  return doc;
}
