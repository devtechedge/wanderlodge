import fs from "fs";
import path from "path";

export enum Role {
  TRAVELER = "TRAVELER",
  PROVIDER = "PROVIDER",
}

export enum ReservationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  image: string;
  role: Role;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  lat: number;
  lng: number;
  images: string[];
  amenities: string[];
  maxGuests: number;
  providerId: string;
  createdAt: string;
  ecoScore?: number;
  carbonFootprint?: number;
  ecoAmenities?: string[];
  hasEVCharging?: boolean;
  chargingType?: string;
  ecoPledged?: boolean;
}

export interface Reservation {
  id: string;
  propertyId: string;
  travelerId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: ReservationStatus;
  createdAt: string;
}

export interface Review {
  id: string;
  propertyId: string;
  authorId: string;
  comment: string;
  ratingClean: number;
  ratingComm: number;
  ratingLoc: number;
  ratingValue: number;
  ratingAverage: number;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  reservationId: string;
  content: string;
  timestamp: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  propertyIds: string[];
}

interface DBStructure {
  users: User[];
  properties: Property[];
  reservations: Reservation[];
  reviews: Review[];
  messages: Message[];
  wishlists: Wishlist[];
}

const DB_FILE_PATH = "/tmp/wanderlodge_db.json";

function getInitialDB(): DBStructure {
  const users: User[] = [
    {
      id: "user-1",
      name: "Evelyn Lodge",
      email: "evelyn@wanderlodge.com",
      password: "password123", // Pre-hashed or simple string for MVP
      image: "https://picsum.photos/seed/evelyn/150/150",
      role: Role.PROVIDER,
      createdAt: new Date("2026-01-10").toISOString(),
    },
    {
      id: "user-2",
      name: "Marcus Traveler",
      email: "marcus@wanderlodge.com",
      password: "password123",
      image: "https://picsum.photos/seed/marcus/150/150",
      role: Role.TRAVELER,
      createdAt: new Date("2026-02-14").toISOString(),
    }
  ];

  const properties: Property[] = [
    {
      id: "prop-1",
      title: "Eldorado Ridge Cabin",
      description: "Tucked away in the towering cedar trees of Pinecrest Valley, Eldorado Ridge Cabin is a bespoke A-frame retreat designed for seeking peace. Features an outdoor wood-fired cedar hot tub, a grand stone fireplace, and panoramic mountain vistas. Watch the golden hours light up the valley from our custom-crafted tree deck, or hike the trails directly starting from your backyard.",
      price: 240,
      location: "Pinecrest Valley",
      lat: 45.12,
      lng: -121.65,
      images: [
        "https://picsum.photos/seed/cabin1/1200/800",
        "https://picsum.photos/seed/cabin1-2/1200/800",
        "https://picsum.photos/seed/cabin1-3/1200/800",
      ],
      amenities: ["Wood Hot Tub", "Grand Fireplace", "Mountain Vista", "Super Wifi", "Kitchen", "Pet Friendly"],
      maxGuests: 4,
      providerId: "user-1",
      createdAt: new Date("2026-03-01").toISOString(),
      ecoScore: 92,
      carbonFootprint: 4.2,
      ecoAmenities: ["Solar Grid Power", "Greywater Recycling", "Composting Bin", "Wood Fireplace"],
      hasEVCharging: true,
      chargingType: "Level 2 J1772",
      ecoPledged: true,
    },
    {
      id: "prop-2",
      title: "Goldenwood Waterfront Lodge",
      description: "A gorgeous modern masterpiece of glass and structural timber, sitting directly on the shoreline of Sunset Bay. Floor-to-ceiling glass paneling provides breathtaking morning light. Step out to your own private cedar dock equipped with dual wooden canoes and paddleboards, or cook a gourmet meal in our professional slate-surface kitchen.",
      price: 380,
      location: "Sunset Bay",
      lat: 45.18,
      lng: -121.58,
      images: [
        "https://picsum.photos/seed/lodge1/1200/800",
        "https://picsum.photos/seed/lodge1-2/1200/800",
        "https://picsum.photos/seed/lodge1-3/1200/800",
      ],
      amenities: ["Waterfront", "Canoes & Boards", "Outdoor Kitchen", "Fast Wifi", "Fire Pit", "Air Conditioning"],
      maxGuests: 6,
      providerId: "user-1",
      createdAt: new Date("2026-03-15").toISOString(),
      ecoScore: 88,
      carbonFootprint: 6.1,
      ecoAmenities: ["LED Energy Star bulbs", "Greywater recycling", "Local organic garden access"],
      hasEVCharging: false,
      ecoPledged: true,
    },
    {
      id: "prop-3",
      title: "The Emerald Canopy Treehouse",
      description: "Elevated twelve feet above the mossy forest floor in the heart of Mossy Glen Woods, this architect-designed sanctuary offers an unparalleled immersive nature experience. A wrapping observation bridge connects your bedroom to an outdoor shower nestled in the branches. Wake up to the forest choir and enjoy single-origin beans at our hand-poured coffee bar.",
      price: 195,
      location: "Mossy Glen Woods",
      lat: 45.08,
      lng: -121.72,
      images: [
        "https://picsum.photos/seed/tree1/1200/800",
        "https://picsum.photos/seed/tree1-2/1200/800",
      ],
      amenities: ["Elevated Tree Deck", "Forest Shower", "Artisan Coffee Bar", "Campfire Grill", "Wifi Finder"],
      maxGuests: 2,
      providerId: "user-1",
      createdAt: new Date("2026-04-02").toISOString(),
      ecoScore: 98,
      carbonFootprint: 1.8,
      ecoAmenities: ["100% Off-Grid Solar", "Composting system", "Rainwater collection", "Zero-Waste Initiative"],
      hasEVCharging: true,
      chargingType: "Level 2 Tesla",
      ecoPledged: true,
    },
    {
      id: "prop-4",
      title: "Slate Peak Modernist Chalet",
      description: "Designed by an award-winning Swiss firm, the Slate Peak Chalet is a striking minimalist retreat built from dark basalt rock and local black-spruce timber. Centered in a silent alpine canyon, it houses a Finnish dry-sauna, an indoor sunken fireplace circle, and ultra-high-efficiency radiant flooring. Absolute privacy combined with raw modern luxury.",
      price: 320,
      location: "Slate Canyon",
      lat: 45.24,
      lng: -121.61,
      images: [
        "https://picsum.photos/seed/chalet1/1200/800",
        "https://picsum.photos/seed/chalet1-2/1200/800",
      ],
      amenities: ["Finnish Dry-Sauna", "Sunken Fireplace", "Heated Floors", "Pro Kitchen", "Alpine View"],
      maxGuests: 4,
      providerId: "user-1",
      createdAt: new Date("2026-04-10").toISOString(),
      ecoScore: 85,
      carbonFootprint: 7.5,
      ecoAmenities: ["Geothermal Heatpump", "Triple-Pane Windows", "Smart Off-Grid Battery"],
      hasEVCharging: true,
      chargingType: "Universal Level 2",
      ecoPledged: false,
    },
    {
      id: "prop-5",
      title: "Echo Bay Floating Boathouse",
      description: "An intimate, historic converted boathouse hovering directly over the crystalline waters of Echo Bay. Features glass flooring viewing panels in the living area, letting you look straight into the quiet lake below. Includes a spacious over-water deck, vintage leather loungers, and immediate access to the coolest swimming waters in the region.",
      price: 175,
      location: "Echo Bay",
      lat: 45.15,
      lng: -121.50,
      images: [
        "https://picsum.photos/seed/boat1/1200/800",
        "https://picsum.photos/seed/boat1-2/1200/800",
      ],
      amenities: ["Glass Floor View", "Lake Hover Deck", "Swim Access", "Wifi", "Kayak Included"],
      maxGuests: 2,
      providerId: "user-1",
      createdAt: new Date("2026-04-18").toISOString(),
      ecoScore: 95,
      carbonFootprint: 2.4,
      ecoAmenities: ["Off-Grid Solar", "Composting system", "Eco-friendly Water Filtration"],
      hasEVCharging: false,
      ecoPledged: false,
    }
  ];

  const reviews: Review[] = [
    {
      id: "rev-1",
      propertyId: "prop-1",
      authorId: "user-2",
      comment: "Absolutely breathtaking! The cedar hot tub under the stars was an experience we will never forget. Evelyn was a perfect provider—meticulous instructions and total privacy. The Eldorado Ridge Cabin exceeded all our hopes.",
      ratingClean: 5,
      ratingComm: 5,
      ratingLoc: 5,
      ratingValue: 5,
      ratingAverage: 5,
      createdAt: new Date("2026-05-10").toISOString(),
    },
    {
      id: "rev-2",
      propertyId: "prop-1",
      authorId: "user-2",
      comment: "A beautiful architectural marvel. Very clean and extremely cozy. The view of the peaks during sunrise is worth every single dollar. Highly recommended!",
      ratingClean: 4.8,
      ratingComm: 4.8,
      ratingLoc: 5,
      ratingValue: 4.5,
      ratingAverage: 4.78,
      createdAt: new Date("2026-05-24").toISOString(),
    },
    {
      id: "rev-3",
      propertyId: "prop-2",
      authorId: "user-2",
      comment: "Waking up to Sunset Bay from the floor-to-ceiling glass wall felt like a dream. Taking the wooden canoes out in the misty morning was so peaceful. Incredible kitchen and very fast internet. A 10/10 stay.",
      ratingClean: 5,
      ratingComm: 4.8,
      ratingLoc: 5,
      ratingValue: 4.8,
      ratingAverage: 4.9,
      createdAt: new Date("2026-06-01").toISOString(),
    }
  ];

  const reservations: Reservation[] = [
    {
      id: "res-1",
      propertyId: "prop-1",
      travelerId: "user-2",
      startDate: "2026-08-10",
      endDate: "2026-08-15",
      totalPrice: 1200,
      status: ReservationStatus.CONFIRMED,
      createdAt: new Date("2026-06-10").toISOString(),
    }
  ];

  const messages: Message[] = [
    {
      id: "msg-1",
      senderId: "user-2",
      receiverId: "user-1",
      reservationId: "res-1",
      content: "Hi Evelyn! I'm really looking forward to our stay at the Eldorado Ridge Cabin. Just wondering if we need to bring our own wood for the hot tub?",
      timestamp: new Date("2026-06-10T14:30:00Z").toISOString(),
    },
    {
      id: "msg-2",
      senderId: "user-1",
      receiverId: "user-2",
      reservationId: "res-1",
      content: "Hello Marcus! We are so excited to host you. No need to bring anything—we provide a fully stocked firewood rack right next to the hot tub, plus organic cedar firestarters. See you soon!",
      timestamp: new Date("2026-06-10T14:45:00Z").toISOString(),
    }
  ];

  const wishlists: Wishlist[] = [
    {
      id: "wish-1",
      userId: "user-2",
      name: "Summer Vacation 2027",
      propertyIds: ["prop-1", "prop-3"],
    }
  ];

  return { users, properties, reservations, reviews, messages, wishlists };
}

export function readDB(): DBStructure {
  try {
    if (!fs.existsSync(DB_FILE_PATH)) {
      // Ensure directory exists
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const initial = getInitialDB();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const content = fs.readFileSync(DB_FILE_PATH, "utf-8");
    const data = JSON.parse(content) as DBStructure;
    
    // Auto-migrate properties to include eco fields if missing
    let modified = false;
    const initial = getInitialDB();
    data.properties = data.properties.map(p => {
      const match = initial.properties.find(ip => ip.id === p.id);
      if (match && p.ecoScore === undefined) {
        modified = true;
        return {
          ...p,
          ecoScore: match.ecoScore,
          carbonFootprint: match.carbonFootprint,
          ecoAmenities: match.ecoAmenities,
          hasEVCharging: match.hasEVCharging,
          chargingType: match.chargingType,
          ecoPledged: match.ecoPledged
        };
      }
      return p;
    });

    if (modified) {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    }

    return data;
  } catch (error) {
    console.error("Failed to read database file, returning initial mock state.", error);
    return getInitialDB();
  }
}

export function writeDB(data: DBStructure): boolean {
  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to write to database file.", error);
    return false;
  }
}
