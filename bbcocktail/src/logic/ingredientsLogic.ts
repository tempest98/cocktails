import { actions, afterMount, kea, listeners, path, reducers, selectors } from 'kea'
import { loaders } from 'kea-loaders'
import { Ingredient, IngredientSearchItem } from '../types/ingredientTypes'
import { fetchData } from '../utils/apiUtils'

import type { ingredientsLogicType } from './ingredientsLogicType'

// Helper functions for selectors
const mapToIngredientSearchItem = (ingredient: Ingredient): IngredientSearchItem => ({
  name: ingredient.name,
  id: ingredient._id,
  category: ingredient.category,
})

export const findIngredientById = (ingredients: Ingredient[], id: string): Ingredient | undefined => {
  return ingredients.find((ingredient) => ingredient._id === id)
}

export const ingredientsLogic = kea<ingredientsLogicType>([
  path(['src', 'logic', 'ingredientsLogic']),

  actions({
    fetchIngredients: true,
    setSearchTerm: (term: string) => ({ term }),
    addSelectedIngredient: (ingredient: string) => ({ ingredient }),
    removeSelectedIngredient: (ingredient: string) => ({ ingredient }),
  }),

  loaders(({ values }) => ({
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
  }),

  selectors({
    sortedIngredientNames: [
      (s) => [s.ingredients],
      (ingredients: Ingredient[]): IngredientSearchItem[] => {
        if (!ingredients) return []

        return ingredients.map(mapToIngredientSearchItem).sort((a, b) => a.name.localeCompare(b.name))
      },
    ],
  }),

  listeners(({ actions }) => ({
    fetchIngredients: async ({}, breakpoint) => {
      actions.loadIngredients()
    },
  })),

  afterMount(({ actions }) => {
    actions.fetchIngredients()
  }),
])
