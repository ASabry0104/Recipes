import { useCallback, memo, useRef } from 'react';
import { useRecipeStore } from '../store/recipeStore';
import { Recipe } from '../types';

const Header = memo(function Header() {
  const { theme, toggleTheme, exportRecipes, importRecipes, recipes } = useRecipeStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export recipes to JSON
  const handleExport = useCallback(() => {
    const data = exportRecipes();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recipe-keeper-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [exportRecipes]);

  // Import recipes from JSON
  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (!Array.isArray(data)) {
          alert('Invalid file format. Expected an array of recipes.');
          return;
        }

        // Validate recipe structure
        const validRecipes = data.filter((r: unknown) => {
          const recipe = r as Recipe;
          return (
            typeof recipe === 'object' &&
            recipe !== null &&
            typeof recipe.id === 'string' &&
            typeof recipe.name === 'string' &&
            Array.isArray(recipe.ingredients) &&
            Array.isArray(recipe.steps)
          );
        });

        if (validRecipes.length === 0) {
          alert('No valid recipes found in the file.');
          return;
        }

        const action = window.confirm(
          `Found ${validRecipes.length} recipe${validRecipes.length > 1 ? 's' : ''}. Click OK to merge with existing recipes, or Cancel to replace all recipes.`
        );

        importRecipes(validRecipes, action ? false : true);
        alert(`Successfully imported ${validRecipes.length} recipe${validRecipes.length > 1 ? 's' : ''}!`);
      } catch {
        alert('Failed to parse the file. Please make sure it\'s a valid JSON file.');
      }
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = '';
  }, [importRecipes]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-2xl shadow-lg">
              🍳
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-serif">
                Recipe Keeper
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Your personal cookbook
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Recipe count badge */}
            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm rounded-full">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
            </span>

            {/* Import button */}
            <button
              onClick={handleImportClick}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Import recipes"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Export button */}
            <button
              onClick={handleExport}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title="Export recipes"
              disabled={recipes.length === 0}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
