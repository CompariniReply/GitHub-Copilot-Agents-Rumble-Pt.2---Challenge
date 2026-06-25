import { useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Monitor, CheckCircle, Wrench, XCircle, Download } from "lucide-react";
import { mockAssets } from "@/lib/mock-data";
import { downloadCSV } from "@/lib/csv";
import { formatCurrency, STATUS_COLORS } from "@/lib/asset-helpers";
import type { AssetStatus } from "@/lib/types";
import { DonutChart, HorizontalBarChart, StackedBarChart } from "@/components/charts";

const STATUS_LABELS: AssetStatus[] = ["In uso", "Disponibile", "In manutenzione", "Dismesso"];

export function DashboardPage() {
  const { user, permissions } = useAuth();

  const assetMetrics = useMemo(() => {
    const totalAssets = mockAssets.length;
    const totalValue = mockAssets.reduce((sum, asset) => sum + asset.costo, 0);
    const statusCounts: Record<AssetStatus, number> = {
      "In uso": 0,
      Disponibile: 0,
      "In manutenzione": 0,
      Dismesso: 0,
    };

    const categoryCounts = new Map<string, number>();
    const repartoMap = new Map<string, {
      count: number;
      totalValue: number;
      statusCounts: Record<AssetStatus, number>;
    }>();

    mockAssets.forEach((asset) => {
      statusCounts[asset.stato] += 1;
      categoryCounts.set(asset.categoria, (categoryCounts.get(asset.categoria) || 0) + 1);

      const reparto = asset.reparto ?? "Non assegnato";
      const existing = repartoMap.get(reparto);
      if (existing) {
        existing.count += 1;
        existing.totalValue += asset.costo;
        existing.statusCounts[asset.stato] += 1;
      } else {
        repartoMap.set(reparto, {
          count: 1,
          totalValue: asset.costo,
          statusCounts: {
            "In uso": asset.stato === "In uso" ? 1 : 0,
            Disponibile: asset.stato === "Disponibile" ? 1 : 0,
            "In manutenzione": asset.stato === "In manutenzione" ? 1 : 0,
            Dismesso: asset.stato === "Dismesso" ? 1 : 0,
          },
        });
      }
    });

    const reportRows = [...repartoMap.entries()]
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([reparto, data]) => ({ reparto, ...data }));

    const statusDistribution = STATUS_LABELS.map((status) => ({
      label: status,
      value: statusCounts[status],
      color: STATUS_COLORS[status],
    }));

    const categoryDistribution = [...categoryCounts.entries()]
      .sort(([, a], [, b]) => b - a)
      .map(([label, value]) => ({ label, value }));

    const repartoDistribution = reportRows.map((row) => ({
      label: row.reparto,
      segments: STATUS_LABELS.map((status) => ({
        label: status,
        value: row.statusCounts[status],
        color: STATUS_COLORS[status],
      })),
    }));

    return {
      totalAssets,
      totalValue,
      averageCost: totalAssets ? totalValue / totalAssets : 0,
      statusCounts,
      statusDistribution,
      categoryDistribution,
      reportRows,
      repartoDistribution,
    };
  }, []);

  const { totalAssets, totalValue, averageCost, statusDistribution, categoryDistribution, reportRows, repartoDistribution } = assetMetrics;

  const kpis = [
    { label: "Totale Asset", value: totalAssets, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "Valore Inventario", value: formatCurrency(totalValue), icon: Monitor, color: "text-sky-600 bg-sky-50" },
    { label: "Costo Medio", value: formatCurrency(Math.round(averageCost)), icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
    { label: "In Manutenzione", value: statusDistribution.find((item) => item.label === "In manutenzione")?.value ?? 0, icon: Wrench, color: "text-amber-600 bg-amber-50" },
    { label: "Dismessi", value: statusDistribution.find((item) => item.label === "Dismesso")?.value ?? 0, icon: XCircle, color: "text-red-600 bg-red-50" },
  ];

  const handleExport = () => {
    const rows = mockAssets.map((asset) => ({
      ID: asset.id,
      Nome: asset.nome,
      Categoria: asset.categoria,
      Stato: asset.stato,
      Reparto: asset.reparto ?? "Non assegnato",
      AssegnatoA: asset.assegnatoA ?? "-",
      Ubicazione: asset.ubicazione ?? "-",
      Costo: formatCurrency(asset.costo),
      DataAcquisto: asset.dataAcquisto,
    }));

    downloadCSV("asset_dashboard_report", rows);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Benvenuto, {user?.nome}! Qui trovi i KPI e i report aggiornati dagli asset mock.
            </p>
          </div>
          {permissions.canViewReports ? (
            <Button variant="secondary" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Esporta CSV
            </Button>
          ) : null}
        </div>
      </div>

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

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Stato asset</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={statusDistribution} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuzione per categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <HorizontalBarChart data={categoryDistribution} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Asset per reparto</CardTitle>
            </CardHeader>
            <CardContent>
              <StackedBarChart data={repartoDistribution} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Report reparto</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sintesi degli asset per reparto e valore di inventario.
            </p>
          </div>
          {permissions.canViewReports ? (
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Scarica report
            </Button>
          ) : null}
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Reparto</th>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3">Valore</th>
                  <th className="px-4 py-3">Disponibili</th>
                  <th className="px-4 py-3">In uso</th>
                  <th className="px-4 py-3">In manutenzione</th>
                  <th className="px-4 py-3">Dismessi</th>
                </tr>
              </thead>
              <tbody>
                {reportRows.map((row) => (
                  <tr key={row.reparto} className="border-b last:border-b-0 hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium text-foreground">{row.reparto}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.count}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCurrency(row.totalValue)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.statusCounts.Disponibile}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.statusCounts["In uso"]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.statusCounts["In manutenzione"]}</td>
                    <td className="px-4 py-3 text-muted-foreground">{row.statusCounts.Dismesso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
