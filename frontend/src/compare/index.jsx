import React from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { useOpenAiGlobal } from "../use-openai-global";
import { useProxyBaseUrl } from "../use-proxy-base-url";
import { useCart } from "../use-cart";
import SafeImage from "../map/SafeImage.jsx";

function App() {
  const widgetState = useOpenAiGlobal("widgetState");
  const toolOutput = useOpenAiGlobal("toolOutput");
  const proxyBaseUrl = useProxyBaseUrl();
  const { addToCart, isInCart } = useCart();

  const compareItems = Array.isArray(toolOutput?.items)
    ? toolOutput.items.slice(0, 3)
    : Array.isArray(widgetState?.compareWidget?.items)
      ? widgetState.compareWidget.items.slice(0, 3)
      : [];

  const formatPrice = (price) => {
    if (typeof price === "number" && Number.isFinite(price)) {
      return `${price.toFixed(2)} €`;
    }
    if (typeof price === "string" && price.trim()) {
      return price.includes("€") ? price : `${price} €`;
    }
    return "—";
  };

  if (compareItems.length < 2) {
    return (
      <div className="antialiased w-full rounded-2xl border border-black/10 bg-white p-6 text-black shadow-sm">
        <h1 className="text-xl font-semibold">Confronto prodotti</h1>
        <p className="mt-2 text-sm text-black/60">
          Seleziona almeno 2 prodotti dal widget Lista o Carosello per aprire il confronto.
        </p>
      </div>
    );
  }

  const rows = [
    {
      label: "Immagine",
      render: (item) => (
        <div className="h-20 w-20 overflow-hidden rounded-xl bg-black/5">
          <SafeImage
            src={item.image || item.thumbnail || ""}
            alt={item.name}
            className="h-full w-full object-cover"
            proxyBaseUrl={proxyBaseUrl}
          />
        </div>
      ),
    },
    {
      label: "Nome",
      render: (item) => <span className="font-medium">{item.name || "—"}</span>,
    },
    {
      label: "Prezzo",
      render: (item) => formatPrice(item.price),
    },
    {
      label: "Rating",
      render: (item) =>
        item.rating != null ? (
          <span>{Number(item.rating).toFixed(1)}</span>
        ) : (
          "—"
        ),
    },
    {
      label: "Descrizione",
      render: (item) => (
        <span className="text-sm text-black/70">
          {item.description || "—"}
        </span>
      ),
    },
    {
      label: "Carrello",
      render: (item) => (
        <Button
          size="sm"
          color={isInCart(item.id) ? "primary" : "secondary"}
          variant={isInCart(item.id) ? "soft" : "solid"}
          onClick={() =>
            addToCart({
              id: item.id,
              name: item.name,
              price: item.price,
              description: item.description,
              thumbnail: item.image || item.thumbnail,
            })
          }
          disabled={isInCart(item.id)}
        >
          {isInCart(item.id) ? "Nel carrello" : "Aggiungi"}
        </Button>
      ),
    },
  ];

  return (
    <div className="antialiased w-full rounded-2xl border border-black/10 bg-white p-6 text-black shadow-sm">
      <div className="mb-4">
        <h1 className="text-xl font-semibold">Confronto prodotti</h1>
        <p className="text-sm text-black/60">
          Confronto tra {compareItems.length} prodotti selezionati.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left font-semibold text-black/70 pb-2 pr-4">
                Caratteristica
              </th>
              {compareItems.map((item) => (
                <th key={item.id} className="text-left font-semibold pb-2 pr-4">
                  {item.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="align-top">
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-black/5">
                <td className="py-3 pr-4 text-xs font-semibold uppercase text-black/60">
                  {row.label}
                </td>
                {compareItems.map((item) => (
                  <td key={item.id} className="py-3 pr-4">
                    {row.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

createRoot(document.getElementById("compare-root")).render(<App />);

export { App };
export default App;
