import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Monitor, CheckCircle, Wrench, XCircle } from "lucide-react";
import { mockAssets } from "@/lib/mock-data";

export function DashboardPage() {
  const { user } = useAuth();

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
    </div>
  );
}
