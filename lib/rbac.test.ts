import { describe, expect, it } from "vitest";
import {
  canBookStay,
  canCreateListing,
  canViewReservation,
  DEMO_ACCOUNTS,
  isProvider,
  isTraveler,
  oppositeRole,
} from "./rbac";
import { Role } from "./db";

const traveler = { id: "user-2", role: Role.TRAVELER };
const provider = { id: "user-1", role: Role.PROVIDER };
const properties = [{ id: "prop-1", providerId: "user-1" }];
const reservation = { travelerId: "user-2", propertyId: "prop-1" };

describe("rbac", () => {
  it("treats only providers as listing authors", () => {
    expect(canCreateListing(provider)).toBe(true);
    expect(canCreateListing(traveler)).toBe(false);
    expect(canCreateListing(null)).toBe(false);
  });

  it("lets any signed-in user start a booking", () => {
    expect(canBookStay(traveler)).toBe(true);
    expect(canBookStay(provider)).toBe(true);
    expect(canBookStay(null)).toBe(false);
  });

  it("lets the traveler and the lodge provider see a reservation", () => {
    expect(canViewReservation(traveler, reservation, properties)).toBe(true);
    expect(canViewReservation(provider, reservation, properties)).toBe(true);
    expect(canViewReservation({ id: "user-9", role: Role.TRAVELER }, reservation, properties)).toBe(false);
    expect(canViewReservation({ id: "user-9", role: Role.PROVIDER }, reservation, properties)).toBe(false);
  });

  it("flips traveler and provider for the demo switcher", () => {
    expect(oppositeRole(Role.TRAVELER)).toBe(Role.PROVIDER);
    expect(oppositeRole(Role.PROVIDER)).toBe(Role.TRAVELER);
    expect(isProvider(provider)).toBe(true);
    expect(isTraveler(traveler)).toBe(true);
  });

  it("documents the public demo passwords", () => {
    expect(DEMO_ACCOUNTS).toHaveLength(2);
    expect(DEMO_ACCOUNTS.every((account) => account.password === "password123")).toBe(true);
  });
});
