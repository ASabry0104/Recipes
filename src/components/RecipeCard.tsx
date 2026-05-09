import { useState, useEffect, useCallback, memo } from 'react';
import { Recipe, CATEGORY_COLORS } from '../types';
import { useRecipeStore } from '../store/recipeStore';

interface RecipeCardProps {
  recipe: Recipe;
  onView: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  index?: number;
}

const RecipeCard = memo(function RecipeCard({ recipe, onView, onEdit, index = 0 }: RecipeCardProps) {
  const { toggleFavorite, deleteRecipe } = useRecipeStore();
  const [isVisible, setIsVisible] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Staggered animation on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 50);
    return () => clearTimeout(timer);
  }, [index]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(recipe.id);
  }, [recipe.id, toggleFavorite]);

  const handleDeleteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    deleteRecipe(recipe.id);
    setShowDeleteConfirm(false);
  }, [deleteRecipe, recipe.id]);

  const categoryStyle = CATEGORY_COLORS[recipe.category];

  // Get cook time display
  const getCookTimeDisplay = () => {
    if (recipe.cookTimeUnit === 'hours') {
      return `${recipe.cookTime}h`;
    }
    return `${recipe.cookTime}m`;
  };

  return (
    <>
      <article
        onClick={() => onView(recipe)}
        className={`
          group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden
          shadow-md hover:shadow-xl
          transition-all duration-300 ease-out
          cursor-pointer
          transform origin-bottom
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
      >
        {/* Image area */}
        <div className="relative h-40 bg-gradient-to-br from-orange-200 via-amber-100 to-orange-100 dark:from-orange-900/30 dark:via-amber-900/20 dark:to-orange-900/30 overflow-hidden">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl opacity-50">
                  {recipe.category === 'Breakfast' && '🥞'}
                  {recipe.category === 'Lunch' && '🥗'}
                  {recipe.category === 'Dinner' && '🍝'}
                  {recipe.category === 'Dessert' && '🍪'}
                  {recipe.category === 'Snacks' && '🥨'}
                  {recipe.category === 'Drinks' && '🍋'}
                </span>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={handleFavoriteClick}
            className={`
              absolute top-3 right-3 w-10 h-10 rounded-full
              flex items-center justify-center
              transition-all duration-200
              ${recipe.isFavorite
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-400 hover:text-red-500'
              }
              shadow-lg hover:scale-110
            `}
            aria-label={recipe.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${recipe.isFavorite ? 'scale-110' : ''}`}
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

          {/* Category badge */}
          <span
            className={`
              absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium
              ${categoryStyle.bg} ${categoryStyle.text}
              flex items-center gap-1
            `}
          >
            {recipe.category}
          </span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2 line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {recipe.name}
          </h3>

          {/* Meta info */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {getCookTimeDisplay()}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {recipe.servings}
            </span>
          </div>

          {/* Ingredients preview */}
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {recipe.ingredients.slice(0, 3).map(i => typeof i === 'string' ? i : i.name).join(' • ')}
            {recipe.ingredients.length > 3 && ' • ...'}
          </p>

          {/* Nutrition preview */}
          {recipe.nutrition && (
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full font-medium">
                {Math.round(recipe.nutrition.calories / recipe.servings)} cal
              </span>
              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full">
                {Math.round(recipe.nutrition.protein / recipe.servings)}g protein
              </span>
            </div>
          )}
        </div>

        {/* Action buttons - always visible on mobile, hover on desktop */}
        <div className="flex sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 gap-2 mt-3 sm:absolute sm:bottom-0 sm:left-0 sm:right-0 sm:p-3 sm:bg-gradient-to-t sm:from-white/95 sm:dark:from-gray-800/95 sm:mt-0">
          <button
            onClick={(e) => { e.stopPropagation(); onView(recipe); }}
            className="flex-1 py-2 px-3 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>View</span>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(recipe); }}
            className="p-2 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
            aria-label="Edit recipe"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-red-500 hover:text-white text-gray-500 dark:text-gray-400 rounded-lg transition-colors"
            aria-label="Delete recipe"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </article>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
              Delete Recipe?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Are you sure you want to delete "{recipe.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default RecipeCard;
