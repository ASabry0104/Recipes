import { useState, useCallback, useEffect } from 'react';
import { useRecipeStore } from './store/recipeStore';
import { Recipe } from './types';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import SearchBar from './components/SearchBar';
import RecipeCard from './components/RecipeCard';
import RecipeModal from './components/RecipeModal';
import RecipeForm from './components/RecipeForm';
import EmptyState from './components/EmptyState';

function App() {
  const { theme, recipes, getFilteredRecipes, getRecentRecipes } = useRecipeStore();
  const [viewRecipe, setViewRecipe] = useState<Recipe | null>(null);
  const [editRecipe, setEditRecipe] = useState<Recipe | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredRecipes = getFilteredRecipes();
  const recentRecipes = getRecentRecipes();

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Modal handlers
  const handleViewRecipe = useCallback((recipe: Recipe) => {
    setViewRecipe(recipe);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewRecipe(null);
  }, []);

  const handleEditRecipe = useCallback((recipe: Recipe) => {
    setViewRecipe(null);
    setEditRecipe(recipe);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setEditRecipe(null);
  }, []);

  const handleAddNew = useCallback(() => {
    setEditRecipe(null);
    setShowForm(true);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero section with random recipe suggestion */}
        <HeroSection onViewRecipe={handleViewRecipe} />

        {/* Recently cooked section */}
        {recentRecipes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recently Cooked
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {recentRecipes.map((recipe) => (
                <button
                  key={recipe.id}
                  onClick={() => handleViewRecipe(recipe)}
                  className="shrink-0 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow min-w-[200px]"
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-100 to-amber-100 dark:from-orange-900/30 dark:to-amber-900/30 flex items-center justify-center text-2xl shrink-0">
                    {recipe.category === 'Breakfast' && '🥞'}
                    {recipe.category === 'Lunch' && '🥗'}
                    {recipe.category === 'Dinner' && '🍝'}
                    {recipe.category === 'Dessert' && '🍪'}
                    {recipe.category === 'Snacks' && '🥨'}
                    {recipe.category === 'Drinks' && '🍋'}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {recipe.name}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Search and filters */}
        <SearchBar />

        {/* Recipe count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredRecipes.length === 0
              ? 'No recipes found'
              : `Showing ${filteredRecipes.length} recipe${filteredRecipes.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {/* Recipe grid or empty state */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRecipes.map((recipe, index) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onView={handleViewRecipe}
                onEdit={handleEditRecipe}
                index={index}
              />
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <EmptyState
            icon="📖"
            title="Your cookbook is empty"
            description="Start building your personal recipe collection! Add your favorite dishes, family recipes, and culinary experiments."
            action={{
              label: 'Add Your First Recipe',
              onClick: handleAddNew,
            }}
          />
        ) : (
          <EmptyState
            icon="🔍"
            title="No recipes found"
            description="Try adjusting your search or filters to find what you're looking for."
          />
        )}
      </main>

      {/* Floating add button */}
      <button
        onClick={handleAddNew}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center z-30"
        aria-label="Add new recipe"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Modals */}
      {viewRecipe && (
        <RecipeModal
          recipe={viewRecipe}
          onClose={handleCloseView}
          onEdit={handleEditRecipe}
        />
      )}

      {showForm && (
        <RecipeForm
          recipe={editRecipe}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}

export default App;
