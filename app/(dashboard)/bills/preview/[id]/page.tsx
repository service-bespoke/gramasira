import BillPreview from "@/components/bills/BillPreview";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <BillPreview billId={Number(id)} />;
}
