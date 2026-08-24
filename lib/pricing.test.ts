import { describe, expect, it } from "vitest";
import {
  countNights,
  datesOverlap,
  gastronomyCost,
  quoteStay,
  serviceFee,
  splitShare,
  nightlySubtotal,
} from "./pricing";

describe("countNights", () => {
  it("returns 1 for a day retreat", () => {
    expect(countNights("2026-08-24", "2026-08-24", true)).toBe(1);
  });

  it("counts exclusive nights between check-in and check-out", () => {
    expect(countNights("2026-08-10", "2026-08-15")).toBe(5);
  });

  it("returns 0 for invalid dates", () => {
    expect(countNights("nope", "2026-08-15")).toBe(0);
  });
});

describe("quoteStay", () => {
  it("applies 50% day-retreat rate plus 10% service fee", () => {
    const quote = quoteStay({
      nightlyPrice: 240,
      startDate: "2026-08-24",
      endDate: "2026-08-24",
      isDayRetreat: true,
    });
    expect(quote.nights).toBe(1);
    expect(quote.nightlySubtotal).toBe(120);
    expect(quote.serviceFee).toBe(12);
    expect(quote.totalPrice).toBe(132);
  });

  it("adds gastronomy upgrades and 30/70 split on partial payment", () => {
    const quote = quoteStay({
      nightlyPrice: 200,
      startDate: "2026-09-01",
      endDate: "2026-09-03",
      upgrades: { pantryOrganicEggs: true, smoresKit: true },
      partialPayment: true,
    });
    expect(quote.nights).toBe(2);
    expect(quote.nightlySubtotal).toBe(400);
    expect(quote.serviceFee).toBe(40);
    expect(quote.upgradesCost).toBe(30);
    expect(quote.totalPrice).toBe(470);
    expect(quote.depositPaid).toBe(141);
    expect(quote.remainingBalance).toBe(329);
  });
});

describe("helpers", () => {
  it("rounds the service fee to cents", () => {
    expect(serviceFee(195)).toBe(19.5);
  });

  it("splits a group expense evenly", () => {
    expect(splitShare(60, 3)).toBe(20);
    expect(splitShare(45, 0)).toBe(0);
  });

  it("detects overlapping stay windows", () => {
    expect(datesOverlap("2026-08-10", "2026-08-15", "2026-08-14", "2026-08-18")).toBe(true);
    expect(datesOverlap("2026-08-10", "2026-08-15", "2026-08-15", "2026-08-18")).toBe(false);
  });

  it("prices only selected pantry items", () => {
    expect(gastronomyCost({ pantryOrganicMilk: true })).toBe(8);
    expect(gastronomyCost({})).toBe(0);
  });

  it("uses half the nightly rate for a day retreat subtotal", () => {
    expect(nightlySubtotal(380, 1, true)).toBe(190);
  });
});
