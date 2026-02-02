type CheckoutModalProps = {
  isOpen: boolean;
  isCheckingOut: boolean;
  checkoutError: string | null;
  customerEmail: string;
  billingName: string;
  billingAddress1: string;
  billingAddress2: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  onCustomerEmailChange: (value: string) => void;
  onBillingNameChange: (value: string) => void;
  onBillingAddress1Change: (value: string) => void;
  onBillingAddress2Change: (value: string) => void;
  onBillingCityChange: (value: string) => void;
  onBillingPostalCodeChange: (value: string) => void;
  onBillingCountryChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

function CheckoutModal({
  isOpen,
  isCheckingOut,
  checkoutError,
  customerEmail,
  billingName,
  billingAddress1,
  billingAddress2,
  billingCity,
  billingPostalCode,
  billingCountry,
  onCustomerEmailChange,
  onBillingNameChange,
  onBillingAddress1Change,
  onBillingAddress2Change,
  onBillingCityChange,
  onBillingPostalCodeChange,
  onBillingCountryChange,
  onClose,
  onSubmit,
}: CheckoutModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Dati per il checkout"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/60">
            Dati per il checkout
          </p>
          <button
            type="button"
            className="rounded-full border border-black/10 px-2 py-1 text-xs text-black/60 hover:border-black/30"
            onClick={onClose}
          >
            Chiudi
          </button>
        </div>
        <div className="mt-4 grid gap-3">
          <label className="text-xs font-semibold text-black/70">
            Email
            <input
              type="email"
              value={customerEmail}
              onChange={(event) => onCustomerEmailChange(event.target.value)}
              placeholder="nome@esempio.com"
              className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm"
              required
            />
          </label>
          <label className="text-xs font-semibold text-black/70">
            Nome e cognome (fatturazione)
            <input
              type="text"
              value={billingName}
              onChange={(event) => onBillingNameChange(event.target.value)}
              placeholder="Mario Rossi"
              className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-black/70">
            Indirizzo
            <input
              type="text"
              value={billingAddress1}
              onChange={(event) => onBillingAddress1Change(event.target.value)}
              placeholder="Via Roma 1"
              className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs font-semibold text-black/70">
            Indirizzo (opzionale)
            <input
              type="text"
              value={billingAddress2}
              onChange={(event) => onBillingAddress2Change(event.target.value)}
              placeholder="Scala, interno, ecc."
              className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-black/70">
              Città
              <input
                type="text"
                value={billingCity}
                onChange={(event) => onBillingCityChange(event.target.value)}
                placeholder="Milano"
                className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-semibold text-black/70">
              CAP
              <input
                type="text"
                value={billingPostalCode}
                onChange={(event) => onBillingPostalCodeChange(event.target.value)}
                placeholder="20100"
                className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="text-xs font-semibold text-black/70">
            Paese
            <input
              type="text"
              value={billingCountry}
              onChange={(event) => onBillingCountryChange(event.target.value)}
              placeholder="IT"
              className="mt-1 w-full rounded-xl border border-black/20 px-3 py-2 text-sm"
            />
          </label>
        </div>
        {checkoutError && (
          <p className="mt-3 text-xs text-red-600" role="alert">
            {checkoutError}
          </p>
        )}
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-xl border border-black/20 px-4 py-2 text-xs text-black/60"
            onClick={onClose}
          >
            Annulla
          </button>
          <button
            type="button"
            disabled={isCheckingOut}
            onClick={onSubmit}
            className="rounded-xl border border-black/30 bg-black px-4 py-2 text-xs font-semibold text-white disabled:opacity-70"
            aria-busy={isCheckingOut}
          >
            {isCheckingOut ? "Pagamento in corso..." : "Conferma e paga"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;
