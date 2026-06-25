import { useEffect, useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ASSET_CATEGORIES, BRANDS_BY_CATEGORY } from "@/lib/asset-helpers";
import type { Asset, AssetCategory } from "@/lib/types";

interface NewAssetDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (asset: Asset) => void;
  existingSerials: string[];
  nextId: string;
}

const schema = z.object({
  nome: z.string().min(1, "Campo obbligatorio"),
  categoria: z.enum(ASSET_CATEGORIES as [AssetCategory, ...AssetCategory[]], {
    message: "Campo obbligatorio",
  }),
  marca: z.string().min(1, "Campo obbligatorio"),
  modello: z.string().min(1, "Campo obbligatorio"),
  numeroSeriale: z.string().min(1, "Campo obbligatorio"),
  dataAcquisto: z.string().min(1, "Campo obbligatorio"),
  costo: z
    .number({ message: "Inserire un numero valido" })
    .min(0, "Il costo deve essere ≥ 0"),
  garanziaMesi: z
    .number({ message: "Inserire un numero valido" })
    .int("Deve essere un intero")
    .min(0, "La garanzia deve essere ≥ 0"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: Partial<FormValues> = {
  nome: "",
  marca: "",
  modello: "",
  numeroSeriale: "",
  dataAcquisto: "",
  note: "",
};

export function NewAssetDialog({
  open,
  onClose,
  onCreate,
  existingSerials,
  nextId,
}: NewAssetDialogProps) {
  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const selectedCategoria = useWatch({ control, name: "categoria" });
  const availableBrands = useMemo(
    () => (selectedCategoria ? BRANDS_BY_CATEGORY[selectedCategoria] : []),
    [selectedCategoria]
  );

  useEffect(() => {
    if (selectedCategoria) setValue("marca", "");
  }, [selectedCategoria, setValue]);

  useEffect(() => {
    if (!open) reset(defaultValues);
  }, [open, reset]);

  const onSubmit = handleSubmit((values) => {
    const serial = values.numeroSeriale.trim();
    if (existingSerials.includes(serial)) {
      setError("numeroSeriale", {
        type: "manual",
        message: "Numero seriale già esistente",
      });
      return;
    }
    const newAsset: Asset = {
      id: nextId,
      nome: values.nome.trim(),
      categoria: values.categoria,
      marca: values.marca,
      modello: values.modello.trim(),
      numeroSeriale: serial,
      dataAcquisto: values.dataAcquisto,
      costo: values.costo,
      garanziaMesi: values.garanziaMesi,
      stato: "Disponibile",
      assegnatoA: null,
      reparto: null,
      note: values.note?.trim() || undefined,
    };
    onCreate(newAsset);
    onClose();
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogHeader
        title="Nuovo Asset"
        description="Compila i campi per aggiungere un nuovo dispositivo all'inventario."
        onClose={onClose}
      />
      <form onSubmit={onSubmit}>
        <DialogContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Nome" error={errors.nome?.message} required>
            <Input {...register("nome")} placeholder="Es. MacBook Pro 16”" />
          </FormField>

          <FormField label="Categoria" error={errors.categoria?.message} required>
            <Controller
              control={control}
              name="categoria"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(e.target.value as AssetCategory)
                  }
                >
                  <option value="">Seleziona una categoria</option>
                  {ASSET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>

          <FormField label="Marca" error={errors.marca?.message} required>
            <Controller
              control={control}
              name="marca"
              render={({ field }) => (
                <Select
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={!selectedCategoria}
                >
                  <option value="">
                    {selectedCategoria
                      ? "Seleziona una marca"
                      : "Seleziona prima una categoria"}
                  </option>
                  {availableBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </Select>
              )}
            />
          </FormField>

          <FormField label="Modello" error={errors.modello?.message} required>
            <Input {...register("modello")} placeholder="Es. M3 Max 64GB" />
          </FormField>

          <FormField
            label="Numero Seriale"
            error={errors.numeroSeriale?.message}
            required
          >
            <Input
              {...register("numeroSeriale")}
              placeholder="Es. ASSET-SN-2026-001"
            />
          </FormField>

          <FormField
            label="Data Acquisto"
            error={errors.dataAcquisto?.message}
            required
          >
            <Input type="date" {...register("dataAcquisto")} />
          </FormField>

          <FormField label="Costo (€)" error={errors.costo?.message} required>
            <Input
              type="number"
              min={0}
              step="0.01"
              {...register("costo", { valueAsNumber: true })}
              placeholder="Es. 1299"
            />
          </FormField>

          <FormField
            label="Garanzia (mesi)"
            error={errors.garanziaMesi?.message}
            required
          >
            <Input
              type="number"
              min={0}
              step="1"
              {...register("garanziaMesi", { valueAsNumber: true })}
              placeholder="Es. 24"
            />
          </FormField>

          <div className="sm:col-span-2">
            <FormField label="Note" error={errors.note?.message}>
              <Textarea
                {...register("note")}
                placeholder="Note opzionali"
                rows={3}
              />
            </FormField>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Salva
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
