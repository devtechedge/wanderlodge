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

export interface EnclosedYardDetails {
  dimensions: string;
  fenceHeight: string;
  fenceMaterial: string;
  exists: boolean;
}

export interface ErgonomicWorkstationDetails {
  deskHeight: string;
  chairType: string;
  uploadSpeedMbps: number;
  exists: boolean;
}

export interface StoveFirewoodTrackerDetails {
  hasStove: boolean;
  firewoodProvided: boolean;
  lightingDifficulty: "Easy" | "Medium" | "Hard" | "None";
}

export interface WaterfrontSafetyDetails {
  steepness: "Flat" | "Gentle Slope" | "Steep Bank" | "None";
  safetyRating: string;
}

export interface SeasonalAccessDetails {
  rating: "Easy (Paved)" | "Moderate (Dirt)" | "Difficult (4WD/Chains Required)";
  details: string;
}

export interface PoolHotTubMechanicsDetails {
  type: "Saline" | "Chlorine" | "Natural Circulating Stream-Water" | "None";
  details: string;
}

export interface SensoryProfile {
  decibelAtmosphere: "Whispering Pines" | "Active River Noise" | "Silent Meadow";
  decibelLevelDb: number;
  astrophotographyScore: number; // out of 10
  astrophotographyDetails: string;
  enclosedYard: EnclosedYardDetails;
  ergonomicWorkstation: ErgonomicWorkstationDetails;
  stoveFirewoodTracker: StoveFirewoodTrackerDetails;
  solitudeIndex: number; // out of 10
  waterfrontSafety: WaterfrontSafetyDetails;
  seasonalAccess: SeasonalAccessDetails;
  naturalScentProfile: string;
  poolHotTubMechanics: PoolHotTubMechanicsDetails;
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
  sensory?: SensoryProfile;
  ecoScore?: number;
  carbonFootprint?: number;
  ecoAmenities?: string[];
  hasEVCharging?: boolean;
  chargingType?: string;
  ecoPledged?: boolean;
}

export interface CoTraveler {
  name: string;
  email: string;
  image?: string;
  role: "Adult" | "Child" | "Guest";
}

export interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  paidByName: string;
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
  selectedAdventures?: string[];
  comfortEquipment?: {
    orthoMats: boolean;
    medicalKit: boolean;
    largePrintGames: boolean;
    walkerRamp: boolean;
  };
  coTravelers?: CoTraveler[];
  groupExpenses?: GroupExpense[];
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

export interface QAAnswer {
  id: string;
  authorName: string;
  authorImage: string;
  role: Role | "AI_CONCIERGE";
  content: string;
  createdAt: string;
}

export interface QA {
  id: string;
  propertyId: string;
  question: string;
  authorName: string;
  authorImage: string;
  answers: QAAnswer[];
  createdAt: string;
}

