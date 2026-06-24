# Sprint Backlog — Asset Management App

**Documento**: REY-AGILE-SB  
**Progetto**: Gestione Asset Elettronici Aziendali  
**Data**: 28/05/2026  
**Versione**: 1.0  
**Durata Sprint**: 2 settimane  
**Velocity Target**: 18–20 Story Points / Sprint  
**Team**: 3 sviluppatori frontend

---

## Sprint 1 — Fondamenta (Autenticazione & Visualizzazione Base)

**Obiettivo Sprint**: L'utente può autenticarsi, vedere il proprio ruolo e visualizzare la lista dei dipendenti.  
**Periodo**: Settimana 1–2  
**Story Points Totali**: 13 SP  
**Release**: MVP (v1.0)

| # | ID | User Story | Epic | SP | Priorità | Stato |
|:-:|-----|-----------|------|:--:|----------|:-----:|
| 1 | ASSET-001 | Login utente con credenziali aziendali | E1 — Auth | 3 | Must | ⬜ To Do |
| 2 | ASSET-024 | Logout e gestione sessione | E1 — Auth | 2 | Must | ⬜ To Do |
| 3 | ASSET-002 | Gestione ruoli e permessi | E1 — Auth | 5 | Must | ⬜ To Do |
| 4 | ASSET-003 | Visualizzazione lista dipendenti e reparti | E7 — Utenti | 3 | Must | ⬜ To Do |

### Sprint Goal
> Al termine dello sprint, un utente può effettuare login/logout, il sistema riconosce il ruolo (Admin/Manager/Viewer) e applica i permessi corretti. È possibile consultare la lista dipendenti per reparto.

### Rischi & Note
- Nessuna dipendenza esterna.
- La gestione ruoli (ASSET-002) è il prerequisito per tutte le funzionalità CRUD successive.
- Sprint con buffer (13 SP su 18-20 target) per gestire setup progetto, configurazione ambiente e struttura base dell'app.

---

## Sprint 2 — Catalogo Asset (CRUD Completo)

**Obiettivo Sprint**: L'utente può visualizzare, creare, modificare, eliminare e cercare asset nel catalogo.  
**Periodo**: Settimana 3–4  
**Story Points Totali**: 18 SP  
**Release**: MVP (v1.0)

| # | ID | User Story | Epic | SP | Priorità | Stato |
|:-:|-----|-----------|------|:--:|----------|:-----:|
| 1 | ASSET-004 | Visualizzazione catalogo asset con tabella | E2 — Catalogo | 5 | Must | ⬜ To Do |
| 2 | ASSET-005 | Creazione nuovo asset elettronico | E2 — Catalogo | 5 | Must | ⬜ To Do |
| 3 | ASSET-021 | Dettaglio singolo asset con scheda completa | E2 — Catalogo | 3 | Must | ⬜ To Do |
| 4 | ASSET-008 | Ricerca e filtri avanzati catalogo | E2 — Catalogo | 5 | Must | ⬜ To Do |

### Sprint Goal
> Al termine dello sprint, il catalogo asset è completamente navigabile: tabella paginata con ordinamento, ricerca full-text, filtri per categoria/stato, creazione nuovi asset tramite form e visualizzazione scheda dettaglio.

### Rischi & Note
- **Dipendenze**: ASSET-001 e ASSET-002 (Sprint 1) devono essere completate.
- ASSET-006 (Modifica) e ASSET-007 (Eliminazione) sono spostati allo Sprint 3 per bilanciare il carico.
- Ordine di sviluppo consigliato: ASSET-004 → ASSET-021 → ASSET-005 → ASSET-008.

---

## Sprint 3 — Completamento Catalogo + Assegnazioni

**Obiettivo Sprint**: Completare le operazioni CRUD sul catalogo e abilitare l'assegnazione/revoca asset ai dipendenti.  
**Periodo**: Settimana 5–6  
**Story Points Totali**: 19 SP  
**Release**: MVP (v1.0)

| # | ID | User Story | Epic | SP | Priorità | Stato |
|:-:|-----|-----------|------|:--:|----------|:-----:|
| 1 | ASSET-006 | Modifica dettagli asset esistente | E2 — Catalogo | 3 | Must | ⬜ To Do |
| 2 | ASSET-007 | Eliminazione asset (soft delete) | E2 — Catalogo | 2 | Must | ⬜ To Do |
| 3 | ASSET-009 | Assegnazione asset a dipendente | E3 — Assegnazione | 5 | Must | ⬜ To Do |
| 4 | ASSET-010 | Revoca assegnazione asset | E3 — Assegnazione | 3 | Must | ⬜ To Do |
| 5 | ASSET-012 | Visualizzazione stato ciclo di vita | E4 — Ciclo di Vita | 3 | Must | ⬜ To Do |
| 6 | ASSET-011 | Storico assegnazioni per asset | E3 — Assegnazione | 3 | Should | ⬜ To Do |

### Sprint Goal
> Al termine dello sprint, il CRUD asset è completo (modifica e soft delete). I Manager e Admin possono assegnare e revocare asset ai dipendenti, con storico consultabile. Ogni asset mostra il badge di stato del ciclo di vita. **Fine del MVP (v1.0).**

### Rischi & Note
- **Dipendenze**: ASSET-004, ASSET-005 (Sprint 2) e ASSET-003 (Sprint 1).
- ASSET-011 (Storico) è "Should" — può essere spostata allo Sprint 4 se la velocity è inferiore al previsto.
- La visualizzazione stato (ASSET-012) prepara il terreno per il workflow di Sprint 4.

---

## Sprint 4 — Ciclo di Vita + Dashboard

**Obiettivo Sprint**: Implementare il workflow di cambio stato asset, la timeline e la dashboard panoramica.  
**Periodo**: Settimana 7–8  
**Story Points Totali**: 18 SP  
**Release**: v1.1

