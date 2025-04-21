import React from 'react'
import { useValues } from 'kea'
import { cocktailsLogic } from '../logic/cocktailsLogic'
import { SearchModeToggle } from './SearchModeToggle'
import { IngredientSearch } from './IngredientSearch'
import { SelectedIngredients } from './SelectedIngredients'
import { CocktailNameSearch } from './CocktailNameSearch'
import { CocktailList } from './CocktailList'

export function CocktailFinder() {
  const { searchMode } = useValues(cocktailsLogic)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Cocktail Recipe Finder</h1>

      {/* Search mode toggle */}
      <SearchModeToggle />

      {/* Cocktail name search (only when in name mode) */}
      <CocktailNameSearch />

      {/* Ingredient search (only when not in name mode) */}
      {searchMode !== 'name' && (
        <div className="mb-6">
          <IngredientSearch />
          <SelectedIngredients />
        </div>
      )}

      {/* Results */}
      <CocktailList />
    </div>
  )
}
