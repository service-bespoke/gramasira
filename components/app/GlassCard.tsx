import { theme } from "@/styles/theme";

export default function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: theme.colors.glass,
        borderRadius: theme.radius.lg,
        boxShadow: theme.shadow.card,
        backdropFilter: `blur(${theme.blur.glass})`,
      }}
      className="border border-white/30 p-6"
    >
      {children}
    </div>
  );
}
