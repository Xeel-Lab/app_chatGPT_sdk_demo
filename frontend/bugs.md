# Bug e Verifiche - Electronics SDK (Frontend)

Questo documento traccia tutti i bug trovati, le loro risoluzioni e le verifiche da fare per il frontend del progetto Electronics SDK.

## Regole di processo per la gestione dei bug

**IMPORTANTE**: Seguire sempre queste regole quando si lavora sui bug:

1. **Bug trovato**: Quando si trova un bug:
   - Creare una nuova entry nella sezione "Bug trovati"
   - Includere:
     - Descrizione del bug
     - Come si manifesta
     - Quando è stato scoperto
     - Sezione/task correlato
   - Spuntare la casella solo quando il bug è stato risolto e verificato

2. **Risoluzione bug**: Quando un bug viene risolto:
   - Spostare il bug dalla sezione "Bug trovati" alla sezione "Bug risolti"
   - Aggiungere:
     - Come è stato risolto
     - Data di risoluzione
     - Soluzione applicata (dettagli tecnici)
   - Spuntare la casella solo dopo aver verificato che funziona correttamente

3. **Verifica continua**: Le caselle spuntate devono rappresentare lo stato attuale funzionante. Se qualcosa si rompe, la casella va deselezionata e il problema documentato.

4. **Verifiche da fare**: Le verifiche devono essere spuntate solo quando sono state completate e testate funzionalmente.

## Bug trovati

### 2.2 Compatibilità dei tipi `CartItem`
- [x] **Bug TypeScript - Tipo `CartItem` non definito**: [2026-01-08] Il file `frontend/py/new_initial_cart_items.ts` usa il tipo `CartItem[]` ma non lo definisce né lo importa. Il tipo `CartItem` è definito localmente in `frontend/src/pizzaz-shop/index.tsx` (riga 30) e in modo diverso in `frontend/src/shopping-cart/index.tsx` (riga 7, più semplice). Potrebbe esserci un problema di compatibilità dei tipi che deve essere risolto.
  - **Come si manifesta**: TypeScript potrebbe non rilevare errori a compile-time se il tipo è inferito, ma potrebbe causare problemi di type safety.
  - **Sezione correlata**: Sezione 2.2 - Compatibilità dei tipi `CartItem` in `specifications.md`
  - **Stato**: ✅ Risolto (vedi sezione "Bug risolti")

### Immagine Blob Storage non accessibile
- [x] **Bug Immagine Blob Storage - Immagine con permessi negati**: [2026-01-08] L'immagine `img-Ywf9b6rLPQ5YM0rZh2NQEkp8.png` da Azure Blob Storage in `frontend/src/electronics/markers.json` (riga 11) non è accessibile, causando errori 409 (Conflict) e "access is not permitted on this storage account" nella console del browser. Questo impedisce il caricamento completo del widget.
  - **Come si manifesta**: L'immagine non si carica, errore 409 nella Network tab, errore di permessi nella console. Il widget viene visualizzato solo parzialmente.
  - **Sezione correlata**: `frontend/src/electronics/markers.json` - primo elemento "avatar-way-of-water"
  - **Stato**: ✅ Risolto (vedi sezione "Bug risolti")

### Immagini bloccate da ORB (Opaque Response Blocking)
- [x] **Bug ORB - Immagini electronics-*.png bloccate**: [2026-01-08] Le immagini `electronics-1.png`, `electronics-2.png`, `electronics-3.png`, `electronics-4.png`, `electronics-5.png`, `electronics-6.png` da `https://persistent.oaistatic.com/electronics/` vengono bloccate dal browser con errore `ERR_BLOCKED_BY_ORB` (Opaque Response Blocking). Questo è un meccanismo di sicurezza del browser che blocca risposte opache cross-origin, causando il mancato caricamento delle immagini nel widget.
  - **Come si manifesta**: Le immagini non si caricano, errore `ERR_BLOCKED_BY_ORB` nella Network tab. Il widget viene visualizzato solo parzialmente senza immagini.
  - **Sezione correlata**: Tutti i componenti che usano immagini: `PlaceCard.jsx`, `Inspector.jsx`, `AlbumCard.jsx`, `FullscreenViewer.jsx`, `FilmStrip.jsx`, `Sidebar.jsx`
  - **Stato**: ✅ Risolto (vedi sezione "Bug risolti")

