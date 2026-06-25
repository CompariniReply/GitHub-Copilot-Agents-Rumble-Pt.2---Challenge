import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  BRANDS_BY_CATEGORY,
  STATUS_BADGE_VARIANT,
  formatCurrency,
  formatDate,
} from "@/lib/asset-helpers";
import { mockAssets } from "@/lib/mock-data";
import type { Asset, AssetCategory, AssetStatus } from "@/lib/types";

const PAGE_SIZE = 20;

const assetCategoriesTuple = ASSET_CATEGORIES as [AssetCategory, ...AssetCategory[]];

const assetSchema = z.object({
  nome: z.string().min(1, "Campo obbligatorio"),
  categoria: z.enum(assetCategoriesTuple),
  marca: z.string().min(1, "Campo obbligatorio"),
  modello: z.string().min(1, "Campo obbligatorio"),
  numeroSeriale: z.string().min(1, "Campo obbligatorio"),
  dataAcquisto: z.string().min(1, "Campo obbligatorio"),
  costo: z.coerce
    .number()
    .refine((value) => Number.isFinite(value), "Inserisci un numero valido")
    .positive("Deve essere un numero positivo"),
  garanziaMesi: z.coerce
    .number()
    .refine((value) => Number.isFinite(value), "Inserisci un numero valido")
    .int("Inserisci un numero valido")
    .positive("Deve essere un numero positivo"),
  ubicazione: z.string().optional(),
  note: z.string().optional(),
});

type NewAssetFormData = z.infer<typeof assetSchema>;
type NewAssetFormInput = z.input<typeof assetSchema>;
type SortKey =
  | "nome"
  | "categoria"
  | "marca"
  | "modello"
  | "numeroSeriale"
  | "stato"
  | "assegnatoA"
  | "dataAcquisto";

function toDateForSort(ddmmyyyy: string): number {
  const [day, month, year] = ddmmyyyy.split("/").map(Number);
  return new Date(year, month - 1, day).getTime();
}

function fromInputDate(yyyymmdd: string): string {
  const [year, month, day] = yyyymmdd.split("-");
  return `${day}/${month}/${year}`;
}

