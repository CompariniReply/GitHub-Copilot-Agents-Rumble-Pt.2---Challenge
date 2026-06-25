import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { mockAssets } from "@/lib/mock-data";
import type { Asset, AssetCategory } from "@/lib/types";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  BRANDS_BY_CATEGORY,
  formatCurrency,
  formatDate,
  parseDate,
  getStatusBadgeVariant,
} from "@/lib/asset-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from "lucide-react";

const PAGE_SIZE = 20;

type SortKey = keyof Asset;
type SortDir = "asc" | "desc";

export function CatalogPage() {
  const { permissions } = useAuth();

  // --- State ---
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // --- Filtering & Sorting ---
  const filteredAssets = useMemo(() => {
    let result = assets;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.nome.toLowerCase().includes(q) ||
          a.marca.toLowerCase().includes(q) ||
          a.modello.toLowerCase().includes(q)
      );
    }

    if (filterCategory) {
      result = result.filter((a) => a.categoria === filterCategory);
    }

    if (filterStatus) {
      result = result.filter((a) => a.stato === filterStatus);
    }

    result = [...result].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;

      let comparison: number;
      if (sortKey === "dataAcquisto") {
        comparison =
          parseDate(aVal as string).getTime() -
          parseDate(bVal as string).getTime();
      } else if (sortKey === "costo" || sortKey === "garanziaMesi") {
        comparison = (aVal as number) - (bVal as number);
      } else {
        comparison = String(aVal).localeCompare(String(bVal), "it");
      }
      return sortDir === "asc" ? comparison : -comparison;
    });

    return result;
  }, [assets, search, filterCategory, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredAssets.length / PAGE_SIZE));
  const paginatedAssets = filteredAssets.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // --- Handlers ---
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function getSortIcon(key: SortKey) {
    if (sortKey !== key) return <ArrowUpDown className="ml-1 h-3 w-3 inline" />;
    return sortDir === "asc" ? (
      <ArrowUp className="ml-1 h-3 w-3 inline" />
    ) : (
      <ArrowDown className="ml-1 h-3 w-3 inline" />
    );
  }

  function resetFilters() {
    setSearch("");
    setFilterCategory("");
    setFilterStatus("");
    setPage(1);
  }

  function handleAssetCreated(newAsset: Asset) {
    setAssets((prev) => [...prev, newAsset]);
    setShowCreateForm(false);
    setNotification("Asset creato con successo");
    setTimeout(() => setNotification(null), 3000);
  }

  // Reset page when filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };
  const handleCategoryChange = (value: string) => {
    setFilterCategory(value);
    setPage(1);
  };
  const handleStatusChange = (value: string) => {
    setFilterStatus(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogo Asset</h1>
          <p className="text-muted-foreground mt-1">
            Elenco completo degli asset aziendali
          </p>
        </div>
        {permissions.canCreate && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" />
            Nuovo Asset
          </Button>
        )}
      </div>

      {/* Notification */}
      {notification && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notification}
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome, marca o modello..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
        <div>
          <Select
            value={filterCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">Tutte le categorie</option>
            {ASSET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Select
            value={filterStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
          >
            <option value="">Tutti gli stati</option>
            {ASSET_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </Select>
        </div>
        {(search || filterCategory || filterStatus) && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="h-4 w-4" />
            Reset filtri
          </Button>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filteredAssets.length} asset trovati
      </p>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("id")}
              >
                ID Asset {getSortIcon("id")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("nome")}
              >
                Nome {getSortIcon("nome")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("categoria")}
              >
                Categoria {getSortIcon("categoria")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("marca")}
              >
                Marca {getSortIcon("marca")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("modello")}
              >
                Modello {getSortIcon("modello")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("numeroSeriale")}
              >
                Numero Seriale {getSortIcon("numeroSeriale")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("stato")}
              >
                Stato {getSortIcon("stato")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("assegnatoA")}
              >
                Assegnato a {getSortIcon("assegnatoA")}
              </TableHead>
              <TableHead
                className="cursor-pointer select-none"
                onClick={() => handleSort("dataAcquisto")}
              >
                Data Acquisto {getSortIcon("dataAcquisto")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssets.map((asset) => (
              <TableRow
                key={asset.id}
                className="cursor-pointer"
                onClick={() => setSelectedAsset(asset)}
              >
                <TableCell className="font-mono text-xs">
                  {asset.id}
                </TableCell>
                <TableCell className="font-medium">{asset.nome}</TableCell>
                <TableCell>{asset.categoria}</TableCell>
                <TableCell>{asset.marca}</TableCell>
                <TableCell>{asset.modello}</TableCell>
                <TableCell className="font-mono text-xs">
                  {asset.numeroSeriale}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(asset.stato)}>
                    {asset.stato}
                  </Badge>
                </TableCell>
                <TableCell>{asset.assegnatoA ?? "—"}</TableCell>
                <TableCell>{asset.dataAcquisto}</TableCell>
              </TableRow>
            ))}
            {paginatedAssets.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Nessun asset trovato.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {page} di {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Precedente
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Successiva
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <AssetDetailDialog
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
      />

      {/* Create Form Dialog */}
      <CreateAssetDialog
        open={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onCreated={handleAssetCreated}
      />
    </div>
  );
}

// --- Asset Detail Dialog ---
function AssetDetailDialog({
  asset,
  onClose,
}: {
  asset: Asset | null;
  onClose: () => void;
}) {
  if (!asset) return null;

  return (
    <Dialog open={!!asset} onOpenChange={() => onClose()}>
      <DialogHeader>
        <DialogTitle>{asset.nome}</DialogTitle>
      </DialogHeader>
      <div className="mt-4 space-y-6">
        {/* Placeholder image */}
        <div className="h-32 w-full rounded-md bg-muted flex items-center justify-center text-muted-foreground text-sm">
          Immagine placeholder
        </div>

        {/* Dati Generali */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dati Generali</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Nome</dt>
              <dd>{asset.nome}</dd>
              <dt className="text-muted-foreground">Categoria</dt>
              <dd>{asset.categoria}</dd>
              <dt className="text-muted-foreground">Marca</dt>
              <dd>{asset.marca}</dd>
              <dt className="text-muted-foreground">Modello</dt>
              <dd>{asset.modello}</dd>
              <dt className="text-muted-foreground">Numero Seriale</dt>
              <dd className="font-mono text-xs">{asset.numeroSeriale}</dd>
            </dl>
          </CardContent>
        </Card>

        {/* Dettagli Tecnici */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dettagli Tecnici</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Data Acquisto</dt>
              <dd>{formatDate(asset.dataAcquisto)}</dd>
              <dt className="text-muted-foreground">Costo</dt>
              <dd>{formatCurrency(asset.costo)}</dd>
              <dt className="text-muted-foreground">Garanzia</dt>
              <dd>{asset.garanziaMesi} mesi</dd>
              {asset.note && (
                <>
                  <dt className="text-muted-foreground">Note</dt>
                  <dd>{asset.note}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Assegnazione */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assegnazione</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Assegnato a</dt>
              <dd>{asset.assegnatoA ?? "Non assegnato"}</dd>
              <dt className="text-muted-foreground">Reparto</dt>
              <dd>{asset.reparto ?? "—"}</dd>
              {asset.ubicazione && (
                <>
                  <dt className="text-muted-foreground">Ubicazione</dt>
                  <dd>{asset.ubicazione}</dd>
                </>
              )}
            </dl>
          </CardContent>
        </Card>

        {/* Ciclo di Vita */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ciclo di Vita</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Stato corrente</dt>
              <dd>
                <Badge variant={getStatusBadgeVariant(asset.stato)}>
                  {asset.stato}
                </Badge>
              </dd>
            </dl>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Chiudi
        </Button>
      </div>
    </Dialog>
  );
}

// --- Create Asset Dialog ---
interface FormErrors {
  [key: string]: string;
}

function CreateAssetDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (asset: Asset) => void;
}) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState<AssetCategory | "">("");
  const [marca, setMarca] = useState("");
  const [modello, setModello] = useState("");
  const [numeroSeriale, setNumeroSeriale] = useState("");
  const [dataAcquisto, setDataAcquisto] = useState("");
  const [costo, setCosto] = useState("");
  const [garanziaMesi, setGaranziaMesi] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const availableBrands = categoria
    ? BRANDS_BY_CATEGORY[categoria as AssetCategory] ?? []
    : [];

  function resetForm() {
    setNome("");
    setCategoria("");
    setMarca("");
    setModello("");
    setNumeroSeriale("");
    setDataAcquisto("");
    setCosto("");
    setGaranziaMesi("");
    setNote("");
    setErrors({});
  }

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!nome.trim()) newErrors.nome = "Campo obbligatorio";
    if (!categoria) newErrors.categoria = "Campo obbligatorio";
    if (!marca) newErrors.marca = "Campo obbligatorio";
    if (!modello.trim()) newErrors.modello = "Campo obbligatorio";
    if (!numeroSeriale.trim()) newErrors.numeroSeriale = "Campo obbligatorio";
    if (!dataAcquisto) newErrors.dataAcquisto = "Campo obbligatorio";
    if (!costo || isNaN(Number(costo)) || Number(costo) <= 0)
      newErrors.costo = "Campo obbligatorio";
    if (
      !garanziaMesi ||
      isNaN(Number(garanziaMesi)) ||
      Number(garanziaMesi) <= 0
    )
      newErrors.garanziaMesi = "Campo obbligatorio";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    // Convert date from yyyy-mm-dd input to dd/mm/yyyy
    const [year, month, day] = dataAcquisto.split("-");
    const formattedDate = `${day}/${month}/${year}`;

    const newAsset: Asset = {
      id: `A${String(Date.now()).slice(-3)}`,
      nome: nome.trim(),
      categoria: categoria as AssetCategory,
      marca,
      modello: modello.trim(),
      numeroSeriale: numeroSeriale.trim(),
      dataAcquisto: formattedDate,
      costo: Number(costo),
      garanziaMesi: Number(garanziaMesi),
      stato: "Disponibile",
      assegnatoA: null,
      reparto: null,
      note: note.trim() || undefined,
    };

    onCreated(newAsset);
    resetForm();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  // Reset marca when category changes
  function handleCategoryChange(value: string) {
    setCategoria(value as AssetCategory | "");
    setMarca("");
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogHeader>
        <DialogTitle>Nuovo Asset</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="es. MacBook Pro 16&quot;"
          />
          {errors.nome && (
            <p className="text-sm text-destructive">{errors.nome}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria *</Label>
          <Select
            id="categoria"
            value={categoria}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">Seleziona categoria</option>
            {ASSET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          {errors.categoria && (
            <p className="text-sm text-destructive">{errors.categoria}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Select
            id="marca"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
            disabled={!categoria}
          >
            <option value="">Seleziona marca</option>
            {availableBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </Select>
          {errors.marca && (
            <p className="text-sm text-destructive">{errors.marca}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="modello">Modello *</Label>
          <Input
            id="modello"
            value={modello}
            onChange={(e) => setModello(e.target.value)}
            placeholder="es. MacBook Pro M3 Max"
          />
          {errors.modello && (
            <p className="text-sm text-destructive">{errors.modello}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroSeriale">Numero Seriale *</Label>
          <Input
            id="numeroSeriale"
            value={numeroSeriale}
            onChange={(e) => setNumeroSeriale(e.target.value)}
            placeholder="es. ASSET-SN-2024-035"
          />
          {errors.numeroSeriale && (
            <p className="text-sm text-destructive">{errors.numeroSeriale}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dataAcquisto">Data Acquisto *</Label>
            <Input
              id="dataAcquisto"
              type="date"
              value={dataAcquisto}
              onChange={(e) => setDataAcquisto(e.target.value)}
            />
            {errors.dataAcquisto && (
              <p className="text-sm text-destructive">{errors.dataAcquisto}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="costo">Costo (€) *</Label>
            <Input
              id="costo"
              type="number"
              min="0"
              step="1"
              value={costo}
              onChange={(e) => setCosto(e.target.value)}
              placeholder="es. 1299"
            />
            {errors.costo && (
              <p className="text-sm text-destructive">{errors.costo}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="garanziaMesi">Garanzia (mesi) *</Label>
          <Input
            id="garanziaMesi"
            type="number"
            min="0"
            value={garanziaMesi}
            onChange={(e) => setGaranziaMesi(e.target.value)}
            placeholder="es. 24"
          />
          {errors.garanziaMesi && (
            <p className="text-sm text-destructive">{errors.garanziaMesi}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <Input
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note aggiuntive (opzionale)"
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Annulla
          </Button>
          <Button type="submit">Salva</Button>
        </div>
      </form>
    </Dialog>
  );
}
