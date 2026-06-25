import { Badge } from "@/components/ui/badge";
import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { formatCurrency, getStatusBadgeVariant } from "@/lib/asset-helpers";
import type { Asset } from "@/lib/types";
import { Package } from "lucide-react";

interface AssetDetailDialogProps {
  asset: Asset | null;
  onClose: () => void;
}

export function AssetDetailDialog({ asset, onClose }: AssetDetailDialogProps) {
  return (
    <Dialog open={asset !== null} onOpenChange={(o) => !o && onClose()}>
      {asset && (
        <>
          <DialogHeader
            title={asset.nome}
            description={`${asset.marca} · ${asset.modello}`}
            onClose={onClose}
          />
          <DialogContent className="space-y-6">
            <div className="flex items-center justify-center rounded-md border bg-muted/30 py-10">
              <Package className="h-16 w-16 text-muted-foreground" />
            </div>

            <Section title="Dati Generali">
              <Field label="ID Asset" value={asset.id} />
              <Field label="Nome" value={asset.nome} />
              <Field label="Categoria" value={asset.categoria} />
              <Field label="Numero Seriale" value={asset.numeroSeriale} />
            </Section>

            <Section title="Dettagli Tecnici">
              <Field label="Marca" value={asset.marca} />
              <Field label="Modello" value={asset.modello} />
              <Field label="Ubicazione" value={asset.ubicazione ?? "—"} />
              <Field label="Note" value={asset.note ?? "—"} />
            </Section>

            <Section title="Assegnazione">
              <Field label="Assegnato a" value={asset.assegnatoA ?? "Non assegnato"} />
              <Field label="Reparto" value={asset.reparto ?? "—"} />
              <Field
                label="Stato"
                value={
                  <Badge variant={getStatusBadgeVariant(asset.stato)}>{asset.stato}</Badge>
                }
              />
            </Section>

            <Section title="Ciclo di Vita">
              <Field label="Data Acquisto" value={asset.dataAcquisto} />
              <Field label="Costo" value={formatCurrency(asset.costo)} />
              <Field label="Garanzia" value={`${asset.garanziaMesi} mesi`} />
            </Section>
          </DialogContent>
        </>
      )}
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
