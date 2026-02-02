import csv
import json
import re

def clean_string(s):
    if isinstance(s, str):
        # Rimuovi i caratteri che potrebbero rompere il JSON o il TS
        s = s.replace('\\', '\\\\')
        s = s.replace('"', '\\"')
        s = s.replace('\n', ' ')
        s = s.replace('\r', '')
        s = s.replace('\t', ' ')
        # Rimuovi spazi extra
        s = re.sub(r'\s+', ' ', s).strip()
    return s

def csv_to_typescript_array(csv_filepath):
    cart_items = []
    with open(csv_filepath, mode='r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            # Mappatura dei campi dal CSV alla struttura CartItem
            item_id = clean_string(row.get('id', ''))
            item_name = clean_string(row.get('name', ''))
            item_price_str = row.get('price', '0.0')
            try:
                item_price = float(item_price_str)
            except ValueError:
                item_price = 0.0

            item_description = clean_string(row.get('descrizione_prodotto', ''))
            item_short_description = clean_string(item_name) # Usa il nome come shortDescription
            item_detail_summary = clean_string(row.get('weight', '')) # Usa il peso come detailSummary

            # Gestione delle immagini (prendiamo la prima URL se ce ne sono più)
            image_urls_str = row.get('imageURLs', '')
            image_url = ''
            if image_urls_str:
                image_urls = image_urls_str.split(',')
                if image_urls:
                    image_url = clean_string(image_urls[0].strip())

            # Highlights (campi 'pro' del CSV)
            highlights_str = row.get('pro', '')
            highlights = [clean_string(h.strip()) for h in highlights_str.split(',') if clean_string(h.strip())]

            # Tags (campi 'categories' del CSV)
            categories_str = row.get('categories', '')
            # Normalizza i tag a lowercase e rimuovi spazi extra
            tags = [clean_string(t.strip()).lower() for t in categories_str.split(',') if clean_string(t.strip())]
            # Filtra per i tag supportati, se necessario, o includi tutti
            # Per ora, includiamo tutti i tag dal CSV
            
            cart_item = {
                "id": item_id,
                "name": item_name,
                "price": round(item_price, 2),
                "description": item_description,
                "shortDescription": item_short_description,
                "detailSummary": item_detail_summary,
                "nutritionFacts": [], # Non abbiamo una mappatura diretta, quindi vuoto
                "highlights": highlights,
                "tags": tags,
                "quantity": 1, # Quantità di default
                "image": image_url,
            }
            cart_items.append(cart_item)

    # Formatta l'output come stringa TypeScript
    ts_array_string = "const INITIAL_CART_ITEMS: CartItem[] = [\n"
    for item in cart_items:
        # Formatta i campi stringa con le virgolette e scapa correttamente
        item_str = json.dumps(item, indent=2)
        # Rimuovi le doppie virgolette per chiavi e array/oggetti TS
        item_str = re.sub(r'\"(id|name|price|description|shortDescription|detailSummary|nutritionFacts|highlights|tags|quantity|image)\":', r'\1:', item_str)
        # Rimuovi le virgolette dai valori booleani, se presenti (json.dumps li gestisce, ma per coerenza)
        item_str = item_str.replace('true', 'true').replace('false', 'false')

        ts_array_string += f"{item_str},\n"
    ts_array_string += "];"
    return ts_array_string

if __name__ == "__main__":
    csv_file = "c:\\Users\\GiadaDelTesta\\Downloads\\prodotti_xeel_shop.csv"
    typescript_output = csv_to_typescript_array(csv_file)
    print(typescript_output)
