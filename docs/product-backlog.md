# Product Backlog — Asset Management App (Frontend React)

**Documento**: REY-AGILE-PB  
**Progetto**: Gestione Asset Elettronici Aziendali  
**Data**: 28/05/2026  
**Product Owner**: Team Reply  
**Versione**: 1.0

---

## Visione del Prodotto

Applicazione frontend React per la gestione centralizzata degli asset elettronici aziendali. Permette di inventariare, assegnare, tracciare il ciclo di vita e monitorare lo stato di tutti i dispositivi elettronici dell'azienda.

---

## Categorie Asset Elettronici

| Categoria | Esempi |
|-----------|--------|
| Laptop | MacBook Pro, Dell XPS, Lenovo ThinkPad |
| Monitor | Dell UltraSharp 27", LG 4K 32" |
| Smartphone | iPhone 15 Pro, Samsung Galaxy S24 |
| Tablet | iPad Pro 12.9", Samsung Galaxy Tab S9 |
| Stampanti | HP LaserJet Pro, Epson EcoTank |
| Server | Dell PowerEdge R750, HPE ProLiant |
| Accessori IT | Mouse, tastiere, docking station, cuffie, webcam |
| Dispositivi di Rete | Router, switch, access point Wi-Fi |

---

## Epics

| # | Epic | Descrizione | Priorità |
|---|------|-------------|----------|
| E1 | **Autenticazione & Autorizzazione** | Login, ruoli (Admin, Manager, Viewer), gestione permessi | Must |
| E2 | **Catalogo Asset Elettronici** | CRUD asset, categorizzazione per tipo dispositivo, ricerca e filtri avanzati | Must |
| E3 | **Assegnazione Asset** | Assegnazione/revoca asset a dipendenti o reparti | Must |
| E4 | **Ciclo di Vita Asset** | Tracciamento stati: acquisto → in uso → manutenzione → dismissione | Must |
| E5 | **Dashboard & Reportistica** | KPI, grafici distribuzione asset, export CSV/PDF | Should |
| E6 | **Notifiche & Scadenze** | Alert scadenza garanzia, fine leasing, manutenzione programmata | Should |
| E7 | **Gestione Utenti & Reparti** | Anagrafica dipendenti, reparti, sedi aziendali | Must |
| E8 | **Impostazioni** | Configurazione categorie, campi custom, preferenze app | Could |

---

## Backlog Ordinato per Priorità

| ID | Epic | User Story | Story Points | Priorità | Sprint |
|----|------|-----------|:------------:|----------|:------:|
| ASSET-001 | E1 | Login utente con credenziali aziendali | 3 | Must | 1 |
| ASSET-002 | E1 | Gestione ruoli e permessi | 5 | Must | 1 |
| ASSET-003 | E7 | Visualizzazione lista dipendenti e reparti | 3 | Must | 1 |
| ASSET-004 | E2 | Visualizzazione catalogo asset con tabella | 5 | Must | 1 |
| ASSET-005 | E2 | Creazione nuovo asset elettronico | 5 | Must | 2 |
| ASSET-006 | E2 | Modifica dettagli asset esistente | 3 | Must | 2 |
| ASSET-007 | E2 | Eliminazione asset (soft delete) | 2 | Must | 2 |
| ASSET-008 | E2 | Ricerca e filtri avanzati catalogo | 5 | Must | 2 |
| ASSET-009 | E3 | Assegnazione asset a dipendente | 5 | Must | 3 |
| ASSET-010 | E3 | Revoca assegnazione asset | 3 | Must | 3 |
| ASSET-011 | E3 | Storico assegnazioni per asset | 3 | Should | 3 |
| ASSET-012 | E4 | Visualizzazione stato ciclo di vita | 3 | Must | 3 |
| ASSET-013 | E4 | Cambio stato asset (workflow) | 5 | Must | 4 |
| ASSET-014 | E4 | Timeline ciclo di vita asset | 5 | Should | 4 |
| ASSET-015 | E5 | Dashboard panoramica asset | 8 | Should | 4 |
| ASSET-016 | E5 | Report distribuzione asset per reparto | 5 | Should | 5 |
| ASSET-017 | E5 | Export dati in CSV | 3 | Should | 5 |
| ASSET-018 | E6 | Notifiche scadenza garanzia | 5 | Should | 5 |
| ASSET-019 | E6 | Alert manutenzione programmata | 3 | Should | 6 |
| ASSET-020 | E7 | CRUD dipendenti e reparti | 5 | Must | 6 |
| ASSET-021 | E2 | Dettaglio singolo asset con scheda completa | 3 | Must | 2 |
| ASSET-022 | E8 | Configurazione categorie asset | 3 | Could | 6 |
| ASSET-023 | E5 | Grafici distribuzione per categoria | 5 | Could | 5 |
| ASSET-024 | E1 | Logout e gestione sessione | 2 | Must | 1 |

---

## Velocity Stimata

- **Team size**: 3 sviluppatori frontend
- **Sprint duration**: 2 settimane
- **Velocity target**: ~18-20 Story Points / Sprint

---

## Release Plan

| Release | Sprint | Story Points | Contenuto |
|---------|:------:|:------------:|-----------|
| **MVP (v1.0)** | 1-3 | ~50 SP | Auth, Catalogo CRUD, Assegnazioni base, Anagrafica |
| **v1.1** | 4-5 | ~31 SP | Ciclo di vita, Dashboard, Report, Export |
| **v1.2** | 6 | ~16 SP | Notifiche, Impostazioni, CRUD utenti |
