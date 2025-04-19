export interface CocktailIngredient {
  _id: string
  amount: number
  amount_max: number | null
  category: string
  description: string
  name: string
  note: string | null
  optional: boolean
  origin: string
  sort: number
  strength: number
  substitutes: string[]
  units: string
}

export interface IngredientSearchItem {
  name: string
  id: string
}

export interface CocktailImage {
  copyright: string
  placeholder_hash: string
  sort: number
  uri: string
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

export interface Cocktail {
  _id: string
  abv: number
  created_at: string
  description: string
  garnish: string
  glass: string
  images: CocktailImage[]
  ingredients: CocktailIngredient[]
  instructions?: string
  method?: string
  name?: string
  tags?: string[]
}
