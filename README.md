# 🌲 WanderLodge

WanderLodge is a premium, full-stack peer-to-peer lodging and subalpine accommodation marketplace. Designed for naturalists, hikers, and eco-conscious travelers, it pairs high-end cabin listings with rich, interactive, and gamified local wilderness experiences.

Live Development App: [WanderLodge Preview](https://ais-dev-hklxc7ije3g5w7cvoa6h6b-147078862720.asia-southeast1.run.app)

---

## 🎨 Aesthetic & Design Philosophy

WanderLodge embraces a highly-crafted, modern **Cosmic Slate** visual theme. The design features:
- **Generous Negative Space** to promote a calm, uncluttered reading rhythm.
- **High-Contrast Warm Grays and Subalpine Emeralds** matching the crisp twilight palette of Pacific Northwest forests.
- **Micro-interactions & Spring Animations** powered by Framer Motion (`motion/react`) for intuitive feedback.
- **Accessible Typography** utilizing clean, modern display headings paired with technical, high-legibility monospaced data indicators.

---

## 🚀 Key Architectural Modules

### 1. 🗺️ Search & Interactive Listing Map
- Full search interface filtering curated lodges by subalpine coordinates, regions, and dates.
- High-fidelity visual cards and responsive interactive maps highlighting cabin locations, trail proximity, and available local micro-guides.

### 2. 👥 Group Coordination Hub
- **Real-Time Workspace**: Seamless chat pane for synchronized itinerary planning.
- **Democratic Voting**: Cast and tally member votes on candidate lodges.
- **Group Expense Splitting**: Log common gear, meal, and trail permit costs with transparent mathematical shares.

### 3. 🎛️ Smart In-Stay Cabin Controls
- Remote thermostat and subalpine ambient moisture adjusters.
- Campfire sizzle rhythm loop simulators and wood-fired s'mores cycle timers.
- Hot tub hydro-jet pressure diagnostics.

### 4. 🏕️ Wilderness Exploration & Milestones (Batch 10)
Encouraging eco-stewardship and natural curiosity through playful tracking:
- **Personal Nature Logbooks**: A private, client-persisted digital journal to record morning mist reflections and catalog forest specimen sightings (e.g., Douglas Fir, Pacific Trillium).
- **Eco-Steward Milestone Badges**: Earn digital badges for conserving energy, cleaning trails, or supporting local green businesses.
- **Local Trail Check-In Logs & Trivia**: Geographically check-in at verified trailheads surrounding the lodge to unlock local conservation trivia with instant feedback.
- **Lodge-to-Lodge Wandering Trails**: Track the unique geographic coordinates and historic dates of all the different WanderLodges visited over time.
- **Wanderer's Photo Journal Feed**: A clean, minimalist imagery board showcasing guest-submitted scenery shots taken directly from cabin redwood decks.
- **Flora & Fauna Identifier Game**: A child-friendly visual matching game helping young travelers learn to identify local trees and alpine birds.
- **Regional Footprint Summaries**: Simple summaries highlighting the positive economic impact of visitor stays on the immediate local community.
- **Leave-No-Trace Pledges**: An interactive visual certificate screen where younger travelers sign a digital stewardship pledge to protect local wildlife and earn custom badges.
- **Constellation Mapping Tool**: A clean AR stargazing overlay simulation that helps guests identify stars and constellations directly above their cabin roof, complete with a dark-adapted "Red Light" mode.
- **Milestone Tree Reforestation**: Tracks physical reforestation efforts; for every 5 stays completed, WanderLodge physically plants a native seedling in a Cascade-area burn zone, tracking its growth over time.

---

## 🛠️ Technology Stack

- **Framework**: [Next.js 15+ (App Router)](https://nextjs.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion / `motion/react`](https://motion.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State & Storage**: Client-side localStorage persistence with resilient SSR hydration guards.

---

## 📦 Local Installation & Development

To run the application locally on your system:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/wanderlodge.git
   cd wanderlodge
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory (refer to `.env.example`):
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

5. **Lint and Compile verification**
   ```bash
   npm run lint
   npm run build
   ```

---

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.
