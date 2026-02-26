import { ReactNode } from "react";

interface BadgePillProps {
  children: ReactNode;
  variant?: "gold" | "green" | "indigo" | "red";
  size?: "sm" | "md";
}

const variantClasses = {
  gold: "bg-sandGold/20 text-sandGold border border-sandGold/40",
  green: "bg-forestGreen/10 text-forestGreen border border-forestGreen/30",
  indigo: "bg-kutchIndigo/10 text-kutchIndigo border border-kutchIndigo/30",
  red: "bg-red-50 text-red-600 border border-red-200",
};

const sizeClasses = {
  sm: "text-[10px] px-1.5 py-0.5",
  md: "text-xs px-2.5 py-1",
};

export default function BadgePill({
  children,
  variant = "gold",
  size = "md",
}: BadgePillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-poppins font-semibold ${variantClasses[variant]} ${sizeClasses[size]}`}
    >
      {children}
    </span>
  );
}
