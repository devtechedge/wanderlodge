import { describe, expect, it } from "vitest";
import { filterProperties, filtersFromSearchParams } from "./filters";
import { getInitialDB } from "./db";

describe("filtersFromSearchParams", () => {
  it("parses CSV amenities and boolean flags", () => {
    const filters = filtersFromSearchParams(
      new URLSearchParams("amenities=Waterfront,Kitchen&evCharging=true&minEcoScore=90")
    );
    expect(filters.amenities).toEqual(["waterfront", "kitchen"]);
    expect(filters.evCharging).toBe(true);
    expect(filters.minEcoScore).toBe(90);
  });
});

describe("filterProperties", () => {
  const lodges = getInitialDB().properties;

  it("matches location against title, location, or description", () => {
    const hits = filterProperties(lodges, { location: "pinecrest" });
    expect(hits.map((p) => p.id)).toEqual(["prop-1"]);
  });

  it("filters by guest capacity and nightly price", () => {
    const hits = filterProperties(lodges, { guests: 6, maxPrice: 400 });
    expect(hits.every((p) => p.maxGuests >= 6 && p.price <= 400)).toBe(true);
  });

  it("requires every requested amenity", () => {
    const hits = filterProperties(lodges, { amenities: ["waterfront"] });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((p) => p.amenities.map((a) => a.toLowerCase()).includes("waterfront"))).toBe(true);
  });

  it("keeps fragrance-free lodges only", () => {
    const hits = filterProperties(lodges, { fragranceFreeRequired: true });
    expect(hits.length).toBe(lodges.length);
  });
});
