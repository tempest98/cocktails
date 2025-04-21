import { actions, afterMount, kea, listeners, path, reducers, selectors } from 'kea'
import { loaders } from 'kea-loaders'
import { Cocktail, CocktailIngredient } from '../types/cocktailTypes'
import { IngredientSearchItem, Ingredient } from '../types/ingredientTypes'

import type { cocktailsLogicType } from './cocktailsLogicType'

// Helper functions for selectors
const mapToIngredientSearchItem = (ingredient: Ingredient): IngredientSearchItem => ({
  name: ingredient.name,
  id: ingredient._id,
  category: ingredient.category,
})

const findIngredientById = (ingredients: Ingredient[], id: string): Ingredient | undefined => {
  return ingredients.find((ingredient) => ingredient._id === id)
}

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

// Generic fetch function to eliminate code duplication
const fetchData = async <T>(url: string, errorMessage: string): Promise<T[]> => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(errorMessage)
    }
    const data = await response.json()
    return data
  } catch (error) {
    console.error(`Error loading data from ${url}:`, error)
    return []
  }
}

export const cocktailsLogic = kea<cocktailsLogicType>([
  path(['src', 'logic', 'cocktailsLogic']),

  actions({
    fetchCocktails: true,
    fetchIngredients: true,
    setSearchTerm: (term: string) => ({ term }),
    addSelectedIngredient: (ingredient: string) => ({ ingredient }),
    removeSelectedIngredient: (ingredient: string) => ({ ingredient }),
    setSearchMode: (mode: 'missing' | 'complete') => ({ mode }),
  }),

  loaders(({ values }) => ({
    cocktails: {
      loadCocktails: async (): Promise<Cocktail[]> => {
        return fetchData<Cocktail>('/cocktails2.json', 'Failed to fetch cocktail data')
      },
    },
    ingredients: {
      loadIngredients: async (): Promise<Ingredient[]> => {
        return fetchData<Ingredient>('/ingredients.json', 'Failed to fetch ingredient data')
      },
    },
  })),

  reducers({
    selectedIngredients: [
      new Set<string>(),
      {
        addSelectedIngredient: (state, { ingredient }) => {
          const newSet = new Set(state)
          newSet.add(ingredient.toLowerCase())
          return newSet
        },
        removeSelectedIngredient: (state, { ingredient }) => {
          const newSet = new Set(state)
          newSet.delete(ingredient.toLowerCase())
          return newSet
        },
      },
    ],
    searchTerm: [
      '',
      {
        setSearchTerm: (_, { term }) => term,
      },
    ],
    searchMode: [
      'missing' as 'missing' | 'complete',
      {
        setSearchMode: (_, { mode }) => mode,
      },
    ],
  }),

  selectors({
    sortedIngredientNames: [
      (s) => [s.ingredients],
      (ingredients: Ingredient[]): IngredientSearchItem[] => {
        if (!ingredients) return []

        return ingredients.map(mapToIngredientSearchItem).sort((a, b) => a.name.localeCompare(b.name))
      },
    ],

    filteredCocktails: [
      (s) => [s.cocktails, s.selectedIngredients, s.searchMode, s.ingredients],
      (cocktails, selectedIngredients, searchMode, ingredients): Cocktail[] => {
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
      (s) => [s.cocktails, s.selectedIngredients, s.ingredients],
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
    fetchIngredients: async ({}, breakpoint) => {
      actions.loadIngredients()
    },
  })),

  afterMount(({ actions }) => {
    actions.fetchCocktails()
    actions.fetchIngredients()
  }),
])
