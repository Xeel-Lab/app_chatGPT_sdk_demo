import type { PurchaseSummary } from "../types";

type PurchaseSummaryCardProps = {
  summary: PurchaseSummary;
  formatCurrency: (value: number, currency?: string) => string;
};

function PurchaseSummaryCard({ summary, formatCurrency }: PurchaseSummaryCardProps) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/80 p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-black/60">
        Riepilogo acquisto
      </h2>
      <p className="mt-2 text-sm text-black/70">
        Grazie per aver acquistato da noi! La consegna è prevista per{" "}
        <span className="font-semibold">{summary.deliveryDate}</span>.
      </p>
      <div className="mt-4 space-y-3">
        {summary.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-black/5 bg-white px-3 py-2 text-sm"
          >
            <div>
              <p className="font-medium text-black/80">{item.name}</p>
              <p className="text-xs text-black/60">Quantità: {item.quantity}</p>
            </div>
            <div className="text-right text-sm font-semibold text-black/70">
              {formatCurrency(item.lineTotal)}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-2 text-sm text-black/70">
        <div className="flex items-center justify-between">
          <span>Subtotale</span>
          <span>{formatCurrency(summary.subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Sconto</span>
          <span>{formatCurrency(summary.discount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Spedizione</span>
          <span>{formatCurrency(summary.shipping)}</span>
        </div>
        <div className="flex items-center justify-between font-semibold text-black">
          <span>Totale</span>
          <span>{formatCurrency(summary.total)}</span>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-black/5 bg-white px-3 py-2 text-sm text-black/70">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/50">
          Dati di fatturazione
        </p>
        <p className="mt-2">{summary.buyer.name || "Cliente"}</p>
        <p>{summary.buyer.email}</p>
        <p>{summary.buyer.address1}</p>
        {summary.buyer.address2 ? <p>{summary.buyer.address2}</p> : null}
        <p>
          {summary.buyer.postalCode} {summary.buyer.city}
        </p>
        <p>{summary.buyer.country}</p>
      </div>
      <p className="mt-4 text-sm text-black/70">
        Se hai bisogno di assistenza, rispondi a questa chat e saremo felici di aiutarti.
      </p>
    </div>
  );
}

export default PurchaseSummaryCard;
