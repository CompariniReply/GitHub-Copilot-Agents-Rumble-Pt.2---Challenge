import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { mockAssets, mockDepartments } from "@/lib/mock-data";
import type { Asset, AssetCategory } from "@/lib/types";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  BRANDS_BY_CATEGORY,
  formatCurrency,
  formatDate,
  getStatusBadgeVariant,
  parseDate,
} from "@/lib/asset-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDown,
  ArrowUpDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Laptop2,
  PackagePlus,
  Search,
  X,
} from "lucide-react";
import { downloadCSV } from "@/lib/csv";

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

const PAGE_SIZE = 20;
const REQUIRED_MESSAGE = "Campo obbligatorio";

const createAssetSchema = z.object({
  nome: z.string().trim().min(1, REQUIRED_MESSAGE),
  categoria: z.string().trim().min(1, REQUIRED_MESSAGE),
  marca: z.string().trim().min(1, REQUIRED_MESSAGE),
  modello: z.string().trim().min(1, REQUIRED_MESSAGE),
  numeroSeriale: z.string().trim().min(1, REQUIRED_MESSAGE),
  dataAcquisto: z.string().trim().min(1, REQUIRED_MESSAGE),
  costo: z.coerce.number().positive(REQUIRED_MESSAGE),
  garanziaMesi: z.coerce.number().int().min(1, REQUIRED_MESSAGE),
  note: z.string().optional(),
});

type CreateAssetFormInput = z.input<typeof createAssetSchema>;
type CreateAssetFormValues = z.output<typeof createAssetSchema>;

function compareAssets(a: Asset, b: Asset, field: SortField, direction: SortDirection) {
  let result: number;

  if (field === "dataAcquisto") {
    result = parseDate(a.dataAcquisto).getTime() - parseDate(b.dataAcquisto).getTime();
  } else {
    const left = (a[field] ?? "").toString();
    const right = (b[field] ?? "").toString();
    result = left.localeCompare(right, "it-IT", { numeric: true, sensitivity: "base" });
  }

  return direction === "asc" ? result : -result;
}

