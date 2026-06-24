import { useState, useMemo } from "react";
import { mockUsers, mockDepartments, mockAssets } from "@/lib/mock-data";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Search, Users, Building2, ArrowUpDown } from "lucide-react";

type SortField = "nome" | "cognome" | "email" | "reparto" | "sede" | "numAsset";
type SortDir = "asc" | "desc";

export function UsersPage() {
  const [filterReparto, setFilterReparto] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("cognome");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Conta asset per utente
  const assetCountByUser = useMemo(() => {
    const map: Record<string, number> = {};
    for (const asset of mockAssets) {
      if (asset.assegnatoA) {
        map[asset.assegnatoA] = (map[asset.assegnatoA] || 0) + 1;
      }
    }
    return map;
  }, []);

  const filteredUsers = useMemo(() => {
    let users = mockUsers.map((u) => ({
      ...u,
      fullName: `${u.nome} ${u.cognome}`,
      numAsset: assetCountByUser[`${u.nome} ${u.cognome}`] || 0,
    }));

    if (filterReparto) {
      users = users.filter((u) => u.reparto === filterReparto);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      users = users.filter(
        (u) =>
          u.nome.toLowerCase().includes(q) ||
          u.cognome.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.reparto.toLowerCase().includes(q)
      );
    }

    users.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const compare = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? compare : -compare;
    });

    return users;
  }, [filterReparto, searchQuery, sortField, sortDir, assetCountByUser]);

  const reparti = [...new Set(mockUsers.map((u) => u.reparto))].sort();

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const roleBadgeVariant = (ruolo: string) => {
    switch (ruolo) {
      case "Admin": return "default" as const;
      case "Manager": return "info" as const;
      case "Viewer": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Utenti</h1>
        <p className="text-muted-foreground mt-1">
          Elenco dei dipendenti organizzati per reparto
        </p>
      </div>

      {/* KPI Reparti */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dipendenti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Reparti</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDepartments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca dipendente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterReparto}
          onChange={(e) => setFilterReparto(e.target.value)}
          className="w-full sm:w-48"
        >
          <option value="">Tutti i reparti</option>
          {reparti.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>
      </div>

      {/* Tabella dipendenti */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button onClick={() => handleSort("nome")} className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    Nome <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("cognome")} className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    Cognome <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("email")} className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    Email <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("reparto")} className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    Reparto <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => handleSort("sede")} className="flex items-center gap-1 cursor-pointer hover:text-foreground">
                    Sede <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>Ruolo</TableHead>
                <TableHead className="text-right">
                  <button onClick={() => handleSort("numAsset")} className="flex items-center gap-1 cursor-pointer hover:text-foreground ml-auto">
                    N. Asset <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nessun dipendente trovato
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.nome}</TableCell>
                    <TableCell>{user.cognome}</TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{user.reparto}</TableCell>
                    <TableCell>{user.sede}</TableCell>
                    <TableCell>
                      <Badge variant={roleBadgeVariant(user.ruolo)}>{user.ruolo}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{user.numAsset}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Riepilogo Reparti */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Reparti</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reparto</TableHead>
                <TableHead>Sede</TableHead>
                <TableHead>Responsabile</TableHead>
                <TableHead className="text-right">N. Dipendenti</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockDepartments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.nome}</TableCell>
                  <TableCell>{dept.sede}</TableCell>
                  <TableCell>{dept.responsabile}</TableCell>
                  <TableCell className="text-right">{dept.numDipendenti}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
