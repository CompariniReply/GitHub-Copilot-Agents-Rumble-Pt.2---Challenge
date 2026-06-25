import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { mockAssets } from "@/lib/mock-data";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  BRANDS_BY_CATEGORY,
  getStatusBadgeVariant,
  formatCurrency,
  formatDate,
  parseDate,
} from "@/lib/asset-helpers";
import { downloadCSV } from "@/lib/csv";
import type { Asset, AssetCategory } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Plus,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- Types ---
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

type SortDirection = "asc" | "desc";

// --- Zod schema for new asset form ---
const newAssetSchema = z.object({
  nome: z.string().min(1, "Campo obbligatorio"),
  categoria: z.string().min(1, "Campo obbligatorio"),
  marca: z.string().min(1, "Campo obbligatorio"),
  modello: z.string().min(1, "Campo obbligatorio"),
  numeroSeriale: z.string().min(1, "Campo obbligatorio"),
  dataAcquisto: z.string().min(1, "Campo obbligatorio"),
  costo: z.coerce.number().min(0, "Il costo deve essere positivo"),
  garanziaMesi: z.coerce.number().min(0, "Valore non valido"),
  note: z.string().optional(),
});

type NewAssetFormData = z.infer<typeof newAssetSchema>;

const ROWS_PER_PAGE = 20;