export function CatalogPage() {
  const { permissions, hasRole } = useAuth();

  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [sortField, setSortField] = useState<SortField>("nome");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAssetFormInput, unknown, CreateAssetFormValues>({
    resolver: zodResolver(createAssetSchema),
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

  const selectedCategory = useWatch({ control, name: "categoria" });

  const departmentOptions = useMemo(
    () => [...new Set(mockDepartments.map((department) => department.nome))].sort((a, b) => a.localeCompare(b, "it-IT")),
    []
  );

  const availableBrands = useMemo(() => {
    if (!selectedCategory || !ASSET_CATEGORIES.includes(selectedCategory as AssetCategory)) {
      return [];
    }
    return BRANDS_BY_CATEGORY[selectedCategory as AssetCategory];
  }, [selectedCategory]);

  const filteredAssets = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return assets.filter((asset) => {
      if (categoryFilter && asset.categoria !== categoryFilter) return false;
      if (statusFilter && asset.stato !== statusFilter) return false;
      if (departmentFilter && asset.reparto !== departmentFilter) return false;

      if (!normalizedQuery) return true;

      return [asset.nome, asset.marca, asset.modello]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);
    });
  }, [assets, searchQuery, categoryFilter, statusFilter, departmentFilter]);

  const sortedAssets = useMemo(
    () => [...filteredAssets].sort((a, b) => compareAssets(a, b, sortField, sortDirection)),
    [filteredAssets, sortField, sortDirection]
  );

  const totalPages = Math.max(1, Math.ceil(sortedAssets.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedAssets = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return sortedAssets.slice(start, start + PAGE_SIZE);
  }, [sortedAssets, safeCurrentPage]);

  useEffect(() => {
    const currentBrand = getValues("marca");
    if (!selectedCategory || !ASSET_CATEGORIES.includes(selectedCategory as AssetCategory)) {
      if (currentBrand) setValue("marca", "");
      return;
    }

    const brands = BRANDS_BY_CATEGORY[selectedCategory as AssetCategory];
    if (currentBrand && !brands.includes(currentBrand)) {
      setValue("marca", "");
    }
  }, [selectedCategory, getValues, setValue]);

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      setCurrentPage(1);
      return;
    }

    setSortField(field);
    setSortDirection("asc");
    setCurrentPage(1);
  }

  function resetFilters() {
    setSearchQuery("");
    setCategoryFilter("");
    setStatusFilter("");
    setDepartmentFilter("");
  }

  function closeCreateForm() {
    setIsCreateOpen(false);
    reset();
  }

  function exportFilteredAssetsCsv() {
    const rows = sortedAssets.map((asset) => ({
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
    }));

    downloadCSV("asset_export", rows);
  }

  function toMockDateFormat(value: string) {
    return formatDate(new Date(value));
  }

  const onCreateAsset = handleSubmit(async (formValues) => {
    const maxNumericId = assets.reduce((max, asset) => {
      const numericId = Number(asset.id.replace("A", ""));
      return Number.isNaN(numericId) ? max : Math.max(max, numericId);
    }, 0);

    const newAsset: Asset = {
      id: `A${String(maxNumericId + 1).padStart(3, "0")}`,
      nome: formValues.nome.trim(),
      categoria: formValues.categoria as AssetCategory,
      marca: formValues.marca.trim(),
      modello: formValues.modello.trim(),
      numeroSeriale: formValues.numeroSeriale.trim(),
      dataAcquisto: toMockDateFormat(formValues.dataAcquisto),
      costo: formValues.costo,
      garanziaMesi: formValues.garanziaMesi,
      stato: "Disponibile",
      assegnatoA: null,
      reparto: null,
      note: formValues.note?.trim() || undefined,
    };

    setAssets((current) => [newAsset, ...current]);
    setSelectedAsset(newAsset);
    setCurrentPage(1);
    setSuccessMessage("Asset creato con successo");
    closeCreateForm();
  });

  function renderSortableHeader(field: SortField, label: string, alignRight = false) {
    const isActive = sortField === field;

    return (
      <button
        type="button"
        onClick={() => handleSort(field)}
        className={`flex items-center gap-1 text-left hover:text-foreground cursor-pointer ${alignRight ? "ml-auto" : ""}`}
      >
        <span>{label}</span>
        {isActive ? (
          sortDirection === "asc" ? (
            <ArrowUp className="h-3 w-3" aria-label="Ordinamento crescente" />
          ) : (
            <ArrowDown className="h-3 w-3" aria-label="Ordinamento decrescente" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 text-muted-foreground" aria-label="Ordinabile" />
        )}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogo Asset</h1>
          <p className="text-muted-foreground mt-1">Gestione e consultazione del catalogo completo degli asset aziendali.</p>
        </div>
        {permissions.canCreate && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <PackagePlus className="h-4 w-4" />
            Nuovo Asset
          </Button>
        )}
      </div>

      {successMessage && (
        <div className="flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          <span>{successMessage}</span>
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => setSuccessMessage(null)}
            aria-label="Chiudi notifica"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtri e ricerca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(340px,2fr)_minmax(180px,1fr)_minmax(180px,1fr)_minmax(220px,1fr)]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cerca per nome, marca o modello..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9"
              />
            </div>

            <div className="min-w-[180px]">
              <Select
                value={categoryFilter}
                onChange={(event) => {
                  setCategoryFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tutte le categorie</option>
                {ASSET_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </Select>
            </div>

            <div className="min-w-[180px]">
              <Select
                value={statusFilter}
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tutti gli stati</option>
                {ASSET_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>

            <div className="min-w-[220px]">
              <Select
                value={departmentFilter}
                onChange={(event) => {
                  setDepartmentFilter(event.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">Tutti i reparti</option>
                {departmentOptions.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <p className="text-sm text-muted-foreground">
              {sortedAssets.length} asset trovati su {assets.length}
            </p>
            <div className="flex items-center gap-2">
              {hasRole("Admin") && (
                <Button variant="outline" onClick={exportFilteredAssetsCsv} disabled={sortedAssets.length === 0}>
                  <Download className="h-4 w-4" />
                  Esporta CSV
                </Button>
              )}
              <Button variant="outline" onClick={resetFilters}>
                Reset filtri
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table className="table-fixed min-w-[1240px]">
            <colgroup>
              <col className="w-[110px]" />
              <col className="w-[190px]" />
              <col className="w-[130px]" />
              <col className="w-[120px]" />
              <col className="w-[170px]" />
              <col className="w-[190px]" />
              <col className="w-[130px]" />
              <col className="w-[140px]" />
              <col className="w-[140px]" />
            </colgroup>
            <TableHeader className="bg-slate-100 [&_th]:text-slate-700 [&_tr]:border-slate-200">
              <TableRow>
                <TableHead>{renderSortableHeader("id", "ID Asset")}</TableHead>
                <TableHead>{renderSortableHeader("nome", "Nome")}</TableHead>
                <TableHead>{renderSortableHeader("categoria", "Categoria")}</TableHead>
                <TableHead>{renderSortableHeader("marca", "Marca")}</TableHead>
                <TableHead>{renderSortableHeader("modello", "Modello")}</TableHead>
                <TableHead>{renderSortableHeader("numeroSeriale", "Numero Seriale")}</TableHead>
                <TableHead>{renderSortableHeader("stato", "Stato")}</TableHead>
                <TableHead>{renderSortableHeader("assegnatoA", "Assegnato a")}</TableHead>
                <TableHead>{renderSortableHeader("dataAcquisto", "Data Acquisto")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8 text-center text-muted-foreground">
                    Nessun asset trovato con i filtri correnti
                  </TableCell>
                </TableRow>
              ) : (
                paginatedAssets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    className="cursor-pointer"
                    data-state={selectedAsset?.id === asset.id ? "selected" : undefined}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <TableCell className="font-medium">{asset.id}</TableCell>
                    <TableCell>{asset.nome}</TableCell>
                    <TableCell>{asset.categoria}</TableCell>
                    <TableCell>{asset.marca}</TableCell>
                    <TableCell>{asset.modello}</TableCell>
                    <TableCell>{asset.numeroSeriale}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(asset.stato)}>{asset.stato}</Badge>
                    </TableCell>
                    <TableCell>{asset.assegnatoA ?? "-"}</TableCell>
                    <TableCell>{asset.dataAcquisto}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Pagina {safeCurrentPage} di {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(safeCurrentPage - 1)}
            disabled={safeCurrentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Precedente
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(safeCurrentPage + 1)}
            disabled={safeCurrentPage === totalPages}
          >
            Successiva
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-xl">Dettaglio Asset</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Scheda completa del dispositivo selezionato.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSelectedAsset(null)} aria-label="Chiudi dettaglio asset">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted">
                      <Laptop2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{selectedAsset.nome}</h3>
                      <p className="text-sm text-muted-foreground">{selectedAsset.id} • {selectedAsset.categoria}</p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(selectedAsset.stato)}>{selectedAsset.stato}</Badge>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <h4 className="text-sm font-semibold text-muted-foreground">Informazioni</h4>
                  </div>

                  <section className="space-y-2 rounded-md border p-4">
                    <h5 className="font-medium">Dati Generali</h5>
                    <p className="text-sm"><span className="text-muted-foreground">ID Asset:</span> {selectedAsset.id}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Nome:</span> {selectedAsset.nome}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Categoria:</span> {selectedAsset.categoria}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Stato corrente:</span> {selectedAsset.stato}</p>
                  </section>

                  <section className="space-y-2 rounded-md border p-4">
                    <h5 className="font-medium">Dettagli Tecnici</h5>
                    <p className="text-sm"><span className="text-muted-foreground">Marca:</span> {selectedAsset.marca}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Modello:</span> {selectedAsset.modello}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Numero seriale:</span> {selectedAsset.numeroSeriale}</p>
                  </section>

                  <section className="space-y-2 rounded-md border p-4">
                    <h5 className="font-medium">Assegnazione</h5>
                    <p className="text-sm"><span className="text-muted-foreground">Assegnato a:</span> {selectedAsset.assegnatoA ?? "Non assegnato"}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Reparto:</span> {selectedAsset.reparto ?? "N/D"}</p>
                  </section>

                  <section className="space-y-2 rounded-md border p-4">
                    <h5 className="font-medium">Ciclo di Vita</h5>
                    <p className="text-sm"><span className="text-muted-foreground">Data acquisto:</span> {selectedAsset.dataAcquisto}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Costo:</span> {formatCurrency(selectedAsset.costo)}</p>
                    <p className="text-sm"><span className="text-muted-foreground">Garanzia:</span> {selectedAsset.garanziaMesi} mesi</p>
                    <p className="text-sm"><span className="text-muted-foreground">Note:</span> {selectedAsset.note?.trim() ? selectedAsset.note : "Nessuna nota disponibile"}</p>
                  </section>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-xl">Nuovo Asset</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Compila i campi per inserire un nuovo asset elettronico.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeCreateForm} aria-label="Chiudi form nuovo asset">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={onCreateAsset} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="asset-nome">Nome</Label>
                    <Input id="asset-nome" {...register("nome")} aria-invalid={!!errors.nome} />
                    {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset-categoria">Categoria</Label>
                    <Select id="asset-categoria" {...register("categoria")} aria-invalid={!!errors.categoria}>
                      <option value="">Seleziona categoria</option>
                      {ASSET_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                    {errors.categoria && <p className="text-sm text-destructive">{errors.categoria.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset-marca">Marca</Label>
                    <Select id="asset-marca" {...register("marca")} aria-invalid={!!errors.marca} disabled={availableBrands.length === 0}>
                      <option value="">Seleziona marca</option>
                      {availableBrands.map((brand) => (
                        <option key={brand} value={brand}>
                          {brand}
                        </option>
                      ))}
                    </Select>
                    {errors.marca && <p className="text-sm text-destructive">{errors.marca.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset-modello">Modello</Label>
                    <Input id="asset-modello" {...register("modello")} aria-invalid={!!errors.modello} />
                    {errors.modello && <p className="text-sm text-destructive">{errors.modello.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset-seriale">Numero Seriale</Label>
                    <Input id="asset-seriale" {...register("numeroSeriale")} aria-invalid={!!errors.numeroSeriale} />
                    {errors.numeroSeriale && <p className="text-sm text-destructive">{errors.numeroSeriale.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset-data">Data Acquisto</Label>
                    <Input id="asset-data" type="date" {...register("dataAcquisto")} aria-invalid={!!errors.dataAcquisto} />
                    {errors.dataAcquisto && <p className="text-sm text-destructive">{errors.dataAcquisto.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset-costo">Costo (€)</Label>
                    <Input id="asset-costo" type="number" min="1" step="1" {...register("costo")} aria-invalid={!!errors.costo} />
                    {errors.costo && <p className="text-sm text-destructive">{errors.costo.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="asset-garanzia">Garanzia (mesi)</Label>
                    <Input id="asset-garanzia" type="number" min="1" step="1" {...register("garanziaMesi")} aria-invalid={!!errors.garanziaMesi} />
                    {errors.garanziaMesi && <p className="text-sm text-destructive">{errors.garanziaMesi.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="asset-note">Note</Label>
                  <textarea
                    id="asset-note"
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("note")}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={closeCreateForm}>
                    Annulla
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    Salva
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
