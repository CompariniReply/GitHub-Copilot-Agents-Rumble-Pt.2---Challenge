import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search, ArrowUpDown, Plus, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { mockAssets } from "@/lib/mock-data";
import type { Asset, AssetCategory, AssetStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const ITEMS_PER_PAGE = 20;

const assetCategories = [
  "Laptop",
  "Monitor",
  "Smartphone",
  "Tablet",
  "Stampanti",
  "Server",
  "Accessori IT",
  "Dispositivi di Rete",
] as const;

const assetStatuses = ["In uso", "Disponibile", "In manutenzione", "Dismesso"] as const;

const createAssetSchema = z.object({
  nome: z.string().trim().min(1, "Campo obbligatorio"),
  categoria: z.string().trim().min(1, "Campo obbligatorio"),
  marca: z.string().trim().min(1, "Campo obbligatorio"),
  modello: z.string().trim().min(1, "Campo obbligatorio"),
  numeroSeriale: z.string().trim().min(1, "Campo obbligatorio"),
  dataAcquisto: z.string().trim().min(1, "Campo obbligatorio"),
  costo: z.number().positive("Inserire un valore maggiore di 0"),
  garanziaMesi: z.number().int("Numero non valido").min(1, "Minimo 1 mese"),
  note: z.string().trim().optional(),
});

type CreateAssetFormValues = z.infer<typeof createAssetSchema>;

const brandsByCategory: Record<AssetCategory, string[]> = {
  Laptop: ["Apple", "Dell", "Lenovo", "HP", "Asus"],
  Monitor: ["Dell", "LG", "Samsung", "BenQ", "AOC"],
  Smartphone: ["Apple", "Samsung", "Google", "Xiaomi", "OnePlus"],
  Tablet: ["Apple", "Samsung", "Lenovo", "Microsoft", "Huawei"],
  Stampanti: ["HP", "Epson", "Brother", "Canon", "Xerox"],
  Server: ["Dell", "HPE", "Lenovo", "Cisco", "Fujitsu"],
  "Accessori IT": ["Logitech", "CalDigit", "Sony", "Anker", "Belkin"],
  "Dispositivi di Rete": ["Cisco", "Ubiquiti", "TP-Link", "MikroTik", "Juniper"],
};

function parseItalianDate(value: string) {
  const [day, month, year] = value.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function formatDateFromInput(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusBadgeVariant(status: AssetStatus) {
  switch (status) {
    case "Disponibile":
      return "success" as const;
    case "In uso":
      return "info" as const;
    case "In manutenzione":
      return "warning" as const;
    case "Dismesso":
      return "destructive" as const;
    default:
      return "secondary" as const;
  }
}

export function CatalogPage() {
  const { permissions, user } = useAuth();

  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creationMessage, setCreationMessage] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [sortField, setSortField] = useState<SortField>("nome");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateAssetFormValues>({
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
  const selectedBrand = useWatch({ control, name: "marca" });

  const availableBrands = useMemo(() => {
    if (!selectedCategory || !assetCategories.includes(selectedCategory as AssetCategory)) {
      return [];
    }
    return brandsByCategory[selectedCategory as AssetCategory];
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedBrand && !availableBrands.includes(selectedBrand)) {
      setValue("marca", "");
    }
  }, [availableBrands, selectedBrand, setValue]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, statusFilter, departmentFilter]);

  const departments = useMemo(() => {
    return [...new Set(assets.map((asset) => asset.reparto).filter(Boolean) as string[])].sort();
  }, [assets]);

  const filteredAndSortedAssets = useMemo(() => {
    const filtered = assets.filter((asset) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        asset.nome.toLowerCase().includes(q) ||
        asset.marca.toLowerCase().includes(q) ||
        asset.modello.toLowerCase().includes(q);

      const matchesCategory = !categoryFilter || asset.categoria === categoryFilter;
      const matchesStatus = !statusFilter || asset.stato === statusFilter;
      const matchesDepartment = !departmentFilter || asset.reparto === departmentFilter;

      return matchesSearch && matchesCategory && matchesStatus && matchesDepartment;
    });

    filtered.sort((a, b) => {
      const direction = sortDirection === "asc" ? 1 : -1;

      if (sortField === "dataAcquisto") {
        return (parseItalianDate(a.dataAcquisto) - parseItalianDate(b.dataAcquisto)) * direction;
      }

      const aValue = String(a[sortField] ?? "").toLowerCase();
      const bValue = String(b[sortField] ?? "").toLowerCase();
      return aValue.localeCompare(bValue, "it") * direction;
    });

    return filtered;
  }, [assets, categoryFilter, departmentFilter, searchQuery, sortDirection, sortField, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedAssets.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedAssets = filteredAndSortedAssets.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  const selectedAsset = useMemo(() => {
    if (!selectedAssetId) return null;
    return assets.find((asset) => asset.id === selectedAssetId) ?? null;
  }, [assets, selectedAssetId]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortField(field);
    setSortDirection("asc");
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setStatusFilter("");
    setDepartmentFilter("");
  };

  const onCreateAsset = (values: CreateAssetFormValues) => {
    const numericIds = assets
      .map((asset) => Number(asset.id.replace("A", "")))
      .filter((value) => !Number.isNaN(value));
    const nextId = numericIds.length ? Math.max(...numericIds) + 1 : 1;

    const newAsset: Asset = {
      id: `A${String(nextId).padStart(3, "0")}`,
      nome: values.nome,
      categoria: values.categoria as AssetCategory,
      marca: values.marca,
      modello: values.modello,
      numeroSeriale: values.numeroSeriale,
      dataAcquisto: formatDateFromInput(values.dataAcquisto),
      costo: values.costo,
      garanziaMesi: values.garanziaMesi,
      stato: "Disponibile",
      assegnatoA: null,
      reparto: null,
      note: values.note,
    };

    setAssets((prev) => [newAsset, ...prev]);
    setSelectedAssetId(newAsset.id);
    setCreationMessage("Asset creato con successo");
    reset({
      nome: "",
      categoria: "",
      marca: "",
      modello: "",
      numeroSeriale: "",
      dataAcquisto: "",
      costo: 0,
      garanziaMesi: 24,
      note: "",
    });
    setIsCreateOpen(false);
  };

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogo Asset</h1>
          <p className="text-muted-foreground mt-1">
            Inventario completo degli asset elettronici. Accesso: {user?.ruolo ?? "Utente"}.
          </p>
        </div>
        {permissions.canCreate && (
          <Button onClick={() => setIsCreateOpen((open) => !open)}>
            <Plus className="h-4 w-4" />
            {isCreateOpen ? "Chiudi form" : "Nuovo Asset"}
          </Button>
        )}
      </div>

      {creationMessage && (
        <Card className="border-emerald-300 bg-emerald-50">
          <CardContent className="p-4 text-sm text-emerald-900">{creationMessage}</CardContent>
        </Card>
      )}

      {isCreateOpen && permissions.canCreate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Nuovo Asset</CardTitle>
            <CardDescription>Compila i campi obbligatori per inserire un nuovo dispositivo.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onCreateAsset)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" {...register("nome")} />
                  {errors.nome && <p className="text-xs text-red-600">{errors.nome.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select id="categoria" {...register("categoria")}>
                    <option value="">Seleziona categoria</option>
                    {assetCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </Select>
                  {errors.categoria && <p className="text-xs text-red-600">{errors.categoria.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Select id="marca" {...register("marca")}>
                    <option value="">Seleziona marca</option>
                    {availableBrands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </Select>
                  {errors.marca && <p className="text-xs text-red-600">{errors.marca.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modello">Modello</Label>
                  <Input id="modello" {...register("modello")} />
                  {errors.modello && <p className="text-xs text-red-600">{errors.modello.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroSeriale">Numero Seriale</Label>
                  <Input id="numeroSeriale" {...register("numeroSeriale")} />
                  {errors.numeroSeriale && <p className="text-xs text-red-600">{errors.numeroSeriale.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dataAcquisto">Data Acquisto</Label>
                  <Input id="dataAcquisto" type="date" {...register("dataAcquisto")} />
                  {errors.dataAcquisto && <p className="text-xs text-red-600">{errors.dataAcquisto.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costo">Costo (EUR)</Label>
                  <Input id="costo" type="number" min={1} step="1" {...register("costo", { valueAsNumber: true })} />
                  {errors.costo && <p className="text-xs text-red-600">{errors.costo.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="garanziaMesi">Garanzia (mesi)</Label>
                  <Input id="garanziaMesi" type="number" min={1} step="1" {...register("garanziaMesi", { valueAsNumber: true })} />
                  {errors.garanziaMesi && <p className="text-xs text-red-600">{errors.garanziaMesi.message}</p>}
                </div>

                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label htmlFor="note">Note</Label>
                  <textarea
                    id="note"
                    className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...register("note")}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    reset();
                    setIsCreateOpen(false);
                  }}
                >
                  Annulla
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  Salva
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Ricerca e Filtri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="pl-9"
                placeholder="Cerca per nome, marca o modello"
              />
            </div>

            <Select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="">Tutte le categorie</option>
              {assetCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>

            <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">Tutti gli stati</option>
              {assetStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>

            <Select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
              <option value="">Tutti i reparti</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredAndSortedAssets.length} risultati su {assets.length} asset
            </p>
            <Button variant="outline" size="sm" onClick={handleResetFilters}>
              Reset filtri
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Catalogo</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("id")}>
                    ID Asset <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("nome")}>
                    Nome <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("categoria")}>
                    Categoria <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("marca")}>
                    Marca <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("modello")}>
                    Modello <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("numeroSeriale")}>
                    Numero Seriale <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("stato")}>
                    Stato <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("assegnatoA")}>
                    Assegnato a <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
                <TableHead>
                  <button className="flex items-center gap-1 hover:text-foreground" onClick={() => handleSort("dataAcquisto")}>
                    Data Acquisto <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {pagedAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    Nessun asset trovato con i filtri selezionati.
                  </TableCell>
                </TableRow>
              ) : (
                pagedAssets.map((asset) => (
                  <TableRow
                    key={asset.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedAssetId(asset.id)}
                    data-state={selectedAssetId === asset.id ? "selected" : undefined}
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

          <div className="flex items-center justify-between border-t px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Pagina {currentPage} di {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Precedente
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
              >
                Successiva
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Scheda Dettaglio Asset</CardTitle>
          <CardDescription>
            Seleziona una riga del catalogo per visualizzare dati generali, dettagli tecnici, assegnazione e ciclo di vita.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedAsset ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-md border border-dashed text-muted-foreground">
              <Package className="h-6 w-6" />
              <p>Seleziona un asset dalla tabella per vedere la scheda completa.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="flex h-44 items-center justify-center rounded-md border bg-muted text-sm text-muted-foreground">
                  Immagine placeholder
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">{selectedAsset.nome}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{selectedAsset.categoria}</Badge>
                    <Badge variant={getStatusBadgeVariant(selectedAsset.stato)}>{selectedAsset.stato}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">ID: {selectedAsset.id}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <section className="rounded-md border p-4">
                  <h4 className="font-semibold">Dati Generali</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Nome</dt>
                      <dd>{selectedAsset.nome}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Categoria</dt>
                      <dd>{selectedAsset.categoria}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Data acquisto</dt>
                      <dd>{selectedAsset.dataAcquisto}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Costo</dt>
                      <dd>{formatCurrency(selectedAsset.costo)}</dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-md border p-4">
                  <h4 className="font-semibold">Dettagli Tecnici</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Marca</dt>
                      <dd>{selectedAsset.marca}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Modello</dt>
                      <dd>{selectedAsset.modello}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Numero seriale</dt>
                      <dd>{selectedAsset.numeroSeriale}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Garanzia</dt>
                      <dd>{selectedAsset.garanziaMesi} mesi</dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-md border p-4">
                  <h4 className="font-semibold">Assegnazione</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Assegnato a</dt>
                      <dd>{selectedAsset.assegnatoA ?? "Non assegnato"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Reparto</dt>
                      <dd>{selectedAsset.reparto ?? "-"}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Ubicazione</dt>
                      <dd>{selectedAsset.ubicazione ?? "-"}</dd>
                    </div>
                  </dl>
                </section>

                <section className="rounded-md border p-4">
                  <h4 className="font-semibold">Ciclo di Vita</h4>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Stato corrente</dt>
                      <dd>
                        <Badge variant={getStatusBadgeVariant(selectedAsset.stato)}>{selectedAsset.stato}</Badge>
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted-foreground">Note</dt>
                      <dd className="text-right">{selectedAsset.note?.trim() ? selectedAsset.note : "Nessuna nota"}</dd>
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
