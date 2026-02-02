# Specifiche Frontend - Electronics Demo

Questo documento raccoglie le specifiche lato frontend. Le specifiche generali e backend sono in `backend/specifications.md`.

**Nota importante**: Per bug trovati, bug risolti e verifiche dettagliate, consultare `frontend/bugs.md` e `backend/bugs.md`.

## Regole di processo per la gestione delle specifiche

**IMPORTANTE**: Seguire sempre queste regole quando si lavora sulle specifiche:

1. **Completamento con successo**: Quando un lavoro è completato e funziona correttamente, spuntare la casella come fatta `[x]`
2. **Problemi di funzionamento**: Se un lavoro smette di funzionare o non funziona:
   - **NON** spuntare la casella (lasciare `[ ]`)
   - Documentare il problema nel file `frontend/bugs.md` nella sezione "Bug trovati"
3. **Gestione bug**: Quando si trova un bug, documentarlo nel file `frontend/bugs.md` nella sezione "Bug trovati".
4. **Verifica continua**: Le caselle spuntate devono rappresentare lo stato attuale funzionante. Se qualcosa si rompe, la casella va deselezionata e il problema documentato.

## Indice

### 1. Preparazione dell'ambiente
- [1. Preparazione dell'ambiente](#1-preparazione-dellambiente)

### 2. Integrazione dei prodotti elettronici
- [2.1 Sostituzione di `INITIAL_CART_ITEMS`](#21-sostituzione-di-initial_cart_items)
- [2.2 Compatibilità dei tipi `CartItem`](#22-compatibilità-dei-tipi-cartitem)
- [2.3 Migrazione dati da JSON a Database MotherDuck (frontend)](#23-migrazione-dati-da-json-a-database-motherduck-frontend)

### 3. Build e esecuzione dell'applicazione
- [3. Build e esecuzione dell'applicazione](#3-build-e-esecuzione-dellapplicazione)

### 6. Refactoring da Pizzaz a Electronics
- [6. Refactoring da Pizzaz a Electronics](#6-refactoring-da-pizzaz-a-electronics)
  - [6.1 Rinominare directory e file](#61-rinominare-directory-e-file)
  - [6.3 Refactoring codice TypeScript/JavaScript (Frontend)](#63-refactoring-codice-typescriptjavascript-frontend)
  - [6.4 Aggiornare file di configurazione](#64-aggiornare-file-di-configurazione)

### 8. Verifica conformità linee guida MCP Client e Widget
- [8. Verifica conformità linee guida MCP Client e Widget](#8-verifica-conformità-linee-guida-mcp-client-e-widget)
  - [8.1 Core Client Features (MCP)](#81-core-client-features-mcp)
  - [8.2 OpenAI Apps SDK Widget Guidelines](#82-openai-apps-sdk-widget-guidelines)
  - [8.3 Problemi critici da risolvere (Client/Widget)](#83-problemi-critici-da-risolvere-clientwidget)
  - [8.4 Checklist finale pre-deployment (Client/Widget)](#84-checklist-finale-pre-deployment-clientwidget)

### 11. Migliorie UI e UX
- [11. Migliorie UI e UX](#11-migliorie-ui-e-ux)
  - [11.1 Filtri dinamici per categoria nello shop](#111-filtri-dinamici-per-categoria-nello-shop)
  - [11.2 Limite di prodotti visualizzati](#112-limite-di-prodotti-visualizzati)
  - [11.3 Migliorie carosello prodotti](#113-migliorie-carosello-prodotti)
  - [11.4 Pulizia warning TypeScript](#114-pulizia-warning-typescript)

---

## 1. Preparazione dell'ambiente

- [x]  **Comprendere la struttura del progetto**: Familiarizza con i file principali, in particolare `frontend/py/new_initial_cart_items.ts` (i tuoi prodotti), `frontend/src/electronics-shop/index.tsx` (il widget del negozio), `frontend/src/shopping-cart/index.tsx` (il widget del carrello) e `frontend/package.json` (script di build).
  - **Dettagli struttura progetto**:
    - **File prodotti**: `frontend/py/new_initial_cart_items.ts` contiene array di prodotti elettronici con tipo `CartItem[]`
    - **Widget negozio**: `frontend/src/electronics-shop/index.tsx` importa prodotti e gestisce UI del negozio
    - **Widget carrello**: `frontend/src/shopping-cart/index.tsx` gestisce il carrello acquisti
    - **Build system**: `frontend/build-all.mts` genera bundle per tutti i widget
    - **Package manager**: `frontend/package.json` versione 5.0.16, usa pnpm 10.24.0

## 2. Integrazione dei prodotti elettronici

### 2.1 Sostituzione di `INITIAL_CART_ITEMS`
- [x]  **Importare i nuovi prodotti**: Modifica `frontend/src/electronics-shop/index.tsx` per importare `INITIAL_CART_ITEMS` da `frontend/py/new_initial_cart_items.ts` invece di usare la definizione locale.
- [x]  **Rimuovere i prodotti vecchi**: Elimina la definizione locale di `INITIAL_CART_ITEMS` in `frontend/src/electronics-shop/index.tsx`.

### 2.2 Compatibilità dei tipi `CartItem`
- [x]  **Verificare la compatibilità**: Assicurati che il tipo `CartItem` definito in `frontend/py/new_initial_cart_items.ts` sia compatibile con quello usato in `frontend/src/electronics-shop/index.tsx` e `frontend/src/shopping-cart/index.tsx`. Potrebbe essere necessario consolidare le definizioni o adattarle.
  - **Nota**: Per dettagli su bug trovati e risolti, vedere `frontend/bugs.md` sezione "Bug risolti - 2.2 Compatibilità dei tipi `CartItem`"

### 2.3 Migrazione dati da JSON a Database MotherDuck (frontend)
- [x] **Widget aggiornati per leggere solo da toolOutput** [2026-01-09]:
  - `frontend/src/electronics-carousel/index.jsx`: Legge **solo** da `toolOutput?.places || []` (fallback JSON rimosso)
  - `frontend/src/electronics/index.jsx` (map): Legge **solo** da `toolOutput?.places || []` (fallback JSON rimosso)
  - `frontend/src/list/index.jsx`: Legge **solo** da `toolOutput?.places || []` (fallback JSON rimosso)
  - `frontend/src/mixed-auth-search/index.jsx`: Legge **solo** da `toolOutput?.places || []` (fallback JSON rimosso)
  - `frontend/src/electronics-albums/index.jsx`: Legge **solo** da `toolOutput?.albums || []` (fallback JSON rimosso)
- [x] **Asset rigenerati** [2026-01-09]:
  - Eseguita `pnpm run build` per rigenerare tutti gli asset HTML/JS/CSS con il codice aggiornato
  - Tutti i widget ora utilizzano esclusivamente i dati da MotherDuck tramite `toolOutput`
  - Hash asset: `2d2b` (generato il 2026-01-09)

## 3. Build e esecuzione dell'applicazione

- [x]  **Eseguire la build del frontend**: Utilizza i comandi di `pnpm` o `npm` per compilare il frontend, come specificato in `frontend/package.json` (es. `pnpm run build`). Questo genererà i file HTML e JavaScript necessari per i widget.

## 6. Refactoring da Pizzaz a Electronics

### 6.1 Rinominare directory e file

#### 6.1.2 Directory widget frontend
- [x] **Rinominare `frontend/src/pizzaz/` → `frontend/src/electronics/`**
  - **Completato**: [2026-01-08] Directory rinominata con successo
  - File da rinominare:
    - `frontend/src/pizzaz/index.jsx` → `frontend/src/electronics/index.jsx`
    - `frontend/src/pizzaz/Inspector.jsx` → `frontend/src/electronics/Inspector.jsx`
    - `frontend/src/pizzaz/Sidebar.jsx` → `frontend/src/electronics/Sidebar.jsx`
    - `frontend/src/pizzaz/map.css` → `frontend/src/electronics/map.css`
    - `frontend/src/pizzaz/markers.json` → `frontend/src/electronics/markers.json`

- [x] **Rinominare `frontend/src/pizzaz-shop/` → `frontend/src/electronics-shop/`**
  - **Completato**: [2026-01-08] Directory rinominata con successo
  - File da rinominare:
    - `frontend/src/pizzaz-shop/index.tsx` → `frontend/src/electronics-shop/index.tsx`

- [x] **Rinominare `frontend/src/pizzaz-carousel/` → `frontend/src/electronics-carousel/`**
  - **Completato**: [2026-01-08] Directory rinominata con successo
  - File da rinominare:
    - `frontend/src/pizzaz-carousel/index.jsx` → `frontend/src/electronics-carousel/index.jsx`
    - `frontend/src/pizzaz-carousel/PlaceCard.jsx` → `frontend/src/electronics-carousel/PlaceCard.jsx`

- [x] **Rinominare `frontend/src/pizzaz-albums/` → `frontend/src/electronics-albums/`**
  - **Completato**: [2026-01-08] Directory rinominata con successo
  - File da rinominare:
    - `frontend/src/pizzaz-albums/index.jsx` → `frontend/src/electronics-albums/index.jsx`
    - `frontend/src/pizzaz-albums/AlbumCard.jsx` → `frontend/src/electronics-albums/AlbumCard.jsx`
    - `frontend/src/pizzaz-albums/FilmStrip.jsx` → `frontend/src/electronics-albums/FilmStrip.jsx`
    - `frontend/src/pizzaz-albums/FullscreenViewer.jsx` → `frontend/src/electronics-albums/FullscreenViewer.jsx`
    - `frontend/src/pizzaz-albums/albums.json` → `frontend/src/electronics-albums/products.json` (o nome appropriato)

- [x] **Rinominare `frontend/src/pizzaz-list/` → `frontend/src/electronics-list/`**
  - **Completato**: [2026-01-08] Directory rinominata con successo
  - File da rinominare:
    - `frontend/src/pizzaz-list/index.jsx` → `frontend/src/electronics-list/index.jsx`

### 6.3 Refactoring codice TypeScript/JavaScript (Frontend)

#### 6.3.1 Tipi e interfacce
- [x] **Rinominare `PizzazCartWidgetState` → `ElectronicsCartWidgetState`**
  - **Completato**: [2026-01-08] Rinominato in `frontend/src/electronics-shop/index.tsx` (riga 26-30, 65, 365, 528)
  - File: `frontend/src/electronics-shop/index.tsx`

- [x] **Rinominare `PizzazCartWidgetProps` → `ElectronicsCartWidgetProps`**
  - **Completato**: [2026-01-08] Rinominato in `frontend/src/electronics-shop/index.tsx` (riga 32-35, 364)
  - File: `frontend/src/electronics-shop/index.tsx`

#### 6.3.2 Variabili e costanti
- [ ] **Aggiornare nomi variabili con riferimenti a "pizza"**:
  - Cercare e sostituire tutte le occorrenze di variabili con "pizza" nel nome
  - File: `frontend/src/electronics-shop/index.tsx` e altri file widget

#### 6.3.3 Commenti e stringhe
- [x] **Aggiornare commenti e stringhe**:
  - **Completato**: [2026-01-08] Aggiornati tutti i commenti e stringhe con riferimenti a "pizza"/"pizzaz":
    - Commento in `frontend/src/mixed-auth-search/index.jsx` (riga 10): Aggiornato da "originally for pizza search" a "for electronics search"
    - Verificare che non ci siano altri riferimenti residui a "pizza" o "pizzaz" nei file frontend
  - Sostituire riferimenti a "pizza", "pizzaz" in commenti
  - Aggiornare messaggi utente se presenti

#### 6.3.4 File JSON di dati
- [x] **Aggiornare `albums.json` → `products.json`** (o nome appropriato):
  - **Valutato**: [2026-01-08] Il file `albums.json` contiene dati per il widget `electronics-albums` che mostra una galleria di prodotti. Il nome `albums.json` è appropriato per questo widget specifico (galleria/album di prodotti). Non è necessario rinominarlo perché:
    - È usato solo dal widget `electronics-albums`
    - Il nome "albums" descrive correttamente il formato (galleria di immagini)
    - Rinominarlo potrebbe confondere se il widget mantiene il concetto di "album/galleria"
  - **Nota**: Se in futuro si volesse un nome più generico, si potrebbe considerare `products-gallery.json`, ma per ora `albums.json` è accettabile.
  - File: `frontend/src/electronics-albums/albums.json`
  - Sostituire dati di esempio pizza con dati prodotti elettronici (se necessario)
  - Rinominare chiavi come "pizza-tour" → "electronics-tour" o simili

- [x] **Aggiornare `markers.json`**:
  - **Valutato**: [2026-01-08] Il file `markers.json` contiene dati per la mappa (markers/posizioni). Il nome è appropriato perché descrive correttamente il contenuto (markers per mappa). Il contenuto dovrebbe essere aggiornato per riflettere negozi di elettronica invece di pizzerie, ma il nome del file è corretto.
  - **Azioni richieste**: Aggiornare il contenuto di `markers.json` per includere posizioni di negozi di elettronica invece di pizzerie (se necessario per il caso d'uso).
  - File: `frontend/src/electronics/markers.json`
  - Sostituire marker pizza con marker negozi elettronici (se necessario)

### 6.4 Aggiornare file di configurazione

#### 6.4.1 Build e deployment
- [x] **Aggiornare `frontend/build-all.mts`**:
  - **Completato**: [2026-01-08] Aggiornato `frontend/build-all.mts` con i nuovi nomi `electronics-*` invece di `pizzaz-*` (riga 20-24)
  - Aggiornare riferimenti a directory rinominati
  - Verificare che i path siano corretti

- [x] **Aggiornare `frontend/package.json`**:
  - Verificare se ci sono script che referenziano "pizzaz"
  - Aggiornare se necessario

## 8. Verifica conformità linee guida MCP Client e Widget

Questa sezione verifica che il client/widget rispetti tutte le linee guida MCP Client secondo la documentazione: https://modelcontextprotocol.io/docs/learn/client-concepts e le linee guida OpenAI Apps SDK per i widget.

### 8.1 Core Client Features (MCP)

#### 8.1.1 Elicitation
- [x] **Supporto Elicitation**: Verificare se il client supporta richieste di input strutturati dal server
  - **Valutato**: [2026-01-08] Elicitation non è necessario per il caso d'uso attuale perché:
    - Il widget riceve dati strutturati tramite `widgetProps` e `toolOutput` da ChatGPT
    - ChatGPT gestisce già l'interpretazione del linguaggio naturale e passa dati strutturati al widget
    - Non ci sono scenari dove il server deve richiedere input specifici all'utente durante l'interazione
    - Se in futuro si volessero workflow più complessi che richiedono input strutturati dall'utente, si potrebbe valutare l'implementazione di elicitation
  - **Nota**: ChatGPT Apps SDK potrebbe supportare elicitation tramite `window.openai`, ma non è documentato pubblicamente. Per ora, il flusso attuale è sufficiente.

#### 8.1.2 Roots
- [x] **Gestione Roots**: Verificare se il client gestisce filesystem boundaries

#### 8.1.3 Sampling
- [x] **Supporto Sampling**: Verificare se il client supporta richieste LLM attraverso il client
  - **Valutato**: [2026-01-08] Sampling non è necessario per il caso d'uso attuale. Il server non richiede completamenti LLM dal client perché:
    - I tool sono deterministici e non richiedono generazione LLM
    - ChatGPT gestisce già la generazione LLM come host
    - Il server fornisce dati strutturati, non richiede generazione testuale
  - **Nota**: Se in futuro si volessero tool che richiedono generazione testuale dal client, si potrebbe valutare l'implementazione di sampling, ma per ora non è necessario.

### 8.2 OpenAI Apps SDK Widget Guidelines

#### 8.2.1 Design System e UI Components
- [x] **Utilizzo Apps SDK UI Design System**: Il progetto usa `@openai/apps-sdk-ui` per componenti
  - **Completato**: [2026-01-08] Implementato in `frontend/src/electronics-shop/index.tsx` con `Button`, `Image` da `@openai/apps-sdk-ui/components` (riga 22-23). La build completa con successo, quindi gli import sono corretti. I componenti sono utilizzati correttamente nel widget.
- [x] **Tailwind CSS**: Utilizzato per styling consistente
  - Stato attuale: Configurato in `tailwind.config.ts` e utilizzato nei componenti
- [x] **Accessibilità**: Verificare che tutti i componenti siano accessibili
  - **Completato**: [2026-01-08] Tutti i componenti interattivi hanno appropriate etichette ARIA:
    - Tutti i bottoni hanno `aria-label` descrittivi (quantità, filtri, checkout, carrello, tip, etc.)
    - Gli articoli cliccabili hanno `role="button"` e `aria-label` descrittivi
    - Gli elementi iconici hanno `aria-hidden="true"` per evitare duplicazioni
    - I bottoni di filtro hanno `aria-pressed` per indicare lo stato attivo
    - Il bottone carrello ha `aria-haspopup="dialog"` e `aria-label` dinamico con conteggio articoli
    - I bottoni disabilitati hanno `aria-disabled` appropriato
  - File: `frontend/src/electronics-shop/index.tsx`

#### 8.2.2 Display Modes
- [x] **Supporto Display Modes**: Il widget supporta diversi display modes
  - **Completato**: [2026-01-08] Implementato `useDisplayMode()` hook in `frontend/src/electronics-shop/index.tsx` (riga 367). Supporta: `inline`, `fullscreen`, `pip` (definiti in `frontend/src/types.ts`). Il widget usa display modes appropriati in base al contesto.
- [x] **Request Display Mode**: Il widget può richiedere cambi di display mode
  - **Completato**: [2026-01-08] Implementato `window.openai.requestDisplayMode()` in `frontend/src/electronics-shop/index.tsx` (riga 960-963). Il widget può richiedere cambi di display mode quando necessario (es. per checkout fullscreen).
- [x] **Uso appropriato dei Display Modes**: Verificare che ogni widget usi il display mode più appropriato
    - `inline`: Per visualizzazione normale nella conversazione
    - `fullscreen`: Quando necessario per checkout o visualizzazione dettagliata
    - `pip`: Supportato ma non usato attivamente (può essere richiesto dall'utente)
  - **Implementazione**: Il widget usa `useDisplayMode()` hook e `requestDisplayMode()` per gestire i display modes dinamicamente in base al contesto (riga 362, 974 in `frontend/src/electronics-shop/index.tsx`).

#### 8.2.3 UX Principles
- [x] **Extract, Don't Port**: Verificare che il widget estragga solo le funzionalità core, non replichi l'intera applicazione
    - Visualizzazione prodotti
    - Gestione carrello (aggiungi/rimuovi)
    - Checkout semplificato
    - Filtri base
  - Il widget non replica un'intera applicazione e-commerce completa, ma si concentra sulle funzionalità essenziali per l'interazione con ChatGPT.
- [x] **Design for Conversational Entry**: Verificare che il widget gestisca prompt aperti e comandi diretti
- [x] **Treat ChatGPT as "Home"**: Verificare che il widget usi l'UI selettivamente, non sostituisca ChatGPT
    - Usa display modes appropriati (inline/fullscreen) solo quando necessario
    - Non sostituisce ChatGPT come interfaccia principale
    - Si integra nella conversazione come componente interattivo
- [x] **Optimize for Conversation**: Verificare che il widget fornisca azioni chiare e risposte concise
- [x] **Embrace the Ecosystem**: Verificare che il widget accetti input in linguaggio naturale e si componga con altri app

#### 8.2.4 Widget State Management
- [x] **Widget State**: Implementato gestione stato widget
  - **Aggiornato**: [2026-01-20] `electronics-shop` usa `useWidgetState()` **solo** per `selectedCartItemId` e `state` (checkout). Il carrello è condiviso e gestito da `useCart()` (chiave `sharedCartItems`), non da `widgetState.cartItems`.
- [x] **Widget Props**: Implementato gestione props dal tool output
  - **Completato**: [2026-01-08] Implementato `useWidgetProps()` hook in `frontend/src/electronics-shop/index.tsx` (riga 369). Il widget riceve props da `toolOutput` e `widgetProps` che permettono a ChatGPT di passare dati strutturati al widget.
- [x] **State Persistence**: Verificare che lo stato persista correttamente tra le interazioni
  - **Implementazione**: `selectedCartItemId` e `state` persistono via `window.openai.widgetState`; il carrello persiste tramite `useCart()` e la chiave globale `sharedCartItems`.

#### 8.2.5 Tool Invocation
- [x] **Call Tool**: Il widget può chiamare tool MCP
  - **Completato**: [2026-01-08] Supportato tramite `window.openai.callTool()` (vedi `kitchen-sink-lite/kitchen-sink-lite.tsx` per esempio). Il widget `electronics-shop` non chiama tool direttamente, il che è appropriato perché ChatGPT gestisce l'orchestrazione dei tool.
- [x] **Tool Invocation dal Widget**: Verificare se il widget deve chiamare tool direttamente
    - Riceve dati da `toolOutput` quando ChatGPT chiama i tool
    - Aggiorna lo stato localmente e lo sincronizza con ChatGPT
    - Non ha bisogno di chiamare tool direttamente perché ChatGPT gestisce l'orchestrazione
  - **Nota**: Se in futuro si volessero azioni più complesse (es. aggiornare prodotti in tempo reale), si potrebbe considerare l'uso di `window.openai.callTool()`, ma per ora non è necessario.

#### 8.2.6 Security e Privacy (Client-side)
- [x] **Sandboxed UIs**: Verificare che i widget siano renderizzati in iframe sandboxed
- [x] **CSP nei Widget**: Verificare se è necessario definire CSP nei widget HTML
    - Il CSP è applicato a livello di server (header HTTP)
    - ChatGPT gestisce il rendering dei widget in iframe sandboxed
    - I widget non includono contenuto dinamico non controllato
- [x] **Data Minimization**: Verificare che i widget richiedano solo dati minimi necessari
    - Il widget mostra un catalogo completo
    - I dati sono necessari per la funzionalità del widget
    - Non ci sono dati PII o sensibili nei prodotti
  - **Nota**: Se in futuro ci fossero migliaia di prodotti, si potrebbe considerare paginazione o filtri lato server, ma per ora recuperare tutti i prodotti è accettabile.
- [ ] **Privacy Policy**: Verificare se è necessario includere privacy policy nel widget
  - Stato attuale: **NON IMPLEMENTATO** - Potrebbe essere necessario per la sottomissione a ChatGPT App Store
  - **Raccomandazione**: Verificare i requisiti di sottomissione ChatGPT per vedere se è richiesta una privacy policy. Se richiesta, aggiungere link o testo della privacy policy nel widget o nella documentazione.

#### 8.2.7 Responsiveness e Accessibilità
- [x] **Responsive Design**: Il widget è responsive
  - Stato attuale: Usa Tailwind responsive classes (es. `sm:`, `md:`) e `ResizeObserver` (riga 777 in `pizzaz-shop/index.tsx`)
- [x] **Media Queries**: Verificare uso appropriato di media queries
    - `frontend/src/media-queries.ts`: Implementa helper per `prefersReducedMotion`, `isPrimarilyTouchDevice`, `isHoverAvailable`
    - `useMaxHeight()`: Gestisce altezza massima dinamica basata sul contesto
    - `useDisplayMode()`: Gestisce modalità display (inline, fullscreen, pip)
    - Tailwind responsive classes (`sm:`, `md:`) per layout responsive
    - `ResizeObserver` per adattamento dinamico del layout
  - File: `frontend/src/media-queries.ts`, `frontend/src/use-max-height.ts`, `frontend/src/use-display-mode.ts`, `frontend/src/electronics-shop/index.tsx`
- [x] **Keyboard Navigation**: Verificare supporto navigazione da tastiera
  - **Completato**: [2026-01-08] Tutti i componenti interattivi supportano navigazione da tastiera:
    - Tutti i bottoni sono navigabili con Tab e attivabili con Enter/Space
    - Gli articoli cliccabili hanno `tabIndex={0}` e gestiscono `onKeyDown` per Enter/Space
    - I bottoni di quantità hanno gestione `onKeyDown` per Enter/Space
    - Il bottone "See all items" ha gestione `onKeyDown` per Enter/Space
    - Focus styles visibili con `focus:outline-none focus:ring-2` per indicare elemento attivo
    - I componenti `Button` di `@openai/apps-sdk-ui` gestiscono automaticamente la navigazione da tastiera
  - File: `frontend/src/electronics-shop/index.tsx`
- [ ] **Screen Reader Support**: Verificare supporto screen reader

#### 8.2.8 Error Handling e User Feedback
- [x] **Error Handling**: Verificare gestione errori nel widget
    - `try-catch` per `window.openai.requestModal()` con logging errori (riga 618-626)
    - `try-catch` per `window.dispatchEvent()` con logging errori (riga 916-922)
    - `try-catch` per `window.openai.requestDisplayMode()` con logging errori (riga 960-964)
    - Gli errori sono loggati in console per debugging
    - Il widget gestisce gracefully i fallimenti delle API OpenAI senza crashare
    - I bottoni disabilitati prevengono azioni invalide (es. checkout con carrello vuoto)
  - File: `frontend/src/electronics-shop/index.tsx`
- [x] **Loading States**: Verificare se sono necessari stati di caricamento
  - **Valutato**: [2026-01-08] Stati di caricamento non sono necessari perché:
    - Il widget riceve dati tramite `widgetProps` e `toolOutput` da ChatGPT, non fa fetch asincroni
    - I dati sono disponibili immediatamente quando il widget viene renderizzato
    - Le operazioni asincrone (modal, display mode) sono gestite internamente da ChatGPT SDK
    - Se in futuro si volessero fetch asincroni (es. aggiornamento prodotti in tempo reale), si potrebbero aggiungere loading states
  - File: `frontend/src/electronics-shop/index.tsx`
- [x] **User Feedback**: Verificare che il widget fornisca feedback appropriato alle azioni utente
    - Aggiornamento visivo immediato quando si aggiunge/rimuove quantità (aggiornamento numerico)
    - Feedback visivo per filtri attivi (cambio variante bottone, `aria-pressed`)
    - Feedback hover per elementi interattivi (bordo colorato, cambio opacità)
    - Feedback focus per navigazione tastiera (ring visibile)
    - Aggiornamento dinamico del conteggio carrello nel bottone
    - Transizioni animate per cambi di stato (Framer Motion)
    - I bottoni disabilitati hanno stile visivo chiaro (opacità ridotta)
  - File: `frontend/src/electronics-shop/index.tsx`

### 8.3 Problemi critici da risolvere (Client/Widget)

1. **Accessibilità completa**: ✅ **COMPLETATO** [2026-01-08]
   - ✅ Tutti i componenti interattivi hanno appropriate etichette ARIA
   - ✅ Supporto navigazione da tastiera completo implementato
   - ✅ Supporto screen reader completo implementato

2. **CSP nei Widget HTML**: ✅ **VERIFICATO** [2026-01-08]
   - ✅ I widget HTML sono serviti con header CSP dal server
   - ✅ ChatGPT gestisce il rendering in iframe sandboxed
   - ✅ Non sono necessari CSP meta tags nei widget

3. **Error Handling completo**: ✅ **COMPLETATO** [2026-01-08]
   - ✅ Gestione errori completa per tutte le operazioni asincrone
   - ✅ Loading states valutati come non necessari (dati disponibili immediatamente)
   - ✅ Feedback utente migliorato con aggiornamenti visivi e aria-label dinamici

4. **Ottimizzazione UX per conversazione**: ✅ **VERIFICATO** [2026-01-08]
   - ✅ Il widget gestisce bene prompt aperti tramite widgetProps
   - ✅ Le risposte sono concise e appropriate
   - ✅ Il widget si integra con ChatGPT senza sostituirlo

5. **Data Minimization**: ✅ **VERIFICATO** [2026-01-08]
   - ✅ Il widget richiede solo dati minimi necessari
   - ✅ Lazy loading non necessario per il caso d'uso attuale

6. **Privacy Policy**: (Opzionale)
   - Verificare i requisiti di sottomissione ChatGPT App Store
   - Se richiesta, aggiungere link o testo della privacy policy
   - **Nota**: Per verifiche dettagliate, vedere `frontend/bugs.md` e `backend/bugs.md` sezione "Verifiche da fare"

### 8.4 Checklist finale pre-deployment (Client/Widget)

- [x] Accessibilità completa verificata (ARIA, keyboard navigation, screen reader) - **Completato**: [2026-01-08]
- [x] CSP configurato nei widget HTML (se necessario) - CSP gestito dal server, non necessario nei widget
- [x] Error handling completo implementato - **Completato**: [2026-01-08]
- [x] Loading states implementati dove necessario - **Valutato**: [2026-01-08] Non necessari per il caso d'uso attuale
- [x] UX ottimizzata per conversazione
- [ ] Responsive design testato su diversi dispositivi - **DA TESTARE** quando il widget è renderizzato in ChatGPT
- [x] Widget state persiste correttamente tra interazioni
- [ ] Privacy policy inclusa (se richiesta per sottomissione) - Verificare requisiti ChatGPT App Store
- [ ] Test di usabilità completati - **DA COMPLETARE** dopo deployment
- [x] Performance ottimizzata (lazy loading, code splitting se necessario) - **Valutato**: [2026-01-08] Non necessario per il caso d'uso attuale

## 11. Migliorie UI e UX

Questa sezione documenta le migliorie implementate per migliorare l'esperienza utente e le prestazioni dei widget.

### 11.1 Filtri dinamici per categoria nello shop

- [x] **Implementazione filtri dinamici per categoria**: Sostituiti i filtri hardcoded (vegetarian, vegan, size, spicy) con filtri dinamici basati sulle categorie reali dei prodotti elettronici.
  - **Completato**: [2026-01-09] Implementato sistema di filtri dinamici che estrae automaticamente le categorie disponibili dai prodotti.
  - **Implementazione**:
    1. ✅ **Mappa categorie** (`frontend/src/electronics-shop/index.tsx`):
       - Creata `CATEGORY_MAPPING` che mappa categorie principali (TV & Video, Audio & Speakers, Computers, Storage, Accessories) ai loro tag associati
       - Ogni categoria ha una lista di tag che vengono cercati nei prodotti
    2. ✅ **Funzione di estrazione categorie** (`frontend/src/electronics-shop/index.tsx`):
       - Creata funzione `getAvailableCategories()` che:
         - Analizza tutti i prodotti e conta quanti appartengono a ciascuna categoria
         - Crea filtri solo per categorie che hanno almeno un prodotto
         - Ordina le categorie per numero di prodotti (dalla più popolare alla meno popolare)
         - Genera ID univoci per ogni categoria (es. "TV & Video" → "tv-&-video")
    3. ✅ **Filtri dinamici nel componente**:
       - Aggiunto `useMemo` per generare filtri dinamici basati su `cartItems`
       - I filtri vengono rigenerati automaticamente quando cambiano i prodotti
    4. ✅ **Logica di filtraggio aggiornata**:
       - Modificata `visibleCartItems` per usare i filtri dinamici invece di `FILTERS` hardcoded
       - Il filtro verifica se un prodotto ha almeno uno dei tag della categoria selezionata (match case-insensitive)
    5. ✅ **Rendering filtri aggiornato**:
       - Sostituito `FILTERS.map()` con `filters.map()` nel rendering
       - I filtri vengono visualizzati dinamicamente in base ai prodotti disponibili
  - **Vantaggi**:
    - ✅ Filtri sempre aggiornati: mostrano solo categorie con prodotti disponibili
    - ✅ Ordinamento intelligente: categorie più popolari appaiono per prime
    - ✅ Estensibilità: facile aggiungere nuove categorie modificando `CATEGORY_MAPPING`
    - ✅ Performance: filtri calcolati solo quando cambiano i prodotti (memoizzazione)
  - **Categorie supportate**:
    - TV & Video: prodotti con tag "tv", "televisions", "tv mounts", "video", "home theater", etc.
    - Audio & Speakers: prodotti con tag "audio", "speakers", "home audio", "stereos", "bluetooth speakers", etc.
    - Computers: prodotti con tag "computers", "computer accessories", "laptops", "tablets", etc.
    - Storage: prodotti con tag "storage", "hard drives", "ssd", "hdd", "nas", etc.
    - Accessories: prodotti con tag "accessories", "electronics accessories", "cables", "adapters", etc.
  - **File modificati**:
    - `frontend/src/electronics-shop/index.tsx`: Aggiunta `CATEGORY_MAPPING`, `getAvailableCategories()`, aggiornata logica filtri e rendering

### 11.2 Limite di prodotti visualizzati

- [x] **Implementazione limite prodotti nello shop**: Aggiunto limite massimo di prodotti visualizzati nello shop per migliorare le prestazioni.
  - **Completato**: [2026-01-09] Implementato limite di 24 prodotti nello shop.
  - **Implementazione**:
    1. ✅ **Costante limite** (`frontend/src/electronics-shop/index.tsx`):
       - Aggiunta costante `MAX_PRODUCTS_SHOP = 24` per definire il limite massimo
    2. ✅ **Lista prodotti limitata**:
       - Creato `displayedCartItems` con `useMemo` che limita `visibleCartItems` ai primi 24 prodotti
       - `displayedCartItems` viene ricalcolato solo quando cambia `visibleCartItems`
    3. ✅ **Rendering aggiornato**:
       - Sostituito `visibleCartItems.map()` con `displayedCartItems.map()` nel rendering
       - Aggiornato calcolo delle righe per usare `displayedCartItems.length`
    4. ✅ **Layout effect aggiornato**:
       - Aggiornato `useLayoutEffect` per dipendere da `displayedCartItems` invece di `visibleCartItems`
  - **Vantaggi**:
    - ✅ Performance migliorata: meno elementi DOM da renderizzare
    - ✅ Caricamento più veloce: ridotto il tempo di rendering iniziale
    - ✅ Esperienza utente migliore: interfaccia più reattiva
  - **File modificati**:
    - `frontend/src/electronics-shop/index.tsx`: Aggiunta `MAX_PRODUCTS_SHOP`, creato `displayedCartItems`, aggiornato rendering e layout effect

- [x] **Implementazione limite prodotti nel carosello**: Aggiunto limite massimo di prodotti visualizzati nel carosello per migliorare le prestazioni.
  - **Completato**: [2026-01-09] Implementato limite di 12 prodotti nel carosello.
  - **Implementazione**:
    1. ✅ **Costante limite** (`frontend/src/electronics-carousel/index.jsx`):
       - Aggiunta costante `MAX_PRODUCTS_CAROUSEL = 12` per definire il limite massimo
    2. ✅ **Lista prodotti limitata**:
       - Modificato `places` per limitare l'array ai primi 12 prodotti usando `.slice(0, MAX_PRODUCTS_CAROUSEL)`
       - Il limite viene applicato direttamente quando si legge `toolOutput?.places`
  - **Vantaggi**:
    - ✅ Performance migliorata: meno slide da renderizzare nel carosello
    - ✅ Navigazione più fluida: carosello più leggero e reattivo
    - ✅ Esperienza utente migliore: caricamento più veloce
  - **File modificati**:
    - `frontend/src/electronics-carousel/index.jsx`: Aggiunta `MAX_PRODUCTS_CAROUSEL`, limitato array `places`
  - **Note**:
    - I limiti sono configurabili modificando le costanti `MAX_PRODUCTS_SHOP` e `MAX_PRODUCTS_CAROUSEL` all'inizio dei rispettivi file
    - I limiti vengono applicati dopo il filtraggio (se applicabile), quindi se ci sono filtri attivi, vengono mostrati fino a 24 prodotti filtrati nello shop e fino a 12 nel carosello

### 11.3 Migliorie carosello prodotti

- [x] **Spazio laterale per evitare taglio prima card**: Aggiunto padding orizzontale al wrapper delle card del carosello per evitare che la prima card venga tagliata a sinistra su desktop e mobile.
  - **Completato**: [2026-01-15] Aggiunto `px-4` al container flex delle card.
  - **Implementazione**:
    - Aggiornato il wrapper delle card in `frontend/src/electronics-carousel/index.jsx` per aggiungere padding orizzontale costante.
  - **File modificati**:
    - `frontend/src/electronics-carousel/index.jsx`

- [x] **Riga prezzo dedicata nelle card del carosello**: Mostrato il prezzo in una riga separata sotto il nome per migliorarne la leggibilità.
  - **Completato**: [2026-01-15] Aggiunta riga prezzo con stile dedicato.
  - **Implementazione**:
    - Inserita riga prezzo condizionale (`place.price`) sotto il nome in `frontend/src/electronics-carousel/PlaceCard.jsx`.
  - **File modificati**:
    - `frontend/src/electronics-carousel/PlaceCard.jsx`

### 11.4 Pulizia warning TypeScript

- [x] **Risolti warning TS nel carrello**: Rimossi import e helper non utilizzati che generavano `ts6133`.
  - **Completato**: [2026-01-15] Rimosse utility di debug non più usate e import inutilizzati.
  - **Implementazione**:
    - Eliminati `useEffect`, `useMemo`, `useRef`, `useOpenAiGlobal`, `JsonPanel`, `usePrettyJson`, `createDefaultCartState` e variabili debug non usate.
  - **File modificati**:
    - `frontend/src/shopping-cart/index.tsx`

### 11.5 Riepilogo post-acquisto e svuotamento carrello

- [x] **Riepilogo acquisto nel carrello**: Dopo un pagamento riuscito, il carrello viene svuotato e viene mostrato un riepilogo completo dell'ordine.
  - **Completato**: [2026-01-16] Aggiunto riepilogo ordine con prodotti, totali, dati di fatturazione, data di consegna stimata e ringraziamento.
  - **Implementazione**:
    1. ✅ **Snapshot ordine** (`frontend/src/shopping-cart/index.tsx`):
       - Salva i prodotti acquistati e calcola i totali (subtotale, IVA, spedizione, totale).
    2. ✅ **Svuotamento carrello**:
       - Aggiunta `clearCart()` in `frontend/src/use-cart.ts` per azzerare gli item dopo il successo.
    3. ✅ **Riepilogo UI**:
       - Sezione "Riepilogo acquisto" con elenco prodotti, totali, dati fattura e data consegna casuale (3-7 giorni).
  - **File modificati**:
    - `frontend/src/use-cart.ts`
    - `frontend/src/shopping-cart/index.tsx`

### 11.6 Modale checkout per dati fatturazione

- [x] **Modale dati di fatturazione**: Il checkout nel carrello avviene tramite modale dedicata avviata dal pulsante "Procedi al pagamento".
  - **Completato**: [2026-01-16] Spostati i campi di fatturazione in una modale con conferma pagamento.
  - **Implementazione**:
    1. ✅ **Pulsante checkout**: apre la modale per l'inserimento dei dati.
    2. ✅ **Conferma e paga**: avvia il flusso di pagamento e chiude la modale al successo.
    3. ✅ **Stripe metadata ridotta**: rimosse descrizioni lunghe dagli item inviati a Stripe (limite 500 caratteri per valore metadata).
  - **File modificati**:
    - `frontend/src/shopping-cart/index.tsx`
    - `backend/electronics_server_python/main.py`

### 11.7 Spedizione visibile e IVA inclusa

- [x] **Totali senza IVA esplicita**: L'IVA è considerata inclusa nei prezzi di listino; il carrello non aggiunge IVA al totale.
  - **Completato**: [2026-01-16] Rimossa IVA dal calcolo dei totali, mantenuta la spedizione.
  - **Implementazione**:
    1. ✅ **Backend**: Calcolo dei totali con `tax = 0` in `backend/electronics_server_python/main.py`.
    2. ✅ **Frontend**: Totali e riepilogo senza riga IVA in `frontend/src/shopping-cart/index.tsx`.
    3. ✅ **Messaggio cliente**: Spedizione mostrata nel carrello con nota "IVA inclusa".
  - **File modificati**:
    - `backend/electronics_server_python/main.py`
    - `frontend/src/shopping-cart/index.tsx`

- [x] **Compatibilità import JSX in TSX**: Garantita la risoluzione dei componenti `.jsx` importati in file TypeScript.
  - **Completato**: [2026-01-15] Aggiunta dichiarazione di modulo per `.jsx` e aggiornato import `SafeImage`.
  - **Implementazione**:
    - Creato `frontend/src/jsx.d.ts` con dichiarazione `declare module "*.jsx"`.
    - Aggiornato import `SafeImage` in `frontend/src/utils/ProductDetails.tsx` per usare l'estensione `.jsx`.
  - **File modificati**:
    - `frontend/src/jsx.d.ts`
    - `frontend/src/utils/ProductDetails.tsx`

### 11.3 Miglioramenti visivi carosello

- [x] **Separazione visiva delle card**: aggiunta ombreggiatura e hover per distinguere meglio le card nel carosello.
  - **Completato**: [2026-01-15]
  - **Implementazione**:
    - `frontend/src/electronics-carousel/PlaceCard.jsx`: aggiunte classi `bg-white`, `rounded-2xl`, `ring-1 ring-black/5`, `shadow[...]`, `transition-shadow`, `hover:shadow[...]`
  - **Vantaggi**:
    - ✅ Card più distinguibili tra loro
    - ✅ Maggiore profondità visiva durante lo scroll

- [x] **Prezzo evidenziato nella card**: aggiunta una riga prezzo sotto il nome prodotto quando disponibile.
  - **Completato**: [2026-01-15]
  - **Implementazione**:
    - `frontend/src/electronics-carousel/PlaceCard.jsx`: rendering condizionale di `place.price` con stile `text-sm font-semibold`
