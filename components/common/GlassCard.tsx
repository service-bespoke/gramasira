import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

export default function GlassCard({ children, className = "" }: Props) {
  return (
    <div
      className={`
        rounded-3xl
        bg-white/70
        backdrop-blur-xl
        border
        border-white/40
        shadow-xl
        p-6
        transition-all
        duration-300
        hover:shadow-2xl
        hover:-translate-y-1
        ${className}
      `}
    >
      {children}
    </div>
  );
}
