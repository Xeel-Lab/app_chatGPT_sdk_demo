from __future__ import annotations

from dotenv import load_dotenv
import duckdb
import os
from copy import deepcopy
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List


TOOL_INPUT_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "limit": {
            "type": "integer",
            "description": "Max number of products to return.",
            "minimum": 1,
        },
        "name": {
            "type": "string",
            "description": "Name of products to return.",
        },
        "category": {
            "type": "array",
            "items": {"type": "string"},
            "description": "REQUIRED format: array of strings, never a single string. I valori consentiti per category sono ricavati direttamente dalle categorie presenti nel database prodotti. La lista delle categorie disponibili deve essere ottenuta in modo dinamico dal DB (tabella: categories o campo equivalente dei prodotti).",
        },
        "brand": {
            "type": "string",
            "description": "Brand of products to return.",
        },
        "min_price": {
            "type": "number",
            "description": "Minimum price of products to return.",
        },
        "max_price": {
            "type": "number",
            "description": "Maximum price of products to return.",
        },
    },
    "additionalProperties": False,
}

def get_motherduck_connection() -> duckdb.DuckDBPyConnection:
    md_token = os.getenv("motherduck_token")
    if not md_token:
        raise ValueError("motherduck_token non trovato nelle variabili d'ambiente")
    connection = duckdb.connect(f"md:gdo_demo?motherduck_token={md_token}")
    print("Connected to MotherDuck")
    return connection

def get_products_from_motherduck(
    arguments: dict,
    limit_per_category: int | None = None,
) -> list[dict]:
    category = arguments.get("category")
    brand = arguments.get("brand")
    name = arguments.get("name")
    min_price = arguments.get("min_price")
    max_price = arguments.get("max_price")
    query = "SELECT * FROM main.products"
    conditions = []
    if name and str(name).strip():
        name_escaped = str(name).strip().replace("'", "''")
        conditions.append(f"(name ILIKE '%{name_escaped}%' OR description ILIKE '%{name_escaped}%')")
    if category:
        # ILIKE = match case-insensitive (es. "Pancetta" e "pancetta" matchano uguale)
        category_conditions = []
        for c in category:
            c_escaped = str(c).strip().replace("'", "''")
            if c_escaped:
                category_conditions.append(f"(categories ILIKE '{c_escaped}')")
        if category_conditions:
            conditions.append("(" + " OR ".join(category_conditions) + ")")
    if brand:
        brand_escaped = str(brand).replace("'", "''")
        conditions.append(f"brand = '{brand_escaped}' COLLATE \"NOCASE\"")
    if min_price is not None:
        conditions.append(f"price >= {min_price}")
    if max_price is not None:
        conditions.append(f"price <= {max_price}")
    if conditions:
        query += " WHERE " + " AND ".join(conditions)
    if limit_per_category is not None and limit_per_category > 0:
        # Al massimo N risultati per valore di categories (ordinati per price)
        query = (
            "SELECT * EXCLUDE (rn) FROM ("
            "SELECT *, ROW_NUMBER() OVER (PARTITION BY categories ORDER BY price) AS rn FROM ("
            + query
            + ") subq) WHERE rn <= " + str(limit_per_category)
        )
    print(query)
    with get_motherduck_connection() as con:
        df = con.execute(query).fetchdf()
        return [map_product_record(record) for record in df.to_dict(orient="records")]
    
def map_product_record(record: dict) -> Product:
    return Product(
        id=record["id"],
        name=record["name"] or "",
        brand=record["brand"] or "",
        categories=record["categories"] or "",
        price=float(record["price"]) if record["price"] is not None else None,
        rate=float(record["rate"]) if record.get("rate") is not None else None,
        description=record["description"] or "",
        image=record["image"] or "",
    )

def get_additional_information() -> list[str]:
    with get_motherduck_connection() as con:
        df = con.execute(
            "SELECT DISTINCT categories FROM main.products WHERE categories IS NOT NULL AND TRIM(categories) != '' ORDER BY categories"
        ).fetchdf()
        return df["categories"].astype(str).tolist()   

@dataclass
class Product:
    id: int
    name: str
    brand: str
    categories: str
    price: float
    rate: float
    description: str
    image: str