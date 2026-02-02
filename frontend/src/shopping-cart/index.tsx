import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence } from "framer-motion";
import { useCart } from "../use-cart";
import CrossSellSection from "./CrossSellSection";
import type { CartItem } from "../types";
import ProductDetails from "../utils/ProductDetails";
import { useProxyBaseUrl } from "../use-proxy-base-url";
import CartItemsList from "./components/CartItemsList";
import CheckoutModal from "./components/CheckoutModal";
import PurchaseSummaryCard from "./components/PurchaseSummaryCard";
import { computeTotals, formatCurrency, randomDeliveryDate } from "./cart-utils";
import type { PurchaseSummary } from "./types";

function App() {
  const { cartItems, addToCart, removeFromCart, clearCart } = useCart();
  const proxyBaseUrl = useProxyBaseUrl();
  const [selectedItem, setSelectedItem] = useState<CartItem | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutStatus, setCheckoutStatus] = useState<"success" | "cancel" | null>(null);
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [purchaseSummary, setPurchaseSummary] = useState<PurchaseSummary | null>(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const [billingName, setBillingName] = useState("");
  const [billingAddress1, setBillingAddress1] = useState("");
  const [billingAddress2, setBillingAddress2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingPostalCode, setBillingPostalCode] = useState("");
  const [billingCountry, setBillingCountry] = useState("");
  const animationStyles = `
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `;

  function adjustQuantity(id: string, delta: number) {
    if (!id || delta === 0) {
      return;
    }

    if (delta < 0) {
      for (let i = 0; i < Math.abs(delta); i++) {
        removeFromCart(id);
      }
    } else {
      const item = cartItems.find((item) => item.id === id);
      if (item) {
        for (let i = 0; i < delta; i++) {
          addToCart({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            image: item.image,
          });
        }
      }
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const url = new URL(window.location.href);
    const status = url.searchParams.get("checkout");
    if (status === "success" || status === "cancel") {
      setCheckoutStatus(status);
      url.searchParams.delete("checkout");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  function extractStructuredContent(
    response: unknown
  ): Record<string, unknown> | null {
    if (!response) {
      return null;
    }
    if (typeof response === "string") {
      try {
        const parsed = JSON.parse(response) as Record<string, unknown>;
        return extractStructuredContent(parsed);
      } catch {
        return null;
      }
    }
    if (typeof response === "object") {
      const payload = response as Record<string, unknown>;
      if (
        typeof payload.id === "string" ||
        typeof payload.status === "string" ||
        typeof payload.cart === "object" ||
        typeof payload.payment_intent_id === "string"
      ) {
        return payload;
      }
      const structured = payload.structuredContent as Record<string, unknown> | undefined;
      if (structured && typeof structured === "object") {
        return structured;
      }
      if (typeof payload.result === "string") {
        try {
          const parsed = JSON.parse(payload.result) as Record<string, unknown>;
          return extractStructuredContent(parsed);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  async function handleCheckout() {
    if (!window.openai?.callTool) {
      setCheckoutError("callTool non disponibile in questo contesto.");
      return;
    }
    if (cartItems.length === 0) {
      return;
    }
    if (!customerEmail.trim()) {
      setCheckoutError("Inserisci un'email per continuare.");
      return;
    }
    const invalidItem = cartItems.find(
      (item) => !item.price || item.price <= 0 || !item.quantity || item.quantity <= 0
    );
    if (invalidItem) {
      setCheckoutError("Impossibile avviare il pagamento: alcuni articoli non hanno un prezzo valido.");
      return;
    }
    setIsCheckingOut(true);
    setCheckoutError(null);
    try {
      const totalCents = Math.round(
        cartItems.reduce(
          (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1),
          0
        ) * 100
      );
      
      const createResponse = await window.openai.callTool("create_payment_intent", {
        amount: totalCents,
        currency: "eur",
      });
      
      const createStructured = extractStructuredContent(createResponse);
      const status =
        createStructured && typeof createStructured.status === "string"
          ? createStructured.status
          : null;
      
      if (!status) {
        throw new Error(
          `Risposta create_payment_intent non valida: ${JSON.stringify(createResponse)}`
        );
      }

      if (status === "succeeded") {
        const itemsSnapshot = cartItems.map((item) => {
          const quantity = item.quantity ?? 1;
          const unitPrice = item.price ?? 0;
          return {
            id: item.id,
            name: item.name,
            quantity,
            unitPrice,
            lineTotal: unitPrice * quantity,
          };
        });
        const totals = computeTotals(cartItems);
        setPurchaseSummary({
          items: itemsSnapshot,
          subtotal: totals.subtotal,
          discount: totals.discount,
          tax: totals.tax,
          shipping: totals.shipping,
          total: totals.total,
          currency: "EUR",
          buyer: {
            email: customerEmail.trim(),
            name: billingName.trim(),
            address1: billingAddress1.trim(),
            address2: billingAddress2.trim(),
            city: billingCity.trim(),
            postalCode: billingPostalCode.trim(),
            country: billingCountry.trim(),
          },
          deliveryDate: randomDeliveryDate(),
        });
        clearCart();
        setShowBillingModal(false);
        setCheckoutStatus("success");
      } else {
        setCheckoutStatus("cancel");
        throw new Error("Pagamento non riuscito.");
      }
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Errore durante il checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full bg-white text-black bg-white rounded-2xl shadow-sm"
      style={{
        fontFamily: '"Trebuchet MS", "Gill Sans", "Lucida Grande", sans-serif',
      }}
      data-theme="light"
    >
      <style>{animationStyles}</style>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-6 lg:px-8">
        <header
          className="space-y-2"
          style={{ animation: "fadeUp 0.6s ease-out both" }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/60">
            Simple cart
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Il tuo carrello
          </h1>
          <p className="text-sm text-black/70">
            Il carrello contiene solo i prodotti che hai aggiunto tramite i pulsanti "Aggiungi al carrello" nei widget.
          </p>
        </header>

        <div
          className="grid gap-8 lg:grid-cols-[1.4fr_1fr]"
          style={{
            animation: "fadeUp 0.7s ease-out both",
            animationDelay: "80ms",
          }}
        >
          <section className="space-y-4">
            <header className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-widest text-black/70">
                Cart
              </p>
              <span className="text-xs text-black/60">
                {cartItems.length} items
              </span>
            </header>
            {checkoutStatus && (
              <div
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  checkoutStatus === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-200 bg-amber-50 text-amber-700"
                }`}
                role="status"
              >
                {checkoutStatus === "success"
                  ? "Pagamento completato. Grazie per l'acquisto!"
                  : "Pagamento annullato. Puoi riprovare quando vuoi."}
              </div>
            )}
            {purchaseSummary && (
              <PurchaseSummaryCard summary={purchaseSummary} formatCurrency={formatCurrency} />
            )}
            {!purchaseSummary ? (
              <CartItemsList
                items={cartItems}
                proxyBaseUrl={proxyBaseUrl}
                onSelectItem={setSelectedItem}
                onAdjustQuantity={adjustQuantity}
              />
            ) : null}
            {!purchaseSummary && (
              <CrossSellSection
                cartItems={cartItems}
                formatCurrency={formatCurrency}
                onAdd={(item) => {
                  addToCart({
                    id: item.sku,
                    name: item.name,
                    price: item.price,
                    description: item.tags?.join(", ") ?? "",
                    image: item.imageUrl ?? "",
                  });
                }}
              />
            )}
            {!purchaseSummary && (
              <>
                <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 text-sm text-black/70">
                  I prezzi includono IVA. Spedizione:{" "}
                  <span className="font-semibold">
                    {formatCurrency(computeTotals(cartItems).shipping)}
                  </span>{" "}
                  {computeTotals(cartItems).shipping > 0
                    ? "(gratis sopra 50€)"
                    : "(già inclusa)"}
                </div>
                <button
                  type="button"
                  disabled={cartItems.length === 0 || isCheckingOut}
                  onClick={() => setShowBillingModal(true)}
                  className="w-full rounded-2xl border border-black/30 bg-white py-3 text-sm font-semibold text-black/70 transition hover:border-black/50 disabled:cursor-not-allowed disabled:opacity-70"
                  aria-busy={isCheckingOut}
                >
                  {isCheckingOut ? "Apertura checkout..." : "Procedi al pagamento"}
                </button>
                {checkoutError && (
                  <p className="text-xs text-red-600" role="alert">
                    {checkoutError}
                  </p>
                )}
              </>
            )}
          </section>
        </div>
      </div>
      <AnimatePresence>
        <CheckoutModal
          isOpen={showBillingModal && !purchaseSummary}
          isCheckingOut={isCheckingOut}
          checkoutError={checkoutError}
          customerEmail={customerEmail}
          billingName={billingName}
          billingAddress1={billingAddress1}
          billingAddress2={billingAddress2}
          billingCity={billingCity}
          billingPostalCode={billingPostalCode}
          billingCountry={billingCountry}
          onCustomerEmailChange={setCustomerEmail}
          onBillingNameChange={setBillingName}
          onBillingAddress1Change={setBillingAddress1}
          onBillingAddress2Change={setBillingAddress2}
          onBillingCityChange={setBillingCity}
          onBillingPostalCodeChange={setBillingPostalCode}
          onBillingCountryChange={setBillingCountry}
          onClose={() => setShowBillingModal(false)}
          onSubmit={handleCheckout}
        />
        {selectedItem && (
          <ProductDetails
            place={{
              id: selectedItem.id,
              name: selectedItem.name,
              price: `$${selectedItem.price.toFixed(2)}`,
              description: selectedItem.description,
              thumbnail: selectedItem.image,
              stock: selectedItem.stock,
            }}
            onClose={() => setSelectedItem(null)}
            position="modal"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const rootElement = document.getElementById("shopping-cart-root");
if (!rootElement) {
  throw new Error("Missing shopping-cart-root element");
}

createRoot(rootElement).render(<App />);

export { App };
export default App;
