// Recipe and app type definitions

export type Category = 'Breakfast' | 'Lunch' | 'Dinner' | 'Dessert' | 'Snacks' | 'Drinks';

export interface Recipe {
  id: string;
  name: string;
  category: Category;
  cookTime: number;
  cookTimeUnit: 'minutes' | 'hours';
  servings: number;
  ingredients: string[];
  steps: string[];
  tips?: string;
  image?: string;
  isFavorite: boolean;
  createdAt: number;
  lastCooked?: number;
}

export interface AppState {
  recipes: Recipe[];
  theme: 'light' | 'dark';
  searchQuery: string;
  selectedCategory: Category | 'All';
  sortBy: 'name' | 'cookTime' | 'recent';
  sortOrder: 'asc' | 'desc';
  showFavoritesOnly: boolean;
  recentRecipeIds: string[];
}

export const CATEGORIES: Category[] = ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snacks', 'Drinks'];

export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; ring: string }> = {
  Breakfast: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-800 dark:text-amber-300',
    ring: 'ring-amber-400',
  },
  Lunch: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-800 dark:text-green-300',
    ring: 'ring-green-400',
  },
  Dinner: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-800 dark:text-orange-300',
    ring: 'ring-orange-400',
  },
  Dessert: {
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-800 dark:text-rose-300',
    ring: 'ring-rose-400',
  },
  Snacks: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-800 dark:text-purple-300',
    ring: 'ring-purple-400',
  },
  Drinks: {
    bg: 'bg-sky-100 dark:bg-sky-900/30',
    text: 'text-sky-800 dark:text-sky-300',
    ring: 'ring-sky-400',
  },
};

// Generate a unique ID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