| # | ID | User Story | Epic | SP | Priorità | Stato |
|:-:|-----|-----------|------|:--:|----------|:-----:|
| 1 | ASSET-013 | Cambio stato asset (workflow) | E4 — Ciclo di Vita | 5 | Must | ⬜ To Do |
| 2 | ASSET-014 | Timeline ciclo di vita asset | E4 — Ciclo di Vita | 5 | Should | ⬜ To Do |
| 3 | ASSET-015 | Dashboard panoramica asset | E5 — Dashboard | 8 | Should | ⬜ To Do |

### Sprint Goal
> Al termine dello sprint, un Admin può gestire le transizioni di stato degli asset (workflow con regole) e visualizzare la timeline cronologica. La dashboard mostra KPI (totale asset, distribuzione per stato) e grafici di base.

### Rischi & Note
- **Dipendenze**: ASSET-012 (Sprint 3).
- ASSET-015 (Dashboard, 8 SP) è la story più grande del backlog — valutare lo split in sotto-task durante il planning.
- Se la Dashboard richiede più effort, ASSET-014 (Timeline) può slittare allo Sprint 5.

---

## Sprint 5 — Reportistica + Notifiche

**Obiettivo Sprint**: Completare la reportistica con export dati e attivare le notifiche sulle scadenze.  
**Periodo**: Settimana 9–10  
**Story Points Totali**: 18 SP  
**Release**: v1.1

| # | ID | User Story | Epic | SP | Priorità | Stato |
|:-:|-----|-----------|------|:--:|----------|:-----:|
| 1 | ASSET-016 | Report distribuzione asset per reparto | E5 — Dashboard | 5 | Should | ⬜ To Do |
| 2 | ASSET-017 | Export dati in CSV | E5 — Dashboard | 3 | Should | ⬜ To Do |
| 3 | ASSET-018 | Notifiche scadenza garanzia | E6 — Notifiche | 5 | Should | ⬜ To Do |
| 4 | ASSET-023 | Grafici distribuzione per categoria | E5 — Dashboard | 5 | Could | ⬜ To Do |

### Sprint Goal
> Al termine dello sprint, i Manager possono generare report per reparto, esportare dati in CSV e visualizzare grafici interattivi. Il sistema mostra notifiche per le garanzie in scadenza nei prossimi 30 giorni. **Fine della release v1.1.**

### Rischi & Note
- **Dipendenze**: ASSET-015 (Sprint 4) per i report e grafici.
- ASSET-023 (Grafici, "Could") è sacrificabile se la velocity cala — può essere spostata a un eventuale Sprint 7.

---

## Sprint 6 — Gestione Utenti, Alert & Configurazione

**Obiettivo Sprint**: Completare la gestione anagrafica, gli alert di manutenzione e le impostazioni.  
**Periodo**: Settimana 11–12  
**Story Points Totali**: 11 SP  
**Release**: v1.2

| # | ID | User Story | Epic | SP | Priorità | Stato |
|:-:|-----|-----------|------|:--:|----------|:-----:|
| 1 | ASSET-020 | CRUD dipendenti e reparti | E7 — Utenti | 5 | Must | ⬜ To Do |
| 2 | ASSET-019 | Alert manutenzione programmata | E6 — Notifiche | 3 | Should | ⬜ To Do |
| 3 | ASSET-022 | Configurazione categorie asset | E8 — Impostazioni | 3 | Could | ⬜ To Do |

### Sprint Goal
> Al termine dello sprint, un Admin può gestire l'anagrafica completa (CRUD dipendenti/reparti), configurare le categorie asset e il sistema genera alert per manutenzioni programmate. **Fine della release v1.2 — applicazione completa.**

### Rischi & Note
- Sprint con carico ridotto (11 SP) — buffer per bug fixing, raffinamento UX e debt tecnico accumulato.
- Possibilità di anticipare story da un eventuale Sprint 7 (backlog futuro) o dedicare tempo a test end-to-end.

---

## Riepilogo Sprint

| Sprint | Settimane | SP | Release | Epic Coperte | Stories |
|:------:|:---------:|:--:|---------|-------------|:-------:|
| 1 | 1–2 | 13 | MVP v1.0 | E1, E7 | 4 |
| 2 | 3–4 | 18 | MVP v1.0 | E2 | 4 |
| 3 | 5–6 | 19 | MVP v1.0 | E2, E3, E4 | 6 |
| 4 | 7–8 | 18 | v1.1 | E4, E5 | 3 |
| 5 | 9–10 | 18 | v1.1 | E5, E6 | 4 |
| 6 | 11–12 | 11 | v1.2 | E6, E7, E8 | 3 |
| **Totale** | **12 settimane** | **97 SP** | | **8 Epic** | **24 Stories** |

---

## Burndown Previsto

```
SP Rimanenti
100 |■
 90 |  ■
 80 |    ■
 70 |      ■
 60 |        ■
 50 |          ■  ← Fine MVP (v1.0)
 40 |            ■
 30 |              ■
 20 |                ■  ← Fine v1.1
 10 |                  ■
  0 |                    ■  ← Fine v1.2
    +----+----+----+----+----+----+
     S1   S2   S3   S4   S5   S6
```

---

## Cerimonie Scrum per Sprint

| Cerimonia | Durata | Partecipanti |
|-----------|--------|-------------|
| Sprint Planning | 2h | PO, SM, Team Dev |
| Daily Standup | 15 min | SM, Team Dev |
| Sprint Review | 1h | PO, SM, Team Dev, Stakeholder |
| Sprint Retrospective | 1h | PO, SM, Team Dev |
| Backlog Refinement | 1h (metà sprint) | PO, Team Dev |
