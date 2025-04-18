import React from 'react'
import { useValues } from 'kea'
import { Cocktail, CocktailIngredient } from '../types/cocktailTypes'
import { cocktailsLogic } from '../logic/cocktailsLogic'
import { formatAmount } from '../utils/formatAmount'

interface CocktailCardProps {
  cocktail: Cocktail
}

export function CocktailCard({ cocktail }: CocktailCardProps) {
  const { selectedIngredients, searchMode, missingIngredients } = useValues(cocktailsLogic)
  const selectedIngredientsArray = Array.from(selectedIngredients)
  
  // Determine ingredient availability
  const isIngredientAvailable = (ingredient: CocktailIngredient): boolean => {
    const ingredientName = ingredient.name.toLowerCase()
    return selectedIngredientsArray.some((selected) => 
      ingredientName.includes(selected) || selected.includes(ingredientName)
    )
  }
  
  // Get image URL
  const getImageUrl = (): string => {
    if (cocktail.images && cocktail.images.length > 0) {
      // This is a placeholder - in a real app, you'd need to set up image serving
      return '/placeholder-cocktail.jpg'
    }
    return '/placeholder-cocktail.jpg'
  }
  
  // Missing ingredients for this cocktail
  const cocktailMissingIngredients = missingIngredients[cocktail._id] || []
  
  return (
    <div className="h-full rounded-lg border border-gray-200 shadow-md overflow-hidden bg-white">
      <div className="relative">
        <img 
          src={getImageUrl()} 
          alt={cocktail.name || 'Cocktail'} 
          className="w-full h-48 object-cover"
        />
        {cocktail.abv && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
            {cocktail.abv}% ABV
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h5 className="text-xl font-semibold mb-2">{cocktail.name}</h5>
        
        <div className="flex flex-wrap mb-2">
          {cocktail.method && (
            <span className="mr-2 text-gray-600 text-sm">{cocktail.method}</span>
          )}
          
          {cocktail.tags && cocktail.tags.map((tag) => (
            <span 
              key={tag} 
              className="inline-block px-2 py-0.5 mx-0.5 mb-1 bg-gray-600 text-white rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Status badge */}
        <div className="mb-2">
          {searchMode === 'missing' && cocktailMissingIngredients.length > 0 ? (
            <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
              {cocktailMissingIngredients.length} missing ingredient{cocktailMissingIngredients.length > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              All ingredients available!
            </span>
          )}
        </div>
        
        {/* Ingredients list */}
        <div className="mb-3">
          {cocktail.ingredients.map((ingredient, index) => {
            const available = isIngredientAvailable(ingredient)
            return (
              <span 
                key={`${ingredient.name}-${index}`}
                className={`inline-block px-3 py-1 m-1 rounded-full text-sm ${
                  available 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
                title="Ingredient"
              >
                {ingredient.name}: {formatAmount(ingredient)}
              </span>
            )
          })}
        </div>
        
        {/* Instructions */}
        {cocktail.instructions && (
          <p className="text-gray-700 mb-2">{cocktail.instructions}</p>
        )}
        
        {/* Glass and garnish info */}
        <p className="text-gray-500 text-sm">Serve in: {cocktail.glass}</p>
        {cocktail.garnish && (
          <p className="text-gray-500 text-sm">Garnish: {cocktail.garnish}</p>
        )}
      </div>
    </div>
  )
}