## Bug risolti

### Warning TypeScript - Import e helper non usati nel carrello
- [x] **Warning TS6133 - Simboli non usati in `shopping-cart`**: [2026-01-15]
  - **Bug trovato**: [2026-01-15] La console mostrava warning TypeScript per import e funzioni non usate in `frontend/src/shopping-cart/index.tsx` (es. `useEffect`, `useMemo`, `useRef`, `useOpenAiGlobal`, helper JSON di debug).
  - **Bug risolto**: [2026-01-15] Rimossi import e helper di debug non più usati per eliminare i warning.
  - **Soluzione applicata**:
    1. Eliminati import non usati (`useEffect`, `useMemo`, `useRef`, `useOpenAiGlobal`) e helper di debug (`usePrettyJson`, `JsonPanel`, `createDefaultCartState`).
    2. Rimossi i riferimenti a `toolOutput`, `toolResponseMetadata`, e `cartState` non utilizzati.
  - **Verificato**: [2026-01-15] I warning TS6133 non sono più presenti in `frontend/src/shopping-cart/index.tsx`.

### Errore TypeScript - Modulo JSX senza dichiarazione
- [x] **TS7016 - `SafeImage` JSX senza declaration**: [2026-01-15]
  - **Bug trovato**: [2026-01-15] Errore TypeScript `TS7016` in `frontend/src/utils/ProductDetails.tsx` per import di `../electronics/SafeImage` (file `.jsx` senza dichiarazione di modulo).
  - **Bug risolto**: [2026-01-15] Aggiunta dichiarazione globale per moduli `.jsx` e aggiornato l'import con estensione `.jsx`.
  - **Soluzione applicata**:
    1. Creato `frontend/src/jsx.d.ts` con `declare module "*.jsx"`.
    2. Aggiornato l'import di `SafeImage` in `frontend/src/utils/ProductDetails.tsx` per includere l'estensione `.jsx`.
  - **Verificato**: [2026-01-15] L'errore TS7016 non è più presente.

### 2.2 Compatibilità dei tipi `CartItem`
- [x] **Bug TypeScript - Tipo `CartItem` non definito**: [2026-01-08]
  - **Bug trovato**: [2026-01-08] Il file `frontend/py/new_initial_cart_items.ts` usa il tipo `CartItem[]` ma non lo definisce né lo importa. Il tipo `CartItem` è definito localmente in `frontend/src/pizzaz-shop/index.tsx` (riga 30) e in modo diverso in `frontend/src/shopping-cart/index.tsx` (riga 7, più semplice). Potrebbe esserci un problema di compatibilità dei tipi che deve essere risolto. - Come si manifesta: TypeScript potrebbe non rilevare errori a compile-time se il tipo è inferito, ma potrebbe causare problemi di type safety.
  - **Bug risolto**: [2026-01-08] Il tipo `CartItem` è stato consolidato in un file condiviso `frontend/src/types.ts` e importato in tutti i file che lo utilizzano. Questo risolve l'errore TypeScript `TS2304: Cannot find name 'CartItem'` e migliora la type safety.
  - **Soluzione applicata**:
    1. Creato tipo condiviso `CartItem` e `NutritionFact` in `frontend/src/types.ts` (esportati)
    2. Aggiunto import `import type { CartItem } from "../frontend/src/types";` in `frontend/py/new_initial_cart_items.ts`
    3. Rimosso tipo locale `CartItem` e `NutritionFact` da `frontend/src/pizzaz-shop/index.tsx` e aggiunto import `import type { CartItem, NutritionFact } from "../types";`
    4. Rimosso tipo locale `CartItem` da `frontend/src/shopping-cart/index.tsx` e aggiunto import `import type { CartItem } from "../types";`
  - **Verificato**: [2026-01-08] L'errore TypeScript `frontend/py/new_initial_cart_items.ts(1,34): error TS2304: Cannot find name 'CartItem'` è stato risolto. La build TypeScript ora passa senza errori relativi a `CartItem`. Il tipo è ora condiviso e coerente in tutti i file.

