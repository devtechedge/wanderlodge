# Changelog

All notable changes to the **WanderLodge** platform will be documented in this file. This project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.0] - 2026-07-07

This major release delivers a completely unified, immersive, and highly gamified experience for WanderLodge guests, closing out the comprehensive **Batch 10 Sandbox** feature set.

### Added

#### 🌲 Wilderness Exploration & Milestones (Batch 10)
- **Personal Nature Logbooks**: Integrated private local-storage persisted digital journals allowing guests to record woodland reflections and log regional specimens.
- **Eco-Steward Milestone Badges**: Added digital credentials that dynamically unlock based on energy conservation, verified trail cleanup logs, and green-business purchases.
- **Trail Check-In Logs & Trivia**: Implemented trailhead geofencing simulation allowing guests to check-in on-trail and solve interactive high-altitude conservation trivia.
- **Lodge-to-Lodge Wandering Trails**: Integrated coordinate-based tracking maps mapping historical visits to multiple subalpine WanderLodges across the United States.
- **Wanderer's Photo Journal**: Designed a minimal visual guest board celebrating real-time, authentic cabin-deck photography uploads.
- **Flora & Fauna Matching Game**: Created a child-friendly, interactive game designed to teach younger travelers how to identify conifer families and alpine birds.
- **Regional Footprint Summary**: Provided guests with local community economic support summaries, highlighting local bakeries and park passes funded by their stay.
- **Leave-No-Trace Stewardship Pledge**: Created a signable digital certificate layout where youth can commit to conservation and immediately unlock Ranger Badges.
- **Constellation Mapping Tool**: Built a simulated AR stargazing night sky overlay featuring a low-contrast night-vision "Red Light Mode" to protect eyes.
- **Milestone Tree Reforestation Tracker**: Added growth-stage sapling trackers visualizing the physical Douglas Fir seedlings planted by WanderLodge on the guest's behalf.

#### 👥 Group Coordination Hub
- **Joint Cabin Planning**: Created specialized side-by-side cabin search panes and drag-and-drop wishlists for traveling groups.
- **Synchronized Voting Modules**: Enabled travel party members to cast instant votes on target lodges with dynamic tally bars.
- **Shared Cabin Expense Splitters**: Added customizable expense ledger cards automatically splitting gear, groceries, and permit bills proportionally.
- **Interactive Chat Pane**: Integrated persistent conversation tabs for unified, real-time group coordination.

#### 🎛️ In-Stay Intelligent Cabin Controls
- **Climatic Air Controls**: Created rich slider controls to manage moisture and heating ranges.
- **Wood-Fired Roast S'mores Timers**: Built custom kitchen guides monitoring optimal marshmallow browning and chocolate melt durations.
- **Campfire Sound Synthesizer**: Added immersive soundscape switches creating warm, organic campfire crackle loops.
- **Hot Tub Hydro-Jet Diagnostics**: Implemented pressure monitoring readouts tracking real-time jet velocity and active filters.

### Changed
- **Navigation & Workspace**: Added the specialized `Nature Exploration` workspace tab directly into the active booking dashboard for streamlined in-stay access.
- **Performance Optimizations**: Migrated synchronous `localStorage` evaluations to state initialization callback functions, entirely eliminating SSR hydration flickering.
- **Linter & Build Validation**: Fixed all JSX apostrophe encodings and image loaders, bringing the Next.js production build process to a clean, error-free state.

---

[1.0.0]: https://github.com/your-username/wanderlodge/releases/tag/v1.0.0
