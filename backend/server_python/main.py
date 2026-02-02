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
import os
import stripe
from copy import deepcopy
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

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

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

@dataclass(frozen=True)
class Widget:
    identifier: str
    title: str
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
        template_uri="ui://widget/carousel.html",
        invoking="Carousel some spots",
        invoked="Served a fresh carousel",
        html=_load_widget_html("carousel"),
        response_text="Rendered a carousel!",
    ),
    Widget(
        identifier="list",
        title="Show List of Products",
        template_uri="ui://widget/list.html",
        invoking="List some spots",
        invoked="Show a list of products",
        html=_load_widget_html("list"),
        response_text="Showed a list of products!",
    ),
    Widget(
        identifier="shopping-cart",
        title="Shopping Cart",
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

def get_motherduck_connection() -> duckdb.DuckDBPyConnection:
    md_token = os.getenv("motherduck_token")
    if not md_token:
        raise ValueError("motherduck_token non trovato nelle variabili d'ambiente")
    connection = duckdb.connect(f"md:electronics_demo?motherduck_token={md_token}")
    print("Connected to MotherDuck")
    return connection

def get_products_from_motherduck(
    category: list[str],
    context: list[str],
    brand: str,
    min_price: float,
    max_price: float,
    limit_per_category: int | None = None,
) -> list[dict]:
    query = "SELECT * FROM main.products"
    if category:
        in_list = f", ".join(f"'{c}'" for c in category)
        # match if categories IN list OR description contains at least one term (case-insensitive)
        desc_escaped = [c.replace("'", "''") for c in category]
        desc_conditions = " OR ".join(f"description ILIKE '%{t}%'" for t in desc_escaped)
        query += f" WHERE (categories COLLATE \"NOCASE\" IN ({in_list}) OR ({desc_conditions}))"
    if context:
        in_list = f", ".join(f"'{c}'" for c in context)
        desc_escaped = [c.replace("'", "''") for c in context]
        desc_conditions = " OR ".join(f"context ILIKE '%{t}%'" for t in desc_escaped)
        query += "WHERE" in query and f" OR (context COLLATE \"NOCASE\" IN ({in_list}) OR ({desc_conditions}))" or f" WHERE (context COLLATE \"NOCASE\" IN ({in_list} OR ({desc_conditions}))"
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
        return df.to_dict(orient="records")

mcp = FastMCP(
    name="mcp-python",
    stateless_http=True,
    transport_security=_transport_security_settings(),
)

TOOL_INPUT_SCHEMA: Dict[str, Any] = {
    "type": "object",
    "properties": {
        "limit": {
            "type": "integer",
            "description": "Max number of products to return.",
            "minimum": 1,
        },
        "context": {
            "type": "array",
            "items": {"type": "string"},
            "description": "The context where the products can be used, e.g. 'home', 'office', 'kitchen', 'bathroom', 'bedroom', 'living room', 'dining room', 'office', 'study', 'library', 'garage', 'garden', 'pool', 'spa', 'etc.'. You MUST pass it at least in english and italian. Include plural, singular, different languages, spacing variants�every term.",
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
                inputSchema=deepcopy(TOOL_INPUT_SCHEMA),
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
            title="Expose prompts",
            description="Returns developer_core.md and runtime_context.md",
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

async def _call_tool_request(req: types.CallToolRequest) -> types.ServerResult:
    if req.params.name == "min":
        developer_core = _load_prompt_text(DEVELOPER_CORE_PATH)
        runtime_context = _load_prompt_text(RUNTIME_CONTEXT_PATH)
        return types.ServerResult(
            types.CallToolResult(
                content=[types.TextContent(type="text", text="Loaded prompts.")],
                structuredContent={
                    "developer_core": developer_core,
                    "runtime_context": runtime_context,
                },
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
        context = arguments.get("context")
        category = arguments.get("category")
        brand = arguments.get("brand")
        min_price = arguments.get("min_price")
        max_price = arguments.get("max_price")
        try:
            products = get_products_from_motherduck(category, context, brand, min_price, max_price)
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
        context = arguments.get("context")
        category = arguments.get("category")
        brand = arguments.get("brand")
        min_price = arguments.get("min_price")
        max_price = arguments.get("max_price")
        try:
            products = get_products_from_motherduck(category, context, brand, min_price, max_price, 1)
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
    products = get_products_from_motherduck()
    return types.ServerResult(
        types.CallToolResult(
            content=[types.TextContent(type="text", text="Fetched products.")],
            structuredContent={"products": products},
        )
    )

mcp._mcp_server.request_handlers[types.CallToolRequest] = _call_tool_request
mcp._mcp_server.request_handlers[types.ReadResourceRequest] = _handle_read_resource


app = mcp.streamable_http_app()

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
