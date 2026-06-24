# User Stories — Asset Management App

**Documento**: REY-AGILE-USD  
**Progetto**: Gestione Asset Elettronici Aziendali  
**Data**: 28/05/2026  
**Versione**: 1.0

---

## Epic E1 — Autenticazione & Autorizzazione

---

**ID**: ASSET-001  
**Epic**: Autenticazione & Autorizzazione  
**Titolo**: Login utente con credenziali aziendali

**Come** utente aziendale,  
**Voglio** effettuare il login con le mie credenziali (email e password),  
**In modo da** accedere all'applicazione di gestione asset in base al mio ruolo.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella pagina di login, **Quando** inserisco email `mario.rossi@azienda.it` e password valida e clicco "Accedi", **Allora** vengo reindirizzato alla dashboard principale e vedo il mio nome nell'header.
- **Dato che** sono nella pagina di login, **Quando** inserisco credenziali non valide, **Allora** vedo il messaggio di errore "Credenziali non valide. Riprova." e il form non viene resettato.
- **Dato che** sono nella pagina di login, **Quando** lascio uno dei campi vuoto e clicco "Accedi", **Allora** vedo la validazione inline "Campo obbligatorio" sotto il campo vuoto.

### Stima: 3 Story Points
### Priorità: Must
### Dipendenze: Nessuna

---

**ID**: ASSET-002  
**Epic**: Autenticazione & Autorizzazione  
**Titolo**: Gestione ruoli e permessi

**Come** Admin,  
**Voglio** che il sistema gestisca tre ruoli (Admin, Manager, Viewer) con permessi differenziati,  
**In modo da** garantire che ogni utente possa accedere solo alle funzionalità previste dal proprio ruolo.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono loggato come Admin, **Quando** accedo a qualsiasi sezione dell'app, **Allora** ho accesso completo a tutte le funzionalità (CRUD asset, assegnazioni, gestione utenti, impostazioni).
- **Dato che** sono loggato come Manager, **Quando** accedo al catalogo asset, **Allora** posso visualizzare, creare e modificare asset ma non posso eliminarli né accedere alle impostazioni.
- **Dato che** sono loggato come Viewer, **Quando** accedo all'applicazione, **Allora** posso solo visualizzare il catalogo, la dashboard e i report, senza poter modificare alcun dato.
- **Dato che** sono loggato come Viewer, **Quando** provo ad accedere a una rotta protetta (es. `/settings`), **Allora** vengo reindirizzato alla dashboard con un messaggio "Accesso non autorizzato".

### Stima: 5 Story Points
### Priorità: Must
### Dipendenze: ASSET-001

---

**ID**: ASSET-024  
**Epic**: Autenticazione & Autorizzazione  
**Titolo**: Logout e gestione sessione

**Come** utente autenticato,  
**Voglio** poter effettuare il logout dall'applicazione,  
**In modo da** proteggere il mio account quando non sto utilizzando il sistema.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono loggato, **Quando** clicco sul pulsante "Esci" nel menu utente, **Allora** la sessione viene terminata e vengo reindirizzato alla pagina di login.
- **Dato che** la mia sessione è scaduta (dopo 30 minuti di inattività), **Quando** provo a navigare nell'app, **Allora** vengo reindirizzato al login con il messaggio "Sessione scaduta. Effettua nuovamente il login."

### Stima: 2 Story Points
### Priorità: Must
### Dipendenze: ASSET-001

---

## Epic E2 — Catalogo Asset Elettronici

---

**ID**: ASSET-004  
**Epic**: Catalogo Asset Elettronici  
**Titolo**: Visualizzazione catalogo asset con tabella

**Come** Manager,  
**Voglio** visualizzare tutti gli asset elettronici aziendali in una tabella paginata,  
**In modo da** avere una panoramica completa dell'inventario.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella pagina Catalogo, **Quando** la pagina viene caricata, **Allora** vedo una tabella con le colonne: ID Asset, Nome, Categoria, Marca, Modello, Numero Seriale, Stato, Assegnato a, Data Acquisto.
- **Dato che** il catalogo contiene più di 20 asset, **Quando** visualizzo la tabella, **Allora** vedo una paginazione con 20 righe per pagina e i controlli per navigare tra le pagine.
- **Dato che** sono nella tabella catalogo, **Quando** clicco sull'header di una colonna (es. "Nome"), **Allora** la tabella si ordina per quella colonna in ordine ascendente; un secondo click inverte l'ordinamento.

