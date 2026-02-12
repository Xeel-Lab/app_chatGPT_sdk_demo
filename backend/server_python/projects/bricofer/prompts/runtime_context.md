# RUNTIME CONTEXT — Provided by Application Tool

## ACTIVE DATA
- Database table: products
- Source tools: product-list, recipe_search, recipe_parse

## AVAILABLE WIDGETS
- carousel -> l'utente può richiamare anche i confronti dall'apposito pulsante
- list  -> usare SOLO per bundle/kit / “tutto il necessario”
- shopping-cart

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
