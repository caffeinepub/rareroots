interface LiveBadgeProps {
  size?: "sm" | "md";
}

export default function LiveBadge({ size = "md" }: LiveBadgeProps) {
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const dotSize = size === "sm" ? "w-1.5 h-1.5" : "w-2 h-2";
  const padding = size === "sm" ? "px-1.5 py-0.5" : "px-2 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 bg-red-500 text-white font-poppins font-bold rounded-full ${padding} ${textSize}`}
    >
      <span className={`${dotSize} rounded-full bg-white animate-pulse`} />
      LIVE
    </span>
  );
}