### Stima: 5 Story Points
### Priorità: Must
### Dipendenze: ASSET-001, ASSET-002

---

**ID**: ASSET-005  
**Epic**: Catalogo Asset Elettronici  
**Titolo**: Creazione nuovo asset elettronico

**Come** Admin,  
**Voglio** poter inserire un nuovo asset elettronico compilando un form strutturato,  
**In modo da** aggiungere nuovi dispositivi all'inventario aziendale.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella pagina Catalogo e ho ruolo Admin, **Quando** clicco "Nuovo Asset", **Allora** si apre un form con i campi: Nome, Categoria (dropdown), Marca, Modello, Numero Seriale, Data Acquisto, Costo (€), Garanzia (mesi), Note.
- **Dato che** sto compilando il form nuovo asset, **Quando** seleziono la Categoria "Laptop", **Allora** il dropdown Marca propone: Apple, Dell, Lenovo, HP, Asus.
- **Dato che** ho compilato tutti i campi obbligatori, **Quando** clicco "Salva", **Allora** l'asset viene aggiunto al catalogo, vedo una notifica "Asset creato con successo" e vengo riportato alla lista.
- **Dato che** non ho compilato un campo obbligatorio (es. Numero Seriale), **Quando** clicco "Salva", **Allora** vedo la validazione "Campo obbligatorio" e il form non viene inviato.

### Stima: 5 Story Points
### Priorità: Must
### Dipendenze: ASSET-004

---

**ID**: ASSET-006  
**Epic**: Catalogo Asset Elettronici  
**Titolo**: Modifica dettagli asset esistente

**Come** Admin o Manager,  
**Voglio** modificare i dati di un asset elettronico esistente,  
**In modo da** mantenere aggiornate le informazioni dell'inventario.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella scheda dettaglio di un asset (es. "MacBook Pro 16" — ASSET-SN-2024-001"), **Quando** clicco "Modifica", **Allora** i campi diventano editabili e vedo i pulsanti "Salva" e "Annulla".
- **Dato che** ho modificato il campo "Stato" da "In uso" a "In manutenzione", **Quando** clicco "Salva", **Allora** la modifica viene salvata e vedo la notifica "Asset aggiornato con successo".
- **Dato che** sono un Viewer, **Quando** accedo alla scheda dettaglio, **Allora** non vedo il pulsante "Modifica".

### Stima: 3 Story Points
### Priorità: Must
### Dipendenze: ASSET-005

---

**ID**: ASSET-007  
**Epic**: Catalogo Asset Elettronici  
**Titolo**: Eliminazione asset (soft delete)

**Come** Admin,  
**Voglio** poter eliminare un asset dal catalogo (soft delete),  
**In modo da** rimuovere dispositivi dismessi senza perdere lo storico.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella scheda dettaglio di un asset e ho ruolo Admin, **Quando** clicco "Elimina", **Allora** appare un dialog di conferma "Sei sicuro di voler eliminare l'asset MacBook Pro 16" (SN: ASSET-SN-2024-001)?".
- **Dato che** ho confermato l'eliminazione, **Quando** il dialog si chiude, **Allora** l'asset non è più visibile nel catalogo attivo ma è consultabile nella sezione "Asset Dismessi".
- **Dato che** sono un Manager o Viewer, **Quando** vedo la scheda dettaglio, **Allora** il pulsante "Elimina" non è presente.

### Stima: 2 Story Points
### Priorità: Must
### Dipendenze: ASSET-005

---

**ID**: ASSET-008  
**Epic**: Catalogo Asset Elettronici  
**Titolo**: Ricerca e filtri avanzati catalogo

**Come** utente autenticato,  
**Voglio** poter cercare e filtrare gli asset per categoria, stato, reparto e testo libero,  
**In modo da** trovare rapidamente il dispositivo che mi interessa.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella pagina Catalogo, **Quando** digito "ThinkPad" nella barra di ricerca, **Allora** la tabella mostra solo gli asset il cui nome, marca o modello contiene "ThinkPad".
- **Dato che** sono nella pagina Catalogo, **Quando** seleziono il filtro Categoria = "Monitor" e Stato = "In uso", **Allora** la tabella mostra solo i monitor attualmente in uso.
- **Dato che** ho applicato dei filtri, **Quando** clicco "Reset filtri", **Allora** tutti i filtri vengono rimossi e la tabella mostra l'elenco completo.

