import { CocktailIngredient } from '../types/cocktailTypes'

export function formatAmount(ingredient: CocktailIngredient): string {
  const { amount, units } = ingredient

  // Handle special case for "twist of" unit
  if (units === 'twist of') {
    return `${amount} ${units}`
  }

  // Normal case with units like ml, oz, etc.
  return `${amount} ${units}`
}
