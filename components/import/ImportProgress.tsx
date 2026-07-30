interface Props {
  loading: boolean;
}

export default function ImportProgress({ loading }: Props) {
  if (!loading) return null;

  return (
    <div className="bg-white rounded p-5 shadow">
      <p className="font-semibold">Importing...</p>

      <div className="w-full bg-gray-200 rounded h-4 mt-3">
        <div
          className="bg-blue-600 h-4 rounded animate-pulse"
          style={{
            width: "100%",
          }}
        ></div>
      </div>
    </div>
  );
}