### Stima: 5 Story Points
### Priorità: Must
### Dipendenze: ASSET-004

---

**ID**: ASSET-021  
**Epic**: Catalogo Asset Elettronici  
**Titolo**: Dettaglio singolo asset con scheda completa

**Come** utente autenticato,  
**Voglio** visualizzare una scheda dettagliata di un singolo asset,  
**In modo da** consultare tutte le informazioni tecniche, lo stato e lo storico del dispositivo.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella tabella catalogo, **Quando** clicco su una riga (es. "Dell XPS 15"), **Allora** si apre la scheda dettaglio con: immagine placeholder, nome, categoria, marca, modello, numero seriale, data acquisto, costo, mesi garanzia, stato corrente, assegnato a, note.
- **Dato che** sono nella scheda dettaglio, **Quando** guardo la sezione "Informazioni", **Allora** vedo i dati organizzati in sezioni: "Dati Generali", "Dettagli Tecnici", "Assegnazione", "Ciclo di Vita".

### Stima: 3 Story Points
### Priorità: Must
### Dipendenze: ASSET-004

---

## Epic E3 — Assegnazione Asset

---

**ID**: ASSET-009  
**Epic**: Assegnazione Asset  
**Titolo**: Assegnazione asset a dipendente

**Come** Admin o Manager,  
**Voglio** assegnare un asset elettronico a un dipendente selezionandolo da un elenco,  
**In modo da** tracciare chi ha in dotazione ogni dispositivo.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella scheda dettaglio di un asset con stato "Disponibile", **Quando** clicco "Assegna", **Allora** si apre un modal con un campo di ricerca autocomplete che elenca i dipendenti (es. "Mario Rossi — IT", "Laura Bianchi — Marketing").
- **Dato che** ho selezionato il dipendente "Mario Rossi — IT", **Quando** clicco "Conferma Assegnazione", **Allora** l'asset cambia stato da "Disponibile" a "In uso", il campo "Assegnato a" mostra "Mario Rossi — IT" e la data di assegnazione è oggi (28/05/2026).
- **Dato che** l'asset è già assegnato a un altro dipendente, **Quando** provo ad assegnarlo, **Allora** vedo il messaggio "Asset già assegnato a Laura Bianchi. Revocare prima l'assegnazione corrente."

### Stima: 5 Story Points
### Priorità: Must
### Dipendenze: ASSET-004, ASSET-003

---

**ID**: ASSET-010  
**Epic**: Assegnazione Asset  
**Titolo**: Revoca assegnazione asset

**Come** Admin o Manager,  
**Voglio** revocare l'assegnazione di un asset a un dipendente,  
**In modo da** rendere il dispositivo nuovamente disponibile per nuove assegnazioni.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella scheda di un asset assegnato a "Mario Rossi", **Quando** clicco "Revoca Assegnazione", **Allora** appare un dialog di conferma con il testo "Revocare l'assegnazione del MacBook Pro 16" a Mario Rossi?".
- **Dato che** ho confermato la revoca, **Quando** il dialog si chiude, **Allora** l'asset torna allo stato "Disponibile", il campo "Assegnato a" è vuoto e la revoca è registrata nello storico.

### Stima: 3 Story Points
### Priorità: Must
### Dipendenze: ASSET-009

---

**ID**: ASSET-011  
**Epic**: Assegnazione Asset  
**Titolo**: Storico assegnazioni per asset

**Come** Admin o Manager,  
**Voglio** visualizzare lo storico di tutte le assegnazioni di un asset,  
**In modo da** sapere chi ha avuto in dotazione il dispositivo nel tempo.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella scheda dettaglio dell'asset "MacBook Pro 16" (SN: ASSET-SN-2024-001), **Quando** apro la tab "Storico Assegnazioni", **Allora** vedo una tabella con colonne: Dipendente, Reparto, Data Assegnazione, Data Revoca, Durata.
- **Dato che** lo storico contiene le assegnazioni mockup, **Quando** visualizzo la tabella, **Allora** vedo: "Laura Bianchi — Marketing (01/03/2024 → 15/01/2025, 10 mesi)", "Mario Rossi — IT (16/01/2025 → in corso)".

