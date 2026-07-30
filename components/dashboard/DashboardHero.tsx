import GlassCard from "@/components/common/GlassCard";

export default function DashboardHero() {
  return (
    <GlassCard
      className="
      bg-gradient-to-r
      from-sky-600
      to-cyan-500
      text-white
      "
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="text-lg opacity-90">Good Morning 👋</div>

          <h2 className="text-3xl font-bold mt-2">Administrator</h2>

          <p className="mt-3 opacity-90">Welcome to Gramasira Water Billing</p>
        </div>

        <div className="text-7xl">💧</div>
      </div>
    </GlassCard>
  );
}
