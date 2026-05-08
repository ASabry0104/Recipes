# Personal Recipe Manager - Specification

## Concept & Vision

A warm, inviting personal recipe manager that feels like a beloved cookbook living in your browser. The app combines the nostalgia of handwritten recipe cards with modern digital convenience—making meal planning feel delightful rather than like a chore. It should evoke the feeling of flipping through a treasured family recipe collection.

## Design Language

### Aesthetic Direction
Warm minimalism meets modern cookbook—think Bon Appétit magazine crossed with a cozy kitchen journal. Clean lines with soft touches, generous whitespace, and tactile-feeling UI elements.

### Color Palette
- **Primary:** `#E07A5F` (Terracotta) - Warm, appetizing, inviting
- **Secondary:** `#3D405B` (Deep Slate) - Sophisticated contrast
- **Accent:** `#81B29A` (Sage Green) - Fresh, healthy, natural
- **Background Light:** `#F4F1DE` (Cream) - Warm paper-like
- **Background Dark:** `#1A1A2E` (Deep Night) - Cozy evening reading
- **Surface Light:** `#FFFFFF`
- **Surface Dark:** `#252542`
- **Text Light:** `#2B2D42`
- **Text Dark:** `#F8F9FA`
- **Error:** `#E63946`
- **Success:** `#81B29A`

### Category Colors
- Breakfast: `#F9C74F` (Golden)
- Lunch: `#90BE6D` (Fresh Green)
- Dinner: `#E07A5F` (Terracotta)
- Dessert: `#F08080` (Light Coral)
- Snacks: `#9B5DE5` (Purple)
- Drinks: `#00B4D8` (Sky Blue)

### Typography
- **Headings:** "Playfair Display" - Elegant, editorial feel
- **Body:** "Inter" - Clean, highly readable
- **Monospace:** For timers/measurements

### Spatial System
- Base unit: 4px
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px
- Border radius: 8px (cards), 12px (buttons), 16px (modals), 24px (large containers)
- Card shadows: Layered soft shadows for depth

### Motion Philosophy
- Transitions: 200-300ms ease-out for most interactions
- Page transitions: Subtle fade-in with slight upward movement
- Hover states: Gentle scale (1.02) and shadow lift
- Modal: Fade + scale from 95% to 100%
- Cards: Staggered entrance animation on load
- Micro-interactions: Button press feedback, toggle switches

## Layout & Structure

### Page Architecture
1. **Header Bar** - App title, dark mode toggle, import/export buttons
2. **Hero Suggestion Section** - "Cook This Today" banner with random recipe card
3. **Quick Actions Bar** - Search, category filter, sort options
4. **Recipe Grid** - Card-based masonry/grid layout
5. **Floating Add Button** - Prominent CTA on mobile, header button on desktop
6. **Slide-out Recipe Modal** - View/edit recipe details
7. **Form Modal** - Add/edit recipe form

### Responsive Strategy
- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Single column on mobile, 2 columns on tablet, 3-4 columns on desktop
- Collapsible search on mobile
- Bottom sheet style modals on mobile, centered modals on desktop

## Features & Interactions

### Recipe CRUD
- **Add:** Floating button → Slide-up form modal
- **View:** Click card → Full recipe modal with all details
- **Edit:** Edit button in view modal → Pre-filled form
- **Delete:** Delete button → Confirmation dialog → Remove with fade animation

### Form Fields
- Recipe name (required) - Text input
- Category (required) - Dropdown select
- Cook time - Number with unit dropdown (min/hr)
- Servings - Number input
- Ingredients - Textarea, one per line
- Steps - Textarea, one per line or numbered
- Tips/Notes - Optional textarea
- Image - Optional image upload with preview

### Recipe Suggestion System
- "Cook This Today" hero banner at top
- Shows random recipe card with full details preview
- "Suggest Another" button with shuffle animation
- Category filter dropdown to limit suggestions
- Only shows if recipes exist

### Search & Filter
- Search bar with magnifying glass icon
- Real-time filtering as user types
- Searches: name, ingredients, category
- Debounced for performance
- Clear button when search is active
- Filter chips for quick category access

### Sorting
- Alphabetical (A-Z, Z-A)
- By cook time (shortest, longest)
- By recently added
- Dropdown selector

### Favorites
- Heart icon on each card
- Toggle on/off with animation
- "Show favorites only" filter option

### Import/Export
- Export all recipes as JSON file
- Import recipes from JSON file
- Merge or replace options on import

### Recently Cooked
- Track last viewed/cooked recipe
- Quick access section below suggestions

## Component Inventory

### RecipeCard
- States: default, hover (lift + shadow), favorited (filled heart)
- Shows: image, title, category badge, cook time, servings
- Actions: favorite toggle, click to view

### CategoryBadge
- Rounded pill with category-specific color
- Small icon + text

### SearchBar
- States: default, focused (ring), filled
- Clear button appears when text exists

### Modal
- States: closed, opening (scale up), open, closing (fade out)
- Overlay click to close
- Smooth spring animation

### FormInput
- States: default, focused, error, disabled
- Label, input, helper text, error message

### Button
- Variants: primary (filled), secondary (outlined), ghost, danger
- States: default, hover, active, disabled, loading
- Icons support (left or right)

### EmptyState
- Illustration/icon, heading, description, CTA button

### ConfirmationDialog
- Warning icon, title, message, cancel + confirm buttons
- Danger variant for destructive actions

### Toast
- Success (green), error (red), info (blue)
- Auto-dismiss after 3 seconds
- Stack multiple toasts

### DarkModeToggle
- Sun/moon icons with smooth rotation
- Instant theme switch with CSS transitions

## Technical Approach

### Stack
- React 18 with TypeScript
- Tailwind CSS for styling
- Zustand for state management (or React Context + useReducer)
- localStorage for persistence
- Vite for bundling

### Data Model
```typescript
interface Recipe {
  id: string;
  name: string;
  category: Category;
  cookTime: number;
  cookTimeUnit: 'minutes' | 'hours';
  servings: number;
  ingredients: string[];
  steps: string[];
  tips?: string;
  image?: string; // base64 or URL
  isFavorite: boolean;
  createdAt: number;
  lastCooked?: number;
}

type Category = 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snacks' | 'Drinks';
```

### Storage Strategy
- All recipes saved to localStorage key: 'recipe-app-recipes'
- Theme preference: 'recipe-app-theme'
- Recent recipes: 'recipe-app-recent'
- Auto-save on every change with debounce

### Sample Starter Recipes
1. Classic Pancakes (Breakfast)
2. Caesar Salad (Lunch)
3. Spaghetti Carbonara (Dinner)
4. Chocolate Chip Cookies (Dessert)
5. Guacamole & Chips (Snacks)
6. Fresh Lemonade (Drinks)

## Quality Checklist
- [ ] All buttons have working handlers
- [ ] Form validation with helpful error messages
- [ ] Smooth 60fps animations
- [ ] Zero console errors
- [ ] All features work offline
- [ ] Data persists across sessions
- [ ] Responsive at all breakpoints
- [ ] Dark mode fully themed
- [ ] Empty states for all scenarios
- [ ] Confirmation for destructive actions