### Stima: 3 Story Points
### Priorità: Should
### Dipendenze: ASSET-009

---

## Epic E4 — Ciclo di Vita Asset

---

**ID**: ASSET-012  
**Epic**: Ciclo di Vita Asset  
**Titolo**: Visualizzazione stato ciclo di vita

**Come** utente autenticato,  
**Voglio** vedere lo stato attuale di un asset nel suo ciclo di vita,  
**In modo da** comprendere rapidamente se il dispositivo è attivo, in manutenzione o dismesso.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella scheda dettaglio di un asset, **Quando** guardo la sezione "Stato", **Allora** vedo un badge colorato con lo stato corrente: 🟢 Disponibile, 🔵 In uso, 🟡 In manutenzione, 🔴 Dismesso.
- **Dato che** sono nella tabella catalogo, **Quando** guardo la colonna "Stato", **Allora** ogni riga mostra il badge di stato corrispondente.

### Stima: 3 Story Points
### Priorità: Must
### Dipendenze: ASSET-004

---

**ID**: ASSET-013  
**Epic**: Ciclo di Vita Asset  
**Titolo**: Cambio stato asset (workflow)

**Come** Admin,  
**Voglio** cambiare lo stato di un asset seguendo un workflow predefinito,  
**In modo da** tracciare correttamente le transizioni nel ciclo di vita del dispositivo.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** un asset è in stato "In uso", **Quando** clicco "Cambia Stato", **Allora** vedo solo le transizioni permesse: "In manutenzione" e "Dismesso" (non "Disponibile" direttamente).
- **Dato che** ho selezionato la transizione "In manutenzione", **Quando** compilo il campo obbligatorio "Motivo" (es. "Sostituzione batteria") e confermo, **Allora** lo stato cambia a "In manutenzione" e la transizione è registrata con data, utente e motivo.
- **Dato che** un asset è "In manutenzione", **Quando** clicco "Cambia Stato", **Allora** le transizioni disponibili sono: "Disponibile" (riparato) e "Dismesso" (non riparabile).

### Stima: 5 Story Points
### Priorità: Must
### Dipendenze: ASSET-012

---

**ID**: ASSET-014  
**Epic**: Ciclo di Vita Asset  
**Titolo**: Timeline ciclo di vita asset

**Come** Admin o Manager,  
**Voglio** visualizzare una timeline visuale di tutti i cambi di stato di un asset,  
**In modo da** avere una visione cronologica completa del ciclo di vita del dispositivo.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella scheda dettaglio dell'asset "Dell XPS 15" (SN: ASSET-SN-2024-003), **Quando** apro la tab "Timeline", **Allora** vedo una timeline verticale con gli eventi: "15/01/2024 — Acquistato (€1.450,00)", "20/01/2024 — Assegnato a Giulia Verdi", "10/09/2025 — In manutenzione (Sostituzione SSD)", "25/09/2025 — Disponibile (Riparato)", "01/10/2025 — Assegnato a Marco Neri".
- **Dato che** la timeline ha più di 10 eventi, **Quando** scorro verso il basso, **Allora** gli eventi più vecchi vengono mostrati in fondo con lazy loading.

### Stima: 5 Story Points
### Priorità: Should
### Dipendenze: ASSET-013

---

## Epic E5 — Dashboard & Reportistica

---

**ID**: ASSET-015  
**Epic**: Dashboard & Reportistica  
**Titolo**: Dashboard panoramica asset

**Come** Manager o Admin,  
**Voglio** vedere una dashboard con KPI e grafici sugli asset aziendali,  
**In modo da** avere una visione d'insieme dello stato dell'inventario.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella pagina Dashboard, **Quando** la pagina si carica, **Allora** vedo le seguenti card KPI: Totale Asset (150), Asset In Uso (98), Asset Disponibili (32), Asset In Manutenzione (12), Asset Dismessi (8).
- **Dato che** sono nella Dashboard, **Quando** guardo la sezione grafici, **Allora** vedo un grafico a torta "Distribuzione per Categoria" (Laptop: 45, Monitor: 35, Smartphone: 25, Tablet: 15, Stampanti: 10, Server: 8, Accessori: 7, Rete: 5).
- **Dato che** sono nella Dashboard, **Quando** guardo il grafico a barre "Asset per Reparto", **Allora** vedo: IT (42), Marketing (28), Vendite (25), HR (18), Amministrazione (15), Direzione (12), Produzione (10).

