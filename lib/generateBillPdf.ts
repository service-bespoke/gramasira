import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";

export async function generateBillPdf(data: any) {
  const bill = data?.bill ?? {};
  const details = data?.details ?? [];
  const funds = data?.funds ?? [];

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
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== "" &&
      String(value).toLowerCase() !== "null",
  );

  if (addressLines.length > 0) {
    doc.text(addressLines.map((value) => String(value)).join("\n"), 20, y);
  } else {
    doc.text("-", 20, y);
  }

  y += Math.max(15, addressLines.length * 5 + 8);

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
  //
  // SAME QR STRING USED BY THERMAL PRINTER:
  //
  // info.qr_string
  //
  // ============================================================

  const qrString = String(bill.qr_string ?? "").trim();

  console.log("PDF QR STRING:", qrString);

  if (qrString !== "") {
    try {
      /*
       * Generate the SAME QR data used
       * by the thermal printer.
       */
      const qrDataUrl = await QRCode.toDataURL(qrString, {
        errorCorrectionLevel: "M",
        type: "image/png",

        /*
         * High resolution image.
         * jsPDF will resize it to 45mm.
         */
        width: 500,

        /*
         * Important quiet zone around QR.
         */
        margin: 4,

        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      /*
       * Make sure there is enough space
       * on the current page.
       */
      if (y > 225) {
        doc.addPage();

        y = 20;
      }

      // --------------------------------------------------------
      // QR TITLE
      // --------------------------------------------------------

      doc.setFont("helvetica", "bold");

      doc.setFontSize(11);

      doc.text("SCAN & PAY USING UPI", 105, y, {
        align: "center",
      });

      y += 5;

      // --------------------------------------------------------
      // QR IMAGE
      // --------------------------------------------------------

      const qrSize = 45;

      const qrX = (210 - qrSize) / 2;

      doc.addImage(qrDataUrl, "PNG", qrX, y, qrSize, qrSize);

      y += qrSize + 6;

      // --------------------------------------------------------
      // PAYMENT INFORMATION
      // --------------------------------------------------------

      doc.setFont("helvetica", "normal");

      doc.setFontSize(9);

      /*
       * Show UPI ID if available.
       */
      const upiId = bill.upi_id ?? bill.upi ?? bill.upi_vpa ?? "";

      if (upiId && String(upiId).trim() !== "") {
        doc.text(`UPI: ${String(upiId).trim()}`, 105, y, {
          align: "center",
        });

        y += 5;
      }

      doc.text(`Amount: Rs. ${format(bill.total_amount)}`, 105, y, {
        align: "center",
      });

      y += 8;

      console.log("QR code successfully added to PDF.");
    } catch (qrError) {
      /*
       * Do not fail the complete bill PDF
       * if QR generation has a problem.
       */
      console.error("PDF QR generation failed:", qrError);

      doc.setFont("helvetica", "normal");

      doc.setFontSize(9);

      doc.text("UPI QR code could not be generated.", 105, y, {
        align: "center",
      });

      y += 8;
    }
  } else {
    console.warn("No qr_string found in bill data.");
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
