import { useState, useEffect, useCallback, memo } from 'react';
import { Recipe, Category, CATEGORIES } from '../types';
import { useRecipeStore } from '../store/recipeStore';

interface RecipeFormProps {
  recipe?: Recipe | null;
  onClose: () => void;
}

const RecipeForm = memo(function RecipeForm({ recipe, onClose }: RecipeFormProps) {
  const { addRecipe, updateRecipe } = useRecipeStore();
  const isEditing = !!recipe;

  // Form state
  const [name, setName] = useState(recipe?.name || '');
  const [category, setCategory] = useState<Category>(recipe?.category || 'Dinner');
  const [cookTime, setCookTime] = useState(recipe?.cookTime || 30);
  const [cookTimeUnit, setCookTimeUnit] = useState<'minutes' | 'hours'>(recipe?.cookTimeUnit || 'minutes');
  const [servings, setServings] = useState(recipe?.servings || 4);
  const [ingredientsText, setIngredientsText] = useState(recipe?.ingredients.join('\n') || '');
  const [stepsText, setStepsText] = useState(recipe?.steps.join('\n') || '');
  const [tips, setTips] = useState(recipe?.tips || '');
  const [image, setImage] = useState(recipe?.image || '');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Handle escape key
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

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Recipe name is required';
    }

    if (!ingredientsText.trim()) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    if (!stepsText.trim()) {
      newErrors.steps = 'At least one step is required';
    }

    if (cookTime <= 0) {
      newErrors.cookTime = 'Cook time must be greater than 0';
    }

    if (servings <= 0) {
      newErrors.servings = 'Servings must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, ingredientsText, stepsText, cookTime, servings]);

  // Handle image upload
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select an image file' }));
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image must be smaller than 5MB' }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setErrors((prev) => {
          const { image: _, ...rest } = prev;
          return rest;
        });
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Remove image
  const handleRemoveImage = useCallback(() => {
    setImage('');
  }, []);

  // Handle submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      // Parse ingredients and steps
      const ingredients = ingredientsText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const steps = stepsText
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      const recipeData = {
        name: name.trim(),
        category,
        cookTime,
        cookTimeUnit,
        servings,
        ingredients,
        steps,
        tips: tips.trim() || undefined,
        image: image || undefined,
      };

      if (isEditing && recipe) {
        updateRecipe(recipe.id, recipeData);
      } else {
        addRecipe(recipeData);
      }

      onClose();
    },
    [validateForm, ingredientsText, stepsText, name, category, cookTime, cookTimeUnit, servings, tips, image, isEditing, recipe, updateRecipe, addRecipe, onClose]
  );

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl my-8 shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit Recipe' : 'Add New Recipe'}
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-8rem)] overflow-y-auto">
          <div className="space-y-6">
            {/* Recipe name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recipe Name *
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Grandma's Famous Lasagna"
                className={`
                  w-full px-4 py-3 rounded-xl
                  bg-gray-50 dark:bg-gray-700
                  border border-gray-200 dark:border-gray-600
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent
                  transition-all
                  ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}
                `}
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            {/* Category and image row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Category)}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Photo (optional)
                </label>
                {image ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img src={image} alt="Recipe preview" className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-orange-400 dark:hover:border-orange-500 transition-colors group">
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto text-gray-400 group-hover:text-orange-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="mt-2 text-sm text-gray-500 dark:text-gray-400">Click to upload</span>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
                {errors.image && <p className="mt-1 text-sm text-red-500">{errors.image}</p>}
              </div>
            </div>

            {/* Cook time and servings row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-1">
                <label htmlFor="cookTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cook Time *
                </label>
                <input
                  type="number"
                  id="cookTime"
                  value={cookTime}
                  onChange={(e) => setCookTime(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className={`
                    w-full px-4 py-3 rounded-xl
                    bg-gray-50 dark:bg-gray-700
                    border border-gray-200 dark:border-gray-600
                    text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-orange-500
                    transition-all
                    ${errors.cookTime ? 'border-red-500' : ''}
                  `}
                />
                {errors.cookTime && <p className="mt-1 text-sm text-red-500">{errors.cookTime}</p>}
              </div>

              <div className="col-span-1">
                <label htmlFor="cookTimeUnit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit
                </label>
                <select
                  id="cookTimeUnit"
                  value={cookTimeUnit}
                  onChange={(e) => setCookTimeUnit(e.target.value as 'minutes' | 'hours')}
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all cursor-pointer"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                </select>
              </div>

              <div className="col-span-2">
                <label htmlFor="servings" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  id="servings"
                  value={servings}
                  onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  className={`
                    w-full px-4 py-3 rounded-xl
                    bg-gray-50 dark:bg-gray-700
                    border border-gray-200 dark:border-gray-600
                    text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2 focus:ring-orange-500
                    transition-all
                    ${errors.servings ? 'border-red-500' : ''}
                  `}
                />
                {errors.servings && <p className="mt-1 text-sm text-red-500">{errors.servings}</p>}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ingredients *
              </label>
              <textarea
                id="ingredients"
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                placeholder="Enter one ingredient per line:&#10;2 cups all-purpose flour&#10;1 tsp baking powder&#10;½ cup sugar"
                rows={5}
                className={`
                  w-full px-4 py-3 rounded-xl
                  bg-gray-50 dark:bg-gray-700
                  border border-gray-200 dark:border-gray-600
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-orange-500
                  resize-none transition-all
                  ${errors.ingredients ? 'border-red-500' : ''}
                `}
              />
              {errors.ingredients && <p className="mt-1 text-sm text-red-500">{errors.ingredients}</p>}
            </div>

            {/* Steps */}
            <div>
              <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructions *
              </label>
              <textarea
                id="steps"
                value={stepsText}
                onChange={(e) => setStepsText(e.target.value)}
                placeholder="Enter each step on a new line:&#10;Preheat oven to 350°F&#10;Mix dry ingredients together&#10;Add wet ingredients and stir"
                rows={6}
                className={`
                  w-full px-4 py-3 rounded-xl
                  bg-gray-50 dark:bg-gray-700
                  border border-gray-200 dark:border-gray-600
                  text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-orange-500
                  resize-none transition-all
                  ${errors.steps ? 'border-red-500' : ''}
                `}
              />
              {errors.steps && <p className="mt-1 text-sm text-red-500">{errors.steps}</p>}
            </div>

            {/* Tips */}
            <div>
              <label htmlFor="tips" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chef's Tips (optional)
              </label>
              <textarea
                id="tips"
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                placeholder="Add any helpful tips or variations..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none transition-all"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEditing ? 'Save Changes' : 'Add Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default RecipeForm;
