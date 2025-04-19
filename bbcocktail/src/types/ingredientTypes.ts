import { CocktailImage } from './cocktailTypes'

export interface IngredientSearchItem {
  name: string
  id: string
  category: string | null
}

export interface Ingredient {
  _id: string
  _parent_id: string | null
  acidity: number | null
  calculator_id: string | null
  category: string
  color: string
  created_at: string
  description: string
  distillery: string | null
  images: CocktailImage[]
  ingredient_parts: any[] // This could be further typed if needed
  name: string
  origin: string
  prices: any[] // This could be further typed if needed
  strength: number
  sugar_g_per_ml: number | null
  updated_at: string | null
}
