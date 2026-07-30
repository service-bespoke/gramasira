import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateBillPdf(data: any) {
  const bill = data.bill;
  const details = data.details ?? [];
  const funds = data.funds ?? [];

  const doc = new jsPDF("p", "mm", "a4");

  const format = (value: any) =>
    Number(value ?? 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // ------------------------
  // Header
  // ------------------------

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

  // ------------------------
  // Customer
  // ------------------------

  let y = 38;

  doc.setFont("helvetica", "bold");
  doc.text("Bill Information", 14, y);

  y += 8;

  doc.setFont("helvetica", "normal");

  doc.text(`Bill No : ${bill.bill_no}`, 14, y);

  doc.text(`Consumer No : ${bill.consumer_no}`, 120, y);

  y += 7;

  doc.text(`Customer : ${bill.customer_name}`, 14, y);

  doc.text(`Mobile : ${bill.mobile}`, 120, y);

  y += 7;

  doc.text(`Address :`, 14, y);

  y += 6;

  doc.text(
    `${bill.address1}
${bill.address2}
${bill.address3}`,
    20,
    y
  );

  y += 22;

  // ------------------------
  // Meter Reading
  // ------------------------

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

  // ------------------------
  // Slab Details
  // ------------------------

  doc.setFont("helvetica", "bold");

  doc.text("Consumption Charges", 14, y);

  y += 5;

  autoTable(doc, {
    startY: y,

    head: [["Slab", "Units", "Rate", "Amount"]],

    body: details.map((d: any) => [
      `${d.slab_from} - ${d.slab_to}`,

      format(d.units),

      `₹ ${format(d.rate)}`,

      `₹ ${format(d.amount)}`,
    ]),

    theme: "striped",
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // ------------------------
  // Additional Funds
  // ------------------------

  if (funds.length > 0) {
    doc.setFont("helvetica", "bold");

    doc.text("Additional Funds", 14, y);

    y += 5;

    autoTable(doc, {
      startY: y,

      head: [["Fund", "Amount"]],

      body: funds.map((f: any) => [
        f.fund_name,

        `₹ ${format(f.amount)}`,
      ]),

      theme: "striped",
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ------------------------
  // Summary
  // ------------------------

  autoTable(doc, {
    startY: y,

    body: [
      ["Water Charge", `₹ ${format(bill.water_charge)}`],

      ["Fixed Charge", `₹ ${format(bill.fixed_charge)}`],

      ["Meter Charge", `₹ ${format(bill.meter_charge)}`],

      ["Maintenance", `₹ ${format(bill.maintenance_charge)}`],

      ["Penalty", `₹ ${format(bill.penalty)}`],

      ["Discount", `₹ ${format(bill.discount)}`],

      [
        "TOTAL",

        `₹ ${format(bill.total_amount)}`,
      ],
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

  y = (doc as any).lastAutoTable.finalY + 15;

  // ------------------------
  // Due Date
  // ------------------------

  doc.setFont("helvetica", "bold");

  doc.text(
    `Due Date : ${bill.due_date}`,
    14,
    y
  );

  y += 15;

  // ------------------------
  // Footer
  // ------------------------

  doc.setFont("helvetica", "normal");

  doc.setFontSize(10);

  doc.text(
    "Thank you for using Gramasira Water Supply",
    105,
    y,
    {
      align: "center",
    }
  );

  doc.text(
    "Computer Generated Bill",
    105,
    y + 6,
    {
      align: "center",
    }
  );

  return doc;
}