### Stima: 8 Story Points
### Priorità: Should
### Dipendenze: ASSET-004

---

**ID**: ASSET-016  
**Epic**: Dashboard & Reportistica  
**Titolo**: Report distribuzione asset per reparto

**Come** Manager,  
**Voglio** generare un report dettagliato della distribuzione degli asset per reparto,  
**In modo da** pianificare acquisti e riallocazioni.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella sezione Report, **Quando** seleziono "Report per Reparto", **Allora** vedo una tabella con: Reparto, Numero Asset, Valore Totale (€), Asset più vecchio, Asset più recente.
- **Dato che** visualizzo il report, **Quando** clicco su un reparto (es. "IT — 42 asset — €68.500,00"), **Allora** vedo il dettaglio con l'elenco di tutti gli asset di quel reparto.

### Stima: 5 Story Points
### Priorità: Should
### Dipendenze: ASSET-015

---

**ID**: ASSET-017  
**Epic**: Dashboard & Reportistica  
**Titolo**: Export dati in CSV

**Come** Admin,  
**Voglio** esportare i dati del catalogo asset in formato CSV,  
**In modo da** poterli elaborare con strumenti esterni (Excel, Google Sheets).

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella pagina Catalogo con filtri applicati (es. Categoria = "Laptop"), **Quando** clicco "Esporta CSV", **Allora** viene scaricato un file `asset_export_20260528.csv` contenente solo gli asset filtrati.
- **Dato che** il file CSV è stato scaricato, **Quando** lo apro, **Allora** contiene le colonne: ID, Nome, Categoria, Marca, Modello, Numero Seriale, Stato, Assegnato A, Reparto, Data Acquisto, Costo, Garanzia Mesi.

### Stima: 3 Story Points
### Priorità: Should
### Dipendenze: ASSET-004

---

**ID**: ASSET-023  
**Epic**: Dashboard & Reportistica  
**Titolo**: Grafici distribuzione per categoria

**Come** Manager,  
**Voglio** visualizzare grafici interattivi sulla distribuzione degli asset per categoria e stato,  
**In modo da** identificare trend e necessità di approvvigionamento.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella sezione Report, **Quando** seleziono "Distribuzione per Categoria", **Allora** vedo un grafico a barre impilate con le categorie sull'asse X e gli stati (Disponibile, In uso, Manutenzione, Dismesso) come segmenti colorati.
- **Dato che** visualizzo il grafico, **Quando** passo il mouse su un segmento (es. "Laptop — In uso: 38"), **Allora** vedo un tooltip con il numero e la percentuale.

### Stima: 5 Story Points
### Priorità: Could
### Dipendenze: ASSET-015

---

## Epic E6 — Notifiche & Scadenze

---

**ID**: ASSET-018  
**Epic**: Notifiche & Scadenze  
**Titolo**: Notifiche scadenza garanzia

**Come** Admin o Manager,  
**Voglio** ricevere notifiche quando la garanzia di un asset sta per scadere (30 giorni prima),  
**In modo da** pianificare il rinnovo o la sostituzione del dispositivo.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** ci sono asset con garanzia in scadenza nei prossimi 30 giorni, **Quando** accedo all'app, **Allora** vedo un badge numerico sull'icona campanella nell'header (es. "3").
- **Dato che** clicco sull'icona campanella, **Quando** si apre il pannello notifiche, **Allora** vedo l'elenco: "⚠️ Garanzia in scadenza: Dell XPS 15 (SN: ASSET-SN-2024-003) — scade il 15/06/2026", "⚠️ Garanzia in scadenza: iPhone 15 Pro (SN: ASSET-SN-2024-007) — scade il 28/06/2026".
- **Dato che** clicco su una notifica, **Quando** la seleziono, **Allora** vengo portato alla scheda dettaglio dell'asset corrispondente.

### Stima: 5 Story Points
### Priorità: Should
### Dipendenze: ASSET-004

