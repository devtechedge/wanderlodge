import { Role } from "./db";

export type SessionUser = {
  id: string;
  role: Role | string;
};

export type ReservationRef = {
  travelerId: string;
  propertyId: string;
};

export type PropertyRef = {
  id: string;
  providerId: string;
};

export const DEMO_ACCOUNTS = [
  { email: "marcus@wanderlodge.com", password: "password123", role: Role.TRAVELER, name: "Marcus Traveler" },
  { email: "evelyn@wanderlodge.com", password: "password123", role: Role.PROVIDER, name: "Evelyn Lodge" },
] as const;

export function isProvider(user: SessionUser | null | undefined): boolean {
  return user?.role === Role.PROVIDER;
}

export function isTraveler(user: SessionUser | null | undefined): boolean {
  return user?.role === Role.TRAVELER;
}

export function canCreateListing(user: SessionUser | null | undefined): boolean {
  return isProvider(user);
}

export function canBookStay(user: SessionUser | null | undefined): boolean {
  return Boolean(user);
}

export function canViewReservation(
  user: SessionUser | null | undefined,
  reservation: ReservationRef,
  properties: PropertyRef[]
): boolean {
  if (!user) return false;
  if (reservation.travelerId === user.id) return true;
  if (!isProvider(user)) return false;
  const property = properties.find((p) => p.id === reservation.propertyId);
  return Boolean(property && property.providerId === user.id);
}

export function oppositeRole(role: Role | string): Role {
  return role === Role.PROVIDER ? Role.TRAVELER : Role.PROVIDER;
}
