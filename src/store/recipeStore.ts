import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Recipe, Category, AppState, generateId } from '../types';
import { SAMPLE_RECIPES } from '../data/sampleRecipes';

// Actions interface
interface RecipeStore extends AppState {
  // Recipe actions
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'isFavorite' | 'lastCooked'>) => void;
  updateRecipe: (id: string, updates: Partial<Recipe>) => void;
  deleteRecipe: (id: string) => void;
  toggleFavorite: (id: string) => void;
  markAsCooked: (id: string) => void;
  
  // Filter/search actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: Category | 'All') => void;
  setSortBy: (sortBy: 'name' | 'cookTime' | 'recent') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setShowFavoritesOnly: (show: boolean) => void;
  
  // Theme actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  
  // Data management
  importRecipes: (recipes: Recipe[], replace?: boolean) => void;
  exportRecipes: () => Recipe[];
  resetToSampleRecipes: () => void;
  
  // Computed getters
  getFilteredRecipes: () => Recipe[];
  getRandomRecipe: (category?: Category | 'All') => Recipe | null;
  getRecentRecipes: () => Recipe[];
}

// Check if this is first visit
const isFirstVisit = () => {
  try {
    return !localStorage.getItem('recipe-app-storage');
  } catch {
    return true;
  }
};

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      // Initial state
      recipes: [],
      theme: 'light',
      searchQuery: '',
      selectedCategory: 'All',
      sortBy: 'recent',
      sortOrder: 'desc',
      showFavoritesOnly: false,
      recentRecipeIds: [],
      
      // Recipe actions
      addRecipe: (recipeData) => {
        const newRecipe: Recipe = {
          ...recipeData,
          id: generateId(),
          createdAt: Date.now(),
          isFavorite: false,
        };
        set((state) => ({
          recipes: [newRecipe, ...state.recipes],
        }));
      },
      
      updateRecipe: (id, updates) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, ...updates } : recipe
          ),
        }));
      },
      
      deleteRecipe: (id) => {
        set((state) => ({
          recipes: state.recipes.filter((recipe) => recipe.id !== id),
          recentRecipeIds: state.recentRecipeIds.filter((rid) => rid !== id),
        }));
      },
      
      toggleFavorite: (id) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
          ),
        }));
      },
      
      markAsCooked: (id) => {
        set((state) => ({
          recipes: state.recipes.map((recipe) =>
            recipe.id === id ? { ...recipe, lastCooked: Date.now() } : recipe
          ),
          recentRecipeIds: [
            id,
            ...state.recentRecipeIds.filter((rid) => rid !== id),
          ].slice(0, 5),
        }));
      },
      
      // Filter/search actions
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      setSortBy: (sortBy) => set({ sortBy: sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),
      setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),
      
      // Theme actions
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      
      // Data management
      importRecipes: (recipes, replace = false) => {
        if (replace) {
          set({ recipes });
        } else {
          set((state) => {
            const existingIds = new Set(state.recipes.map((r) => r.id));
            const newRecipes = recipes.filter((r) => !existingIds.has(r.id));
            return { recipes: [...newRecipes, ...state.recipes] };
          });
        }
      },
      
      exportRecipes: () => get().recipes,
      
      resetToSampleRecipes: () => {
        set({
          recipes: SAMPLE_RECIPES,
          recentRecipeIds: [],
        });
      },
      
      // Computed getters
      getFilteredRecipes: () => {
        const state = get();
        let filtered = [...state.recipes];
        
        // Filter by search query
        if (state.searchQuery.trim()) {
          const query = state.searchQuery.toLowerCase().trim();
          filtered = filtered.filter(
            (recipe) =>
              recipe.name.toLowerCase().includes(query) ||
              recipe.category.toLowerCase().includes(query) ||
              recipe.ingredients.some((ing) => 
                (typeof ing === 'string' ? ing : ing.name).toLowerCase().includes(query)
              )
          );
        }
        
        // Filter by category
        if (state.selectedCategory !== 'All') {
          filtered = filtered.filter((recipe) => recipe.category === state.selectedCategory);
        }
        
        // Filter favorites only
        if (state.showFavoritesOnly) {
          filtered = filtered.filter((recipe) => recipe.isFavorite);
        }
        
        // Sort
        filtered.sort((a, b) => {
          let comparison = 0;
          
          switch (state.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'cookTime':
              const aTime = a.cookTime * (a.cookTimeUnit === 'hours' ? 60 : 1);
              const bTime = b.cookTime * (b.cookTimeUnit === 'hours' ? 60 : 1);
              comparison = aTime - bTime;
              break;
            case 'recent':
            default:
              comparison = a.createdAt - b.createdAt;
              break;
          }
          
          return state.sortOrder === 'asc' ? comparison : -comparison;
        });
        
        return filtered;
      },
      
      getRandomRecipe: (category = 'All') => {
        const state = get();
        let pool = state.recipes;
        
        if (category !== 'All') {
          pool = pool.filter((r) => r.category === category);
        }
        
        if (pool.length === 0) return null;
        
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
      },
      
      getRecentRecipes: () => {
        const state = get();
        return state.recentRecipeIds
          .map((id) => state.recipes.find((r) => r.id === id))
          .filter((r): r is Recipe => r !== undefined);
      },
    }),
    {
      name: 'recipe-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        recipes: state.recipes,
        theme: state.theme,
        recentRecipeIds: state.recentRecipeIds,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize with sample recipes on first visit
        if (state && state.recipes.length === 0 && isFirstVisit()) {
          state.recipes = SAMPLE_RECIPES;
        }
      },
    }
  )
);
