const MARKUP_PERCENT = Number(process.env.MARKUP_PERCENT || 10);

export function applyMarkup(amount) {
  const base = parseFloat(amount);
  const withMarkup = base * (1 + MARKUP_PERCENT / 100);
  return withMarkup.toFixed(2);
}

export async function getExchangeRate(fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return 1;
  try {
    const res = await fetch(`https://open.er-api.com/v6/latest/${fromCurrency}`);
    const data = await res.json();
    return data?.rates?.[toCurrency] || null;
  } catch {
    return null;
  }
}
