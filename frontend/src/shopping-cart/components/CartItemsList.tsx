import type { CartItem } from "../../types";
import SafeImage from "../../map/SafeImage.jsx";

type CartItemsListProps = {
  items: CartItem[];
  proxyBaseUrl: string | undefined;
  onSelectItem: (item: CartItem) => void;
  onAdjustQuantity: (id: string, delta: number) => void;
};

function CartItemsList({
  items,
  proxyBaseUrl,
  onSelectItem,
  onAdjustQuantity,
}: CartItemsListProps) {
  if (!items.length) {
    return (
      <div className="rounded-2xl border border-dashed border-black/40 bg-white p-8 text-center">
        <p className="text-base font-medium text-black/70 mb-2">Carrello vuoto</p>
        <p className="text-sm text-black/60">
          Non hai aggiunto nessun articolo al carrello.
          <br />
          Usa i pulsanti "Aggiungi al carrello" nei widget per aggiungere prodotti.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.name}
          className="flex items-center justify-between rounded-2xl border border-black/20 bg-white p-3"
          role="button"
          tabIndex={0}
          aria-label={`View details for ${item.name}`}
          onClick={() => onSelectItem(item)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelectItem(item);
            }
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-white shadow-sm">
              {item.image ? (
                <SafeImage
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  proxyBaseUrl={proxyBaseUrl}
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-black/10" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-black">{item.name}</p>
              <p className="text-xs text-black/60">
                Qty <span className="font-mono">{item.quantity ?? 0}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAdjustQuantity(item.id, -1);
              }}
              className="h-8 w-8 rounded-full border border-black/30 text-lg font-semibold text-black/70 transition hover:bg-white"
              aria-label={`Decrease ${item.name}`}
            >
              -
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAdjustQuantity(item.id, 1);
              }}
              className="h-8 w-8 rounded-full border border-black/30 text-lg font-semibold text-black/70 transition hover:bg-white"
              aria-label={`Increase ${item.name}`}
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default CartItemsList;