---

**ID**: ASSET-019  
**Epic**: Notifiche & Scadenze  
**Titolo**: Alert manutenzione programmata

**Come** Admin,  
**Voglio** configurare alert per manutenzioni programmate su asset specifici,  
**In modo da** non dimenticare interventi periodici sui dispositivi (es. check annuale server).

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella scheda dettaglio di un asset (es. "Server Dell PowerEdge"), **Quando** clicco "Pianifica Manutenzione", **Allora** posso impostare: data prossima manutenzione, frequenza (una tantum, mensile, trimestrale, annuale), descrizione intervento.
- **Dato che** una manutenzione è programmata per i prossimi 7 giorni, **Quando** accedo all'app, **Allora** vedo la notifica "🔧 Manutenzione programmata: Server Dell PowerEdge R750 — 04/06/2026 — Check annuale".

### Stima: 3 Story Points
### Priorità: Should
### Dipendenze: ASSET-018

---

## Epic E7 — Gestione Utenti & Reparti

---

**ID**: ASSET-003  
**Epic**: Gestione Utenti & Reparti  
**Titolo**: Visualizzazione lista dipendenti e reparti

**Come** Admin o Manager,  
**Voglio** visualizzare l'elenco dei dipendenti organizzati per reparto,  
**In modo da** sapere a chi posso assegnare gli asset.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella sezione "Utenti", **Quando** la pagina si carica, **Allora** vedo una tabella con: Nome, Cognome, Email, Reparto, Sede, Numero Asset Assegnati.
- **Dato che** vedo la lista dipendenti, **Quando** filtro per Reparto = "IT", **Allora** la tabella mostra solo i dipendenti del reparto IT (es. Mario Rossi, Giulia Verdi, Paolo Gialli).

### Stima: 3 Story Points
### Priorità: Must
### Dipendenze: ASSET-001

---

**ID**: ASSET-020  
**Epic**: Gestione Utenti & Reparti  
**Titolo**: CRUD dipendenti e reparti

**Come** Admin,  
**Voglio** poter aggiungere, modificare ed eliminare dipendenti e reparti,  
**In modo da** mantenere aggiornata l'anagrafica aziendale.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella sezione Utenti con ruolo Admin, **Quando** clicco "Nuovo Dipendente", **Allora** si apre un form con: Nome, Cognome, Email, Reparto (dropdown), Sede (dropdown), Ruolo App (Admin/Manager/Viewer).
- **Dato che** ho compilato il form con "Anna Neri", "anna.neri@azienda.it", Reparto "HR", Sede "Milano", **Quando** clicco "Salva", **Allora** il dipendente appare nella lista e vedo la notifica "Dipendente creato con successo".
- **Dato che** un dipendente ha asset assegnati, **Quando** provo a eliminarlo, **Allora** vedo il messaggio "Impossibile eliminare: il dipendente ha 3 asset assegnati. Revocare prima le assegnazioni."

### Stima: 5 Story Points
### Priorità: Must
### Dipendenze: ASSET-003

---

## Epic E8 — Impostazioni

---

**ID**: ASSET-022  
**Epic**: Impostazioni  
**Titolo**: Configurazione categorie asset

**Come** Admin,  
**Voglio** poter gestire le categorie di asset (aggiungere, rinominare, disattivare),  
**In modo da** adattare il sistema alle esigenze specifiche dell'azienda.

### Criteri di Accettazione (BDD — Given/When/Then)
- **Dato che** sono nella sezione Impostazioni > Categorie, **Quando** la pagina si carica, **Allora** vedo l'elenco delle categorie: Laptop, Monitor, Smartphone, Tablet, Stampanti, Server, Accessori IT, Dispositivi di Rete, con il conteggio asset per ciascuna.
- **Dato che** clicco "Nuova Categoria", **Quando** inserisco "Proiettori" e clicco "Salva", **Allora** la categoria appare nell'elenco e diventa disponibile nel dropdown di creazione asset.
- **Dato che** una categoria ha asset associati (es. "Stampanti — 10 asset"), **Quando** provo a eliminarla, **Allora** vedo il messaggio "Impossibile eliminare: categoria in uso da 10 asset. Disattivare invece?".

### Stima: 3 Story Points
### Priorità: Could
### Dipendenze: ASSET-004
