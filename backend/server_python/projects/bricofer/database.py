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
        "category": {
            "type": "array",
            "items": {"type": "string"},
            "description": "REQUIRED format: array of strings, never a single string. Pass all synonyms/variants for the category (e.g. [\"smartphone\", \"cell phone\", \"mobile phone\", \"smartphones\", \"telefoni\"]). Include plural, singular, different languages, spacing variants�every term that could match the category. You MUST pass it at least in english and italian.",
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
    connection = duckdb.connect(f"md:bricofer_demo?motherduck_token={md_token}")
    print("Connected to MotherDuck")
    return connection

def get_products_from_motherduck(
    arguments: dict,
    limit_per_category: int | None = None,
) -> list[dict]:
    category = arguments.get("category")
    brand = arguments.get("brand")
    min_price = arguments.get("min_price")
    max_price = arguments.get("max_price")
    query = "SELECT * FROM main.products"
    if category:
        in_list = f", ".join(f"'{c}'" for c in category)
        # match if categories IN list OR description contains at least one term (case-insensitive)
        desc_escaped = [c.replace("'", "''") for c in category]
        desc_conditions = " OR ".join(f"description ILIKE '% {t} %'" for t in desc_escaped)
        query += f" WHERE (categories COLLATE \"NOCASE\" IN ({in_list}) OR ({desc_conditions}))"
    if brand:
        query += "WHERE" in query and f" AND brand = '{brand}' COLLATE \"NOCASE\"" or f" WHERE brand = '{brand}' COLLATE \"NOCASE\""
    if min_price:
        query += "WHERE" in query and f" AND price >= {min_price}" or f" WHERE price >= {min_price}"
    if max_price:
        query += "WHERE" in query and f" AND price <= {max_price}" or f" WHERE price <= {max_price}"
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
        description=record["description"] or "",
        image=record["image"] or "",
    )

@dataclass
class Product:
    id: int
    name: str
    brand: str
    categories: str
    price: float
    description: str
    image: str