interface DBStructure {
  users: User[];
  properties: Property[];
  reservations: Reservation[];
  reviews: Review[];
  messages: Message[];
  wishlists: Wishlist[];
  qas: QA[];
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
      sensory: {
        decibelAtmosphere: "Whispering Pines",
        decibelLevelDb: 22,
        astrophotographyScore: 9,
        astrophotographyDetails: "Bortle Class 2 sky. Extremely low local light pollution, 10% average seasonal cloud coverage, crystal clear peak sightlines over the Cascade foothills.",
        enclosedYard: {
          dimensions: "45ft x 80ft",
          fenceHeight: "6.5ft",
          fenceMaterial: "Solid Western Red Cedar Wood",
          exists: true,
        },
        ergonomicWorkstation: {
          deskHeight: "28\" - 48\" Motorized Standing",
          chairType: "Herman Miller Aeron (Size B) with lumber adjustment",
          uploadSpeedMbps: 150,
          exists: true,
        },
        stoveFirewoodTracker: {
          hasStove: true,
          firewoodProvided: true,
          lightingDifficulty: "Easy",
        },
        solitudeIndex: 8,
        waterfrontSafety: {
          steepness: "None",
          safetyRating: "N/A (No immediate waterfront hazard)",
        },
        seasonalAccess: {
          rating: "Moderate (Dirt)",
          details: "A 0.5-mile well-graded gravel forest road. Safe for all vehicles in summer; AWD/4WD recommended during active winter snowfall.",
        },
        naturalScentProfile: "No artificial fragrances or essential oils. Filled with organic pine needle musk and local cedar-wood aroma.",
        poolHotTubMechanics: {
          type: "Natural Circulating Stream-Water",
          details: "The cedar wood hot tub uses a continuous gravity-fed circulating flow from an on-site natural spring, heated by an integrated wood stove without any chlorine.",
        },
      },
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
      sensory: {
        decibelAtmosphere: "Active River Noise",
        decibelLevelDb: 35,
        astrophotographyScore: 7,
        astrophotographyDetails: "Bortle Class 3. Gentle lake reflections can create stellar double exposures. Low light interference from the distant valley.",
        enclosedYard: {
          dimensions: "30ft x 50ft",
          fenceHeight: "5ft",
          fenceMaterial: "Coated Wire Mesh & Redwood Posts",
          exists: true,
        },
        ergonomicWorkstation: {
          deskHeight: "29\" Fixed Redwood Board",
          chairType: "Steelcase Gesture Ergonomic Swivel Chair",
          uploadSpeedMbps: 250,
          exists: true,
        },
        stoveFirewoodTracker: {
          hasStove: false,
          firewoodProvided: false,
          lightingDifficulty: "None",
        },
        solitudeIndex: 6,
        waterfrontSafety: {
          steepness: "Gentle Slope",
          safetyRating: "Shallow sandy beach entry with a child safety latch-gate leading to the wood-plank dock.",
        },
        seasonalAccess: {
          rating: "Easy (Paved)",
          details: "Fully paved state county highway leads straight to the property driveway. Easy access year-round.",
        },
        naturalScentProfile: "No artificial scents. Fresh water moisture, lake breeze, and clean slate stone.",
        poolHotTubMechanics: {
          type: "None",
          details: "No hot tub on site. Excellent direct sandy-shore lake swimming access instead.",
        },
      },
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
      sensory: {
        decibelAtmosphere: "Whispering Pines",
        decibelLevelDb: 26,
        astrophotographyScore: 6,
        astrophotographyDetails: "Bortle Class 3. Framed by tall old-growth Douglas fir canopies. Features skylights directly over the bed for protected celestial viewing.",
        enclosedYard: {
          dimensions: "N/A",
          fenceHeight: "N/A",
          fenceMaterial: "N/A",
          exists: false,
        },
        ergonomicWorkstation: {
          deskHeight: "30\" Natural Fir-Slab Console",
          chairType: "Ergonomic Saddle Balance Stool",
          uploadSpeedMbps: 85,
          exists: true,
        },
        stoveFirewoodTracker: {
          hasStove: true,
          firewoodProvided: true,
          lightingDifficulty: "Medium",
        },
        solitudeIndex: 9,
        waterfrontSafety: {
          steepness: "None",
          safetyRating: "N/A (Situated high up in the woodland forest)",
        },
        seasonalAccess: {
          rating: "Difficult (4WD/Chains Required)",
          details: "Steep dirt road with sharp switchbacks. High-clearance AWD/4WD required, and snow chains mandatory in active winter storms.",
        },
        naturalScentProfile: "No artificial scents. Deep forest pine bark, wet moss, and crisp subalpine ferns.",
        poolHotTubMechanics: {
          type: "None",
          details: "No soaking tub. Includes a magical outdoor open-air hot rainwater canopy shower.",
        },
      },
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
      sensory: {
        decibelAtmosphere: "Silent Meadow",
        decibelLevelDb: 14,
        astrophotographyScore: 10,
        astrophotographyDetails: "Bortle Class 1. Extreme high-altitude peak clarity. Zero light pollution, direct view of the Milky Way core. Astro-tripod mounts on deck.",
        enclosedYard: {
          dimensions: "50ft x 100ft",
          fenceHeight: "6ft",
          fenceMaterial: "Black Powder-Coated Steel & Concrete Base",
          exists: true,
        },
        ergonomicWorkstation: {
          deskHeight: "28\" - 48\" Motorized Dual-Motor Standing Desk",
          chairType: "Herman Miller Embody Ergonomic Task Chair",
          uploadSpeedMbps: 300,
          exists: true,
        },
        stoveFirewoodTracker: {
          hasStove: true,
          firewoodProvided: true,
          lightingDifficulty: "Easy",
        },
        solitudeIndex: 10,
        waterfrontSafety: {
          steepness: "None",
          safetyRating: "N/A (High dry alpine meadow)",
        },
        seasonalAccess: {
          rating: "Difficult (4WD/Chains Required)",
          details: "Steep gravel switchbacks. 4WD with high-clearance tires highly recommended; snow plowing is active daily in winter.",
        },
        naturalScentProfile: "Absolutely scent-free, hypoallergenic air system. Zero artificial fragrances or cabin musk.",
        poolHotTubMechanics: {
          type: "Saline",
          details: "The indoor sunken modern soaking plunge uses a natural salt saline system instead of commercial chemical chlorine.",
        },
      },
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
      sensory: {
        decibelAtmosphere: "Active River Noise",
        decibelLevelDb: 28,
        astrophotographyScore: 8,
        astrophotographyDetails: "Bortle Class 2. Wide-open 360-degree lake horizons. Perfect for long exposures of star-trails over the mountain outline.",
        enclosedYard: {
          dimensions: "N/A",
          fenceHeight: "N/A",
          fenceMaterial: "N/A",
          exists: false,
        },
        ergonomicWorkstation: {
          deskHeight: "29\" Vintage Mahogany Roll-Top Desk",
          chairType: "Ergonomic leather swivel armchair",
          uploadSpeedMbps: 120,
          exists: true,
        },
        stoveFirewoodTracker: {
          hasStove: false,
          firewoodProvided: false,
          lightingDifficulty: "None",
        },
        solitudeIndex: 5,
        waterfrontSafety: {
          steepness: "Steep Bank",
          safetyRating: "Direct deep water diving depth from the edge of the wrap deck. Safety swim vests and rescue ring mounted on-site.",
        },
        seasonalAccess: {
          rating: "Easy (Paved)",
          details: "Paved lake access road with clear paths. Flat, sedan-accessible parking area directly at the shoreline.",
        },
        naturalScentProfile: "Zero artificial fragrances. Moist lake air and historic rain-seasoned cedar wood logs.",
        poolHotTubMechanics: {
          type: "None",
          details: "No on-site tub. Immediate direct deep lake immersion directly off the deck steps.",
        },
      },
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
      coTravelers: [
        { name: "Sarah Connor", email: "sarah@example.com", image: "https://picsum.photos/seed/sarah/150/150", role: "Adult" },
        { name: "John Connor", email: "john@example.com", image: "https://picsum.photos/seed/john/150/150", role: "Child" }
      ],
      groupExpenses: [
        { id: "exp-1", description: "Organic Wood & S'mores Kits", amount: 60, paidByName: "Marcus Traveler" },
        { id: "exp-2", description: "Pinecrest National Forest Trail Passes", amount: 45, paidByName: "Sarah Connor" }
      ]
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

