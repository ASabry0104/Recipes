import { useState, useEffect, useCallback, memo } from 'react';
import { Recipe, Category, CATEGORIES, IngredientWithNutrition, RecipeNutrition } from '../types';
import { useRecipeStore } from '../store/recipeStore';

// Helper to calculate nutrition from ingredients
const calculateNutrition = (ingredients: IngredientWithNutrition[]): RecipeNutrition | undefined => {
  const hasNutrition = ingredients.some(ing => ing.nutrition);
  if (!hasNutrition) return undefined;

  const totals = ingredients.reduce(
    (acc, ing) => {
      if (ing.nutrition) {
        acc.calories += ing.nutrition.calories || 0;
        acc.protein += ing.nutrition.protein || 0;
        acc.carbs += ing.nutrition.carbs || 0;
        acc.fat += ing.nutrition.fat || 0;
        acc.fiber += ing.nutrition.fiber || 0;
        acc.sugar += ing.nutrition.sugar || 0;
        acc.sodium += ing.nutrition.sodium || 0;
        acc.cholesterol += ing.nutrition.cholesterol || 0;
      }
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0, cholesterol: 0 }
  );

  // Only include optional fields if they have values
  const nutrition: RecipeNutrition = {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
  };

  if (totals.fiber > 0) nutrition.fiber = Math.round(totals.fiber);
  if (totals.sugar > 0) nutrition.sugar = Math.round(totals.sugar);
  if (totals.sodium > 0) nutrition.sodium = Math.round(totals.sodium);
  if (totals.cholesterol > 0) nutrition.cholesterol = Math.round(totals.cholesterol);

  return nutrition;
};

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

  // Parse ingredients - handle both old format (string[]) and new format (IngredientWithNutrition[])
  const parseIngredients = (ing: (string | IngredientWithNutrition)[]): IngredientWithNutrition[] => {
    return ing.map(item => {
      if (typeof item === 'string') {
        return { name: item };
      }
      return item;
    });
  };

  const [ingredients, setIngredients] = useState<IngredientWithNutrition[]>(() =>
    parseIngredients(recipe?.ingredients || [])
  );

  const [steps, setSteps] = useState(recipe?.steps.join('\n') || '');
  const [tips, setTips] = useState(recipe?.tips || '');
  const [image, setImage] = useState(recipe?.image || '');

  // Nutrition state
  const [enableCustomNutrition, setEnableCustomNutrition] = useState(!!recipe?.nutrition);
  const [nutrition, setNutrition] = useState<RecipeNutrition | undefined>(recipe?.nutrition);
  const [autoCalculate, setAutoCalculate] = useState(!recipe?.nutrition);

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

  // Calculate nutrition from ingredients
  useEffect(() => {
    if (autoCalculate) {
      const calculated = calculateNutrition(ingredients);
      setNutrition(calculated);
    }
  }, [ingredients, autoCalculate]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Recipe name is required';
    }

    if (ingredients.length === 0 || ingredients.every(i => !i.name.trim())) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    if (!steps.trim()) {
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
  }, [name, ingredients, steps, cookTime, servings]);

  // Handle image upload
  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select an image file' }));
        return;
      }
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

  const handleRemoveImage = useCallback(() => {
    setImage('');
  }, []);

  // Handle submit
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      const parsedIngredients = ingredients.map(ing => ({ name: ing.name.trim(), nutrition: ing.nutrition }));

      const recipeData = {
        name: name.trim(),
        category,
        cookTime,
        cookTimeUnit,
        servings,
        ingredients: parsedIngredients,
        steps: steps.split('\n').map(s => s.trim()).filter(s => s.length > 0),
        tips: tips.trim() || undefined,
        image: image || undefined,
        nutrition: nutrition,
      };

      if (isEditing && recipe) {
        updateRecipe(recipe.id, recipeData);
      } else {
        addRecipe(recipeData as Omit<Recipe, 'id' | 'createdAt' | 'isFavorite' | 'lastCooked'>);
      }

      onClose();
    },
    [validateForm, name, category, cookTime, cookTimeUnit, servings, ingredients, steps, tips, image, nutrition, isEditing, recipe, updateRecipe, addRecipe, onClose]
  );

  // Update single ingredient
  const updateIngredient = (index: number, field: 'name' | 'calories' | 'protein' | 'carbs' | 'fat', value: string | number) => {
    setIngredients(prev => {
      const updated = [...prev];
      if (field === 'name') {
        updated[index] = { ...updated[index], name: value as string };
      } else {
        const currentNutrition = updated[index].nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        updated[index] = {
          ...updated[index],
          nutrition: { ...currentNutrition, [field]: value }
        };
      }
      return updated;
    });
  };

  // Add new ingredient row
  const addIngredient = () => {
    setIngredients(prev => [...prev, { name: '' }]);
  };

  // Remove ingredient row
  const removeIngredient = (index: number) => {
    setIngredients(prev => prev.filter((_, i) => i !== index));
  };

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

            {/* Ingredients with nutrition */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ingredients *
                </label>
                <button
                  type="button"
                  onClick={addIngredient}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Ingredient
                </button>
              </div>

              {/* Nutrition toggle */}
              <div className="mb-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={enableCustomNutrition}
                    onChange={(e) => {
                      setEnableCustomNutrition(e.target.checked);
                      setAutoCalculate(e.target.checked);
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-amber-800 dark:text-amber-200 font-medium">
                    Add nutrition information
                  </span>
                </label>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      placeholder={`Ingredient ${index + 1}`}
                      className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    {enableCustomNutrition && (
                      <>
                        <input
                          type="number"
                          value={ing.nutrition?.calories || ''}
                          onChange={(e) => updateIngredient(index, 'calories', parseFloat(e.target.value) || 0)}
                          placeholder="Cal"
                          className="w-16 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="number"
                          value={ing.nutrition?.protein || ''}
                          onChange={(e) => updateIngredient(index, 'protein', parseFloat(e.target.value) || 0)}
                          placeholder="P"
                          className="w-14 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="number"
                          value={ing.nutrition?.carbs || ''}
                          onChange={(e) => updateIngredient(index, 'carbs', parseFloat(e.target.value) || 0)}
                          placeholder="C"
                          className="w-14 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                          type="number"
                          value={ing.nutrition?.fat || ''}
                          onChange={(e) => updateIngredient(index, 'fat', parseFloat(e.target.value) || 0)}
                          placeholder="F"
                          className="w-14 px-2 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {ingredients.length === 0 && (
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-orange-400 hover:text-orange-500 transition-colors"
                  >
                    + Add your first ingredient
                  </button>
                )}
              </div>
              {enableCustomNutrition && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  💡 Enter calories, protein (g), carbs (g), and fat (g) for each ingredient. Values will be auto-calculated.
                </p>
              )}
              {errors.ingredients && <p className="mt-1 text-sm text-red-500">{errors.ingredients}</p>}
            </div>

            {/* Steps */}
            <div>
              <label htmlFor="steps" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructions *
              </label>
              <textarea
                id="steps"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
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
