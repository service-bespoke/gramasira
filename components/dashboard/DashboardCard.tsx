import GlassCard from "@/components/common/GlassCard";
import AnimatedCounter from "@/components/common/AnimatedCounter";

interface Props {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  prefix?: string;
}

export default function DashboardCard({
  title,
  value,
  icon,
  color,
  prefix = "",
}: Props) {
  return (
    <GlassCard className="group cursor-pointer">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-slate-500 font-medium">{title}</p>

          <h2 className="text-3xl font-bold mt-2 text-slate-800">
            <AnimatedCounter value={value} prefix={prefix} />
          </h2>
        </div>

        <div
          className={`
            w-14
            h-14
            rounded-2xl
            flex
            items-center
            justify-center
            text-white
            shadow-lg
            transition-all
            duration-300
            group-hover:scale-110
            ${color}
          `}
        >
          {icon}
        </div>
      </div>
    </GlassCard>
  );
}
