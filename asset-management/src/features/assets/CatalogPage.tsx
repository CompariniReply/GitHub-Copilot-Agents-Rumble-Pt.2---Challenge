import { useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Plus, Search, ChevronsUpDown, ChevronUp, ChevronDown, Info, Download, ImageIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { mockAssets, mockDepartments } from "@/lib/mock-data";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  BRANDS_BY_CATEGORY,
  formatCurrency,
  getStatusBadgeVariant,
  parseDate,
} from "@/lib/asset-helpers";
import type { Asset, AssetCategory, AssetStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { downloadCSV } from "@/lib/csv";

const PAGE_SIZE = 20;

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

const assetSchema = z.object({
  nome: z.string().min(1, "Campo obbligatorio"),
  categoria: z.enum([
    "Laptop",
    "Monitor",
    "Smartphone",
    "Tablet",
    "Stampanti",
    "Server",
    "Accessori IT",
    "Dispositivi di Rete",
  ]),
  marca: z.string().min(1, "Campo obbligatorio"),
  modello: z.string().min(1, "Campo obbligatorio"),
  numeroSeriale: z.string().min(1, "Campo obbligatorio"),
  dataAcquisto: z
    .string()
    .min(1, "Campo obbligatorio")
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, "Formato data richiesto: GG/MM/AAAA"),
  costo: z
    .string()
    .min(1, "Campo obbligatorio")
    .regex(/^[0-9]+$/, "Inserisci un importo valido"),
  garanziaMesi: z
    .string()
    .min(1, "Campo obbligatorio")
    .regex(/^[0-9]+$/, "Inserisci mesi validi"),
  note: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

function getNextAssetId(assets: Asset[]) {
  const lastId = assets
    .map((asset) => Number(asset.id.replace(/^A0*/, "")))
    .filter((value) => !Number.isNaN(value))
    .sort((firstValue, secondValue) => secondValue - firstValue)[0];
  return `A${String((lastId ?? 0) + 1).padStart(3, "0")}`;
}

function compareValues(valueA: string | null, valueB: string | null) {
  if (valueA === valueB) return 0;
  if (valueA === null) return 1;
  if (valueB === null) return -1;
  return valueA.localeCompare(valueB, "it", { numeric: true, sensitivity: "base" });
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

export function CatalogPage() {
  const { permissions } = useAuth();
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [searchValue, setSearchValue] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | "">("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "">("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("id");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      nome: "",
      categoria: "Laptop",
      marca: "",
      modello: "",
      numeroSeriale: "",
      dataAcquisto: "",
      costo: "",
      garanziaMesi: "",
      note: "",
    },
  });

  const selectedCategory = useWatch({ control: form.control, name: "categoria" }) as AssetCategory;
  const normalizedSearch = searchValue.trim().toLowerCase();
  const canExportCSV = permissions.canViewReports;

  const departmentOptions = useMemo(
    () => [...new Set(mockDepartments.map((department) => department.nome))].sort((firstDepartment, secondDepartment) =>
      firstDepartment.localeCompare(secondDepartment, "it")
    ),
    []
  );

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        normalizedSearch === "" ||
        [asset.nome, asset.marca, asset.modello].some((field) =>
          field.toLowerCase().includes(normalizedSearch)
        );
      const matchesCategory = categoryFilter === "" || asset.categoria === categoryFilter;
      const matchesStatus = statusFilter === "" || asset.stato === statusFilter;
      const matchesDepartment = departmentFilter === "" || asset.reparto === departmentFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesDepartment;
    });
  }, [assets, normalizedSearch, categoryFilter, statusFilter, departmentFilter]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((firstAsset, secondAsset) => {
      const firstValue = String(firstAsset[sortField] ?? "");
      const secondValue = String(secondAsset[sortField] ?? "");
      const compareResult =
        sortField === "dataAcquisto"
          ? parseDate(firstValue).getTime() - parseDate(secondValue).getTime()
          : compareValues(firstValue, secondValue);
      return sortDirection === "asc" ? compareResult : -compareResult;
    });
  }, [filteredAssets, sortField, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(sortedAssets.length / PAGE_SIZE));
  const currentAssets = sortedAssets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const selectedAsset = useMemo(
    () => sortedAssets.find((asset) => asset.id === selectedAssetId) ?? sortedAssets[0] ?? null,
    [sortedAssets, selectedAssetId]
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  };

  const handleResetFilters = () => {
    setSearchValue("");
    setCategoryFilter("");
    setStatusFilter("");
    setDepartmentFilter("");
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleCategoryFilterChange = (value: AssetCategory | "") => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: AssetStatus | "") => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleDepartmentFilterChange = (value: string) => {
    setDepartmentFilter(value);
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    downloadCSV("asset_export", assetRowsForCSV(sortedAssets));
  };

  const handleSubmit = (data: AssetFormValues) => {
    const newAsset: Asset = {
      id: getNextAssetId(assets),
      nome: data.nome,
      categoria: data.categoria,
      marca: data.marca,
      modello: data.modello,
      numeroSeriale: data.numeroSeriale,
      dataAcquisto: data.dataAcquisto,
      costo: Number(data.costo),
      garanziaMesi: Number(data.garanziaMesi),
      stato: "Disponibile",
      assegnatoA: null,
      reparto: null,
      note: data.note || undefined,
    };

    setAssets((current) => [newAsset, ...current]);
    setFormSuccess("Asset creato con successo.");
    setDrawerOpen(false);
    setSearchValue("");
    setCategoryFilter("");
    setStatusFilter("");
    setDepartmentFilter("");
    setSortField("id");
    setSortDirection("desc");
    setCurrentPage(1);
    setSelectedAssetId(newAsset.id);
    form.reset({
      nome: "",
      categoria: "Laptop",
      marca: "",
      modello: "",
      numeroSeriale: "",
      dataAcquisto: "",
      costo: "",
      garanziaMesi: "",
      note: "",
    });
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-muted-foreground" />
    ) : (
      <ChevronDown className="h-4 w-4 text-muted-foreground" />
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Catalogo Asset</h1>
        <p className="text-muted-foreground mt-1">
          Consulta, filtra e gestisci il parco asset aziendale in modo semplice.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(360px,1fr)]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Elenco asset</CardTitle>
                <CardDescription>
                  Visualizza gli asset con ricerca, ordinamento e filtri rapidi.
                </CardDescription>
              </div>
              {permissions.canCreate ? (
                <Button variant="default" onClick={() => setDrawerOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Nuovo Asset
                </Button>
              ) : null}
            </CardHeader>

            <CardContent>
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchValue}
                    onChange={(event) => handleSearchChange(event.target.value)}
                    placeholder="Cerca per nome, marca o modello"
                    className="pl-9"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="category-filter">Categoria</Label>
                    <Select
                      id="category-filter"
                      value={categoryFilter}
                      onChange={(event) => handleCategoryFilterChange(event.target.value as AssetCategory | "")}
                    >
                      <option value="">Tutte</option>
                      {ASSET_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status-filter">Stato</Label>
                    <Select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(event) => handleStatusFilterChange(event.target.value as AssetStatus | "")}
                    >
                      <option value="">Tutti</option>
                      {ASSET_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="department-filter">Reparto</Label>
                    <Select
                      id="department-filter"
                      value={departmentFilter}
                      onChange={(event) => handleDepartmentFilterChange(event.target.value)}
                    >
                      <option value="">Tutti</option>
                      {departmentOptions.map((department) => (
                        <option key={department} value={department}>
                          {department}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-muted-foreground">
                  {filteredAssets.length} asset trovati
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleResetFilters}>
                    Reset filtri
                  </Button>
                  {canExportCSV ? (
                    <Button variant="outline" size="sm" onClick={handleExportCSV}>
                      <Download className="h-4 w-4" />
                      Esporta CSV
                    </Button>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleSort("id")}
                      >
                        ID Asset
                        {getSortIcon("id")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleSort("nome")}
                      >
                        Nome
                        {getSortIcon("nome")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleSort("categoria")}
                      >
                        Categoria
                        {getSortIcon("categoria")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleSort("marca")}
                      >
                        Marca
                        {getSortIcon("marca")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleSort("modello")}
                      >
                        Modello
                        {getSortIcon("modello")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleSort("numeroSeriale")}
                      >
                        Numero Seriale
                        {getSortIcon("numeroSeriale")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleSort("stato")}
                      >
                        Stato
                        {getSortIcon("stato")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleSort("assegnatoA")}
                      >
                        Assegnato a
                        {getSortIcon("assegnatoA")}
                      </button>
                    </TableHead>
                    <TableHead>
                      <button
                        type="button"
                        className="inline-flex items-center gap-2"
                        onClick={() => handleSort("dataAcquisto")}
                      >
                        Data Acquisto
                        {getSortIcon("dataAcquisto")}
                      </button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentAssets.map((asset) => (
                    <TableRow
                      key={asset.id}
                      className={cn(
                        selectedAsset?.id === asset.id ? "bg-muted/50" : "",
                        "cursor-pointer"
                      )}
                      onClick={() => setSelectedAssetId(asset.id)}
                    >
                      <TableCell>{asset.id}</TableCell>
                      <TableCell>{asset.nome}</TableCell>
                      <TableCell>{asset.categoria}</TableCell>
                      <TableCell>{asset.marca}</TableCell>
                      <TableCell>{asset.modello}</TableCell>
                      <TableCell>{asset.numeroSeriale}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(asset.stato)}>
                          {asset.stato}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.assegnatoA ?? "-"}</TableCell>
                      <TableCell>{asset.dataAcquisto}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>

            <div className="flex flex-col gap-3 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Pagina {currentPage} di {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Precedente
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Successivo
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Info className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Dettaglio asset</CardTitle>
              </div>
              <CardDescription>
                Seleziona una riga per visualizzare tutte le informazioni dell'asset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedAsset ? (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-lg border bg-muted/30">
                    <div className="flex aspect-[16/9] items-center justify-center border-b bg-muted text-muted-foreground">
                      <div className="flex flex-col items-center gap-2 text-sm">
                        <ImageIcon className="h-10 w-10" />
                        <span>Immagine placeholder</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="mb-3 text-xs uppercase tracking-wide text-muted-foreground">
                        {selectedAsset.categoria}
                      </div>
                      <div className="text-xl font-semibold">{selectedAsset.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedAsset.marca} · {selectedAsset.modello}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Dati Generali</div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div>ID asset: {selectedAsset.id}</div>
                        <div>Categoria: {selectedAsset.categoria}</div>
                        <div>Stato: <Badge variant={getStatusBadgeVariant(selectedAsset.stato)}>{selectedAsset.stato}</Badge></div>
                        <div>Data acquisto: {selectedAsset.dataAcquisto}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Dettagli Tecnici</div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div>Marca: {selectedAsset.marca}</div>
                        <div>Modello: {selectedAsset.modello}</div>
                        <div>Numero seriale: {selectedAsset.numeroSeriale}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Assegnazione</div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div>Assegnato a: {selectedAsset.assegnatoA ?? "Non assegnato"}</div>
                        <div>Reparto: {selectedAsset.reparto ?? "N/D"}</div>
                      </div>
                    </div>
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Ciclo di Vita</div>
                      <div className="mt-3 space-y-2 text-sm">
                        <div>Costo: {formatCurrency(selectedAsset.costo)}</div>
                        <div>Garanzia: {selectedAsset.garanziaMesi} mesi</div>
                        <div>Ubicazione: {selectedAsset.ubicazione ?? "Non specificata"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm font-semibold text-muted-foreground">Note</div>
                      <div className="mt-3 text-sm">
                        {selectedAsset.note ?? "Nessuna nota disponibile."}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
                  Seleziona un asset dalla tabella per vedere il dettaglio.
                </div>
              )}
            </CardContent>
          </Card>

          {formSuccess ? (
            <Card>
              <CardContent className="text-sm text-emerald-700">
                {formSuccess}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold">Nuovo Asset</h2>
                <p className="text-sm text-muted-foreground">
                  Aggiungi un nuovo asset elettronico al catalogo.
                </p>
              </div>
              <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
                Annulla
              </Button>
            </div>
            <div className="space-y-6 p-6">
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="grid gap-4 lg:grid-cols-2"
              >
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" {...form.register("nome")} />
                  {form.formState.errors.nome ? (
                    <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    id="categoria"
                    {...form.register("categoria", {
                      onChange: () => form.setValue("marca", ""),
                    })}
                  >
                    {ASSET_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                  {form.formState.errors.categoria ? (
                    <p className="text-sm text-destructive">{form.formState.errors.categoria.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Select id="marca" {...form.register("marca")}> 
                    <option value="">Seleziona marca</option>
                    {BRANDS_BY_CATEGORY[selectedCategory].map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </Select>
                  {form.formState.errors.marca ? (
                    <p className="text-sm text-destructive">{form.formState.errors.marca.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modello">Modello</Label>
                  <Input id="modello" {...form.register("modello")} />
                  {form.formState.errors.modello ? (
                    <p className="text-sm text-destructive">{form.formState.errors.modello.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroSeriale">Numero Seriale</Label>
                  <Input id="numeroSeriale" {...form.register("numeroSeriale")} />
                  {form.formState.errors.numeroSeriale ? (
                    <p className="text-sm text-destructive">{form.formState.errors.numeroSeriale.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataAcquisto">Data Acquisto</Label>
                  <Input id="dataAcquisto" placeholder="GG/MM/AAAA" {...form.register("dataAcquisto")} />
                  {form.formState.errors.dataAcquisto ? (
                    <p className="text-sm text-destructive">{form.formState.errors.dataAcquisto.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costo">Costo (€)</Label>
                  <Input id="costo" {...form.register("costo")} />
                  {form.formState.errors.costo ? (
                    <p className="text-sm text-destructive">{form.formState.errors.costo.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="garanziaMesi">Garanzia (mesi)</Label>
                  <Input id="garanziaMesi" {...form.register("garanziaMesi")} />
                  {form.formState.errors.garanziaMesi ? (
                    <p className="text-sm text-destructive">{form.formState.errors.garanziaMesi.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2 lg:col-span-2">
                  <Label htmlFor="note">Note</Label>
                  <Input id="note" {...form.register("note")} />
                </div>

                <div className="flex items-center gap-2 lg:col-span-2">
                  <Button type="submit">Salva asset</Button>
                  <Button variant="outline" type="button" onClick={() => setDrawerOpen(false)}>
                    Annulla
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