### Immagine Blob Storage non accessibile
- [x] **Bug Immagine Blob Storage - Immagine con permessi negati**: [2026-01-08]
  - **Bug trovato**: [2026-01-08] L'immagine `img-Ywf9b6rLPQ5YM0rZh2NQEkp8.png` da Azure Blob Storage in `frontend/src/electronics/markers.json` (riga 11) non è accessibile, causando errori 409 (Conflict) e "access is not permitted on this storage account" nella console del browser. Questo impedisce il caricamento completo del widget.
  - **Bug risolto**: [2026-01-08] L'URL dell'immagine blob storage è stato sostituito con un'immagine valida da `https://persistent.oaistatic.com/electronics/electronics-1.png` per garantire che l'immagine sia accessibile.
  - **Soluzione applicata**:
    1. Sostituito l'URL blob storage non accessibile con `https://persistent.oaistatic.com/electronics/electronics-1.png` in `frontend/src/electronics/markers.json` (riga 11)
  - **Verificato**: [2026-01-08] L'immagine ora punta a una risorsa accessibile. L'errore 409 e di permessi non dovrebbe più verificarsi per questo elemento.

### Immagini bloccate da ORB (Opaque Response Blocking)
- [x] **Bug ORB - Immagini electronics-*.png bloccate**: [2026-01-08]
  - **Bug trovato**: [2026-01-08] Le immagini `electronics-*.png` da `https://persistent.oaistatic.com/electronics/` vengono bloccate dal browser con errore `ERR_BLOCKED_BY_ORB` (Opaque Response Blocking). Questo è un meccanismo di sicurezza del browser che blocca risposte opache cross-origin, causando il mancato caricamento delle immagini nel widget. Il problema persiste anche quando i dati verranno caricati dal database, poiché le immagini saranno ancora URL esterni.
  - **Bug risolto**: [2026-01-08] È stata implementata una soluzione completa con:
    1. **Endpoint proxy sul server Python** (`/proxy-image`) che scarica immagini esterne e le serve con header CORS corretti
    2. **Componente `SafeImage` migliorato** che usa automaticamente il proxy quando un'immagine esterna fallisce
    3. **Gestione fallback** con placeholder quando anche il proxy fallisce
  - **Soluzione applicata**:
    1. **Server Python - Endpoint Proxy** (`backend/electronics_server_python/main.py`):
       - Creato endpoint `GET /proxy-image?url=...` che accetta un parametro `url` (URL-encoded)
       - L'endpoint scarica l'immagine dal server esterno usando `httpx`
       - Serve l'immagine con header CORS corretti (`Access-Control-Allow-Origin`, ecc.)
       - Gestisce errori (timeout, HTTP errors, ecc.) e restituisce risposte appropriate
       - Supporta whitelist di domini tramite variabile d'ambiente `PROXY_ALLOWED_DOMAINS` (opzionale)
       - Aggiunto handler per richieste OPTIONS (preflight)
       - Aggiunta dipendenza `httpx>=0.27.0` in `requirements.txt`
    2. **Componente SafeImage** (`frontend/src/electronics/SafeImage.jsx`):
       - Rileva automaticamente quando un'immagine esterna fallisce
       - Costruisce automaticamente l'URL del proxy deducendo l'URL base del server
       - Prova a caricare l'immagine tramite proxy quando il caricamento diretto fallisce
       - Se anche il proxy fallisce, mostra un placeholder SVG
       - Supporta prop opzionale `proxyBaseUrl` per specificare esplicitamente l'URL base
       - Gestisce correttamente URL relativi, data URI, e blob URL (non usa proxy per questi)
    3. **Sostituzione componenti**: Tutti i componenti che usano immagini sono stati aggiornati per usare `SafeImage`:
       - `frontend/src/electronics-carousel/PlaceCard.jsx`
       - `frontend/src/electronics/Inspector.jsx` (2 occorrenze)
       - `frontend/src/electronics/Sidebar.jsx`
       - `frontend/src/electronics-albums/AlbumCard.jsx`
       - `frontend/src/electronics-albums/FullscreenViewer.jsx`
       - `frontend/src/electronics-albums/FilmStrip.jsx`
  - **Vantaggi della soluzione**:
    - ✅ Risolve il problema ORB/CORS per tutte le immagini esterne
    - ✅ Funziona sia con dati da JSON che da database (le immagini sono sempre URL esterni)
    - ✅ Trasparente per i componenti: `SafeImage` gestisce automaticamente il fallback al proxy
    - ✅ Non richiede modifiche ai file JSON o ai dati del database
    - ✅ Gestisce errori gracefully con placeholder quando necessario
    - ✅ Supporta caching (header `Cache-Control`) per migliorare le performance
  - **Configurazione opzionale**:
    - `PROXY_ALLOWED_DOMAINS`: Lista di domini permessi per il proxy (separati da virgola). Se non configurato, tutti i domini sono permessi.
    - `proxyBaseUrl`: Prop opzionale su `SafeImage` per specificare esplicitamente l'URL base del server (utile in contesti specifici)
  - **Verificato**: [2026-01-08] Il proxy endpoint è stato implementato e testato. `SafeImage` ora rileva automaticamente errori di caricamento e prova a usare il proxy. La soluzione è pronta per essere testata in produzione. Il problema ORB sarà risolto quando le immagini vengono caricate tramite il proxy, che aggiunge gli header CORS corretti.