function compareAssets(a: Asset, b: Asset, key: SortKey): number {
  if (key === "dataAcquisto") {
    return toDateForSort(a.dataAcquisto) - toDateForSort(b.dataAcquisto);
  }

  const aValue = (a[key] ?? "") as string;
  const bValue = (b[key] ?? "") as string;
  return aValue.localeCompare(bValue, "it", { sensitivity: "base" });
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-1 gap-1 md:grid-cols-[180px_1fr]">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function CatalogPage() {
  const { permissions } = useAuth();

  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [searchText, setSearchText] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<"" | AssetCategory>("");
  const [statoFiltro, setStatoFiltro] = useState<"" | AssetStatus>("");

  const [sortKey, setSortKey] = useState<SortKey>("nome");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<NewAssetFormInput, undefined, NewAssetFormData>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      nome: "",
      categoria: undefined,
      marca: "",
      modello: "",
      numeroSeriale: "",
      dataAcquisto: "",
      costo: undefined,
      garanziaMesi: undefined,
      ubicazione: "",
      note: "",
    },
  });

  const categoriaForm = useWatch({ control, name: "categoria" });
  const marcaForm = useWatch({ control, name: "marca" });

  const marcheDisponibili = useMemo(() => {
    if (!categoriaForm) return [];
    return BRANDS_BY_CATEGORY[categoriaForm] ?? [];
  }, [categoriaForm]);

  useEffect(() => {
    if (!marcaForm) return;
    if (!marcheDisponibili.includes(marcaForm)) {
      setValue("marca", "");
    }
  }, [marcaForm, marcheDisponibili, setValue]);

  const filteredAndSortedAssets = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const filtered = assets.filter((asset) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        asset.nome.toLowerCase().includes(normalizedSearch) ||
        asset.marca.toLowerCase().includes(normalizedSearch) ||
        asset.modello.toLowerCase().includes(normalizedSearch);

      const matchesCategoria = categoriaFiltro === "" || asset.categoria === categoriaFiltro;
      const matchesStato = statoFiltro === "" || asset.stato === statoFiltro;

      return matchesSearch && matchesCategoria && matchesStato;
    });

    const sorted = [...filtered].sort((a, b) => {
      const result = compareAssets(a, b, sortKey);
      return sortDirection === "asc" ? result : -result;
    });

    return sorted;
  }, [assets, categoriaFiltro, searchText, sortDirection, sortKey, statoFiltro]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSortedAssets.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedAssets.slice(start, start + PAGE_SIZE);
  }, [currentPage, filteredAndSortedAssets]);

  function toggleSort(nextKey: SortKey) {
    if (sortKey === nextKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(nextKey);
    setSortDirection("asc");
  }

  function handleResetFilters() {
    setSearchText("");
    setCategoriaFiltro("");
    setStatoFiltro("");
    setPage(1);
  }

  function closeCreateDialog() {
    setIsCreateOpen(false);
    reset();
  }

  function onSubmit(formData: NewAssetFormData) {
    const newId = `A${String(assets.length + 1).padStart(3, "0")}`;

    const newAsset: Asset = {
      id: newId,
      nome: formData.nome,
      categoria: formData.categoria,
      marca: formData.marca,
      modello: formData.modello,
      numeroSeriale: formData.numeroSeriale,
      dataAcquisto: fromInputDate(formData.dataAcquisto),
      costo: formData.costo,
      garanziaMesi: formData.garanziaMesi,
      stato: "Disponibile",
      assegnatoA: null,
      reparto: null,
      ubicazione: formData.ubicazione?.trim() || undefined,
      note: formData.note?.trim() || undefined,
    };

    setAssets((prev) => [...prev, newAsset]);
    window.alert("Asset creato con successo.");
    closeCreateDialog();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogo Asset</h1>
          <p className="mt-1 text-muted-foreground">
            Elenco completo degli asset aziendali con ricerca, filtri e dettaglio.
          </p>
        </div>
        {permissions.canCreate && (
          <Button onClick={() => setIsCreateOpen(true)}>Nuovo Asset</Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="md:col-span-2">
          <Label htmlFor="search">Ricerca</Label>
          <Input
            id="search"
            placeholder="Cerca per nome, marca o modello"
            value={searchText}
            onChange={(event) => {
              setSearchText(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <Label htmlFor="categoriaFiltro">Categoria</Label>
          <Select
            id="categoriaFiltro"
            value={categoriaFiltro}
            onChange={(event) => {
              setCategoriaFiltro(event.target.value as "" | AssetCategory);
              setPage(1);
            }}
          >
            <option value="">Tutte le categorie</option>
            {ASSET_CATEGORIES.map((categoria) => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="statoFiltro">Stato</Label>
          <Select
            id="statoFiltro"
            value={statoFiltro}
            onChange={(event) => {
              setStatoFiltro(event.target.value as "" | AssetStatus);
              setPage(1);
            }}
          >
            <option value="">Tutti gli stati</option>
            {ASSET_STATUSES.map((stato) => (
              <option key={stato} value={stato}>
                {stato}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleResetFilters}>
          Reset filtri
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button className="cursor-pointer" type="button" onClick={() => toggleSort("nome")}>Nome</button>
              </TableHead>
              <TableHead>
                <button className="cursor-pointer" type="button" onClick={() => toggleSort("categoria")}>Categoria</button>
              </TableHead>
              <TableHead>
                <button className="cursor-pointer" type="button" onClick={() => toggleSort("marca")}>Marca</button>
              </TableHead>
              <TableHead>
                <button className="cursor-pointer" type="button" onClick={() => toggleSort("modello")}>Modello</button>
              </TableHead>
              <TableHead>
                <button className="cursor-pointer" type="button" onClick={() => toggleSort("numeroSeriale")}>Numero Seriale</button>
              </TableHead>
              <TableHead>
                <button className="cursor-pointer" type="button" onClick={() => toggleSort("stato")}>Stato</button>
              </TableHead>
              <TableHead>
                <button className="cursor-pointer" type="button" onClick={() => toggleSort("assegnatoA")}>Assegnato a</button>
              </TableHead>
              <TableHead>
                <button className="cursor-pointer" type="button" onClick={() => toggleSort("dataAcquisto")}>Data Acquisto</button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Nessun asset trovato con i filtri applicati.
                </TableCell>
              </TableRow>
            ) : (
              paginatedAssets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedAsset(asset)}
                >
                  <TableCell>{asset.nome}</TableCell>
                  <TableCell>{asset.categoria}</TableCell>
                  <TableCell>{asset.marca}</TableCell>
                  <TableCell>{asset.modello}</TableCell>
                  <TableCell>{asset.numeroSeriale}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[asset.stato]}>{asset.stato}</Badge>
                  </TableCell>
                  <TableCell>{asset.assegnatoA ?? "-"}</TableCell>
                  <TableCell>{formatDate(asset.dataAcquisto)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Precedente
        </Button>
        <span className="text-sm text-muted-foreground">
          Pagina {currentPage} di {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          disabled={currentPage === totalPages}
        >
          Successivo
        </Button>
      </div>

      {selectedAsset && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/30"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedAsset(null)}
        >
          <div
            className="h-full w-full max-w-xl overflow-y-auto bg-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Dettaglio Asset</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedAsset.nome} ({selectedAsset.id})
                </p>
              </div>
              <Button variant="outline" onClick={() => setSelectedAsset(null)}>
                Chiudi
              </Button>
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-base font-semibold">Dati Generali</h3>
                <DetailRow label="Nome" value={selectedAsset.nome} />
                <DetailRow label="Categoria" value={selectedAsset.categoria} />
                <DetailRow label="Stato" value={selectedAsset.stato} />
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-semibold">Dettagli Tecnici</h3>
                <DetailRow label="Marca" value={selectedAsset.marca} />
                <DetailRow label="Modello" value={selectedAsset.modello} />
                <DetailRow label="Numero Seriale" value={selectedAsset.numeroSeriale} />
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-semibold">Assegnazione</h3>
                <DetailRow label="Assegnato a" value={selectedAsset.assegnatoA ?? "-"} />
                <DetailRow label="Reparto" value={selectedAsset.reparto ?? "-"} />
                <DetailRow label="Ubicazione" value={selectedAsset.ubicazione ?? "-"} />
              </section>

              <section className="space-y-3">
                <h3 className="text-base font-semibold">Ciclo di Vita</h3>
                <DetailRow label="Data Acquisto" value={formatDate(selectedAsset.dataAcquisto)} />
                <DetailRow label="Costo" value={formatCurrency(selectedAsset.costo)} />
                <DetailRow label="Garanzia (mesi)" value={String(selectedAsset.garanziaMesi)} />
                <DetailRow label="Note" value={selectedAsset.note ?? "-"} />
                <div className="grid grid-cols-1 gap-1 md:grid-cols-[180px_1fr]">
                  <span className="text-sm text-muted-foreground">Badge Stato</span>
                  <span>
                    <Badge variant={STATUS_BADGE_VARIANT[selectedAsset.stato]}>
                      {selectedAsset.stato}
                    </Badge>
                  </span>
                </div>
              </section>

              <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
                {permissions.canEdit && <Button variant="outline">Modifica</Button>}
                {permissions.canDelete && <Button variant="destructive">Elimina</Button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCreateOpen && permissions.canCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          role="dialog"
          aria-modal="true"
          onClick={closeCreateDialog}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">Nuovo Asset</h2>
              <p className="text-sm text-muted-foreground">
                Compila i campi obbligatori per creare un nuovo asset.
              </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="nome">Nome</Label>
                  <Input id="nome" {...register("nome")} />
                  {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select id="categoria" {...register("categoria")}>
                    <option value="">Seleziona categoria</option>
                    {ASSET_CATEGORIES.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </Select>
                  {errors.categoria && <p className="text-sm text-destructive">{errors.categoria.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="marca">Marca</Label>
                  <Select id="marca" {...register("marca")} disabled={!categoriaForm}>
                    <option value="">Seleziona marca</option>
                    {marcheDisponibili.map((marca) => (
                      <option key={marca} value={marca}>
                        {marca}
                      </option>
                    ))}
                  </Select>
                  {errors.marca && <p className="text-sm text-destructive">{errors.marca.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="modello">Modello</Label>
                  <Input id="modello" {...register("modello")} />
                  {errors.modello && <p className="text-sm text-destructive">{errors.modello.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="numeroSeriale">Numero Seriale</Label>
                  <Input id="numeroSeriale" {...register("numeroSeriale")} />
                  {errors.numeroSeriale && (
                    <p className="text-sm text-destructive">{errors.numeroSeriale.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="dataAcquisto">Data Acquisto</Label>
                  <Input id="dataAcquisto" type="date" {...register("dataAcquisto")} />
                  {errors.dataAcquisto && (
                    <p className="text-sm text-destructive">{errors.dataAcquisto.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="costo">Costo (€)</Label>
                  <Input id="costo" type="number" step="1" min="0" {...register("costo")} />
                  {errors.costo && <p className="text-sm text-destructive">{errors.costo.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="garanziaMesi">Garanzia (mesi)</Label>
                  <Input
                    id="garanziaMesi"
                    type="number"
                    step="1"
                    min="1"
                    {...register("garanziaMesi")}
                  />
                  {errors.garanziaMesi && (
                    <p className="text-sm text-destructive">{errors.garanziaMesi.message}</p>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="ubicazione">Ubicazione</Label>
                  <Input id="ubicazione" {...register("ubicazione")} />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="note">Note</Label>
                  <Input id="note" {...register("note")} />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeCreateDialog}>
                  Annulla
                </Button>
                <Button type="submit">Salva</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