  const qas: QA[] = [
    {
      id: "qa-1",
      propertyId: "prop-1",
      question: "Is there solid mobile cellular reception here? I have to join a Zoom meeting on Wednesday.",
      authorName: "Marcus Traveler",
      authorImage: "https://picsum.photos/seed/marcus/150/150",
      createdAt: new Date("2026-05-15").toISOString(),
      answers: [
        {
          id: "qaa-1",
          authorName: "Evelyn Lodge",
          authorImage: "https://picsum.photos/seed/evelyn/150/150",
          role: Role.PROVIDER,
          content: "Yes! While we are tucked in the pines, we have high-speed Starlink satellite internet installed. You will easily get 150+ Mbps with extremely low latency, making Zoom video calls perfectly seamless.",
          createdAt: new Date("2026-05-15T10:12:00Z").toISOString()
        }
      ]
    },
    {
      id: "qa-2",
      propertyId: "prop-1",
      question: "Is the outdoor cedar hot tub pre-heated before arrival, or do we light it ourselves?",
      authorName: "Sarah Connor",
      authorImage: "https://picsum.photos/seed/sarah/150/150",
      createdAt: new Date("2026-05-20").toISOString(),
      answers: [
        {
          id: "qaa-2",
          authorName: "Evelyn Lodge",
          authorImage: "https://picsum.photos/seed/evelyn/150/150",
          role: Role.PROVIDER,
          content: "We clean and fill it with fresh spring water before every arrival. If you let us know your estimated check-in time, we are happy to pre-light and fuel the wood-fire stove so it is a perfect 104 degrees when you step through the door!",
          createdAt: new Date("2026-05-20T14:45:00Z").toISOString()
        }
      ]
    }
  ];

  return { users, properties, reservations, reviews, messages, wishlists, qas };
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
    return JSON.parse(content) as DBStructure;
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
