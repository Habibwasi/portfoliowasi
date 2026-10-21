import type { Metric as MetricData } from "@/content/types";
import { cn } from "@/lib/utils";

/** An impact number with a short label; expected numbers say so. */
export function Metric({ metric }: { metric: MetricData }) {
  const label = metric.expected ? `${metric.label} (expected)` : metric.label;
  return (
    <div className="hw-metric">
      <span className="hw-metric__value">{metric.value}</span>
      <span className="hw-metric__label">{label}</span>
      {metric.note && <span className="hw-metric__note">{metric.note}</span>}
    </div>
  );
}

export function Metrics({ metrics, className }: { metrics: MetricData[]; className?: string }) {
  if (metrics.length === 0) return null;
  return (
    <div className={cn("hw-metrics", className)}>
      {metrics.map((metric) => (
        <Metric key={metric.label} metric={metric} />
      ))}
    </div>
  );
}
