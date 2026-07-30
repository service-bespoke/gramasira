import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateBillPdf(bill: any) {
  const doc = new jsPDF();

  doc.setFontSize(18);

  doc.text("GRAMASIRA WATER SUPPLY", 15, 18);

  doc.setFontSize(11);

  doc.text(`Bill No : ${bill.bill.bill_no}`, 15, 30);
  doc.text(`Consumer : ${bill.bill.customer_name}`, 15, 37);
  doc.text(`Consumer No : ${bill.bill.consumer_no}`, 15, 44);
  doc.text(`Mobile : ${bill.bill.mobile}`, 15, 51);

  autoTable(doc, {
    startY: 60,
    head: [["Slab", "Units", "Rate", "Amount"]],
    body: bill.details.map((d: any) => [
      `${d.slab_from}-${d.slab_to}`,
      d.units,
      d.rate,
      d.amount,
    ]),
  });

  let y = (doc as any).lastAutoTable.finalY + 12;

  doc.text(`Total Amount : ₹ ${bill.bill.total_amount}`, 15, y);

  return doc;
}
