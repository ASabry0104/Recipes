import { memo, useCallback } from 'react';
import { useRecipeStore } from '../store/recipeStore';

const SearchBar = memo(function SearchBar() {
  const { searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, showFavoritesOnly, setShowFavoritesOnly, sortBy, setSortBy, sortOrder, setSortOrder } = useRecipeStore();

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-md">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search input */}
        <div className="flex-1 relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search recipes by name, ingredient, or category..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 flex items-center justify-center transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)}
            className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
          >
            <option value="All">All Categories</option>
            <option value="Breakfast">🥞 Breakfast</option>
            <option value="Lunch">🥗 Lunch</option>
            <option value="Dinner">🍝 Dinner</option>
            <option value="Dessert">🍪 Dessert</option>
            <option value="Snacks">🥨 Snacks</option>
            <option value="Drinks">🍋 Drinks</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-') as ['name' | 'cookTime' | 'recent', 'asc' | 'desc'];
              setSortBy(by);
              setSortOrder(order);
            }}
            className="px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer transition-all"
          >
            <option value="recent-desc">Newest First</option>
            <option value="recent-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="cookTime-asc">Cook Time (Short → Long)</option>
            <option value="cookTime-desc">Cook Time (Long → Short)</option>
          </select>

          {/* Favorites filter */}
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`
              px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2
              transition-all cursor-pointer border
              ${showFavoritesOnly
                ? 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-red-200 dark:hover:border-red-800'
              }
            `}
          >
            <svg
              className="w-4 h-4"
              fill={showFavoritesOnly ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Favorites
          </button>
        </div>
      </div>
    </div>
  );
});

export default SearchBar;
