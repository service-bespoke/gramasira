interface Props {
  title: string;

  count: number;
}

export default function SheetPreview({
  title,

  count,
}: Props) {
  return (
    <div className="bg-white rounded shadow p-5">
      <h3 className="font-semibold">{title}</h3>

      <p className="text-4xl mt-2">{count}</p>
    </div>
  );
}
