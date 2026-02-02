# Changelog

Tutte le modifiche notevoli a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce a [Semantic Versioning](https://semver.org/lang/it/).

## [1.1.0] - 2026-01-XX

### Aggiunto
- **Sistema di carrello condiviso**: Implementato hook `useCart` per gestire il carrello condiviso tra tutti i widget
- **Pulsanti "Aggiungi al carrello"**: Aggiunti a tutti i widget che mostrano prodotti:
  - `electronics-carousel`: Pulsante su ogni card del carosello
  - `electronics-list`: Pulsante su ogni elemento della lista
  - `electronics-albums`: Pulsante nella vista fullscreen del prodotto
  - `electronics-map`: Pulsante nella sidebar e nell'inspector
  - `mixed-auth-search`: Pulsante su ogni card del carosello
- **Tool `shopping-cart`**: Aggiunto nuovo tool MCP `shopping-cart` nel backend per mostrare il carrello quando l'utente lo richiede. Il widget mostra solo i prodotti aggiunti tramite i pulsanti "Aggiungi al carrello" nei vari widget
- **Isolamento del carrello**: Il carrello usa una chiave specifica `sharedCartItems` nel `widgetState` per evitare interferenze con altri widget (es. `electronics-shop`)
- **Gestione stato carrello**: Il carrello parte sempre vuoto e mostra solo prodotti aggiunti esplicitamente tramite i pulsanti
- **Prevenzione duplicati**: Implementato debounce (500ms) e controllo duplicati per evitare aggiunte multiple accidentali
- **Backend ID univoci**: Garantiti ID univoci per ogni prodotto nel backend per evitare conflitti

### Modificato
- **Backend filtering**: Migliorato il filtro per categoria nel backend per evitare prodotti irrilevanti (es. audio quando si cerca TV)
- **Limite carosello**: Il limite di 12 prodotti nel carosello è ora un massimo, non un obbligo. Se ci sono solo 5 prodotti della categoria richiesta, vengono mostrati solo quelli
- **Istruzioni AI**: Aggiornate le istruzioni per l'AI con regole chiare sul comportamento del carrello e quando usare il tool `shopping-cart` (quando l'utente chiede di vedere il carrello)
- **Lista tool disponibili**: Aggiunto `shopping-cart` alla lista dei tool esposti dal server MCP (ora 7 tool totali)

### Corretto
- **Carrello mostra prodotti random**: Risolto problema per cui il carrello mostrava prodotti non aggiunti manualmente
- **Aggiunta intera serie**: Risolto problema per cui cliccare "Aggiungi al carrello" aggiungeva l'intera serie invece di un singolo prodotto
- **Filtro TV mostra audio**: Corretto il filtro per evitare che prodotti audio appaiano quando si cerca "TV"

## [1.0.0] - 2026-01-08

### Aggiunto
- Server MCP Python per widget prodotti elettronici
- Integrazione con MotherDuck per recupero prodotti dal database
- 6 tool/widget disponibili:
  - `electronics-map`: Mappa interattiva dei negozi
  - `electronics-carousel`: Carosello prodotti
  - `electronics-albums`: Galleria prodotti
  - `electronics-list`: Lista prodotti
  - `electronics-shop`: Negozio completo
  - `product-list`: Lista prodotti da MotherDuck
- Supporto per risorse MCP (resources e resource templates)
- Transport Security con configurazione `MCP_ALLOWED_HOSTS` e `MCP_ALLOWED_ORIGINS`
- FastAPI app esposta per uvicorn con SSE transport
- Descrizioni dettagliate per tutti i tool
- Documentazione completa nel README

### Note
- Versione iniziale del server
- Richiede `motherduck_token` come variabile d'ambiente obbligatoria
- Supporta MCP Protocol versione 2024-11-05 (Current)
