import { actions, afterMount, kea, listeners, path, reducers, selectors } from 'kea'
import { loaders } from 'kea-loaders'
import { Cocktail, CocktailIngredient, IngredientSearchItem } from '../types/cocktailTypes'

import type { cocktailsLogicType } from './cocktailsLogicType'

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
        try {
          const response = await fetch('/cocktails2.json')
          if (!response.ok) {
            throw new Error('Failed to fetch cocktail data')
          }
          const data = await response.json()
          return data
        } catch (error) {
          console.error('Error loading cocktail data:', error)
          return []
        }
      },
    },
    ingredients: {
      loadIngredients: async (): Promise<CocktailIngredient[]> => {
        try {
          const response = await fetch('/ingredients.json')
          if (!response.ok) {
            throw new Error('Failed to fetch ingredient data')
          }
          const data = await response.json()
          return data
        } catch (error) {
          console.error('Error loading ingredient data:', error)
          return []
        }
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
      (ingredients): IngredientSearchItem[] => {
        if (!ingredients) return []

        return ingredients
          .map((ingredient: CocktailIngredient) => ({
            name: ingredient.name,
            id: ingredient._id
          }))
          .sort((a: IngredientSearchItem, b: IngredientSearchItem) => a.name.localeCompare(b.name))
      },
    ],

    filteredCocktails: [
      (s) => [s.cocktails, s.selectedIngredients, s.searchMode],
      (cocktails, selectedIngredients, searchMode): Cocktail[] => {
        if (selectedIngredients.size === 0) {
          return []
        }

        let matchingCocktails: Cocktail[] = []
        const selectedIngredientsArray = Array.from(selectedIngredients)

        if (searchMode === 'missing') {
          // Mode 1: Find cocktails that use ALL the selected ingredients (and may need more)
          matchingCocktails = cocktails.filter((cocktail: Cocktail) => {
            const cocktailIngredients = cocktail.ingredients.map((ing) => ing.name.toLowerCase())

            return selectedIngredientsArray.every((selected) => {
              return cocktailIngredients.some(
                (cocktailIng: string) => cocktailIng.includes(selected) || selected.includes(cocktailIng)
              )
            })
          })

          // Sort by number of missing ingredients
          matchingCocktails.sort((a, b) => {
            const aMissing = a.ingredients.filter((ingredient) => {
              const ingredientName = ingredient.name.toLowerCase()
              return !selectedIngredientsArray.some(
                (selected) => ingredientName.includes(selected) || selected.includes(ingredientName)
              )
            }).length

            const bMissing = b.ingredients.filter((ingredient) => {
              const ingredientName = ingredient.name.toLowerCase()
              return !selectedIngredientsArray.some(
                (selected) => ingredientName.includes(selected) || selected.includes(ingredientName)
              )
            }).length

            return aMissing - bMissing
          })
        } else {
          // Mode 2: Find cocktails where all required ingredients are available
          matchingCocktails = cocktails.filter((cocktail: Cocktail) => {
            return cocktail.ingredients.every((ingredient) => {
              const ingredientName = ingredient.name.toLowerCase()
              return selectedIngredientsArray.some(
                (selected) => ingredientName.includes(selected) || selected.includes(ingredientName)
              )
            })
          })
        }

        return matchingCocktails
      },
    ],

    missingIngredients: [
      (s) => [s.cocktails, s.selectedIngredients],
      (cocktails, selectedIngredients): Record<string, string[]> => {
        const result: Record<string, string[]> = {}
        const selectedIngredientsArray = Array.from(selectedIngredients)

        cocktails.forEach((cocktail: Cocktail) => {
          const missing = cocktail.ingredients
            .filter((ingredient) => {
              const ingredientName = ingredient.name.toLowerCase()
              return !selectedIngredientsArray.some(
                (selected) => ingredientName.includes(selected) || selected.includes(ingredientName)
              )
            })
            .map((ing) => ing.name)

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
      // await breakpoint(300)
      actions.loadCocktails()
    },
    fetchIngredients: async ({}, breakpoint) => {
      // await breakpoint(300)
      actions.loadIngredients()
    },
  })),

  afterMount(({ actions }) => {
    actions.fetchCocktails()
    actions.fetchIngredients()
  }),
])
