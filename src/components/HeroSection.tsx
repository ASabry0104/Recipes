import { useState, useCallback, memo, useEffect } from 'react';
import { Recipe, Category, CATEGORIES, CATEGORY_COLORS } from '../types';
import { useRecipeStore } from '../store/recipeStore';

interface HeroSectionProps {
  onViewRecipe: (recipe: Recipe) => void;
}

const HeroSection = memo(function HeroSection({ onViewRecipe }: HeroSectionProps) {
  const { getRandomRecipe, recipes, markAsCooked } = useRecipeStore();
  const [suggestedRecipe, setSuggestedRecipe] = useState<Recipe | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [isAnimating, setIsAnimating] = useState(false);

  // Get initial suggestion
  useEffect(() => {
    if (recipes.length > 0) {
      setSuggestedRecipe(getRandomRecipe(selectedCategory));
    }
  }, [recipes.length, selectedCategory, getRandomRecipe]);

  // Shuffle animation
  const handleSuggestAnother = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      const newRecipe = getRandomRecipe(selectedCategory);
      setSuggestedRecipe(newRecipe);
      setIsAnimating(false);
    }, 300);
  }, [getRandomRecipe, selectedCategory]);

  const handleCookClick = useCallback(() => {
    if (suggestedRecipe) {
      markAsCooked(suggestedRecipe.id);
      onViewRecipe(suggestedRecipe);
    }
  }, [suggestedRecipe, markAsCooked, onViewRecipe]);

  // Don't show if no recipes
  if (recipes.length === 0) return null;

  const categoryStyle = suggestedRecipe ? CATEGORY_COLORS[suggestedRecipe.category] : null;

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 dark:from-orange-600 dark:via-amber-700 dark:to-orange-700 mb-8">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white font-serif mb-1">
              🍳 Cook This Today
            </h2>
            <p className="text-orange-100 dark:text-orange-200 text-sm">
              Need inspiration? Here's what you could make!
            </p>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as Category | 'All')}
              className="px-3 py-2 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-orange-200 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 cursor-pointer appearance-none"
              style={{ color: 'white' }}
            >
              <option value="All" style={{ color: '#1a1a2e' }}>All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} style={{ color: '#1a1a2e' }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recipe card */}
        {suggestedRecipe ? (
          <div
            className={`
              bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-5 md:p-6
              shadow-xl transition-all duration-300
              ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}
            `}
          >
            <div className="flex flex-col md:flex-row gap-5">
              {/* Image */}
              <div className="w-full md:w-40 h-40 md:h-40 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center">
                {suggestedRecipe.image ? (
                  <img
                    src={suggestedRecipe.image}
                    alt={suggestedRecipe.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl md:text-7xl">
                    {suggestedRecipe.category === 'Breakfast' && '🥞'}
                    {suggestedRecipe.category === 'Lunch' && '🥗'}
                    {suggestedRecipe.category === 'Dinner' && '🍝'}
                    {suggestedRecipe.category === 'Dessert' && '🍪'}
                    {suggestedRecipe.category === 'Snacks' && '🥨'}
                    {suggestedRecipe.category === 'Drinks' && '🍋'}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {suggestedRecipe.name}
                  </h3>
                  <span
                    className={`
                      shrink-0 px-3 py-1 rounded-full text-xs font-medium
                      ${categoryStyle?.bg} ${categoryStyle?.text}
                    `}
                  >
                    {suggestedRecipe.category}
                  </span>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {suggestedRecipe.cookTimeUnit === 'hours'
                      ? `${suggestedRecipe.cookTime}h`
                      : `${suggestedRecipe.cookTime}m`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {suggestedRecipe.servings} servings
                  </span>
                </div>

                {/* Ingredients preview */}
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                  {suggestedRecipe.ingredients.slice(0, 4).map(i => typeof i === 'string' ? i : i.name).join(' • ')}
                  {suggestedRecipe.ingredients.length > 4 && ' • ...'}
                </p>

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleCookClick}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    Let's Cook!
                  </button>
                  <button
                    onClick={() => onViewRecipe(suggestedRecipe)}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-xl transition-colors"
                  >
                    View Recipe
                  </button>
                  <button
                    onClick={handleSuggestAnother}
                    className="px-4 py-2 bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                  >
                    <svg className={`w-4 h-4 transition-transform ${isAnimating ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Suggest Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              No recipes found in the selected category.
            </p>
          </div>
        )}
      </div>
    </section>
  );
});

export default HeroSection;
