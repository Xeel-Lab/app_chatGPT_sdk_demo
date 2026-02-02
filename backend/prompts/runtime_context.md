# RUNTIME CONTEXT — Provided by Application Tool

## ACTIVE DATA
- table in database: products
- Source tool: product-list

## AVAILABLE WIDGETS
- carousel
- list -> **use only when returning bundle/kit or "everything needed" requests**
- albums
- map
- cart
- cross_sell_recommendations (max 4 items)

## CURRENT STATE
- Current screen: {{screen_name}}
- User intent: {{intent}}
- Cart status: {{cart_state}}
- Price preference: {{price_mode | none}}

## UI CONSTRAINTS
- Do not mix categories inside `carousel`
- Show essential products before accessories
- Accessories should be proposed only after main products or in cart
