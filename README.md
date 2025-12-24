## 🚀 Vision
A cool, satisfying, and simple "Apple-style" web application. The experience is designed as an "unfolding story": as users click, the archive reveals itself through levels of depth, from broad music paths to specific communities and items.

## 🎨 Visual Identity
- **Apple Style**: Clean typography (Inter/SF Pro), plenty of white space (or sophisticated dark mode), subtle shadows, and premium glassmorphism.
- **Interactivity**: Smooth carousels for the initial path selection and fluid transitions between levels.
- **Micro-animations**: Satisfying feedback loops without overloading the user.

## 🎯 Strategic Goals
1. **Path-first Entry**: Users land on 4 distinct "Music Paths":
   - **Art Music** (Η μουσική του άστεως)
   - **Urban Popular Music** (Η αστικολαϊκή μουσική)
   - **Rural Music** (Η μουσική της υπαίθρου)
   - **Sacred Music** (Η εκκλησιαστική μουσική)
2. **Community Discovery**: Once inside a path, users discover and categorize data based on communities.
3. **The "Unfolding" Story**: A level-based navigation that reveals metadata and bitstreams in a satisfying, simple way.

---

## 🛠 Technical Strategy

### Phase 1: The Backbone (Backend)
- **Hierarchical API**: Expose communities and their sub-collections via a new `/api/communities` endpoint.
- **Relational Filtering**: Extend `ItemsController` to allow fetching all items within a specific community (spanning multiple collections).

### Phase 2: The Experience (Frontend)
- **Community Landing Page**: A "Wow" entrance with cards or interactive elements representing the different music communities.
- **Fluid Browser**: A seamless transition into the collections and items of a selected community.
- **Deep Metadata View**: A dedicated component to render every piece of metadata we have, including audio/video players.

---

## 📋 Task List & Roles

### 👨‍💻 Ody (Backend & Data)
- [ ] **Hierarchical API**: Expose Communities and Collections in a way that supports "unfolding" levels.
- [ ] **Path Filtering**: Implement logic to group communities by the 4 primary Music Paths.
- [ ] **Metadata Engine**: Ensure all metadata fields are correctly retrieved for the detail view.

### 👨‍🎨 Giannis (Frontend & UX)
- [ ] **Home Carousel**: Build the high-impact "Apple-style" carousel for the 4 Music Paths.
- [ ] **Unfolding Navigation**: Implement the level-based routing/animation (Path -> Community -> Collection -> Item).
- [ ] **Carousel UI**: Design satisfying carousel/scroll components for browsing items and communities.
- [ ] **High-Fidelity Detail View**: Create the simple, cool page that shows all data/bitstreams for a selected item.

---

## ❓ Clarifying Questions for the Stakeholder

1. **Visual Language**: When you say "simple and satisfying," are we thinking minimalist white space (Apple-style) or vibrant and immersive (Dark mode with glowing accents)?
2. **Community Hierarchy**: Our data supports sub-communities. Should the user browse one level at a time, or see all sub-level items at once?
3. **Collaboration**: How would you like us to split the work—one person on Backend and one on Frontend, or split by features (e.g., browsing vs. detail view)?
