import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Package,
  Monitor,
  CheckCircle,
  Wrench,
  XCircle,
  DollarSign,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { mockAssets, mockDepartments } from "@/lib/mock-data";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  STATUS_COLORS,
  CHART_PALETTE,
  formatCurrency,
  formatDate,
  parseDate,
  getStatusBadgeVariant,
} from "@/lib/asset-helpers";
import { downloadCSV } from "@/lib/csv";
import { DonutChart, HorizontalBarChart, StackedBarChart } from "@/components/charts";
import type { ChartDatum, StackedRow } from "@/components/charts";

export function DashboardPage() {
  const { user, permissions } = useAuth();
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  // --- KPI ---
  const totalAssets = mockAssets.length;
  const inUse = mockAssets.filter((a) => a.stato === "In uso").length;
  const available = mockAssets.filter((a) => a.stato === "Disponibile").length;
  const inMaintenance = mockAssets.filter((a) => a.stato === "In manutenzione").length;
  const dismissed = mockAssets.filter((a) => a.stato === "Dismesso").length;
  const totalValue = mockAssets.reduce((sum, a) => sum + a.costo, 0);

  const kpis = [
    { label: "Totale Asset", value: totalAssets, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "In Uso", value: inUse, icon: Monitor, color: "text-emerald-600 bg-emerald-50" },
    { label: "Disponibili", value: available, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "In Manutenzione", value: inMaintenance, icon: Wrench, color: "text-amber-600 bg-amber-50" },
    { label: "Dismessi", value: dismissed, icon: XCircle, color: "text-red-600 bg-red-50" },
    { label: "Valore Totale", value: formatCurrency(totalValue), icon: DollarSign, color: "text-violet-600 bg-violet-50" },
  ];

  // --- Distribuzione per Stato (DonutChart) ---
  const statusData: ChartDatum[] = useMemo(
    () =>
      ASSET_STATUSES.map((stato) => ({
        label: stato,
        value: mockAssets.filter((a) => a.stato === stato).length,
        color: STATUS_COLORS[stato],
      })),
    []
  );

  // --- Distribuzione per Categoria (HorizontalBarChart) ---
  const categoryData: ChartDatum[] = useMemo(
    () =>
      ASSET_CATEGORIES.map((cat, i) => ({
        label: cat,
        value: mockAssets.filter((a) => a.categoria === cat).length,
        color: CHART_PALETTE[i % CHART_PALETTE.length],
      })).sort((a, b) => b.value - a.value),
    []
  );

  // --- Distribuzione Categoria × Stato (StackedBarChart) ---
  const stackedData: StackedRow[] = useMemo(
    () =>
      ASSET_CATEGORIES.map((cat) => ({
        label: cat,
        segments: ASSET_STATUSES.map((stato) => ({
          label: stato,
          value: mockAssets.filter((a) => a.categoria === cat && a.stato === stato).length,
          color: STATUS_COLORS[stato],
        })),
      })).sort(
        (a, b) =>
          b.segments.reduce((s, seg) => s + seg.value, 0) -
          a.segments.reduce((s, seg) => s + seg.value, 0)
      ),
    []
  );

  // --- Asset per Reparto (HorizontalBarChart) ---
  const deptChartData: ChartDatum[] = useMemo(() => {
    const counts: Record<string, number> = {};
    mockAssets.forEach((a) => {
      if (a.reparto) counts[a.reparto] = (counts[a.reparto] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([label, value], i) => ({
        label,
        value,
        color: CHART_PALETTE[i % CHART_PALETTE.length],
      }));
  }, []);

  // --- Report per Reparto (tabella) ---
  const deptReport = useMemo(() => {
    const deptNames = [...new Set(mockAssets.map((a) => a.reparto).filter(Boolean))] as string[];
    return deptNames
      .map((reparto) => {
        const assets = mockAssets.filter((a) => a.reparto === reparto);
        const valoreTotale = assets.reduce((sum, a) => sum + a.costo, 0);
        const dates = assets.map((a) => parseDate(a.dataAcquisto).getTime());
        const oldest = dates.length > 0 ? formatDate(new Date(Math.min(...dates))) : "—";
        const newest = dates.length > 0 ? formatDate(new Date(Math.max(...dates))) : "—";
        const dept = mockDepartments.find((d) => d.nome === reparto);
        return {
          reparto,
          sede: dept?.sede ?? "—",
          numAsset: assets.length,
          valoreTotale,
          assetPiuVecchio: oldest,
          assetPiuRecente: newest,
          assets,
        };
      })
      .sort((a, b) => b.numAsset - a.numAsset);
  }, []);

  // --- Export CSV ---
  function handleExportCSV() {
    const rows = mockAssets.map((a) => ({
      ID: a.id,
      Nome: a.nome,
      Categoria: a.categoria,
      Marca: a.marca,
      Modello: a.modello,
      "Numero Seriale": a.numeroSeriale,
      Stato: a.stato,
      "Assegnato A": a.assegnatoA ?? "",
      Reparto: a.reparto ?? "",
      "Data Acquisto": a.dataAcquisto,
      Costo: a.costo,
      "Garanzia Mesi": a.garanziaMesi,
    }));
    downloadCSV("asset_export", rows);
  }

  function handleExportDeptCSV() {
    const rows = deptReport.map((d) => ({
      Reparto: d.reparto,
      Sede: d.sede,
      "Numero Asset": d.numAsset,
      "Valore Totale": d.valoreTotale,
      "Asset Più Vecchio": d.assetPiuVecchio,
      "Asset Più Recente": d.assetPiuRecente,
    }));
    downloadCSV("report_reparti", rows);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Benvenuto, {user?.nome}! Ecco la panoramica degli asset aziendali.
          </p>
        </div>
        {permissions.canViewReports && (
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4" />
            Esporta CSV
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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
              <div className="text-2xl font-bold">
                {typeof kpi.value === "number" ? kpi.value : kpi.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribuzione per Stato */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuzione per Stato</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={statusData} />
          </CardContent>
        </Card>

        {/* Asset per Reparto */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Asset per Reparto</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={deptChartData} />
          </CardContent>
        </Card>
      </div>

      {/* Distribuzione per Categoria */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuzione per Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={categoryData} />
          </CardContent>
        </Card>

        {/* Distribuzione Categoria × Stato (Stacked) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Categoria × Stato</CardTitle>
          </CardHeader>
          <CardContent>
            <StackedBarChart data={stackedData} />
          </CardContent>
        </Card>
      </div>

      {/* Report per Reparto */}
      {permissions.canViewReports && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Report per Reparto</CardTitle>
            <Button variant="outline" size="sm" onClick={handleExportDeptCSV}>
              <Download className="h-4 w-4" />
              Esporta Report
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reparto</TableHead>
                    <TableHead>Numero Asset</TableHead>
                    <TableHead>Valore Totale</TableHead>
                    <TableHead>Asset più vecchio</TableHead>
                    <TableHead>Asset più recente</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deptReport.map((dept) => (
                    <>
                      <TableRow
                        key={dept.reparto}
                        className="cursor-pointer"
                        onClick={() =>
                          setExpandedDept(
                            expandedDept === dept.reparto ? null : dept.reparto
                          )
                        }
                      >
                        <TableCell className="font-medium">
                          {dept.reparto}
                        </TableCell>
                        <TableCell>{dept.numAsset}</TableCell>
                        <TableCell>{formatCurrency(dept.valoreTotale)}</TableCell>
                        <TableCell>{dept.assetPiuVecchio}</TableCell>
                        <TableCell>{dept.assetPiuRecente}</TableCell>
                        <TableCell>
                          {expandedDept === dept.reparto ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </TableCell>
                      </TableRow>
                      {expandedDept === dept.reparto && (
                        <TableRow key={`${dept.reparto}-detail`}>
                          <TableCell colSpan={6} className="bg-muted/30 p-0">
                            <div className="p-4">
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
                                  {dept.assets.map((asset) => (
                                    <TableRow key={asset.id}>
                                      <TableCell className="font-mono text-xs">
                                        {asset.id}
                                      </TableCell>
                                      <TableCell>{asset.nome}</TableCell>
                                      <TableCell>{asset.categoria}</TableCell>
                                      <TableCell>
                                        <Badge
                                          variant={getStatusBadgeVariant(
                                            asset.stato
                                          )}
                                        >
                                          {asset.stato}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {asset.assegnatoA ?? "—"}
                                      </TableCell>
                                      <TableCell>
                                        {formatCurrency(asset.costo)}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
