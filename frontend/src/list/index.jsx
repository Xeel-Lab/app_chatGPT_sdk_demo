import React from "react";
import { createRoot } from "react-dom/client";
import { PlusCircle, Star, ShoppingCart } from "lucide-react";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { Image } from "@openai/apps-sdk-ui/components/Image";
import { useOpenAiGlobal } from "../use-openai-global";
import { useWidgetState } from "../use-widget-state";
import { useCart } from "../use-cart";
import { AnimatePresence } from "framer-motion";
import ProductDetails from "../utils/ProductDetails";
import CompareTable from "../utils/CompareTable";

function App() {
  // Leggi dati da toolOutput (popolato dal server quando recupera dati da MotherDuck)
  const toolOutput = useOpenAiGlobal("toolOutput");
  const places = toolOutput?.places || [];
  const { addToCart, isInCart } = useCart();
  const [selectedPlace, setSelectedPlace] = React.useState(null);
  const [, setWidgetState] = useWidgetState();
  const [isCompareOpen, setIsCompareOpen] = React.useState(false);
  const [isCompareTableOpen, setIsCompareTableOpen] = React.useState(false);
  const [compareSelection, setCompareSelection] = React.useState([]);
  const [compareItemsForTable, setCompareItemsForTable] = React.useState([]);
  const maxCompareItems = 3;

  const handleAddToCart = (place) => {
    addToCart({
      id: place.id,
      name: place.name,
      price: place.price,
      description: place.description,
      thumbnail: place.image,
    });
  };

  const handleAddAllToCart = () => {
    places.forEach((place) => {
      if (isInCart(place.id)) {
        return;
      }
      addToCart({
        id: place.id,
        name: place.name,
        price: place.price,
        description: place.description,
        thumbnail: place.image,
      });
    });
  };

  const allInCart = places.length > 0 && places.every((place) => isInCart(place.id));
  const selectedCompareItems = places.filter((place) =>
    compareSelection.includes(place.id)
  );
  const canOpenCompare = compareSelection.length >= 2;

  const toggleCompareSelection = (placeId) => {
    if (!placeId) return;
    setCompareSelection((prev) => {
      if (prev.includes(placeId)) {
        return prev.filter((id) => id !== placeId);
      }
      if (prev.length >= maxCompareItems) {
        return prev;
      }
      return [...prev, placeId];
    });
  };

  const openCompareWidget = async () => {
    if (!canOpenCompare) return;
    setWidgetState({
      compareWidget: {
        items: selectedCompareItems,
      },
    });
    setCompareItemsForTable(selectedCompareItems);
    setIsCompareTableOpen(true);
    setIsCompareOpen(false);
    setCompareSelection([]);
  };

  return (
    <div className="antialiased w-full text-black px-4 pb-2 border border-black/10 rounded-2xl sm:rounded-3xl overflow-hidden bg-white rounded-2xl shadow-sm">
      <div className="max-w-full">
        <div className="flex flex-row items-center gap-4 sm:gap-4 border-b border-black/5 py-4">
          <div>
            <div className="text-base sm:text-xl font-medium">
              Product List
            </div>
            <div className="text-sm text-black/60">
              A list of the best products available
            </div>
          </div>
          <div className="flex-auto hidden sm:flex justify-end pr-2 gap-2">
            <Button
              color="secondary"
              variant="ghost"
              size="md"
              onClick={() => setIsCompareOpen(true)}
              disabled={places.length < 2}
            >
              Confronta
            </Button>
            <Button
              color="primary"
              variant="solid"
              size="md"
              onClick={handleAddAllToCart}
              disabled={places.length === 0 || allInCart}
            >
              Compra tutto
            </Button>
          </div>
        </div>
        <div className="min-w-full text-sm flex flex-col">
          {places.map((place, i) => (
            <div
              key={place.id}
              className="px-3 -mx-2 rounded-2xl hover:bg-black/5 cursor-pointer"
              onClick={(e) => {
                // Non aprire i dettagli se si clicca sul pulsante "Aggiungi al carrello" o sul selettore quantità
                if (e.target && e.target.closest && (e.target.closest('button') || e.target.closest('input'))) {
                  return;
                }
                setSelectedPlace(place);
              }}
            >
              <div
                style={{
                  borderBottom:
                    i === 7 - 1 ? "none" : "1px solid rgba(0, 0, 0, 0.05)",
                }}
                className="flex w-full items-center hover:border-black/0! gap-2"
              >
                <div className="py-3 pr-3 min-w-0 w-full sm:w-3/5">
                  <div className="flex items-center gap-3">
                    <Image
                      src={place.image}
                      alt={place.name}
                      className="h-10 w-10 sm:h-11 sm:w-11 rounded-lg object-cover ring ring-black/5"
                    />
                    <div className="w-3 text-end sm:block hidden text-sm text-black/40">
                      {i + 1}
                    </div>
                    <div className="min-w-0 sm:pl-1 flex flex-col items-start h-full">
                      <div className="font-medium text-sm sm:text-md truncate max-w-[40ch]">
                        {place.name}
                      </div>
                      <div className="mt-1 sm:mt-0.25 flex items-center gap-3 text-black/70 text-sm">
                        <div className="flex items-center gap-1">
                          <Star
                            strokeWidth={1.5}
                            className="h-3 w-3 text-black"
                          />
                          <span>
                            {place.rating?.toFixed
                              ? place.rating.toFixed(1)
                              : place.rating}
                          </span>
                        </div>
                        {place.price && (
                          <div className="whitespace-nowrap">{place.price} €</div>
                        )}
                        <div className="whitespace-nowrap sm:hidden">
                          {place.city || "–"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:block text-end py-2 px-3 text-sm text-black/60 whitespace-nowrap flex-auto">
                  {place.city || "–"}
                </div>
                <div className="py-2 whitespace-nowrap flex justify-end">
                  <Button
                    aria-label={isInCart(place.id) ? `${place.name} già nel carrello` : `Aggiungi ${place.name} al carrello`}
                    color={isInCart(place.id) ? "primary" : "secondary"}
                    variant={isInCart(place.id) ? "soft" : "ghost"}
                    size="sm"
                    uniform
                    onClick={() => handleAddToCart(place)}
                    disabled={isInCart(place.id)}
                    className={
                      isInCart(place.id)
                        ? undefined
                        : "!bg-sky-200 !text-slate-900 hover:!bg-sky-300"
                    }
                  >
                    {isInCart(place.id) ? (
                      <ShoppingCart strokeWidth={1.5} className="h-5 w-5" />
                    ) : (
                      <PlusCircle strokeWidth={1.5} className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {places.length === 0 && (
            <div className="py-6 text-center text-black/60">
              No products found.
            </div>
          )}
        </div>
        <div className="sm:hidden px-0 pt-2 pb-2">
          <div className="flex gap-2">
            <Button
              color="secondary"
              variant="ghost"
              size="md"
              block
              onClick={() => setIsCompareOpen(true)}
              disabled={places.length < 2}
            >
              Confronta
            </Button>
            <Button
              color="primary"
              variant="solid"
              size="md"
              block
              onClick={handleAddAllToCart}
              disabled={places.length === 0 || allInCart}
            >
              Compra tutto
            </Button>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isCompareOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Confronta prodotti"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsCompareOpen(false);
              }
            }}
          >
            <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-lg font-semibold">Confronta prodotti</div>
                  <div className="text-xs text-black/60">
                    Seleziona da 2 a {maxCompareItems} prodotti.
                  </div>
                </div>
                <button
                  type="button"
                  className="text-sm text-black/60 hover:text-black"
                  onClick={() => setIsCompareOpen(false)}
                >
                  Chiudi
                </button>
              </div>
              <div className="mt-4 max-h-72 overflow-y-auto space-y-2">
                {places.map((place) => {
                  const checked = compareSelection.includes(place.id);
                  const disabled =
                    !checked && compareSelection.length >= maxCompareItems;
                  return (
                    <label
                      key={place.id}
                      className={`flex items-center gap-3 rounded-xl border px-3 py-2 ${
                        checked ? "border-black/40 bg-black/5" : "border-black/10"
                      } ${disabled ? "opacity-50" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleCompareSelection(place.id)}
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {place.name}
                        </div>
                        <div className="text-xs text-black/60 truncate">
                          {place.price ? `${place.price} €` : "Prezzo non disponibile"}
                        </div>
                      </div>
                    </label>
                  );
                })}
                {places.length === 0 && (
                  <div className="text-sm text-black/60 text-center py-6">
                    Nessun prodotto disponibile.
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-black/60">
                  Selezionati: {compareSelection.length}/{maxCompareItems}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    color="secondary"
                    size="sm"
                    onClick={() => setIsCompareOpen(false)}
                  >
                    Annulla
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    onClick={openCompareWidget}
                    disabled={!canOpenCompare}
                  >
                    Apri confronto
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {isCompareTableOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Confronto prodotti"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsCompareTableOpen(false);
              }
            }}
          >
            <div className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="text-lg font-semibold">Confronto prodotti</div>
                <button
                  type="button"
                  className="text-sm text-black/60 hover:text-black"
                  onClick={() => setIsCompareTableOpen(false)}
                >
                  Chiudi
                </button>
              </div>
              <div className="mt-4">
                <CompareTable items={compareItemsForTable} />
              </div>
            </div>
          </div>
        )}
        {selectedPlace && (
          <ProductDetails
            place={selectedPlace}
            onClose={() => setSelectedPlace(null)}
            position="modal"
            relatedSourceItems={places}
            onSelectRelated={(item) => setSelectedPlace(item)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

createRoot(document.getElementById("list-root")).render(<App />);

export { App };
export default App;
