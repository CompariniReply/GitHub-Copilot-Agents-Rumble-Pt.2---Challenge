import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { mockAssets } from "@/lib/mock-data";
import type { Asset, AssetCategory, AssetStatus } from "@/lib/types";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { Search, Plus, ArrowUpDown, X } from "lucide-react";

type SortField = keyof Pick<Asset, "id" | "nome" | "categoria" | "marca" | "modello" | "numeroSeriale" | "stato" | "dataAcquisto">;
type SortDir = "asc" | "desc";

const ITEMS_PER_PAGE = 20;

export function CatalogPage() {
  const { permissions } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategoria, setFilterCategoria] = useState<AssetCategory | "">("");
  const [filterStato, setFilterStato] = useState<AssetStatus | "">("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Filtraggio
  const filteredAssets = useMemo(() => {
    let assets = [...mockAssets];

    // Ricerca full-text
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      assets = assets.filter(
        (a) =>
          a.nome.toLowerCase().includes(q) ||
          a.marca.toLowerCase().includes(q) ||
          a.modello.toLowerCase().includes(q) ||
          a.numeroSeriale.toLowerCase().includes(q)
      );
    }

    // Filtro categoria
    if (filterCategoria) {
      assets = assets.filter((a) => a.categoria === filterCategoria);
    }

    // Filtro stato
    if (filterStato) {
      assets = assets.filter((a) => a.stato === filterStato);
    }

    // Ordinamento
    assets.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const compare = String(aVal).localeCompare(String(bVal));
      return sortDir === "asc" ? compare : -compare;
    });

    return assets;
  }, [searchQuery, filterCategoria, filterStato, sortField, sortDir]);

  // Paginazione
  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredAssets.slice(start, end);
  }, [filteredAssets, currentPage]);

  // Reset pagina quando cambiano i filtri
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoriaChange = (value: AssetCategory | "") => {
    setFilterCategoria(value);
    setCurrentPage(1);
  };

  const handleStatoChange = (value: AssetStatus | "") => {
    setFilterStato(value);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterCategoria("");
    setFilterStato("");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchQuery || filterCategoria || filterStato;

  const statoBadgeVariant = (stato: AssetStatus) => {
    switch (stato) {
      case "In uso":
        return "default" as const;
      case "Disponibile":
        return "secondary" as const;
      case "In manutenzione":
        return "info" as const;
      case "Dismesso":
        return "outline" as const;
      default:
        return "outline" as const;
    }
  };

  const categorie: AssetCategory[] = [
    "Laptop",
    "Monitor",
    "Smartphone",
    "Tablet",
    "Stampanti",
    "Server",
    "Accessori IT",
    "Dispositivi di Rete",
  ];

  const stati: AssetStatus[] = [
    "In uso",
    "Disponibile",
    "In manutenzione",
    "Dismesso",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogo Asset</h1>
          <p className="text-muted-foreground mt-1">
            Elenco completo degli asset aziendali ({filteredAssets.length} elementi)
          </p>
        </div>
        {permissions.canCreate && (
          <Button>
            <Plus className="h-4 w-4" />
            Nuovo Asset
          </Button>
        )}
      </div>

      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, marca, modello o numero seriale..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={filterCategoria}
          onChange={(e) => handleCategoriaChange(e.target.value as AssetCategory | "")}
          className="w-full sm:w-48"
        >
          <option value="">Tutte le categorie</option>
          {categorie.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          value={filterStato}
          onChange={(e) => handleStatoChange(e.target.value as AssetStatus | "")}
          className="w-full sm:w-48"
        >
          <option value="">Tutti gli stati</option>
          {stati.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        {hasActiveFilters && (
          <Button variant="outline" onClick={handleResetFilters}>
            <X className="h-4 w-4" />
            Reset filtri
          </Button>
        )}
      </div>

      {/* Tabella */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("id")}
                    className="flex items-center gap-1 h-auto p-0 hover:bg-transparent"
                  >
                    ID Asset <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("nome")}
                    className="flex items-center gap-1 h-auto p-0 hover:bg-transparent"
                  >
                    Nome <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("categoria")}
                    className="flex items-center gap-1 h-auto p-0 hover:bg-transparent"
                  >
                    Categoria <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("marca")}
                    className="flex items-center gap-1 h-auto p-0 hover:bg-transparent"
                  >
                    Marca <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("modello")}
                    className="flex items-center gap-1 h-auto p-0 hover:bg-transparent"
                  >
                    Modello <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("numeroSeriale")}
                    className="flex items-center gap-1 h-auto p-0 hover:bg-transparent"
                  >
                    Numero Seriale <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("stato")}
                    className="flex items-center gap-1 h-auto p-0 hover:bg-transparent"
                  >
                    Stato <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Assegnato a</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort("dataAcquisto")}
                    className="flex items-center gap-1 h-auto p-0 hover:bg-transparent"
                  >
                    Data Acquisto <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    Nessun asset trovato
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.id}</TableCell>
                    <TableCell className="font-medium">{asset.nome}</TableCell>
                    <TableCell>{asset.categoria}</TableCell>
                    <TableCell>{asset.marca}</TableCell>
                    <TableCell className="text-muted-foreground">{asset.modello}</TableCell>
                    <TableCell className="font-mono text-xs">{asset.numeroSeriale}</TableCell>
                    <TableCell>
                      <Badge variant={statoBadgeVariant(asset.stato)}>{asset.stato}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.assegnatoA || "—"}
                    </TableCell>
                    <TableCell>{asset.dataAcquisto}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginazione */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
