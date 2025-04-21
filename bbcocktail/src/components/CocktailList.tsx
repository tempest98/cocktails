import React from 'react'
import { useValues } from 'kea'
import { cocktailsLogic } from '../logic/cocktailsLogic'
import { ingredientsLogic } from '../logic/ingredientsLogic'
import { CocktailCard } from './CocktailCard'

export function CocktailList() {
  const { filteredCocktails, cocktailsLoading, searchMode, cocktailNameSearch } = useValues(cocktailsLogic)
  const { selectedIngredients } = useValues(ingredientsLogic)

  if (cocktailsLoading) {
    return (
      <div className="text-center py-10">
        <svg
          className="animate-spin h-8 w-8 mx-auto text-blue-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-2 text-gray-600">Loading cocktails...</p>
      </div>
    )
  }
  
  // For ingredient modes, require ingredients to be selected
  if (searchMode !== 'name' && selectedIngredients.size === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Add ingredients to find cocktails</p>
      </div>
    )
  }
  
  // For name search mode, require a search term
  if (searchMode === 'name' && !cocktailNameSearch.trim()) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">Enter a cocktail name to search</p>
      </div>
    )
  }

  if (filteredCocktails.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-600">No matching cocktails found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredCocktails.map((cocktail) => (
        <div key={cocktail._id} className="h-full">
          <CocktailCard cocktail={cocktail} />
        </div>
      ))}
    </div>
  )
}
