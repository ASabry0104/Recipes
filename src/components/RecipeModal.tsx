import { useEffect, useCallback, memo, useState } from 'react';
import { Recipe, CATEGORY_COLORS } from '../types';
import { useRecipeStore } from '../store/recipeStore';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
  onEdit: (recipe: Recipe) => void;
}

const RecipeModal = memo(function RecipeModal({ recipe, onClose, onEdit }: RecipeModalProps) {
  const { toggleFavorite, markAsCooked } = useRecipeStore();
  const [nutritionExpanded, setNutritionExpanded] = useState(true);
  const categoryStyle = CATEGORY_COLORS[recipe.category];

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Get cook time display
  const getCookTimeDisplay = () => {
    if (recipe.cookTimeUnit === 'hours') {
      return `${recipe.cookTime} hour${recipe.cookTime !== 1 ? 's' : ''}`;
    }
    return `${recipe.cookTime} minute${recipe.cookTime !== 1 ? 's' : ''}`;
  };

  // Calculate per serving nutrition
  const getPerServing = (value: number) => {
    return Math.round(value / recipe.servings);
  };

  // Check if recipe has nutrition data
  const hasNutrition = !!recipe.nutrition;

  // Check if any ingredient has nutrition
  const hasIngredientNutrition = recipe.ingredients.some(ing => ing.nutrition);

  const handleFavoriteClick = useCallback(() => {
    toggleFavorite(recipe.id);
  }, [recipe.id, toggleFavorite]);

  const handleCookClick = useCallback(() => {
    markAsCooked(recipe.id);
    onClose();
  }, [recipe.id, markAsCooked, onClose]);

  const handleEditClick = useCallback(() => {
    onEdit(recipe);
  }, [recipe, onEdit]);

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl my-8 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header image */}
        <div className="relative h-56 bg-gradient-to-br from-orange-200 via-amber-100 to-orange-100 dark:from-orange-900/40 dark:via-amber-900/30 dark:to-orange-900/40 rounded-t-3xl overflow-hidden">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-8xl opacity-60">
                {recipe.category === 'Breakfast' && '🥞'}
                {recipe.category === 'Lunch' && '🥗'}
                {recipe.category === 'Dinner' && '🍝'}
                {recipe.category === 'Dessert' && '🍪'}
                {recipe.category === 'Snacks' && '🥨'}
                {recipe.category === 'Drinks' && '🍋'}
              </span>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Category badge */}
          <span
            className={`
              absolute bottom-4 left-4 px-4 py-1.5 rounded-full text-sm font-medium
              ${categoryStyle.bg} ${categoryStyle.text}
            `}
          >
            {recipe.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title and favorite */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white font-serif">
              {recipe.name}
            </h2>
            <button
              onClick={handleFavoriteClick}
              className={`
                shrink-0 w-12 h-12 rounded-full
                flex items-center justify-center
                transition-all duration-200 hover:scale-110
                ${recipe.isFavorite
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-500'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500'
                }
              `}
              aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg
                className={`w-6 h-6 transition-transform duration-200 ${recipe.isFavorite ? 'scale-110' : ''}`}
                fill={recipe.isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </button>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap gap-4 mb-8">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Cook Time</p>
                <p className="font-medium">{getCookTimeDisplay()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Servings</p>
                <p className="font-medium">{recipe.servings} people</p>
              </div>
            </div>
          </div>

          {/* Nutrition Facts - Collapsible */}
          {hasNutrition && (
            <div className="mb-8 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <button
                onClick={() => setNutritionExpanded(!nutritionExpanded)}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 flex items-center justify-between hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥗</span>
                  <span className="font-semibold text-green-800 dark:text-green-200">Nutrition Facts</span>
                  {hasIngredientNutrition && (
                    <span className="text-xs bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">
                      Auto-calculated
                    </span>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 text-green-600 dark:text-green-400 transition-transform ${nutritionExpanded ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {nutritionExpanded && recipe.nutrition && (
                <div className="p-4 bg-white dark:bg-gray-800">
                  {/* Per serving info */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Per serving (1/{recipe.servings} of recipe)
                  </p>

                  {/* Main nutrition values - large display */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-orange-100 dark:bg-orange-900/30 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {getPerServing(recipe.nutrition.calories)}
                      </p>
                      <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">Calories</p>
                    </div>
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {getPerServing(recipe.nutrition.protein)}g
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Protein</p>
                    </div>
                    <div className="bg-purple-100 dark:bg-purple-900/30 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {getPerServing(recipe.nutrition.carbs)}g
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300 font-medium">Carbs</p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 dark:border-gray-700 my-3"></div>

                  {/* Full nutrition label style */}
                  <div className="text-sm">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-700 dark:text-gray-300">Total Fat</span>
                      <span className="font-medium text-gray-900 dark:text-white">{getPerServing(recipe.nutrition.fat)}g</span>
                    </div>
                    {recipe.nutrition.fiber !== undefined && (
                      <div className="flex justify-between py-1 pl-4 text-gray-600 dark:text-gray-400">
                        <span>Fiber</span>
                        <span>{getPerServing(recipe.nutrition.fiber)}g</span>
                      </div>
                    )}
                    {recipe.nutrition.sugar !== undefined && (
                      <div className="flex justify-between py-1 pl-4 text-gray-600 dark:text-gray-400">
                        <span>Sugar</span>
                        <span>{getPerServing(recipe.nutrition.sugar)}g</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                      <span className="text-gray-700 dark:text-gray-300">Sodium</span>
                      <span className="font-medium text-gray-900 dark:text-white">{getPerServing(recipe.nutrition.sodium || 0)}mg</span>
                    </div>
                    {recipe.nutrition.cholesterol !== undefined && recipe.nutrition.cholesterol > 0 && (
                      <div className="flex justify-between py-1">
                        <span className="text-gray-700 dark:text-gray-300">Cholesterol</span>
                        <span className="font-medium text-gray-900 dark:text-white">{getPerServing(recipe.nutrition.cholesterol)}mg</span>
                      </div>
                    )}
                  </div>

                  {/* Total per recipe */}
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-3 pt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total recipe:</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span><strong>{recipe.nutrition.calories}</strong> cal</span>
                      <span><strong>{recipe.nutrition.protein}</strong>g protein</span>
                      <span><strong>{recipe.nutrition.carbs}</strong>g carbs</span>
                      <span><strong>{recipe.nutrition.fat}</strong>g fat</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ingredients */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </span>
              Ingredients
              {hasIngredientNutrition && (
                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                  With nutrition
                </span>
              )}
            </h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
                >
                  <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-orange-400 dark:bg-orange-500"></span>
                  </span>
                  <div className="flex-1">
                    <span>{ingredient.name}</span>
                    {ingredient.nutrition && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                        ({ingredient.nutrition.calories} cal • {ingredient.nutrition.protein}g P • {ingredient.nutrition.carbs}g C • {ingredient.nutrition.fat}g F)
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Steps */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </span>
              Instructions
            </h3>
            <ol className="space-y-4">
              {recipe.steps.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 text-sm font-medium">
                    {index + 1}
                  </span>
                  <p className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips */}
          {recipe.tips && (
            <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-900/30">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Chef's Tips
              </h3>
              <p className="text-amber-700 dark:text-amber-400">{recipe.tips}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={handleFavoriteClick}
              className={`
                flex-1 py-3 px-4 rounded-xl font-medium
                flex items-center justify-center gap-2
                transition-colors
                ${recipe.isFavorite
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              <svg
                className="w-5 h-5"
                fill={recipe.isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {recipe.isFavorite ? 'Favorited' : 'Add to Favorites'}
            </button>
            <button
              onClick={handleCookClick}
              className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              Mark as Cooked
            </button>
          </div>
          <button
            onClick={handleEditClick}
            className="w-full mt-3 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Recipe
          </button>
        </div>
      </div>
    </div>
  );
});

export default RecipeModal;
