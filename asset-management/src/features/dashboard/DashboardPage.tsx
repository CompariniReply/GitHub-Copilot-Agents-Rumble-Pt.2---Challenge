import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Package, Monitor, CheckCircle, Wrench, XCircle, ArrowLeft } from "lucide-react";
import { mockAssets } from "@/lib/mock-data";
import {
  STATUS_COLORS,
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  formatCurrency,
  parseDate,
  formatDate,
  getStatusBadgeVariant,
} from "@/lib/asset-helpers";
import { DonutChart, HorizontalBarChart, StackedBarChart } from "@/components/charts";
import type { ChartDatum, StackedRow } from "@/components/charts";
import type { AssetStatus } from "@/lib/types";

export function DashboardPage() {
  const { user, permissions } = useAuth();
  const [selectedReparto, setSelectedReparto] = useState<string | null>(null);

  // --- KPI ---
  const totalAssets = mockAssets.length;
  const inUse = mockAssets.filter((a) => a.stato === "In uso").length;
  const available = mockAssets.filter((a) => a.stato === "Disponibile").length;
  const inMaintenance = mockAssets.filter((a) => a.stato === "In manutenzione").length;
  const dismissed = mockAssets.filter((a) => a.stato === "Dismesso").length;

  const kpis = [
    { label: "Totale Asset", value: totalAssets, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "In Uso", value: inUse, icon: Monitor, color: "text-emerald-600 bg-emerald-50" },
    { label: "Disponibili", value: available, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "In Manutenzione", value: inMaintenance, icon: Wrench, color: "text-amber-600 bg-amber-50" },
    { label: "Dismessi", value: dismissed, icon: XCircle, color: "text-red-600 bg-red-50" },
  ];

  // --- Donut Chart: distribuzione per stato ---
  const statusChartData: ChartDatum[] = useMemo(() => {
    const counts: Record<string, number> = {};
    mockAssets.forEach((a) => {
      counts[a.stato] = (counts[a.stato] || 0) + 1;
    });
    return Object.entries(counts).map(([label, value]) => ({
      label,
      value,
      color: STATUS_COLORS[label as AssetStatus],
    }));
  }, []);

  // --- Bar Chart: asset per reparto ---
  const repartoChartData: ChartDatum[] = useMemo(() => {
    const counts: Record<string, number> = {};
    mockAssets.forEach((a) => {
      if (a.reparto) {
        counts[a.reparto] = (counts[a.reparto] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([label, value]) => ({ label, value }));
  }, []);

  // --- Stacked Bar Chart: distribuzione per categoria x stato ---
  const stackedChartData: StackedRow[] = useMemo(() => {
    return ASSET_CATEGORIES.map((cat) => {
      const catAssets = mockAssets.filter((a) => a.categoria === cat);
      const segments = ASSET_STATUSES.map((status) => ({
        label: status,
        value: catAssets.filter((a) => a.stato === status).length,
        color: STATUS_COLORS[status],
      }));
      return { label: cat, segments };
    }).filter((row) => row.segments.some((s) => s.value > 0));
  }, []);

  // --- Report per reparto ---
  const repartoReport = useMemo(() => {
    const reparti: Record<
      string,
      { count: number; totalValue: number; oldest: string; newest: string }
    > = {};

    mockAssets.forEach((a) => {
      if (!a.reparto) return;
      if (!reparti[a.reparto]) {
        reparti[a.reparto] = {
          count: 0,
          totalValue: 0,
          oldest: a.dataAcquisto,
          newest: a.dataAcquisto,
        };
      }
      const r = reparti[a.reparto];
      r.count += 1;
      r.totalValue += a.costo;

      if (parseDate(a.dataAcquisto) < parseDate(r.oldest)) {
        r.oldest = a.dataAcquisto;
      }
      if (parseDate(a.dataAcquisto) > parseDate(r.newest)) {
        r.newest = a.dataAcquisto;
      }
    });

    return Object.entries(reparti)
      .map(([nome, data]) => ({ nome, ...data }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // --- Assets for selected reparto ---
  const repartoAssets = useMemo(() => {
    if (!selectedReparto) return [];
    return mockAssets.filter((a) => a.reparto === selectedReparto);
  }, [selectedReparto]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Benvenuto, {user?.nome}! Ecco la panoramica degli asset aziendali.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <div className={`rounded-md p-2 ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Donut: Distribuzione per stato */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuzione per Stato</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={statusChartData} />
          </CardContent>
        </Card>

        {/* Horizontal Bar: Asset per reparto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asset per Reparto</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={repartoChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Stacked Chart: Distribuzione per categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Distribuzione per Categoria e Stato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StackedBarChart data={stackedChartData} />
        </CardContent>
      </Card>

      {/* Riepilogo Inventario */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Riepilogo Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(
              mockAssets.reduce<Record<string, number>>((acc, a) => {
                acc[a.categoria] = (acc[a.categoria] || 0) + 1;
                return acc;
              }, {})
            )
              .sort(([, a], [, b]) => b - a)
              .map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm font-medium">{cat}</span>
                  <span className="text-sm text-muted-foreground">{count}</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Report per Reparto */}
      {permissions.canViewReports && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Report per Reparto</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedReparto ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReparto(null)}
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Torna ai reparti
                  </Button>
                  <span className="font-medium">
                    Asset del reparto: {selectedReparto}
                  </span>
                </div>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Stato</TableHead>
                        <TableHead>Assegnato a</TableHead>
                        <TableHead>Costo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {repartoAssets.map((asset) => (
                        <TableRow key={asset.id}>
                          <TableCell className="font-mono text-xs">
                            {asset.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {asset.nome}
                          </TableCell>
                          <TableCell>{asset.categoria}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(asset.stato)}>
                              {asset.stato}
                            </Badge>
                          </TableCell>
                          <TableCell>{asset.assegnatoA ?? "—"}</TableCell>
                          <TableCell>{formatCurrency(asset.costo)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reparto</TableHead>
                      <TableHead>N. Asset</TableHead>
                      <TableHead>Valore Totale</TableHead>
                      <TableHead>Asset più vecchio</TableHead>
                      <TableHead>Asset più recente</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {repartoReport.map((row) => (
                      <TableRow
                        key={row.nome}
                        className="cursor-pointer"
                        onClick={() => setSelectedReparto(row.nome)}
                      >
                        <TableCell className="font-medium">
                          {row.nome}
                        </TableCell>
                        <TableCell>{row.count}</TableCell>
                        <TableCell>
                          {formatCurrency(row.totalValue)}
                        </TableCell>
                        <TableCell>{formatDate(row.oldest)}</TableCell>
                        <TableCell>{formatDate(row.newest)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
