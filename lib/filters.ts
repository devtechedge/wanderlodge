import type { Property } from "./db";

export type PropertyFilters = {
  location?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  evCharging?: boolean;
  minEcoScore?: number;
  ecoAmenities?: string[];
  decibelAtmosphere?: string[];
  minAstroScore?: number;
  enclosedYardRequired?: boolean;
  minFenceHeight?: number;
  ergonomicWorkstationRequired?: boolean;
  minUploadSpeed?: number;
  stoveRequired?: boolean;
  minSolitudeIndex?: number;
  waterfrontSafetySteepness?: string[];
  maxSeasonalAccessDifficulty?: string[];
  fragranceFreeRequired?: boolean;
  poolMechanicsType?: string[];
};

function csv(value: string | null): string[] {
  if (!value || value.trim() === "") return [];
  return value.split(",").map((part) => part.trim().toLowerCase()).filter(Boolean);
}

function num(value: string | null): number | undefined {
  if (value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function filtersFromSearchParams(searchParams: URLSearchParams): PropertyFilters {
  return {
    location: searchParams.get("location")?.trim() || undefined,
    guests: num(searchParams.get("guests")),
    minPrice: num(searchParams.get("minPrice")),
    maxPrice: num(searchParams.get("maxPrice")),
    amenities: csv(searchParams.get("amenities")),
    evCharging: searchParams.get("evCharging") === "true",
    minEcoScore: num(searchParams.get("minEcoScore")),
    ecoAmenities: csv(searchParams.get("ecoAmenities")),
    decibelAtmosphere: csv(searchParams.get("decibelAtmosphere")),
    minAstroScore: num(searchParams.get("minAstroScore")),
    enclosedYardRequired: searchParams.get("enclosedYardRequired") === "true",
    minFenceHeight: num(searchParams.get("minFenceHeight")),
    ergonomicWorkstationRequired: searchParams.get("ergonomicWorkstationRequired") === "true",
    minUploadSpeed: num(searchParams.get("minUploadSpeed")),
    stoveRequired: searchParams.get("stoveRequired") === "true",
    minSolitudeIndex: num(searchParams.get("minSolitudeIndex")),
    waterfrontSafetySteepness: csv(searchParams.get("waterfrontSafetySteepness")),
    maxSeasonalAccessDifficulty: csv(searchParams.get("maxSeasonalAccessDifficulty")),
    fragranceFreeRequired: searchParams.get("fragranceFreeRequired") === "true",
    poolMechanicsType: csv(searchParams.get("poolMechanicsType")),
  };
}

export function filterProperties(properties: Property[], filters: PropertyFilters): Property[] {
  return properties.filter((p) => {
    if (filters.location) {
      const loc = filters.location.toLowerCase();
      const hit =
        p.location.toLowerCase().includes(loc) ||
        p.title.toLowerCase().includes(loc) ||
        p.description.toLowerCase().includes(loc);
      if (!hit) return false;
    }

    if (filters.guests !== undefined && p.maxGuests < filters.guests) return false;
    if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;

    if (filters.amenities && filters.amenities.length > 0) {
      const have = p.amenities.map((a) => a.toLowerCase());
      if (!filters.amenities.every((req) => have.includes(req))) return false;
    }

    if (filters.evCharging && p.hasEVCharging !== true) return false;
    if (filters.minEcoScore !== undefined && (p.ecoScore || 0) < filters.minEcoScore) return false;

    if (filters.ecoAmenities && filters.ecoAmenities.length > 0) {
      const have = (p.ecoAmenities || []).map((a) => a.toLowerCase());
      if (!filters.ecoAmenities.every((req) => have.includes(req))) return false;
    }

    const sensory = p.sensory;
    if (filters.decibelAtmosphere && filters.decibelAtmosphere.length > 0) {
      if (!sensory || !filters.decibelAtmosphere.includes(sensory.decibelAtmosphere.toLowerCase())) {
        return false;
      }
    }

    if (filters.minAstroScore !== undefined) {
      if (!sensory || sensory.astrophotographyScore < filters.minAstroScore) return false;
    }

    if (filters.enclosedYardRequired) {
      if (!sensory || sensory.enclosedYard.exists !== true) return false;
    }

    if (filters.minFenceHeight !== undefined) {
      if (!sensory || !sensory.enclosedYard.exists) return false;
      const heightVal = parseFloat(sensory.enclosedYard.fenceHeight) || 0;
      if (heightVal < filters.minFenceHeight) return false;
    }

    if (filters.ergonomicWorkstationRequired) {
      if (!sensory || sensory.ergonomicWorkstation.exists !== true) return false;
    }

    if (filters.minUploadSpeed !== undefined) {
      if (!sensory || !sensory.ergonomicWorkstation.exists) return false;
      if (sensory.ergonomicWorkstation.uploadSpeedMbps < filters.minUploadSpeed) return false;
    }

    if (filters.stoveRequired) {
      if (!sensory || sensory.stoveFirewoodTracker.hasStove !== true) return false;
    }

    if (filters.minSolitudeIndex !== undefined) {
      if (!sensory || sensory.solitudeIndex < filters.minSolitudeIndex) return false;
    }

    if (filters.waterfrontSafetySteepness && filters.waterfrontSafetySteepness.length > 0) {
      if (!sensory || !filters.waterfrontSafetySteepness.includes(sensory.waterfrontSafety.steepness.toLowerCase())) {
        return false;
      }
    }

    if (filters.maxSeasonalAccessDifficulty && filters.maxSeasonalAccessDifficulty.length > 0) {
      if (!sensory) return false;
      const ratingLower = sensory.seasonalAccess.rating.toLowerCase();
      if (!filters.maxSeasonalAccessDifficulty.some((allowed) => ratingLower.includes(allowed))) {
        return false;
      }
    }

    if (filters.fragranceFreeRequired) {
      if (!sensory) return false;
      const profileLower = sensory.naturalScentProfile.toLowerCase();
      if (!profileLower.includes("no artificial") && !profileLower.includes("zero artificial")) {
        return false;
      }
    }

    if (filters.poolMechanicsType && filters.poolMechanicsType.length > 0) {
      if (!sensory || !filters.poolMechanicsType.includes(sensory.poolHotTubMechanics.type.toLowerCase())) {
        return false;
      }
    }

    return true;
  });
}