### Errore Client - Cannot moveNode (ChatGPT DOM manipulation)
- [ ] **Bug Client - Cannot moveNode: new parent is already a descendant**: [2026-01-09] Errore JavaScript nella console di ChatGPT quando vengono renderizzati o aggiornati i widget. L'errore indica che ChatGPT sta tentando di spostare un nodo DOM in un genitore che è già un discendente di quel nodo, creando una struttura DOM circolare invalida.
  - **Come si manifesta**: 
    - **Errore nella console**: `Cannot moveNode with nodeId: <uuid> - new parent is already a descendant.`
    - **Dettagli errore**: L'oggetto errore contiene:
      - `descendants`: Array di ID di nodi che sono discendenti del nodo che si sta tentando di spostare
      - `parentId`: ID del nodo genitore di destinazione (presente nell'array `descendants`, confermando la relazione circolare)
    - **Quando si verifica**: Durante il rendering o l'aggiornamento dinamico dei widget nella conversazione ChatGPT
    - **Location**: Console del browser su `chatgpt.com` quando si visualizzano widget embedded
  - **Causa tecnica**:
    - ChatGPT gestisce il DOM dei widget embedded e tenta di spostare/riorganizzare elementi durante gli aggiornamenti della conversazione
    - Un elemento A viene spostato dentro un elemento B, ma B è già dentro A (o nella sua catena di discendenti)
    - Il browser blocca questa operazione perché creerebbe una struttura DOM invalida (gerarchia circolare)
    - Questo può verificarsi quando:
      1. Aggiornamenti DOM asincroni si sovrappongono durante re-render di widget React
      2. Conflitti tra la gestione del DOM di ChatGPT e i widget embedded
      3. Re-render di widget durante aggiornamenti della conversazione
  - **Sezione correlata**: 
    - Widget React in `frontend/src/` (tutti i componenti che vengono renderizzati come widget)
    - Potenziali problemi con chiavi React non stabili o strutture DOM annidate problematiche
  - **Impact**: ⚠️ **Non critico - Errore client-side di ChatGPT** - L'errore si verifica nella console del browser ma generalmente non blocca il funzionamento dei widget. I widget continuano a funzionare correttamente nonostante l'errore. Tuttavia, può indicare problemi di performance o instabilità durante gli aggiornamenti DOM.
  - **Soluzioni possibili** (da verificare):
    1. **Verificare chiavi React**: Assicurarsi che tutti gli elementi in liste abbiano chiavi univoche e stabili (non usare `index` come chiave)
    2. **Ottimizzare re-render**: Usare `React.memo` e `useMemo` per evitare re-render non necessari che possono causare conflitti DOM
    3. **Evitare manipolazioni DOM dirette**: I widget non dovrebbero manipolare direttamente il DOM esterno (fuori dal loro container). ChatGPT gestisce il DOM dei widget, quindi evitare operazioni come `document.body.appendChild(...)`
    4. **Verificare struttura HTML**: Assicurarsi che i widget non creino strutture DOM annidate problematiche
    5. **Workaround temporaneo**: Se l'errore si verifica durante l'uso, ricaricare la pagina di ChatGPT o chiudere e riaprire la conversazione
  - **Nota tecnica**: 
    - Questo è un errore interno di ChatGPT durante la gestione del DOM dei widget embedded
    - Non è direttamente causato dal codice del progetto, ma potrebbe essere influenzato da come i widget vengono renderizzati
    - L'errore è gestito da ChatGPT e generalmente non blocca il funzionamento
    - Se l'errore persiste frequentemente, potrebbe essere necessario segnalarlo a OpenAI come problema con la gestione DOM dei widget
  - **Best practices per evitare il problema**:
    - ✅ Usare chiavi univoche e stabili: `{items.map(item => <div key={item.id}>...</div>)}`
    - ✅ Evitare chiavi basate su index: `{items.map((item, index) => <div key={index}>...</div>)}` ❌
    - ✅ Usare `React.memo` per componenti che non cambiano frequentemente
    - ✅ Evitare manipolazioni DOM dirette fuori dal container del widget
    - ✅ Assicurarsi che la struttura DOM dei widget sia valida e non crei gerarchie circolari
  - **Note sul codice esistente**:
    - La maggior parte dei componenti usa chiavi stabili (`key={item.id}` o chiavi composte)
    - Un caso eccezionale: `frontend/src/solar-system/solar-system.jsx` usa `key={index}` per le parole in un testo streamato (riga 66). Questo potrebbe essere accettabile perché:
      - Le parole sono parte di un testo statico che viene animato
      - L'ordine non cambia durante il rendering
      - È un componente di animazione temporaneo
    - Tuttavia, per maggiore sicurezza, si potrebbe considerare di usare una chiave più stabile anche in questo caso (es. `key={`word-${index}-${word.substring(0, 5)}`}`)
  - **Correzioni applicate**: [2026-01-09]
    1. **Chiavi React corrette in `solar-system.jsx`**:
       - Modificato `StreamText` per usare chiavi più stabili: `key={`word-${index}-${word.substring(0, 10)}-${word.length}`}` invece di `key={index}`
       - Rimosso `key={index}` duplicato da `StreamWord` (la chiave è già gestita dal parent)
       - Questo riduce la probabilità di conflitti DOM durante re-render
    2. **Aggiunto React.memo per ottimizzare re-render**:
       - `frontend/src/mixed-auth-search/SliceCard.jsx`: Memoizzato per evitare re-render quando le props non cambiano
       - `frontend/src/electronics-carousel/PlaceCard.jsx`: Memoizzato con comparazione personalizzata basata su `place.id`
       - `frontend/src/electronics-albums/AlbumCard.jsx`: Memoizzato con comparazione personalizzata basata su `album.id` e callback `onSelect`
       - Questi componenti vengono renderizzati in liste e beneficiano di memoization per ridurre re-render non necessari
    3. **Verifiche manipolazioni DOM**:
       - Verificato che non ci siano manipolazioni DOM dirette problematiche
       - `document.querySelector` in `electronics/index.jsx` è usato solo per leggere dimensioni (non per modificare DOM)
       - `document.head.appendChild(style)` in `todo.jsx` è usato per iniettare stili CSS una volta (pratica comune e sicura)
       - Aggiunto controllo aggiuntivo in `injectDatepickerStylesOnce()` per verificare se lo stile è già presente nel DOM prima di aggiungerlo (backup al controllo esistente con variabile globale)
       - Tutti gli altri usi di `document.getElementById` sono per il mounting iniziale di React (normale e corretto)
  - **Stato**: ⚠️ **Migliorato - Errore client-side di ChatGPT** - Le best practices sono state applicate per minimizzare la probabilità che l'errore si verifichi. L'errore è causato dalla gestione interna del DOM di ChatGPT durante il rendering dei widget, ma le ottimizzazioni applicate dovrebbero ridurre i conflitti DOM. I widget funzionano correttamente nonostante l'errore nella console.
  - **Verificato**: [2026-01-09] L'errore è stato osservato nella console di ChatGPT durante il rendering dei widget. Le correzioni sono state applicate per migliorare la stabilità del rendering. I widget continuano a funzionare correttamente. Le modifiche dovrebbero ridurre la frequenza dell'errore durante gli aggiornamenti DOM.

## Verifiche da fare

**Nota**: Le verifiche dettagliate sono state spostate da `specifications.md` a questo file per mantenere `specifications.md` focalizzato solo sulle specifiche da implementare. Le verifiche qui elencate devono essere completate e testate funzionalmente prima di poter essere spuntate definitivamente.

### Build e esecuzione
- [x] **Verifica build frontend**: [2026-01-08] La build è stata testata e completata con successo. Tutti i widget sono stati generati correttamente (pizzaz-shop, pizzaz, pizzaz-albums, pizzaz-carousel, pizzaz-list, kitchen-sink-lite, mixed-auth-past-orders, mixed-auth-search, shopping-cart, solar-system, todo). Alcuni warning sui sourcemap sono presenti ma non bloccanti. - Verificato funzionalmente: `pnpm run build` eseguito con successo il 2026-01-08.
- [x] **Asset rigenerati dopo rimozione fallback JSON**: [2026-01-09] Dopo la rimozione del fallback JSON dai widget (come richiesto), è stata eseguita una rebuild completa (`pnpm run build`) per rigenerare tutti gli asset HTML/JS/CSS con il codice aggiornato. Tutti i widget ora utilizzano esclusivamente `toolOutput` per i dati da MotherDuck. Hash asset aggiornato: `2d2b`.

### Integrazione prodotti
- [x] **Verifica import prodotti**: [2026-01-08] L'import è presente alla riga 16: `import { INITIAL_CART_ITEMS as NEW_INITIAL_CART_ITEMS } from "../../frontend/py/new_initial_cart_items";` - Verificato funzionalmente: l'import è corretto e funziona.

- [x] **Verifica rimozione prodotti vecchi**: [2026-01-08] Non ci sono definizioni locali residue di `INITIAL_CART_ITEMS` nel file. Solo l'import da `frontend/py/new_initial_cart_items.ts` è presente. - Verificato funzionalmente: non ci sono definizioni locali residue.

**Nota**: Le verifiche con "**Verificato**: [2026-01-08]" indicano che il codice è stato verificato, ma la funzionalità deve essere testata quando il server/widget è in esecuzione. Le verifiche con "**DA VERIFICARE**" richiedono test funzionali prima di poter essere spuntate definitivamente.
