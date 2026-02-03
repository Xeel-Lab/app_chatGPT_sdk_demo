import React from "react";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { useProxyBaseUrl } from "../use-proxy-base-url";
import { useCart } from "../use-cart";
import SafeImage from "../map/SafeImage.jsx";

function CompareTable({ items }) {
  const proxyBaseUrl = useProxyBaseUrl();
  const { addToCart, isInCart } = useCart();

  const compareItems = Array.isArray(items) ? items.slice(0, 3) : [];

  const formatPrice = (price) => {
    if (typeof price === "number" && Number.isFinite(price)) {
      return `${price.toFixed(2)} €`;
    }
    if (typeof price === "string" && price.trim()) {
      return price.includes("€") ? price : `${price} €`;
    }
    return "—";
  };

  const getRating = (item) => {
    const value = item?.rate;
    if (value == null || Number.isNaN(Number(value))) {
      return "—";
    }
    return Number(value).toFixed(1);
  };

  if (compareItems.length < 2) {
    return (
      <div className="rounded-2xl border border-black/10 bg-white p-6 text-black">
        <h2 className="text-lg font-semibold">Confronto prodotti</h2>
        <p className="mt-2 text-sm text-black/60">
          Seleziona almeno 2 prodotti per aprire il confronto.
        </p>
      </div>
    );
  }

  const rows = [
    {
      label: "Nome",
      render: (item) => <span className="font-medium">{item.name || "—"}</span>,
    },
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
      label: "Prezzo",
      render: (item) => formatPrice(item.price),
    },
    {
      label: "Rating",
      render: (item) => <span>{getRating(item)}</span>,
    },
    {
      label: "Pro",
      render: (item) => (
        <span className="text-sm text-black/70">{item.pro || "—"}</span>
      ),
    },
    {
      label: "Contro",
      render: (item) => (
        <span className="text-sm text-black/70">{item.contro || "—"}</span>
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
    <div className="rounded-2xl border border-black/10 bg-white p-6 text-black">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Confronto prodotti</h2>
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

export default CompareTable;
