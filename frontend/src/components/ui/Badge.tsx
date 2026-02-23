import { cn } from "@/lib/utils";
import { ORDER_STATUS_CONFIG } from "@/lib/utils";

interface BadgeProps {
  status: string;
  className?: string;
}

export function Badge({ status, className }: BadgeProps) {
  const config = ORDER_STATUS_CONFIG[status] || {
    label: status,
    color: "text-gray-700",
    bgColor: "bg-gray-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        config.color,
        config.bgColor,
        className
      )}
    >
      {config.label}
    </span>
  );
}
