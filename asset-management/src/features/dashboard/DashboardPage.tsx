import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Monitor,
  CheckCircle,
  Wrench,
  XCircle,
  BarChart3,
  Download,
  PieChart,
  TableProperties,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import { mockAssets } from "@/lib/mock-data";
import { ASSET_CATEGORIES, ASSET_STATUSES, formatCurrency, parseDate, STATUS_COLORS } from "@/lib/asset-helpers";
import { DonutChart, HorizontalBarChart, StackedBarChart } from "@/components/charts";
import { downloadCSV } from "@/lib/csv";
import type { Asset } from "@/lib/types";

type ViewMode = "dashboard" | "report";
type ReportSortField = "reparto" | "numeroAsset" | "valoreTotale" | "assetPiuVecchio" | "assetPiuRecente";
type SortDirection = "asc" | "desc";

interface DepartmentReportRow {
  reparto: string;
  numeroAsset: number;
  valoreTotale: number;
  assetPiuVecchio: string;
  assetPiuRecente: string;
  assets: Asset[];
}

export function DashboardPage() {
  const { user, permissions } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [reportFilter, setReportFilter] = useState<string>("");
  const [reportSortField, setReportSortField] = useState<ReportSortField>("numeroAsset");
  const [reportSortDirection, setReportSortDirection] = useState<SortDirection>("desc");

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

  const byCategory = useMemo(
    () =>
      ASSET_CATEGORIES.map((category) => ({
        label: category,
        value: mockAssets.filter((asset) => asset.categoria === category).length,
      })).filter((item) => item.value > 0),
    []
  );

  const byDepartment = useMemo(() => {
    const grouped = new Map<string, number>();
    mockAssets.forEach((asset) => {
      const dept = asset.reparto ?? "Non assegnato";
      grouped.set(dept, (grouped.get(dept) ?? 0) + 1);
    });
    return [...grouped.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, []);

  const stackedByCategoryAndStatus = useMemo(
    () =>
      ASSET_CATEGORIES.map((category) => ({
        label: category,
        segments: ASSET_STATUSES.map((status) => ({
          label: status,
          value: mockAssets.filter((asset) => asset.categoria === category && asset.stato === status).length,
          color: STATUS_COLORS[status],
        })),
      })).filter((row) => row.segments.some((segment) => segment.value > 0)),
    []
  );

  const departmentReportRows = useMemo<DepartmentReportRow[]>(() => {
    const grouped = new Map<string, Asset[]>();

    mockAssets.forEach((asset) => {
      const dept = asset.reparto ?? "Non assegnato";
      const current = grouped.get(dept) ?? [];
      current.push(asset);
      grouped.set(dept, current);
    });

    return [...grouped.entries()]
      .map(([reparto, assets]) => {
        const sortedByDate = [...assets].sort(
          (a, b) => parseDate(a.dataAcquisto).getTime() - parseDate(b.dataAcquisto).getTime()
        );

        return {
          reparto,
          numeroAsset: assets.length,
          valoreTotale: assets.reduce((sum, asset) => sum + asset.costo, 0),
          assetPiuVecchio: sortedByDate[0]?.nome ?? "-",
          assetPiuRecente: sortedByDate[sortedByDate.length - 1]?.nome ?? "-",
          assets: sortedByDate,
        };
      })
      .sort((a, b) => b.numeroAsset - a.numeroAsset);
  }, []);

  const selectedDepartmentRow = selectedDepartment
    ? departmentReportRows.find((row) => row.reparto === selectedDepartment) ?? null
    : null;

  const visibleDepartmentRows = useMemo(() => {
    const filtered = reportFilter
      ? departmentReportRows.filter((row) => row.reparto === reportFilter)
      : departmentReportRows;

    return [...filtered].sort((a, b) => {
      let result = 0;
      switch (reportSortField) {
        case "reparto":
        case "assetPiuVecchio":
        case "assetPiuRecente":
          result = a[reportSortField].localeCompare(b[reportSortField], "it-IT", { sensitivity: "base" });
          break;
        case "numeroAsset":
        case "valoreTotale":
          result = a[reportSortField] - b[reportSortField];
          break;
      }
      return reportSortDirection === "asc" ? result : -result;
    });
  }, [departmentReportRows, reportFilter, reportSortField, reportSortDirection]);

  function handleReportSort(field: ReportSortField) {
    if (reportSortField === field) {
      setReportSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setReportSortField(field);
    setReportSortDirection(field === "reparto" ? "asc" : "desc");
  }

  function renderReportHeader(label: string, field: ReportSortField, alignRight = false) {
    const isActive = reportSortField === field;

    return (
      <button
        type="button"
        onClick={() => handleReportSort(field)}
        className={`flex items-center gap-1 hover:text-foreground ${alignRight ? "ml-auto" : ""}`}
      >
        <span>{label}</span>
        {isActive ? (
          reportSortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
        ) : (
          <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
        )}
      </button>
    );
  }

  function exportDepartmentReportCsv() {
    const rows = visibleDepartmentRows.map((row) => ({
      Reparto: row.reparto,
      "Numero Asset": row.numeroAsset,
      "Valore Totale (€)": row.valoreTotale,
      "Asset più vecchio": row.assetPiuVecchio,
      "Asset più recente": row.assetPiuRecente,
    }));

    downloadCSV("report_reparti", rows);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Benvenuto, {user?.nome}! Ecco la panoramica degli asset aziendali.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={viewMode === "dashboard" ? "default" : "outline"}
          onClick={() => setViewMode("dashboard")}
        >
          <PieChart className="h-4 w-4" />
          Dashboard
        </Button>
        <Button
          variant={viewMode === "report" ? "default" : "outline"}
          onClick={() => setViewMode("report")}
        >
          <TableProperties className="h-4 w-4" />
          Report
        </Button>
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

      {viewMode === "dashboard" ? (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Distribuzione per Categoria</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <DonutChart data={byCategory} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg">Asset per Reparto</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <HorizontalBarChart data={byDepartment} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribuzione per Categoria e Stato</CardTitle>
            </CardHeader>
            <CardContent>
              <StackedBarChart data={stackedByCategoryAndStatus} />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <CardTitle className="text-lg">Report per Reparto</CardTitle>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                <Select value={reportFilter} onChange={(event) => setReportFilter(event.target.value)} className="min-w-[220px]">
                  <option value="">Tutti i reparti</option>
                  {departmentReportRows.map((row) => (
                    <option key={row.reparto} value={row.reparto}>
                      {row.reparto}
                    </option>
                  ))}
                </Select>
                {permissions.canViewReports && (
                  <Button variant="outline" onClick={exportDepartmentReportCsv} disabled={visibleDepartmentRows.length === 0}>
                    <Download className="h-4 w-4" />
                    Esporta CSV
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{renderReportHeader("Reparto", "reparto")}</TableHead>
                    <TableHead className="text-right">{renderReportHeader("Numero Asset", "numeroAsset", true)}</TableHead>
                    <TableHead className="text-right">{renderReportHeader("Valore Totale (€)", "valoreTotale", true)}</TableHead>
                    <TableHead>{renderReportHeader("Asset più vecchio", "assetPiuVecchio")}</TableHead>
                    <TableHead>{renderReportHeader("Asset più recente", "assetPiuRecente")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleDepartmentRows.map((row) => (
                    <TableRow
                      key={row.reparto}
                      className="cursor-pointer"
                      data-state={selectedDepartment === row.reparto ? "selected" : undefined}
                      onClick={() => setSelectedDepartment(row.reparto)}
                    >
                      <TableCell className="font-medium">{row.reparto}</TableCell>
                      <TableCell className="text-right">{row.numeroAsset}</TableCell>
                      <TableCell className="text-right">{formatCurrency(row.valoreTotale)}</TableCell>
                      <TableCell>{row.assetPiuVecchio}</TableCell>
                      <TableCell>{row.assetPiuRecente}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                Dettaglio Reparto {selectedDepartmentRow ? `- ${selectedDepartmentRow.reparto}` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!selectedDepartmentRow ? (
                <p className="px-6 py-6 text-sm text-muted-foreground">
                  Clicca una riga del report per visualizzare il dettaglio di tutti gli asset del reparto.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Data Acquisto</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedDepartmentRow.assets.map((asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.id}</TableCell>
                        <TableCell>{asset.nome}</TableCell>
                        <TableCell>{asset.categoria}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.stato}</Badge>
                        </TableCell>
                        <TableCell>{asset.dataAcquisto}</TableCell>
                        <TableCell className="text-right">{formatCurrency(asset.costo)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
