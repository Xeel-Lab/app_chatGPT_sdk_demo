"""Electronics demo MCP server implemented with the Python FastMCP helper.

The server exposes widget-backed tools that render the Electronics UI bundle.
Each handler returns the HTML shell via an MCP resource and echoes structured
content so the ChatGPT client can hydrate the widget. The module also wires the
handlers into an HTTP/SSE stack so you can run the server with uvicorn on port
8000, matching the Node transport behavior.

Version: 1.0.0
MCP Protocol Version: 2024-11-05
"""

from __future__ import annotations

from dotenv import load_dotenv
import duckdb
import json
import os
import stripe
import importlib
from copy import deepcopy
from dataclasses import dataclass
from functools import lru_cache
import ipaddress
from pathlib import Path
import re
from typing import Any, Dict, List
from urllib.parse import urlparse

import httpx
import mcp.types as types
from mcp.server.fastmcp import FastMCP
from mcp.server.transport_security import TransportSecuritySettings

env_paths = [
    Path(__file__).resolve().parent / ".env.local",
    Path(__file__).resolve().parent.parent.parent / ".env",
]

env_path = None
for path in env_paths:
    if path.exists():
        env_path = path
        load_dotenv(dotenv_path=env_path)
        break
    
className = os.getenv("DB_CLASS")
if not className:
    raise ValueError("DB_CLASS non trovato nelle variabili d'ambiente.")
# Support both: run from server_python (main) and from project root (backend.server_python.main, e.g. Render)
_parent = __name__.rsplit(".", 1)[0] if "." in __name__ else None
if _parent is not None:
    database = importlib.import_module(f".dbClass.{className}", package=_parent)
else:
    database = importlib.import_module(f"dbClass.{className}")
if database is None:
    raise ValueError(f"Database class '{className}' not found in dbClass module.")

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@dataclass(frozen=True)
class Widget:
    identifier: str
    title: str
    description: str
    template_uri: str
    invoking: str
    invoked: str
    html: str
    response_text: str


ASSETS_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "assets"


@lru_cache(maxsize=None)
def _load_widget_html(component_name: str) -> str:
    html_path = ASSETS_DIR / f"{component_name}.html"
    if html_path.exists():
        return html_path.read_text(encoding="utf8")

    fallback_candidates = sorted(ASSETS_DIR.glob(f"{component_name}-*.html"))
    if fallback_candidates:
        return fallback_candidates[-1].read_text(encoding="utf8")

    raise FileNotFoundError(
        f'Widget HTML for "{component_name}" not found in {ASSETS_DIR}. '
        "Run `pnpm run build` to generate the assets before starting the server."
    )


widgets: List[Widget] = [
    Widget(
        identifier="carousel",
        title="Show Carousel",
        description="Show a carousel of products when the user don't request a bundle of products for a specific purpose. Show products related to the context of the user query. This widget is ideal for exploration of products.",
        template_uri="ui://widget/carousel.html",
        invoking="Carousel some spots",
        invoked="Served a fresh carousel",
        html=_load_widget_html("carousel"),
        response_text="Rendered a carousel!",
    ),
    Widget(
        identifier="list",
        title="Show List of Products",
        description="Show a list of products when the user requests a bundle of products or express a need for a group of products for a specific project or activity. This widget is ideal for bulk product buy when needed for a specific project or activity.",
        template_uri="ui://widget/list.html",
        invoking="List some spots",
        invoked="Show a list of products",
        html=_load_widget_html("list"),
        response_text="Showed a list of products!",
    ),
    Widget(
        identifier="shopping-cart",
        title="Shopping Cart",
        description="Show the shopping cart with selected products added by the user during the conversation.",
        template_uri="ui://widget/shopping-cart.html",
        invoking="Open shopping cart",
        invoked="Opened shopping cart",
        html=_load_widget_html("shopping-cart"),
        response_text="Rendered the shopping cart!",
    ),
]


MIME_TYPE = "text/html+skybridge"


WIDGETS_BY_ID: Dict[str, Widget] = {
    widget.identifier: widget for widget in widgets
}
WIDGETS_BY_URI: Dict[str, Widget] = {
    widget.template_uri: widget for widget in widgets
}


def _split_env_list(value: str | None) -> List[str]:
    if not value:
        return []
    return [item.strip() for item in value.split(",") if item.strip()]


def _transport_security_settings() -> TransportSecuritySettings:
    allowed_hosts = _split_env_list(os.getenv("MCP_ALLOWED_HOSTS"))
    allowed_origins = _split_env_list(os.getenv("MCP_ALLOWED_ORIGINS"))
    if not allowed_hosts and not allowed_origins:
        return TransportSecuritySettings(enable_dns_rebinding_protection=False)
    return TransportSecuritySettings(
        enable_dns_rebinding_protection=True,
        allowed_hosts=allowed_hosts,
        allowed_origins=allowed_origins,
    )

