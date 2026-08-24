export const SERVICE_FEE_RATE = 0.1;
export const DAY_RETREAT_RATE = 0.5;
export const DEPOSIT_RATE = 0.3;

export const GASTRONOMY_PRICES = {
  pantryOrganicEggs: 12,
  pantryOrganicMilk: 8,
  pantryFreshProduce: 25,
  smoresKit: 18,
} as const;

export type GastronomyKey = keyof typeof GASTRONOMY_PRICES;
export type GastronomyUpgrades = Partial<Record<GastronomyKey, boolean>>;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function countNights(startDate: string, endDate: string, isDayRetreat = false): number {
  if (isDayRetreat) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY));
}

export function nightlySubtotal(nightlyPrice: number, nights: number, isDayRetreat = false): number {
  if (nights <= 0) return 0;
  if (isDayRetreat) return Math.round(nightlyPrice * DAY_RETREAT_RATE);
  return nightlyPrice * nights;
}

export function serviceFee(subtotal: number): number {
  return parseFloat((subtotal * SERVICE_FEE_RATE).toFixed(2));
}

export function gastronomyCost(upgrades: GastronomyUpgrades | undefined): number {
  if (!upgrades) return 0;
  let total = 0;
  (Object.keys(GASTRONOMY_PRICES) as GastronomyKey[]).forEach((key) => {
    if (upgrades[key]) total += GASTRONOMY_PRICES[key];
  });
  return total;
}

export function splitShare(amount: number, people: number): number {
  if (people <= 0) return 0;
  return parseFloat((amount / people).toFixed(2));
}

export function datesOverlap(
  startA: string | Date,
  endA: string | Date,
  startB: string | Date,
  endB: string | Date
): boolean {
  const aStart = new Date(startA).getTime();
  const aEnd = new Date(endA).getTime();
  const bStart = new Date(startB).getTime();
  const bEnd = new Date(endB).getTime();
  if ([aStart, aEnd, bStart, bEnd].some(Number.isNaN)) return false;
  return aStart < bEnd && aEnd > bStart;
}

export type StayQuote = {
  nights: number;
  nightlySubtotal: number;
  serviceFee: number;
  upgradesCost: number;
  totalPrice: number;
  depositPaid: number;
  remainingBalance: number;
};

export function quoteStay(input: {
  nightlyPrice: number;
  startDate: string;
  endDate: string;
  isDayRetreat?: boolean;
  upgrades?: GastronomyUpgrades;
  partialPayment?: boolean;
}): StayQuote {
  const isDayRetreat = Boolean(input.isDayRetreat);
  const nights = countNights(input.startDate, input.endDate, isDayRetreat);
  const subtotal = nightlySubtotal(input.nightlyPrice, nights, isDayRetreat);
  const fee = serviceFee(subtotal);
  const upgradesCost = gastronomyCost(input.upgrades);
  const totalPrice = parseFloat((subtotal + fee + upgradesCost).toFixed(2));
  const depositPaid = input.partialPayment
    ? parseFloat((totalPrice * DEPOSIT_RATE).toFixed(2))
    : totalPrice;
  const remainingBalance = input.partialPayment
    ? parseFloat((totalPrice * (1 - DEPOSIT_RATE)).toFixed(2))
    : 0;

  return {
    nights,
    nightlySubtotal: subtotal,
    serviceFee: fee,
    upgradesCost,
    totalPrice,
    depositPaid,
    remainingBalance,
  };
}
