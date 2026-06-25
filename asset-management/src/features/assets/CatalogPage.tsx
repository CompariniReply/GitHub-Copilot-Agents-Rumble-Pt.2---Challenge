import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { mockAssets, mockDepartments, mockUsers } from "@/lib/mock-data";
import {
  ASSET_CATEGORIES,
  ASSET_STATUSES,
  BRANDS_BY_CATEGORY,
  formatCurrency,
  formatDate,
  getStatusBadgeVariant,
} from "@/lib/asset-helpers";
import type { Asset } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Search, X } from "lucide-react";

const assetSchema = z.object({
  nome: z.string().min(1, "Nome asset obbligatorio"),
  categoria: z.enum([...ASSET_CATEGORIES] as const),
  marca: z.string().min(1, "Marca obbligatoria"),
  modello: z.string().min(1, "Modello obbligatorio"),
  numeroSeriale: z.string().min(1, "Numero seriale obbligatorio"),
  dataAcquisto: z
    .string()
    .min(1, "Data acquisto obbligatoria")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato data non valido"),
  costo: z.number().min(0, "Costo non può essere negativo"),
  garanziaMesi: z.number().min(0, "La garanzia deve essere almeno 0 mesi"),
  stato: z.enum([...ASSET_STATUSES] as const),
  assegnatoA: z.string().optional(),
  reparto: z.string().optional(),
  ubicazione: z.string().optional(),
  note: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

const defaultFormValues: AssetFormValues = {
  nome: "",
  categoria: "Laptop",
  marca: BRANDS_BY_CATEGORY["Laptop"][0],
  modello: "",
  numeroSeriale: "",
  dataAcquisto: new Date().toISOString().slice(0, 10),
  costo: 0,
  garanziaMesi: 24,
  stato: "Disponibile",
  assegnatoA: "",
  reparto: "",
  ubicazione: "",
  note: "",
};

function getNextAssetId(assets: Asset[]) {
  const highest = assets.reduce((max, asset) => {
    const value = Number(asset.id.slice(1));
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);
  return `A${String(highest + 1).padStart(3, "0")}`;
}

export function CatalogPage() {
  const { permissions } = useAuth();
  const [assets, setAssets] = useState<Asset[]>(() => [...mockAssets]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterReparto, setFilterReparto] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: defaultFormValues,
  });

  const categoryWatch = form.watch("categoria");
  const assigneeWatch = form.watch("assegnatoA");

  useEffect(() => {
    const brands = BRANDS_BY_CATEGORY[categoryWatch];
    if (brands && form.getValues("marca") !== brands[0]) {
      form.setValue("marca", brands[0]);
    }
  }, [categoryWatch, form]);

  useEffect(() => {
    if (!assigneeWatch) return;
    const user = mockUsers.find(
      (u) => `${u.nome} ${u.cognome}` === assigneeWatch
    );
    if (user && !form.getValues("reparto")) {
      form.setValue("reparto", user.reparto);
    }
  }, [assigneeWatch, form]);

  const filteredAssets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return assets.filter((asset) => {
      if (filterCategory && asset.categoria !== filterCategory) return false;
      if (filterStatus && asset.stato !== filterStatus) return false;
      if (filterReparto && asset.reparto !== filterReparto) return false;
      if (!query) return true;

      return [
        asset.nome,
        asset.marca,
        asset.modello,
        asset.numeroSeriale,
        asset.categoria,
        asset.assegnatoA ?? "",
        asset.reparto ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [assets, filterCategory, filterStatus, filterReparto, searchQuery]);

  const repartoOptions = useMemo(
    () => [...new Set(mockDepartments.map((dept) => dept.nome))].sort(),
    []
  );

  const assigneeOptions = useMemo(
    () =>
      [...mockUsers]
        .map((user) => `${user.nome} ${user.cognome}`)
        .sort((a, b) => a.localeCompare(b)),
    []
  );

  const handleCreateAsset = form.handleSubmit((data) => {
    const repartoValue =
      data.reparto ||
      mockUsers.find((user) => `${user.nome} ${user.cognome}` === data.assegnatoA)?.reparto ||
      null;

    const newAsset: Asset = {
      id: getNextAssetId(assets),
      nome: data.nome,
      categoria: data.categoria,
      marca: data.marca,
      modello: data.modello,
      numeroSeriale: data.numeroSeriale,
      dataAcquisto: formatDate(new Date(data.dataAcquisto)),
      costo: data.costo,
      garanziaMesi: data.garanziaMesi,
      stato: data.stato,
      assegnatoA: data.assegnatoA ?? null,
      reparto: repartoValue,
      ubicazione: data.ubicazione,
      note: data.note,
    };

    setAssets((current) => [newAsset, ...current]);
    setSelectedAsset(newAsset);
    setIsCreateOpen(false);
    form.reset(defaultFormValues);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalogo Asset</h1>
          <p className="text-muted-foreground mt-1">
            Ricerca, filtri e scheda dettaglio per tutti gli asset aziendali.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {permissions.canCreate ? (
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuovo asset
            </Button>
          ) : (
            <div className="rounded-md border border-muted p-3 text-sm text-muted-foreground">
              Non hai i permessi per creare nuovi asset.
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)]">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Cerca asset, seriale, modello..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </div>
                <Select
                  value={filterCategory}
                  onChange={(event) => setFilterCategory(event.target.value)}
                >
                  <option value="">Tutte le categorie</option>
                  {ASSET_CATEGORIES.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </Select>
                <Select
                  value={filterStatus}
                  onChange={(event) => setFilterStatus(event.target.value)}
                >
                  <option value="">Tutti gli stati</option>
                  {ASSET_STATUSES.map((stato) => (
                    <option key={stato} value={stato}>
                      {stato}
                    </option>
                  ))}
                </Select>
                <Select
                  value={filterReparto}
                  onChange={(event) => setFilterReparto(event.target.value)}
                >
                  <option value="">Tutti i reparti</option>
                  {repartoOptions.map((reparto) => (
                    <option key={reparto} value={reparto}>
                      {reparto}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="overflow-hidden rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Marca</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead>Reparto</TableHead>
                      <TableHead>Assegnato a</TableHead>
                      <TableHead className="text-right">Costo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nessun asset corrispondente ai filtri.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredAssets.map((asset) => (
                        <TableRow
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className="cursor-pointer"
                        >
                          <TableCell className="font-medium">{asset.nome}</TableCell>
                          <TableCell>{asset.categoria}</TableCell>
                          <TableCell>{asset.marca}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadgeVariant(asset.stato)}>
                              {asset.stato}
                            </Badge>
                          </TableCell>
                          <TableCell>{asset.reparto ?? "—"}</TableCell>
                          <TableCell>{asset.assegnatoA ?? "—"}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(asset.costo)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Dettaglio asset</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedAsset ? (
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Nome asset</p>
                          <div className="text-lg font-semibold">{selectedAsset.nome}</div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(selectedAsset.stato)}>
                          {selectedAsset.stato}
                        </Badge>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground">Categoria</p>
                          <div>{selectedAsset.categoria}</div>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground">Marca / Modello</p>
                          <div>{selectedAsset.marca} {selectedAsset.modello}</div>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground">Seriale</p>
                          <div>{selectedAsset.numeroSeriale}</div>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground">Data acquisto</p>
                          <div>{selectedAsset.dataAcquisto}</div>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground">Garanzia</p>
                          <div>{selectedAsset.garanziaMesi} mesi</div>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground">Ubicazione</p>
                          <div>{selectedAsset.ubicazione ?? "Non disponibile"}</div>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground">Reparto</p>
                          <div>{selectedAsset.reparto ?? "Non assegnato"}</div>
                        </div>
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground">Assegnato a</p>
                          <div>{selectedAsset.assegnatoA ?? "Non assegnato"}</div>
                        </div>
                      </div>

                      {selectedAsset.note ? (
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm text-muted-foreground">Note</p>
                          <div>{selectedAsset.note}</div>
                        </div>
                      ) : null}

                      <div className="flex justify-end">
                        <Button variant="secondary" onClick={() => setSelectedAsset(null)}>
                          Chiudi scheda
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-dashed border-muted p-8 text-center text-sm text-muted-foreground">
                      Seleziona un asset dalla tabella per vedere tutti i dettagli.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {isCreateOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-xl font-semibold">Nuovo asset</h2>
                <p className="text-sm text-muted-foreground">Compila i campi per aggiungere un asset elettronico al catalogo.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsCreateOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <form onSubmit={handleCreateAsset} className="space-y-6 p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome asset</Label>
                  <Input id="nome" {...form.register("nome")} />
                  {form.formState.errors.nome && (
                    <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select id="categoria" {...form.register("categoria")}> 
                    {ASSET_CATEGORIES.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </Select>
                  {form.formState.errors.categoria && (
                    <p className="text-sm text-destructive">{form.formState.errors.categoria.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Select id="marca" {...form.register("marca")}> 
                    {BRANDS_BY_CATEGORY[categoryWatch].map((marca) => (
                      <option key={marca} value={marca}>
                        {marca}
                      </option>
                    ))}
                  </Select>
                  {form.formState.errors.marca && (
                    <p className="text-sm text-destructive">{form.formState.errors.marca.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modello">Modello</Label>
                  <Input id="modello" {...form.register("modello")} />
                  {form.formState.errors.modello && (
                    <p className="text-sm text-destructive">{form.formState.errors.modello.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="numeroSeriale">Numero seriale</Label>
                  <Input id="numeroSeriale" {...form.register("numeroSeriale")} />
                  {form.formState.errors.numeroSeriale && (
                    <p className="text-sm text-destructive">{form.formState.errors.numeroSeriale.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataAcquisto">Data acquisto</Label>
                  <Input id="dataAcquisto" type="date" {...form.register("dataAcquisto")} />
                  {form.formState.errors.dataAcquisto && (
                    <p className="text-sm text-destructive">{form.formState.errors.dataAcquisto.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costo">Costo (€)</Label>
                  <Input id="costo" type="number" step="1" min="0" {...form.register("costo", { valueAsNumber: true })} />
                  {form.formState.errors.costo && (
                    <p className="text-sm text-destructive">{form.formState.errors.costo.message}</p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="garanziaMesi">Garanzia (mesi)</Label>
                  <Input id="garanziaMesi" type="number" step="1" min="0" {...form.register("garanziaMesi", { valueAsNumber: true })} />
                  {form.formState.errors.garanziaMesi && (
                    <p className="text-sm text-destructive">{form.formState.errors.garanziaMesi.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stato">Stato</Label>
                  <Select id="stato" {...form.register("stato")}> 
                    {ASSET_STATUSES.map((stato) => (
                      <option key={stato} value={stato}>
                        {stato}
                      </option>
                    ))}
                  </Select>
                  {form.formState.errors.stato && (
                    <p className="text-sm text-destructive">{form.formState.errors.stato.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assegnatoA">Assegnato a</Label>
                  <Select id="assegnatoA" {...form.register("assegnatoA")}> 
                    <option value="">Nessuna assegnazione</option>
                    {assigneeOptions.map((assignee) => (
                      <option key={assignee} value={assignee}>
                        {assignee}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reparto">Reparto</Label>
                  <Select id="reparto" {...form.register("reparto")}> 
                    <option value="">Nessuno</option>
                    {repartoOptions.map((reparto) => (
                      <option key={reparto} value={reparto}>
                        {reparto}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ubicazione">Ubicazione</Label>
                  <Input id="ubicazione" {...form.register("ubicazione")} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Note</Label>
                <Input id="note" {...form.register("note")} />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button variant="secondary" onClick={() => setIsCreateOpen(false)} type="button">
                  Annulla
                </Button>
                <Button type="submit">Aggiungi asset</Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
