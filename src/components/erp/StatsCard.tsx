import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

const StatsCard = ({ title, value, icon: Icon, trend, trendUp, className }: StatsCardProps) => {
  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
          {trend && (
            <p
              className={cn(
                "text-sm mt-2",
                trendUp ? "text-green-600" : "text-red-600"
              )}
            >
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
