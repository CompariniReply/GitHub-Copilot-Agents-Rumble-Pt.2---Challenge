/**
 * Utility per l'export CSV già pronta per la challenge (ASSET-017).
 *
 * Genera un CSV compatibile con Excel italiano:
 * - separatore `;` (Excel IT usa il punto e virgola come delimitatore di colonna);
 * - BOM UTF-8 in testa al file, così Excel interpreta correttamente gli accenti.
 *
 * Esempio:
 *   downloadCSV("asset_export", [
 *     { ID: "A001", Nome: "MacBook Pro", Costo: 3299 },
 *     { ID: "A002", Nome: "Dell XPS", Costo: 1450 },
 *   ]);
 */

/** Racchiude un valore tra virgolette se contiene caratteri speciali. */
function escapeCell(value: unknown): string {
  const text = value == null ? "" : String(value);
  if (/[";\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/** Costruisce il contenuto testuale di un CSV (separatore `;`). */
export function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const headerLine = headers.map(escapeCell).join(";");
  const dataLines = rows.map((row) =>
    headers.map((header) => escapeCell(row[header])).join(";")
  );
  return [headerLine, ...dataLines].join("\r\n");
}

/** Aggiunge la data odierna al nome file, es. `asset_export_20260624.csv`. */
export function withDateSuffix(baseName: string): string {
  const now = new Date();
  const stamp =
    String(now.getFullYear()) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  return `${baseName}_${stamp}.csv`;
}

/**
 * Genera e scarica un file CSV a partire da un array di oggetti.
 * Le chiavi del primo oggetto diventano le intestazioni di colonna.
 *
 * @param baseName nome del file senza estensione (la data viene aggiunta in automatico)
 * @param rows     righe da esportare
 */
export function downloadCSV(baseName: string, rows: Record<string, unknown>[]): void {
  const csv = toCSV(rows);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = withDateSuffix(baseName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