mcp = FastMCP(
    name="mcp-python",
    stateless_http=True,
    transport_security=_transport_security_settings(),
)


def _resource_description(widget: Widget) -> str:
    return f"{widget.title} widget markup"


def _tool_meta(widget: Widget) -> Dict[str, Any]:
    return {
        "openai/outputTemplate": widget.template_uri,
        "openai/toolInvocation/invoking": widget.invoking,
        "openai/toolInvocation/invoked": widget.invoked,
        "openai/widgetAccessible": True,
    }


def _tool_invocation_meta(widget: Widget) -> Dict[str, Any]:
    return {
        "openai/toolInvocation/invoking": widget.invoking,
        "openai/toolInvocation/invoked": widget.invoked,
    }


@mcp._mcp_server.list_tools()
async def _list_tools() -> List[types.Tool]:
    return [
        *[
            types.Tool(
                name=widget.identifier,
                title=widget.title,
                description=f"{widget.title}. When filtering by category or context, always pass 'category' and 'context' as an array of strings (e.g. [\"phones\", \"smartphones\"], [\"home\", \"office\"]), never as a single string, you MUST pass it at least in english and italian.",
                inputSchema=deepcopy(database.TOOL_INPUT_SCHEMA),
                _meta=_tool_meta(widget),
                annotations={
                    "destructiveHint": False,
                    "openWorldHint": False,
                    "readOnlyHint": True,
                },
            )
            for widget in widgets
        ],
        types.Tool(
            name="min",
            title="Expose initial prompts",
            description="Returns developer_core.md and runtime_context.md, the initial prompts used by the agent. Always called at the start of the conversation.",
            inputSchema={
                "type": "object",
                "properties": {},
                "additionalProperties": False,
            },
            annotations={
                "destructiveHint": False,
                "openWorldHint": False,
                "readOnlyHint": True,
            },
        ),
        types.Tool(
            name="create_payment_intent",
            title="Create PaymentIntent",
            description="Creates a Stripe PaymentIntent and returns client_secret",
            inputSchema={
                "type": "object",
                "properties": {
                    "amount": {"type": "integer", "description": "Amount in cents"},
                    "currency": {"type": "string", "description": "Currency code (e.g. eur)"},
                },
                "required": ["amount"],
                "additionalProperties": False,
            },
            annotations={
                "destructiveHint": True,
                "openWorldHint": True,
                "readOnlyHint": False,
            },
        ),
        types.Tool(
            name="compare_enrich",
            title="Generate pro/contro",
            description="Genera pro e contro per una lista di prodotti.",
            inputSchema={
                "type": "object",
                "properties": {
                    "items": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "id": {},
                                "name": {},
                                "description": {},
                                "price": {},
                                "categories": {},
                                "brand": {},
                                "weight": {}
                            },
                            "additionalProperties": True
                        }
                    },
                },
                "required": ["items"],
                "additionalProperties": False,
            },
            annotations={
                "destructiveHint": False,
                "openWorldHint": True,
                "readOnlyHint": True,
            },
        ),
        types.Tool(
            name="recipe_search",
            title="Search recipes",
            description=(
                "Cerca ricette online quando l'utente non fornisce una ricetta."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Nome ricetta o piatto"},
                    "cuisine": {"type": "string", "description": "Cucina preferita"},
                    "diet": {"type": "string", "description": "Preferenza dieta"},
                    "time_minutes": {"type": "integer", "description": "Tempo massimo"},
                    "servings": {"type": "integer", "description": "Numero porzioni"},
                },
                "required": ["query"],
                "additionalProperties": False,
            },
            annotations={
                "destructiveHint": False,
                "openWorldHint": True,
                "readOnlyHint": True,
            },
        ),
        types.Tool(
            name="recipe_parse",
            title="Parse recipe",
            description=(
                "Estrae ingredienti da testo o link di una ricetta fornita dall'utente."
            ),
            inputSchema={
                "type": "object",
                "properties": {
                    "text": {"type": "string", "description": "Testo ricetta"},
                    "url": {"type": "string", "description": "Link ricetta"},
                },
                "additionalProperties": False,
            },
            annotations={
                "destructiveHint": False,
                "openWorldHint": True,
                "readOnlyHint": True,
            },
        ),
    ]