export function CatalogPage() {
  const { permissions, hasRole } = useAuth();

  // --- State ---
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // --- Filtering ---
  const filteredAssets = useMemo(() => {
    let result = assets;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.nome.toLowerCase().includes(query) ||
          a.marca.toLowerCase().includes(query) ||
          a.modello.toLowerCase().includes(query)
      );
    }

    if (filterCategory) {
      result = result.filter((a) => a.categoria === filterCategory);
    }

    if (filterStatus) {
      result = result.filter((a) => a.stato === filterStatus);
    }

    return result;
  }, [assets, searchQuery, filterCategory, filterStatus]);

  // --- Sorting ---
  const sortedAssets = useMemo(() => {
    const getSortValue = (asset: Asset): string | number => {
      if (sortField === "dataAcquisto") {
        return parseDate(asset.dataAcquisto).getTime();
      }
      if (sortField === "assegnatoA") {
        return (asset.assegnatoA ?? "").toLowerCase();
      }
      return String(asset[sortField]).toLowerCase();
    };

    const sorted = [...filteredAssets].sort((a, b) => {
      const aVal = getSortValue(a);
      const bVal = getSortValue(b);

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredAssets, sortField, sortDirection]);

  // --- Pagination ---
  const totalPages = Math.max(1, Math.ceil(sortedAssets.length / ROWS_PER_PAGE));
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    return sortedAssets.slice(start, start + ROWS_PER_PAGE);
  }, [sortedAssets, currentPage]);

  // Reset to page 1 when filters change
  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryFilter = (value: string) => {
    setFilterCategory(value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setFilterStatus(value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setFilterCategory("");
    setFilterStatus("");
    setCurrentPage(1);
  };

  // --- Sorting handler ---
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 ml-1" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 ml-1" />
    ) : (
      <ArrowDown className="h-3 w-3 ml-1" />
    );
  };

  // --- CSV Export ---
  const handleExportCSV = () => {
    const rows = filteredAssets.map((a) => ({
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
  };

  // --- Create asset handler ---
  const handleCreateAsset = useCallback(
    (data: NewAssetFormData) => {
      const newId = `A${String(assets.length + 1).padStart(3, "0")}`;
      const newAsset: Asset = {
        id: newId,
        nome: data.nome,
        categoria: data.categoria as AssetCategory,
        marca: data.marca,
        modello: data.modello,
        numeroSeriale: data.numeroSeriale,
        dataAcquisto: data.dataAcquisto,
        costo: data.costo,
        garanziaMesi: data.garanziaMesi,
        stato: "Disponibile",
        assegnatoA: null,
        reparto: null,
        note: data.note || undefined,
      };
      setAssets((prev) => [...prev, newAsset]);
      setShowCreateForm(false);
      setNotification("Asset creato con successo");
      setTimeout(() => setNotification(null), 3000);
    },
    [assets.length]
  );

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
        <div className="flex gap-2">
          {hasRole("Admin") && (
            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Esporta CSV
            </Button>
          )}
          {permissions.canCreate && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Asset
            </Button>
          )}
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {notification}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Cerca</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cerca per nome, marca, modello..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="w-[180px]">
              <Label htmlFor="filter-category">Categoria</Label>
              <Select
                id="filter-category"
                value={filterCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="mt-1"
              >
                <option value="">Tutte</option>
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-[180px]">
              <Label htmlFor="filter-status">Stato</Label>
              <Select
                id="filter-status"
                value={filterStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="mt-1"
              >
                <option value="">Tutti</option>
                {ASSET_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
            <Button variant="ghost" onClick={handleResetFilters}>
              <X className="h-4 w-4 mr-1" />
              Reset filtri
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        {filteredAssets.length} asset trovati
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  className="flex items-center font-medium cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  ID Asset{getSortIcon("id")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium cursor-pointer"
                  onClick={() => handleSort("nome")}
                >
                  Nome{getSortIcon("nome")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium cursor-pointer"
                  onClick={() => handleSort("categoria")}
                >
                  Categoria{getSortIcon("categoria")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium cursor-pointer"
                  onClick={() => handleSort("marca")}
                >
                  Marca{getSortIcon("marca")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium cursor-pointer"
                  onClick={() => handleSort("modello")}
                >
                  Modello{getSortIcon("modello")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium cursor-pointer"
                  onClick={() => handleSort("numeroSeriale")}
                >
                  Numero Seriale{getSortIcon("numeroSeriale")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium cursor-pointer"
                  onClick={() => handleSort("stato")}
                >
                  Stato{getSortIcon("stato")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium cursor-pointer"
                  onClick={() => handleSort("assegnatoA")}
                >
                  Assegnato a{getSortIcon("assegnatoA")}
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center font-medium cursor-pointer"
                  onClick={() => handleSort("dataAcquisto")}
                >
                  Data Acquisto{getSortIcon("dataAcquisto")}
                </button>
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
                <TableRow
                  key={asset.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <TableCell className="font-mono text-xs">{asset.id}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Pagina {currentPage} di {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Precedente
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Successiva
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
        />
      )}

      {/* Create Asset Modal */}
      {showCreateForm && (
        <CreateAssetModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateAsset}
        />
      )}
    </div>
  );
}

// --- Asset Detail Modal ---
function AssetDetailModal({
  asset,
  onClose,
}: {
  asset: Asset;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{asset.nome}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Dati Generali */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Dati Generali
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <DetailField label="ID Asset" value={asset.id} />
              <DetailField label="Nome" value={asset.nome} />
              <DetailField label="Categoria" value={asset.categoria} />
              <DetailField
                label="Stato"
                value={
                  <Badge variant={getStatusBadgeVariant(asset.stato)}>
                    {asset.stato}
                  </Badge>
                }
              />
            </div>
          </section>

          {/* Dettagli Tecnici */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Dettagli Tecnici
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <DetailField label="Marca" value={asset.marca} />
              <DetailField label="Modello" value={asset.modello} />
              <DetailField label="Numero Seriale" value={asset.numeroSeriale} />
              {asset.ubicazione && (
                <DetailField label="Ubicazione" value={asset.ubicazione} />
              )}
            </div>
          </section>

          {/* Assegnazione */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Assegnazione
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <DetailField
                label="Assegnato a"
                value={asset.assegnatoA ?? "Non assegnato"}
              />
              <DetailField
                label="Reparto"
                value={asset.reparto ?? "Nessun reparto"}
              />
            </div>
          </section>

          {/* Ciclo di Vita */}
          <section>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
              Ciclo di Vita
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <DetailField label="Data Acquisto" value={asset.dataAcquisto} />
              <DetailField label="Costo" value={formatCurrency(asset.costo)} />
              <DetailField
                label="Garanzia"
                value={`${asset.garanziaMesi} mesi`}
              />
              <DetailField
                label="Scadenza Garanzia"
                value={(() => {
                  const d = parseDate(asset.dataAcquisto);
                  d.setMonth(d.getMonth() + asset.garanziaMesi);
                  return formatDate(d);
                })()}
              />
            </div>
          </section>

          {/* Note */}
          {asset.note && (
            <section>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Note
              </h3>
              <p className="text-sm">{asset.note}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}

// --- Create Asset Modal ---
function CreateAssetModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: NewAssetFormData) => void;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewAssetFormData>({
    defaultValues: {
      nome: "",
      categoria: "",
      marca: "",
      modello: "",
      numeroSeriale: "",
      dataAcquisto: "",
      costo: 0,
      garanziaMesi: 24,
      note: "",
    },
  });

  const selectedCategory = watch("categoria");
  const availableBrands = selectedCategory
    ? BRANDS_BY_CATEGORY[selectedCategory as AssetCategory] ?? []
    : [];

  const onFormSubmit = (data: NewAssetFormData) => {
    // Validate with zod
    const result = newAssetSchema.safeParse(data);
    if (result.success) {
      onSubmit(result.data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Nuovo Asset</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Nome */}
          <div>
            <Label htmlFor="new-nome">Nome *</Label>
            <Input
              id="new-nome"
              {...register("nome", { required: "Campo obbligatorio" })}
              className="mt-1"
            />
            {errors.nome && (
              <p className="text-xs text-destructive mt-1">
                {errors.nome.message}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <Label htmlFor="new-categoria">Categoria *</Label>
            <Select
              id="new-categoria"
              {...register("categoria", { required: "Campo obbligatorio" })}
              className="mt-1"
            >
              <option value="">Seleziona categoria</option>
              {ASSET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
            {errors.categoria && (
              <p className="text-xs text-destructive mt-1">
                {errors.categoria.message}
              </p>
            )}
          </div>

          {/* Marca */}
          <div>
            <Label htmlFor="new-marca">Marca *</Label>
            <Select
              id="new-marca"
              {...register("marca", { required: "Campo obbligatorio" })}
              className="mt-1"
              disabled={!selectedCategory}
            >
              <option value="">
                {selectedCategory
                  ? "Seleziona marca"
                  : "Seleziona prima la categoria"}
              </option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </Select>
            {errors.marca && (
              <p className="text-xs text-destructive mt-1">
                {errors.marca.message}
              </p>
            )}
          </div>

          {/* Modello */}
          <div>
            <Label htmlFor="new-modello">Modello *</Label>
            <Input
              id="new-modello"
              {...register("modello", { required: "Campo obbligatorio" })}
              className="mt-1"
            />
            {errors.modello && (
              <p className="text-xs text-destructive mt-1">
                {errors.modello.message}
              </p>
            )}
          </div>

          {/* Numero Seriale */}
          <div>
            <Label htmlFor="new-seriale">Numero Seriale *</Label>
            <Input
              id="new-seriale"
              {...register("numeroSeriale", { required: "Campo obbligatorio" })}
              className="mt-1"
            />
            {errors.numeroSeriale && (
              <p className="text-xs text-destructive mt-1">
                {errors.numeroSeriale.message}
              </p>
            )}
          </div>

          {/* Data Acquisto */}
          <div>
            <Label htmlFor="new-data">Data Acquisto (GG/MM/AAAA) *</Label>
            <Input
              id="new-data"
              placeholder="GG/MM/AAAA"
              {...register("dataAcquisto", { required: "Campo obbligatorio" })}
              className="mt-1"
            />
            {errors.dataAcquisto && (
              <p className="text-xs text-destructive mt-1">
                {errors.dataAcquisto.message}
              </p>
            )}
          </div>

          {/* Costo */}
          <div>
            <Label htmlFor="new-costo">Costo (EUR) *</Label>
            <Input
              id="new-costo"
              type="number"
              min="0"
              step="0.01"
              {...register("costo", {
                required: "Campo obbligatorio",
                valueAsNumber: true,
              })}
              className="mt-1"
            />
            {errors.costo && (
              <p className="text-xs text-destructive mt-1">
                {errors.costo.message}
              </p>
            )}
          </div>

          {/* Garanzia */}
          <div>
            <Label htmlFor="new-garanzia">Garanzia (mesi)</Label>
            <Input
              id="new-garanzia"
              type="number"
              min="0"
              {...register("garanziaMesi", { valueAsNumber: true })}
              className="mt-1"
            />
            {errors.garanziaMesi && (
              <p className="text-xs text-destructive mt-1">
                {errors.garanziaMesi.message}
              </p>
            )}
          </div>

          {/* Note */}
          <div>
            <Label htmlFor="new-note">Note</Label>
            <Input
              id="new-note"
              {...register("note")}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit">Salva Asset</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
