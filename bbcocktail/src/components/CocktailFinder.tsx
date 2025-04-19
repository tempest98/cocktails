import React from 'react'
import { SearchModeToggle } from './SearchModeToggle'
import { IngredientSearch } from './IngredientSearch'
import { SelectedIngredients } from './SelectedIngredients'
import { CocktailList } from './CocktailList'

export function CocktailFinder() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Cocktail Recipe Finder</h1>

      {/* Search mode toggle */}
      <SearchModeToggle />

      {/* Ingredient search */}
      <div className="mb-6">
        <IngredientSearch />
        <SelectedIngredients />
      </div>

      {/* Results */}
      <CocktailList />
    </div>
  )
}