@mcp._mcp_server.list_resources()
async def _list_resources() -> List[types.Resource]:
    return [
        types.Resource(
            name=widget.title,
            title=widget.title,
            uri=widget.template_uri,
            description=_resource_description(widget),
            mimeType=MIME_TYPE,
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]


@mcp._mcp_server.list_resource_templates()
async def _list_resource_templates() -> List[types.ResourceTemplate]:
    return [
        types.ResourceTemplate(
            name=widget.title,
            title=widget.title,
            uriTemplate=widget.template_uri,
            description=_resource_description(widget),
            mimeType=MIME_TYPE,
            _meta=_tool_meta(widget),
        )
        for widget in widgets
    ]


async def _handle_read_resource(req: types.ReadResourceRequest) -> types.ServerResult:
    widget = WIDGETS_BY_URI.get(str(req.params.uri))
    if widget is None:
        return types.ServerResult(
            types.ReadResourceResult(
                contents=[],
                _meta={"error": f"Unknown resource: {req.params.uri}"},
            )
        )

    contents = [
        types.TextResourceContents(
            uri=widget.template_uri,
            mimeType=MIME_TYPE,
            text=widget.html,
            _meta=_tool_meta(widget),
        )
    ]

    return types.ServerResult(types.ReadResourceResult(contents=contents))


PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"
DEVELOPER_CORE_PATH = PROMPTS_DIR / "developer_core.md"
RUNTIME_CONTEXT_PATH = PROMPTS_DIR / "runtime_context.md"

def _load_prompt_text(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf8")

async def _generate_pro_contra(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return []

    payload = {
        "items": [
            {
                "id": item.get("id"),
                "name": item.get("name"),
                "description": item.get("description"),
                "price": item.get("price"),
                "categories": item.get("categories"),
                "brand": item.get("brand"),
                "weight": item.get("weight"),
            }
            for item in items
        ]
    }

    system = (
        "Sei un assistente che sintetizza PRO e CONTRO in modo breve, "
        "basandosi SOLO sui dati forniti. Non inventare caratteristiche."
    )
    user = (
        "Genera per ogni item un pro e un contro. "
        "Rispondi SOLO JSON nel formato: "
        "{\"items\":[{\"id\": \"...\", \"pro\": \"...\", \"contro\": \"...\"}]}\n"
        f"Dati: {json.dumps(payload, indent=2)}"
    )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    body = {
        "model": "gpt-4.1-mini",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "response_format": {"type": "json_object"},
    }

    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions", json=body, headers=headers
        )
        response.raise_for_status()
        data = response.json()

    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    parsed = json.loads(content) if content else {}
    if isinstance(parsed, dict):
        parsed = parsed.get("items", [])
    return parsed if isinstance(parsed, list) else []

def _normalize_ingredient_name(name: str) -> str:
    return re.sub(r"\s+", " ", name.strip())

def _parse_mealdb_ingredients(meal: Dict[str, Any]) -> List[Dict[str, str]]:
    ingredients: List[Dict[str, str]] = []
    for index in range(1, 21):
        raw_name = meal.get(f"strIngredient{index}") or ""
        raw_measure = meal.get(f"strMeasure{index}") or ""
        name = _normalize_ingredient_name(raw_name)
        if not name:
            continue
        measure = _normalize_ingredient_name(raw_measure) if raw_measure.strip() else ""
        item: Dict[str, str] = {"name": name}
        if measure:
            item["measure"] = measure
        ingredients.append(item)
    return ingredients

async def _recipe_search_mealdb(query: str) -> List[Dict[str, Any]]:
    if not query:
        return []
    params = {"s": query}
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.get(
            "https://www.themealdb.com/api/json/v1/1/search.php", params=params
        )
        response.raise_for_status()
        data = response.json()
    meals = data.get("meals") or []
    recipes: List[Dict[str, Any]] = []
    for meal in meals:
        ingredients = _parse_mealdb_ingredients(meal)
        recipes.append(
            {
                "id": meal.get("idMeal"),
                "title": meal.get("strMeal"),
                "source_url": meal.get("strSource") or meal.get("strYoutube"),
                "ingredients": ingredients,
            }
        )
    return recipes

def _is_safe_url(url: str) -> bool:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return False
    host = (parsed.hostname or "").strip().lower()
    if not host or host in {"localhost"}:
        return False
    try:
        ip = ipaddress.ip_address(host)
        if (
            ip.is_private
            or ip.is_loopback
            or ip.is_link_local
            or ip.is_reserved
            or ip.is_multicast
        ):
            return False
    except ValueError:
        pass
    return True

def _strip_html(text: str) -> str:
    text = re.sub(r"(?is)<script.*?>.*?</script>", " ", text)
    text = re.sub(r"(?is)<style.*?>.*?</style>", " ", text)
    text = re.sub(r"(?is)<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()

def _parse_ingredients_fallback(text: str) -> List[Dict[str, str]]:
    lines = [line.strip() for line in text.splitlines()]
    candidates: List[str] = []
    for line in lines:
        if not line:
            continue
        if line.startswith(("-", "*", "•")):
            candidates.append(line.lstrip("-*• ").strip())
            continue
        if re.match(r"^\d+\s", line):
            candidates.append(line)
    if not candidates:
        candidates = [item.strip() for item in re.split(r"[,\;]", text) if item.strip()]
    seen = set()
    ingredients: List[Dict[str, str]] = []
    for item in candidates:
        name = _normalize_ingredient_name(item)
        key = name.lower()
        if not name or key in seen:
            continue
        seen.add(key)
        ingredients.append({"name": name})
    return ingredients

async def _parse_ingredients_with_openai(text: str) -> Dict[str, Any]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return {"title": None, "ingredients": _parse_ingredients_fallback(text)}
    system = (
        "Estrai titolo e ingredienti da una ricetta. "
        "Rispondi SOLO JSON con chiavi: title, ingredients "
        "(lista di oggetti con name e measure opzionale)."
    )
    user = f"Testo ricetta:\n{text}"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    body = {
        "model": "gpt-4.1-mini",
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "response_format": {"type": "json_object"},
    }
    async with httpx.AsyncClient(timeout=20) as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions", json=body, headers=headers
        )
        response.raise_for_status()
        data = response.json()
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    parsed = json.loads(content) if content else {}
    if not isinstance(parsed, dict):
        parsed = {}
    ingredients = parsed.get("ingredients")
    if not isinstance(ingredients, list):
        ingredients = _parse_ingredients_fallback(text)
    return {"title": parsed.get("title"), "ingredients": ingredients}

async def _call_tool_request(req: types.CallToolRequest) -> types.ServerResult:
    if req.params.name == "min":
        developer_core = _load_prompt_text(DEVELOPER_CORE_PATH)
        runtime_context = _load_prompt_text(RUNTIME_CONTEXT_PATH)
        return types.ServerResult(
            print("Loaded prompts."),
            types.CallToolResult(
                content=[types.TextContent(type="text", text="Loaded prompts.")],
                structuredContent={
                    "developer_core": developer_core,
                    "runtime_context": runtime_context,
                },
            )
        )

    if req.params.name == "compare_enrich":
        args = req.params.arguments or {}
        items = args.get("items", [])
        if not isinstance(items, list):
            items = []
        enriched = await _generate_pro_contra(items)
        return types.ServerResult(
            types.CallToolResult(
                content=[types.TextContent(type="text", text="Generated pro/contro.")],
                structuredContent={"items": enriched},
            )
        )

    if req.params.name == "recipe_search":
        args = req.params.arguments or {}
        query = (args.get("query") or "").strip()
        if not query:
            return types.ServerResult(
                types.CallToolResult(
                    content=[types.TextContent(type="text", text="Missing query.")],
                    isError=True,
                )
            )
        try:
            recipes = await _recipe_search_mealdb(query)
        except Exception as exc:
            print(f"Error searching recipes: {exc}")
            return types.ServerResult(
                types.CallToolResult(
                    content=[types.TextContent(type="text", text="Recipe search failed.")],
                    isError=True,
                )
            )
        return types.ServerResult(
            types.CallToolResult(
                content=[types.TextContent(type="text", text="Fetched recipes.")],
                structuredContent={"recipes": recipes},
            )
        )

    if req.params.name == "recipe_parse":
        args = req.params.arguments or {}
        text = (args.get("text") or "").strip()
        url = (args.get("url") or "").strip()
        if not text and not url:
            return types.ServerResult(
                types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text="Missing recipe text or url.",
                        )
                    ],
                    isError=True,
                )
            )
        if url:
            if not _is_safe_url(url):
                return types.ServerResult(
                    types.CallToolResult(
                        content=[
                            types.TextContent(
                                type="text",
                                text="URL not allowed.",
                            )
                        ],
                        isError=True,
                    )
                )
            try:
                async with httpx.AsyncClient(timeout=15) as client:
                    response = await client.get(url)
                    response.raise_for_status()
                    text = _strip_html(response.text)
            except Exception as exc:
                print(f"Error fetching recipe url: {exc}")
                return types.ServerResult(
                    types.CallToolResult(
                        content=[
                            types.TextContent(
                                type="text",
                                text="Failed to fetch recipe url.",
                            )
                        ],
                        isError=True,
                    )
                )
        parsed = await _parse_ingredients_with_openai(text)
        return types.ServerResult(
            types.CallToolResult(
                content=[types.TextContent(type="text", text="Parsed recipe.")],
                structuredContent=parsed,
            )
        )

    if req.params.name == "create_payment_intent":
        args = req.params.arguments or {}
        amount = int(args.get("amount", 0))
        currency = (args.get("currency") or "eur").lower()

        if amount <= 0:
            return types.ServerResult(
                types.CallToolResult(
                    content=[types.TextContent(type="text", text="Invalid amount.")],
                    isError=True,
                )
            )

        payment_method = os.getenv("STRIPE_TEST_PAYMENT_METHOD", "pm_card_visa")
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            payment_method=payment_method,
            confirm=True,
            automatic_payment_methods={"enabled": True, "allow_redirects": "never"},
        )

        return types.ServerResult(
            types.CallToolResult(
                content=[types.TextContent(type="text", text="PaymentIntent created.")],
                structuredContent={
                    "status": intent.status,
                    "payment_intent_id": intent.id,
                },
            )
        )

    widget = WIDGETS_BY_ID.get(req.params.name)
    if widget is None:
        return types.ServerResult(
            types.CallToolResult(
                content=[
                    types.TextContent(
                        type="text",
                        text=f"Unknown tool: {req.params.name}",
                    )
                ],
                isError=True,
            )
        )

    meta = _tool_invocation_meta(widget)

    if widget.identifier == "carousel":
        arguments = req.params.arguments or {}
        limit = arguments.get("limit", 20)
        category = arguments.get("category")
        brand = arguments.get("brand")
        min_price = arguments.get("min_price")
        max_price = arguments.get("max_price")
        try:
            products = database.get_products_from_motherduck(category, brand, min_price, max_price)
        except Exception as e:
            print(f"Error fetching products from MotherDuck: {e}")
            return types.ServerResult(
                types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text="MotherDuck connection failed while fetching products.",
                        )
                    ],
                    isError=True,
                )
            )
        if isinstance(limit, int) and limit > 0:
            products = products[:limit]
        places = [
            product
            for index, product in enumerate(products)
        ]
        return types.ServerResult(
            types.CallToolResult(
                content=[types.TextContent(type="text", text="Fetched products.")],
                structuredContent={"places": places},
                _meta=meta,
            )
        )
    elif widget.identifier == "list":
        arguments = req.params.arguments or {}
        category = arguments.get("category")
        brand = arguments.get("brand")
        min_price = arguments.get("min_price")
        max_price = arguments.get("max_price")
        try:
            products = database.get_products_from_motherduck(category, brand, min_price, max_price, 1)
        except Exception as e:
            print(f"Error fetching products from MotherDuck: {e}")
            return types.ServerResult(
                types.CallToolResult(
                    content=[
                        types.TextContent(
                            type="text",
                            text="MotherDuck connection failed while fetching products.",
                        )
                    ],
                    isError=True,
                )
            )
        places = [
            product
            for index, product in enumerate(products)
        ]
        return types.ServerResult(
            types.CallToolResult(
                content=[types.TextContent(type="text", text="Fetched products.")],
                structuredContent={"places": places},
                _meta=meta,
            )
        )

    return types.ServerResult(
        types.CallToolResult(
            content=[
                types.TextContent(
                    type="text",
                    text=widget.response_text,
                )
            ],
            _meta=meta,
        )
    )

@mcp._mcp_server.call_tool()
async def product_list_tool(req: types.CallToolRequest) -> types.ServerResult:
    products = database.get_products_from_motherduck()
    return types.ServerResult(
        types.CallToolResult(
            content=[types.TextContent(type="text", text="Fetched products.")],
            structuredContent={"products": products},
        )
    )

mcp._mcp_server.request_handlers[types.CallToolRequest] = _call_tool_request
mcp._mcp_server.request_handlers[types.ReadResourceRequest] = _handle_read_resource


app = mcp.streamable_http_app()

# Serve frontend static files when deploying as a single service (e.g. Render).
# MCP routes (/mcp, /mcp/messages) are registered first, so they take precedence.
_FRONTEND_ASSETS = Path(__file__).resolve().parent.parent.parent / "frontend" / "assets"
if _FRONTEND_ASSETS.is_dir():
    from starlette.staticfiles import StaticFiles

    app.mount("/", StaticFiles(directory=str(_FRONTEND_ASSETS), html=True), name="frontend")

try:
    from starlette.middleware.cors import CORSMiddleware

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
        allow_credentials=False,
    )
except Exception:
    pass


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000)
