import { useId } from "react";
import { CHART_PALETTE } from "@/lib/asset-helpers";

/**
 * Grafici riutilizzabili già pronti per la challenge Dashboard & Reportistica.
 * Sono componenti puramente presentazionali in SVG (nessuna dipendenza esterna):
 * passa i dati e pensano loro al rendering. Il calcolo dei dati (KPI, raggruppamenti)
 * resta a carico della tua implementazione.
 *
 * Componenti disponibili:
 * - <DonutChart />        grafico a ciambella con legenda
 * - <HorizontalBarChart /> barre orizzontali con etichette e valori
 * - <StackedBarChart />   barre orizzontali impilate (es. categoria × stato)
 */

export interface ChartDatum {
  label: string;
  value: number;
  /** Colore opzionale; se assente viene preso dalla palette di default. */
  color?: string;
}

function colorAt(index: number, explicit?: string): string {
  return explicit ?? CHART_PALETTE[index % CHART_PALETTE.length];
}

/* ------------------------------------------------------------------ */
/* DonutChart                                                          */
/* ------------------------------------------------------------------ */

interface DonutChartProps {
  data: ChartDatum[];
  /** Lato del grafico in px (default 200). */
  size?: number;
  /** Spessore dell'anello in px (default 32). */
  thickness?: number;
}

export function DonutChart({ data, size = 200, thickness = 32 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <g transform={`rotate(-90 ${center} ${center})`}>
          {total === 0 ? (
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={thickness}
            />
          ) : (
            data.map((d, i) => {
              const fraction = d.value / total;
              const dash = fraction * circumference;
              const segment = (
                <circle
                  key={d.label}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={colorAt(i, d.color)}
                  strokeWidth={thickness}
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += dash;
              return segment;
            })
          )}
        </g>
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-foreground text-2xl font-semibold"
        >
          {total}
        </text>
      </svg>

      <ul className="space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: colorAt(i, d.color) }}
            />
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-medium text-foreground">{d.value}</span>
            <span className="text-xs text-muted-foreground">
              ({total > 0 ? Math.round((d.value / total) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HorizontalBarChart                                                 */
/* ------------------------------------------------------------------ */

interface HorizontalBarChartProps {
  data: ChartDatum[];
}

export function HorizontalBarChart({ data }: HorizontalBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((d, i) => (
        <div key={d.label} className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{d.label}</span>
            <span className="font-medium text-foreground">{d.value}</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(d.value / max) * 100}%`,
                backgroundColor: colorAt(i, d.color),
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* StackedBarChart                                                    */
/* ------------------------------------------------------------------ */

export interface StackedSegment {
  label: string;
  value: number;
  color?: string;
}

export interface StackedRow {
  label: string;
  segments: StackedSegment[];
}

interface StackedBarChartProps {
  data: StackedRow[];
}

export function StackedBarChart({ data }: StackedBarChartProps) {
  const titleId = useId();
  const max = Math.max(
    1,
    ...data.map((row) => row.segments.reduce((sum, s) => sum + s.value, 0))
  );

  // Legenda: colori coerenti per etichette uguali tra le righe.
  const legend = new Map<string, string>();
  data.forEach((row) =>
    row.segments.forEach((s, i) => {
      if (!legend.has(s.label)) legend.set(s.label, colorAt(legend.size + i, s.color));
    })
  );

  const legendTotals = new Map<string, number>();
  data.forEach((row) =>
    row.segments.forEach((segment) => {
      legendTotals.set(segment.label, (legendTotals.get(segment.label) ?? 0) + segment.value);
    })
  );
  const allSegmentsTotal = [...legendTotals.values()].reduce((sum, value) => sum + value, 0);

  return (
    <div className="space-y-4" aria-labelledby={titleId}>
      <div className="space-y-3">
        {data.map((row) => {
          const rowTotal = row.segments.reduce((sum, s) => sum + s.value, 0);
          return (
            <div key={row.label} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium text-foreground">{rowTotal}</span>
              </div>
              <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
                {row.segments.map((s) => {
                  const pct = (s.value / rowTotal) * 100;
                  const widthOfMax = (rowTotal / max) * 100;
                  return s.value > 0 ? (
                    <div
                      key={s.label}
                      title={`${s.label}: ${s.value} (${pct.toFixed(0)}%)`}
                      style={{
                        width: `${(pct * widthOfMax) / 100}%`,
                        backgroundColor: s.color ?? legend.get(s.label),
                      }}
                    />
                  ) : null;
                })}
              </div>
            </div>
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        {[...legend.entries()].map(([label, color]) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className="inline-block h-3 w-3 rounded-sm"
              style={{ backgroundColor: color }}
            />
            <span className="text-muted-foreground">{label}</span>
            <span className="text-xs text-muted-foreground">
              ({allSegmentsTotal > 0 ? Math.round(((legendTotals.get(label) ?? 0) / allSegmentsTotal) * 100) : 0}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
