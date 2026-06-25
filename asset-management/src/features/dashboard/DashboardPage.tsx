import { useMemo, useState } from "react";
import { Download, Monitor, Package, PieChart, Wrench, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { DonutChart, HorizontalBarChart, StackedBarChart, type StackedRow } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ASSET_CATEGORIES, ASSET_STATUSES, CHART_PALETTE, STATUS_COLORS, formatCurrency, getStatusBadgeVariant, parseDate } from "@/lib/asset-helpers";
import { downloadCSV } from "@/lib/csv";
import { mockAssets, mockDepartments } from "@/lib/mock-data";
import type { Asset, AssetCategory, AssetStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type DepartmentReport = {
  reparto: string;
  assetCount: number;
  totalValue: number;
  oldestAsset: Asset | null;
  newestAsset: Asset | null;
  assets: Asset[];
};

function countByStatus(status: AssetStatus) {
  return mockAssets.filter((asset) => asset.stato === status).length;
}

function countByCategory(category: AssetCategory) {
  return mockAssets.filter((asset) => asset.categoria === category).length;
}

function compareAssetPurchaseDate(firstAsset: Asset, secondAsset: Asset) {
  return parseDate(firstAsset.dataAcquisto).getTime() - parseDate(secondAsset.dataAcquisto).getTime();
}

function buildDepartmentReport(): DepartmentReport[] {
  const departmentNames = [...new Set(mockDepartments.map((department) => department.nome))];

  return departmentNames
    .map((departmentName) => {
      const assets = mockAssets
        .filter((asset) => asset.reparto === departmentName)
        .sort(compareAssetPurchaseDate);

      return {
        reparto: departmentName,
        assetCount: assets.length,
        totalValue: assets.reduce((sum, asset) => sum + asset.costo, 0),
        oldestAsset: assets[0] ?? null,
        newestAsset: assets.at(-1) ?? null,
        assets,
      };
    })
    .filter((department) => department.assetCount > 0)
    .sort((firstDepartment, secondDepartment) => secondDepartment.assetCount - firstDepartment.assetCount);
}

function assetRowsForCSV(assets: Asset[]) {
  return assets.map((asset) => ({
    "ID Asset": asset.id,
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
  }));
}

export function DashboardPage() {
  const { permissions, user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const canExportCSV = permissions.canViewReports;

  const statusCounts = useMemo(
    () => ASSET_STATUSES.map((status) => ({ label: status, value: countByStatus(status), color: STATUS_COLORS[status] })),
    []
  );

  const categoryCounts = useMemo(
    () =>
      ASSET_CATEGORIES.map((category, index) => ({
        label: category,
        value: countByCategory(category),
        color: CHART_PALETTE[index % CHART_PALETTE.length],
      })).sort((firstCategory, secondCategory) => secondCategory.value - firstCategory.value),
    []
  );

  const departmentReport = useMemo(() => buildDepartmentReport(), []);
  const selectedDepartmentReport =
    departmentReport.find((department) => department.reparto === selectedDepartment) ?? departmentReport[0] ?? null;

  const categoryStatusRows = useMemo<StackedRow[]>(
    () =>
      ASSET_CATEGORIES.map((category) => ({
        label: category,
        segments: ASSET_STATUSES.map((status) => ({
          label: status,
          value: mockAssets.filter((asset) => asset.categoria === category && asset.stato === status).length,
          color: STATUS_COLORS[status],
        })),
      })),
    []
  );

  const totalValue = mockAssets.reduce((sum, asset) => sum + asset.costo, 0);
  const kpis = [
    { label: "Totale Asset", value: mockAssets.length, icon: Package, color: "text-sky-700 bg-sky-50" },
    { label: "Asset In Uso", value: countByStatus("In uso"), icon: Monitor, color: "text-blue-700 bg-blue-50" },
    { label: "Disponibili", value: countByStatus("Disponibile"), icon: PieChart, color: "text-emerald-700 bg-emerald-50" },
    { label: "In Manutenzione", value: countByStatus("In manutenzione"), icon: Wrench, color: "text-amber-700 bg-amber-50" },
    { label: "Dismessi", value: countByStatus("Dismesso"), icon: XCircle, color: "text-slate-700 bg-slate-100" },
  ];

  const handleExportCatalog = () => {
    downloadCSV("asset_export", assetRowsForCSV(mockAssets));
  };

  const handleExportDepartmentReport = () => {
    downloadCSV(
      "report_reparti",
      departmentReport.map((department) => ({
        Reparto: department.reparto,
        "Numero Asset": department.assetCount,
        "Valore Totale": department.totalValue,
        "Asset piu vecchio": department.oldestAsset?.nome ?? "",
        "Asset piu recente": department.newestAsset?.nome ?? "",
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Benvenuto, {user?.nome}! KPI, report e distribuzioni calcolati dal catalogo asset.
          </p>
        </div>
        {permissions.canViewReports && canExportCSV ? (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={handleExportDepartmentReport}>
              <Download className="h-4 w-4" />
              Export report
            </Button>
            <Button onClick={handleExportCatalog}>
              <Download className="h-4 w-4" />
              Export catalogo
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              <div className={cn("rounded-md p-2", kpi.color)}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="text-lg">Valore inventario</CardTitle>
            <CardDescription>Valore complessivo degli asset registrati nel catalogo.</CardDescription>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totalValue)}</div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuzione per Stato</CardTitle>
            <CardDescription>Vista sintetica dello stato operativo del parco asset.</CardDescription>
          </CardHeader>
          <CardContent>
            <DonutChart data={statusCounts} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribuzione per Categoria</CardTitle>
            <CardDescription>Conteggio degli asset per famiglia tecnologica.</CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart data={categoryCounts} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Asset per Reparto</CardTitle>
          <CardDescription>Report di distribuzione con valore, anzianita e dettaglio selezionabile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <HorizontalBarChart
            data={departmentReport.map((department, index) => ({
              label: department.reparto,
              value: department.assetCount,
              color: CHART_PALETTE[index % CHART_PALETTE.length],
            }))}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reparto</TableHead>
                <TableHead>Numero Asset</TableHead>
                <TableHead>Valore Totale</TableHead>
                <TableHead>Asset piu vecchio</TableHead>
                <TableHead>Asset piu recente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentReport.map((department) => (
                <TableRow
                  key={department.reparto}
                  className="cursor-pointer"
                  data-state={selectedDepartmentReport?.reparto === department.reparto ? "selected" : undefined}
                  onClick={() => setSelectedDepartment(department.reparto)}
                >
                  <TableCell className="font-medium">{department.reparto}</TableCell>
                  <TableCell>{department.assetCount}</TableCell>
                  <TableCell>{formatCurrency(department.totalValue)}</TableCell>
                  <TableCell>{department.oldestAsset?.nome ?? "-"}</TableCell>
                  <TableCell>{department.newestAsset?.nome ?? "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedDepartmentReport ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dettaglio {selectedDepartmentReport.reparto}</CardTitle>
            <CardDescription>
              {selectedDepartmentReport.assetCount} asset per un valore di {formatCurrency(selectedDepartmentReport.totalValue)}.
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                {selectedDepartmentReport.assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell>{asset.id}</TableCell>
                    <TableCell className="font-medium">{asset.nome}</TableCell>
                    <TableCell>{asset.categoria}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(asset.stato)}>{asset.stato}</Badge>
                    </TableCell>
                    <TableCell>{asset.assegnatoA ?? "-"}</TableCell>
                    <TableCell>{formatCurrency(asset.costo)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categoria per Stato</CardTitle>
          <CardDescription>Distribuzione impilata per individuare disponibilita, uso e manutenzioni.</CardDescription>
        </CardHeader>
        <CardContent>
          <StackedBarChart data={categoryStatusRows} />
        </CardContent>
      </Card>
    </div>
  );
}
