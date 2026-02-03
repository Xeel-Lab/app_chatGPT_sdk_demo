import React from "react";
import "../index.css";
import { createRoot } from "react-dom/client";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import PlaceCard from "./PlaceCard";
import { Button } from "@openai/apps-sdk-ui/components/Button";
import { useOpenAiGlobal } from "../use-openai-global";
import { AnimatePresence } from "framer-motion";
import ProductDetails from "../utils/ProductDetails";
import { useWidgetState } from "../use-widget-state";
import { useProxyBaseUrl } from "../use-proxy-base-url";
import SafeImage from "../map/SafeImage.jsx";
import CompareTable from "../utils/CompareTable";

function App() {
  // Leggi dati da toolOutput (popolato dal server quando recupera dati da MotherDuck)
  const toolOutput = useOpenAiGlobal("toolOutput");
  const places = (toolOutput?.places || []);
  const [selectedPlace, setSelectedPlace] = React.useState(null);
  const [, setWidgetState] = useWidgetState();
  const [isCompareOpen, setIsCompareOpen] = React.useState(false);
  const [isCompareTableOpen, setIsCompareTableOpen] = React.useState(false);
  const [compareSelection, setCompareSelection] = React.useState([]);
  const [compareItemsForTable, setCompareItemsForTable] = React.useState([]);
  const maxCompareItems = 3;
  const proxyBaseUrl = useProxyBaseUrl();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
    containScroll: "trimSnaps",
    slidesToScroll: "auto",
    dragFree: false,
  });
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;
    const updateButtons = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    updateButtons();
    emblaApi.on("select", updateButtons);
    emblaApi.on("reInit", updateButtons);
    return () => {
      emblaApi.off("select", updateButtons);
      emblaApi.off("reInit", updateButtons);
    };
  }, [emblaApi]);

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
    <div className="antialiased relative w-full text-black py-5 bg-[#3D4347] rounded-2xl shadow-sm">
      <div className="absolute right-4 top-4 z-10">
        <Button
          color="secondary"
          variant="solid"
          size="sm"
          onClick={() => setIsCompareOpen(true)}
          disabled={places.length < 2}
        >
          Confronta
        </Button>
      </div>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4 px-4 max-sm:mx-5 items-stretch">
          {places.map((place) => (
            <PlaceCard 
              key={place.id} 
              place={place} 
              onCardClick={setSelectedPlace}
            />
          ))}
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
                      <div className="h-10 w-10 flex-none overflow-hidden rounded-lg bg-black/5">
                        <SafeImage
                          src={place.image}
                          alt={place.name}
                          className="h-full w-full object-cover"
                          proxyBaseUrl={proxyBaseUrl}
                        />
                      </div>
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
            <div className="w-full max-w-5xl max-h-[80vh] overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  className="text-sm text-black/60 hover:text-black"
                  onClick={() => setIsCompareTableOpen(false)}
                >
                  ← Indietro
                </button>
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
      {/* Edge gradients */}
      <div
        aria-hidden
        className={
          "pointer-events-none absolute inset-y-0 left-0 w-3 z-[5] transition-opacity duration-200 " +
          (canPrev ? "opacity-100" : "opacity-0")
        }
      >
        <div
          className="h-full w-full border-l border-black/15 bg-gradient-to-r from-black/10 to-transparent"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
          }}
        />
      </div>
      <div
        aria-hidden
        className={
          "pointer-events-none absolute inset-y-0 right-0 w-3 z-[5] transition-opacity duration-200 " +
          (canNext ? "opacity-100" : "opacity-0")
        }
      >
        <div
          className="h-full w-full border-r border-black/15 bg-gradient-to-l from-black/10 to-transparent"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, white 30%, white 70%, transparent 100%)",
          }}
        />
      </div>
      {canPrev && (
        <Button
          aria-label="Previous"
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
          color="secondary"
          size="sm"
          variant="solid"
          uniform
          onClick={() => emblaApi && emblaApi.scrollPrev()}
          type="button"
        >
          <ArrowLeft
            strokeWidth={1.5}
            className="h-4.5 w-4.5"
            aria-hidden="true"
          />
        </Button>
      )}
      {canNext && (
        <Button
          aria-label="Next"
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 shadow-lg"
          color="secondary"
          size="sm"
          variant="solid"
          uniform
          onClick={() => emblaApi && emblaApi.scrollNext()}
          type="button"
        >
          <ArrowRight
            strokeWidth={1.5}
            className="h-4.5 w-4.5"
            aria-hidden="true"
          />
        </Button>
      )}
    </div>
  );
}

createRoot(document.getElementById("carousel-root")).render(<App />);

export { App };
export default App;
