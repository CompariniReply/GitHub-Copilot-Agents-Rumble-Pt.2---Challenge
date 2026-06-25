import { useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Plus,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  formatCurrency,
  getStatusBadgeVariant,
  parseDate,
} from "@/lib/asset-helpers";
import { mockAssets, mockDepartments } from "@/lib/mock-data";
import type { Asset } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";
import { AssetDetailDialog } from "./AssetDetailDialog";
import { NewAssetDialog } from "./NewAssetDialog";

type SortField =
  | "id"
  | "nome"
  | "categoria"
  | "marca"
  | "modello"
  | "numeroSeriale"
  | "stato"
  | "assegnatoA"
  | "dataAcquisto";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 20;

export function CatalogPage() {
  const { permissions } = useAuth();
  const [assets, setAssets] = useState<Asset[]>(mockAssets);

  // Filtri (ASSET-008)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategoria, setFilterCategoria] = useState("");
  const [filterStato, setFilterStato] = useState("");
  const [filterReparto, setFilterReparto] = useState("");

  // Ordinamento (ASSET-004)
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  // Paginazione (ASSET-004)
  const [page, setPage] = useState(1);

  // Dettaglio (ASSET-021) e creazione (ASSET-005)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const reparti = useMemo(
    () => [...new Set(mockDepartments.map((d) => d.nome))].sort(),
    []
  );

  const hasActiveFilters =
    searchQuery !== "" ||
    filterCategoria !== "" ||
    filterStato !== "" ||
    filterReparto !== "";

  const filteredSorted = useMemo(() => {
    let list = assets.slice();

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.nome.toLowerCase().includes(q) ||
          a.marca.toLowerCase().includes(q) ||
          a.modello.toLowerCase().includes(q)
      );
    }
    if (filterCategoria) list = list.filter((a) => a.categoria === filterCategoria);
    if (filterStato) list = list.filter((a) => a.stato === filterStato);
    if (filterReparto) list = list.filter((a) => a.reparto === filterReparto);

    list.sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      let cmp: number;
      if (sortField === "dataAcquisto") {
        cmp =
          parseDate(a.dataAcquisto).getTime() - parseDate(b.dataAcquisto).getTime();
      } else {
        cmp = String(av ?? "").localeCompare(String(bv ?? ""), "it", {
          numeric: true,
          sensitivity: "base",
        });
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [
    assets,
    searchQuery,
    filterCategoria,
    filterStato,
    filterReparto,
    sortField,
    sortDir,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedAssets = filteredSorted.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(1);
  }

  function resetFilters() {
    setSearchQuery("");
    setFilterCategoria("");
    setFilterStato("");
    setFilterReparto("");
    setPage(1);
  }

  function handleCreate(asset: Asset) {
    setAssets((prev) => [asset, ...prev]);
    setToast("Asset creato con successo");
    window.setTimeout(() => setToast(null), 3000);
    setPage(1);
  }

  const existingSerials = useMemo(() => assets.map((a) => a.numeroSeriale), [assets]);
  const nextId = useMemo(() => {
    const max = assets.reduce((acc, a) => {
      const n = parseInt(a.id.replace(/\D/g, ""), 10);
      return Number.isFinite(n) && n > acc ? n : acc;
    }, 0);
    return `A${String(max + 1).padStart(3, "0")}`;
  }, [assets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogo Asset</h1>
          <p className="text-muted-foreground mt-1">
            {filteredSorted.length} asset · pagina {currentPage} di {totalPages}
          </p>
        </div>
        {permissions.canCreate && (
          <Button onClick={() => setNewDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Nuovo Asset
          </Button>
        )}
      </div>

      {/* Filtri (ASSET-008) */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome, marca, modello..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={filterCategoria}
          onChange={(e) => {
            setFilterCategoria(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-44"
        >
          <option value="">Tutte le categorie</option>
          {ASSET_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          value={filterStato}
          onChange={(e) => {
            setFilterStato(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-44"
        >
          <option value="">Tutti gli stati</option>
          {ASSET_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={filterReparto}
          onChange={(e) => {
            setFilterReparto(e.target.value);
            setPage(1);
          }}
          className="w-full sm:w-44"
        >
          <option value="">Tutti i reparti</option>
          {reparti.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
        <Button
          variant="outline"
          onClick={resetFilters}
          disabled={!hasActiveFilters}
          className="sm:ml-auto"
        >
          <RotateCcw className="h-4 w-4" />
          Reset filtri
        </Button>
      </div>

      {/* Tabella (ASSET-004) */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableHeader label="ID Asset" field="id" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Nome" field="nome" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Categoria" field="categoria" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Marca" field="marca" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Modello" field="modello" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Numero Seriale" field="numeroSeriale" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Stato" field="stato" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Assegnato a" field="assegnatoA" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
                <SortableHeader label="Data Acquisto" field="dataAcquisto" sortField={sortField} sortDir={sortDir} onSort={handleSort} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                    Nessun asset corrisponde ai filtri impostati
                  </TableCell>
                </TableRow>
              ) : (
                pagedAssets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="cursor-pointer"
                  >
                    <TableCell className="font-medium">{asset.id}</TableCell>
                    <TableCell>{asset.nome}</TableCell>
                    <TableCell>{asset.categoria}</TableCell>
                    <TableCell>{asset.marca}</TableCell>
                    <TableCell className="text-muted-foreground">{asset.modello}</TableCell>
                    <TableCell className="font-mono text-xs">{asset.numeroSeriale}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(asset.stato)}>{asset.stato}</Badge>
                    </TableCell>
                    <TableCell>{asset.assegnatoA ?? "—"}</TableCell>
                    <TableCell>{asset.dataAcquisto}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginazione (ASSET-004) */}
      {filteredSorted.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Mostrati {(currentPage - 1) * PAGE_SIZE + 1}–
            {Math.min(currentPage * PAGE_SIZE, filteredSorted.length)} di{" "}
            {filteredSorted.length} ({formatCurrency(
              filteredSorted.reduce((acc, a) => acc + a.costo, 0)
            )}{" "}
            valore totale)
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Precedente
            </Button>
            <span className="text-sm tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Successiva
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <AssetDetailDialog asset={selectedAsset} onClose={() => setSelectedAsset(null)} />

      {permissions.canCreate && (
        <NewAssetDialog
          open={newDialogOpen}
          onClose={() => setNewDialogOpen(false)}
          onCreate={handleCreate}
          existingSerials={existingSerials}
          nextId={nextId}
        />
      )}

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-md border bg-background px-4 py-3 shadow-lg"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSort: (field: SortField) => void;
}

function SortableHeader({ label, field, sortField, sortDir, onSort }: SortableHeaderProps) {
  const active = sortField === field;
  const Icon = active ? (sortDir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TableHead>
      <button
        onClick={() => onSort(field)}
        className="flex items-center gap-1 cursor-pointer hover:text-foreground"
      >
        {label} <Icon className="h-3 w-3" />
      </button>
    </TableHead>
  );
}
