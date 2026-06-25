import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Package,
  Monitor,
  CheckCircle,
  Wrench,
  XCircle,
  Download,
  Building2,
} from "lucide-react";
import { mockAssets } from "@/lib/mock-data";
import { downloadCSV } from "@/lib/csv";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  STATUS_COLORS,
  formatCurrency,
  formatDate,
  parseDate,
} from "@/lib/asset-helpers";
import { DonutChart, HorizontalBarChart } from "@/components/charts";

interface DepartmentReportRow {
  reparto: string;
  numeroAsset: number;
  valoreTotale: number;
  assetPiuVecchio: string;
  assetPiuRecente: string;
  assets: typeof mockAssets;
}

export function DashboardPage() {
  const { user } = useAuth();

  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");

  const totalAssets = mockAssets.length;
  const inUse = mockAssets.filter((a) => a.stato === "In uso").length;
  const available = mockAssets.filter((a) => a.stato === "Disponibile").length;
  const inMaintenance = mockAssets.filter((a) => a.stato === "In manutenzione").length;
  const dismissed = mockAssets.filter((a) => a.stato === "Dismesso").length;

  const statusDistribution = useMemo(
    () =>
      ASSET_STATUSES.map((status) => ({
        label: status,
        value: mockAssets.filter((asset) => asset.stato === status).length,
        color: STATUS_COLORS[status],
      })),
    []
  );

  const categoryDistribution = useMemo(
    () =>
      ASSET_CATEGORIES.map((category) => ({
        label: category,
        value: mockAssets.filter((asset) => asset.categoria === category).length,
      })),
    []
  );

  const departmentReport = useMemo<DepartmentReportRow[]>(() => {
    const grouped = mockAssets.reduce<Record<string, typeof mockAssets>>((acc, asset) => {
      const key = asset.reparto ?? "Non assegnato";
      if (!acc[key]) acc[key] = [];
      acc[key].push(asset);
      return acc;
    }, {});

    return Object.entries(grouped)
      .map(([reparto, assets]) => {
        const sortedByDate = [...assets].sort(
          (a, b) => parseDate(a.dataAcquisto).getTime() - parseDate(b.dataAcquisto).getTime()
        );
        const oldest = sortedByDate[0]?.dataAcquisto ?? "-";
        const newest = sortedByDate[sortedByDate.length - 1]?.dataAcquisto ?? "-";

        return {
          reparto,
          numeroAsset: assets.length,
          valoreTotale: assets.reduce((sum, asset) => sum + asset.costo, 0),
          assetPiuVecchio: oldest,
          assetPiuRecente: newest,
          assets,
        };
      })
      .sort((a, b) => b.numeroAsset - a.numeroAsset || a.reparto.localeCompare(b.reparto, "it"));
  }, []);

  const assetByDepartmentChartData = useMemo(
    () => departmentReport.map((row) => ({ label: row.reparto, value: row.numeroAsset })),
    [departmentReport]
  );

  const selectedReport = useMemo(() => {
    if (selectedDepartment === "ALL") return null;
    return departmentReport.find((row) => row.reparto === selectedDepartment) ?? null;
  }, [departmentReport, selectedDepartment]);

  const reportAssets = useMemo(() => {
    const source = selectedReport ? selectedReport.assets : mockAssets;
    return [...source].sort(
      (a, b) => parseDate(b.dataAcquisto).getTime() - parseDate(a.dataAcquisto).getTime()
    );
  }, [selectedReport]);

  const handleExportSummaryCSV = () => {
    downloadCSV(
      "report_reparti",
      departmentReport.map((row) => ({
        Reparto: row.reparto,
        "Numero Asset": row.numeroAsset,
        "Valore Totale": row.valoreTotale,
        "Asset piu vecchio": row.assetPiuVecchio,
        "Asset piu recente": row.assetPiuRecente,
      }))
    );
  };

  const handleExportAssetsCSV = () => {
    downloadCSV(
      "asset_export",
      reportAssets.map((asset) => ({
        ID: asset.id,
        Nome: asset.nome,
        Categoria: asset.categoria,
        Marca: asset.marca,
        Modello: asset.modello,
        "Numero Seriale": asset.numeroSeriale,
        Stato: asset.stato,
        "Assegnato A": asset.assegnatoA ?? "",
        Reparto: asset.reparto ?? "",
        "Data Acquisto": asset.dataAcquisto,
        Costo: asset.costo,
        "Garanzia Mesi": asset.garanziaMesi,
      }))
    );
  };

  const kpis = [
    { label: "Totale Asset", value: totalAssets, icon: Package, color: "text-blue-600 bg-blue-50" },
    { label: "In Uso", value: inUse, icon: Monitor, color: "text-emerald-600 bg-emerald-50" },
    { label: "Disponibili", value: available, icon: CheckCircle, color: "text-green-600 bg-green-50" },
    { label: "In Manutenzione", value: inMaintenance, icon: Wrench, color: "text-amber-600 bg-amber-50" },
    { label: "Dismessi", value: dismissed, icon: XCircle, color: "text-red-600 bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Benvenuto, {user?.nome}! Ecco la panoramica degli asset aziendali.
        </p>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuzione per Stato</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={statusDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuzione per Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={categoryDistribution} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asset per Reparto</CardTitle>
        </CardHeader>
        <CardContent>
          <HorizontalBarChart data={assetByDepartmentChartData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-lg">Report Distribuzione per Reparto</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Seleziona un reparto per vedere il dettaglio asset e esportare i dati in CSV.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Select
                  className="w-full min-w-44"
                  value={selectedDepartment}
                  onChange={(event) => setSelectedDepartment(event.target.value)}
                >
                  <option value="ALL">Tutti i reparti</option>
                  {departmentReport.map((row) => (
                    <option key={row.reparto} value={row.reparto}>
                      {row.reparto}
                    </option>
                  ))}
                </Select>
              </div>
              {user?.ruolo === "Admin" && (
                <>
                  <Button type="button" variant="outline" size="sm" onClick={handleExportSummaryCSV}>
                    <Download className="h-4 w-4" />
                    Esporta report reparti
                  </Button>
                  <Button type="button" size="sm" onClick={handleExportAssetsCSV}>
                    <Download className="h-4 w-4" />
                    Esporta asset CSV
                  </Button>
                </>
              )}
            </div>
          </div>
          {user?.ruolo !== "Admin" && (
            <p className="text-xs text-muted-foreground">
              Export CSV disponibile solo per ruolo Admin.
            </p>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reparto</TableHead>
                <TableHead className="text-right">Numero Asset</TableHead>
                <TableHead className="text-right">Valore Totale</TableHead>
                <TableHead>Asset piu vecchio</TableHead>
                <TableHead>Asset piu recente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentReport.map((row) => {
                const isSelected = selectedDepartment !== "ALL" && selectedDepartment === row.reparto;
                return (
                  <TableRow
                    key={row.reparto}
                    className="cursor-pointer"
                    data-state={isSelected ? "selected" : undefined}
                    onClick={() => setSelectedDepartment(row.reparto)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{row.reparto}</span>
                        {isSelected && <Badge variant="info">Selezionato</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{row.numeroAsset}</TableCell>
                    <TableCell className="text-right">{formatCurrency(row.valoreTotale)}</TableCell>
                    <TableCell>{row.assetPiuVecchio !== "-" ? formatDate(row.assetPiuVecchio) : "-"}</TableCell>
                    <TableCell>{row.assetPiuRecente !== "-" ? formatDate(row.assetPiuRecente) : "-"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <div className="space-y-2">
            <h3 className="font-semibold">
              Dettaglio asset
              {selectedReport ? ` - ${selectedReport.reparto}` : " - tutti i reparti"}
            </h3>
            <div className="rounded-md border">
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
                  {reportAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.id}</TableCell>
                      <TableCell>{asset.nome}</TableCell>
                      <TableCell>{asset.categoria}</TableCell>
                      <TableCell>{asset.stato}</TableCell>
                      <TableCell>{formatDate(asset.dataAcquisto)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(asset.costo)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
