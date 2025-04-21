import { actions, afterMount, kea, listeners, path, reducers, selectors } from 'kea'
import { loaders } from 'kea-loaders'
import { Cocktail, CocktailIngredient } from '../types/cocktailTypes'
import { Ingredient } from '../types/ingredientTypes'
import { fetchData } from '../utils/apiUtils'
import { ingredientsLogic, findIngredientById } from './ingredientsLogic'

import type { cocktailsLogicType } from './cocktailsLogicType'

// Helper functions for cocktail filtering and processing
const isIngredientInSelected = (
  cocktailIngredient: CocktailIngredient,
  selectedIngredients: string[],
  allIngredients: Ingredient[]
): boolean => {
  // Get the full ingredient details based on the cocktail ingredient ID
  const fullIngredient = findIngredientById(allIngredients, cocktailIngredient._id)

  if (!fullIngredient) {
    // Fallback to just name matching if ingredient not found
    const lowerName = cocktailIngredient.name.toLowerCase()
    return selectedIngredients.some((selected) => selected === lowerName)
  }

  // Match by ingredient name
  if (selectedIngredients.some((selected) => selected === fullIngredient.name.toLowerCase())) {
    return true
  }

  // Match by ingredient category (handling hierarchical categories)
  if (fullIngredient.category) {
    // Split the category hierarchy
    const categoryParts = fullIngredient.category.toLowerCase().split(' > ')

    // Check if any selected ingredient matches any part of the category hierarchy
    if (selectedIngredients.some((selected) => categoryParts.some((part) => part === selected))) {
      return true
    }
  }

  return false
}

const getMissingIngredients = (
  cocktail: Cocktail,
  selectedIngredients: string[],
  allIngredients: Ingredient[]
): string[] => {
  return cocktail.ingredients
    .filter((ingredient) => !isIngredientInSelected(ingredient, selectedIngredients, allIngredients))
    .map((ing) => ing.name)
}

const filterCocktailsByMissingMode = (
  cocktails: Cocktail[],
  selectedIngredients: string[],
  allIngredients: Ingredient[]
): Cocktail[] => {
  // Find cocktails that use ALL the selected ingredients (and may need more)
  const filtered = cocktails.filter((cocktail) => {
    return selectedIngredients.every((selected) => {
      // Check if any of the cocktail's ingredients match the selected ingredient by name or category
      return cocktail.ingredients.some((ingredient) => {
        const fullIngredient = findIngredientById(allIngredients, ingredient._id)

        if (!fullIngredient) {
          // Fallback to just name matching if ingredient not found
          return ingredient.name.toLowerCase() === selected
        }

        // Match by name
        if (fullIngredient.name.toLowerCase() === selected) {
          return true
        }

        // Match by category, handling hierarchical categories
        if (fullIngredient.category) {
          // Split the category hierarchy
          const categoryParts = fullIngredient.category.toLowerCase().split(' > ')

          // Check if the selected ingredient matches any part of the category hierarchy
          return categoryParts.some((part) => part === selected)
        }

        return false
      })
    })
  })

  // Sort by number of missing ingredients
  return filtered.sort((a, b) => {
    const aMissing = getMissingIngredients(a, selectedIngredients, allIngredients).length
    const bMissing = getMissingIngredients(b, selectedIngredients, allIngredients).length
    return aMissing - bMissing
  })
}

const filterCocktailsByCompleteMode = (
  cocktails: Cocktail[],
  selectedIngredients: string[],
  allIngredients: Ingredient[]
): Cocktail[] => {
  // Find cocktails where all required ingredients are available
  return cocktails.filter((cocktail) => {
    return cocktail.ingredients.every((ingredient) =>
      isIngredientInSelected(ingredient, selectedIngredients, allIngredients)
    )
  })
}

export const cocktailsLogic = kea<cocktailsLogicType>([
  path(['src', 'logic', 'cocktailsLogic']),

  actions({
    fetchCocktails: true,
    setSearchMode: (mode: 'missing' | 'complete' | 'name') => ({ mode }),
    setCocktailNameSearch: (name: string) => ({ name }),
  }),

  loaders(() => ({
    cocktails: {
      loadCocktails: async (): Promise<Cocktail[]> => {
        return await fetchData<Cocktail>('/cocktails2.json', 'Failed to fetch cocktail data')
      },
    },
  })),

  reducers({
    searchMode: [
      'missing' as 'missing' | 'complete' | 'name',
      {
        setSearchMode: (_, { mode }) => mode,
      },
    ],
    cocktailNameSearch: [
      '',
      {
        setCocktailNameSearch: (_, { name }) => name,
      },
    ],
  }),

  selectors({
    filteredCocktails: [
      (s) => [
        s.cocktails,
        ingredientsLogic.selectors.selectedIngredients,
        s.searchMode,
        ingredientsLogic.selectors.ingredients,
        s.cocktailNameSearch,
      ],
      (cocktails, selectedIngredients, searchMode, ingredients, cocktailNameSearch): Cocktail[] => {
        // For name search mode, filter by cocktail name
        if (searchMode === 'name') {
          const searchTerm = cocktailNameSearch.toLowerCase().trim()
          if (!searchTerm) return []

          return cocktails.filter((cocktail: Cocktail) => cocktail.name?.toLowerCase().includes(searchTerm))
        }

        // For ingredient-based search modes
        if (selectedIngredients.size === 0 || !ingredients) {
          return []
        }

        const selectedIngredientsArray = Array.from(selectedIngredients)

        return searchMode === 'missing'
          ? filterCocktailsByMissingMode(cocktails, selectedIngredientsArray, ingredients)
          : filterCocktailsByCompleteMode(cocktails, selectedIngredientsArray, ingredients)
      },
    ],

    missingIngredients: [
      (s) => [s.cocktails, ingredientsLogic.selectors.selectedIngredients, ingredientsLogic.selectors.ingredients],
      (cocktails, selectedIngredients, ingredients): Record<string, string[]> => {
        const result: Record<string, string[]> = {}
        if (!ingredients) return result

        const selectedIngredientsArray = Array.from(selectedIngredients)

        cocktails.forEach((cocktail: Cocktail) => {
          const missing = getMissingIngredients(cocktail, selectedIngredientsArray, ingredients)

          if (missing.length > 0) {
            result[cocktail._id] = missing
          }
        })

        return result
      },
    ],
  }),

  listeners(({ actions }) => ({
    fetchCocktails: async ({}, breakpoint) => {
      actions.loadCocktails()
    },
  })),

  afterMount(({ actions }) => {
    actions.fetchCocktails()
  }),
])
