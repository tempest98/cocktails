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
