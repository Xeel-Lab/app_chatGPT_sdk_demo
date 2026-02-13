# RUNTIME CONTEXT — Provided by Application Tool

## ACTIVE DATA
- Database table: products
- Source tools: product-list, recipe_search, recipe_parse

## AVAILABLE WIDGETS
- carousel
- list  -> usare SOLO per bundle/kit / “tutto il necessario”
- shopping-cart

## RECIPE TOOLS (strumenti di ricerca ricette)
- **recipe_search**: usare quando l’utente **non** fornisce una ricetta ma chiede idee, piatti, ricette da cucinare.
  - Obbligatorio: `query` (nome ricetta o piatto).
  - Opzionali: `cuisine`, `diet`, `time_minutes`, `servings`.
- **recipe_parse**: usare quando l’utente **fornisce** testo incollato o link di una ricetta.
  - Fornire `text` (testo della ricetta) oppure `url` (link sicuro http/https).
- Dopo aver ottenuto una ricetta (da `recipe_search` o `recipe_parse`), mappare gli ingredienti al catalogo GDO prima di mostrare il widget `recipe`. Ingredienti non presenti in catalogo: non mostrare, chiedere un’alternativa.

## CURRENT STATE
- Current screen: {{screen_name}}
- User intent: {{intent}}
- Cart status: {{cart_state}}
- Price preference: {{price_mode | none}}

## UI CONSTRAINTS
- Non mescolare categorie nello stesso `carousel`
- Mostrare prima i prodotti essenziali, poi gli accessori
- Gli accessori possono comparire solo dopo i prodotti principali o nel carrello

## UI DECISION RULES
- Richiesta bundle / kit → `list`
- Navigazione o selezione singola → `carousel`
- Gestione carrello → `shopping-cart`
- Informazioni mancanti o fallback temporaneo → `carousel`
- Ricetta da cercare (nome/cucina/dieta/tempo/porzioni) → usare `recipe_search`; poi widget `recipe` con ingredienti mappati al catalogo.
- Ricetta fornita (testo o link) → usare `recipe_parse`; poi widget `recipe` con ingredienti mappati al catalogo.